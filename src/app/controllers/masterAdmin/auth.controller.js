import JWT from 'jsonwebtoken';
import Admin from '../../models/admin.model';
import config from '../../../config/config';
import Message from '../../../config/message';
import SMTP from '../../../utils/email';
import util from 'util';
import ejs from 'ejs';

/**
 * Returns jwt token if valid email and password is valid
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body.params;
        await Admin.findOne({ 'email': email.toLowerCase(), adminType: "0" })
            .then((admin) => {
                if (admin) {
                    admin.comparePassword(password, (err, match) => {
                        if (err) {
                            res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
                        }
                        if (match === true) {
                            const token = JWT.sign(admin.toJSON(), config.JWTSecret, { expiresIn: config.JWTExpireTime });
                            res.status(200).send({ code: 200, message: Message.infoMessage.login, data: { token: 'JWT ' + token, user: admin }, error: [] });
                        } else {
                            res.status(401).send({ code: 401, message: Message.errorMessage.userNotFound, data: [], error: [] });
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
exports.singup = async (req, res) => {
    try {
        req.body.params.adminType = "0";
        const saveToUser = Admin(req.body.params);
        await saveToUser.save()
            .then((admin) => {
                res.status(201).send({ code: 201, message: Message.infoMessage.saveUser, data: admin, error: [] });
            })
            .catch((err) => {
                res.status(400).send({ code: 400, message: Message.errorMessage.userAlreadyExists, data: [], error: err });
            });
    } catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
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
        const { email } = req.body.params;
        await Admin.findOne({ 'email': email.toLowerCase() })
            .then((admin) => {
                if (admin) {
                    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    admin.resetPasswordToken = token;
                    admin.resetPasswordExpires = config.resetPasswordTokenExpireTime;
                    admin.save();
                    ejs.renderFile(config.mailUrl + "email/admin/adminForgotpass.ejs", { admin: admin, URL: environment.development.masterAdminUri }).then(content => {
                        const mailOptions = { to: admin.email, subject: Message.masterAdmin.forgotPassword.subject, html: content };
                        SMTP.email(mailOptions)
                            .then(() => {
                                res.status(200).send({ code: 200, message: Message.infoMessage.forgotPassword, data: [], error: [] });
                            })
                    })
                } else {
                    res.status(400).send({ code: 400, message: Message.errorMessage.emailNotFound, data: [], error: [] });
                }
            })
            .catch((err) => {
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err.stack });
            });
    } catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err.stack });
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
        await Admin.findOne({ resetPasswordToken: token })
            .then((admin, error) => {
                if (admin) {
                    admin.password = password;
                    const savedUser = Admin.saveUser(admin);
                    ejs.renderFile(config.mailUrl +"email/admin/resetPass.ejs", { admin: admin, URL: environment.development.masterAdminUri }).then(content => {
                        const mailOptions = { to: admin.email, subject: Message.masterAdmin.resetPassword.subject, html: content };
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
                    })
                } else {
                    res.status(400).send({ code: 400, message: Message.errorMessage.tokenNotFound, data: [], error: [] });
                }
            })
            .catch((err) => {
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err.stack });
            });
    } catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err.stack });
    }
}