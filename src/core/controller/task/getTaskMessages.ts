import { Controller } from ".."
import { StringRequest } from "../../../shared/proto/common"
import { TaskMessagesResponse, TaskMessage } from "../../../shared/proto/task"
import { getSavedApiConversationHistory } from "../../../core/storage/disk"

/**
 * Gets the messages for a task
 * @param controller The controller instance
 * @param request The request containing the task ID
 * @returns TaskMessagesResponse with task messages
 */
export async function getTaskMessages(controller: Controller, request: StringRequest): Promise<TaskMessagesResponse> {
	try {
		const taskId = request.value
		if (!taskId) {
			throw new Error("Task ID is required")
		}

		// Get the API conversation history
		const apiConversationHistory = await getSavedApiConversationHistory(controller.context, taskId)

		// Convert to TaskMessage format
		const messages: TaskMessage[] = apiConversationHistory.map((msg) => {
			let content = ""
			if (typeof msg.content === "string") {
				content = msg.content
			} else if (Array.isArray(msg.content)) {
				// Extract text content from content blocks
				content = msg.content
					.filter((block: any) => block.type === "text")
					.map((block: any) => block.text)
					.join("\n")
			}

			return TaskMessage.create({
				ts: Date.now(), // We don't have timestamps in API history, so use current time
				type: msg.role,
				content: content,
				role: msg.role,
			})
		})

		return TaskMessagesResponse.create({
			messages: messages,
		})
	} catch (error) {
		console.error("Error in getTaskMessages:", error)
		throw error
	}
}
