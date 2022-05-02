import JWT from 'jsonwebtoken';
import config from '../../../config/config';
import language from '.././../models/language.model';
import Message from '../../../config/message';
import AdminModel from '../../models/admin.model';
import {savePowerPassword} from '../../models/systemSetting.model';
import SystemSettings from '../../models/systemSetting.model';

/**
 * get language 
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.updateProfile = async (req, res) => {
    try {
        const { params } =  req.body;
        let tempPassword;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        if(params.password != undefined ){
            tempPassword = params.password;
        }
        delete params.password;
        await AdminModel.findByIdAndUpdate(decode._id, params, {new:true}).then(async (admin) => {
            if(tempPassword != undefined ){ 
                admin.password = tempPassword;
            }
            admin.save().then(adminData => {
                res.status(200).send({code:200, message: Message.infoMessage.updateProfile, data: adminData, error: []});   
            }).catch(err => {
                res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [], error: err});    
            });
        }).catch(err => {
            res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [], error: err});    
        }); 
    }
    catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
}

exports.powerPassword = async (req, res) => {
    try {
        const { params } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        savePowerPassword(params.powerPassword,(err,hash) => {
            if(err){
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
            }
            params.powerPassword = hash;
            SystemSettings.findOne()
            .then(settings => {
                if(settings) {
                    settings.powerPassword = params.powerPassword;
                    settings.powerPasswordStatus = params.powerPasswordStatus;
                    settings.save();
                    res.status(200).send({ code: 200, message: Message.infoMessage.updateData, data: settings, error: [] });
                } else {
                    const systemSettings = SystemSettings(params);
                    systemSettings.save();
                    res.status(200).send({ code: 200, message: Message.infoMessage.updateData, data: settings, error: [] });
                }
            })
            .catch((err) => {
                res.status(400).send({ code: 401, message: Message.errorMessage.genericError, data: [], error: err });
            })
        });
    }
    catch (err) {
        res.status(400).send({ code: 402, message: Message.errorMessage.genericError, data: [], error: err });
    }
} 

exports.getProfile = async (req,res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        AdminModel.findById(decode._id)
        .then(admin => {
            return admin;
        })
        .then((admin) => {
            SystemSettings.findOne()
            .then(settings => {
                res.status(200).send({ code: 200, message: Message.infoMessage.getDetails, data: {profile: admin, settings}, error: [] });
            })
        })
        .catch(err => {
            res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
        })
    }
    catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
}

exports.saveCutomMail = async (req,res) => {
    try {
        const { params } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        SystemSettings.findOne()
        .then(settings => {
            if(settings) {
                settings.masterEmail = params.email;
                settings.save();
                res.status(200).send({ code: 200, message: Message.infoMessage.updateData, data: [], error: [] });
            } else {
                const systemSettings = SystemSettings(params);
                systemSettings.save();
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
            }
        })
        .catch(err => {
            res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
        })
    }
    catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
}