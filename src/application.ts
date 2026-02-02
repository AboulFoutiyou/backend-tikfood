import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import { authorize } from '@loopback/authorization';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  SECURITY_SCHEME_SPEC,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {AuthorizationComponent} from '@loopback/authorization';
import {JWTAuthenticationStrategy} from './authentication-strategies/jwt-strategy';
import {VendorUserService} from './services/vendor-user.service';
import {corsMiddleware} from './middleware/cors.middleware';
import {MiddlewareMixin} from '@loopback/rest';
import {FILE_UPLOAD_SERVICE, multerOptions} from './config/file-upload';
import {FileUploadController} from './controllers/file-upload.controller';
import {RestBindings} from '@loopback/rest';
import {AuthenticationBindings} from '@loopback/authentication';
import {TokenServiceBindings, TokenServiceConstants, JWTService} from '@loopback/authentication-jwt';


export {ApplicationConfig};

export class FoodMarketplaceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(MiddlewareMixin(RestApplication))),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Cors middleware setup
    this.middleware(corsMiddleware);

    this.bind('rest.cors.options').to({
      origin: ['http://localhost:8100', 'https://tikfood-203c5.web.app'], // ou spécifie l’URL de ton front, ex: 'http://localhost:4200'
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true, // si tu utilises des cookies ou l’authentification
    });
    

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));
    this.static('/uploads', path.join(__dirname, '../.sandbox'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // Add authentication component
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.component(AuthorizationComponent);

    // Register JWT authentication strategy
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

     this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      process.env.JWT_SECRET ?? TokenServiceConstants.TOKEN_SECRET_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      process.env.JWT_EXPIRES_IN ?? TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    

    // Bind user service
    //this.bind(UserServiceBindings.USER_SERVICE).toClass(VendorUserService);

    this.bind('authorization.authorize').to(authorize);

    // Add security scheme to OpenAPI spec
    this.addSecuritySpec();

     this.configure(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
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

  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'Food Marketplace API',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }
}