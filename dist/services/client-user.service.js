"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientUserService = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const security_1 = require("@loopback/security");
const bcryptjs_1 = require("bcryptjs");
const jwt = tslib_1.__importStar(require("jsonwebtoken"));
const repositories_1 = require("../repositories");
let ClientUserService = class ClientUserService {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async verifyCredentials(credentials) {
        let foundClient = null;
        if (credentials.email) {
            foundClient = await this.clientRepository.findByEmail(credentials.email);
        }
        else if (credentials.phone) {
            foundClient = await this.clientRepository.findByTelephone(credentials.phone);
        }
        if (!foundClient) {
            throw new rest_1.HttpErrors.Unauthorized('Email ou numéro de téléphone invalide.');
        }
        const credentialsFound = await this.clientRepository.findById(foundClient.id);
        if (!credentialsFound) {
            throw new rest_1.HttpErrors.Unauthorized('Utilisateur non trouvé.');
        }
        const passwordMatched = await (0, bcryptjs_1.compare)(credentials.password, credentialsFound.password);
        if (!passwordMatched) {
            throw new rest_1.HttpErrors.Unauthorized('Mot de passe incorrect.');
        }
        return credentialsFound;
    }
    convertToUserProfile(client) {
        return {
            [security_1.securityId]: client.id.toString(),
            name: client.name,
            id: client.id,
            email: client.email,
            roles: ['client'],
        };
    }
    async generateToken(client) {
        const userProfile = {
            id: client.id,
            name: client.name,
            email: client.email,
            roles: ['client'],
        };
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new rest_1.HttpErrors.InternalServerError('La variable d\'environnement JWT_SECRET n\'est pas définie.');
        }
        const options = {
            expiresIn: '7d',
        };
        const token = jwt.sign(userProfile, secret);
        return token;
    }
};
exports.ClientUserService = ClientUserService;
exports.ClientUserService = ClientUserService = tslib_1.__decorate([
    tslib_1.__param(0, (0, repository_1.repository)(repositories_1.ClientRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.ClientRepository])
], ClientUserService);
//# sourceMappingURL=client-user.service.js.map