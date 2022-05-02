import JWT from 'jsonwebtoken';
import Message from '../../../config/message';
import supplierModel from '../../models/supplier.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import productRangeItemsModel from '../../models/productRangeItems.model';
import globalProductsModel from '../../models/supplierProducts.model';
import supplierCategoryModel from '../../models/supplierCategory.model';
import uploadFile from '../../../utils/uploadFile';
import config from '../../../config/config';
import supplierProductsModel from '../../models/supplierProducts.model';
import mongoose from 'mongoose';
import globalSupplierModel from '../../models/globalSupplier.model';

exports.add = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        params.businessId = decode._id;
        params.type = "1";
        let supplierLogo = "";
        const supplierForSave = supplierModel(params);
        supplierForSave.save().then((supplier) => {
            if (params.image != undefined && params.image != "") {
                const param = {
                    'destination': 'supplierLogo',
                    'decodeImage': params.image,
                    fieldName: 'logo',
                    imageOrignalName: params.imageName
                };
                return uploadFile.base64Upload(param).then((image) => {
                    supplierLogo = image;
                    return supplier;
                })
            } else {
                return supplier;
            }
        })
            .then((supplier) => {
                params.logo = supplierLogo;
                params.supplierId = supplier._id;
                const companySuppliers = companySuppliersModel(params);
                return companySuppliers.save()
                    .then((companySuppliers) => {
                        return {
                            companySuppliers: companySuppliers,
                            supplier: supplier
                        };
                    });
            })
            .then((supplierAndGlobalSupplier) => {
                return supplierModel.findByIdAndUpdate(supplierAndGlobalSupplier.supplier._id, {
                    logo: supplierLogo
                })
                    .then((supplierUpdate) => {
                        return supplierAndGlobalSupplier;
                    });

            })
            .then((supplierAndGlobalSupplier) => {
                const categoryArray = [];
                params.category.forEach((category) => {
                    categoryArray.push({
                        name: category.name,
                        supplierId: supplierAndGlobalSupplier.companySuppliers._id,
                        sortOrder: category.sortOrder
                    });
                });
                supplierCategoryModel.insertMany(categoryArray).then((supplierCategory) => {
                });
                const globalSuppliers = globalSupplierModel(params);
                globalSuppliers.save()
                    .then(globalSuppliersData => {
                        supplierModel.findByIdAndUpdate(supplierAndGlobalSupplier.supplier._id, { globalSupplierId: globalSuppliersData._id }).then(globalSupplier => {
                            res.status(201).send({
                                code: 201,
                                Message: Message.infoMessage.saveSupplier,
                                data: supplierAndGlobalSupplier.companySuppliers,
                                error: []
                            });
                        })
                    })
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
        let supplierLogo = "";
        companySuppliersModel.findByIdAndUpdate(params.id, params)
            .then((companySupplier) => {
                if (params.image != undefined && params.image != "") {
                    const param = {
                        'destination': 'supplierLogo',
                        'decodeImage': params.image,
                        fieldName: 'logo',
                        imageOrignalName: params.imageName
                    };
                    return uploadFile.base64Upload(param).then((image) => {
                        supplierLogo = image;
                        params.logo = supplierLogo
                        return companySupplier;
                    })
                } else {
                    return companySupplier;
                }
            })
            .then((supplier) => {
                return supplierModel.findByIdAndUpdate(supplier.supplierId, params)
                    .then((supplierUpdate) => {
                        return supplier;
                    });
            })
            .then((supplier) => {
                if (params.category.length > 0) {
                    const categoryArray = [];
                    params.category.forEach((category) => {
                        categoryArray.push({
                            name: category.name,
                            supplierId: supplier._id,
                            sortOrder: category.sortOrder
                        });
                    });
                    supplierCategoryModel.insertMany(categoryArray).then((supplierCategory) => {
                        res.status(200).send({
                            code: 200,
                            Message: Message.infoMessage.updateData,
                            data: supplier,
                            error: []
                        });
                    });
                } else {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.updateData,
                        data: supplier,
                        error: []
                    });
                }

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
            type: "1",
            status: {
                $ne: 0
            }
        })
            .populate({
                path: 'supplierId',
                model: supplierModel,
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
        await companySuppliersModel.findById(params.id)
            .populate({
                'path': "supplierId",
                model: supplierModel
            })
            .then((supplier) => {
                if (supplier) {
                    globalProductsModel.aggregate([{
                        $lookup: {
                            from: 'productRangeItems',
                            localField: '_id',
                            foreignField: 'suppliersProduct.supplierProductId',
                            as: 'linkSupplierProducts',
                        }
                    }, {
                        $match: {
                            'status': {
                                $ne: "0"
                            },
                            'supplierId': mongoose.Types.ObjectId(params.id)
                        }
                    }])
                        .then((supplierProducts) => {
                            supplierCategoryModel.find({
                                supplierId: params.id
                            })
                                .sort({
                                    createdAt: 'desc'
                                }).then((category) => {

                                    res.status(200).send({
                                        code: 200,
                                        Message: Message.infoMessage.getDetails,
                                        data: {
                                            supplierDetail: supplier,
                                            supplierProducts: supplierProducts,
                                            category: category
                                        },
                                        err: []
                                    });

                                })
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
        await companySuppliersModel.findById(params.id)
            .then(result => {
                if (result.status != "0") {
                    result.status = 0;
                    result.save();
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.deleteUser,
                        data: result,
                        err: []
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
        globalSupplierModel.find()
        .then((suppliers) => {
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

exports.deleteCategory = (req, res) => {
    try {
        const {
            params
        } = req.body;
        supplierCategoryModel.findByIdAndUpdate(params.id, {
            status: 0
        }, {
                new: true
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