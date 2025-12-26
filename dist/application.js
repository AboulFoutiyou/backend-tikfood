"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodMarketplaceApplication = void 0;
const tslib_1 = require("tslib");
const boot_1 = require("@loopback/boot");
const authorization_1 = require("@loopback/authorization");
const rest_explorer_1 = require("@loopback/rest-explorer");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const service_proxy_1 = require("@loopback/service-proxy");
const path_1 = tslib_1.__importDefault(require("path"));
const sequence_1 = require("./sequence");
const authentication_1 = require("@loopback/authentication");
const authentication_jwt_1 = require("@loopback/authentication-jwt");
const authorization_2 = require("@loopback/authorization");
const jwt_strategy_1 = require("./authentication-strategies/jwt-strategy");
const cors_middleware_1 = require("./middleware/cors.middleware");
const rest_2 = require("@loopback/rest");
const rest_3 = require("@loopback/rest");
const authentication_jwt_2 = require("@loopback/authentication-jwt");
class FoodMarketplaceApplication extends (0, boot_1.BootMixin)((0, service_proxy_1.ServiceMixin)((0, repository_1.RepositoryMixin)((0, rest_2.MiddlewareMixin)(rest_1.RestApplication)))) {
    constructor(options = {}) {
        super(options);
        // Cors middleware setup
        this.middleware(cors_middleware_1.corsMiddleware);
        this.bind('rest.cors.options').to({
            origin: ['*'],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
            credentials: true, // si tu utilises des cookies ou l’authentification
        });
        // Set up the custom sequence
        this.sequence(sequence_1.MySequence);
        // Set up default home page
        this.static('/', path_1.default.join(__dirname, '../public'));
        this.static('/uploads', path_1.default.join(__dirname, '../.sandbox'));
        // Customize @loopback/rest-explorer configuration here
        this.configure(rest_explorer_1.RestExplorerBindings.COMPONENT).to({
            path: '/explorer',
        });
        this.component(rest_explorer_1.RestExplorerComponent);
        // Add authentication component
        this.component(authentication_1.AuthenticationComponent);
        this.component(authentication_jwt_1.JWTAuthenticationComponent);
        this.component(authorization_2.AuthorizationComponent);
        // Register JWT authentication strategy
        (0, authentication_1.registerAuthenticationStrategy)(this, jwt_strategy_1.JWTAuthenticationStrategy);
        this.bind(authentication_jwt_2.TokenServiceBindings.TOKEN_SECRET).to(process.env.JWT_SECRET ?? authentication_jwt_2.TokenServiceConstants.TOKEN_SECRET_VALUE);
        this.bind(authentication_jwt_2.TokenServiceBindings.TOKEN_EXPIRES_IN).to(process.env.JWT_EXPIRES_IN ?? authentication_jwt_2.TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);
        this.bind(authentication_jwt_2.TokenServiceBindings.TOKEN_SERVICE).toClass(authentication_jwt_2.JWTService);
        // Bind user service
        //this.bind(UserServiceBindings.USER_SERVICE).toClass(VendorUserService);
        this.bind('authorization.authorize').to(authorization_1.authorize);
        // Add security scheme to OpenAPI spec
        this.addSecuritySpec();
        this.configure(rest_3.RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
            limit: '10MB', // Limite de taille de fichier
        });
        this.projectRoot = __dirname;
        // Customize @loopback/boot Booter Conventions here
        this.bootOptions = {
            controllers: {
                // Customize ControllerBooter Conventions here
                dirs: ['controllers'],
                extensions: ['.controller.js'],
                nested: true,
            },
        };
    }
    addSecuritySpec() {
        this.api({
            openapi: '3.0.0',
            info: {
                title: 'Food Marketplace API',
                version: '1.0.0',
            },
            paths: {},
            components: { securitySchemes: authentication_jwt_1.SECURITY_SCHEME_SPEC },
            security: [
                {
                    jwt: [],
                },
            ],
            servers: [{ url: '/' }],
        });
    }
}
exports.FoodMarketplaceApplication = FoodMarketplaceApplication;
//# sourceMappingURL=application.js.map