"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorUserService = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const security_1 = require("@loopback/security");
const bcryptjs_1 = require("bcryptjs");
const jwt = tslib_1.__importStar(require("jsonwebtoken"));
const repositories_1 = require("../repositories");
let VendorUserService = class VendorUserService {
    constructor(vendorRepository) {
        this.vendorRepository = vendorRepository;
    }
    async verifyCredentials(credentials) {
        let foundVendor = null;
        if (credentials.email) {
            foundVendor = await this.vendorRepository.findByEmail(credentials.email);
        }
        else if (credentials.phone) {
            foundVendor = await this.vendorRepository.findByTelephone(credentials.phone);
        }
        if (!foundVendor) {
            throw new rest_1.HttpErrors.Unauthorized('Email ou numéro de téléphone invalide.');
        }
        const credentialsFound = await this.vendorRepository.findById(foundVendor.id);
        if (!credentialsFound) {
            throw new rest_1.HttpErrors.Unauthorized('Utilisateur non trouvé.');
        }
        const passwordMatched = await (0, bcryptjs_1.compare)(credentials.password, credentialsFound.password);
        if (!passwordMatched) {
            throw new rest_1.HttpErrors.Unauthorized('Mot de passe incorrect.');
        }
        return credentialsFound;
    }
    convertToUserProfile(vendor) {
        return {
            [security_1.securityId]: vendor.id.toString(),
            name: vendor.name,
            id: vendor.id,
            email: vendor.email,
            roles: ['vendor'],
        };
    }
    async generateToken(vendor) {
        const userProfile = {
            id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            roles: ['vendor'],
        };
        // Solution : Assurez-vous que le secret est bien une chaîne de caractères.
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new rest_1.HttpErrors.InternalServerError('La variable d\'environnement JWT_SECRET n\'est pas définie.');
        }
        const options = {
            expiresIn: '7d',
        };
        const token = jwt.sign(userProfile, secret, options);
        return token;
    }
};
exports.VendorUserService = VendorUserService;
exports.VendorUserService = VendorUserService = tslib_1.__decorate([
    tslib_1.__param(0, (0, repository_1.repository)(repositories_1.VendorRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.VendorRepository])
], VendorUserService);
//# sourceMappingURL=vendor-user.service.js.map