"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerOptions = exports.STORAGE_DIRECTORY = exports.FILE_UPLOAD_SERVICE = void 0;
const tslib_1 = require("tslib");
const multer_1 = tslib_1.__importDefault(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = tslib_1.__importDefault(require("fs"));
exports.FILE_UPLOAD_SERVICE = 'services.FileUpload';
exports.STORAGE_DIRECTORY = path_1.default.join(__dirname, '../../.sandbox');
if (!fs_1.default.existsSync(exports.STORAGE_DIRECTORY)) {
    fs_1.default.mkdirSync(exports.STORAGE_DIRECTORY, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, exports.STORAGE_DIRECTORY);
    },
    filename: function (req, file, cb) {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    },
});
exports.multerOptions = {
    storage: storage,
};
//# sourceMappingURL=file-upload.js.map