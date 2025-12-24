/// <reference types="express" />
import { AuthenticationStrategy } from '@loopback/authentication';
import { Request } from '@loopback/rest';
import { UserProfile } from '@loopback/security';
import { VendorRepository } from '../repositories';
import { VendorUserService } from '../services/vendor-user.service';
export declare class JWTAuthenticationStrategy implements AuthenticationStrategy {
    userService: VendorUserService;
    vendorRepository: VendorRepository;
    private jwtSecret;
    name: string;
    constructor(userService: VendorUserService, vendorRepository: VendorRepository, jwtSecret: string);
    authenticate(request: Request): Promise<UserProfile | undefined>;
    extractCredentials(request: Request): string;
    verifyToken(token: string): Promise<UserProfile>;
}
