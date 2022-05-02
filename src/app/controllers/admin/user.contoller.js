import util from 'util';
import JWT from 'jsonwebtoken';
import userModel from '../../models/users.model';
import config from '../../../config/config';
import SMTP from '../../../utils/email';
import Message from '../../../config/message';
import ejs from 'ejs';
import mailLanguagesModel from '../../models/mailLanguages.model';
import AdminModel from '../../models/admin.model';

exports.add = async (req, res) => {
    try {
        const { params } = req.body;
        params.userName.toLowerCase();
        params.userName = params.userName.toLowerCase();
        await userModel.findOne({ userName: params.userName, status: { $ne: 0 } }).then((foundUser) => {
            if (foundUser) {
                res.status(409).send({ code: 409, Message: Message.errorMessage.userAlreadyExists, data: [], err: [] });
            } else {
                const exe = req.headers.authorization.split(' ');
                const decode = JWT.verify(exe[1], config.JWTSecret);
                params.businessId = decode._id;
                params.isUserActive = "0";
                params.emailVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const saveUser = userModel(params);
                saveUser.save().then(async (result) => {
                    if(result.status == "1"){
                        result.isUserActive = "1";
                        await result.save();
                        let mailContent = await findBusinessAdminLanguage(result.businessId,"signUp");
                        // await ejs.renderFile(config.mailUrl +"email/user/signUp.ejs", { user: result , URL:config.frontendUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                            const mailOptions = { to: result.userName, subject: Message.emails.signup.subject, template: 'user/signUp.ejs', type: 'business', id: decode._id, data: { user: result , URL:config.frontendUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
                            SMTP.email(mailOptions)
                                .then(result => {
                                    res.status(201).send({
                                        code: 201,
                                        message: Message.infoMessage.forgotPassword,
                                        data: [],
                                        error: []
                                    });
                                }).catch((err) => {
                                    res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
                                });
                        // }).catch((err) => {
                        //     res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
                        // });
                    }
                    else{
                        res.status(201).send({ code: 201, message: Message.infoMessage.saveUser, data: [], error: [] });
                    }
                }).catch((err) => {
                    res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
                });
            }
        }).catch((err) => {
            res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
        });
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}
exports.get = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        userModel.find({ status: { $ne: 0 }, businessId: decode._id }).collation({ locale: "en" }).sort({ firstName: 1 }).then((result) => {
            res.status(200).send({ code: 200, Message: Message.infoMessage.getDetails, data: result, err: [] })
        }).catch((err) => {
            res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
        });
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}
exports.verify = async (req, res) => {
    try {
        const { token, password } = req.body.params;
        await userModel.findOne({ emailVerificationToken: token })
            .then((result) => {
                if (result) {
                    result.status = "1";
                    result.password = password;
                    result.save();
                    res.status(200).send({ code: 200, Message: Message.infoMessage.accountVerify, data: [], err: [] });
                } else {
                    res.status(404).send({ code: 404, Message: Message.errorMessage.tokenNotFound, data: [], err: [] });
                }
            }).catch(err => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            });
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}
exports.detail = async (req, res) => {
    try {
        const { params } = req.body;
        await userModel.findOne({ _id: params.id, "status": { $ne: '0' } })
            .then(result => {
                if (result) {
                    res.status(200).send({ code: 200, Message: Message.infoMessage.getDetails, data: result, err: [] });
                }
                else {
                    res.status(404).send({ code: 404, Message: Message.errorMessage.dataNotFound, data: [], err: [] })
                }
            })
            .catch(err => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            })
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}
exports.delete = async (req, res) => {
    try {
        const { params } = req.body;
        await userModel.find({ _id: params.id })
            .then(result => {
                if (result.length > 0) {
                    result[0].status = 0;
                    result[0].save()
                    res.status(200).send({ code: 200, Message: Message.infoMessage.deleteUser, data: result, err: [] });
                }
                else {
                    res.status(404).send({ code: 404, Message: Message.errorMessage.userNotFound, data: result, err: [] });
                }
            })
            .catch(err => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            })
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}
exports.edit = async (req, res) => {
    try {
        const { params } = req.body;
        await userModel.findById(params.id)
        .then(async userData => {
            if(userData.isUserActive == "0" && params.status == "1"){
                params.isUserActive = "1";
                const updateUserData = await updateUser(params);
                let mailContent = await findBusinessAdminLanguage(updateUserData.businessId,"signUp");
                // await ejs.renderFile(config.mailUrl +"email/user/signUp.ejs", { user: updateUserData , URL:config.frontendUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                    const mailOptions = { to: updateUserData.userName, subject: Message.emails.signup.subject, template: 'user/signUp.ejs',  type: 'business', id: decode._id, data: { user: updateUserData , URL:config.frontendUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
                    SMTP.email(mailOptions)
                        .then(result => {
                            res.status(200).send({
                                code: 200,
                                message: Message.infoMessage.forgotPassword,
                                data: [],
                                error: []
                            });
                        }).catch((err) => {
                            res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
                        });
                // }).catch((err) => {
                //     res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
                // });
            }
            else{
                const updateUserData = await updateUser(params);
                res.status(200).send({ code: 200, Message: Message.infoMessage.updateData, data: updateUserData, error: [] });
            }
        })
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}

const updateUser = async (params) => {
    return await userModel.findByIdAndUpdate(params.id, params, { new: true })
            .then((result) => {
                return result;
            }).catch(err => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            });
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