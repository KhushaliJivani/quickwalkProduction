import JWT from 'jsonwebtoken';
import config from '../../../config/config';
import Message from '../../../config/message';
import UsersModel from '../../models/users.model';
// import groupModel from '../../models/group.model';
import uploadFile from '../../../utils/uploadFile';

/**
 * Update Profile if params is valid
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.updateProfile = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        if (params.image !== undefined && params.image !== null) {
            const pam = {
                'destination': 'profile-image',
                'decodeImage': params.image,
                fieldName: 'image',
                imageOrignalName: params.imageName
            };
            uploadFile.base64Upload(pam, (err, imageName) => {
                if (imageName) {
                    params.image = imageName;
                    UsersModel.findByIdAndUpdate(decode._id, params, {
                        upsert: true,
                        new: true
                    })
                        .then((admin) => {
                            res.status(200).send({
                                code: 200,
                                message: Message.infoMessage.updateProfile,
                                data: admin,
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
                } else {
                    res.status(400).send({
                        code: 400,
                        message: Message.errorMessage.genericError,
                        data: [],
                        error: err
                    });
                }
            });

        } else {
            UsersModel.findByIdAndUpdate(decode._id, params, {
                upsert: true,
                new: true
            })
                .then((admin) => {
                    res.status(200).send({
                        code: 200,
                        message: Message.infoMessage.updateProfile,
                        data: admin,
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
        }
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}
exports.changePassword = async (req, res) => {
    try {
        const {
            password,
            oldPassword
        } = req.body.params;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        UsersModel.findById(decode._id)
            .then((admin) => {
                admin.comparePassword(oldPassword, (err, match) => {
                    if (err) {
                        res.status(400).send({
                            code: 400,
                            message: Message.errorMessage.genericError,
                            data: [],
                            error: err
                        });
                    }
                    if (match === true) {
                        admin.password = password;
                        admin.save();
                        res.status(200).send({
                            code: 200,
                            message: Message.infoMessage.updateProfile,
                            data: [],
                            error: []
                        });
                    } else {
                        res.status(401).send({
                            code: 401,
                            message: Message.errorMessage.passwordNotMatch,
                            data: [],
                            error: []
                        });
                    }
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
exports.get = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        UsersModel.findById(decode._id)
            .then((admin) => {
                if (admin !== null && admin.groups !== '0') {
                } else {
                    res.status(200).send({
                        code: 200,
                        message: Message.infoMessage.getProfile,
                        data: {
                            'profile': admin,
                            'group': '0'
                        },
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