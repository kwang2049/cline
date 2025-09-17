#!/usr/bin/env npx tsx

/**
 * gRPC Client Test Script
 * 
 * This script tests the gRPC client setup and validates the connection
 * to Cline's system without making actual task requests.
 */

import { ClineGrpcClient } from './cline-grpc-client'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Test gRPC client setup and prerequisites
 */
async function testGrpcClientSetup() {
    console.log("🧪 Testing Cline gRPC Client Setup...\n")
    
    let allTestsPassed = true
    
    try {
        // Test 1: Check if protobuf files exist
        console.log("1. 📄 Checking protobuf files...")
        const protoPath = path.join(__dirname, "proto", "cline", "task.proto")
        if (fs.existsSync(protoPath)) {
            console.log("   ✅ Protobuf files found")
        } else {
            console.log("   ⚠️  Protobuf files not found at", protoPath)
            console.log("   💡 Run 'npm run protos' to generate them")
            allTestsPassed = false
        }
        
        // Test 2: Check if required dependencies are available
        console.log("\n2. 📦 Checking gRPC dependencies...")
        try {
            require("@grpc/grpc-js")
            require("@grpc/proto-loader")
            console.log("   ✅ gRPC dependencies available")
        } catch (error) {
            console.log("   ❌ gRPC dependencies missing")
            console.log("   💡 Run 'npm install' to install dependencies")
            allTestsPassed = false
        }
        
        // Test 3: Test client initialization (without connection)
        console.log("\n3. 🔧 Testing client initialization...")
        try {
            // This will fail gracefully if server is not running
            const client = new ClineGrpcClient()
            console.log("   ✅ Client class can be instantiated")
            
            const serverInfo = client.getServerInfo()
            console.log(`   📡 Target server: ${serverInfo.host}`)
            console.log(`   📋 Description: ${serverInfo.description}`)
            
            // Clean up
            client.close()
            
        } catch (error) {
            console.log("   ⚠️  Client initialization had issues (expected if server not running)")
            console.log(`   Error: ${error.message}`)
        }
        
        // Test 4: Check server availability (optional)
        console.log("\n4. 🌐 Checking Cline server availability...")
        const serverHost = process.env.CLINE_GRPC_HOST || "127.0.0.1:26040"
        console.log(`   📍 Checking: ${serverHost}`)
        
        // Simple connection test without full client setup
        try {
            const net = require('net')
            const [host, port] = serverHost.split(':')
            
            const socket = new net.Socket()
            const connectionPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    socket.destroy()
                    reject(new Error('Connection timeout'))
                }, 3000)
                
                socket.connect(parseInt(port), host, () => {
                    clearTimeout(timeout)
                    socket.destroy()
                    resolve(true)
                })
                
                socket.on('error', (err) => {
                    clearTimeout(timeout)
                    reject(err)
                })
            })
            
            await connectionPromise
            console.log("   ✅ Cline server is reachable")
            console.log("   💡 gRPC client should work properly")
            
        } catch (error) {
            console.log("   ⚠️  Cline server not reachable")
            console.log("   💡 Start server with: npm run test:sca-server")
            console.log(`   Error: ${error.message}`)
        }
        
        console.log("\n" + "=".repeat(60))
        
        if (allTestsPassed) {
            console.log("🎉 All setup tests passed!")
            console.log("\n📋 Next steps:")
            console.log("1. Start Cline server: npm run test:sca-server")
            console.log("2. Use gRPC client: npm run grpc-client \"Your request\"")
            
        } else {
            console.log("⚠️  Some setup issues detected")
            console.log("\n🔧 Troubleshooting:")
            console.log("1. Run: npm install")
            console.log("2. Run: npm run protos")  
            console.log("3. Start server: npm run test:sca-server")
        }
        
    } catch (error) {
        console.error("❌ Test suite failed:", error)
        return false
    }
    
    return allTestsPassed
}

/**
 * Show usage examples
 */
function showUsageExamples() {
    console.log("\n📚 gRPC Client Usage Examples:")
    console.log("")
    console.log("1. Start Cline server (required first):")
    console.log("   npm run test:sca-server")
    console.log("")
    console.log("2. Send task requests:")
    console.log("   npm run grpc-client \"Write a Python function to sort a list\"")
    console.log("   npm run grpc-client \"Debug this JavaScript error: Cannot read property 'length' of undefined\"")
    console.log("")
    console.log("3. Manage tasks:")
    console.log("   npm run grpc-client --history   # View task history")
    console.log("   npm run grpc-client --cancel    # Cancel current task")
    console.log("")
    console.log("4. For comparison, try direct API client:")
    console.log("   npm run client \"Simple LLM query\"")
}

/**
 * Main test function
 */
async function main() {
    console.log("🚀 Cline gRPC Client Test Suite\n")
    
    const success = await testGrpcClientSetup()
    
    showUsageExamples()
    
    console.log("\n🔍 Key Differences:")
    console.log("• gRPC Client: Connects to Cline system (full integration)")
    console.log("• Direct Client: Connects to LLM API only (simple queries)")
    
    console.log("\n📁 Available Scripts:")
    console.log("- npm run grpc-client <request>   - Connect to Cline system")
    console.log("- npm run client <request>        - Direct LLM API")
    console.log("- npm run test-client            - Test direct client setup")
    console.log("- npm run test:sca-server        - Start Cline server")
    
    if (!success) {
        process.exit(1)
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error("Test suite failed:", error)
        process.exit(1)
    })
}