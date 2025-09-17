#!/usr/bin/env npx tsx

/**
 * Cline Client Demo Script
 * 
 * This script demonstrates how the Cline client would work with actual API calls
 * by providing a mock simulation of the interaction.
 */

import { ClineClient } from './cline-client'

/**
 * Mock demonstration of client functionality
 */
async function demonstrateClient() {
    console.log("🎭 Cline Client Demo - Simulated Interaction\n")
    
    try {
        // Initialize client
        const client = new ClineClient()
        const modelInfo = client.getModelInfo()
        
        console.log(`🚀 Cline Client initialized with model: ${modelInfo.id}`)
        console.log(`   Provider: ${modelInfo.provider}`)
        console.log(`   Description: ${modelInfo.description}\n`)
        
        // Simulate a series of interactions
        const interactions = [
            {
                request: "Hello, can you help me understand what you do?",
                response: `Hello! I'm Cline, an AI assistant designed to help with coding and development tasks. Here's what I can do for you:

🔧 **Development Assistance**
- Write, review, and debug code in multiple programming languages
- Explain programming concepts and best practices  
- Help with software architecture and design patterns
- Assist with API integration and documentation

💡 **Problem Solving**
- Troubleshoot technical issues and errors
- Suggest optimization strategies
- Guide you through complex development challenges
- Provide step-by-step implementation guidance

🚀 **Project Support**
- Help plan and structure development projects
- Review code for security and performance
- Assist with testing strategies and implementation
- Support with deployment and DevOps practices

I'm powered by Google's Gemini 2.0 Flash model, which gives me strong reasoning capabilities and up-to-date knowledge. Feel free to ask me anything about coding, development, or technical challenges you're facing!`,
                tokens: { input: 15, output: 187, cost: 0.000057 }
            },
            {
                request: "Write a Python function to reverse a string",
                response: `Here's a Python function to reverse a string with a few different approaches:

\`\`\`python
def reverse_string(s):
    """
    Reverse a string using Python's slicing.
    
    Args:
        s (str): The string to reverse
        
    Returns:
        str: The reversed string
    """
    return s[::-1]

# Alternative approaches:

def reverse_string_loop(s):
    """Reverse using a loop"""
    reversed_str = ""
    for char in s:
        reversed_str = char + reversed_str
    return reversed_str

def reverse_string_builtin(s):
    """Reverse using built-in functions"""
    return ''.join(reversed(s))

def reverse_string_recursive(s):
    """Reverse using recursion"""
    if len(s) <= 1:
        return s
    return s[-1] + reverse_string_recursive(s[:-1])

# Example usage:
if __name__ == "__main__":
    text = "Hello, World!"
    print(f"Original: {text}")
    print(f"Reversed: {reverse_string(text)}")
    # Output: !dlroW ,olleH
\`\`\`

The first approach using slicing (\`s[::-1]\`) is the most Pythonic and efficient way. The step value of \`-1\` tells Python to step through the string backwards, effectively reversing it.`,
                tokens: { input: 12, output: 245, cost: 0.000074 }
            }
        ]
        
        for (let i = 0; i < interactions.length; i++) {
            const interaction = interactions[i]
            
            console.log(`\n${'='.repeat(60)}`)
            console.log(`📝 Example ${i + 1}: ${interaction.request}`)
            console.log(`${'='.repeat(60)}\n`)
            
            // Simulate the API call process
            console.log(`🤖 Sending request to Cline (${modelInfo.id})...`)
            console.log(`📝 Request: "${interaction.request}"\n`)
            console.log("💭 Processing response...\n")
            
            // Simulate streaming response
            const words = interaction.response.split(' ')
            for (let j = 0; j < words.length; j++) {
                process.stdout.write(words[j] + ' ')
                // Small delay to simulate streaming
                await new Promise(resolve => setTimeout(resolve, 10))
            }
            
            console.log("\n")
            
            // Show usage stats
            console.log("📊 Usage Stats:")
            console.log(`   Input tokens: ${interaction.tokens.input}`)
            console.log(`   Output tokens: ${interaction.tokens.output}`)
            console.log(`   Total tokens: ${interaction.tokens.input + interaction.tokens.output}`)
            console.log(`   Estimated cost: $${interaction.tokens.cost.toFixed(6)}`)
            
            console.log("\n✅ Request completed successfully!")
        }
        
        console.log(`\n${'='.repeat(60)}`)
        console.log("🎉 Demo completed successfully!")
        console.log(`${'='.repeat(60)}`)
        
        console.log("\n📋 To try with real API calls:")
        console.log("1. Ensure you have internet connectivity")
        console.log("2. Set a valid GOOGLE_API_KEY environment variable")
        console.log("3. Run: npm run client \"Your actual question here\"")
        
    } catch (error) {
        console.error("❌ Demo failed:", error)
    }
}

/**
 * Show what a real API response would look like
 */
function showRealApiExample() {
    console.log("\n🔍 Real API Call Example:")
    console.log("```bash")
    console.log("$ GOOGLE_API_KEY='your-key' npm run client \"Explain TypeScript interfaces\"")
    console.log("")
    console.log("🚀 Cline Client initialized with model: gemini-2.0-flash-exp")
    console.log("")
    console.log("🤖 Sending request to Cline (gemini-2.0-flash-exp)...")
    console.log('📝 Request: "Explain TypeScript interfaces"')
    console.log("")
    console.log("💭 Processing response...")
    console.log("")
    console.log("TypeScript interfaces are a powerful feature that allows you to define")
    console.log("the structure of objects, providing type safety and better developer")
    console.log("experience. Here's what you need to know...")
    console.log("")
    console.log("📊 Usage Stats:")
    console.log("   Input tokens: 8")
    console.log("   Output tokens: 156")
    console.log("   Total tokens: 164")
    console.log("   Estimated cost: $0.000047")
    console.log("")
    console.log("✅ Request completed successfully!")
    console.log("```")
}

/**
 * Main demo function
 */
async function main() {
    await demonstrateClient()
    showRealApiExample()
}

// Run if executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error("Demo failed:", error)
        process.exit(1)
    })
}