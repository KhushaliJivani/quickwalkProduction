import JWT from 'jsonwebtoken';
import config from '../../../config/config';
import Message from '../../../config/message';
import Admin from '../../models/admin.model';


/**
 * Update Profile if params is valid
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.updateProfile = async (req, res) => {
    try {
        const { params } =  req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await Admin.findByIdAndUpdate(decode._id, params).then((admin) => {
            res.status(200).send({code:200, message: Message.infoMessage.updateProfile, data: admin, error: []});        
        }).catch(err => {
            res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [], error: err});    
        }); 
    } catch (err) {
        res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { password,oldPassword } =  req.body.params;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await Admin.findById(decode._id).then((admin) => {
            admin.comparePassword(oldPassword,(err, match) => {
                if(err) {
                    res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
                }
                if(match === true) {
                    admin.password = password;
                    admin.save();
                    res.status(200).send({code:200, message: Message.infoMessage.updateProfile, data: [], error: []});
                } else {
                    res.status(401).send({code:401, message: Message.errorMessage.passwordNotMatch, data: [], error: []});
                }
            });
        }).catch(err => {
            res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
        }); 
    } catch (err) {
        res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
    }
}