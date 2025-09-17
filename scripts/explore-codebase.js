#!/usr/bin/env node

/**
 * Codebase Explorer - A simple tool to help newcomers navigate the Cline codebase
 * Usage: node scripts/explore-codebase.js [component]
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS = {
  'core': {
    description: 'Core business logic and task execution',
    path: 'src/core',
    keyFiles: [
      'src/core/controller/index.ts',
      'src/core/task/TaskState.ts',
      'src/core/task/ToolExecutor.ts',
      'src/core/context/context-management/ContextManager.ts'
    ]
  },
  'tools': {
    description: 'Tool implementations (file, terminal, browser, etc.)',
    path: 'src/core/task/tools',
    keyFiles: [
      'src/core/task/tools/file.ts',
      'src/core/task/tools/terminal.ts',
      'src/core/task/tools/browser.ts'
    ]
  },
  'ai': {
    description: 'AI provider integrations',
    path: 'src/core/api/providers',
    keyFiles: [
      'src/core/api/providers/anthropic.ts',
      'src/core/api/providers/openai.ts',
      'src/core/api/index.ts'
    ]
  },
  'ui': {
    description: 'React frontend components',
    path: 'webview-ui/src',
    keyFiles: [
      'webview-ui/src/App.tsx',
      'webview-ui/src/components/Chat/Chat.tsx',
      'webview-ui/src/components/settings/ApiOptions.tsx'
    ]
  },
  'vscode': {
    description: 'VS Code extension integration',
    path: 'src/hosts/vscode',
    keyFiles: [
      'src/extension.ts',
      'src/hosts/vscode/VscodeWebviewProvider.ts',
      'src/hosts/vscode/VscodeDiffViewProvider.ts'
    ]
  },
  'mcp': {
    description: 'Model Context Protocol integration',
    path: 'src/core/controller/mcp',
    keyFiles: [
      'src/core/controller/mcp/index.ts'
    ]
  }
};

function showHelp() {
  console.log('🔍 Cline Codebase Explorer\n');
  console.log('Available components to explore:\n');
  
  Object.entries(COMPONENTS).forEach(([name, info]) => {
    console.log(`  ${name.padEnd(8)} - ${info.description}`);
  });
  
  console.log('\nUsage:');
  console.log('  node scripts/explore-codebase.js [component]');
  console.log('  node scripts/explore-codebase.js core');
  console.log('  node scripts/explore-codebase.js           # Show all components');
  console.log('\nAlso check out:');
  console.log('  📚 DEVELOPER_GUIDE.md - Full developer orientation');
  console.log('  📋 CODEBASE_REFERENCE.md - Quick reference');
  console.log('  📖 docs/getting-started/understanding-the-codebase.mdx - Architecture deep dive');
}

function exploreComponent(componentName) {
  const component = COMPONENTS[componentName];
  if (!component) {
    console.log(`❌ Unknown component: ${componentName}`);
    console.log(`Available: ${Object.keys(COMPONENTS).join(', ')}`);
    return;
  }

  console.log(`🔍 Exploring: ${componentName.toUpperCase()}`);
  console.log(`📝 ${component.description}\n`);
  
  console.log(`📁 Main directory: ${component.path}`);
  
  if (fs.existsSync(component.path)) {
    console.log(`   Status: ✅ Found`);
  } else {
    console.log(`   Status: ❌ Not found (this might be expected in some setups)`);
  }
  
  console.log('\n📄 Key files to examine:');
  component.keyFiles.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`   ${status} ${filePath}`);
  });
  
  console.log('\n💡 Next steps:');
  console.log(`   1. Open VS Code and navigate to ${component.path}`);
  console.log(`   2. Start with the key files listed above`);
  console.log(`   3. Use VS Code's "Go to Definition" (F12) to explore connections`);
  console.log(`   4. Check the tests folder for usage examples`);
}

function showOverview() {
  console.log('🏗️ Cline Codebase Overview\n');
  
  Object.entries(COMPONENTS).forEach(([name, info]) => {
    const exists = fs.existsSync(info.path);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${name.padEnd(8)} | ${info.path.padEnd(25)} | ${info.description}`);
  });
  
  console.log('\n🚀 Quick start:');
  console.log('  1. Run: npm run install:all');
  console.log('  2. Run: npm run watch (in one terminal)');
  console.log('  3. Press F5 in VS Code to launch development version');
  console.log('  4. Explore individual components with: node scripts/explore-codebase.js [component]');
}

// Main execution
const component = process.argv[2];

if (!component) {
  showOverview();
} else if (component === 'help' || component === '--help' || component === '-h') {
  showHelp();
} else {
  exploreComponent(component);
}