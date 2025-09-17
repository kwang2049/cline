#!/usr/bin/env npx tsx

/**
 * Cline Direct API Client Script (Alternative Implementation)
 * 
 * NOTE: This is a direct LLM API client. For connecting to the full Cline system,
 * use cline-grpc-client.ts instead.
 * 
 * This script connects directly to Google's Gemini API and simulates a Cline-like
 * interface, but does NOT connect to the actual Cline system. It's useful for:
 * - Quick testing of LLM capabilities
 * - Standalone usage without running Cline server
 * - Understanding the difference between direct API and Cline system integration
 * 
 * For full Cline integration, use: npx tsx cline-grpc-client.ts
 * 
 * Usage:
 *   npx tsx cline-client.ts "Your request here"   # Direct LLM API
 *   npm run client "Your request here"            # Direct LLM API
 * 
 * Environment:
 *   GOOGLE_API_KEY - API key for Gemini 2.0 Flash LLM
 */

import { GoogleGenAI } from "@google/genai"

// Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCKeTIx2E-AB0MefXmiryC6YYma7R4xwvs"
const MODEL_ID = "gemini-2.0-flash-exp"

// Define types for our responses
interface TextChunk {
    type: "text"
    text: string
}

interface UsageChunk {
    type: "usage"
    inputTokens: number
    outputTokens: number
    totalCost?: number
}

type ResponseChunk = TextChunk | UsageChunk

/**
 * Direct API Client class (connects to Google Gemini directly, not Cline system)
 * For connecting to actual Cline system, use ClineGrpcClient from cline-grpc-client.ts
 */
class ClineClient {
    private client: GoogleGenAI

    constructor() {
        this.client = new GoogleGenAI({ apiKey: GOOGLE_API_KEY })
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

            // Create the request using the correct API format
            const result = await this.client.models.generateContentStream({
                model: MODEL_ID,
                contents: [
                    {
                        role: "user",
                        parts: [{ text: request }]
                    }
                ],
                config: {
                    systemInstruction: `You are Cline, an AI assistant that helps with coding and development tasks. 
You are helpful, precise, and provide clear explanations. Respond to the user's request in a helpful manner.`,
                    temperature: 0
                }
            })

            console.log("💭 Processing response...\n")
            
            let response = ""
            let inputTokens = 0
            let outputTokens = 0

            // Process the stream
            for await (const chunk of result) {
                const candidateText = chunk?.candidates?.[0]?.content?.parts?.[0]?.text
                if (candidateText) {
                    response += candidateText
                    process.stdout.write(candidateText) // Stream output in real-time
                }

                // Collect usage metadata
                if (chunk.usageMetadata) {
                    inputTokens = chunk.usageMetadata.promptTokenCount || 0
                    outputTokens = chunk.usageMetadata.candidatesTokenCount || 0
                }
            }

            console.log("\n")

            // Display usage information
            if (inputTokens > 0 || outputTokens > 0) {
                console.log("📊 Usage Stats:")
                console.log(`   Input tokens: ${inputTokens}`)
                console.log(`   Output tokens: ${outputTokens}`)
                console.log(`   Total tokens: ${inputTokens + outputTokens}`)
                
                // Estimate cost (Gemini 2.0 Flash pricing - approximate)
                const inputCost = (inputTokens / 1000000) * 0.075  // $0.075 per 1M input tokens
                const outputCost = (outputTokens / 1000000) * 0.30  // $0.30 per 1M output tokens
                const totalCost = inputCost + outputCost
                
                if (totalCost > 0) {
                    console.log(`   Estimated cost: $${totalCost.toFixed(6)}`)
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
        return {
            id: MODEL_ID,
            provider: "Google Gemini",
            description: "Gemini 2.0 Flash Experimental - Fast and capable AI model"
        }
    }
}

/**
 * Main function to handle command line usage
 */
async function main() {
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
        console.log("Usage: npx tsx cline-client.ts \"Your request here\"")
        console.log("Environment variable GOOGLE_API_KEY should be set")
        process.exit(1)
    }

    const request = args.join(" ")
    
    // Validate API key
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "") {
        console.error("❌ Error: GOOGLE_API_KEY environment variable is required")
        process.exit(1)
    }

    try {
        const client = new ClineClient()
        
        // Display model information
        const modelInfo = client.getModelInfo()
        console.log(`🚀 Cline Client initialized with model: ${modelInfo.id}`)
        
        // Send the request
        const response = await client.sendRequest(request)
        
        console.log("\n✅ Request completed successfully!")
        
    } catch (error) {
        console.error("❌ Failed to process request:", error)
        process.exit(1)
    }
}

// Export for programmatic use
export { ClineClient }

// Run main function if this script is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error("Fatal error:", error)
        process.exit(1)
    })
}