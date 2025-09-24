# Cline Codebase Quick Reference

A concise reference for developers working with the Cline codebase.

## 🗂️ Directory Quick Reference

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `/src/core/` | Core business logic | `controller/`, `task/`, `api/` |
| `/src/hosts/vscode/` | VS Code integration | `VscodeWebviewProvider.ts` |
| `/webview-ui/src/` | React frontend | `App.tsx`, `components/` |
| `/src/core/task/tools/` | Tool implementations | `file.ts`, `terminal.ts`, `browser.ts` |
| `/src/core/api/providers/` | AI provider integrations | `anthropic.ts`, `openai.ts` |
| `/docs/` | Documentation site | Nextra-based docs |

## 🔧 Common Development Tasks

### Adding a New Tool
1. Create tool file in `/src/core/task/tools/`
2. Implement the tool interface
3. Register in `ToolExecutor.ts`
4. Add to prompts in `/src/core/prompts/`

### Adding AI Provider Support
1. Create provider in `/src/core/api/providers/`
2. Implement the `ApiProvider` interface
3. Add to provider registry
4. Update UI in webview settings

### Modifying the UI
1. Components in `/webview-ui/src/components/`
2. Use existing design system patterns
3. Test with Storybook: `cd webview-ui && npm run storybook`

### Adding VS Code Commands
1. Add command to `package.json` contributes section
2. Implement handler in `/src/core/controller/commands/`
3. Register in `extension.ts`

## 🏃‍♂️ Quick Start Commands

```bash
# Full setup
git clone https://github.com/cline/cline.git
cd cline
npm run install:all

# Development
npm run watch          # Watch extension changes
cd webview-ui && npm run dev  # Watch UI changes

# Testing
npm run test           # All tests
npm run test:unit      # Unit tests only
npm run format:fix     # Format code

# Building
npm run compile        # Build extension
npm run package        # Package for distribution
```

## 🔍 Key Code Patterns

### Event Handling
```typescript
// Extension → Webview
webviewProvider.postMessage({
  type: "action",
  action: "updateTask", 
  task: taskData
})

// Webview → Extension  
vscode.postMessage({
  type: "userAction",
  action: "submitTask",
  text: userInput
})
```

### Tool Execution
```typescript
const result = await this.toolExecutor.executeTool("file_write", {
  path: "/path/to/file",
  content: "file content"
})
```

### Context Management
```typescript
// Add to conversation context
await this.contextManager.addToContext(filePath, content)

// Check context window usage
const usage = this.contextManager.getContextUsage()
```

## 🧪 Testing Patterns

### Unit Tests (Mocha)
```typescript
describe("ToolExecutor", () => {
  it("should execute file write tool", async () => {
    const result = await toolExecutor.executeTool("file_write", params)
    expect(result.success).to.be.true
  })
})
```

### Integration Tests (VS Code)
```typescript
suite("Extension Integration", () => {
  test("should activate extension", async () => {
    const extension = vscode.extensions.getExtension("saoudrizwan.claude-dev")
    await extension?.activate()
    assert.ok(extension?.isActive)
  })
})
```

## 🚨 Common Gotchas

1. **Path Handling**: Always use `path.toPosix()` for cross-platform compatibility
2. **Async Operations**: Most operations are async - don't forget `await`
3. **Context Limits**: Be mindful of context window usage with large files
4. **Error Handling**: Always wrap AI provider calls in try-catch blocks
5. **VS Code API**: Some APIs only work in specific contexts (active editor, etc.)

## 🎯 Architecture Decision Records (ADRs)

Key architectural decisions are documented in `/docs/adr/`. Important ones:
- Tool architecture and safety model
- Context management strategy  
- AI provider abstraction
- Webview communication patterns

## 📋 Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Tests are added for new functionality
- [ ] Documentation is updated
- [ ] Formatting follows project standards (`npm run format:fix`)
- [ ] No console.log statements in production code
- [ ] Async operations are properly awaited
- [ ] File paths use cross-platform utilities

## 🔗 Important Links

- [Contributing Guide](../../CONTRIBUTING.md)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Discord Community](https://discord.gg/cline)
- [Architecture Deep Dive](./understanding-the-codebase.mdx)

## 🆘 Getting Help

1. **Discord**: `#contributors` channel for real-time help
2. **GitHub Issues**: For bugs and feature requests  
3. **GitHub Discussions**: For architectural questions
4. **Code Comments**: Many files have detailed inline documentation
5. **Existing Tests**: Great examples of how components work together