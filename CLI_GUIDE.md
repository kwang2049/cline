# Creating a CLI Client for Cline

This guide shows you how to create a command-line interface for Cline using the existing standalone gRPC server infrastructure.

## Overview

Cline's architecture separates the AI logic from the user interface, making it possible to create alternative interfaces like CLI, web, or mobile apps that use the same powerful backend.

## Architecture

```
┌─────────────────┐    gRPC     ┌──────────────────┐
│   CLI Client    │ ──────────► │  Standalone      │
│   (this guide)  │             │  Server          │
└─────────────────┘             └──────────────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │  Cline Core      │
                               │  (AI Logic)      │
                               └──────────────────┘
```

## Prerequisites

1. **Clone and setup Cline:**
   ```bash
   git clone https://github.com/cline/cline.git
   cd cline
   npm run install:all
   ```

2. **Build the standalone server:**
   ```bash
   npm run compile-standalone
   ```

## Step 1: Start the Standalone Server

The standalone server provides all of Cline's functionality via gRPC:

```bash
# Start the server
node dist-standalone/standalone.js

# You should see: "gRPC server listening on 127.0.0.1:50051"
```

## Step 2: Create a CLI Client

### Basic CLI Structure

```typescript
#!/usr/bin/env node

import { createChannel, createClient } from "nice-grpc"
import { readline } from "node:readline"
import { stdin as input, stdout as output } from "node:process"
import chalk from "chalk"
import { TaskServiceDefinition } from "@shared/proto/task"
import { NewTaskRequest } from "@shared/proto/task"
import { EmptyRequest, StringRequest } from "@shared/proto/common"

class ClineCLI {
  private taskClient: any
  private rl: readline.Interface

  constructor() {
    const address = process.env.PROTOBUS_ADDRESS || "127.0.0.1:50051"
    const channel = createChannel(address)
    this.taskClient = createClient(TaskServiceDefinition, channel)
    
    this.rl = readline.createInterface({
      input,
      output,
      prompt: chalk.blue('cline> ')
    })
  }

  async start() {
    console.log(chalk.green('🤖 Cline CLI Client'))
    console.log(chalk.gray('Type "help" for available commands\n'))

    this.rl.prompt()

    this.rl.on('line', async (line: string) => {
      const input = line.trim()
      
      if (input === 'quit' || input === 'exit') {
        this.rl.close()
        return
      }

      if (input === 'help') {
        this.showHelp()
      } else if (input.startsWith('task ')) {
        await this.createTask(input.substring(5))
      } else if (input) {
        await this.createTask(input)
      }

      this.rl.prompt()
    })
  }

  private showHelp() {
    console.log(chalk.cyan('\nAvailable commands:'))
    console.log(chalk.white('  task <description>  - Create a new task'))
    console.log(chalk.white('  help                - Show this help'))
    console.log(chalk.white('  quit/exit           - Exit the CLI\n'))
  }

  private async createTask(description: string) {
    try {
      console.log(chalk.yellow(`Creating task: ${description}`))
      
      const request = NewTaskRequest.create({
        text: description,
        images: []
      })

      const response = await this.taskClient.newTask(request)
      console.log(chalk.green(`✅ Task created with ID: ${response.taskId}`))
      
    } catch (error) {
      console.error(chalk.red(`❌ Error creating task: ${error}`))
    }
  }
}

// Start the CLI
async function main() {
  const cli = new ClineCLI()
  await cli.start()
}

main().catch((error) => {
  console.error(chalk.red(`Fatal error: ${error}`))
  process.exit(1)
})
```

## Step 3: Build and Run

### Add Build Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "build:cli": "node esbuild.js --cli",
    "cli": "node dist/cli/cli.js"
  }
}
```

### Update esbuild Configuration

Add CLI support to `esbuild.js`:
```javascript
const cli = process.argv.includes("--cli")

// CLI-specific configuration
const cliConfig = {
  ...baseConfig,
  entryPoints: ["src/cli/cli.ts"],
  outfile: `${destDir}/cli/cli.js`,
  external: ["vscode"],
}

async function main() {
  let config
  if (cli) {
    config = cliConfig
  } else if (standalone) {
    config = standaloneConfig
  } else {
    config = extensionConfig
  }
  // ... rest of function
}
```

### Build and Run

```bash
# Build the CLI
npm run build:cli

