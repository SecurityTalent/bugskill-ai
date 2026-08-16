#!/usr/bin/env bun

/**
 * QuickRecon - Fast lightweight subdomain reconnaissance
 *
 * Usage:
 *   bun QuickRecon.ts <domain> [options]
 *
 * Options:
 *   --probe          Run HTTP probing after subdomain discovery
 *   --output DIR     Output directory (default: current directory)
 *   --no-cleanup     Keep individual tool output files
 *
 * Examples:
 *   bun QuickRecon.ts example.com
 *   bun QuickRecon.ts target.com --probe --output ./recon
 */

import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

interface ReconOptions {
  domain: string;
  probe: boolean;
  output: string;
  cleanup: boolean;
}

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: string) {
  log(`\n[*] ${step}`, colors.cyan);
}

function logSuccess(message: string) {
  log(`[+] ${message}`, colors.green);
}

function logError(message: string) {
  log(`[!] ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`[i] ${message}`, colors.blue);
}

async function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed: ${command} ${args.join(" ")}\n${stderr}`));
      }
    });
  });
}

async function checkTool(tool: string): Promise<boolean> {
  try {
    await runCommand("which", [tool]);
    return true;
  } catch {
    return false;
  }
}

async function findSubdomains(options: ReconOptions): Promise<number> {
  logStep("Starting subdomain discovery");

  const { domain, output } = options;
  const subfinderOut = join(output, `${domain}-subfinder.txt`);
  const assetfinderOut = join(output, `${domain}-assetfinder.txt`);
  const mergedOut = join(output, `${domain}-subs.txt`);

  // Check tools
  const hasSubfinder = await checkTool("subfinder");
  const hasAssetfinder = await checkTool("assetfinder");

  if (!hasSubfinder && !hasAssetfinder) {
    logError("Neither subfinder nor assetfinder found");
    logInfo("Install with:");
    logInfo("  go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest");
    logInfo("  go install -v github.com/tomnomnom/assetfinder@latest");
    throw new Error("Required tools not found");
  }

  // Run passive collection
  const promises: Promise<void>[] = [];

  if (hasSubfinder) {
    logInfo(`Running subfinder on ${domain}...`);
    promises.push(
      runCommand("subfinder", ["-d", domain, "-all", "-silent", "-o", subfinderOut])
        .then(() => logSuccess("subfinder complete"))
        .catch((err) => logError(`subfinder failed: ${err.message}`))
    );
  }

  if (hasAssetfinder) {
    logInfo(`Running assetfinder on ${domain}...`);
    promises.push(
      runCommand("sh", ["-c", `assetfinder --subs-only ${domain} > ${assetfinderOut}`])
        .then(() => logSuccess("assetfinder complete"))
        .catch((err) => logError(`assetfinder failed: ${err.message}`))
    );
  }

  await Promise.all(promises);

  // Merge and deduplicate
  logStep("Merging results");

  const catFiles: string[] = [];
  if (hasSubfinder && existsSync(subfinderOut)) catFiles.push(subfinderOut);
  if (hasAssetfinder && existsSync(assetfinderOut)) catFiles.push(assetfinderOut);

  if (catFiles.length === 0) {
    logError("No results from any tool");
    return 0;
  }

  await runCommand("sh", [
    "-c",
    `cat ${catFiles.join(" ")} | sort -u > ${mergedOut}`,
  ]);

  // Count results
  const count = (await runCommand("wc", ["-l", mergedOut])).trim().split(" ")[0];
  const subdomainCount = parseInt(count, 10);

  logSuccess(`Found ${subdomainCount} unique subdomains`);
  logInfo(`Results saved to: ${mergedOut}`);

  // Cleanup
  if (options.cleanup && catFiles.length > 0) {
    logStep("Cleaning up intermediate files");
    for (const file of catFiles) {
      await runCommand("rm", ["-f", file]);
    }
  }

  return subdomainCount;
}

