#!/usr/bin/env bun

/**
 * PrioritizeTargets - Intelligent recon report generator
 *
 * Analyzes httpx JSON output and creates a prioritized target report
 * based on technologies, keywords, status codes, and attack surface indicators.
 *
 * Usage:
 *   bun PrioritizeTargets.ts --input <httpx-json> --output <report.md>
 *
 * Example:
 *   bun PrioritizeTargets.ts --input target.com-probe.json --output target.com-report.md
 */

import { readFileSync, writeFileSync } from "fs";

interface HttpxResult {
  url: string;
  status_code?: number;
  title?: string;
  tech?: string[];
  webserver?: string;
  host?: string;
  scheme?: string;
  port?: number;
}

interface ScoredTarget {
  url: string;
  score: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
  status?: number;
  title?: string;
  technologies?: string[];
  attackSurface: string[];
}

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Scoring keywords and patterns
const CRITICAL_KEYWORDS = {
  url: ["admin", "cpanel", "dashboard", "auth", "sso", "saml", "oauth", "iam", "jenkins", "grafana", "kibana", "prometheus", "console", "portal", "management"],
  title: ["admin", "dashboard", "login", "authentication", "console", "management"],
};

const HIGH_KEYWORDS = {
  url: ["dev", "stg", "staging", "test", "sandbox", "uat", "perf", "api", "graphql", "rest", "swagger", "openapi", "upload", "files", "storage", "media", "phpmyadmin", "adminer"],
  title: ["developer", "staging", "test", "api", "swagger", "graphql"],
};

const MEDIUM_KEYWORDS = {
  url: ["promo", "campaign", "events", "partner", "vendor", "supplier", "mobile", "ios", "android", "app", "old", "legacy", "archive"],
  title: ["promo", "campaign", "partner", "mobile"],
};

const HIGH_VALUE_TECH = {
  "express": 10,
  "node.js": 10,
  "nodejs": 10,
  "wordpress": 15,
  "graphql": 10,
  "swagger": 10,
  "openapi": 10,
  "django": 5,
  "laravel": 5,
  "flask": 8,
};

const LOW_VALUE_TECH = {
  "cloudflare": -10,
  "cloudflare bot management": -15,
  "gatsby": -15,
  "next.js": -5,
  "hugo": -15,
  "jekyll": -15,
};

const INTERESTING_STATUS_CODES = {
  401: { priority: 15, reason: "Authentication required" },
  403: { priority: 12, reason: "Forbidden - may have auth bypass" },
  500: { priority: 10, reason: "Internal server error - misconfiguration" },
  502: { priority: 8, reason: "Bad gateway - possible backend exposure" },
  503: { priority: 8, reason: "Service unavailable - misconfiguration" },
  405: { priority: 5, reason: "Method not allowed - test other methods" },
};

function scoreTarget(result: HttpxResult): ScoredTarget {
  let score = 50; // Base score
  const reasons: string[] = [];
  const attackSurface: string[] = [];
  const url = result.url.toLowerCase();
  const title = (result.title || "").toLowerCase();
  const tech = (result.tech || []).map(t => t.toLowerCase());

  // Check CRITICAL keywords in URL
  for (const keyword of CRITICAL_KEYWORDS.url) {
    if (url.includes(keyword)) {
      score += 40;
      reasons.push(`CRITICAL keyword in URL: "${keyword}"`);
      attackSurface.push(`${keyword.charAt(0).toUpperCase() + keyword.slice(1)} endpoint`);
      break; // Only count once
    }
  }

  // Check CRITICAL keywords in title
  for (const keyword of CRITICAL_KEYWORDS.title) {
    if (title.includes(keyword)) {
      score += 35;
      reasons.push(`CRITICAL keyword in title: "${keyword}"`);
      break;
    }
  }

  // Check HIGH keywords in URL
  for (const keyword of HIGH_KEYWORDS.url) {
    if (url.includes(keyword)) {
      score += 20;
      reasons.push(`HIGH keyword in URL: "${keyword}"`);

      if (keyword.startsWith("dev") || keyword.includes("staging") || keyword.includes("test")) {
        attackSurface.push("Development environment - likely less hardened");
      } else if (keyword.includes("api") || keyword.includes("graphql")) {
        attackSurface.push("API testing, parameter fuzzing, IDOR");
      } else if (keyword.includes("upload") || keyword.includes("files")) {
        attackSurface.push("File upload testing, path traversal");
      }
      break;
    }
  }

  // Check HIGH keywords in title
  for (const keyword of HIGH_KEYWORDS.title) {
    if (title.includes(keyword)) {
      score += 15;
      reasons.push(`HIGH keyword in title: "${keyword}"`);
      break;
    }
  }

  // Check MEDIUM keywords
  for (const keyword of MEDIUM_KEYWORDS.url) {
    if (url.includes(keyword)) {
      score += 10;
      reasons.push(`MEDIUM keyword in URL: "${keyword}"`);
      break;
    }
  }

  // Check status codes
  if (result.status_code && INTERESTING_STATUS_CODES[result.status_code as keyof typeof INTERESTING_STATUS_CODES]) {
    const statusInfo = INTERESTING_STATUS_CODES[result.status_code as keyof typeof INTERESTING_STATUS_CODES];
    score += statusInfo.priority;
    reasons.push(`Status ${result.status_code}: ${statusInfo.reason}`);
    attackSurface.push(statusInfo.reason);
  }

  // Check technologies
  for (const t of tech) {
    if (HIGH_VALUE_TECH[t as keyof typeof HIGH_VALUE_TECH]) {
      const points = HIGH_VALUE_TECH[t as keyof typeof HIGH_VALUE_TECH];
      score += points;
      reasons.push(`High-value tech: ${t} (+${points})`);

      if (t.includes("wordpress")) {
        attackSurface.push("WordPress plugin/theme vulns, wp-admin access");
      } else if (t.includes("graphql")) {
        attackSurface.push("GraphQL introspection, mutation testing");
      } else if (t.includes("swagger") || t.includes("openapi")) {
        attackSurface.push("API documentation exposed, endpoint enumeration");
      }
    }

    if (LOW_VALUE_TECH[t as keyof typeof LOW_VALUE_TECH]) {
      const points = LOW_VALUE_TECH[t as keyof typeof LOW_VALUE_TECH];
      score += points;
      reasons.push(`Low-value tech: ${t} (${points})`);
    }
  }

  // Default attack surfaces if none found
  if (attackSurface.length === 0) {
    if (result.status_code === 200) {
      attackSurface.push("Standard web application testing");
    } else if (result.status_code === 404) {
      attackSurface.push("Low priority - Not Found");
    }
  }

  // Determine priority tier
  let priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  if (score >= 90) priority = "CRITICAL";
  else if (score >= 70) priority = "HIGH";
  else if (score >= 50) priority = "MEDIUM";
  else priority = "LOW";

  return {
    url: result.url,
    score,
    priority,
    reasons,
    status: result.status_code,
    title: result.title,
    technologies: result.tech,
    attackSurface,
  };
}

