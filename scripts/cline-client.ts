#!/usr/bin/env npx tsx

/**
 * Minimal gRPC client for driving the Cline core service from a Node.js script.
 *
 * Usage:
 *   1. Start the standalone Cline gRPC server (e.g. `npm run test:sca-server`).
 *   2. Run this file with tsx: `GOOGLE_API_KEY=... npx tsx scripts/cline-client.ts "Hello Cline"`.
 *   3. The script will stream Cline's responses back to stdout via `runClineTextRequest`.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { ClientReadableStream, ServiceError } from "@grpc/grpc-js"
import { credentials, loadPackageDefinition, status } from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROTO_ROOT = path.resolve(__dirname, "../proto")
const PROTO_FILES = [
	path.resolve(PROTO_ROOT, "cline/common.proto"),
	path.resolve(PROTO_ROOT, "cline/state.proto"),
	path.resolve(PROTO_ROOT, "cline/models.proto"),
	path.resolve(PROTO_ROOT, "cline/task.proto"),
	path.resolve(PROTO_ROOT, "cline/ui.proto"),
]

const packageDefinition = protoLoader.loadSync(PROTO_FILES, {
	includeDirs: [PROTO_ROOT],
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
})

const clinePackage = loadPackageDefinition(packageDefinition).cline as any

export interface ClineOutputChunk {
	ts: string
	role: "ask" | "say"
	kind: string
	partial: boolean
	text?: string
	reasoning?: string
	raw: unknown
}

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash-001"
const DEFAULT_API_KEY = "AIzaSyCKeTIx2E-AB0MefXmiryC6YYma7R4xwvs"

function serializeMessage(message: any): string {
	if (!message) {
		return ""
	}

	return JSON.stringify({
		type: message.type ?? null,
		say: message.say ?? null,
		ask: message.ask ?? null,
		text: message.text ?? null,
		reasoning: message.reasoning ?? null,
		partial: Boolean(message.partial),
	})
}

function normalizeClineMessage(message: any, isPartial: boolean): ClineOutputChunk {
	const role = message?.type === "ask" ? "ask" : "say"
	const kind = role === "ask" ? (message?.ask ?? "unknown") : (message?.say ?? "unknown")
	const chunk: ClineOutputChunk = {
		ts: String(message?.ts ?? ""),
		role,
		kind,
		partial: Boolean(isPartial || message?.partial),
		raw: message,
	}

	if (typeof message?.text === "string" && message.text.length > 0) {
		chunk.text = message.text
	}
	if (typeof message?.reasoning === "string" && message.reasoning.length > 0) {
		chunk.reasoning = message.reasoning
	}

	return chunk
}

function isGrpcCancelledError(error: unknown): boolean {
	if (!error || typeof error !== "object") {
		return false
	}

	const maybeError = error as Partial<ServiceError>
	return maybeError.code === status.CANCELLED
}

function createUnaryCaller(client: any, methodName: string) {
	return (request: Record<string, unknown>) =>
		new Promise<any>((resolve, reject) => {
			const method = client?.[methodName]
			if (typeof method !== "function") {
				reject(new Error(`Method ${methodName} not found on client`))
				return
			}

			method.call(client, request, (error: ServiceError | null, response: any) => {
				if (error) {
					reject(error)
					return
				}

				resolve(response)
			})
		})
}

export class ClineGrpcClient {
	private readonly address: string
	private readonly taskClient: any
	private readonly uiClient: any
	private readonly stateClient: any
	private readonly modelsClient: any

	private readonly callTaskUnary: (request: Record<string, unknown>) => Promise<any>
	private readonly callStateUnary: (request: Record<string, unknown>) => Promise<any>
	private readonly callModelsUnary: (request: Record<string, unknown>) => Promise<any>
	private readonly callSetWelcomeUnary: (request: Record<string, unknown>) => Promise<any>

	constructor(address = process.env.CLINE_GRPC_ADDR ?? "127.0.0.1:26040") {
		this.address = address
		const creds = credentials.createInsecure()

		this.taskClient = new clinePackage.TaskService(this.address, creds)
		this.uiClient = new clinePackage.UiService(this.address, creds)
		this.stateClient = new clinePackage.StateService(this.address, creds)
		this.modelsClient = new clinePackage.ModelsService(this.address, creds)

		this.callTaskUnary = createUnaryCaller(this.taskClient, "newTask")
		this.callStateUnary = createUnaryCaller(this.stateClient, "getLatestState")
		this.callModelsUnary = createUnaryCaller(this.modelsClient, "updateApiConfigurationProto")
		this.callSetWelcomeUnary = createUnaryCaller(this.stateClient, "setWelcomeViewCompleted")
	}

	async configureGemini(apiKey: string, modelId = DEFAULT_GEMINI_MODEL): Promise<void> {
		if (!apiKey) {
			throw new Error("A Gemini API key is required to configure Cline")
		}

		await this.callModelsUnary({
			apiConfiguration: {
				geminiApiKey: apiKey,
				planModeApiProvider: "GEMINI",
				actModeApiProvider: "GEMINI",
				planModeApiModelId: modelId,
				actModeApiModelId: modelId,
			},
		})

		await this.callSetWelcomeUnary({ value: true })
	}

	async sendText(
		requestText: string,
		onMessage: (chunk: ClineOutputChunk) => void,
		options?: { signal?: AbortSignal },
	): Promise<void> {
		if (!requestText || requestText.trim().length === 0) {
			throw new Error("Text request must not be empty")
		}

		const { signal } = options ?? {}
		const seenFullMessages = new Map<string, string>()
		const seenPartialMessages = new Map<string, string>()

		const latestStateResponse = await this.callStateUnary({})
		if (latestStateResponse?.stateJson) {
			try {
				const state = JSON.parse(latestStateResponse.stateJson)
				if (Array.isArray(state?.clineMessages)) {
					for (const message of state.clineMessages) {
						const ts = String(message?.ts ?? "")
						if (!ts) {
							continue
						}
						seenFullMessages.set(ts, serializeMessage(message))
					}
				}
			} catch (error) {
				console.warn("Failed to parse initial state JSON", error)
			}
		}

		let stateStream: ClientReadableStream<any> | undefined
		let partialStream: ClientReadableStream<any> | undefined
		let finished = false
		let allowEmits = false

		await new Promise<void>((resolve, reject) => {
			const finish = (error?: unknown) => {
				if (finished) {
					return
				}
				finished = true

				if (signal && abortHandler) {
					signal.removeEventListener("abort", abortHandler)
				}

				if (stateStream) {
					stateStream.cancel()
				}
				if (partialStream) {
					partialStream.cancel()
				}

				if (error) {
					reject(error)
				} else {
					resolve()
				}
			}

			const safeEmit = (chunk: ClineOutputChunk) => {
				try {
					onMessage(chunk)
				} catch (error) {
					finish(error)
					return
				}

				if (chunk.role === "ask") {
					finish()
				}
			}

			stateStream = this.stateClient.subscribeToState({}, {})
			stateStream.on("data", (response: any) => {
				if (finished || !allowEmits) {
					return
				}
				if (!response?.stateJson) {
					return
				}

				try {
					const state = JSON.parse(response.stateJson)
					if (!Array.isArray(state?.clineMessages)) {
						return
					}

					for (const message of state.clineMessages) {
						const ts = String(message?.ts ?? "")
						if (!ts) {
							continue
						}

						const serialized = serializeMessage(message)
						const previous = seenFullMessages.get(ts)
						if (previous === serialized) {
							continue
						}

						seenFullMessages.set(ts, serialized)
						seenPartialMessages.delete(ts)
						safeEmit(normalizeClineMessage(message, false))
					}
				} catch (error) {
					console.warn("Failed to parse state JSON from stream", error)
				}
			})
			stateStream.on("error", (error: ServiceError) => {
				if (finished && isGrpcCancelledError(error)) {
					return
				}
				finish(error)
			})
			stateStream.on("end", () => {
				finish()
			})

			partialStream = this.uiClient.subscribeToPartialMessage({}, {})
			partialStream.on("data", (message: any) => {
				if (finished || !allowEmits) {
					return
				}

				const ts = String(message?.ts ?? "")
				if (!ts) {
					return
				}

				const serialized = serializeMessage(message)
				const previous = seenPartialMessages.get(ts)
				if (previous === serialized) {
					return
				}

				seenPartialMessages.set(ts, serialized)
				safeEmit(normalizeClineMessage(message, true))
			})
			partialStream.on("error", (error: ServiceError) => {
				if (finished && isGrpcCancelledError(error)) {
					return
				}
				finish(error)
			})
			partialStream.on("end", () => {
				// Ignore - the state stream will resolve the promise when appropriate
			})

			let abortHandler: (() => void) | undefined
			if (signal) {
				if (signal.aborted) {
					finish(new Error("Request aborted"))
					return
				}

				abortHandler = () => {
					finish(new Error("Request aborted"))
				}
				signal.addEventListener("abort", abortHandler)
			}

			allowEmits = true

			this.callTaskUnary({ text: requestText, images: [], files: [] }).catch((error) => {
				finish(error)
			})
		})
	}

	close(): void {
		const maybeClose = (client: any) => {
			if (client && typeof client.close === "function") {
				client.close()
			}
		}

		maybeClose(this.taskClient)
		maybeClose(this.uiClient)
		maybeClose(this.stateClient)
		maybeClose(this.modelsClient)
	}
}

export async function runClineTextRequest(
	text: string,
	onMessage: (chunk: ClineOutputChunk) => void,
	options?: { address?: string; modelId?: string; apiKey?: string; signal?: AbortSignal },
): Promise<void> {
	const client = new ClineGrpcClient(options?.address)
	const apiKey = options?.apiKey ?? process.env.GOOGLE_API_KEY ?? DEFAULT_API_KEY

	try {
		await client.configureGemini(apiKey, options?.modelId ?? DEFAULT_GEMINI_MODEL)
		await client.sendText(text, onMessage, { signal: options?.signal })
	} finally {
		client.close()
	}
}

async function main(): Promise<void> {
	const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === __filename
	if (!isDirectExecution) {
		return
	}

	const text = process.argv.slice(2).join(" ").trim()
	if (!text) {
		console.error('Usage: npx tsx scripts/cline-client.ts "<request text>"')
		process.exitCode = 1
		return
	}

	console.log(`Connecting to Cline at ${process.env.CLINE_GRPC_ADDR ?? "127.0.0.1:26040"}`)

	try {
		await runClineTextRequest(text, (chunk) => {
			const prefix = chunk.partial ? "[partial]" : "[final]"
			const role = chunk.role === "ask" ? "Cline (ask)" : `Cline (${chunk.kind})`
			const content = chunk.text ?? chunk.reasoning ?? "(no text)"
			console.log(`${prefix} ${role}: ${content}`)
		})
	} catch (error) {
		console.error("Failed to run Cline request:", error)
		process.exitCode = 1
	}
}

void main()
