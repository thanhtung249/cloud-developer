// import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// const XAWS = AWSXRay.captureAWS(AWS)
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(require('aws-sdk'))
const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    private readonly docClient: DocumentClient
    private readonly todosTable: string
  
    constructor() {
      this.docClient = new XAWS.DynamoDB.DocumentClient(),
      this.todosTable = process.env.TODOS_TABLE
    }
  
    async getTodos(userId: string): Promise<TodoItem[]> {
      try {
        logger.info(`get todos exist for (userId) = (${userId})`)
        const result = await this.docClient
          .query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            },
            ScanIndexForward: false
          })
          .promise()

        logger.info('Getting all todos for user successfully', userId, result)

        const items = result.Items
    
        return items as TodoItem[]
      } catch (error) {
        logger.error('Failed to get all todos for user', error, userId)
      }
    }
  
    async getTodosFinished(userId: string): Promise<TodoItem[]> {
      try {
        logger.info(`get todos finished for (userId) = (${userId})`)
        const result = await this.docClient
          .query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'done = :done',
            ExpressionAttributeValues: {
              ':userId': userId,
              ':done': true,
            },
            ScanIndexForward: false
          })
          .promise()

        logger.info('Getting all finished todos for user successfully', userId, result)

        const items = result.Items
    
        return items as TodoItem[]
      } catch (error) {
        logger.error('Failed to get finished todos for user', error, userId)
      }
    }

    async getTodosNotFinished(userId: string): Promise<TodoItem[]> {
      try {
        logger.info(`get todos not finished for (userId) = (${userId})`)
        const result = await this.docClient
          .query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'done = :done',
            ExpressionAttributeValues: {
              ':userId': userId,
              ':done': false,
            },
            ScanIndexForward: false
          })
          .promise()

        logger.info('Getting all not finished todos for user successfully', userId, result)

        const items = result.Items
    
        return items as TodoItem[]
      } catch (error) {
        logger.error('Failed to get not finished todos for user', error, userId)
      }
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      try {
        logger.info(`creating todo`)
        await this.docClient
          .put({
            TableName: this.todosTable,
            Item: todoItem
          })
          .promise()
        
        logger.info('create a todo for user successfully', todoItem)

        return todoItem
    } catch (error) {
      logger.error('Failed to create a todo for user', error, todoItem)
      return null
    }
    }
  
    async updateTodo(
      userId: string,
      todoId: string,
      updateData: TodoUpdate
    ): Promise<TodoItem> {
      try {
        logger.info(`updating todo exist for (userId, todoId) = (${userId}, ${todoId})`)
        const result = await this.docClient
          .update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: { '#name': 'name' },
            ExpressionAttributeValues: {
              ':name': updateData.name,
              ':dueDate': updateData.dueDate,
              ':done': updateData.done
            }
          })
          .promise()
    
        logger.info('Updating a todo for user successfully', updateData)

        const updatedTodo = result.Attributes
    
        return updatedTodo as TodoItem
      } catch (error) {
        logger.error('Failed to save a photo for user', error, updateData)
        return null
      }
    }
  
    async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
      try {
        logger.info(`deleting todo exist for (userId, todoId) = (${userId}, ${todoId})`)
        const result = await this.docClient
          .delete({
            TableName: this.todosTable,
            Key: { userId, todoId },
            ReturnValues: 'ALL_OLD'
          })
          .promise()
    
        const deletedTodo = result.Attributes

        logger.info(`Todo ${todoId} is eleted by user`, userId)

        return deletedTodo as TodoItem
      } catch (error) {
        logger.error('Failed to delete todo', error, userId, todoId)
      }
    }
  
    async updateTodoAttachmentUrl(
      userId: string,
      todoId: string,
      attachmentUrl: string
    ): Promise<TodoItem> {
      logger.info(`updating todo attachment url exist for (userId, todoId) = (${userId}, ${todoId})`)
      const result = await this.docClient
        .update({
          TableName: this.todosTable,
          Key: { userId, todoId },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': attachmentUrl
          },
          ReturnValues: 'ALL_NEW'
        })
        .promise()
  
      const updatedTodo = result.Attributes
  
      return updatedTodo as TodoItem
    }
  
    async isExistedTodo(userId: string, todoId: string): Promise<boolean> {
      const result = await this.docClient
        .get({
          TableName: this.todosTable,
          Key: { userId, todoId }
        })
        .promise()
      return result.Item !== null && result.Item !== undefined
    }
  }