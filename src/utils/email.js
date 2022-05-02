import nodemailer from 'nodemailer';
import ejs from 'ejs';
import config from '../config/config';
const SGmail = require('@sendgrid/mail')
SGmail.setApiKey('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');
import util from 'util';
import Admin from '../app/models/admin.model';
import Users from '../app/models/users.model';
import SystemSettings from '../app/models/systemSetting.model';


module.exports.email = (params) => {
    return new Promise((resolve, reject) => {
        try {
            getToEmail(params).then((result) => {
                console.log('result...........................', result)
                params.data.applicationStatus = result.applicationStatus;
                params.data.originalToEMail = result.originalToEMail;
                ejs.renderFile(config.mailUrl + "email/" + params.template, params.data)
                    .then(content => {
                        params.html = content;
                        if (params.envelope !== undefined) {
                            params.envelope.to = result.to;
                        } else {
                            params.to = result.to;
                        }
                        console.log('params.to...............................................', params.to)
                        const smtpTransport = nodemailer.createTransport({
                            host: 'send.one.com',
                            port: 465,
                            // secure: true,
                            auth: {
                                user: 'verification@quick-walk.com',
                                pass: 'brownsugar'
                            }
                        });
                        if (params.from == undefined) {
                            params.from = 'verification@quick-walk.com';
                        }
                        smtpTransport.sendMail(params, (err, info) => {
                            if (err) reject(err, []);
                            if (info) resolve(info);
                        })
                    })
            });
        } catch (err) {
            reject(err);
        }
    });
}


const getToEmail = (params) => {
    console.log(params);
    return new Promise((resolve, reject) => {
        if (params.type == 'user') {
            resolve({
                to: params.envelope !== undefined ? params.envelope.to : params.to,
                applicationStatus: '2',
                originalToEMail: params.envelope !== undefined ? params.envelope.to : params.to
            })
        } else if (params.type == 'business') {
            return Admin.findById(params.id).then((admin) => {
                console.log('Admin.............................', admin);
                if (admin.applicationStatus == 1) {
                    SystemSettings.findOne().then((settings) => {
                        resolve({
                            to: settings.masterEmail,
                            applicationStatus: admin.applicationStatus,
                            originalToEMail: (params.envelope !== undefined) ? params.envelope.to : params.to
                        })
                    }).catch((err) => {
                        reject(err)
                    })
                } else {
                    resolve({
                        to: params.envelope !== undefined ? params.envelope.to : params.to,
                        applicationStatus: '2',
                        originalToEMail: params.envelope !== undefined ? params.envelope.to : params.to
                    })
                    // resolve(params.to);
                }
            })
        } else {
            resolve({
                to: params.envelope !== undefined ? params.envelope.to : params.to,
                applicationStatus: '2',
                originalToEMail: params.envelope !== undefined ? params.envelope.to : params.to
            })
        }
    });
}
// module.exports.email = (params) => {
//     return new Promise((resolve, reject) => {
//         try {
//             if(params.from == undefined) {
//                 params.from = 'verification@quick-walk.com';
//             }
//             SGmail.send(params,(err, info) => {
//                 if (err) reject(err, []);
//                 if (info) resolve(info);
//             });
//         } catch (err) {
//             console.log("------------------errr",errr)
//             reject(err);
//         }
//     });
// }



// module.exports.email = (params, callback) => {
//     try {
//         const smtpTransport = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'ramsolanki.viitorcloud@gmail.com',
//                 pass: 'RAhir@123'
//             }
//         });
//         params.from = 'ramsolanki.viitorcloud@gmail.com';
//         smtpTransport.sendMail(params, (err, info) => {
//             if (err) callback(err, []);
//             if (info) callback(undefined, info);
//         })
//     } catch (err) {
//         callback(err, []);
//     }
// }