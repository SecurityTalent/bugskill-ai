# SubdomainEnum Source Code

Extracted workflow code from the SubdomainEnum skill for clean separation of documentation and implementation.

## Structure

```
src/
├── index.ts                 # Entry point with exports
├── types.ts                 # Shared type definitions
├── orchestration.ts         # Main workflow orchestration
├── configs/
│   ├── tools.ts            # Tool configurations and command builders
│   ├── wordlists.ts        # Wordlist recommendations and patterns
│   ├── resolvers.ts        # DNS resolver management
│   └── api-keys.ts         # API key configuration templates
├── agents/
│   └── coordination.ts     # Agent coordination patterns
└── workflows/
    ├── quick-enum.ts       # Quick passive enumeration
    ├── full-enum.ts        # Full comprehensive enumeration
    ├── cloud-enum.ts       # Cloud-focused enumeration
    └── permutation-enum.ts # Permutation-based enumeration
```

## Design Philosophy

### Separation of Concerns

- **SKILL.md**: High-level documentation, workflow routing, usage guidance
- **src/**: Lintable, testable TypeScript implementation code
- **workflows/*.md**: Human-readable workflow documentation
- **agents/*.md**: Agent definitions and capabilities

### Type Safety

All code uses TypeScript with strict type definitions in `types.ts`:
- `EnumConfig` - Workflow configuration
- `WorkflowResult` - Standard result format
- `AgentTask` - Agent coordination tasks
- `ToolConfig` - Tool definitions

### Command Builders

The `CommandBuilder` class provides methods for generating shell commands:
- Type-safe command construction
- Consistent parameter ordering
- Easy testing and modification

### Workflow Classes

Each workflow is a class with:
- `execute()` - Main execution method
- `static getCommands()` - Generate command list
- `static getPrerequisites()` - Required tools/setup
- `static getUsageGuidance()` - When to use this workflow

### Agent Coordination

The `AgentCoordinator` class provides:
- Task creation for each agent type
- Parallel execution patterns
- Sequential workflow orchestration

## Usage

### Direct Import

```typescript
import { SubdomainEnumOrchestrator, createConfig } from './src';

const config = createConfig({
  target: 'example.com',
  mode: 'quick',
  outputDir: './enum-output',
});

const orchestrator = new SubdomainEnumOrchestrator(config);
const result = await orchestrator.execute();
```

### Via SKILL.md

The SKILL.md references these implementations:

```markdown
See `src/workflows/quick-enum.ts` for implementation details.
```

### Command Generation

```typescript
import { QuickEnumWorkflow } from './src/workflows/quick-enum';

const commands = QuickEnumWorkflow.getCommands('example.com');
console.log(commands.join('\n'));
```

## Benefits

1. **Lintable**: Code can be checked with ESLint/TSC
2. **Testable**: Unit tests can import and test workflows
3. **Maintainable**: Changes to logic don't require markdown editing
4. **Reusable**: Other skills can import and use these workflows
5. **Type-Safe**: TypeScript catches errors at compile time

## Integration with SKILL.md

SKILL.md maintains its role as the entry point and router:

1. User triggers skill via natural language
2. SKILL.md routes to appropriate workflow
3. SKILL.md references src/ implementation
4. Workflow executes via orchestration.ts
5. Results formatted by SKILL.md

## Future Enhancements

- [ ] Add unit tests for workflows
- [ ] Create CLI tool (bun run subdomain-enum)
- [ ] Add progress tracking/streaming
- [ ] Implement result caching
- [ ] Add retry logic for failed phases
- [ ] Create web UI for visualization

## Related Files

- `../SKILL.md` - Main skill documentation
- `../workflows/*.md` - Human-readable workflow docs
- `../../agents/Subdomain*.md` - Agent definitions
- `../ToolsInstall.md` - Tool installation guide
