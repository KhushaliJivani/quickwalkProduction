'use strict';
import multer from 'multer';
import FS from 'fs';
import config from '../config/config'

module.exports.uploadFile = (params, req, res) => {
    return new Promise((resolve, reject) => {
        try {
            let imageName = "";
            const storage = multer.diskStorage({
                destination: (req, file, callback) => {
                    callback(null, config.uploadFilePath + params.destination);
                },
                filename: (req, file, callback) => {
                    const exe = file.originalname.split('.');
                    imageName = Date.now() + '.' + exe[exe.length - 1];
                    callback(null, imageName);
                }
            });
            const upload = multer({
                storage: storage
            }).single(params.fieldName)
            upload(req, res, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(imageName)
                }
            })
        } catch (err) {
            reject(err);
        }
    });

}


// module.exports.uploadFile = (params, req, res, callback) => {
//     try {
//         return new Promise((resolve, reject) => {
//             let imageName = "";
//             const storage = multer.diskStorage({
//                 destination: (req, file, callback) => {
//                     callback(null, './src/public/upload/' + params.destination);
//                 },
//                 filename: (req, file, callback) => {
//                     const exe = file.originalname.split('.');
//                     imageName = Date.now() + '.' + exe[exe.length - 1];
//                     callback(null, imageName);
//                 }
//             });
//             const upload = multer({ storage: storage }).single(params.fieldName)
//             upload(req, res, (err, result) => {
//                 if (err) {
//                     callback(err, undefined)
//                 } else {
//                     callback(undefined, imageName)
//                 }
//             })
//         });
//     } catch (err) {
//         callback(err, undefined);
//     }
// }


/*
module.exports.base64Upload = (params) => {
    try {
        console.log('params....................................................................', params);
        const splite = params.decodeImage.split(',');
        const binaryData = new Buffer(splite[1], 'base64').toString('binary');
        const exe = params.imageOrignalName.split('.');
        const imageName = exe[0] + '-' + Date.now() + '.' + exe[exe.length - 1];
        FS.writeFile("src/public/upload/" + params.destination + '/' + imageName, binaryData, "binary", (err, data) => {
            if (err) {
                console.log('err', err)
                return err;
            } else {
                console.log('imageName', imageName)
                return imageName;
            }
        });
    } catch (err) {
        console.log('err', err)
        return err;
    }
}
*/
module.exports.base64Upload = (params) => {
    return new Promise((resolve, reject) => {
        try {
            const splite = params.decodeImage.split(',');
            const binaryData = new Buffer(splite[1], 'base64').toString('binary');
            const exe = params.imageOrignalName.split('.');
            const imageName = exe[0] + '-' + Date.now() + '.' + exe[exe.length - 1];
            // FS.writeFile("public/upload/" + params.destination + '/' + imageName, binaryData, "binary", (err, data) => {
            FS.writeFile(config.base64FilePath + params.destination + '/' + imageName, binaryData, "binary", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(imageName);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}