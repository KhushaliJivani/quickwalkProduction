import JWT from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../../config/config';
import Message from '../../../config/message';
import uploadFile from '../../../utils/uploadFile';
import supplierProductsModel from '../../models/supplierProducts.model';
import productRangeItemsModel from '../../models/productRangeItems.model';
import supplierCategoryModel from '../../models/supplierCategory.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import globalSupplierModel from '../../models/supplier.model';

exports.add = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        params.businessId = decode._id;
        const productForSave = supplierProductsModel(params);
        productForSave.save().then((product) => {
            if (Boolean(params.photo)) {
                const param = {
                    'destination': 'product',
                    'decodeImage': params.photo,
                    fieldName: 'image',
                    imageOrignalName: params.imageName
                };
                uploadFile.base64Upload(param).then((image) => {
                    product.image = image;
                    product.save();
                    res.status(201).send({
                        code: 201,
                        Message: Message.infoMessage.saveProduct,
                        data: product,
                        error: []
                    });
                });
            } else {
                res.status(201).send({
                    code: 201,
                    Message: Message.infoMessage.saveProduct,
                    data: product,
                    error: []
                });
            }
        }).catch((err) => {
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
exports.edit = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        params.businessId = decode._id;
        await supplierProductsModel.findByIdAndUpdate(params.id, params, {
            new: true
        })
            .then((product) => {
                if (Boolean(params.photo)) {
                    const param = {
                        'destination': 'product',
                        'decodeImage': params.photo,
                        fieldName: 'image',
                        imageOrignalName: params.imageName
                    };
                    return uploadFile.base64Upload(param).then((image) => {
                        product.image = image;
                        return product.save();
                    });
                } else {
                    return product;
                }
            })
            .then(async (product) => {
                await productRangeItemsModel.find({'suppliersProduct.supplierProductId':product._id})
                .then(async productRangeList => {
                    for(let productRangeData of productRangeList) {
                        productRangeData.suppliersProduct.filter(supplierProducts => {
                            if(supplierProducts.supplierProductId && String(supplierProducts.supplierProductId) == String(product._id)){
                                return supplierProducts.id = params.supplierId;
                            }
                        })
                        await productRangeItemsModel.findByIdAndUpdate(productRangeData._id,{ suppliersProduct:productRangeData.suppliersProduct },{new:true})
                    }
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.saveProduct,
                        data: product,
                        error: []
                    });
                })
            }).catch((err) => {
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
exports.delete = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await supplierProductsModel.findByIdAndUpdate(params.id,{status : 0},{new:true})
        .then(result => {
            res.status(200).send({
                code: 200,
                Message: Message.infoMessage.deleteProduct,
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
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}
exports.get = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        supplierProductsModel.aggregate([
            {
            $lookup: {
                from: 'productRangeItems',
                localField: '_id',
                foreignField: 'suppliersProduct.supplierProductId',
                as: 'linkProduct'
            }
        },
            {
            $lookup: {
                from: 'suppliercategories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'suppliercategories'
            }
        },
        {
            $match: {
                'businessId': mongoose.Types.ObjectId(decode._id)
            }
        },
        {
            $match: {
                $or:[
                    {'status': { $ne: "0" } },
                ]
            }
        },
        ])
        .collation({ locale: "en" }).sort({name : 1})
            .then(result => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
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
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}
exports.productRange = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        productRangeItemsModel.find({
            businessId: decode._id,
            status: {
                $ne: 0
            }
        }).sort({
            createdAt: 'desc'
        }).then((productRangeItems) => {
            mongoose.Types.ObjectId(params.id)
            productRangeItemsModel.aggregate([{
                "$match": {
                    "suppliersProduct.supplierProductId": mongoose.Types.ObjectId(params.id)
                }
            }, {
                $lookup: {
                    from: 'location',
                    localField: 'locationId',
                    foreignField: '_id',
                    as: 'linkLocation'
                }
            },
            {
                "$project": {
                    "name": "$name",
                    "packaging": "$packaging",
                    "image": "$image",
                    "status": "$status",
                    "location": "$linkLocation",
                    "suppliersProducts": {
                        "$filter": {
                            "input": "$suppliersProduct",
                            "as": "suppliersProduct",
                            "cond": {
                                "$eq": ["$$suppliersProduct.supplierProductId", mongoose.Types.ObjectId(params.id)]
                            }
                        }
                    }
                }
            }
            ])
                .then((linkProduct) => {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.getDetails,
                        data: {
                            productRange: productRangeItems,
                            linkProduct: linkProduct
                        },
                        err: []
                    });
                });
        }).catch((err) => {
            res.status(400).send({
                code: 400,
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
exports.linkProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.findById(params.productRangeId)
            .then((productRange) => {
                if (productRange) {
                    productRange.suppliersProduct.push({
                        isSoldInStore: "0",
                        id: params.id,
                        preferredIndex: (productRange.suppliersProduct.length > 0) ? productRange.suppliersProduct.length + 1 : 1,
                        supplierProductId: params.supplierProductId,
                        calculation: params.calculation
                    })
                    productRange.save();
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.linkedProduct,
                        data: productRange,
                        err: []
                    });
                } else {
                    res.status(401).send({
                        code: 401,
                        message: Message.errorMessage.productNotFound,
                        data: [],
                        error: err
                    });
                }
            }).catch((err) => {
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
exports.delinkProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.findByIdAndUpdate(params.productRangeId, {
            $pull: {
                'suppliersProduct': {
                    "supplierProductId": params.supplierProductId
                }
            }
        }, {
                new: true
            })
            .then((productRange) => {
                if (productRange) {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.delinkProduct,
                        data: productRange,
                        err: []
                    });
                } else {
                    res.status(401).send({
                        code: 401,
                        message: Message.errorMessage.productNotFound,
                        data: [],
                        error: err
                    });
                }
            }).catch((err) => {
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
exports.detail = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        supplierProductsModel.findById(params.id)
            .then((productRange) => {
                if (productRange) {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.suggestedProduct,
                        data: productRange,
                        err: []
                    });
                } else {
                    res.status(401).send({
                        code: 401,
                        message: Message.errorMessage.productNotFound,
                        data: [],
                        error: err
                    });
                }
            }).catch((err) => {
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
exports.category = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        supplierCategoryModel.find({
            supplierId: params.id
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
exports.getSupplier = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await companySuppliersModel.find({
            businessId: decode._id,
            type: "1",
            status: {
                $eq: 1,
            }
        }).sort({
            createdAt: 'desc'
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
                        data: data,
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