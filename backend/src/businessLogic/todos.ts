import * as uuid from 'uuid'
import TodosAccess from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../storageLayer/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'


// TODO: Implement businessLogic
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

export async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: s3AttachmentUrl,
        ...newTodo
    }
  
    return await todosAccess.createTodo(newItem)
}
  
export async function updateTodo(userId: string, todoId: string, todoUpdate: UpdateTodoRequest): Promise<TodoUpdate> {
    return await todosAccess.updateTodo(userId, todoId, todoUpdate)
}
  
export async function deleteTodo(userId: string, todoId: string): Promise<string> {
    return await todosAccess.deleteTodo(userId, todoId)
}

export async function addAttachmentUrl(todoId: string): Promise<string> {
    return await attachmentUtils.uploadAttachment(todoId)
}
  
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return await todosAccess.getTodosByUserId(userId)
}
  