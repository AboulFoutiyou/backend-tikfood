"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySequence = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const authentication_1 = require("@loopback/authentication");
let MySequence = class MySequence {
    constructor(findRoute, parseParams, invoke, send, reject, authenticateRequest, authorize, invokeMiddleware) {
        this.findRoute = findRoute;
        this.parseParams = parseParams;
        this.invoke = invoke;
        this.send = send;
        this.reject = reject;
        this.authenticateRequest = authenticateRequest;
        this.authorize = authorize;
        this.invokeMiddleware = invokeMiddleware;
    }
    async handle(context) {
        try {
            // Appliquer le middleware CORS
            const finished = await this.invokeMiddleware(context);
            if (finished)
                return;
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
        }
        catch (err) {
            this.reject(context, err);
        }
    }
};
exports.MySequence = MySequence;
exports.MySequence = MySequence = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)(rest_1.RestBindings.SequenceActions.FIND_ROUTE)),
    tslib_1.__param(1, (0, core_1.inject)(rest_1.RestBindings.SequenceActions.PARSE_PARAMS)),
    tslib_1.__param(2, (0, core_1.inject)(rest_1.RestBindings.SequenceActions.INVOKE_METHOD)),
    tslib_1.__param(3, (0, core_1.inject)(rest_1.RestBindings.SequenceActions.SEND)),
    tslib_1.__param(4, (0, core_1.inject)(rest_1.RestBindings.SequenceActions.REJECT)),
    tslib_1.__param(5, (0, core_1.inject)(authentication_1.AuthenticationBindings.AUTH_ACTION)),
    tslib_1.__param(6, (0, core_1.inject)('authorization.authorize')),
    tslib_1.__param(7, (0, core_1.inject)(rest_1.RestBindings.SequenceActions.INVOKE_MIDDLEWARE, { optional: true })),
    tslib_1.__metadata("design:paramtypes", [Function, Function, Function, Function, Function, Function, Function, Function])
], MySequence);
//# sourceMappingURL=sequence.js.map