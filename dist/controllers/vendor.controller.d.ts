import { Count, Filter, FilterExcludingWhere, Where } from '@loopback/repository';
import { UserProfile } from '@loopback/security';
import { Vendor } from '../models';
import { VendorRepository } from '../repositories';
import { VendorUserService } from '../services/vendor-user.service';
import { Credentials } from '../types';
import { ClientRepository } from '../repositories';
export declare class VendorController {
    vendorRepository: VendorRepository;
    vendorUserService: VendorUserService;
    clientRepository: ClientRepository;
    constructor(vendorRepository: VendorRepository, vendorUserService: VendorUserService, clientRepository: ClientRepository);
    register(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
        token: string;
        vendor: Vendor;
    }>;
    login(credentials: Credentials): Promise<{
        token: string;
        vendor: Vendor;
    }>;
    getCurrentVendor(currentUser: UserProfile): Promise<Vendor>;
    count(where?: Where<Vendor>): Promise<Count>;
    find(filter?: Filter<Vendor>): Promise<Vendor[]>;
    findById(id: string, filter?: FilterExcludingWhere<Vendor>): Promise<Vendor>;
    updateById(id: string, vendor: Partial<Vendor>, currentUser: UserProfile): Promise<void>;
    toggleAvailability(id: string, currentUser: UserProfile): Promise<void>;
    deleteById(id: string, currentUser: UserProfile): Promise<void>;
    changePassword(id: string, passwords: {
        oldPassword: string;
        newPassword: string;
    }, currentUser: UserProfile): Promise<void>;
}
