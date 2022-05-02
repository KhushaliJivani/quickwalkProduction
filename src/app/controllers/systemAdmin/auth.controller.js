import JWT from 'jsonwebtoken';
import Admin from '../../models/admin.model';
import config from '../../../config/config';
import Message from '../../../config/message';
import SMTP from '../../../utils/email';
import util from 'util';

/**
 * Returns jwt token if valid email and password is valid
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.login = async (req, res) => {
    try {
        console.log('CCOme and seee');
        const {email, password} = req.body.params;
        await Admin.findOne({'email': email , adminType : "0"}).then((admin) => {
            if(admin){
                admin.comparePassword(password,(err, match) => {
                   if(err){
                    res.send({code:400, message: Message.errorMessage.genericError, data: [], error:err});
                   } 
                   if(match === true) {
                        const token = JWT.sign(admin.toJSON(), config.JWTSecret, {expiresIn: config.JWTExpireTime});
                        res.send({code:200, message: Message.infoMessage.login, data: {token : 'JWT ' + token, user: admin}, error:[]});
                   } else  {
                     res.send({code:401, message: Message.errorMessage.userNotFound, data: [], error:[]});
                   }
                })
            } else  {
                res.send({code:401, message: Message.errorMessage.userNotFound, data: [], error:[]});
            }
        }).catch((err) => {
            res.send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
        });
    } catch (err) {
        res.send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
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
        req.body.params.emailVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        req.body.params.emailVerificationTokenExpire = config.emailVerifyTokenExpireTime;
        req.body.params.adminType = "0";
        const saveToUser = Admin(req.body.params);
        await saveToUser.save().then((admin) => {
            const mailOptions = {
                to: admin.email,
                subject: Message.userEmails.signup.subject,
                text: util.format(Message.userEmails.signup.body,admin.firstName,config.adminUrl, admin.emailVerificationToken)
            }; 
            SMTP.email(mailOptions, (err, info) => {
                if(err){
                    res.send({code:401, message: Message.errorMessage.genericError, data: [], error:err});         
                }
                res.send({code:200, message: Message.infoMessage.saveUser, data: admin, error:[]});
            });
        }).catch((err) => {
            res.send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
        });
    } catch (err) {
        res.send({code:402, message: Message.errorMessage.genericError, data: [], error: err});
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
    try{
        const { email } = req.body.params;
        await Admin.findOne({'email':email}).then((admin) => {
           if(admin){
                const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                admin.resetPasswordToken = token;
                admin.resetPasswordExpires = config.resetPasswordTokenExpireTime;
                admin.save();
                const mailOptions = {
                    to: admin.email,
                    subject: Message.userEmails.forgotPassword.subject,
                    text: util.format(Message.userEmails.forgotPassword.body, config.adminUrl, token)
                }; 
                SMTP.email(mailOptions, (err, info) => {
                    if(err){
                        res.send({code:400, message: Message.errorMessage.genericError, data: [], error:err});         
                    }
                    res.send({code:200, message: Message.infoMessage.forgotPassword, data: [], error:[]});
                });    
           } else {
                res.send({code:401, message: Message.errorMessage.emailNotFound, data: [], error:[]});
           }
        }).catch((err) => {
            res.send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
        });
    } catch(err) {
        res.send({code:400, message: Message.errorMessage.genericError, data: [], error:err});  
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
    try{
        const { password, token } =  req.body.params;
        await Admin.findOne({resetPasswordToken: token, resetPasswordExpires : {$gt: Date.now()}}).then((admin,error) => {
            if(admin){
                admin.password = password;
                const savedUser = Admin.saveUser(admin);
                const mailOptions = {
                    to: admin.email,
                    subject: Message.emails.resetPassword.subject,
                    text: util.format(Message.emails.resetPassword.body,admin.email)
                }; 
                SMTP.email(mailOptions, (err, info) => {
                    if(err){
                        res.send({code:400, message: Message.errorMessage.genericError, data: [], error:err});         
                    }
                    res.send({code:200, message: Message.infoMessage.resetPassword, data: [], error:[]});
                }); 
            } else {
                res.send({code:400, message: Message.errorMessage.tokenNotFound, data:[], error:[]});
            }
        }).catch((err) => {
            res.send({code:400, message: Message.errorMessage.genericError, data: [], error: err});
        });
    } catch(err) {
        res.send({code:400, message: Message.errorMessage.genericError, data: [], error:err});
    }
}