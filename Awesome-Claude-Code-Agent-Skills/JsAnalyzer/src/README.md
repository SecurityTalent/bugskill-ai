# JsAnalyzer Source Code

Extracted workflow logic, agent configurations, and orchestration patterns from JsAnalyzer skill.

## Directory Structure

```
src/
├── types/           # TypeScript type definitions
│   └── index.ts     # Core types for workflows, agents, outputs
├── configs/         # Configuration files
│   ├── agents.ts    # Agent definitions (Phase 1-3, 3.5, 4)
│   ├── outputs.ts   # Output file structure and metadata
│   ├── workflows.ts # Workflow configurations (FullScan, Analyze, Review)
│   └── grep-patterns.ts # Grep patterns for Phase 1 analysis
├── orchestrators/   # Orchestration logic
│   ├── fullscan.ts  # FullScan workflow orchestrator
│   ├── analyze.ts   # Analyze workflow orchestrator
│   └── review.ts    # Review workflow orchestrator
├── index.ts         # Main entry point with exports
└── README.md        # This file
```

## Purpose

This directory contains **configuration and orchestration logic** extracted from markdown workflow files. The code is:

- **Lintable** - Can be checked with TypeScript and biome
- **Testable** - Pure functions with clear interfaces
- **Maintainable** - Centralized configuration instead of embedded in markdown
- **Type-safe** - Full TypeScript types for all configurations

## Key Files

### Types (`types/index.ts`)

Core type definitions used across all orchestrators and configs:
- `AgentConfig` - Agent definitions with model and purpose
- `WorkflowConfig` - Complete workflow specifications
- `AnalysisTarget` - Target directory and output configuration
- `ScanStatistics` - Statistics tracking for reports

### Configurations

**`configs/agents.ts`**
- Defines all agents used in JsAnalyzer (Phase 1-3, 3.5, 4)
- Helper functions: `getAgentConfig()`, `getPhaseAgents()`

**`configs/outputs.ts`**
- Complete output file structure
- Output file tree for display
- Helper functions: `getOutputsByCategory()`, `getOutputsByCreator()`

**`configs/workflows.ts`**
- Three workflow configurations: FullScan, Analyze, Review
- Workflow routing based on triggers
- Helper function: `determineWorkflow()`

**`configs/grep-patterns.ts`**
- All grep patterns used in Phase 1 analysis
- Organized by category: paths, endpoints, sources, sinks, secrets
- Risk levels assigned to each pattern
- Helper functions: `getPatternsByCategory()`, `getCriticalPatterns()`

### Orchestrators

**`orchestrators/fullscan.ts`**
- Prompt generation for all phases (1-3, 3.5, 4)
- Setup scripts for output directories
- Performance expectations
- Critical orchestrator rules

**`orchestrators/analyze.ts`**
- File finding commands
- Grep configurations for parallel execution
- Tool (doctorswzl) configuration and execution scripts
- Output templates for generated files
- Capabilities matrix (what Analyze does/doesn't do)

**`orchestrators/review.ts`**
- Prerequisites checking
- Prompt templates for all Phase 4 agents
- Synthesis templates for Phase 5 reports
- Agent configurations specific to Review workflow

## Usage in SKILL.md

The SKILL.md file now references these TypeScript modules instead of embedding configuration:

```markdown
## Agent Configuration

See: `src/configs/agents.ts` for complete agent definitions

## Workflow Execution

Import orchestrator functions:
- `src/orchestrators/fullscan.ts` - FullScan workflow
- `src/orchestrators/analyze.ts` - Analyze workflow
- `src/orchestrators/review.ts` - Review workflow
```

## Development

### Type Checking
```bash
cd /Users/jonathandunn/.claude/skills/JsAnalyzer
bun run typecheck
```

### Linting
```bash
bun run lint
bun run lint:fix  # Auto-fix issues
```

### Formatting
```bash
bun run format
```

## Integration

These TypeScript modules are **reference implementations** that document:
1. Agent spawn patterns
2. Prompt templates
3. Output file structures
4. Configuration options

The actual orchestration happens in **workflow markdown files** which read from these configs.

## Philosophy

**Pack-based architecture:**
- Markdown workflows are the **executable documentation**
- TypeScript configs are the **structured data**
- Agent files are the **specialized personalities**
- SKILL.md is the **entry point and router**

This separation allows:
- Workflows to be readable and modifiable
- Configs to be typed and validated
- Logic to be tested in isolation
- Documentation to stay synchronized with code
