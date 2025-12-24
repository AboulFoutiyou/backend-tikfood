import {AuthenticationStrategy} from '@loopback/authentication';
import {inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository'; // <-- NOUVEL IMPORT
import {HttpErrors, Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import * as jwt from 'jsonwebtoken';
import {VendorRepository} from '../repositories';
import {VendorUserService} from '../services/vendor-user.service'; // Importez votre service
import {VendorUserServiceBindings, TokenServiceConstants} from '../services/keys';
import {TokenServiceBindings} from '@loopback/authentication-jwt';

@injectable()
export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name = 'jwt';

  constructor(
     @inject(VendorUserServiceBindings.USER_SERVICE)
    public userService: VendorUserService,

    @repository(VendorRepository)
    public vendorRepository: VendorRepository,

    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token: string = this.extractCredentials(request);
    const userProfile: UserProfile = await this.verifyToken(token);
    return userProfile;
  }

  extractCredentials(request: Request): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`,
      );
    }

    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
      );

    return parts[1];
  }

  async verifyToken(token: string): Promise<UserProfile> {
    // const secret = process.env.JWT_SECRET as string;
    // if (!secret) {
    //   throw new HttpErrors.InternalServerError('JWT_SECRET non défini.');
    // }
    try {
      const decodedToken = jwt.verify(token, this.jwtSecret) as any;

      if (!decodedToken.id) {
        throw new HttpErrors.Unauthorized('Invalid token: ID is missing');
      }

      const vendor = await this.vendorRepository.findById(decodedToken.id);
      if (!vendor) {
        throw new HttpErrors.Unauthorized('User not found for this token');
      }

      return this.userService.convertToUserProfile(vendor);
    } catch (error: any) {
      throw new HttpErrors.Unauthorized(
        `Error during token verification: ${error.message}`,
      );
    }
  }
  
}
