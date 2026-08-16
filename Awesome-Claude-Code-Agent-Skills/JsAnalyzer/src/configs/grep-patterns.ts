/**
 * Grep Pattern Configurations
 * Regular expressions used in Phase 1 analysis
 */

export interface GrepPattern {
	name: string;
	pattern: string;
	description: string;
	category: "paths" | "endpoints" | "sources" | "sinks" | "secrets";
	riskLevel: "critical" | "high" | "medium" | "low";
}

/**
 * Client-side path patterns
 */
export const CLIENT_PATH_PATTERNS: GrepPattern[] = [
	{
		name: "Route Definitions",
		pattern: "path=[\"']/[^\"']+[\"']",
		description: "Explicit route definitions in router config",
		category: "paths",
		riskLevel: "low",
	},
	{
		name: "Router Push/Replace",
		pattern: "router\\.(push|replace)",
		description: "Programmatic navigation calls",
		category: "paths",
		riskLevel: "low",
	},
	{
		name: "History API",
		pattern: "history\\.(push|replace)State",
		description: "HTML5 History API navigation",
		category: "paths",
		riskLevel: "low",
	},
	{
		name: "Hash Routes",
		pattern: "#/[a-zA-Z0-9/_-]+",
		description: "Hash-based routing patterns",
		category: "paths",
		riskLevel: "low",
	},
];

/**
 * API endpoint patterns
 */
export const API_ENDPOINT_PATTERNS: GrepPattern[] = [
	{
		name: "Fetch Calls",
		pattern: "fetch\\([\"'`][^\"'`]*",
		description: "Fetch API calls with endpoints",
		category: "endpoints",
		riskLevel: "medium",
	},
	{
		name: "Axios Calls",
		pattern: "axios\\.[a-z]+\\([\"'`][^\"'`]*",
		description: "Axios HTTP method calls",
		category: "endpoints",
		riskLevel: "medium",
	},
	{
		name: "API Path Strings",
		pattern: "['\"]/api/[a-zA-Z0-9/_-]+",
		description: "Explicit /api/ paths in code",
		category: "endpoints",
		riskLevel: "medium",
	},
	{
		name: "Versioned Paths",
		pattern: "['\"]/v[0-9]+/",
		description: "API versioning patterns",
		category: "endpoints",
		riskLevel: "medium",
	},
];

/**
 * User-controlled source patterns
 */
export const SOURCE_PATTERNS: GrepPattern[] = [
	{
		name: "Location Sources",
		pattern: "location\\.(hash|search|href|pathname)",
		description: "URL-based user input sources",
		category: "sources",
		riskLevel: "high",
	},
	{
		name: "PostMessage",
		pattern: "postMessage|addEventListener.*message",
		description: "Cross-origin messaging handlers",
		category: "sources",
		riskLevel: "high",
	},
	{
		name: "Storage Sources",
		pattern: "localStorage|sessionStorage",
		description: "Browser storage as input source",
		category: "sources",
		riskLevel: "medium",
	},
	{
		name: "Document Referrer",
		pattern: "document\\.referrer",
		description: "Referrer header as source",
		category: "sources",
		riskLevel: "medium",
	},
	{
		name: "Window Name",
		pattern: "window\\.name",
		description: "Window.name as storage/source",
		category: "sources",
		riskLevel: "high",
	},
];

/**
 * Dangerous sink patterns
 */
export const SINK_PATTERNS: GrepPattern[] = [
	{
		name: "jQuery .html()",
		pattern: "\\.html\\(",
		description: "jQuery .html() DOM manipulation",
		category: "sinks",
		riskLevel: "critical",
	},
	{
		name: "innerHTML Assignment",
		pattern: "\\.innerHTML\\s*=",
		description: "Direct innerHTML assignment",
		category: "sinks",
		riskLevel: "critical",
	},
	{
		name: "eval()",
		pattern: "eval\\(",
		description: "JavaScript eval execution",
		category: "sinks",
		riskLevel: "critical",
	},
	{
		name: "Function Constructor",
		pattern: "new Function\\(",
		description: "Dynamic function creation",
		category: "sinks",
		riskLevel: "critical",
	},
	{
		name: "document.write",
		pattern: "document\\.write",
		description: "Document.write sink",
		category: "sinks",
		riskLevel: "high",
	},
	{
		name: "location Assignment",
		pattern: "(location|window\\.location)\\s*=",
		description: "JavaScript navigation sink",
		category: "sinks",
		riskLevel: "high",
	},
	{
		name: "outerHTML Assignment",
		pattern: "\\.outerHTML\\s*=",
		description: "Outer HTML replacement",
		category: "sinks",
		riskLevel: "high",
	},
];

/**
 * Secret patterns
 */
export const SECRET_PATTERNS: GrepPattern[] = [
	{
		name: "API Key Pattern",
		pattern: "['\"]\\w+[_-]?api[_-]?key[\"']:\\s*[\"']\\w+[\"']",
		description: "Generic API key patterns",
		category: "secrets",
		riskLevel: "critical",
	},
	{
		name: "JWT Token",
		pattern: "eyJ[a-zA-Z0-9_-]+\\.eyJ",
		description: "JWT token format",
		category: "secrets",
		riskLevel: "critical",
	},
	{
		name: "AWS Access Key",
		pattern: "AKIA[A-Z0-9]{16}",
		description: "AWS access key identifier",
		category: "secrets",
		riskLevel: "critical",
	},
	{
		name: "Generic Secret Key",
		pattern: "['\"]secret[_-]?key[\"']:\\s*[\"'][^\"']{20,}[\"']",
		description: "Generic secret key assignments",
		category: "secrets",
		riskLevel: "high",
	},
	{
		name: "Authorization Header",
		pattern: "Authorization['\"]:\\s*['\"]Bearer\\s+[a-zA-Z0-9_-]+",
		description: "Hardcoded bearer tokens",
		category: "secrets",
		riskLevel: "high",
	},
];

/**
 * All patterns grouped by category
 */
export const ALL_PATTERNS = {
	paths: CLIENT_PATH_PATTERNS,
	endpoints: API_ENDPOINT_PATTERNS,
	sources: SOURCE_PATTERNS,
	sinks: SINK_PATTERNS,
	secrets: SECRET_PATTERNS,
} as const;

/**
 * Get patterns by category
 */
export function getPatternsByCategory(
	category: keyof typeof ALL_PATTERNS,
): GrepPattern[] {
	return ALL_PATTERNS[category];
}

/**
 * Get patterns by risk level
 */
export function getPatternsByRisk(
	riskLevel: "critical" | "high" | "medium" | "low",
): GrepPattern[] {
	return Object.values(ALL_PATTERNS)
		.flat()
		.filter((p) => p.riskLevel === riskLevel);
}

/**
 * Get all critical patterns (for priority scanning)
 */
export function getCriticalPatterns(): GrepPattern[] {
	return getPatternsByRisk("critical");
}
