import { UserService } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import { compare } from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Client } from '../models';
import { ClientRepository } from '../repositories';
import { Credentials } from '../types';
import type { SignOptions } from 'jsonwebtoken';

export class ClientUserService implements UserService<Client, Credentials> {
  constructor(
    @repository(ClientRepository) public clientRepository: ClientRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<Client> {
    let foundClient: Client | null = null;
    if (credentials.email) {
      foundClient = await this.clientRepository.findByEmail(credentials.email);
    } else if (credentials.phone) {
      foundClient = await this.clientRepository.findByTelephone(credentials.phone!);
    }

    if (!foundClient) {
      throw new HttpErrors.Unauthorized('Email ou numéro de téléphone invalide.');
    }
    const credentialsFound = await this.clientRepository.findById(foundClient.id);
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

  convertToUserProfile(client: Client): UserProfile {
    return {
      [securityId]: client.id!.toString(),
      name: client.name,
      id: client.id,
      email: client.email,
      roles: ['client'],
    };
  }

  async generateToken(client: Client): Promise<string> {
    const userProfile = {
      id: client.id,
      name: client.name,
      email: client.email,
      roles: ['client'],
    };

    const secret = process.env.JWT_SECRET as string;
    if (!secret) {
      throw new HttpErrors.InternalServerError(
        'La variable d\'environnement JWT_SECRET n\'est pas définie.',
      );
    }

    const options: SignOptions = {
      expiresIn: '7d',
    };

    const token = jwt.sign(userProfile, secret);

    return token;
  }
}