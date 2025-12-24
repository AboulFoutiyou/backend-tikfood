"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCredentials = void 0;
const rest_1 = require("@loopback/rest");
function validateCredentials(credentials) {
    // Validate Email
    if (credentials.email && !isValidEmail(credentials.email)) {
        throw new rest_1.HttpErrors.UnprocessableEntity('Address email invalide');
    }
    // Validate Phone Number
    if (credentials.phone && !isValidPhone(credentials.phone)) {
        throw new rest_1.HttpErrors.UnprocessableEntity('Numéro de téléphone invalide');
    }
    // Validate Password Length
    if (!credentials.password || credentials.password.length < 8) {
        throw new rest_1.HttpErrors.UnprocessableEntity('Le mot de passe doit contenir au moins 8 caractères');
    }
}
exports.validateCredentials = validateCredentials;
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidPhone(phone) {
    // Le numero doit commencer par 70, 76, 77, ou 78 et être suivi de 7 chiffres
    const phoneRegex = /^(70|76|77|78)\d{7}$/;
    return phoneRegex.test(phone);
}
//# sourceMappingURL=validator.service.js.map