function generateReport(targets: ScoredTarget[], domain: string): string {
  const critical = targets.filter(t => t.priority === "CRITICAL");
  const high = targets.filter(t => t.priority === "HIGH");
  const medium = targets.filter(t => t.priority === "MEDIUM");
  const low = targets.filter(t => t.priority === "LOW");

  let report = `# Recon Report: ${domain}\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Executive Summary\n\n`;
  report += `- **Total Live Hosts:** ${targets.length}\n`;
  report += `- **CRITICAL Priority:** ${critical.length}\n`;
  report += `- **HIGH Priority:** ${high.length}\n`;
  report += `- **MEDIUM Priority:** ${medium.length}\n`;
  report += `- **LOW Priority:** ${low.length}\n\n`;

  function renderTargets(targets: ScoredTarget[], title: string) {
    if (targets.length === 0) return "";

    let section = `## ${title} (${targets.length})\n\n`;

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      section += `### ${i + 1}. ${t.url}\n\n`;
      section += `**Priority:** ${t.priority} (Score: ${t.score})\n\n`;

      if (t.status) {
        section += `**Status:** ${t.status}\n\n`;
      }

      if (t.title) {
        section += `**Title:** ${t.title}\n\n`;
      }

      if (t.technologies && t.technologies.length > 0) {
        section += `**Technologies:** ${t.technologies.join(", ")}\n\n`;
      }

      if (t.reasons.length > 0) {
        section += `**Detection Reasons:**\n`;
        for (const reason of t.reasons) {
          section += `- ${reason}\n`;
        }
        section += `\n`;
      }

      if (t.attackSurface.length > 0) {
        section += `**Attack Surface:**\n`;
        for (const surface of t.attackSurface) {
          section += `- ${surface}\n`;
        }
        section += `\n`;
      }

      section += `---\n\n`;
    }

    return section;
  }

  report += renderTargets(critical, "🔴 CRITICAL Priority Targets");
  report += renderTargets(high, "🟠 HIGH Priority Targets");
  report += renderTargets(medium, "🟡 MEDIUM Priority Targets");
  report += renderTargets(low, "⚪ LOW Priority Targets");

  return report;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 4 || !args.includes("--input") || !args.includes("--output")) {
    console.log(`
${colors.bright}PrioritizeTargets - Intelligent Recon Report Generator${colors.reset}

${colors.cyan}Usage:${colors.reset}
  bun PrioritizeTargets.ts --input <httpx-json> --output <report.md>

${colors.cyan}Example:${colors.reset}
  bun PrioritizeTargets.ts --input target.com-probe.json --output target.com-report.md

${colors.cyan}Input Format:${colors.reset}
  Expects httpx JSON output (use httpx -json flag)
`);
    process.exit(1);
  }

  const inputIdx = args.indexOf("--input");
  const outputIdx = args.indexOf("--output");
  const inputFile = args[inputIdx + 1];
  const outputFile = args[outputIdx + 1];

  log(`\n[*] Reading httpx results from: ${inputFile}`, colors.cyan);

  const content = readFileSync(inputFile, "utf-8");
  const lines = content.trim().split("\n").filter(l => l.trim());
  const results: HttpxResult[] = lines.map(line => JSON.parse(line));

  log(`[*] Analyzing ${results.length} hosts...`, colors.cyan);

  const scored = results.map(r => scoreTarget(r));
  scored.sort((a, b) => b.score - a.score);

  const critical = scored.filter(t => t.priority === "CRITICAL").length;
  const high = scored.filter(t => t.priority === "HIGH").length;
  const medium = scored.filter(t => t.priority === "MEDIUM").length;
  const low = scored.filter(t => t.priority === "LOW").length;

  log(`[+] Prioritization complete:`, colors.green);
  log(`    CRITICAL: ${critical}`, colors.red);
  log(`    HIGH: ${high}`, colors.yellow);
  log(`    MEDIUM: ${medium}`, colors.blue);
  log(`    LOW: ${low}`, colors.reset);

  // Extract domain from first URL
  const domain = results[0]?.host || "unknown";
  const report = generateReport(scored, domain);

  log(`\n[*] Writing report to: ${outputFile}`, colors.cyan);
  writeFileSync(outputFile, report);

  log(`[+] Report generated successfully!\n`, colors.green);
}

main();
