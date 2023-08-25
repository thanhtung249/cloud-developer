import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')
// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId: string = getUserId(event)
    let response: APIGatewayProxyResult | PromiseLike<APIGatewayProxyResult>

    try {
      const todos: TodoItem[] = await getTodosForUser(userId)

      response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          items: todos
        })
      }
    } catch (e) {
      logger.error(`Error creating Todo item: ${e.message}`)

      response = {
        statusCode: 500,
        body: JSON.stringify({
          error: e.message
        })
      }
    }

    return response
  }
)

handler.use(
  cors({
    credentials: true
  })
)
