# Cline Client Script

This is a client script to connect to Cline with a function that takes a text request as input and forwards Cline's output back. The script uses the Gemini 2.0 Flash LLM as the underlying AI model.

## Features

- **Direct API Integration**: Uses Google's Gemini 2.0 Flash model through the official API
- **Streaming Responses**: Real-time streaming of AI responses 
- **Usage Tracking**: Displays token usage and estimated costs
- **Easy to Use**: Simple command-line interface
- **Programmatic API**: Can be imported and used in other Node.js applications

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **Google API Key** for Gemini 2.0 Flash
3. **Internet Connection** to access Google's Gemini API

## Installation

1. Clone this repository and navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Set the environment variable `GOOGLE_API_KEY` with your Google AI API key:

```bash
export GOOGLE_API_KEY="your-api-key-here"
```

Or you can set it inline when running the script.

**Note**: The script includes the test API key `AIzaSyCKeTIx2E-AB0MefXmiryC6YYma7R4xwvs` as a fallback, but you should use your own API key for production use.

## Usage

### Command Line Usage

```bash
# Using npm script
npm run client "Hello, can you help me understand what you do?"

# Using npx directly
npx tsx cline-client.ts "What is TypeScript?"

# With custom API key
GOOGLE_API_KEY="your-key" npx tsx cline-client.ts "Explain async/await in JavaScript"
```

### Programmatic Usage

```typescript
import { ClineClient } from './cline-client'

async function example() {
    const client = new ClineClient()
    
    // Get model information
    const modelInfo = client.getModelInfo()
    console.log('Model:', modelInfo)
    
    // Send a request
    const response = await client.sendRequest("Explain the concept of closures in JavaScript")
    console.log('Response:', response)
}

example().catch(console.error)
```

## API Reference

### ClineClient Class

#### Constructor
```typescript
constructor()
```
Creates a new ClineClient instance using the `GOOGLE_API_KEY` environment variable.

#### Methods

##### `sendRequest(request: string): Promise<string>`
Sends a text request to Cline and returns the response.

**Parameters:**
- `request` (string): The text request to send to the AI

**Returns:**
- Promise that resolves to the AI's response as a string

**Example:**
```typescript
const response = await client.sendRequest("Write a hello world function in Python")
```

##### `getModelInfo(): object`
Returns information about the current model being used.

**Returns:**
- Object containing model ID, provider, and description

## Output Format

The client provides rich console output including:

- 🤖 Request confirmation with model information
- 📝 Display of the user's request  
- 💭 Real-time streaming of the AI response
- 📊 Usage statistics including:
  - Input token count
  - Output token count  
  - Total token count
  - Estimated cost (based on current Gemini pricing)

## Example Output

```
🚀 Cline Client initialized with model: gemini-2.0-flash-exp

🤖 Sending request to Cline (gemini-2.0-flash-exp)...
📝 Request: "What is TypeScript?"

💭 Processing response...

TypeScript is a strongly typed programming language that builds on JavaScript...

📊 Usage Stats:
   Input tokens: 12
   Output tokens: 245
   Total tokens: 257
   Estimated cost: $0.000074

✅ Request completed successfully!
```

## Error Handling

The client includes comprehensive error handling:

- API key validation
- Network error handling  
- Invalid response handling
- Clear error messages with debugging information

## Cost Information

The client estimates costs based on current Gemini 2.0 Flash pricing:
- Input tokens: $0.075 per 1M tokens
- Output tokens: $0.30 per 1M tokens

*Note: Prices are estimates and may change. Refer to Google's official pricing for current rates.*

## Troubleshooting

### "API key is required" Error
Make sure the `GOOGLE_API_KEY` environment variable is set with a valid Google AI API key.

### Network Errors
Ensure you have internet connectivity and the Google AI API is accessible from your environment.

### Model Not Found Errors
The script uses `gemini-2.0-flash-exp` model. If this model is not available, you can modify the `MODEL_ID` constant in the script.

## Customization

You can customize the client by modifying these constants in `cline-client.ts`:

- `MODEL_ID`: Change the Gemini model (default: "gemini-2.0-flash-exp")
- System prompt: Modify the system instruction to change Cline's behavior
- Cost estimates: Update pricing information if rates change

## Contributing

Feel free to submit issues or pull requests to improve the client script.

## License

This project follows the same license as the main Cline repository.