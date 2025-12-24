"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTAuthenticationStrategy = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const repository_1 = require("@loopback/repository"); // <-- NOUVEL IMPORT
const rest_1 = require("@loopback/rest");
const jwt = tslib_1.__importStar(require("jsonwebtoken"));
const repositories_1 = require("../repositories");
const vendor_user_service_1 = require("../services/vendor-user.service"); // Importez votre service
const keys_1 = require("../services/keys");
const authentication_jwt_1 = require("@loopback/authentication-jwt");
let JWTAuthenticationStrategy = class JWTAuthenticationStrategy {
    constructor(userService, vendorRepository, jwtSecret) {
        this.userService = userService;
        this.vendorRepository = vendorRepository;
        this.jwtSecret = jwtSecret;
        this.name = 'jwt';
    }
    async authenticate(request) {
        const token = this.extractCredentials(request);
        const userProfile = await this.verifyToken(token);
        return userProfile;
    }
    extractCredentials(request) {
        if (!request.headers.authorization) {
            throw new rest_1.HttpErrors.Unauthorized(`Authorization header not found.`);
        }
        const authHeaderValue = request.headers.authorization;
        if (!authHeaderValue.startsWith('Bearer')) {
            throw new rest_1.HttpErrors.Unauthorized(`Authorization header is not of type 'Bearer'.`);
        }
        const parts = authHeaderValue.split(' ');
        if (parts.length !== 2)
            throw new rest_1.HttpErrors.Unauthorized(`Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`);
        return parts[1];
    }
    async verifyToken(token) {
        // const secret = process.env.JWT_SECRET as string;
        // if (!secret) {
        //   throw new HttpErrors.InternalServerError('JWT_SECRET non défini.');
        // }
        try {
            const decodedToken = jwt.verify(token, this.jwtSecret);
            if (!decodedToken.id) {
                throw new rest_1.HttpErrors.Unauthorized('Invalid token: ID is missing');
            }
            const vendor = await this.vendorRepository.findById(decodedToken.id);
            if (!vendor) {
                throw new rest_1.HttpErrors.Unauthorized('User not found for this token');
            }
            return this.userService.convertToUserProfile(vendor);
        }
        catch (error) {
            throw new rest_1.HttpErrors.Unauthorized(`Error during token verification: ${error.message}`);
        }
    }
};
exports.JWTAuthenticationStrategy = JWTAuthenticationStrategy;
exports.JWTAuthenticationStrategy = JWTAuthenticationStrategy = tslib_1.__decorate([
    (0, core_1.injectable)(),
    tslib_1.__param(0, (0, core_1.inject)(keys_1.VendorUserServiceBindings.USER_SERVICE)),
    tslib_1.__param(1, (0, repository_1.repository)(repositories_1.VendorRepository)),
    tslib_1.__param(2, (0, core_1.inject)(authentication_jwt_1.TokenServiceBindings.TOKEN_SECRET)),
    tslib_1.__metadata("design:paramtypes", [vendor_user_service_1.VendorUserService,
        repositories_1.VendorRepository, String])
], JWTAuthenticationStrategy);
//# sourceMappingURL=jwt-strategy.js.map