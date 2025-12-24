import { UserService } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import { compare } from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Vendor } from '../models';
import { VendorRepository } from '../repositories';
import { Credentials } from '../types';
import type { SignOptions } from 'jsonwebtoken';

export class VendorUserService implements UserService<Vendor, Credentials> {
  constructor(
    @repository(VendorRepository) public vendorRepository: VendorRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<Vendor> {
    let foundVendor: Vendor | null = null;
    if (credentials.email) {
        foundVendor = await this.vendorRepository.findByEmail(credentials.email);
    } else if (credentials.phone) {
        foundVendor = await this.vendorRepository.findByTelephone(credentials.phone);
    }
    if (!foundVendor) {
      throw new HttpErrors.Unauthorized('Email ou numéro de téléphone invalide.');
    }
    const credentialsFound = await this.vendorRepository.findById(foundVendor.id);
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

  convertToUserProfile(vendor: Vendor): UserProfile {
    return {
      [securityId]: vendor.id!.toString(),
      name: vendor.name,
      id: vendor.id,
      email: vendor.email,
      roles: ['vendor'],
    };
  }

  async generateToken(vendor: Vendor): Promise<string> {
    const userProfile = {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      roles: ['vendor'],
    };

    // Solution : Assurez-vous que le secret est bien une chaîne de caractères.
    const secret = process.env.JWT_SECRET as string;
    if (!secret) {
      throw new HttpErrors.InternalServerError(
        'La variable d\'environnement JWT_SECRET n\'est pas définie.',
      );
    }
    
    const options: SignOptions = {
    expiresIn: '7d',
  };

  const token = jwt.sign(userProfile, secret, options);

    return token;
  }
}
