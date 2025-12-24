"use strict";
// src/controllers/file-upload.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const tslib_1 = require("tslib");
const rest_1 = require("@loopback/rest");
const core_1 = require("@loopback/core");
const file_upload_1 = require("../config/file-upload"); // Adaptez le chemin si nécessaire
const multer_1 = tslib_1.__importDefault(require("multer"));
class FileUploadController {
    constructor() { }
    async uploadFile(request, response) {
        return new Promise((resolve, reject) => {
            // On utilise multer pour parser un seul fichier avec la clé 'file'
            const upload = (0, multer_1.default)(file_upload_1.multerOptions).single('file');
            upload(request, response, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (request.file) {
                        // Si l'upload réussit, on renvoie les infos du fichier
                        resolve({
                            message: 'Fichier uploadé avec succès!',
                            filename: request.file.filename,
                            path: request.file.path,
                        });
                    }
                    else {
                        reject(new Error('Aucun fichier trouvé dans la requête.'));
                    }
                }
            });
        });
    }
}
exports.FileUploadController = FileUploadController;
tslib_1.__decorate([
    (0, rest_1.post)('/upload-file', {
        responses: {
            '200': {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                        },
                    },
                },
                description: 'Fichier uploadé avec succès',
            },
        },
    }),
    tslib_1.__param(0, rest_1.requestBody.file()),
    tslib_1.__param(1, (0, core_1.inject)(rest_1.RestBindings.Http.RESPONSE)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadFile", null);
//# sourceMappingURL=file-upload.controller.js.map