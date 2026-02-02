import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {compare} from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {Vendor, Client} from '../models';
import {VendorRepository, ClientRepository} from '../repositories';
import {Credentials} from '../types';
import type {SignOptions} from 'jsonwebtoken';

export class SimpleUserService implements UserService<Client | Vendor, Credentials> {
  constructor(
    @repository(ClientRepository) public clientRepository: ClientRepository,
    @repository(VendorRepository) public vendorRepository: VendorRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<Client | Vendor> {
    let foundUser: Client | Vendor | null = null;
    let userType: 'client' | 'vendor' | null = null;
    if (credentials.email) {
      foundUser = await this.vendorRepository.findByEmail(credentials.email);
      userType = foundUser ? 'vendor' : null;
      if (!foundUser) {
        foundUser = await this.clientRepository.findByEmail(credentials.email);
        userType = foundUser ? 'client' : null;
      }
    } else if (credentials.phone) {
      foundUser = await this.vendorRepository.findByTelephone(credentials.phone);
      userType = foundUser ? 'vendor' : null;
      if (!foundUser) {
        foundUser = await this.clientRepository.findByTelephone(credentials.phone);
        userType = foundUser ? 'client' : null;
      }
    }
    if (!foundUser) {
      throw new HttpErrors.Unauthorized('Email ou numéro de téléphone invalide.');
    }
    const credentialsFound = userType === 'vendor'
      ? await this.vendorRepository.findById(foundUser.id)
      : await this.clientRepository.findById(foundUser.id);
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized('Utilisateur non trouvé.');
    }
    const passwordMatched = await compare(
      credentials.password,
      credentialsFound.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Mot de passe incorrect.');
    }
    return credentialsFound;
  }

  convertToUserProfile(user: Client | Vendor): UserProfile {
    const role = (user as any).isAvailable !== undefined ? 'vendor' : 'client';
    return {
      [securityId]: user.id!.toString(),
      name: user.name,
      id: user.id,
      email: user.email,
      roles: [role],
    };
  }

  async generateToken(user: Client | Vendor): Promise<string> {
    const role = (user as any).isAvailable !== undefined ? 'vendor' : 'client';
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: [role],
    };
    const secret = process.env.JWT_SECRET || 'tokensecret';
    const options: SignOptions = {expiresIn: '7d'};
    return jwt.sign(userProfile, secret, options);
  }
}
