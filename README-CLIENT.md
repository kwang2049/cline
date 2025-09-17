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
# Start Cline server first
npm run test:sca-server

# Then use the gRPC client (in another terminal)
npm run grpc-client "Write a Python function to reverse a string"
```

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
# Start Cline server (required first step)
npm run test:sca-server

# Send requests to Cline system
npm run grpc-client "Create a React component for a todo list"
npm run grpc-client "Debug this Python error: IndexError: list index out of range"

# Get task history
npm run grpc-client --history

# Cancel current task
npm run grpc-client --cancel
```

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