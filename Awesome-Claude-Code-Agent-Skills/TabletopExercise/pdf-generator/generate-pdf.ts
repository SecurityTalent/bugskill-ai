#!/usr/bin/env bun

/**
 * Professional PDF Generator for Tabletop Exercises
 *
 * Generates high-quality, well-designed PDF documents from tabletop exercise data
 * using Playwright for HTML-to-PDF rendering with excellent typography and layout.
 */

import { chromium } from 'playwright';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TabletopExerciseData {
    // Cover page
    title: string;
    subtitle: string;
    scenarioType: string;
    targetAudience: string;
    duration: string;
    difficulty: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    preparedBy: string;
    date: string;
    version: string;

    // Executive Summary
    executiveSummary: string;
    attackVector: string;
    potentialImpact: string;
    testingGoals: string;
    criticalGaps: string;

    // Scenario Overview
    scenarioOverview: string;
    timelineEvents: TimelineEvent[];

    // Objectives
    objectives: Objective[];

    // Injects
    injects: Inject[];

    // Atomics (if technical scenario)
    atomics?: Atomic[];

    // Gap Analysis
    gapStats: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    gaps: Gap[];
}

interface TimelineEvent {
    time: string;
    title: string;
    description: string;
    impact?: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

interface Objective {
    number: number;
    title: string;
    description: string;
    successCriteria: string[];
}

interface Inject {
    id: string;
    time: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    scenario: string;
    artifact?: string;
    expectedResponse: string;
    discussionQuestions?: string[];
    conditionalResponses?: ConditionalResponse[];
}

interface ConditionalResponse {
    trigger: string;
    response: string;
}

interface Atomic {
    id: string;
    time: string;
    title: string;
    action: string;
    commands?: string;
    commandLanguage?: string;
    expectedResponse: string;
    fallback?: string;
    verification?: string[];
}

interface Gap {
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    status: string;
    trigger: string;
    requiredProcedures: string[];
    impact: string;
    recommendation: string;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Build complete HTML document from data
 */
function buildHtml(data: TabletopExerciseData): string {
    const severityClass = data.severity.toLowerCase();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.title)} - Cybersecurity Tabletop Exercise</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --primary: #1e40af;
            --primary-dark: #1e3a8a;
            --secondary: #64748b;
            --accent: #0ea5e9;
            --danger: #dc2626;
            --warning: #f59e0b;
            --success: #10b981;
            --dark: #0f172a;
            --gray-50: #f8fafc;
            --gray-100: #f1f5f9;
            --gray-200: #e2e8f0;
            --gray-300: #cbd5e1;
            --gray-700: #334155;
            --gray-900: #0f172a;
        }

        body {
            font-family: 'Inter', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: var(--gray-900);
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        @page {
            size: Letter;
            margin: 0.75in 0.75in 1in 0.75in;
        }

        /* Cover Page */
        .cover-page {
            page-break-after: always;
            height: 9.25in;
            background-color: #1e40af !important;
            background-image: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%) !important;
            padding: 50pt 60pt 50pt 60pt;
            color: white !important;
            position: relative;
            display: flex;
            flex-direction: column;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        .cover-content-wrapper {
            display: flex;
            flex-direction: column;
            flex: 1;
        }

        .cover-header {
            margin-bottom: 40pt;
        }

        .company-logo svg {
            width: 50pt;
            height: 50pt;
        }

        .document-type {
            font-size: 10pt;
            font-weight: 600;
            letter-spacing: 2.5px;
            opacity: 0.9;
            margin-bottom: 25pt;
        }

        .cover-title {
            font-size: 32pt;
            font-weight: 700;
            line-height: 1.15;
            margin-bottom: 15pt;
            max-width: 90%;
        }

        .cover-subtitle {
            font-size: 13pt;
            opacity: 0.95;
            line-height: 1.5;
            margin-bottom: 35pt;
            max-width: 85%;
        }

        .cover-metadata {
            margin-bottom: 30pt;
        }

        .metadata-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20pt;
        }

        .metadata-item {
            display: flex;
            flex-direction: column;
            gap: 8pt;
        }

        .metadata-label {
            font-size: 9pt;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        .metadata-value {
            font-size: 13pt;
            font-weight: 600;
        }

        .cover-content {
            flex: 1;
        }

        .severity-badge {
            display: inline-flex;
            align-items: center;
            gap: 10pt;
            background: rgba(255, 255, 255, 0.2);
            padding: 12pt 20pt;
            border-radius: 8pt;
            font-weight: 700;
            font-size: 12pt;
            margin-top: 20pt;
            backdrop-filter: blur(10px);
        }

        .severity-badge.critical {
            background: #dc2626;
            box-shadow: 0 4pt 12pt rgba(220, 38, 38, 0.3);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .cover-footer {
            margin-top: auto;
            padding-top: 30pt;
            border-top: 2px solid rgba(255, 255, 255, 0.25);
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 9pt;
        }

        .prepared-by {
            line-height: 1.6;
        }

        .confidential-notice {
            display: flex;
            align-items: center;
            gap: 8pt;
            opacity: 0.9;
        }

        /* Content Sections */
        .content-section {
            page-break-before: always;
            padding: 30pt 0;
        }

        .content-section:first-of-type {
            page-break-before: auto;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 15pt;
            margin-bottom: 30pt;
            padding-bottom: 15pt;
            border-bottom: 3px solid var(--primary);
            page-break-after: avoid;
        }

        .section-number {
            font-size: 36pt;
            font-weight: 700;
            color: var(--primary);
            opacity: 0.3;
        }

        .section-title {
            font-size: 24pt;
            font-weight: 700;
            color: var(--gray-900);
        }

        .subsection-title {
            font-size: 16pt;
            font-weight: 600;
            color: var(--gray-900);
            margin: 25pt 0 15pt 0;
            page-break-after: avoid;
        }

        /* Cards */
        .summary-card, .info-box, .warning-box {
            background: var(--gray-50);
            border-left: 4px solid var(--primary);
            padding: 20pt;
            margin-bottom: 20pt;
            border-radius: 4pt;
            page-break-inside: avoid;
        }

        .warning-box {
            background: #fef3c7;
            border-left-color: var(--warning);
        }

        .points-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20pt;
            margin-top: 20pt;
            page-break-inside: avoid;
        }

        .point-card {
            background: var(--gray-50);
            padding: 20pt;
            border-radius: 8pt;
            border: 1px solid var(--gray-200);
            page-break-inside: avoid;
        }

        .point-card h4 {
            font-size: 12pt;
            font-weight: 600;
            margin-bottom: 10pt;
            color: var(--gray-900);
        }

        .point-card p {
            font-size: 10pt;
            line-height: 1.5;
            color: var(--gray-700);
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding-left: 40pt;
            margin-top: 20pt;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 10pt;
            top: 0;
            bottom: 0;
            width: 2pt;
            background: var(--gray-300);
        }

        .timeline-event {
            position: relative;
            margin-bottom: 25pt;
            padding: 15pt;
            background: var(--gray-50);
            border-radius: 8pt;
            border-left: 4px solid var(--gray-300);
            page-break-inside: avoid;
        }

        .timeline-event.critical {
            border-left-color: var(--danger);
            background: #fee;
        }

        .timeline-event.high {
            border-left-color: var(--warning);
            background: #fef3c7;
        }

        .timeline-event::before {
            content: '';
            position: absolute;
            left: -38pt;
            top: 20pt;
            width: 12pt;
            height: 12pt;
            border-radius: 50%;
            background: var(--primary);
            border: 3px solid white;
        }

        .timeline-time {
            font-size: 11pt;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 5pt;
        }

        .timeline-title {
            font-size: 12pt;
            font-weight: 600;
            margin-bottom: 8pt;
        }

        .timeline-description {
            font-size: 10pt;
            color: var(--gray-700);
            margin-bottom: 8pt;
        }

        .timeline-impact {
            font-size: 10pt;
            color: var(--danger);
            font-weight: 500;
            margin-top: 10pt;
        }

        /* Objectives */
        .objectives-list {
            page-break-inside: avoid;
        }

        .objective-card {
            display: flex;
            gap: 20pt;
            margin-bottom: 20pt;
            padding: 20pt;
            background: var(--gray-50);
            border-radius: 8pt;
            border: 1px solid var(--gray-200);
            page-break-inside: avoid;
        }

        .objective-number {
            flex-shrink: 0;
            width: 40pt;
            height: 40pt;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            font-size: 18pt;
            font-weight: 700;
        }

        .objective-title {
            font-size: 13pt;
            font-weight: 600;
            margin-bottom: 10pt;
        }

        .objective-description {
            font-size: 10pt;
            color: var(--gray-700);
            margin-bottom: 15pt;
        }

        .objective-success ul {
            margin-left: 20pt;
            margin-top: 8pt;
        }

        .objective-success li {
            font-size: 10pt;
            margin-bottom: 5pt;
        }

        /* Inject Cards */
        .inject-card {
            margin-bottom: 30pt;
            border: 2px solid var(--gray-200);
            border-radius: 8pt;
            overflow: hidden;
            /* Allow breaks for large cards - headers will stay with content */
        }

        .inject-card.critical {
            border-color: var(--danger);
        }

        .inject-card.high {
            border-color: var(--warning);
        }

        .inject-header {
            background: var(--gray-100);
            padding: 15pt;
            display: flex;
            align-items: center;
            gap: 15pt;
            page-break-after: avoid;
        }

        .inject-card.critical .inject-header {
            background: #fee;
        }

        .inject-card.high .inject-header {
            background: #fef3c7;
        }

        .inject-time-badge {
            background: var(--primary);
            color: white;
            padding: 5pt 12pt;
            border-radius: 4pt;
            font-weight: 600;
            font-size: 10pt;
        }

        .inject-title {
            flex: 1;
            font-size: 13pt;
            font-weight: 600;
        }

        .inject-id {
            font-size: 9pt;
            color: var(--gray-700);
            font-family: 'JetBrains Mono', monospace;
        }

        .inject-body {
            padding: 20pt;
        }

        .inject-scenario, .inject-expected, .inject-questions, .inject-conditional {
            margin-bottom: 15pt;
        }

        .inject-body h5 {
            font-size: 11pt;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 8pt;
            page-break-after: avoid;
        }

        .inject-artifact {
            margin: 15pt 0;
        }

        .artifact-box {
            background: var(--gray-900);
            color: #e2e8f0;
            padding: 15pt;
            border-radius: 6pt;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9pt;
            overflow-x: auto;
        }

        .artifact-box pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .conditional-item {
            background: #dbeafe;
            padding: 12pt;
            border-radius: 6pt;
            margin-top: 10pt;
        }

        .conditional-item strong {
            color: var(--primary);
            display: block;
            margin-bottom: 5pt;
        }

        /* Atomic Cards */
        .atomic-card {
            margin-bottom: 30pt;
            border: 2px solid var(--primary);
            border-radius: 8pt;
            overflow: hidden;
            /* Allow breaks for large cards - headers will stay with content */
        }

        .atomic-header {
            background: var(--primary);
            color: white;
            padding: 15pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
            page-break-after: avoid;
        }

        .atomic-time {
            font-size: 18pt;
            font-weight: 700;
        }

        .atomic-id-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9pt;
            opacity: 0.9;
        }

        .atomic-title {
            background: var(--gray-100);
            padding: 12pt 15pt;
            font-size: 13pt;
            font-weight: 600;
        }

        .atomic-body {
            padding: 20pt;
        }

        .atomic-action, .atomic-commands, .atomic-expected, .atomic-fallback, .atomic-verification {
            margin-bottom: 15pt;
        }

        .atomic-body h5 {
            font-size: 11pt;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 8pt;
            page-break-after: avoid;
        }

        .code-block {
            background: var(--gray-900);
            color: #e2e8f0;
            border-radius: 6pt;
            overflow: hidden;
        }

        .code-header {
            background: #1e293b;
            padding: 8pt 12pt;
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
        }

        .code-block pre {
            padding: 15pt;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9pt;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .checklist {
            list-style: none;
        }

        .checklist li {
            padding: 8pt 0;
            border-bottom: 1px solid var(--gray-200);
        }

        .checklist li::before {
            content: '☐ ';
            margin-right: 8pt;
            font-size: 12pt;
        }

        /* Gap Analysis */
        .gap-stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15pt;
            margin-bottom: 30pt;
            page-break-inside: avoid;
        }

        .stat-card {
            padding: 20pt;
            border-radius: 8pt;
            text-align: center;
            page-break-inside: avoid;
        }

        .stat-card.critical {
            background: #fee;
            border: 2px solid var(--danger);
        }

        .stat-card.high {
            background: #fef3c7;
            border: 2px solid var(--warning);
        }

        .stat-card.medium {
            background: #dbeafe;
            border: 2px solid var(--accent);
        }

        .stat-card.low {
            background: var(--gray-100);
            border: 2px solid var(--gray-300);
        }

        .stat-value {
            font-size: 32pt;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 8pt;
        }

        .stat-label {
            font-size: 10pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .gap-card {
            margin-bottom: 25pt;
            border: 2px solid var(--gray-200);
            border-radius: 8pt;
            overflow: hidden;
            /* Allow breaks for large cards - headers will stay with content */
        }

        .gap-card.critical {
            border-color: var(--danger);
        }

        .gap-card.high {
            border-color: var(--warning);
        }

        .gap-header {
            background: var(--gray-100);
            padding: 15pt;
            display: flex;
            align-items: center;
            gap: 15pt;
            page-break-after: avoid;
        }

        .gap-card.critical .gap-header {
            background: #fee;
        }

        .gap-card.high .gap-header {
            background: #fef3c7;
        }

        .gap-priority-badge {
            background: var(--danger);
            color: white;
            padding: 5pt 12pt;
            border-radius: 4pt;
            font-weight: 700;
            font-size: 9pt;
            text-transform: uppercase;
        }

        .gap-card.high .gap-priority-badge {
            background: var(--warning);
        }

        .gap-card.medium .gap-priority-badge {
            background: var(--accent);
        }

        .gap-card.low .gap-priority-badge {
            background: var(--gray-700);
        }

        .gap-title {
            flex: 1;
            font-size: 13pt;
            font-weight: 600;
        }

        .gap-status {
            background: white;
            padding: 5pt 12pt;
            border-radius: 4pt;
            font-size: 9pt;
            font-weight: 600;
            border: 1px solid var(--gray-300);
        }

        .gap-body {
            padding: 20pt;
        }

        .gap-trigger, .gap-impact, .gap-recommendation {
            margin-bottom: 15pt;
        }

        .gap-required {
            margin-bottom: 15pt;
        }

        .gap-required ul {
            margin-top: 10pt;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15pt 0;
            font-size: 9pt;
            page-break-inside: avoid;
        }

        table th {
            background: var(--gray-100);
            padding: 10pt;
            text-align: left;
            font-weight: 600;
            border: 1px solid var(--gray-300);
        }

        table td {
            padding: 10pt;
            border: 1px solid var(--gray-300);
        }

        /* Lists and Text Blocks */
        ul, ol {
            page-break-inside: avoid;
        }

        li {
            page-break-inside: avoid;
        }

        p {
            orphans: 3;
            widows: 3;
        }

        .code-block {
            page-break-inside: avoid;
        }

        .inject-body, .atomic-body, .gap-body {
            orphans: 2;
            widows: 2;
            page-break-before: avoid;
        }

        /* Evaluation Forms */
        .evaluation-table input[type="radio"],
        .evaluation-table input[type="text"] {
            width: 100%;
        }

        textarea {
            width: 100%;
            padding: 10pt;
            border: 1px solid var(--gray-300);
            border-radius: 4pt;
            font-family: inherit;
            font-size: 10pt;
        }

        /* Footer */
        .page-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 0.75in;
            font-size: 8pt;
            color: var(--gray-700);
            border-top: 1px solid var(--gray-300);
            background: white;
        }

        /* Print Optimizations */
        @media print {
            .cover-page {
                page-break-after: always;
            }

            .content-section {
                page-break-before: always;
            }

            .inject-card, .atomic-card, .gap-card {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <section class="cover-page">
        <div class="cover-header">
            <div class="company-logo">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="12" fill="white" fill-opacity="0.2"/>
                    <path d="M20 30L27 37L40 23" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>

        <div class="cover-content">
            <div class="document-type">CYBERSECURITY TABLETOP EXERCISE</div>
            <h1 class="cover-title">${escapeHtml(data.title)}</h1>
            <div class="cover-subtitle">${escapeHtml(data.subtitle)}</div>

            <div class="cover-metadata">
                <div class="metadata-grid">
                    <div class="metadata-item">
                        <span class="metadata-label">Scenario Type</span>
                        <span class="metadata-value">${escapeHtml(data.scenarioType)}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Target Audience</span>
                        <span class="metadata-value">${escapeHtml(data.targetAudience)}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Duration</span>
                        <span class="metadata-value">${escapeHtml(data.duration)}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Difficulty</span>
                        <span class="metadata-value">${escapeHtml(data.difficulty)}</span>
                    </div>
                </div>
            </div>

            <div class="severity-badge ${severityClass}">
                <span class="severity-icon">⚠️</span>
                <span class="severity-text">${escapeHtml(data.severity)} SEVERITY SCENARIO</span>
            </div>
        </div>

        <div class="cover-footer">
            <div class="prepared-by">
                Prepared by: ${escapeHtml(data.preparedBy)}<br>
                Date: ${escapeHtml(data.date)}<br>
                Version: ${escapeHtml(data.version)}<br>
                <div style="margin-top: 15pt; opacity: 0.8; font-size: 9pt;">
                    Tabletop Skill Developed by Arcanum Information Security
                </div>
            </div>
            <div class="confidential-notice">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a3 3 0 0 0-3 3v1H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1V4a3 3 0 0 0-3-3zm2 4V4a2 2 0 1 0-4 0v1h4z"/>
                </svg>
                CONFIDENTIAL - FOR INTERNAL USE ONLY
            </div>
        </div>
    </section>

    <!-- Executive Summary -->
    <section class="content-section" id="executive-summary">
        <div class="section-header">
            <span class="section-number">01</span>
            <h2 class="section-title">Executive Summary</h2>
        </div>

        <div class="summary-card">
            <div class="card-content">
                ${escapeHtml(data.executiveSummary)}
            </div>
        </div>

        <div class="key-points">
            <h3 class="subsection-title">Key Points</h3>
            <div class="points-grid">
                <div class="point-card">
                    <h4>Attack Vector</h4>
                    <p>${escapeHtml(data.attackVector)}</p>
                </div>
                <div class="point-card">
                    <h4>Potential Impact</h4>
                    <p>${escapeHtml(data.potentialImpact)}</p>
                </div>
                <div class="point-card">
                    <h4>Testing Goals</h4>
                    <p>${escapeHtml(data.testingGoals)}</p>
                </div>
                <div class="point-card">
                    <h4>Critical Gaps</h4>
                    <p>${escapeHtml(data.criticalGaps)}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Scenario Overview -->
    <section class="content-section" id="scenario-overview">
        <div class="section-header">
            <span class="section-number">02</span>
            <h2 class="section-title">Scenario Overview</h2>
        </div>

        <div class="scenario-details">
            ${escapeHtml(data.scenarioOverview)}
        </div>

        <!-- Attack Chain Timeline -->
        <div class="timeline-container">
            <h3 class="subsection-title">Attack Chain Timeline</h3>
            <div class="timeline">
                ${data.timelineEvents.map(event => `
                <div class="timeline-event ${event.severity}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <div class="timeline-time">${escapeHtml(event.time)}</div>
                        <div class="timeline-title">${escapeHtml(event.title)}</div>
                        <div class="timeline-description">${escapeHtml(event.description)}</div>
                        ${event.impact ? `<div class="timeline-impact"><strong>Impact:</strong> ${escapeHtml(event.impact)}</div>` : ''}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Exercise Objectives -->
    <section class="content-section" id="exercise-objectives">
        <div class="section-header">
            <span class="section-number">03</span>
            <h2 class="section-title">Exercise Objectives</h2>
        </div>

        <div class="objectives-list">
            ${data.objectives.map(obj => `
            <div class="objective-card">
                <div class="objective-number">${obj.number}</div>
                <div class="objective-content">
                    <h4 class="objective-title">${escapeHtml(obj.title)}</h4>
                    <p class="objective-description">${escapeHtml(obj.description)}</p>
                    <div class="objective-success">
                        <strong>Success Criteria:</strong>
                        <ul>
                            ${obj.successCriteria.map(criteria => `<li>${escapeHtml(criteria)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </section>

    <!-- Facilitator Guide -->
    <section class="content-section" id="facilitator-guide">
        <div class="section-header">
            <span class="section-number">04</span>
            <h2 class="section-title">Facilitator Guide</h2>
        </div>

        <div class="facilitator-intro">
            <div class="info-box">
                <strong>Facilitator Role:</strong> Guide discussion without providing answers.
                Use open-ended questions to draw out participant thinking. Maintain psychological
                safety and encourage honest dialogue.
            </div>
        </div>

        <!-- Inject Cards -->
        <div class="injects-container">
            ${data.injects.map(inject => `
            <div class="inject-card ${inject.severity}">
                <div class="inject-header">
                    <div class="inject-time-badge">${escapeHtml(inject.time)}</div>
                    <div class="inject-title">${escapeHtml(inject.title)}</div>
                    <div class="inject-id">${escapeHtml(inject.id)}</div>
                </div>

                <div class="inject-body">
                    <div class="inject-scenario">
                        <h5>Scenario Development</h5>
                        ${escapeHtml(inject.scenario)}
                    </div>

                    ${inject.artifact ? `
                    <div class="inject-artifact">
                        <h5>Artifact to Deliver</h5>
                        <div class="artifact-box">
                            <pre>${escapeHtml(inject.artifact)}</pre>
                        </div>
                    </div>
                    ` : ''}

                    <div class="inject-expected">
                        <h5>Expected Response</h5>
                        <p>${escapeHtml(inject.expectedResponse)}</p>
                    </div>

                    ${inject.discussionQuestions && inject.discussionQuestions.length > 0 ? `
                    <div class="inject-questions">
                        <h5>Discussion Questions</h5>
                        <ul>
                            ${inject.discussionQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${inject.conditionalResponses && inject.conditionalResponses.length > 0 ? `
                    <div class="inject-conditional">
                        <h5>Conditional Responses</h5>
                        ${inject.conditionalResponses.map(cr => `
                        <div class="conditional-item">
                            <strong>If participants ask: "${escapeHtml(cr.trigger)}"</strong>
                            <p>Response: ${escapeHtml(cr.response)}</p>
                        </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
            `).join('')}
        </div>
    </section>

    ${data.atomics && data.atomics.length > 0 ? `
    <!-- Technical Atomics -->
    <section class="content-section" id="atomics-runbook">
        <div class="section-header">
            <span class="section-number">05</span>
            <h2 class="section-title">Technical Atomics Runbook</h2>
        </div>

        <div class="atomics-intro">
            <div class="warning-box">
                <strong>For Exercise Runner Only:</strong> This section contains exact technical
                steps to simulate the attack scenario. Follow the timed sequence precisely for
                realistic exercise delivery.
            </div>
        </div>

        <div class="atomics-container">
            ${data.atomics.map(atomic => `
            <div class="atomic-card">
                <div class="atomic-header">
                    <div class="atomic-time">${escapeHtml(atomic.time)}</div>
                    <div class="atomic-id-badge">${escapeHtml(atomic.id)}</div>
                </div>

                <h4 class="atomic-title">${escapeHtml(atomic.title)}</h4>

                <div class="atomic-body">
                    <div class="atomic-action">
                        <h5>Action to Perform</h5>
                        <p>${escapeHtml(atomic.action)}</p>
                    </div>

                    ${atomic.commands ? `
                    <div class="atomic-commands">
                        <h5>Commands / Instructions</h5>
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-language">${escapeHtml(atomic.commandLanguage || 'bash')}</span>
                            </div>
                            <pre>${escapeHtml(atomic.commands)}</pre>
                        </div>
                    </div>
                    ` : ''}

                    <div class="atomic-expected">
                        <h5>Expected Participant Response</h5>
                        <p>${escapeHtml(atomic.expectedResponse)}</p>
                    </div>

                    ${atomic.fallback ? `
                    <div class="atomic-fallback">
                        <h5>If No Response After 10 Minutes</h5>
                        <p>${escapeHtml(atomic.fallback)}</p>
                    </div>
                    ` : ''}

                    ${atomic.verification && atomic.verification.length > 0 ? `
                    <div class="atomic-verification">
                        <h5>Verification Checklist</h5>
                        <ul class="checklist">
                            ${atomic.verification.map(v => `<li>${escapeHtml(v)}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            </div>
            `).join('')}
        </div>
    </section>
    ` : ''}

    <!-- Gap Analysis -->
    <section class="content-section" id="gap-analysis">
        <div class="section-header">
            <span class="section-number">06</span>
            <h2 class="section-title">SOP/Playbook Gap Analysis</h2>
        </div>

        <div class="gap-summary">
            <div class="gap-stats-grid">
                <div class="stat-card critical">
                    <div class="stat-value">${data.gapStats.critical}</div>
                    <div class="stat-label">Critical Gaps</div>
                </div>
                <div class="stat-card high">
                    <div class="stat-value">${data.gapStats.high}</div>
                    <div class="stat-label">High Priority</div>
                </div>
                <div class="stat-card medium">
                    <div class="stat-value">${data.gapStats.medium}</div>
                    <div class="stat-label">Medium Priority</div>
                </div>
                <div class="stat-card low">
                    <div class="stat-value">${data.gapStats.low}</div>
                    <div class="stat-label">Low Priority</div>
                </div>
            </div>
        </div>

        <div class="gaps-container">
            ${data.gaps.map(gap => `
            <div class="gap-card ${gap.priority}">
                <div class="gap-header">
                    <div class="gap-priority-badge">${escapeHtml(gap.priority)}</div>
                    <h4 class="gap-title">${escapeHtml(gap.title)}</h4>
                    <div class="gap-status">${escapeHtml(gap.status)}</div>
                </div>

                <div class="gap-body">
                    <div class="gap-trigger">
                        <strong>Scenario Trigger:</strong> ${escapeHtml(gap.trigger)}
                    </div>

                    <div class="gap-required">
                        <strong>Required Procedures:</strong>
                        <ul class="checklist">
                            ${gap.requiredProcedures.map(proc => `<li>${escapeHtml(proc)}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="gap-impact">
                        <strong>Impact if Missing:</strong> ${escapeHtml(gap.impact)}
                    </div>

                    <div class="gap-recommendation">
                        <strong>Recommendation:</strong>
                        <p>${escapeHtml(gap.recommendation)}</p>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </section>

    <!-- Evaluation Section -->
    <section class="content-section" id="evaluation">
        <div class="section-header">
            <span class="section-number">07</span>
            <h2 class="section-title">Exercise Evaluation</h2>
        </div>

        <div class="info-box">
            <strong>Post-Exercise Debrief:</strong> Conduct after-action review within 48 hours.
            Focus on lessons learned and concrete action items with assigned owners.
        </div>

        <h3 class="subsection-title">After-Action Report Template</h3>

        <div class="aar-section">
            <h4>What Went Well</h4>
            <p style="color: var(--gray-700); font-size: 10pt; margin-bottom: 60pt;">
                Document successes and effective responses (use during debrief)...
            </p>
        </div>

        <div class="aar-section">
            <h4>Areas for Improvement</h4>
            <p style="color: var(--gray-700); font-size: 10pt; margin-bottom: 60pt;">
                Document challenges and improvement opportunities (use during debrief)...
            </p>
        </div>

        <div class="aar-section">
            <h4>Action Items</h4>
            <table>
                <thead>
                    <tr>
                        <th>Action Item</th>
                        <th>Owner</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Footer on every page -->
    <div class="page-footer">
        <div class="footer-left">${escapeHtml(data.title)}</div>
        <div class="footer-center">CONFIDENTIAL</div>
        <div class="footer-right">${escapeHtml(data.date)}</div>
    </div>
</body>
</html>`;
}

/**
 * Generate PDF from tabletop exercise data
 */
async function generatePDF(data: TabletopExerciseData, outputPath: string) {
    console.log('🚀 Starting PDF generation...');

    // Build HTML
    const html = buildHtml(data);

    console.log('📄 HTML document built');

    // Launch Playwright
    const browser = await chromium.launch({
        headless: true,
    });

    const page = await browser.newPage();

    // Set content and wait for fonts to load
    await page.setContent(html, {
        waitUntil: 'networkidle',
    });

    console.log('🖨️  Generating PDF...');

    // Generate PDF with professional settings
    await page.pdf({
        path: outputPath,
        format: 'Letter',
        printBackground: true,
        margin: {
            top: '0.75in',
            right: '0.75in',
            bottom: '1in',
            left: '0.75in',
        },
        displayHeaderFooter: false,
        preferCSSPageSize: true,
    });

    await browser.close();

    console.log(`✅ PDF generated successfully: ${outputPath}`);
}

/**
 * Load example data (for testing)
 */
function getExampleData(): TabletopExerciseData {
    return {
        title: 'SSRF to AWS Credential Compromise',
        subtitle: 'Server-Side Request Forgery exploitation leading to EC2 metadata service access and IAM credential theft',
        scenarioType: 'Technical - Cloud Security',
        targetAudience: 'SOC Analysts, Incident Response, DevOps/Cloud Security',
        duration: '90-120 minutes',
        difficulty: 'Intermediate',
        severity: 'CRITICAL',
        preparedBy: 'Security Operations Team',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        version: '1.0',

        executiveSummary: 'This tabletop exercise simulates a critical security incident where an attacker exploits a Server-Side Request Forgery (SSRF) vulnerability in your web application to access the AWS EC2 instance metadata service. The attacker steals temporary IAM credentials and uses them to exfiltrate 8.4 GB of customer data from S3 buckets before attempting destructive actions.',

        attackVector: 'SSRF vulnerability in image processing API endpoint allows unrestricted outbound HTTP requests',
        potentialImpact: 'Customer data breach (500K+ records), regulatory notification requirements, reputation damage',
        testingGoals: 'Validate SSRF response procedures, test AWS credential rotation, assess cloud monitoring capabilities',
        criticalGaps: 'SSRF incident response playbook, AWS credential compromise procedures, data breach notification protocols',

        scenarioOverview: 'Your organization operates an e-commerce platform on AWS. A threat actor discovers an SSRF vulnerability in the image resize API endpoint that accepts user-supplied URLs. By crafting malicious requests to 169.254.169.254 (AWS metadata service), the attacker successfully retrieves IAM role credentials attached to the EC2 instance.',

        timelineEvents: [
            {
                time: 'T+0',
                title: 'SSRF Vulnerability Discovery',
                description: 'WAF alerts on suspicious requests targeting AWS metadata service endpoint (169.254.169.254)',
                severity: 'high',
            },
            {
                time: 'T+15',
                title: 'IAM Credential Theft',
                description: 'Application logs confirm successful metadata service access. Temporary IAM credentials exposed via API response',
                severity: 'critical',
                impact: 'Attacker now has valid AWS credentials with S3 read access',
            },
            {
                time: 'T+30',
                title: 'Data Exfiltration Begins',
                description: 'CloudTrail shows API calls from external IP using stolen credentials. 8.4 GB customer data downloaded from S3',
                severity: 'critical',
                impact: 'Data breach in progress - 500K+ customer records',
            },
        ],

        objectives: [
            {
                number: 1,
                title: 'Test SSRF Detection and Response',
                description: 'Evaluate team\'s ability to detect SSRF vulnerabilities and execute containment procedures',
                successCriteria: [
                    'SSRF vulnerability identified within 30 minutes',
                    'Containment decision made with clear rationale',
                    'Application security team engaged for patching',
                ],
            },
            {
                number: 2,
                title: 'Validate AWS Credential Rotation',
                description: 'Test procedures for revoking compromised IAM credentials and preventing further abuse',
                successCriteria: [
                    'IAM credentials revoked within 15 minutes',
                    'Blast radius assessment completed',
                    'All affected resources identified',
                ],
            },
        ],

        injects: [
            {
                id: 'SSRF-DISCOVER-001',
                time: 'T+0',
                title: 'WAF Alert - Suspicious URL Pattern',
                severity: 'high',
                scenario: 'AWS WAF detects requests with metadata service IP address (169.254.169.254) in the image_url parameter. Rule is in detection-only mode and allowed the request through.',
                artifact: 'POST /api/v1/images/resize HTTP/1.1\\nHost: api.company.com\\nContent-Type: application/json\\n\\n{\\n  "image_url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/",\\n  "width": 800,\\n  "height": 600\\n}',
                expectedResponse: 'Security team recognizes SSRF attempt, investigates application logs, checks for successful exploitation',
                discussionQuestions: [
                    'What is 169.254.169.254 and why is it significant in AWS?',
                    'Should WAF be in block mode or detection-only?',
                    'What logs would you check first?',
                ],
                conditionalResponses: [
                    {
                        trigger: 'What logs should we check?',
                        response: 'Application logs show 15 similar requests over 30 minutes, all returning 200 OK with JSON responses (not image data)',
                    },
                ],
            },
        ],

        atomics: [
            {
                id: 'SSRF-DISCOVER-001',
                time: 'T+0',
                title: 'Display WAF Alert',
                action: 'Show AWS WAF console alert for suspicious request pattern',
                commands: '# Read alert details aloud or show screenshot\\n# Alert details: See inject card SSRF-DISCOVER-001',
                commandLanguage: 'bash',
                expectedResponse: 'Security team investigates WAF alert, checks application logs',
                fallback: 'If no response after 10 minutes, prompt: "Your WAF has detected suspicious patterns. What\'s your response?"',
            },
        ],

        gapStats: {
            critical: 2,
            high: 2,
            medium: 3,
            low: 1,
        },

        gaps: [
            {
                priority: 'critical',
                title: 'SSRF Vulnerability Response Playbook',
                status: 'MISSING',
                trigger: 'WAF alert for AWS metadata service access',
                requiredProcedures: [
                    'SSRF identification and validation procedures',
                    'Application containment decision tree',
                    'AWS credential rotation for compromised IAM roles',
                    'Blast radius assessment procedures',
                ],
                impact: 'Delayed containment, continued credential abuse, extended attacker access window',
                recommendation: 'Develop comprehensive SSRF incident response playbook covering detection indicators, containment options, credential rotation procedures, and post-incident remediation including IMDSv2 enforcement',
            },
            {
                priority: 'critical',
                title: 'AWS IAM Credential Compromise Response',
                status: 'INADEQUATE',
                trigger: 'CloudTrail shows API calls from unauthorized IP addresses',
                requiredProcedures: [
                    'Immediate credential revocation methods',
                    'Blast radius assessment for IAM roles',
                    'CloudTrail forensic analysis procedures',
                    'Affected resource identification',
                ],
                impact: 'Extended attacker access window, broader cloud infrastructure compromise',
                recommendation: 'Create AWS credential compromise playbook with step-by-step revocation procedures, CloudTrail query templates, and automated credential rotation scripts',
            },
        ],
    };
}

/**
 * Main CLI
 */
async function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    let dataPath: string | null = null;
    let outputPath: string = 'tabletop-exercise.pdf';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--data' && args[i + 1]) {
            dataPath = args[i + 1];
            i++;
        } else if (args[i] === '--output' && args[i + 1]) {
            outputPath = args[i + 1];
            i++;
        } else if (args[i] === '--example') {
            dataPath = 'EXAMPLE';
        } else if (args[i] === '--help' || args[i] === '-h') {
            console.log(`
Professional PDF Generator for Tabletop Exercises

Usage:
  bun run generate-pdf.ts [options]

Options:
  --data <path>      Path to JSON data file
  --output <path>    Output PDF path (default: tabletop-exercise.pdf)
  --example          Use built-in example data
  --help, -h         Show this help message

Example:
  bun run generate-pdf.ts --data exercise-data.json --output ssrf-exercise.pdf
  bun run generate-pdf.ts --example --output example.pdf
            `);
            process.exit(0);
        }
    }

    // Load data
    let data: TabletopExerciseData;

    if (dataPath === 'EXAMPLE') {
        console.log('📦 Using example data');
        data = getExampleData();
    } else if (dataPath) {
        console.log(`📦 Loading data from: ${dataPath}`);
        const jsonData = await readFile(dataPath, 'utf-8');
        data = JSON.parse(jsonData);
    } else {
        console.error('❌ Error: No data source specified. Use --data or --example');
        console.log('Run with --help for usage information');
        process.exit(1);
    }

    // Generate PDF
    await generatePDF(data, outputPath);
}

// Run if executed directly
if (import.meta.main) {
    main().catch(error => {
        console.error('❌ Error generating PDF:', error);
        process.exit(1);
    });
}

export { generatePDF, type TabletopExerciseData };
