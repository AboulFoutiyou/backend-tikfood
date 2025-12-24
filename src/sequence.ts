import {inject} from '@loopback/core';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
  InvokeMiddleware,
} from '@loopback/rest';
import {
  AuthenticationBindings,
  AuthenticateFn,
} from '@loopback/authentication';
import { corsMiddleware } from './middleware/cors.middleware';
import {
  AuthorizationBindings,
  authorize,
} from '@loopback/authorization';

export class MySequence implements SequenceHandler {
  constructor(
    @inject(RestBindings.SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(RestBindings.SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(RestBindings.SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(RestBindings.SequenceActions.SEND) public send: Send,
    @inject(RestBindings.SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
    @inject('authorization.authorize')
    protected authorize: (context: RequestContext, spec: object) => Promise<void>,
    @inject(RestBindings.SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
    protected invokeMiddleware: InvokeMiddleware,

  ) {}

  async handle(context: RequestContext) {
    try {
      // Appliquer le middleware CORS
      const finished = await this.invokeMiddleware(context);
      if (finished) return;

        const { request, response } = context;
        const route = this.findRoute(request);

        if (request.method === 'OPTIONS') {
        // On envoie une réponse 204 No Content et on arrête le traitement.
        // La couche CORS de LoopBack a déjà ajouté les bons en-têtes.
        this.send(response, undefined);
        return;
      }

        // Authentifier la requête
        await this.authenticateRequest(request);

        // Autoriser la requête
        await this.authorize(context, route.spec);

        const args = await this.parseParams(request, route);
        const result = await this.invoke(route, args);
        this.send(response, result);
      
    } catch (err) {
      this.reject(context, err);
    }
  }
}