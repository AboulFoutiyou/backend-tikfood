"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenServiceConstants = exports.VendorUserServiceBindings = void 0;
const core_1 = require("@loopback/core");
var VendorUserServiceBindings;
(function (VendorUserServiceBindings) {
    VendorUserServiceBindings.USER_SERVICE = core_1.BindingKey.create('services.VendorUserService');
})(VendorUserServiceBindings || (exports.VendorUserServiceBindings = VendorUserServiceBindings = {}));
var TokenServiceConstants;
(function (TokenServiceConstants) {
    TokenServiceConstants.TOKEN_SECRET_VALUE = process.env.JWT_SECRET ?? 'your-secret-key';
})(TokenServiceConstants || (exports.TokenServiceConstants = TokenServiceConstants = {}));
//# sourceMappingURL=keys.js.map