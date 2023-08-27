import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate'
import { URL } from 'url'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('todos')

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info(`Get todos for userId = ${userId}`)
  const todos = await todosAccess.getTodos(userId)
  return todos
}

export async function getTodosFinished(userId: string): Promise<any> {
  logger.info(`Get list todo finished = ${userId}`);
  const todos = await todosAccess.getTodosFinished(userId);
  return todos
}

export async function getTodosNotFinished(userId: string): Promise<any> {
  logger.info(`Get list todo not finished = ${userId}`);
  const todos = await todosAccess.getTodosNotFinished(userId);
  return todos
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {
  logger.info(`Update todo for (userId, todoId) = (${userId}, ${todoId})`)

  await checkTodoExist(userId, todoId)

  const updatedTodo = await todosAccess.updateTodo(
    userId,
    todoId,
    updateTodoRequest as TodoUpdate
  )
  return updatedTodo
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  logger.info(`Create todo for userId = ${userId}`)

  const newTodo: TodoItem = {
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: ''
  }

  const createdTodo = await todosAccess.createTodo(newTodo)

  return createdTodo
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  logger.info(`Delete todo for (userId, todoId) = (${userId}, ${todoId})`)

  await checkTodoExist(userId, todoId)

  const deletedTodo = await todosAccess.deleteTodo(userId, todoId)
  return deletedTodo
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
): Promise<string> {
  logger.info(
    `Create attachment presigned url for (userId, todoId) = (${userId}, ${todoId})`
  )

  await checkTodoExist(userId, todoId)
  const presignedUrl: string =
    await attachmentUtils.createAttachmentPresignedUrl(todoId)
  logger.info(`Created presigned URL: ${presignedUrl}`)

  const urlObj = new URL(presignedUrl)
  const updatedTodo: TodoItem = await todosAccess.updateTodoAttachmentUrl(
    userId,
    todoId,
    urlObj.toString().split("?")[0]
  )
  if (updatedTodo) {
    logger.info(`Updated todo attachment URL`)
  } else {
    throw new createError[500]('Can not update todo attachment URL')
  }

  return presignedUrl
}

export async function checkTodoExist(
  userId: string,
  todoId: string
): Promise<void> {
  logger.info(`check todo exist for (userId, todoId) = (${userId}, ${todoId})`)
  if (!todosAccess.isExistedTodo(userId, todoId)) {
    throw new createError.NotFound(`Not found todo with id = ${todoId}`)
  }
}