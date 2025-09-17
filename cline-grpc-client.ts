#!/usr/bin/env npx tsx

/**
 * Cline gRPC Client Script
 * 
 * A client script that connects to the Cline system via gRPC services
 * instead of directly to LLM APIs. This forwards text requests to Cline's
 * TaskService and receives responses through the proper Cline infrastructure.
 * 
 * Usage:
 *   npx tsx cline-grpc-client.ts "Your request here"
 *   npm run grpc-client "Your request here"
 * 
 * Prerequisites:
 *   - Cline gRPC server must be running (use npm run test:sca-server)
 *   - Server should be running on localhost:26040 (default ProtoBus port)
 */

import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import * as path from "path"

// Configuration
const GRPC_SERVER_HOST = process.env.CLINE_GRPC_HOST || "127.0.0.1:26040"
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCKeTIx2E-AB0MefXmiryC6YYma7R4xwvs"

// Proto file paths
const PROTO_PATH = path.join(__dirname, "proto")
const TASK_PROTO_PATH = path.join(PROTO_PATH, "cline", "task.proto")
const COMMON_PROTO_PATH = path.join(PROTO_PATH, "cline", "common.proto")

/**
 * Cline gRPC Client class that connects to the Cline system
 */
class ClineGrpcClient {
    private taskClient: any
    private isConnected: boolean = false
    private initPromise: Promise<void>

    constructor() {
        this.initPromise = this.initializeClient()
    }

    /**
     * Ensure the client is initialized before use
     */
    async ensureInitialized(): Promise<void> {
        await this.initPromise
    }

    /**
     * Initialize the gRPC client connection to Cline's TaskService
     */
    private async initializeClient() {
        try {
            console.log("📡 Initializing connection to Cline gRPC server...")
            
            // Load the protobuf definitions
            const packageDefinition = protoLoader.loadSync([TASK_PROTO_PATH, COMMON_PROTO_PATH], {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [PROTO_PATH]
            })

            // Load the gRPC package
            const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any
            
            // Create the TaskService client
            if (protoDescriptor.cline && protoDescriptor.cline.TaskService) {
                this.taskClient = new protoDescriptor.cline.TaskService(
                    GRPC_SERVER_HOST,
                    grpc.credentials.createInsecure()
                )
                
                // Test the connection by attempting to get total tasks size (lightweight call)
                await this.testConnection()
                
                console.log(`✅ Connected to Cline TaskService at ${GRPC_SERVER_HOST}`)
                this.isConnected = true
            } else {
                throw new Error("TaskService not found in protobuf definition")
            }

        } catch (error) {
            this.isConnected = false
            console.log("⚠️  Connection test failed - Cline server appears to be offline")
            console.log("💡 Make sure the Cline gRPC server is running:")
            console.log("   npm run test:sca-server")
            console.log("   (This starts the standalone Cline server)")
            
            // Re-throw the error to be handled by the caller
            throw error
        }
    }