# Run the CLI
npm run cli
```

## Available gRPC Services

The standalone server exposes these services:

### TaskService
- `newTask(request)` - Create a new AI task
- `askResponse(request)` - Send a message to the current task
- `clearTask(request)` - Clear the current task
- `getTaskState(request)` - Get current task status
- `cancelTask(request)` - Cancel the current task

### FileService
- `readFile(request)` - Read file contents
- `writeFile(request)` - Write file contents
- `listFiles(request)` - List directory contents
- `createFile(request)` - Create a new file
- `deleteFile(request)` - Delete a file

### StateService
- `getState(request)` - Get application state
- `setState(request)` - Set application state

### ModelsService
- `getModels(request)` - Get available AI models
- `setModel(request)` - Set the active model

## Advanced Features

### Streaming Responses

Some methods support streaming responses:

```typescript
const cancel = await this.taskClient.askResponse(request, {
  onResponse: (response) => {
    console.log('Received:', response.content)
  },
  onComplete: () => {
    console.log('Stream completed')
  },
  onError: (error) => {
    console.error('Stream error:', error)
  }
})

// Cancel the stream
cancel()
```

### File Operations

```typescript
// Read a file
const fileContent = await this.fileClient.readFile(
  StringRequest.create({ value: "src/main.ts" })
)
console.log(fileContent.content)

// Write a file
await this.fileClient.writeFile({
  path: "output.txt",
  content: "Hello, World!"
})
```

### State Management

```typescript
// Get current state
const state = await this.stateClient.getState(EmptyRequest.create({}))
console.log('Current model:', state.model)

// Set model
await this.stateClient.setModel(
  StringRequest.create({ value: "claude-3-5-sonnet-20241022" })
)
```

## Integration Examples

### Web Application

```typescript
// Connect from a web app
const channel = createChannel("localhost:50051")
const taskClient = createClient(TaskServiceDefinition, channel)

// Create task from web UI
const response = await taskClient.newTask(
  NewTaskRequest.create({ text: "User input from web form" })
)
```

### Mobile App

```typescript
// Connect from a mobile app
const channel = createChannel("192.168.1.100:50051") // Server IP
const taskClient = createClient(TaskServiceDefinition, channel)
```

### CI/CD Pipeline

```bash
#!/bin/bash
# Use Cline in CI/CD

# Start server
node dist-standalone/standalone.js &
SERVER_PID=$!

# Wait for server
sleep 2

# Run CLI commands
echo "task Generate API documentation" | node dist/cli/cli.js

# Cleanup
kill $SERVER_PID
```

## Benefits of This Approach

1. **Separation of Concerns**: UI logic is separate from AI logic
2. **Multiple Interfaces**: Same backend can power CLI, web, mobile, etc.
3. **Scalability**: Can run multiple clients against one server
4. **Extensibility**: Easy to add new features to the backend
5. **Reusability**: Existing Cline infrastructure is leveraged

## Troubleshooting

### Connection Issues
- Ensure the standalone server is running
- Check the `PROTOBUS_ADDRESS` environment variable
- Verify firewall settings

### Build Issues
- Run `npm run protos` to regenerate protobuf files
- Check that all dependencies are installed
- Verify TypeScript configuration

### Runtime Issues
- Check server logs for errors
- Verify gRPC service definitions match
- Ensure proper error handling in client code

## Next Steps

1. **Add More Commands**: Implement file operations, model switching, etc.
2. **Improve UX**: Add progress bars, better formatting, autocomplete
3. **Add Configuration**: Support for config files, environment variables
4. **Add Plugins**: Extensible command system
5. **Add Tests**: Unit and integration tests for the CLI

This approach demonstrates how Cline's modular architecture enables creating alternative interfaces while reusing the powerful AI capabilities. 

## Command:

Start the server:
```
export OPENROUTER_API_KEY=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 && export CLINE_API_PROVIDER=openrouter && export CLINE_MODEL_ID=deepseek/deepseek-chat-v3-0324:free && npm run standalone-simple
```

Under another terminal:
```
sleep 3 && export OPENROUTER_API_KEY=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 && export CLINE_API_PROVIDER=openrouter && export CLINE_MODEL_ID=deepseek/deepseek-chat-v3-0324:free && npm run cli
```