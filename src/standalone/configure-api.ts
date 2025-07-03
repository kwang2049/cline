import { extensionContext } from "./vscode-context"
import { updateApiConfiguration } from "@core/storage/state"
import { ApiConfiguration } from "@shared/api"

export async function configureApiFromEnvironment(): Promise<void> {
	const openRouterApiKey = process.env.OPENROUTER_API_KEY
	const apiProvider = process.env.CLINE_API_PROVIDER
	const modelId = process.env.CLINE_MODEL_ID

	if (!openRouterApiKey && !apiProvider) {
		console.log("No API configuration found in environment variables")
		return
	}

	console.log("Configuring API from environment variables...")

	// Get current API configuration
	const currentConfig: ApiConfiguration = {
		apiProvider: "openrouter",
		openRouterApiKey: openRouterApiKey || "",
		openRouterModelId: modelId || "deepseek/deepseek-chat-v3-0324:free",
	}

	// Update the API configuration
	await updateApiConfiguration(extensionContext, currentConfig)

	console.log("✅ API configuration updated from environment variables")
	console.log(`   Provider: ${currentConfig.apiProvider}`)
	console.log(`   Model: ${currentConfig.openRouterModelId}`)
	console.log(`   API Key: ${openRouterApiKey ? "***" + openRouterApiKey.slice(-4) : "Not set"}`)
}
