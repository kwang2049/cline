# Cline Client Scripts

This repository includes multiple client scripts to interact with Cline in different ways. Choose the approach that best fits your needs:

## 🎯 Quick Comparison

| Client Type | Connection | Use Case | Command |
|-------------|------------|----------|---------|
| **gRPC Client** | → Cline System → LLM | Full Cline integration with tools, memory, etc. | `npm run grpc-client` |
| **Direct API Client** | → LLM API directly | Quick LLM testing, standalone usage | `npm run client` |

## 🚀 gRPC Client (Recommended)

**Connects to the actual Cline system** - This is the proper way to integrate with Cline.

```bash
# STEP 0: Build the standalone version (one-time setup)
npm run compile-standalone

# STEP 1: Start Cline server (REQUIRED - keep this terminal open)
npm run test:sca-server

# STEP 2: In a NEW terminal, use the gRPC client
npm run grpc-client "Write a Python function to reverse a string"
```

**Important Notes:**
- 🏗️  **First time setup**: Run `npm run compile-standalone` to build required files
- ⚠️  **You MUST start the Cline server first** with `npm run test:sca-server`
- 🖥️  **Keep the server terminal open** - don't close it while using the client
- 🔄  **Use a separate terminal** for client commands

**Features:**
- ✅ Full Cline system integration 
- ✅ Access to Cline's tools and capabilities
- ✅ Task management and history
- ✅ Proper conversation memory
- ✅ Uses Cline's configured LLM (Gemini 2.0 Flash)

## 📡 Direct API Client (Alternative)

**Connects directly to Google's Gemini API** - Bypasses Cline system.

```bash
npm run client "What is TypeScript?"
```

**Features:**
- ⚡ Faster for simple queries
- 🔧 No server setup required
- 📊 Direct token usage tracking
- ⚠️  Does NOT use Cline's tools or memory

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up API key:**
   ```bash
   export GOOGLE_API_KEY="your-api-key-here"
   ```
   
   Or use the included test key (already configured).

## Usage Examples

### gRPC Client (Cline System)

```bash
# STEP 0: Build standalone version (first time only)
npm run compile-standalone

# STEP 1: Start Cline server (keep this terminal open)
npm run test:sca-server

# STEP 2: Open a NEW terminal and send requests to Cline system
npm run grpc-client "Create a React component for a todo list"
npm run grpc-client "Debug this Python error: IndexError: list index out of range"

# STEP 3: Additional commands (also in the NEW terminal)
npm run grpc-client --history  # Get task history
npm run grpc-client --cancel   # Cancel current task
```

**⚠️ Common Issues:**
- **"Standalone build not found"**: Run `npm run compile-standalone` first
- **"ECONNREFUSED" error**: Make sure server is running and shows "Cline gRPC Server is running!"
- **Server doesn't start**: Check that the build step completed successfully

### Direct API Client

```bash
# Quick LLM queries (no server required)
npm run client "Explain async/await in JavaScript"
npm run client "Write a SQL query to find duplicates"

# Test setup
npm run test-client

# See interactive demo
npm run demo-client
```

## Architecture

### gRPC Client Architecture
```
User Input → gRPC Client → Cline TaskService → Cline Controller → LLM API → Full Cline Response
```

### Direct API Client Architecture  
```
User Input → Direct Client → LLM API → Simple Response
```

## Configuration

### gRPC Client
- **Server**: `CLINE_GRPC_HOST` (default: `127.0.0.1:26040`)
- **API Key**: Uses Cline's configured key
- **Prerequisites**: Cline server must be running

### Direct API Client
- **API Key**: `GOOGLE_API_KEY` environment variable
- **Model**: `gemini-2.0-flash-exp`
- **Prerequisites**: Internet connection only

## Troubleshooting

### gRPC Client Issues

**"Failed to connect to Cline server"**
```bash
# Make sure Cline server is running
npm run test:sca-server
```

**"TaskService not found"**
```bash
# Protobuf files may be missing
npm run protos  # Build protobuf definitions
```

### Direct API Client Issues

**"API key is required"**
```bash
export GOOGLE_API_KEY="your-key-here"
```

**"Network errors"**
- Check internet connectivity
- Verify API key is valid

## Output Examples

### gRPC Client Output
```
🚀 Cline gRPC Client initialized
   Server: 127.0.0.1:26040
   Status: Connected
   Description: Cline gRPC TaskService - Full Cline system integration

🤖 Sending request to Cline system...
📝 Request: "Write a Python function to reverse a string"

✅ Task created successfully in Cline system
📊 Task initiated - Cline is processing your request...

💡 To see the full conversation and responses:
   - Open Cline in VS Code
   - Check the task history
   - Or use the Cline web interface if available
```

### Direct API Client Output
```
🚀 Cline Client initialized with model: gemini-2.0-flash-exp

🤖 Sending request to Cline (gemini-2.0-flash-exp)...
📝 Request: "What is TypeScript?"

💭 Processing response...

TypeScript is a strongly typed programming language that builds on JavaScript...

📊 Usage Stats:
   Input tokens: 12
   Output tokens: 245
   Estimated cost: $0.000074

✅ Request completed successfully!
```

## File Overview

- **`cline-grpc-client.ts`** - Main gRPC client (connects to Cline system)
- **`cline-client.ts`** - Direct API client (connects to LLM directly)  
- **`cline-client-advanced.ts`** - Advanced direct client with Cline infrastructure
- **`test-client.ts`** - Setup validation script
- **`demo-client.ts`** - Interactive demonstration

## Contributing

When adding new features, consider:
- Does this need full Cline integration? → Use gRPC client
- Is this a simple LLM query? → Direct API client may suffice
- Always update both approaches when relevant

## License

This project follows the same license as the main Cline repository.