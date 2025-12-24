import { MiddlewareContext } from '@loopback/rest';
import { Next, InvocationResult, ValueOrPromise } from '@loopback/core';
export declare const corsMiddleware: (context: MiddlewareContext, next: Next) => Promise<ValueOrPromise<InvocationResult>>;
