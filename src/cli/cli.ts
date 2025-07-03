#!/usr/bin/env node

import { createChannel, createClient } from "nice-grpc"
import * as readline from "node:readline"
import { stdin as input, stdout as output } from "node:process"
import chalk from "chalk"
import { TaskServiceDefinition } from "@shared/proto/task"
import { NewTaskRequest } from "@shared/proto/task"
import { EmptyRequest, StringRequest } from "@shared/proto/common"

class ClineCLI {
	private taskClient: any
	private rl: readline.Interface
	private currentTaskId: string | null = null

	constructor() {
		const address = process.env.PROTOBUS_ADDRESS || "127.0.0.1:50051"
		console.log(chalk.gray(`Connecting to: ${address}`))
		const channel = createChannel(address)
		this.taskClient = createClient(TaskServiceDefinition, channel)

		this.rl = readline.createInterface({
			input,
			output,
			prompt: chalk.blue("cline> "),
		})
	}

	async start() {
		console.log(chalk.green("🤖 Cline CLI Client"))
		console.log(chalk.gray('Type "help" for available commands'))
		console.log(chalk.gray('Type "quit" or "exit" to exit\n'))

		this.rl.prompt()

		this.rl.on("line", async (line: string) => {
			const input = line.trim()

			if (input === "quit" || input === "exit") {
				this.rl.close()
				return
			}

			if (input === "help") {
				this.showHelp()
			} else if (input.startsWith("task ")) {
				await this.createTask(input.substring(5))
			} else if (input === "status") {
				await this.getTaskStatus()
			} else if (input === "messages") {
				await this.getTaskMessages()
			} else if (input === "clear") {
				this.currentTaskId = null
				console.log(chalk.yellow("Current task cleared"))
			} else if (input) {
				// If no specific command, treat as a task creation
				await this.createTask(input)
			}

			this.rl.prompt()
		})

		this.rl.on("close", () => {
			console.log(chalk.gray("\nGoodbye! 👋"))
			process.exit(0)
		})
	}

	private showHelp() {
		console.log(chalk.cyan("\nAvailable commands:"))
		console.log(chalk.white("  task <description>  - Create a new task"))
		console.log(chalk.white("  status              - Show current task status"))
		console.log(chalk.white("  messages            - Show task conversation messages"))
		console.log(chalk.white("  clear               - Clear current task"))
		console.log(chalk.white("  help                - Show this help"))
		console.log(chalk.white("  quit/exit           - Exit the CLI\n"))
	}

	private async createTask(description: string) {
		try {
			console.log(chalk.yellow(`Creating task: ${description}`))

			const request = NewTaskRequest.create({
				text: description,
				images: [],
			})

			const response = await this.taskClient.newTask(request)
			this.currentTaskId = response.value

			console.log(chalk.green(`✅ Task created with ID: ${response.value}`))
			console.log(chalk.gray('Use "status" to check progress\n'))
		} catch (error) {
			console.error(chalk.red(`❌ Error creating task: ${error}`))
		}
	}

	private async getTaskStatus() {
		if (!this.currentTaskId) {
			console.log(chalk.yellow('No active task. Create one first with "task <description>"'))
			return
		}

		try {
			const response = await this.taskClient.showTaskWithId(StringRequest.create({ value: this.currentTaskId }))

			console.log(chalk.cyan(`\nTask Status (${this.currentTaskId}):`))
			console.log(chalk.white(`Task: ${response.task}`))
			console.log(chalk.white(`Created: ${new Date(response.ts).toLocaleString()}`))
			console.log(chalk.white(`Favorited: ${response.isFavorited ? "Yes" : "No"}`))

			if (response.tokensIn || response.tokensOut) {
				console.log(chalk.white(`Tokens: ${response.tokensIn || 0} in, ${response.tokensOut || 0} out`))
			}

			if (response.totalCost) {
				console.log(chalk.white(`Cost: $${response.totalCost.toFixed(6)}`))
			}

			console.log()
		} catch (error) {
			console.error(chalk.red(`❌ Error getting task status: ${error}`))
		}
	}

	private async getTaskMessages() {
		if (!this.currentTaskId) {
			console.log(chalk.yellow('No active task. Create one first with "task <description>"'))
			return
		}

		try {
			const response = await this.taskClient.getTaskMessages(StringRequest.create({ value: this.currentTaskId }))

			console.log(chalk.cyan(`\nTask Messages (${this.currentTaskId}):`))

			if (response.messages && response.messages.length > 0) {
				response.messages.forEach((msg: any, index: number) => {
					const role = msg.role === "user" ? chalk.blue("👤 User") : chalk.green("🤖 Cline")
					const timestamp = new Date(msg.ts).toLocaleString()
					console.log(chalk.gray(`[${timestamp}] ${role}:`))
					console.log(chalk.white(msg.content))
					console.log()
				})
			} else {
				console.log(chalk.yellow("No messages found for this task yet."))
			}
		} catch (error) {
			console.error(chalk.red(`❌ Error getting task messages: ${error}`))
		}
	}
}

// Start the CLI
async function main() {
	const cli = new ClineCLI()
	await cli.start()
}

main().catch((error) => {
	console.error(chalk.red(`Fatal error: ${error}`))
	process.exit(1)
})
