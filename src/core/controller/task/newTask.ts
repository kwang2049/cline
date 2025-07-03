import { Controller } from ".."
import { String } from "../../../shared/proto/common"
import { NewTaskRequest } from "../../../shared/proto/task"
import { handleFileServiceRequest } from "../file"

/**
 * Creates a new task with the given text and optional images
 * @param controller The controller instance
 * @param request The new task request containing text and optional images
 * @returns String response with the task ID
 */
export async function newTask(controller: Controller, request: NewTaskRequest): Promise<String> {
	await controller.initTask(request.text, request.images, request.files)

	// Return the task ID from the controller's current task
	if (!controller.task) {
		throw new Error("Task was not initialized properly")
	}

	return String.create({ value: controller.task.taskId })
}
