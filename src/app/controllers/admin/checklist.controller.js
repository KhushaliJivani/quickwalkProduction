import JWT from 'jsonwebtoken';
import Admin from '../../models/admin.model';
import checklist from '../../models/checklist.model';
import config from '../../../config/config';
import Message from '../../../config/message';
import productModel from '../../models/productRangeItems.model';


/**
 * checklist add by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.addChecklist = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        const {
            params
        } = req.body;
        params.businessId = decode._id;
        const checklistData = checklist(params);
        checklistData.save()
            .then(result => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.updateData,
                    data: result,
                    error: []
                });
            })
            .catch(err => {
                res.status(401).send({
                    code: 401,
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
 * checklist edit by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.editChecklist = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        const {
            params
        } = req.body;
        params.businessId = decode._id;
        checklist.findByIdAndUpdate(params.id, params, {
                new: true
            })
            .then(result => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.updateData,
                    data: result,
                    error: []
                });
            })
            .catch(err => {
                res.status(401).send({
                    code: 401,
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
 * checklist delete by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.deleteChecklist = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        checklist.findById(params.id)
            .then(result => {
                if (result.status != "0") {
                    result.status = 0;
                    result.save();
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.deleteChecklist,
                        data: result,
                        error: []
                    });
                } else {
                    res.status(409).send({
                        code: 409,
                        Message: Message.infoMessage.alreadyDelete,
                        data: result,
                        err: []
                    });
                }
            })
            .catch(err => {
                res.status(401).send({
                    code: 401,
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
 * all checklist get by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.getChecklist = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        checklist.find({
            "businessId" :decode._id,
            status: {
                $ne: 0
            }
            })
            .populate({path:'product',model:productModel,match: { status: "1" }})
            .sort({
                name: 1
            })
            .then(result => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: result,
                    err: []
                });
            })
            .catch(err => {
                res.status(401).send({
                    code: 401,
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
 * single checklist get by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.detailsChecklistGet = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        checklist.findById(params.id)
            .then(result => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: result,
                    err: []
                });
            })
            .catch(err => {
                res.status(401).send({
                    code: 401,
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