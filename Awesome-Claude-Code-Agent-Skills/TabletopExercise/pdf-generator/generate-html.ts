/**
 * Generate standalone HTML version of tabletop exercise
 */

function escapeHtml(unsafe: string | undefined): string {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

interface TabletopExerciseData {
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
    executiveSummary: string;
    attackVector: string;
    potentialImpact: string;
    testingGoals: string;
    criticalGaps: string;
    scenarioOverview: string;
    facilitatorGuide?: {
        preparation: {
            timeline: string;
            tasks: string[];
            materialsNeeded: string[];
            roomSetup: string[];
        };
        openingScript: string;
        groundRules: string[];
        flowOverview: string;
        timing: {
            total: string;
            breakdown: string[];
            flexibility?: string;
        };
        facilitation: string[];
        closingScript: string;
        troubleshooting: Array<{
            issue: string;
            solution: string;
        }>;
    };
    timelineEvents: Array<{
        time: string;
        title: string;
        description: string;
        severity: string;
        impact?: string;
        facilitatorNotes?: {
            context: string;
            discussionPrompts: string[];
            teachingPoints: string[];
        };
    }>;
    objectives: Array<{
        number: number;
        title: string;
        description: string;
        successCriteria: string[];
        facilitatorNotes?: {
            focusAreas: string[];
            commonMistakes: string[];
            timeGuidance: string;
        };
    }>;
    injects: Array<{
        id: string;
        time: string;
        title: string;
        severity: string;
        scenario: string;
        artifact?: string;
        expectedResponse: string;
        discussionQuestions: string[];
        conditionalResponses?: Array<{
            trigger: string;
            response: string;
        }>;
        facilitatorNotes?: {
            setup: string;
            delivery: string;
            expectedTime: string;
            keyPoints: string[];
            redFlags: string[];
            hints: string[];
            successIndicators: string[];
            transition: string;
        };
    }>;
    atomics?: Array<{
        id: string;
        time: string;
        title: string;
        action: string;
        commands?: string;
        commandLanguage?: string;
        expectedResponse: string;
        fallback: string;
        verification: string[];
        facilitatorNotes?: {
            preparation: string;
            executionTips: string[];
            troubleshooting: string;
        };
    }>;
    gapStats: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    gaps: Array<{
        priority: string;
        title: string;
        status: string;
        trigger: string;
        requiredProcedures: string[];
        impact: string;
        recommendation: string;
        facilitatorNotes?: {
            evaluationGuidance: string;
            probeQuestions: string[];
            maturityIndicators: string[];
        };
    }>;
}

export function generateStandaloneHTML(data: TabletopExerciseData): string {
    const severityClass = data.severity.toLowerCase();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.title)} - Tabletop Exercise</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #1e40af;
            --primary-dark: #1e3a8a;
            --primary-light: #3b82f6;
            --accent: #0ea5e9;
            --danger: #dc2626;
            --warning: #f59e0b;
            --success: #10b981;
            --info: #3b82f6;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: var(--gray-900);
            background: var(--gray-50);
        }

        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            color: white;
            padding: 4rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%);
            pointer-events: none;
        }

        .hero-content {
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }

        .severity-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
        }

        .severity-badge.critical {
            background: var(--danger);
        }

        .severity-badge.high {
            background: var(--warning);
            color: var(--gray-900);
        }

        .severity-badge.medium {
            background: var(--info);
        }

        .severity-badge.low {
            background: var(--gray-500);
        }

        h1 {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 1rem;
            line-height: 1.2;
        }

        .subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }

        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            max-width: 900px;
            margin: 2rem auto 0;
            text-align: left;
        }

        .metadata-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            backdrop-filter: blur(10px);
        }

        .metadata-label {
            font-size: 0.875rem;
            opacity: 0.8;
            margin-bottom: 0.25rem;
        }

        .metadata-value {
            font-weight: 600;
            font-size: 1.125rem;
        }

        /* Navigation */
        .nav {
            position: sticky;
            top: 0;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            z-index: 100;
            padding: 1rem 2rem;
        }

        .nav-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 2rem;
            overflow-x: auto;
        }

        .nav-link {
            color: var(--gray-700);
            text-decoration: none;
            font-weight: 500;
            white-space: nowrap;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            transition: all 0.2s;
        }

        .nav-link:hover {
            background: var(--gray-100);
            color: var(--primary);
        }

        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 3rem 2rem;
        }

        /* Section */
        .section {
            background: white;
            border-radius: 0.75rem;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--gray-200);
        }

        .section-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary);
            opacity: 0.3;
        }

        .section-title {
            font-size: 1.875rem;
            font-weight: 700;
            color: var(--gray-900);
        }

        /* Cards Grid */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .info-card {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: 0.5rem;
            border-left: 4px solid var(--primary);
        }

        .info-card-title {
            font-weight: 600;
            color: var(--gray-700);
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .info-card-value {
            color: var(--gray-900);
            font-size: 1.125rem;
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding-left: 2rem;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--gray-200);
        }

        .timeline-event {
            position: relative;
            margin-bottom: 2rem;
            padding-left: 2rem;
        }

        .timeline-event::before {
            content: '';
            position: absolute;
            left: -2rem;
            top: 0.5rem;
            width: 1rem;
            height: 1rem;
            border-radius: 50%;
            background: white;
            border: 3px solid var(--primary);
        }

        .timeline-event.high::before {
            border-color: var(--warning);
        }

        .timeline-event.critical::before {
            border-color: var(--danger);
        }

        .timeline-time {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            color: var(--primary);
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }

        .timeline-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .timeline-description {
            color: var(--gray-700);
            line-height: 1.6;
        }

        /* Collapsible Card */
        .collapsible-card {
            background: white;
            border: 2px solid var(--gray-200);
            border-radius: 0.75rem;
            margin-bottom: 1.5rem;
            overflow: hidden;
            transition: all 0.2s;
        }

        .collapsible-card:hover {
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .collapsible-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.5rem;
            cursor: pointer;
            background: var(--gray-50);
            transition: background 0.2s;
        }

        .collapsible-header:hover {
            background: var(--gray-100);
        }

        .collapsible-header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
        }

        .collapsible-id {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            color: var(--primary);
            font-weight: 600;
        }

        .collapsible-time {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            color: var(--gray-600);
        }

        .collapsible-title {
            font-weight: 600;
            flex: 1;
        }

        .collapsible-chevron {
            transition: transform 0.2s;
        }

        .collapsible-card.open .collapsible-chevron {
            transform: rotate(180deg);
        }

        .collapsible-body {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }

        .collapsible-card.open .collapsible-body {
            max-height: 5000px;
        }

        .collapsible-content {
            padding: 1.5rem;
        }

        /* Code Block */
        .code-block {
            background: var(--gray-900);
            color: #e5e7eb;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            overflow-x: auto;
        }

        .code-block pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        /* Lists */
        ul, ol {
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }

        li {
            margin-bottom: 0.5rem;
        }

        /* Stat Cards */
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            text-align: center;
            padding: 1.5rem;
            border-radius: 0.5rem;
            background: var(--gray-50);
            border: 2px solid var(--gray-200);
        }

        .stat-card.critical {
            border-color: var(--danger);
            background: #fee;
        }

        .stat-card.high {
            border-color: var(--warning);
            background: #fef3c7;
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 0.875rem;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Priority Badge */
        .priority-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .priority-badge.critical {
            background: var(--danger);
            color: white;
        }

        .priority-badge.high {
            background: var(--warning);
            color: var(--gray-900);
        }

        .priority-badge.medium {
            background: var(--info);
            color: white;
        }

        .priority-badge.low {
            background: var(--gray-400);
            color: white;
        }

        /* Footer */
        footer {
            background: var(--gray-900);
            color: white;
            padding: 2rem;
            text-align: center;
            margin-top: 4rem;
        }

        footer p {
            opacity: 0.8;
        }

        /* Evaluation Form */
        .eval-form {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .eval-status {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }

        .eval-option {
            flex: 1;
            min-width: 200px;
        }

        .eval-option input[type="radio"] {
            margin-right: 0.5rem;
        }

        .eval-option label {
            display: flex;
            align-items: center;
            padding: 1rem;
            border: 2px solid var(--gray-300);
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
        }

        .eval-option input[type="radio"]:checked + label {
            border-color: var(--primary);
            background: #eff6ff;
        }

        .eval-option.adequate input[type="radio"]:checked + label {
            border-color: var(--success);
            background: #f0fdf4;
        }

        .eval-option.inadequate input[type="radio"]:checked + label {
            border-color: var(--warning);
            background: #fffbeb;
        }

        .eval-option.missing input[type="radio"]:checked + label {
            border-color: var(--danger);
            background: #fef2f2;
        }

        .eval-details {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 2px solid var(--gray-200);
        }

        .eval-field {
            margin-bottom: 1rem;
        }

        .eval-field label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--gray-700);
        }

        .eval-field input[type="text"],
        .eval-field input[type="date"],
        .eval-field textarea,
        .eval-field select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--gray-300);
            border-radius: 0.375rem;
            font-family: inherit;
            font-size: 0.875rem;
        }

        .eval-field textarea {
            min-height: 80px;
            resize: vertical;
        }

        .eval-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        /* Facilitator Guide */
        .facilitator-guide {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 3px solid var(--warning);
            border-radius: 0.75rem;
            padding: 2rem;
            margin-bottom: 2rem;
        }

        .facilitator-badge {
            display: inline-block;
            background: var(--warning);
            color: var(--gray-900);
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 700;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
        }

        .facilitator-section {
            margin-bottom: 2rem;
        }

        .facilitator-section h4 {
            color: var(--gray-900);
            font-size: 1.125rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .facilitator-section ul {
            list-style: none;
            padding: 0;
        }

        .facilitator-section li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
        }

        .facilitator-section li::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: var(--warning);
            font-weight: 700;
        }

        .script-box {
            background: white;
            border-left: 4px solid var(--warning);
            padding: 1rem;
            border-radius: 0.375rem;
            font-style: italic;
            line-height: 1.8;
            margin: 0.75rem 0;
        }

        .troubleshooting-item {
            background: white;
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 0.75rem;
            border-left: 4px solid var(--danger);
        }

        .troubleshooting-issue {
            font-weight: 600;
            color: var(--danger);
            margin-bottom: 0.5rem;
        }

        .troubleshooting-solution {
            color: var(--gray-700);
            line-height: 1.6;
        }

        /* Facilitator Notes in Injects */
        .facilitator-notes {
            background: #fffbeb;
            border: 2px solid var(--warning);
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-top: 1.5rem;
        }

        .facilitator-notes-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--warning);
            font-weight: 700;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid var(--warning);
        }

        .facilitator-subsection {
            margin-bottom: 1rem;
        }

        .facilitator-subsection h5 {
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .facilitator-subsection p {
            margin: 0.5rem 0;
            line-height: 1.6;
        }

        .facilitator-subsection ul {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
        }

        .facilitator-subsection li {
            margin-bottom: 0.25rem;
            line-height: 1.5;
        }

        .time-badge {
            display: inline-block;
            background: var(--info);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            font-weight: 600;
        }

        .hint-box {
            background: #e0f2fe;
            border-left: 4px solid var(--info);
            padding: 0.75rem;
            border-radius: 0.25rem;
            font-style: italic;
            margin: 0.5rem 0;
        }

        /* Action Items Summary */
        .action-items-summary {
            margin-top: 3rem;
            padding: 2rem;
            background: var(--gray-50);
            border-radius: 0.75rem;
            border: 2px solid var(--primary);
        }

        .summary-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .summary-count {
            background: var(--primary);
            color: white;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.25rem;
        }

        .summary-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gray-900);
        }

        .summary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: white;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .summary-table th {
            background: var(--gray-100);
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            color: var(--gray-700);
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            border-bottom: 2px solid var(--gray-200);
        }

        .summary-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
            vertical-align: top;
        }

        .summary-table tr:last-child td {
            border-bottom: none;
        }

        .summary-table tr:hover {
            background: var(--gray-50);
        }

        .gap-title-cell {
            font-weight: 600;
            color: var(--gray-900);
        }

        .status-indicator {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .status-chip {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            background: var(--gray-200);
            color: var(--gray-700);
        }

        .status-chip.filled {
            background: var(--success);
            color: white;
        }

        .notes-preview {
            color: var(--gray-600);
            font-size: 0.875rem;
            line-height: 1.4;
            max-width: 300px;
        }

        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--gray-500);
        }

        .empty-state-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        /* Print Styles */
        @media print {
            .nav {
                display: none;
            }

            .collapsible-card {
                page-break-inside: avoid;
            }

            .collapsible-body {
                max-height: none !important;
            }

            .eval-form {
                page-break-inside: avoid;
            }

            .action-items-summary {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <div class="hero">
        <div class="hero-content">
            <span class="severity-badge ${severityClass}">${data.severity}</span>
            <h1>${escapeHtml(data.title)}</h1>
            <p class="subtitle">${escapeHtml(data.subtitle)}</p>

            <div class="metadata-grid">
                <div class="metadata-item">
                    <div class="metadata-label">Scenario Type</div>
                    <div class="metadata-value">${escapeHtml(data.scenarioType)}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Duration</div>
                    <div class="metadata-value">${escapeHtml(data.duration)}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Difficulty</div>
                    <div class="metadata-value">${escapeHtml(data.difficulty)}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Target Audience</div>
                    <div class="metadata-value">${escapeHtml(data.targetAudience)}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-content">
            <a href="#executive-summary" class="nav-link">Executive Summary</a>
            ${data.facilitatorGuide ? '<a href="#facilitator-guide" class="nav-link" style="background: var(--warning); color: var(--gray-900); font-weight: 700;">🎯 Facilitator Guide</a>' : ''}
            <a href="#timeline" class="nav-link">Attack Timeline</a>
            <a href="#objectives" class="nav-link">Objectives</a>
            <a href="#injects" class="nav-link">Injects</a>
            ${data.atomics ? '<a href="#atomics" class="nav-link">Technical Atomics</a>' : ''}
            <a href="#gaps" class="nav-link">Gap Analysis</a>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container">
        <!-- Executive Summary -->
        <section id="executive-summary" class="section">
            <div class="section-header">
                <span class="section-number">01</span>
                <h2 class="section-title">Executive Summary</h2>
            </div>

            <p style="margin-bottom: 2rem; line-height: 1.8;">${escapeHtml(data.executiveSummary)}</p>

            <div class="cards-grid">
                <div class="info-card">
                    <div class="info-card-title">Attack Vector</div>
                    <div class="info-card-value">${escapeHtml(data.attackVector)}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Potential Impact</div>
                    <div class="info-card-value">${escapeHtml(data.potentialImpact)}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Testing Goals</div>
                    <div class="info-card-value">${escapeHtml(data.testingGoals)}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-title">Critical Gaps</div>
                    <div class="info-card-value">${escapeHtml(data.criticalGaps)}</div>
                </div>
            </div>
        </section>

        <!-- Facilitator Guide -->
        ${data.facilitatorGuide ? `
        <section id="facilitator-guide" class="section facilitator-guide">
            <span class="facilitator-badge">🎯 FACILITATOR GUIDE - CONFIDENTIAL</span>
            <h2 style="font-size: 2rem; font-weight: 800; color: var(--gray-900); margin-bottom: 1.5rem;">How to Run This Exercise</h2>
            <p style="margin-bottom: 2rem; line-height: 1.8;">This guide provides everything you need to facilitate a successful tabletop exercise. Read through this section before the exercise day.</p>

            <!-- Preparation -->
            <div class="facilitator-section">
                <h4>📋 Pre-Exercise Preparation</h4>
                <p><strong>Timeline:</strong> ${escapeHtml(data.facilitatorGuide.preparation.timeline)}</p>

                <div style="margin-top: 1rem;">
                    <strong>Tasks:</strong>
                    <ul>
                        ${data.facilitatorGuide.preparation.tasks.map(task => `<li>${escapeHtml(task)}</li>`).join('')}
                    </ul>
                </div>

                <div style="margin-top: 1rem;">
                    <strong>Materials Needed:</strong>
                    <ul>
                        ${data.facilitatorGuide.preparation.materialsNeeded.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                    </ul>
                </div>

                <div style="margin-top: 1rem;">
                    <strong>Room Setup:</strong>
                    <ul>
                        ${data.facilitatorGuide.preparation.roomSetup.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- Opening Script -->
            <div class="facilitator-section">
                <h4>🎤 Opening Script</h4>
                <div class="script-box">
                    ${escapeHtml(data.facilitatorGuide.openingScript).split('\n\n').map(para => `<p style="margin-bottom: 1rem;">${escapeHtml(para)}</p>`).join('')}
                </div>
            </div>

            <!-- Ground Rules -->
            <div class="facilitator-section">
                <h4>⚖️ Ground Rules to Establish</h4>
                <ul>
                    ${data.facilitatorGuide.groundRules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}
                </ul>
            </div>

            <!-- Flow Overview -->
            <div class="facilitator-section">
                <h4>📊 Exercise Flow Overview</h4>
                <p>${escapeHtml(data.facilitatorGuide.flowOverview)}</p>

                <div style="margin-top: 1rem;">
                    <strong>Total Duration:</strong> ${escapeHtml(data.facilitatorGuide.timing.total)}
                </div>

                <div style="margin-top: 1rem;">
                    <strong>Time Breakdown:</strong>
                    <ul>
                        ${data.facilitatorGuide.timing.breakdown.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                    </ul>
                </div>

                ${data.facilitatorGuide.timing.flexibility ? `<p style="margin-top: 1rem;"><strong>Note:</strong> ${escapeHtml(data.facilitatorGuide.timing.flexibility)}</p>` : ''}
            </div>

            <!-- Facilitation Best Practices -->
            <div class="facilitator-section">
                <h4>💡 Facilitation Best Practices</h4>
                <ul>
                    ${data.facilitatorGuide.facilitation.map(tip => `<li>${escapeHtml(tip)}</li>`).join('')}
                </ul>
            </div>

            <!-- Closing Script -->
            <div class="facilitator-section">
                <h4>🎬 Closing Script</h4>
                <div class="script-box">
                    ${escapeHtml(data.facilitatorGuide.closingScript).split('\n\n').map(para => `<p style="margin-bottom: 1rem;">${escapeHtml(para)}</p>`).join('')}
                </div>
            </div>

            <!-- Troubleshooting -->
            <div class="facilitator-section">
                <h4>🔧 Troubleshooting Common Issues</h4>
                ${data.facilitatorGuide.troubleshooting.map(item => `
                    <div class="troubleshooting-item">
                        <div class="troubleshooting-issue">Issue: ${escapeHtml(item.issue)}</div>
                        <div class="troubleshooting-solution"><strong>Solution:</strong> ${escapeHtml(item.solution)}</div>
                    </div>
                `).join('')}
            </div>
        </section>
        ` : ''}

        <!-- Scenario Overview -->
        <section class="section">
            <div class="section-header">
                <span class="section-number">${data.facilitatorGuide ? '03' : '02'}</span>
                <h2 class="section-title">Scenario Overview</h2>
            </div>
            <p style="line-height: 1.8;">${escapeHtml(data.scenarioOverview)}</p>
        </section>

        <!-- Attack Timeline -->
        <section id="timeline" class="section">
            <div class="section-header">
                <span class="section-number">${data.facilitatorGuide ? '04' : '03'}</span>
                <h2 class="section-title">Attack Chain Timeline</h2>
            </div>

            <div class="timeline">
                ${data.timelineEvents.map(event => `
                    <div class="timeline-event ${event.severity}">
                        <div class="timeline-time">${escapeHtml(event.time)}</div>
                        <div class="timeline-title">${escapeHtml(event.title)}</div>
                        <div class="timeline-description">${escapeHtml(event.description)}</div>
                        ${event.impact ? `<div style="margin-top: 0.5rem; padding: 0.75rem; background: var(--gray-50); border-radius: 0.375rem; font-weight: 500;">
                            <strong>Impact:</strong> ${escapeHtml(event.impact)}
                        </div>` : ''}

                        ${event.facilitatorNotes ? `
                            <div class="facilitator-notes">
                                <div class="facilitator-notes-header">
                                    🎯 FACILITATOR NOTES - CONFIDENTIAL
                                </div>

                                <div class="facilitator-subsection">
                                    <h5>📋 Context for Facilitators</h5>
                                    <p>${escapeHtml(event.facilitatorNotes.context)}</p>
                                </div>

                                ${event.facilitatorNotes.discussionPrompts && event.facilitatorNotes.discussionPrompts.length > 0 ? `
                                    <div class="facilitator-subsection">
                                        <h5>💬 Discussion Prompts</h5>
                                        <ul>
                                            ${event.facilitatorNotes.discussionPrompts.map(prompt => `<li>${escapeHtml(prompt)}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${event.facilitatorNotes.teachingPoints && event.facilitatorNotes.teachingPoints.length > 0 ? `
                                    <div class="facilitator-subsection">
                                        <h5>📚 Key Teaching Points</h5>
                                        <ul>
                                            ${event.facilitatorNotes.teachingPoints.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- Objectives -->
        <section id="objectives" class="section">
            <div class="section-header">
                <span class="section-number">${data.facilitatorGuide ? '05' : '04'}</span>
                <h2 class="section-title">Exercise Objectives</h2>
            </div>

            ${data.objectives.map(obj => `
                <div style="margin-bottom: 2rem; padding: 1.5rem; background: var(--gray-50); border-radius: 0.5rem;">
                    <h3 style="color: var(--primary); margin-bottom: 1rem;">
                        Objective ${obj.number}: ${escapeHtml(obj.title)}
                    </h3>
                    <p style="margin-bottom: 1rem; line-height: 1.8;">${escapeHtml(obj.description)}</p>
                    ${obj.successCriteria && obj.successCriteria.length > 0 ? `
                        <div style="margin-top: 1rem;">
                            <strong style="color: var(--gray-700);">Success Criteria:</strong>
                            <ul style="margin-top: 0.5rem;">
                                ${obj.successCriteria.map(criteria => `
                                    <li>${escapeHtml(criteria)}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${obj.facilitatorNotes ? `
                        <div class="facilitator-notes">
                            <div class="facilitator-notes-header">
                                🎯 FACILITATOR NOTES - CONFIDENTIAL
                            </div>

                            ${obj.facilitatorNotes.focusAreas && obj.facilitatorNotes.focusAreas.length > 0 ? `
                                <div class="facilitator-subsection">
                                    <h5>🎯 Focus Areas for This Objective</h5>
                                    <ul>
                                        ${obj.facilitatorNotes.focusAreas.map(area => `<li>${escapeHtml(area)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}

                            ${obj.facilitatorNotes.commonMistakes && obj.facilitatorNotes.commonMistakes.length > 0 ? `
                                <div class="facilitator-subsection">
                                    <h5>⚠️ Common Mistakes to Watch For</h5>
                                    <ul>
                                        ${obj.facilitatorNotes.commonMistakes.map(mistake => `<li style="color: var(--warning);">${escapeHtml(mistake)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}

                            ${obj.facilitatorNotes.timeGuidance ? `
                                <div class="facilitator-subsection">
                                    <h5>⏱️ Time Guidance</h5>
                                    <p>${escapeHtml(obj.facilitatorNotes.timeGuidance)}</p>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </section>

        <!-- Injects -->
        <section id="injects" class="section">
            <div class="section-header">
                <span class="section-number">${data.facilitatorGuide ? '06' : '05'}</span>
                <h2 class="section-title">Exercise Injects</h2>
            </div>

            ${data.injects.map(inject => `
                <div class="collapsible-card" onclick="this.classList.toggle('open')">
                    <div class="collapsible-header">
                        <div class="collapsible-header-content">
                            <span class="collapsible-id">${escapeHtml(inject.id)}</span>
                            <span class="collapsible-time">${escapeHtml(inject.time)}</span>
                            <span class="collapsible-title">${escapeHtml(inject.title)}</span>
                            <span class="priority-badge ${inject.severity}">${inject.severity}</span>
                        </div>
                        <svg class="collapsible-chevron" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                    <div class="collapsible-body">
                        <div class="collapsible-content">
                            <h4 style="margin-bottom: 0.5rem;">Scenario</h4>
                            <p style="margin-bottom: 1.5rem; line-height: 1.8;">${escapeHtml(inject.scenario)}</p>

                            ${inject.artifact ? `
                                <h4 style="margin-bottom: 0.5rem;">Artifact</h4>
                                <div class="code-block">
                                    <pre>${escapeHtml(inject.artifact)}</pre>
                                </div>
                            ` : ''}

                            <h4 style="margin-bottom: 0.5rem;">Expected Response</h4>
                            <p style="margin-bottom: 1.5rem; line-height: 1.8;">${escapeHtml(inject.expectedResponse)}</p>

                            ${inject.discussionQuestions && inject.discussionQuestions.length > 0 ? `
                                <h4 style="margin-bottom: 0.5rem;">Discussion Questions</h4>
                                <ul>
                                    ${inject.discussionQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}
                                </ul>
                            ` : ''}

                            ${inject.conditionalResponses && inject.conditionalResponses.length > 0 ? `
                                <h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Conditional Responses</h4>
                                ${inject.conditionalResponses.map(cr => `
                                    <div style="margin-bottom: 1rem; padding: 1rem; background: var(--info); background: #eff6ff; border-radius: 0.375rem;">
                                        <strong>If: ${escapeHtml(cr.trigger)}</strong><br>
                                        <span style="color: var(--gray-700);">${escapeHtml(cr.response)}</span>
                                    </div>
                                `).join('')}
                            ` : ''}

                            ${inject.facilitatorNotes ? `
                                <div class="facilitator-notes">
                                    <div class="facilitator-notes-header">
                                        🎯 FACILITATOR NOTES - CONFIDENTIAL
                                    </div>

                                    <div class="facilitator-subsection">
                                        <h5>⏱️ Expected Time</h5>
                                        <span class="time-badge">${escapeHtml(inject.facilitatorNotes.expectedTime)}</span>
                                    </div>

                                    <div class="facilitator-subsection">
                                        <h5>🎬 Setup & Delivery</h5>
                                        <p><strong>Setup:</strong> ${escapeHtml(inject.facilitatorNotes.setup)}</p>
                                        <p><strong>Delivery:</strong> ${escapeHtml(inject.facilitatorNotes.delivery)}</p>
                                        <p><strong>Transition:</strong> ${escapeHtml(inject.facilitatorNotes.transition)}</p>
                                    </div>

                                    <div class="facilitator-subsection">
                                        <h5>🔑 Key Points to Emphasize</h5>
                                        <ul>
                                            ${inject.facilitatorNotes.keyPoints.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
                                        </ul>
                                    </div>

                                    <div class="facilitator-subsection">
                                        <h5>🚩 Red Flags to Watch For</h5>
                                        <ul>
                                            ${inject.facilitatorNotes.redFlags.map(flag => `<li style="color: var(--danger);">${escapeHtml(flag)}</li>`).join('')}
                                        </ul>
                                    </div>

                                    <div class="facilitator-subsection">
                                        <h5>💡 Hints If Team Gets Stuck</h5>
                                        ${inject.facilitatorNotes.hints.map(hint => `
                                            <div class="hint-box">${escapeHtml(hint)}</div>
                                        `).join('')}
                                    </div>

                                    <div class="facilitator-subsection">
                                        <h5>✅ Success Indicators</h5>
                                        <ul>
                                            ${inject.facilitatorNotes.successIndicators.map(indicator => `<li style="color: var(--success);">${escapeHtml(indicator)}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </section>

        <!-- Atomics (if present) -->
        ${data.atomics ? `
            <section id="atomics" class="section">
                <div class="section-header">
                    <span class="section-number">${data.facilitatorGuide ? '07' : '06'}</span>
                    <h2 class="section-title">Technical Atomics Runbook</h2>
                </div>

                ${data.atomics.map(atomic => `
                    <div class="collapsible-card" onclick="this.classList.toggle('open')">
                        <div class="collapsible-header">
                            <div class="collapsible-header-content">
                                <span class="collapsible-id">${escapeHtml(atomic.id)}</span>
                                <span class="collapsible-time">${escapeHtml(atomic.time)}</span>
                                <span class="collapsible-title">${escapeHtml(atomic.title)}</span>
                            </div>
                            <svg class="collapsible-chevron" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                        <div class="collapsible-body">
                            <div class="collapsible-content">
                                <h4 style="margin-bottom: 0.5rem;">Action</h4>
                                <p style="margin-bottom: 1.5rem; line-height: 1.8;">${escapeHtml(atomic.action)}</p>

                                ${atomic.commands ? `
                                    <h4 style="margin-bottom: 0.5rem;">Commands</h4>
                                    <div class="code-block">
                                        <pre>${escapeHtml(atomic.commands)}</pre>
                                    </div>
                                ` : ''}

                                <h4 style="margin-bottom: 0.5rem;">Expected Response</h4>
                                <p style="margin-bottom: 1.5rem; line-height: 1.8;">${escapeHtml(atomic.expectedResponse)}</p>

                                <h4 style="margin-bottom: 0.5rem;">Fallback Plan</h4>
                                <p style="margin-bottom: 1.5rem; line-height: 1.8;">${escapeHtml(atomic.fallback)}</p>

                                ${atomic.verification && atomic.verification.length > 0 ? `
                                    <h4 style="margin-bottom: 0.5rem;">Verification Checklist</h4>
                                    <ul>
                                        ${atomic.verification.map(v => `<li>${escapeHtml(v)}</li>`).join('')}
                                    </ul>
                                ` : ''}

                                ${atomic.facilitatorNotes ? `
                                    <div class="facilitator-notes">
                                        <div class="facilitator-notes-header">
                                            🎯 FACILITATOR NOTES - CONFIDENTIAL
                                        </div>

                                        ${atomic.facilitatorNotes.preparation ? `
                                            <div class="facilitator-subsection">
                                                <h5>🛠️ Preparation</h5>
                                                <p>${escapeHtml(atomic.facilitatorNotes.preparation)}</p>
                                            </div>
                                        ` : ''}

                                        ${atomic.facilitatorNotes.executionTips && atomic.facilitatorNotes.executionTips.length > 0 ? `
                                            <div class="facilitator-subsection">
                                                <h5>✅ Execution Tips</h5>
                                                <ul>
                                                    ${atomic.facilitatorNotes.executionTips.map(tip => `<li>${escapeHtml(tip)}</li>`).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}

                                        ${atomic.facilitatorNotes.troubleshooting ? `
                                            <div class="facilitator-subsection">
                                                <h5>🔧 Troubleshooting</h5>
                                                <p>${escapeHtml(atomic.facilitatorNotes.troubleshooting)}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </section>
        ` : ''}

        <!-- Gap Analysis -->
        <section id="gaps" class="section">
            <div class="section-header">
                <span class="section-number">${data.atomics ? '07' : '06'}</span>
                <h2 class="section-title">SOP/Playbook Gap Analysis</h2>
            </div>

            <div class="stat-grid">
                <div class="stat-card critical">
                    <div class="stat-number">${data.gapStats.critical}</div>
                    <div class="stat-label">Critical</div>
                </div>
                <div class="stat-card high">
                    <div class="stat-number">${data.gapStats.high}</div>
                    <div class="stat-label">High</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.gapStats.medium}</div>
                    <div class="stat-label">Medium</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.gapStats.low}</div>
                    <div class="stat-label">Low</div>
                </div>
            </div>

            ${data.gaps.map((gap, index) => `
                <div class="eval-form">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <span class="priority-badge ${gap.priority}">${gap.priority.toUpperCase()}</span>
                        <h3 style="margin: 0; flex: 1;">${escapeHtml(gap.title)}</h3>
                    </div>

                    <div style="margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 0.375rem; border-left: 4px solid var(--primary);">
                        <strong style="display: block; margin-bottom: 0.5rem; color: var(--gray-700);">Evaluation Trigger:</strong>
                        <p style="margin: 0; line-height: 1.6;">${escapeHtml(gap.trigger)}</p>
                    </div>

                    <div class="eval-status">
                        <div class="eval-option adequate">
                            <input type="radio" id="gap-${index}-adequate" name="gap-${index}-status" value="adequate">
                            <label for="gap-${index}-adequate">
                                <div>
                                    <div style="font-weight: 600; color: var(--success); margin-bottom: 0.25rem;">✅ Adequate</div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">Procedures exist and are well-documented</div>
                                </div>
                            </label>
                        </div>

                        <div class="eval-option inadequate">
                            <input type="radio" id="gap-${index}-inadequate" name="gap-${index}-status" value="inadequate">
                            <label for="gap-${index}-inadequate">
                                <div>
                                    <div style="font-weight: 600; color: var(--warning); margin-bottom: 0.25rem;">⚠️ Inadequate</div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">Procedures exist but need improvement</div>
                                </div>
                            </label>
                        </div>

                        <div class="eval-option missing">
                            <input type="radio" id="gap-${index}-missing" name="gap-${index}-status" value="missing" checked>
                            <label for="gap-${index}-missing">
                                <div>
                                    <div style="font-weight: 600; color: var(--danger); margin-bottom: 0.25rem;">❌ Missing</div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">No procedures in place</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="eval-details" id="gap-${index}-details">
                        ${gap.requiredProcedures && gap.requiredProcedures.length > 0 ? `
                            <h4 style="margin-bottom: 0.75rem; color: var(--gray-900);">Required Procedures</h4>
                            <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
                                ${gap.requiredProcedures.map(proc => `<li style="margin-bottom: 0.5rem;">${escapeHtml(proc)}</li>`).join('')}
                            </ul>
                        ` : ''}

                        <h4 style="margin-bottom: 0.75rem; color: var(--gray-900);">Impact if Gap Remains</h4>
                        <p style="margin-bottom: 1.5rem; line-height: 1.6; background: #fef2f2; padding: 1rem; border-radius: 0.375rem; border-left: 4px solid var(--danger);">
                            ${escapeHtml(gap.impact)}
                        </p>

                        <h4 style="margin-bottom: 0.75rem; color: var(--gray-900);">Recommendation</h4>
                        <p style="margin-bottom: 1.5rem; line-height: 1.6; background: #f0fdf4; padding: 1rem; border-radius: 0.375rem; border-left: 4px solid var(--success);">
                            ${escapeHtml(gap.recommendation)}
                        </p>

                        <h4 style="margin-bottom: 0.75rem; color: var(--gray-900);">Action Items</h4>
                        <div class="eval-grid">
                            <div class="eval-field">
                                <label for="gap-${index}-owner">Assigned Owner</label>
                                <input type="text" id="gap-${index}-owner" placeholder="Name or Team">
                            </div>

                            <div class="eval-field">
                                <label for="gap-${index}-due">Due Date</label>
                                <input type="date" id="gap-${index}-due">
                            </div>

                            <div class="eval-field">
                                <label for="gap-${index}-priority-adjust">Adjusted Priority</label>
                                <select id="gap-${index}-priority-adjust">
                                    <option value="${gap.priority}" selected>${gap.priority.charAt(0).toUpperCase() + gap.priority.slice(1)} (Current)</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>

                        <div class="eval-field">
                            <label for="gap-${index}-notes">Notes / Follow-up Actions</label>
                            <textarea id="gap-${index}-notes" placeholder="Document findings, discussions, or follow-up items from the exercise..."></textarea>
                        </div>

                        ${gap.facilitatorNotes ? `
                            <div class="facilitator-notes" style="margin-top: 1.5rem;">
                                <div class="facilitator-notes-header">
                                    🎯 FACILITATOR NOTES - CONFIDENTIAL
                                </div>

                                ${gap.facilitatorNotes.evaluationGuidance ? `
                                    <div class="facilitator-subsection">
                                        <h5>📊 Evaluation Guidance</h5>
                                        <p>${escapeHtml(gap.facilitatorNotes.evaluationGuidance)}</p>
                                    </div>
                                ` : ''}

                                ${gap.facilitatorNotes.probeQuestions && gap.facilitatorNotes.probeQuestions.length > 0 ? `
                                    <div class="facilitator-subsection">
                                        <h5>❓ Probe Questions</h5>
                                        <ul>
                                            ${gap.facilitatorNotes.probeQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${gap.facilitatorNotes.maturityIndicators && gap.facilitatorNotes.maturityIndicators.length > 0 ? `
                                    <div class="facilitator-subsection">
                                        <h5>📈 Maturity Indicators</h5>
                                        <ul>
                                            ${gap.facilitatorNotes.maturityIndicators.map(indicator => `<li>${escapeHtml(indicator)}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </section>

        <!-- Action Items Summary -->
        <section id="action-items-summary" class="action-items-summary">
            <div class="summary-header">
                <div class="summary-count" id="action-items-count">0</div>
                <h2 class="summary-title">Action Items Summary</h2>
            </div>

            <div id="summary-content">
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p><strong>No action items yet</strong></p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Fill out the gap evaluation forms above to populate this summary.</p>
                </div>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer>
        <p>Prepared by: ${escapeHtml(data.preparedBy)} | ${escapeHtml(data.date)} | Version ${escapeHtml(data.version)}</p>
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">Tabletop Skill Developed by Arcanum Information Security</p>
        <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.6;">CONFIDENTIAL - For Internal Use Only</p>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Gap analysis evaluation form logic
        document.querySelectorAll('[name^="gap-"][name$="-status"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const gapIndex = this.name.match(/gap-(\\d+)-status/)[1];
                const detailsSection = document.getElementById('gap-' + gapIndex + '-details');

                if (this.value === 'adequate') {
                    // Hide details when adequate
                    detailsSection.style.display = 'none';
                } else {
                    // Show details for inadequate or missing
                    detailsSection.style.display = 'block';
                }

                // Update action items summary
                updateActionItemsSummary();
            });
        });

        // Action Items Summary aggregation
        const gapData = ${JSON.stringify(data.gaps.map(gap => ({
            title: gap.title,
            priority: gap.priority
        })))};

        function updateActionItemsSummary() {
            const actionItems = [];

            // Collect action items from all gaps
            ${data.gaps.map((_, index) => `
                const gap${index}Status = document.querySelector('input[name="gap-${index}-status"]:checked');
                if (gap${index}Status && gap${index}Status.value !== 'adequate') {
                    const owner = document.getElementById('gap-${index}-owner').value;
                    const due = document.getElementById('gap-${index}-due').value;
                    const priority = document.getElementById('gap-${index}-priority-adjust').value;
                    const notes = document.getElementById('gap-${index}-notes').value;

                    // Only include if at least one field is filled
                    if (owner || due || priority !== gapData[${index}].priority || notes) {
                        actionItems.push({
                            gapIndex: ${index},
                            title: gapData[${index}].title,
                            priority: priority,
                            status: gap${index}Status.value,
                            owner: owner,
                            due: due,
                            notes: notes,
                            hasOwner: !!owner,
                            hasDue: !!due,
                            hasNotes: !!notes
                        });
                    }
                }
            `).join('\n')}

            // Update count badge
            document.getElementById('action-items-count').textContent = actionItems.length;

            // Update summary content
            const summaryContent = document.getElementById('summary-content');

            if (actionItems.length === 0) {
                summaryContent.innerHTML = \`
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <p><strong>No action items yet</strong></p>
                        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Fill out the gap evaluation forms above to populate this summary.</p>
                    </div>
                \`;
            } else {
                summaryContent.innerHTML = \`
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th style="width: 80px;">Priority</th>
                                <th>Gap / Finding</th>
                                <th style="width: 150px;">Owner</th>
                                <th style="width: 120px;">Due Date</th>
                                <th style="width: 120px;">Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${actionItems.map(item => \`
                                <tr>
                                    <td>
                                        <span class="priority-badge \${item.priority}">\${item.priority.toUpperCase()}</span>
                                    </td>
                                    <td class="gap-title-cell">\${item.title}</td>
                                    <td>\${item.owner || '<span style="color: var(--gray-400);">Not assigned</span>'}</td>
                                    <td>\${item.due ? new Date(item.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '<span style="color: var(--gray-400);">No date</span>'}</td>
                                    <td>
                                        <div class="status-indicator">
                                            <span class="status-chip \${item.hasOwner ? 'filled' : ''}">Owner</span>
                                            <span class="status-chip \${item.hasDue ? 'filled' : ''}">Due</span>
                                            <span class="status-chip \${item.hasNotes ? 'filled' : ''}">Notes</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="notes-preview">
                                            \${item.notes ? (item.notes.length > 100 ? item.notes.substring(0, 100) + '...' : item.notes) : '<span style="color: var(--gray-400);">No notes</span>'}
                                        </div>
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                \`;
            }
        }

        // Add listeners to all action item fields
        ${data.gaps.map((_, index) => `
            document.getElementById('gap-${index}-owner').addEventListener('input', updateActionItemsSummary);
            document.getElementById('gap-${index}-due').addEventListener('change', updateActionItemsSummary);
            document.getElementById('gap-${index}-priority-adjust').addEventListener('change', updateActionItemsSummary);
            document.getElementById('gap-${index}-notes').addEventListener('input', updateActionItemsSummary);
        `).join('\n')}

        // Initial update
        updateActionItemsSummary();
    </script>
</body>
</html>`;
}