async function probeSubdomains(options: ReconOptions): Promise<number> {
  logStep("Starting HTTP probing");

  const { domain, output } = options;
  const subsFile = join(output, `${domain}-subs.txt`);
  const liveFile = join(output, `${domain}-live.txt`);
  const detailedFile = join(output, `${domain}-live-detailed.txt`);

  // Check if input file exists
  if (!existsSync(subsFile)) {
    logError(`Subdomain file not found: ${subsFile}`);
    logInfo("Run subdomain discovery first (without --probe flag)");
    throw new Error("Input file not found");
  }

  // Check tool
  const hasHttpx = await checkTool("httpx");
  if (!hasHttpx) {
    logError("httpx not found");
    logInfo("Install with:");
    logInfo("  go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest");
    throw new Error("httpx not found");
  }

  // Run detailed probing
  logInfo("Probing subdomains (this may take a few minutes)...");
  await runCommand("httpx", [
    "-l", subsFile,
    "-silent",
    "-status-code",
    "-title",
    "-tech-detect",
    "-follow-redirects",
    "-o", detailedFile,
  ]);

  // Extract just live URLs
  await runCommand("httpx", [
    "-l", subsFile,
    "-silent",
    "-o", liveFile,
  ]);

  // Count results
  const count = (await runCommand("wc", ["-l", liveFile])).trim().split(" ")[0];
  const liveCount = parseInt(count, 10);

  logSuccess(`Found ${liveCount} live web servers`);
  logInfo(`Live hosts: ${liveFile}`);
  logInfo(`Detailed output: ${detailedFile}`);

  return liveCount;
}

function parseArgs(): ReconOptions | null {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
${colors.bright}QuickRecon - Fast lightweight subdomain reconnaissance${colors.reset}

${colors.cyan}Usage:${colors.reset}
  bun QuickRecon.ts <domain> [options]

${colors.cyan}Options:${colors.reset}
  --probe          Run HTTP probing after subdomain discovery
  --output DIR     Output directory (default: current directory)
  --no-cleanup     Keep individual tool output files

${colors.cyan}Examples:${colors.reset}
  bun QuickRecon.ts example.com
  bun QuickRecon.ts target.com --probe --output ./recon
  bun QuickRecon.ts corp.com --probe --no-cleanup

${colors.cyan}Output Files:${colors.reset}
  {domain}-subs.txt           All discovered subdomains
  {domain}-live.txt           Live HTTP/HTTPS hosts (if --probe used)
  {domain}-live-detailed.txt  Detailed probe results (if --probe used)
`);
    return null;
  }

  const domain = args[0];
  let probe = false;
  let output = process.cwd();
  let cleanup = true;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--probe") {
      probe = true;
    } else if (args[i] === "--output" && i + 1 < args.length) {
      output = args[i + 1];
      i++;
    } else if (args[i] === "--no-cleanup") {
      cleanup = false;
    }
  }

  // Validate domain
  if (!domain || domain.startsWith("--")) {
    logError("Invalid domain");
    return null;
  }

  // Clean domain
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

  return {
    domain: cleanDomain,
    probe,
    output,
    cleanup,
  };
}

async function main() {
  const options = parseArgs();
  if (!options) {
    process.exit(1);
  }

  // Ensure output directory exists
  if (!existsSync(options.output)) {
    logInfo(`Creating output directory: ${options.output}`);
    mkdirSync(options.output, { recursive: true });
  }

  log(
    `\n${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  log(`${colors.bright}  QuickRecon - ${options.domain}${colors.reset}`);
  log(
    `${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
  );

  const startTime = Date.now();

  try {
    // Step 1: Find subdomains
    const subdomainCount = await findSubdomains(options);

    if (subdomainCount === 0) {
      logError("No subdomains found");
      process.exit(1);
    }

    // Step 2: Probe (if requested)
    let liveCount = 0;
    if (options.probe) {
      liveCount = await probeSubdomains(options);
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(
      `\n${colors.bright}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
    );
    log(`${colors.bright}  Summary${colors.reset}`);
    log(
      `${colors.bright}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
    );
    logSuccess(`Target: ${options.domain}`);
    logSuccess(`Subdomains discovered: ${subdomainCount}`);
    if (options.probe) {
      logSuccess(`Live web servers: ${liveCount}`);
    }
    logSuccess(`Completed in ${duration}s`);
    logInfo(`Output directory: ${options.output}\n`);
  } catch (error) {
    logError(`\nFatal error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
