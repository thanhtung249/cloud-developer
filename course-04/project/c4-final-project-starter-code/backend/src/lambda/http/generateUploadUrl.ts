import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId: string = getUserId(event)
    let response: APIGatewayProxyResult | PromiseLike<APIGatewayProxyResult>

    try {
      const presignedUrl = await createAttachmentPresignedUrl(userId, todoId)

      response = {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          uploadUrl: presignedUrl
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

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
