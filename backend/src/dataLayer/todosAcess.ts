import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export default class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),    
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  // Create todo item
  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem as TodoItem
  }

  // Update todo item
  async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
    const result = await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      }
    }).promise()

    return result.Attributes as TodoUpdate;
  }

  // Update attachment URL for todo item
  async addAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

  // Delete todo item
  async deleteTodo(userId: string, todoId: string): Promise<string> {
    const result = await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()

    logger.info('Item deleted', result)
    return todoId as string
  }

  // Get all todo items
  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosTableIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    return result.Items  as TodoItem[];
  }
}


// Make connection to DynamoDBClient
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
