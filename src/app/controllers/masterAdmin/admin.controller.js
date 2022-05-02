import util from 'util';
import environment from '../../../../environment';
import adminModel from '../../models/admin.model';
import Message from '../../../config/message';
import config from '../../../config/config';
import SMTP from '../../../utils/email';
import JWT from 'jsonwebtoken';
import languageModel from '../../models/language.model';
import ejs from 'ejs';
import mailLanguagesModel from '../../models/mailLanguages.model';
import UsersModel from '../../models/users.model';
import productModel from '../../models/productRangeItems.model';
import globalProductModel from '../../models/supplierProducts.model';
import checklistModel from '../../models/checklist.model';
import locationModel from '../../models/location.model';
import businessSupplierModel from '../../models/companySuppliers.model';
import supplierCategoryModel from '../../models/supplierCategory.model';
import supplierModel from '../../models/supplier.model';
import checklistCollectionModel from '../../models/checklistCombination.model';
import orderDetailModel from '../../models/orderDetail.model';
import orderModel from '../../models/order.model';
/**
 *  Create Admin if valid email and username
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.add = async (req, res) => {
    try {
        await adminModel.findOne({ email: req.body.params.email, "applicationStatus": { $ne : 0} })
            .then(async (result) => {
                if (result) {
                    res.status(409).send({ code: 409, Message: Message.errorMessage.userAlreadyExists, data: [], err: [] });
                } else {
                    const exe = req.headers.authorization.split(' ');
                    const decode = JWT.verify(exe[1], config.JWTSecret);
                    req.body.params.adminId = decode._id;
                    req.body.params.adminType = "1";
                    req.body.params.email = req.body.params.email.toLowerCase();
                    req.body.params.isAdminActive = "0";
                    req.body.params.emailVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    // if(!req.body.params.timeZone){
                    //     req.body.params.timeZone = "Asia/Kathmandu";/**static timezone set */
                    // }
                    const saveAdmin = await adminModel(req.body.params);
                    await saveAdmin.save()
                        .then(async (result) => {
                            if(result.applicationStatus == "2" || result.applicationStatus == "1"){
                                result.isAdminActive = "1";
                                await result.save();
                                let mailContent = await findMailLanguage(result.language,"signUp");
                                // await ejs.renderFile(config.mailUrl +"email/admin/signUp.ejs", )
                                // .then(content => {
                                // await ejs.renderFile(config.mailUrl +"email/admin/signUp.ejs", { admin: result,URL:config.adminUrl }).then(content => {
                                    const mailOptions = { to: result.email, subject: Message.emails.signup.subject, template:'admin/signUp.ejs' ,type: 'business', id: result._id, data: { admin: result,URL:config.adminUrl, clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }};
                                    SMTP.email(mailOptions)
                                    .then(() => {
                                        res.status(201).send({ code: 201, Message: Message.infoMessage.forgotPassword, data: [], error: [] });
                                    })
        
                                    // res.status(201).send({ code: 201, Message: Message.infoMessage.saveAdmin, data: result, err: [] });
                                // })
                            }
                            else{
                                res.status(201).send({ code: 201, Message: Message.infoMessage.saveAdmin, data: [], error: [] });
                            }

                        })
                        .catch((err) => {
                            res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
                        });
                }
            })
            .catch((err) => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            });
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}
exports.verify = async (req, res) => {
    try {
        const { token, password } = req.body.params;
        await adminModel.findOne({ emailVerificationToken: token })
            .then((result) => {
                if (result) {
                    result.applicationStatus = "2";
                    result.password = password;
                    result.save();

                    ejs.renderFile(config.mailUrl +"email/admin/verify.ejs", { admin: result,clientMail:config.clientMail, URL:environment.development.masterAdminUri }).then(content => {
                        const mailOptions = { to: result.email, subject: Message.emails.verifyUser.subject, html: content };
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
                    }).catch((err) => {
                        res.status(400).send({
                            code: 400,
                            message: Message.errorMessage.genericError,
                            data: [],
                            error: err
                        });
                    })
                }
                res.status(404).send({ code: 404, Message: Message.errorMessage.tokenNotFound, data: [], err: [] });
            })
            .catch(err => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            });
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}
exports.edit = async (req, res) => {
    try {
        const { params } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await adminModel.findById(req.body.params.id)
        .then(async adminData => {
            if(adminData.isAdminActive == "0" && params.applicationStatus ==  "2"){
                params.isAdminActive = "1";
                const updateAdminData = await updateAdmin(params);
                let mailContent = await findMailLanguage(updateAdminData.language,"signUp");
                // await ejs.renderFile(config.mailUrl +"email/admin/signUp.ejs", { admin: updateAdminData,URL:config.adminUrl,clientMail:config.clientMail, 
                    // mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort }).then(content => {
                    const mailOptions = { to: updateAdminData.email, subject: Message.emails.signup.subject, template:'admin/signUp.ejs', type: 'business', id: adminData._id, data: { admin: updateAdminData,URL:config.adminUrl,clientMail:config.clientMail, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort } };
                    SMTP.email(mailOptions)
                    .then(() => {
                        res.status(200).send({ code: 200, Message: Message.infoMessage.forgotPassword, data: [], error: [] });
                    })
                    .catch(err => {
                        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
                    });
                // })
            }
            else{
                const updateAdminData = await updateAdmin(params);
                res.status(200).send({ code: 200, Message: Message.infoMessage.updateData, data: updateAdminData, error: [] });
            }
        })
        .catch(err => {
            res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
        });
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}

const updateAdmin = async (params) => {
    return await adminModel.findByIdAndUpdate(params.id, params, { new: true })
        .then((result) => {
            return result;
        })
        .catch(err => {
            res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
        });
}
/**
 *  get admin data 
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.adminGet = async (req, res) => {
    try {
        await adminModel.find({ "adminType": 1, "applicationStatus": { $ne: 0 } })
            .populate(
                {
                    path: 'language', model: languageModel
                })
            .sort({ createdAt: 'desc' })
            .then(result => {
                res.status(200).send({ code: 200, Message: Message.infoMessage.getDetails, data: result, err: [] });
            })
            .catch(err => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            })
    }
    catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}

/**
 *  admin delete if valid jwt token 
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.adminDelete = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await adminModel.findById(req.body.params.id)
            .then(async result => {
                if (result.applicationStatus != 0) {
                    result.applicationStatus = 0;
                    await result.save()
                    let removeUser = await removeUsers(result._id);
                    let removeProductRange = await removeProductRanges(result._id);
                    let removeSupplierProduct = await removeSupplierProducts(result._id);
                    let removeChecklist = await removeChecklists(result._id);
                    let removeLocation = await removeLocations(result._id);
                    let removeCompanySupplier = await removeCompanySuppliers(result._id);
                    let removeSupplier = await removeSuppliers(result._id);
                    let removechecklistCombination = await removechecklistCombinations(result._id);
                    let removeCategorie = await removeCategories(result._id);
                    let removeOrderDetail = await removeOrderDetails(result._id);
                    let order = await orders(result._id);
                    res.status(200).send({ code: 200, Message: Message.infoMessage.deleteUser, data: result, err: [] });
                }
                else {
                    res.status(200).send({ code: 200, Message: Message.infoMessage.alreadyDelete, data: result, err: [] });
                }
            })
            .catch(err => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            })
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}

let removeUsers = async (businessId) => {
    return UsersModel.updateMany({ businessId: businessId },{ status: 0 }).exec();
}
let removeProductRanges = async (businessId) => {
    return productModel.updateMany({ businessId: businessId },{ status: 0 }).exec();
}
let removeSupplierProducts = async (businessId) => {
    return globalProductModel.updateMany({ businessId: businessId },{ status: 0} ).exec();
}
let removeChecklists = async (businessId) => {
    return checklistModel.updateMany({ businessId: businessId },{ status: 0 }).exec();
}
let removeLocations = async (businessId) => {
    return locationModel.updateMany({ businessId: businessId },{ status: 0 }).exec();
}
let removeCompanySuppliers = async (businessId) => {
    return businessSupplierModel.updateMany({ businessId: businessId },{ status: 0 }).exec();
}
let removeSuppliers = async (businessId) => { 
    return supplierModel.updateMany({ businessId: businessId },{ status: 0 }).exec();
}
let removechecklistCombinations = async (businessId) => {
    return checklistCollectionModel.updateMany({ businessId: businessId },{ isDelete:1 }).exec();
}
let removeCategories = async (businessId) => {
    return await businessSupplierModel.find({ businessId: businessId })
    .then(comapnySupplier => {
        if(comapnySupplier){
            return supplierCategoryModel.updateMany({ supplierId: {$in: comapnySupplier} },{ status: 0 }).exec();
        }
        else{
            return comapnySupplier;
        }
    })
}
let removeOrderDetails = async (businessId) => {
    return orderDetailModel.deleteMany({ businessId: businessId }).exec();
}
let orders = async (businessId) => {
    return orderModel.deleteMany({ businessId: businessId }).exec();
}

exports.detail = async (req, res) => {
    try {
        const { params } = req.body;
        await adminModel.findById(params.id)
            .then(admin => {
                res.status(200).send({ code: 200, Message: Message.infoMessage.deleteUser, data: admin, err: [] });
            })
            .catch(err => {
                res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
            })
    } catch (err) {
        res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
    }
}

let findMailLanguage = async (languageId,label) => {
    return mailLanguagesModel.findOne({languageId:languageId,label:label});
}
