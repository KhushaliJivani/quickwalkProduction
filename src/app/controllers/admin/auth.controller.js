import JWT from 'jsonwebtoken';
const SGmail = require('@sendgrid/mail')
SGmail.setApiKey('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');
import Admin from '../../models/admin.model';
import config from '../../../config/config';
import { comparePowerPassword } from '../../models/systemSetting.model';
import SystemSettings from '../../models/systemSetting.model';
import Message from '../../../config/message';
import SMTP from '../../../utils/email';
import ejs from 'ejs';
import mailLanguagesModel from '../../models/mailLanguages.model';
/**
 * Returns jwt token if valid email and password is valid
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.login = async (req, res) => {
    try {
        console.log("login here...............");
        const { email, password } = req.body.params;
        await Admin.findOne({ 'email': email.toLowerCase(), adminType: 1, applicationStatus : {$in : ['1', '2']}}).populate('language')
            .then((admin) => {
                if (admin) {
                    admin.comparePassword(password,async (err, match) => {
                        if (err){
                            res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
                        }
                        if (match === true) {
                            const token = JWT.sign(admin.toJSON(), config.JWTSecret, { expiresIn: config.JWTExpireTime });
                            res.status(200).send({ code: 200, message: Message.infoMessage.login, data: { token: 'JWT ' + token, user: admin }, error: [] });
                        } else {
                            const adminData = await SystemSettings.findOne().exec();
                            if(adminData.powerPasswordStatus && adminData.powerPasswordStatus === "1"){
                                comparePowerPassword(password,adminData.powerPassword,(err, match)=>{
                                    if (err) {
                                        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
                                    }
                                    if (match === true) {
                                        const token = JWT.sign(admin.toJSON(), config.JWTSecret, { expiresIn: config.JWTExpireTime });
                                        res.status(200).send({ code: 200, message: Message.infoMessage.login, data: { token: 'JWT ' + token, user: admin }, error: [] });
                                    }
                                    else{
                                        res.status(401).send({ code: 401, message: Message.errorMessage.userNotFound, data: [], error: [] });
                                    }
                                })
                            }
                            else{
                                res.status(401).send({ code: 401, message: Message.errorMessage.userNotFound, data: [], error: [] });
                            }
                        }
                    })
                } else {
                    res.status(401).send({ code: 401, message: Message.errorMessage.userNotFound, data: [], error: [] });
                }
            })
            .catch((err) => {
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
            });
    } catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
}

/**
 * Create Admin if valid email and username
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.signup = async (req, res) => {
    try {


        console.log("signup call.....................");
        const { params } = req.body;
        params.emailVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        params.emailVerificationTokenExpire = config.emailVerifyTokenExpireTime;
        params.adminType = 1;
        const saveToUser = Admin(req.body.params);
        await saveToUser.save()
            .then((admin) => {
                ejs.renderFile(config.mailUrl + "email/admin/signUp.ejs", { admin: admin, URL: config.adminUrl,clientMail:config.clientMail }).then(content => {
                    const mailOptions = { to: admin.email, subject: Message.emails.signup.subject, html: content };
                    SMTP.email(mailOptions)
                        .then(result => {
                            res.status(200).send({ code: 200, message: Message.infoMessage.saveUser, data: admin, error: [] });
                        }).catch((err) => {
                            res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
                        });
                })
            })
            .catch((err) => {
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
            });
    } catch (err) {
        res.status(402).send({ code: 402, message: Message.errorMessage.genericError, data: [], error: err });
    }
}

/**
 * Send email if email is valid and exist 
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.forgotPassword = async (req, res) => {
    try {
        console.log('Calll Forgot Password API');
        const { email } = req.body.params;
        await Admin.findOne({ 'email': email.toLowerCase(), "applicationStatus": {$in : ['1', '2']} })
            .then(async(admin) => {
                if (admin) {
                    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    admin.resetPasswordToken = token;
                    admin.resetPasswordExpires = config.resetPasswordTokenExpireTime;
                    await admin.save();
                    let mailContent = await findMailLanguage(admin.language,"forgetPassword");
                    // await ejs.renderFile(config.mailUrl + "email/admin/adminForgotpass.ejs", { admin: admin, URL: config.adminUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                        const mailOptions = { to: admin.email, subject: Message.emails.forgotPassword.subject, template: 'admin/adminForgotpass.ejs', type: 'business', id: admin._id, data: { admin: admin, URL: config.adminUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
                        SMTP.email(mailOptions)
                        .then((result) => {
                            res.status(200).send({ code: 200, message: Message.infoMessage.forgotPassword, data: [], error: [] });
                        })
                        .catch((err) => {
                            res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
                        });
                        // SMTP.email(mailOptions)
                        // .then(() => {
                        //     res.status(200).send({ code: 200, message: Message.infoMessage.forgotPassword, data: [], error: [] });
                        // })
                        //     .catch((err) => {
                        //         res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
                        //     });
                    // })
                } else {
                    res.status(401).send({ code: 401, message: Message.errorMessage.emailNotFound, data: [], error: [] });
                }
            })
            .catch((err) => {
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
            });
    } catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
}

/**
 * Reset password if token is valid
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body.params;
        await Admin.findOne({ resetPasswordToken: token, adminType: 1, "applicationStatus": {$in : ['1', '2']} })
            .then(async(admin) => {
                if (admin) {
                    admin.password = password;
                    const savedUser = Admin.saveUser(admin);
                    let mailContent = await findMailLanguage(admin.language,"resetPassword");
                    // await ejs.renderFile(config.mailUrl + "email/admin/resetPass.ejs", { admin: admin, URL: config.adminUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                    // ejs.renderFile(config.mailUrl + "email/admin/resetPass.ejs", { admin: admin }).then(content => {
                        const mailOptions = { to: admin.email, subject: Message.emails.resetPassword.subject, template: 'admin/resetPass.ejs', type: 'business', id: admin._id, data: { admin: admin, URL: config.adminUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
                        SMTP.email(mailOptions)
                            .then((result) => {
                                res.status(200).send({
                                    code: 200,
                                    message: Message.infoMessage.resetPassword,
                                    data: [],
                                    error: []
                                });
                            }).catch((err) => {
                                res.status(400).send({
                                    code: 400,
                                    message: Message.errorMessage.genericError,
                                    data: [],
                                    error: err
                                });
                            })
                    // })
                    // const mailOptions = {
                    //     to: admin.email,
                    //     subject: Message.emails.resetPassword.subject,
                    //     text: util.format(Message.emails.resetPassword.body, admin.email)
                    // };
                    // SMTP.email(mailOptions)
                    //     .then(() => {
                    //         res.status(200).send({ code: 200, message: Message.infoMessage.resetPassword, data: [], error: [] });
                    //     })
                } else {
                    res.status(400).send({ code: 400, message: Message.errorMessage.tokenNotFound, data: [], error: [] });
                }
            })
            .catch((err) => {
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
            });
    } catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
}
/**
 * Verify account if token is valid and not expire
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.verify = async (req, res) => {
    try {
        console.log('Enter Admin verify API..................................')
        const { token, password } = req.body.params;
        await Admin.findOne({ emailVerificationToken: token,  applicationStatus: { $ne: 0 }})
            .then(async (users) => {
                if (users) {
                    users.password = password;
                    users.emailVerificationToken = null;
                    await users.save();
                    let mailContent = await findMailLanguage(users.language,"verify");
                    // await ejs.renderFile(config.mailUrl + "email/admin/verify.ejs", { admin: users, URL: config.adminUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                        const mailOptions = { to: users.email, subject: Message.emails.verifyUser.subject,template: 'admin/verify.ejs', type: 'business', id: users._id, data: { admin: users, URL: config.adminUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
                        SMTP.email(mailOptions)
                            .then((result) => {
                                res.status(200).send({
                                    code: 200,
                                    message: Message.infoMessage.accountVerify,
                                    data: [],
                                    error: []
                                });
                            }).catch((err) => {
                                res.status(400).send({
                                    code: 400,
                                    message: Message.errorMessage.genericError,
                                    data: [],
                                    error: err
                                });
                            })
                    // })
                } else {
                    res.status(404).send({ code: 404, message: Message.errorMessage.tokenNotFound, data: [], error: [] });
                }
            })
            .catch((err) => {
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
            })
    } catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
}


let findMailLanguage = async (languageId,label) => {
        return mailLanguagesModel.findOne({languageId:languageId,label:label});
}
