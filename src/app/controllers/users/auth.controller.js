import JWT from 'jsonwebtoken';
import UserModel from '../../models/users.model';
import config from '../../../config/config';
import SMTP from '../../../utils/email';
import Message from '../../../config/message';
import util from 'util';
import ejs from 'ejs';
import languageModel from '../../models/language.model';
import AdminModel from '../../models/admin.model';
import mailLanguagesModel from '../../models/mailLanguages.model';
import SystemSettings, { comparePowerPassword } from '../../models/systemSetting.model';


/**
 * Create User if valid email and username
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.singup = async (req, res) => {
    try {
        req.body.params.emailVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        req.body.params.emailVerificationTokenExpire = config.emailVerifyTokenExpireTime;
        const saveToUser = UserModel(req.body.params);
        await saveToUser.save()
            .then((user) => {
                ejs.renderFile(config.mailUrl + "email/user/singUp.ejs", { user: user, URL: config.frontendUrl }).then(content => {
                    const mailOptions = { to: user.userName, subject: Message.emails.signup.subject, html: content };
                    SMTP.email(mailOptions)
                        .then(result => {
                            res.status(200).send({
                                code: 200,
                                message: Message.infoMessage.forgotPassword,
                                data: [],
                                error: []
                            });
                        })
                        .catch(err => {
                            res.status(400).send({
                                code: 400,
                                message: Message.errorMessage.genericError,
                                data: [],
                                error: err
                            });
                        })
                    //     if (err) {
                    //         res.status(400).send({
                    //             code: 400,
                    //             message: Message.errorMessage.genericError,
                    //             data: [],
                    //             error: err
                    //         });
                    //     }
                    //     res.status(200).send({
                    //         code: 200,
                    //         message: Message.infoMessage.forgotPassword,
                    //         data: [],
                    //         error: []
                    //     });
                    // });
                })
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.saveUser,
                    data: user,
                    error: []
                });
            })
            .catch(err => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    error: err
                });
            });
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}
exports.login = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        params.userName = params.userName.toLowerCase();
        await UserModel.findOne({
            'userName': params.userName,
            status: 1
        })
            .then((user) => {
                if (user) {
                    user.comparePassword(params.password,async (err, match) => {
                        if (match === true) {
                            if (user.status == "1") {
                                AdminModel.findById(user.businessId)
                                .then(admin => {
                                    if(admin.applicationStatus == "2" || admin.applicationStatus == "1"){
                                        UserModel.findById(user._id).populate({path:'businessId',model:AdminModel,"select":"language timeZone","populate":{path:'language',model:languageModel}})
                                        .then(language => {
                                            const token = JWT.sign(user.toJSON(), config.JWTSecret, {
                                                expiresIn: config.JWTExpireTime
                                            });
                                            res.status(200).send({
                                                code: 200,
                                                message: Message.infoMessage.login,
                                                data: {
                                                    token: 'JWT ' + token,
                                                    user: user,
                                                    language: language.businessId.language,
                                                    // timeZone: language.businessId.timeZone  /**Set global timezone */
                                                },
                                                error: []
                                            });
                                        })
                                        .catch(err => {
                                            res.status(400).send({
                                                code: 400,
                                                message: Message.errorMessage.genericError,
                                                data: [],
                                                error: err
                                            });
                                        })
                                    }
                                    else{
                                        res.status(401).send({
                                            code: 401,
                                            message: Message.errorMessage.accountNotActive,
                                            data: [],
                                            error: []
                                        });
                                    }
                                })
                            } else {
                                res.status(402).send({
                                    code: 402,
                                    message: Message.errorMessage.accountNotActive,
                                    data: [],
                                    error: []
                                });
                            }
                        } else {
                            const adminData = await SystemSettings.findOne().exec();
                            if(adminData.powerPasswordStatus === "1"){
                                comparePowerPassword(params.password,adminData.powerPassword,(err, match)=>{
                                    if (err) {
                                        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
                                    }
                                    if (match === true) {
                                        UserModel.findById(user._id).populate({path:'businessId',model:AdminModel,"select":"language timeZone","populate":{path:'language',model:languageModel}})
                                        .then(language => {
                                            const token = JWT.sign(user.toJSON(), config.JWTSecret, {
                                                expiresIn: config.JWTExpireTime
                                            });
                                            res.status(200).send({
                                                code: 200,
                                                message: Message.infoMessage.login,
                                                data: {
                                                    token: 'JWT ' + token,
                                                    user: user,
                                                    language: language.businessId.language,
                                                    // timeZone: language.businessId.timeZone  /**Set global timezone */
                                                },
                                                error: []
                                            });
                                        })
                                        .catch(err => {
                                            res.status(400).send({
                                                code: 400,
                                                message: Message.errorMessage.genericError,
                                                data: [],
                                                error: err
                                            });
                                        })
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
                    res.status(401).send({
                        code: 401,
                        message: Message.errorMessage.userNotFound,
                        data: [],
                        error: []
                    });
                }
            })
            .catch(err => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    error: err
                });
            })
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
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
        const {
            params
        } = req.body;
        params.userName = params.userName.toLowerCase();
        await UserModel.findOne({
            'userName': params.userName, "status": "1"
        })
            .then(async (user) => {
                if (user) {
                    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = config.resetPasswordTokenExpireTime;
                    await user.save();
                    let mailContent = await findBusinessAdminLanguage(user.businessId,"forgetPassword");
                    // await ejs.renderFile(config.mailUrl + "email/user/userForgotPass.ejs", { user: user,clientMail:config.clientMail, URL: config.frontendUrl, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                        const mailOptions = { to: user.userName, subject: Message.emails.forgotPassword.subject, type:'business',template: 'user/userForgotPass.ejs', id: user.businessId, data: { user: user,clientMail:config.clientMail, URL: config.frontendUrl, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
                        SMTP.email(mailOptions).then((result) => {
                            res.status(200).send({
                                code: 200,
                                message: Message.infoMessage.forgotPassword,
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
                    res.status(401).send({
                        code: 401,
                        message: Message.errorMessage.emailNotFound,
                        data: [],
                        error: []
                    });
                }
            })
            .catch((err) => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    error: err
                });
            });
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
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
    console.log('Reset Password user API........................')
    try {
        const {
            password,
            token
        } = req.body.params;
        await UserModel.findOne({
            resetPasswordToken: token,
            status: { $ne: 0 }
        })
            .then(async (user) => {
                if (user) {
                    user.password = password;
                    await user.save();
                    let mailContent = await findBusinessAdminLanguage(user.businessId,"resetPassword");
                    // await ejs.renderFile(config.mailUrl + "email/user/resetPass.ejs", { user: user,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                        const mailOptions = { to: user.userName, subject: Message.emails.resetPassword.subject, template: 'user/resetPass.ejs', type:'business', id: user.businessId, data: { user: user,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
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
                } else {
                    res.status(401).send({
                        code: 401,
                        message: Message.errorMessage.tokenNotFound,
                        data: [],
                        error: []
                    });
                }
            })
            .catch((err) => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    error: err
                });
            });
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
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
        console.log('Enter In verify user API..............................')
        const {
            token,
            password
        } = req.body.params;
        await UserModel.findOne({
            emailVerificationToken: token,
            status: { $ne: 0 }
        })
            .then(async (users) => {
                if (users) {
                    users.password = password;
                    users.emailVerificationToken = null;
                    await users.save();
                    let mailContent = await findBusinessAdminLanguage(users.businessId,"verify");
                    // await ejs.renderFile(config.mailUrl + "email/user/verify.ejs", { user: users, URL: config.frontendUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                        const mailOptions = { to: users.userName, subject: Message.emails.verifyUser.subject, type:'business',template: 'user/verify.ejs', id: users.businessId, data: { user: users, URL: config.frontendUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
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
                }
                else {
                    res.status(404).send({
                        code: 404,
                        message: Message.errorMessage.tokenNotFound,
                        data: [],
                        error: []
                    });
                }
            })
            .catch((err) => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    error: err
                });
            })
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}

let findBusinessAdminLanguage = async (businessId,label) => {
    return await AdminModel.findById(businessId).select("language")
    .then((getLanguage) => {
        return mailLanguagesModel.findOne({languageId:getLanguage.language,label:label});
    })
    .catch((err) => {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    })
}