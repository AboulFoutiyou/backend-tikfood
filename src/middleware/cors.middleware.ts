import {MiddlewareContext} from '@loopback/rest';
import {Next, InvocationResult, ValueOrPromise} from '@loopback/core';

export const corsMiddleware = async (
  context: MiddlewareContext,
  next: Next,
): Promise<ValueOrPromise<InvocationResult>> => {
  const {request, response} = context;

  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );

  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    return;
  }

  return next();
};
