import { FindRoute, InvokeMethod, ParseParams, Reject, RequestContext, Send, SequenceHandler, InvokeMiddleware } from '@loopback/rest';
import { AuthenticateFn } from '@loopback/authentication';
export declare class MySequence implements SequenceHandler {
    protected findRoute: FindRoute;
    protected parseParams: ParseParams;
    protected invoke: InvokeMethod;
    send: Send;
    reject: Reject;
    protected authenticateRequest: AuthenticateFn;
    protected authorize: (context: RequestContext, spec: object) => Promise<void>;
    protected invokeMiddleware: InvokeMiddleware;
    constructor(findRoute: FindRoute, parseParams: ParseParams, invoke: InvokeMethod, send: Send, reject: Reject, authenticateRequest: AuthenticateFn, authorize: (context: RequestContext, spec: object) => Promise<void>, invokeMiddleware: InvokeMiddleware);
    handle(context: RequestContext): Promise<void>;
}