    /**
     * Test the gRPC connection by making a lightweight call
     */
    private async testConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Connection timeout - Cline server may not be running"))
            }, 5000) // 5 second timeout

            // Use a simple call to test connectivity
            const testRequest = {
                metadata: {
                    request_id: this.generateRequestId(),
                    timestamp: Date.now().toString()
                }
            }

            this.taskClient.getTotalTasksSize(testRequest, (error: any, response: any) => {
                clearTimeout(timeout)
                if (error) {
                    if (error.code === 14) { // grpc.status.UNAVAILABLE
                        reject(new Error("Cline server is not running. Please start it with: npm run test:sca-server"))
                    } else {
                        reject(new Error(`Connection test failed: ${error.message}`))
                    }
                } else {
                    resolve()
                }
            })
        })
    }

    /**
     * Send a text request to Cline via the TaskService
     * @param request The text request to send
     * @returns Promise<string> The task ID for tracking
     */
    async sendRequest(request: string): Promise<string> {
        await this.ensureInitialized()
        
        if (!this.isConnected) {
            throw new Error("gRPC client not connected to Cline server")
        }

        try {
            console.log(`\n🤖 Sending request to Cline system...`)
            console.log(`📝 Request: "${request}"\n`)

            // Create a new task request
            const newTaskRequest = {
                metadata: {
                    request_id: this.generateRequestId(),
                    timestamp: Date.now().toString()
                },
                text: request,
                images: [], // No images for text-only requests
                files: []   // No files for basic requests
            }

            // Call the newTask RPC method
            return new Promise((resolve, reject) => {
                this.taskClient.newTask(newTaskRequest, (error: any, response: any) => {
                    if (error) {
                        console.error("❌ Error calling Cline TaskService:", error)
                        if (error.code === 14) { // grpc.status.UNAVAILABLE
                            console.log("\n💡 The Cline server appears to be offline.")
                            console.log("   Please start it with: npm run test:sca-server")
                        }
                        reject(error)
                    } else {
                        console.log("✅ Task created successfully in Cline system")
                        console.log("📊 Task initiated - Cline is processing your request...")
                        console.log("\n💡 To see the full conversation and responses:")
                        console.log("   - Open Cline in VS Code")
                        console.log("   - Check the task history")
                        console.log("   - Or use the Cline web interface if available")
                        
                        // For a complete implementation, we would need to subscribe
                        // to task updates to get the actual AI responses
                        resolve(newTaskRequest.metadata.request_id)
                    }
                })
            })

        } catch (error) {
            console.error("❌ Error sending request to Cline:", error)
            throw error
        }
    }

    /**
     * Get task history from Cline
     * @returns Promise with task history
     */
    async getTaskHistory(): Promise<any> {
        await this.ensureInitialized()
        
        if (!this.isConnected) {
            throw new Error("gRPC client not connected to Cline server")
        }

        try {
            console.log("📋 Fetching task history from Cline...")

            const request = {
                metadata: {
                    request_id: this.generateRequestId(),
                    timestamp: Date.now().toString()
                },
                limit: 10,
                offset: 0,
                search_term: "",
                filter_favorites: false
            }

            return new Promise((resolve, reject) => {
                this.taskClient.getTaskHistory(request, (error: any, response: any) => {
                    if (error) {
                        console.error("❌ Error fetching task history:", error)
                        if (error.code === 14) { // grpc.status.UNAVAILABLE
                            console.log("\n💡 The Cline server appears to be offline.")
                            console.log("   Please start it with: npm run test:sca-server")
                        }
                        reject(error)
                    } else {
                        console.log("✅ Task history retrieved successfully")
                        resolve(response)
                    }
                })
            })

        } catch (error) {
            console.error("❌ Error getting task history:", error)
            throw error
        }
    }

    /**
     * Cancel the currently running task
     */
    async cancelTask(): Promise<void> {
        await this.ensureInitialized()
        
        if (!this.isConnected) {
            throw new Error("gRPC client not connected to Cline server")
        }

        try {
            console.log("🛑 Cancelling current task in Cline...")

            const request = {
                metadata: {
                    request_id: this.generateRequestId(),
                    timestamp: Date.now().toString()
                }
            }

            return new Promise((resolve, reject) => {
                this.taskClient.cancelTask(request, (error: any, response: any) => {
                    if (error) {
                        console.error("❌ Error cancelling task:", error)
                        if (error.code === 14) { // grpc.status.UNAVAILABLE
                            console.log("\n💡 The Cline server appears to be offline.")
                            console.log("   Please start it with: npm run test:sca-server")
                        }
                        reject(error)
                    } else {
                        console.log("✅ Task cancelled successfully")
                        resolve()
                    }
                })
            })

        } catch (error) {
            console.error("❌ Error cancelling task:", error)
            throw error
        }
    }

    /**
     * Generate a unique request ID
     */
    private generateRequestId(): string {
        return `cline-grpc-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Close the gRPC connection
     */
    close() {
        if (this.taskClient) {
            this.taskClient.close()
            this.isConnected = false
            console.log("🔌 Disconnected from Cline gRPC server")
        }
    }

    /**
     * Get connection status
     */
    isClientConnected(): boolean {
        return this.isConnected
    }

    /**
     * Get server information
     */
    getServerInfo() {
        return {
            host: GRPC_SERVER_HOST,
            connected: this.isConnected,
            description: "Cline gRPC TaskService - Full Cline system integration"
        }
    }
}

/**
 * Main function to handle command line usage
 */
async function main() {
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
        console.log("Usage: npx tsx cline-grpc-client.ts \"Your request here\"")
        console.log("")
        console.log("Prerequisites:")
        console.log("  1. Start Cline gRPC server: npm run test:sca-server")
        console.log("  2. Server should be running on localhost:26040")
        console.log("")
        console.log("Commands:")
        console.log("  npx tsx cline-grpc-client.ts \"Write a Python function\"")
        console.log("  npx tsx cline-grpc-client.ts --history   # Get task history")
        console.log("  npx tsx cline-grpc-client.ts --cancel    # Cancel current task")
        process.exit(1)
    }

    const command = args[0]
    
    try {
        const client = new ClineGrpcClient()
        
        // Wait for initialization to complete
        try {
            await client.ensureInitialized()
        } catch (initError) {
            // Handle initialization errors more gracefully
            if (initError.message && initError.message.includes("Cline server is not running")) {
                console.log("\n🔧 Cline server is not running")
                console.log("   📋 Complete setup guide:")
                console.log("   1. Build standalone version: npm run compile-standalone")
                console.log("   2. Open a new terminal window")
                console.log("   3. Run: npm run test:sca-server")
                console.log("   4. Wait for 'Cline gRPC Server is running!' message")
                console.log("   5. Keep that terminal open")
                console.log("   6. In this terminal, retry your command")
                process.exit(1)
            } else if (initError.message && initError.message.includes("protobuf")) {
                console.log("\n🔧 Protobuf files missing")
                console.log("   Run: npm run protos")
                process.exit(1)
            } else {
                console.log("\n🔧 Failed to initialize Cline client")
                console.log("   Error:", initError.message)
                console.log("   Complete setup steps:")
                console.log("   1. Build: npm run compile-standalone")
                console.log("   2. Start server: npm run test:sca-server")
                process.exit(1)
            }
        }
        
        // Display server information
        const serverInfo = client.getServerInfo()
        console.log(`🚀 Cline gRPC Client initialized`)
        console.log(`   Server: ${serverInfo.host}`)
        console.log(`   Status: ${serverInfo.connected ? 'Connected' : 'Disconnected'}`)
        console.log(`   Description: ${serverInfo.description}`)
        
        // Handle different commands
        if (command === "--history") {
            const history = await client.getTaskHistory()
            console.log("\n📋 Recent Task History:")
            console.log(JSON.stringify(history, null, 2))
            
        } else if (command === "--cancel") {
            await client.cancelTask()
            
        } else {
            // Regular task request
            const request = args.join(" ")
            const taskId = await client.sendRequest(request)
            
            console.log(`\n📄 Task ID: ${taskId}`)
            console.log("\n⚡ Next steps:")
            console.log("  1. Check Cline interface for the AI response")
            console.log("  2. Use --history to see task status")
            console.log("  3. The AI will process your request using the configured LLM")
        }
        
        // Clean up
        client.close()
        
        console.log("\n✅ Operation completed successfully!")
        
    } catch (error) {
        console.error("❌ Failed to process request:", error.message || error)
        
        // Provide guidance for common errors
        if (error.message && error.message.includes("ECONNREFUSED")) {
            console.log("\n🔧 Connection lost during operation")
            console.log("   The Cline server may have stopped running")
            console.log("   Please restart: npm run test:sca-server")
        } else {
            console.log("\n🔧 Troubleshooting:")
            console.log("  1. Make sure Cline gRPC server is running: npm run test:sca-server")
            console.log("  2. Check that server is accessible at", GRPC_SERVER_HOST)
        }
        process.exit(1)
    }
}

// Export for programmatic use
export { ClineGrpcClient }

// Run main function if this script is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error("Fatal error:", error)
        process.exit(1)
    })
}