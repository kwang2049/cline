#!/usr/bin/env npx tsx

/**
 * Cline Client Example (Advanced)
 * 
 * This script demonstrates how to integrate with Cline's existing infrastructure
 * using the internal GeminiHandler. This approach provides more features but
 * requires the full Cline build environment.
 * 
 * Usage:
 *   npm run compile
 *   npx tsx cline-client-advanced.ts "Your request here"
 */

import { GeminiHandler } from "./src/core/api/providers/gemini"
import { ApiStream } from "./src/core/api/transform/stream"
import type { Anthropic } from "@anthropic-ai/sdk"

// Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCKeTIx2E-AB0MefXmiryC6YYma7R4xwvs"
const MODEL_ID = "gemini-2.0-flash-exp"

/**
 * Advanced Cline Client using internal Cline infrastructure
 */
class AdvancedClineClient {
    private geminiHandler: GeminiHandler

    constructor() {
        this.geminiHandler = new GeminiHandler({
            geminiApiKey: GOOGLE_API_KEY,
            apiModelId: MODEL_ID,
        })
    }

    /**
     * Send a text request to Cline and get the response
     * @param request The text request to send
     * @returns Promise<string> The response from Cline
     */
    async sendRequest(request: string): Promise<string> {
        try {
            console.log(`\n🤖 Sending request to Cline (${MODEL_ID})...`)
            console.log(`📝 Request: "${request}"\n`)

            // Convert the text request to the format expected by the API
            const messages: Anthropic.Messages.MessageParam[] = [
                {
                    role: "user",
                    content: request
                }
            ]

            // System prompt for Cline-style responses
            const systemPrompt = `You are Cline, an AI assistant that helps with coding and development tasks. 
You are helpful, precise, and provide clear explanations. Respond to the user's request in a helpful manner.`

            // Create the message stream
            const stream: ApiStream = this.geminiHandler.createMessage(systemPrompt, messages)

            // Collect the response
            let response = ""
            let usage: any = null

            console.log("💭 Processing response...\n")
            
            for await (const chunk of stream) {
                switch (chunk.type) {
                    case "text":
                        response += chunk.text
                        process.stdout.write(chunk.text) // Stream output in real-time
                        break
                    case "reasoning":
                        console.log(`\n🧠 Reasoning: ${chunk.reasoning}\n`)
                        break
                    case "usage":
                        usage = chunk
                        break
                }
            }

            console.log("\n")

            // Display usage information if available
            if (usage) {
                console.log("📊 Usage Stats:")
                console.log(`   Input tokens: ${usage.inputTokens}`)
                console.log(`   Output tokens: ${usage.outputTokens}`)
                if (usage.totalCost) {
                    console.log(`   Total cost: $${usage.totalCost.toFixed(6)}`)
                }
                if (usage.cacheReadTokens) {
                    console.log(`   Cache read tokens: ${usage.cacheReadTokens}`)
                }
                if (usage.thoughtsTokenCount) {
                    console.log(`   Thoughts tokens: ${usage.thoughtsTokenCount}`)
                }
            }

            return response

        } catch (error) {
            console.error("❌ Error sending request to Cline:", error)
            throw error
        }
    }

    /**
     * Get information about the current model
     */
    getModelInfo() {
        const model = this.geminiHandler.getModel()
        return {
            id: model.id,
            info: model.info
        }
    }
}

/**
 * Main function to handle command line usage
 */
async function main() {
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
        console.log("Usage: npx tsx cline-client-advanced.ts \"Your request here\"")
        console.log("Environment variable GOOGLE_API_KEY should be set")
        console.log("\nNote: This script requires the full Cline build environment.")
        console.log("Run 'npm run compile' first to build the necessary components.")
        process.exit(1)
    }

    const request = args.join(" ")
    
    // Validate API key
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "") {
        console.error("❌ Error: GOOGLE_API_KEY environment variable is required")
        process.exit(1)
    }

    try {
        const client = new AdvancedClineClient()
        
        // Display model information
        const modelInfo = client.getModelInfo()
        console.log(`🚀 Advanced Cline Client initialized with model: ${modelInfo.id}`)
        
        // Send the request
        const response = await client.sendRequest(request)
        
        console.log("\n✅ Request completed successfully!")
        
    } catch (error) {
        console.error("❌ Failed to process request:", error)
        console.log("\n💡 If you see TypeScript or module errors, make sure to:")
        console.log("   1. Run 'npm install' to install dependencies")
        console.log("   2. Run 'npm run compile' to build the project")
        console.log("   3. Use the simple client 'cline-client.ts' for a dependency-free version")
        process.exit(1)
    }
}

// Export for programmatic use
export { AdvancedClineClient }

// Run main function if this script is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error("Fatal error:", error)
        process.exit(1)
    })
}