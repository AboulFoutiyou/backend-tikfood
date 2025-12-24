import { UserService } from '@loopback/authentication';
import { UserProfile } from '@loopback/security';
import { Client } from '../models';
import { ClientRepository } from '../repositories';
import { Credentials } from '../types';
export declare class ClientUserService implements UserService<Client, Credentials> {
    clientRepository: ClientRepository;
    constructor(clientRepository: ClientRepository);
    verifyCredentials(credentials: Credentials): Promise<Client>;
    convertToUserProfile(client: Client): UserProfile;
    generateToken(client: Client): Promise<string>;
}
