import { UserService } from '@loopback/authentication';
import { UserProfile } from '@loopback/security';
import { Vendor } from '../models';
import { VendorRepository } from '../repositories';
import { Credentials } from '../types';
export declare class VendorUserService implements UserService<Vendor, Credentials> {
    vendorRepository: VendorRepository;
    constructor(vendorRepository: VendorRepository);
    verifyCredentials(credentials: Credentials): Promise<Vendor>;
    convertToUserProfile(vendor: Vendor): UserProfile;
    generateToken(vendor: Vendor): Promise<string>;
}
