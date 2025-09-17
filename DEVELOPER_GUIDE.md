# Developer Resources 

Welcome to Cline development! This page helps you find the right resources for your goals.

## 🎯 Choose Your Path

### 🆕 New to Cline?
Start here to understand what Cline is and how it works:
- [What is Cline?](./getting-started/what-is-cline.mdx) - Core concepts and capabilities
- [Understanding the Codebase](./getting-started/understanding-the-codebase.mdx) - Comprehensive architecture guide
- [Quick Reference](../CODEBASE_REFERENCE.md) - Fast lookup for common tasks

### 🛠️ Want to Contribute?
Ready to contribute code, documentation, or ideas:
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute to Cline
- [Good First Issues](https://github.com/cline/cline/labels/good%20first%20issue) - Beginner-friendly tasks
- [Feature Requests](https://github.com/cline/cline/discussions/categories/feature-requests) - Community ideas

### 🧩 Extending Cline?
Build tools and integrations that work with Cline:
- [MCP Development](./mcp/mcp-server-development-protocol.mdx) - Create custom tools
- [Tool Architecture](./getting-started/understanding-the-codebase.mdx#key-concepts--components) - How tools work
- [API Integration](./getting-started/understanding-the-codebase.mdx#ai-provider-integration-srccoreapiÂ) - Add AI providers

### 📚 Learning Resources
Understand Cline's advanced features and capabilities:
- [Context Management](./getting-started/understanding-context-management.mdx) - How context works
- [Cline Rules](./features/cline-rules.mdx) - Customizing behavior
- [Memory Bank](./prompting/cline-memory-bank.mdx) - Long-term project knowledge

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Cline Architecture                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│   VS Code       │   Core Engine   │      Frontend           │
│   Extension     │   (TypeScript)  │      (React)            │
│   • Commands    │   • AI APIs     │   • Chat Interface      │
│   • File Ops    │   • Tools       │   • Settings            │
│   • Terminal    │   • Context     │   • Task Management     │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 🚀 Quick Start

### For Contributors
```bash
git clone https://github.com/cline/cline.git
cd cline
npm run install:all
# Press F5 in VS Code to launch development version
```

### For MCP Developers
```bash
# Create your MCP server
npx @modelcontextprotocol/create-server my-tool
# Connect it to Cline via settings
```

### For AI Provider Integration
```bash
# Study existing providers
ls src/core/api/providers/
# Follow the ApiProvider interface pattern
```

## 🎓 Learning Path by Experience Level

### Beginner Developers
1. **Start**: [What is Cline?](./getting-started/what-is-cline.mdx)
2. **Next**: [Installation Guide](./getting-started/installing-cline.mdx)
3. **Then**: [Contributing Basics](../CONTRIBUTING.md)
4. **Practice**: Find a [good first issue](https://github.com/cline/cline/labels/good%20first%20issue)

### Experienced Developers
1. **Start**: [Understanding the Codebase](./getting-started/understanding-the-codebase.mdx)
2. **Next**: [Quick Reference](../CODEBASE_REFERENCE.md)
3. **Then**: Choose a focus area (Tools, AI, UI, MCP)
4. **Practice**: Take on [help wanted](https://github.com/cline/cline/labels/help%20wanted) issues

### AI/ML Engineers
1. **Start**: [AI Provider Integration](./getting-started/understanding-the-codebase.mdx#ai-provider-integration)
2. **Next**: [Context Management](./getting-started/understanding-context-management.mdx)
3. **Then**: [Prompt Engineering](./getting-started/understanding-the-codebase.mdx#core-source-src)
4. **Practice**: Add support for a new AI provider

### Frontend Developers
1. **Start**: [Webview Architecture](./getting-started/understanding-the-codebase.mdx#frontend-webview-ui)
2. **Next**: [Component Structure](./getting-started/understanding-the-codebase.mdx#for-frontend-developers)
3. **Then**: Explore `webview-ui/src/components/`
4. **Practice**: Improve UI components or add new features

## 🤝 Community

- **Discord**: [Join #contributors](https://discord.gg/cline) for real-time help
- **GitHub**: [Issues](https://github.com/cline/cline/issues) and [Discussions](https://github.com/cline/cline/discussions)
- **Reddit**: [r/cline](https://www.reddit.com/r/cline/) for community discussions

## 📞 Need Help?

- **Technical Questions**: GitHub Discussions or Discord #contributors
- **Bug Reports**: GitHub Issues with template
- **Feature Ideas**: GitHub Discussions in Feature Requests
- **Security Issues**: Use GitHub's private security reporting

---

*Ready to make Cline even better? Pick your path above and start contributing! 🚀*