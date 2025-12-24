import {HttpErrors} from '@loopback/rest';
import {Credentials} from '../types';

export function validateCredentials(credentials: Credentials) {
  // Validate Email
  if (credentials.email && !isValidEmail(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('Address email invalide');
  }

  // Validate Phone Number
  if (credentials.phone && !isValidPhone(credentials.phone)) {
    throw new HttpErrors.UnprocessableEntity('Numéro de téléphone invalide');
  }

  // Validate Password Length
  if (!credentials.password || credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'Le mot de passe doit contenir au moins 8 caractères',
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Le numero doit commencer par 70, 76, 77, ou 78 et être suivi de 7 chiffres
  const phoneRegex = /^(70|76|77|78)\d{7}$/;
  return phoneRegex.test(phone);
}