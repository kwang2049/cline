# Cline CLI Client

A command-line interface for Cline that connects to the standalone gRPC server.

## Prerequisites

1. **Start the standalone server first:**
   ```bash
   npm run compile-standalone
   node dist-standalone/standalone.js
   ```

2. **Build the CLI:**
   ```bash
   npm run build:cli
   ```

## Usage

### Run the CLI
```bash
npm run cli
```

Or directly:
```bash
node dist/cli/cli.js
```

### Available Commands

- `task <description>` - Create a new task with the given description
- `status` - Show the current task status and recent messages
- `clear` - Clear the current task
- `help` - Show available commands
- `quit` or `exit` - Exit the CLI

### Examples

```bash
cline> task Create a simple React component
✅ Task created with ID: abc123
Use "status" to check progress

cline> status
Task Status (abc123):
State: RUNNING
Description: Create a simple React component

Recent messages:
1. 🤖 Cline: I'll help you create a simple React component...
2. 👤 User: Can you make it a button component?
3. 🤖 Cline: Sure! Here's a simple button component...

cline> clear
Current task cleared
```

## Configuration

The CLI connects to the standalone server on `127.0.0.1:50051` by default. You can change this by setting the `PROTOBUS_ADDRESS` environment variable:

```bash
PROTOBUS_ADDRESS=localhost:50052 npm run cli
```

## Architecture

The CLI client:
1. Connects to the standalone gRPC server using `nice-grpc`
2. Uses the same TaskService API as the VSCode extension
3. Provides a simple interactive interface for creating and monitoring tasks
4. Leverages the existing Cline infrastructure without requiring VSCode

This demonstrates how you can build alternative interfaces (CLI, web, mobile, etc.) that use the same powerful Cline backend. 