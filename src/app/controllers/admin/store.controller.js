import JWT from 'jsonwebtoken';
import Message from '../../../config/message';
import globalSupplierModel from '../../models/supplier.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import productRangeItemsModel from '../../models/productRangeItems.model';
import globalProductsModel from '../../models/supplierProducts.model';
import supplierCategoryModel from '../../models/supplierCategory.model';
import uploadFile from '../../../utils/uploadFile';
import config from '../../../config/config';
import mongoose from 'mongoose';

exports.add = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        params.businessId = decode._id;
        params.type = "2";
        let supplierLogo = "";
        const supplierForSave = globalSupplierModel(params);
        supplierForSave.save()
            .then((supplier) => {
                params.supplierId = supplier._id;
                const companySuppliers = companySuppliersModel(params);
                companySuppliers.save().then((companySuppliers) => {
                    res.status(201).send({
                        code: 201,
                        Message: Message.infoMessage.saveSupplier,
                        data: supplier,
                        error: []
                    });
                });
            })
            .catch((err) => {
                res.status(400).send({
                    code: 400,
                    Message: Message.errorMessage.genericError,
                    data: [],
                    err: err
                });
            });
    } catch (err) {
        res.status(400).send({
            code: 400,
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}
exports.edit = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        companySuppliersModel.findByIdAndUpdate(params.id, params)
            .then((supplier) => {
                globalSupplierModel.findByIdAndUpdate(supplier.supplierId, params)
                    .then((supplierUpdate) => {
                        res.status(200).send({
                            code: 200,
                            Message: Message.infoMessage.updateData,
                            data: supplier,
                            error: []
                        });
                    });
            })
            .catch((err) => {
                res.status(400).send({
                    code: 400,
                    Message: Message.errorMessage.genericError,
                    data: [],
                    err: err
                });
            })
    } catch (err) {
        res.status(400).send({
            code: 400,
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}

exports.get = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await companySuppliersModel.find({
                businessId: decode._id,
                type: "2",
                status: {
                    $ne: 0
                }
            })
            .populate({
                path: 'supplierId',
                model: globalSupplierModel
            })
            .then(data => {
                if (!data) {
                    res.status(401).send({
                        code: 401,
                        Message: Message.errorMessage.dataNotFound,
                        data: [],
                        err: []
                    });
                } else {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.getDetails,
                        data: data.sort(compare),
                        error: []
                    });
                }
            })
            .catch(err => {
                res.status(400).send({
                    code: 400,
                    Message: Message.errorMessage.genericError,
                    data: [],
                    err: err
                });
            })
    } catch (err) {
        res.status(400).send({
            code: 400,
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}
function compare(a, b) {
    const genreA = a.supplierId.name.toLowerCase();  //set which field was sorted
    const genreB = b.supplierId.name.toLowerCase();
    
    let comparison = 0;
    if (genreA > genreB) {
        comparison = 1;
    } else if (genreA < genreB) {
        comparison = -1;
    }
    return comparison;
}
exports.detail = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        companySuppliersModel.aggregate([{
                    $match: {
                        '_id': mongoose.Types.ObjectId(params.id)
                    }
                },
                {
                    $lookup: {
                        from: 'productRangeItems',
                        localField: '_id',
                        foreignField: 'suppliersProduct.id',
                        as: 'linkProductRangeItems',
                    }
                },
                {
                    $lookup: {
                        from: 'suppliers',
                        localField: 'supplierId',
                        foreignField: '_id',
                        as: 'linkSupplier',
                    }
                }
            ])
            .then((supplier) => {
                if (supplier && supplier.status != 0) {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.getDetails,
                        data: supplier,
                        err: []
                    });
                } else {
                    res.status(401).send({
                        code: 401,
                        Message: Message.errorMessage.dataNotFound,
                        data: [],
                        err: []
                    });
                }
            }).catch((err) => {
                res.status(400).send({
                    code: 400,
                    Message: Message.errorMessage.genericError,
                    data: [],
                    err: err
                });
            });
    } catch (err) {
        res.status(400).send({
            code: 400,
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}
exports.delete = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await companySuppliersModel.findByIdAndUpdate(params.id,{status : 0},{new:true})
        .then(result => {
            res.status(200).send({
                code: 200,
                Message: Message.infoMessage.deleteUser,
                data: result,
                err: []
            });
        })
            .catch((err) => {
                res.status(400).send({
                    code: 400,
                    Message: Message.errorMessage.genericError,
                    data: [],
                    err: err
                });
            })

    } catch (err) {
        res.status(400).send({
            code: 400,
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}

exports.suggestion = async (req, res) => {
    try {
        globalSupplierModel.find({
            type: "2",
            status: {
                $ne: "0"
            }
        }).then((suppliers) => {
            res.status(200).send({
                code: 200,
                Message: Message.infoMessage.getDetails,
                data: suppliers,
                error: []
            });
        }).catch((err) => {
            res.status(400).send({
                code: 400,
                Message: Message.errorMessage.genericError,
                data: [],
                err: err
            });
        })
    } catch (err) {
        res.status(400).send({
            code: 400,
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}