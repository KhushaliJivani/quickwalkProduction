import JWT from 'jsonwebtoken';
import config from '../../../config/config';
import Message from '../../../config/message';
import uploadFile from '../../../utils/uploadFile';
import globalProductModel from '../../models/supplierProducts.model';
import productRangeItemsModel from '../../models/productRangeItems.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import checklistModel from '../../models/checklist.model';
import businessSupplierModel from '../../models/companySuppliers.model';
import globalSupplierModel from '../../models/supplier.model';
import locationModel from '../../models/location.model';
import mongoose from 'mongoose';

exports.add = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        params.businessId = decode._id;
        let productImage = "";
        productRangeItemsModel.find({
                locationId: params.locationId,
                status: {
                    $ne: 0
                }
            })
            .then(location => {
                params.locationPreferredIndex = location.length + 1;
                const productForSave = productRangeItemsModel(params);
                return productForSave.save()
            })
            .then((product) => {
                if (Boolean(params.photo)) {
                    const param = {
                        'destination': 'product',
                        'decodeImage': params.photo,
                        fieldName: 'imageName',
                        imageOrignalName: params.imageName
                    };
                    return uploadFile.base64Upload(param).then((image) => {
                        product.image = image;
                        product.save();
                        return product;
                    });
                } else {
                    return product;
                }

            }).then((product) => {
                const updateArray = {
                    $push: {
                        product: product._id
                    }
                };
                checklistModel.updateMany({
                    _id: {
                        $in: params.checklist
                    }
                }, updateArray).then((checklist) => {
                    res.status(201).send({
                        code: 201,
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

exports.edit = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        params.businessId = decode._id;
        await productRangeItemsModel.findByIdAndUpdate(params.id, params, {
                new: true
            })
            .then(data => {
                if (Boolean(params.imageName)) {
                    const param = {
                        'destination': 'product',
                        'decodeImage': params.photo,
                        fieldName: 'imageName',
                        imageOrignalName: params.imageName
                    }
                    return uploadFile.base64Upload(param).then((image) => {
                        data.image = image;
                        return data.save();
                    });
                } else {
                    return data;
                }
            })
            .then(async product => {
                let removeProduct = await removeAllChecklistProduct(product);
                if (params.checklist.length > 0) {
                    let insertProduct = await insertProductChecklist(product,params);
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.updateData,
                        data: product,
                        error: []
                    });
                } 
                else {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.updateData,
                        data: product,
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
let insertProductChecklist = async (product,params) => {
    const updateArray = {
        $push: {
            product: product._id
        }
    };
    return await checklistModel.updateMany({ _id: { $in: params.checklist } }, updateArray);
}
let removeAllChecklistProduct = async (product) => {
    return await checklistModel.updateMany({status: {$ne: 0}}, {$pull: { product: product._id }}).exec()
} 


exports.get = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await productRangeItemsModel.find({
                businessId: decode._id,
                status: {
                    $ne: 0
                }
            })
            .collation({ locale: "en" }).sort({name : 1})
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
        await productRangeItemsModel.findById(params.id)
            .sort({
                createdAt: 'desc'
            })
            .populate({
                path: 'suppliersProduct.supplierProductId',
                model: globalProductModel
            })
            .then((result) => {
                return result;
            })
            .then((product) => {
                checklistModel.find({
                        product: params.id
                    })
                    .then((checklist) => {
                        res.status(200).send({
                            code: 200,
                            Message: Message.infoMessage.getDetails,
                            data: {
                                product: product,
                                checklist: checklist
                            },
                            err: []
                        });
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
        await productRangeItemsModel.findByIdAndUpdate(params.id,{status : 0},{new:true})
        .then(async (result) => {
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
let removeChecklistProduct = async (checklist,params,res,result) => {
    for(let singleChecklist of checklist) {
        await checklistModel.findByIdAndUpdate(singleChecklist._id,{ $pull: { product: params.id } },{new:true})
    }
    res.status(200).send({
        code: 200,
        Message: Message.infoMessage.deleteProduct,
        data: result,
        err: []
    });
}


exports.linkedProductWithSupplierProduct = (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.findById(params.id)
            .populate({
                path: 'suppliersProduct.supplierProductId',
                model: globalProductModel,
            })
            .populate({
                path: 'suppliersProduct.id',
                model: companySuppliersModel,
                select: 'supplierId status',
                populate: {
                    path: 'supplierId',
                    model: globalSupplierModel,
                    select: 'name'
                }
            })
            .sort({
                createdAt: 'desc'
            })
            .then((suppliersProduct) => {
                const exe = req.headers.authorization.split(' ');
                const decode = JWT.verify(exe[1], config.JWTSecret);
                globalProductModel.find({
                    businessId: decode._id
                }).then((supplierProducts) => {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.linkProduct,
                        data: {
                            linkedProduct: suppliersProduct.suppliersProduct,
                            supplierProducts: supplierProducts
                        },
                        err: []
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
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}

exports.linkProducts = (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.findById(params.productRangeId)
            .then((productRange) => {
                if (productRange) {
                    if (params.isSoldInStore == "0") {
                        productRange.suppliersProduct.push({
                            id: params.supplierId,
                            supplierProductId: params.supplierProductId,
                            preferredIndex: (productRange.suppliersProduct.length > 0) ? productRange.suppliersProduct.length + 1 : 1,
                            calculation: params.calculation,
                            isSoldInStore: params.isSoldInStore,
                        });
                    } else {
                        productRange.suppliersProduct.push({
                            id: params.supplierId,
                            preferredIndex: (productRange.suppliersProduct.length > 0) ? productRange.suppliersProduct.length + 1 : 1,
                            isSoldInStore: params.isSoldInStore,
                        });
                    }
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
exports.delinkProducts = (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.findByIdAndUpdate(params.ProductRangeId, {
                $pull: {
                    'suppliersProduct': {
                        "_id": params.supplierProductId
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
};

exports.order = (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.findById(params.id)
            .then((productRange) => {
                params.suppliersProduct.forEach((supplierProduct) => {
                    productRange.suppliersProduct.forEach((productRangeSuppliersProduct) => {
                        if (supplierProduct._id == productRangeSuppliersProduct._id) {
                            productRangeSuppliersProduct.preferredIndex = supplierProduct.preferredIndex;
                        }
                    });
                });
                productRange.save();
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: productRange,
                    err: []
                });
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

exports.calculation = (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.findById(params.id)
            .then((productRange) => {
                params.supplierProduct.forEach((supplierProduct) => {
                    productRange.suppliersProduct.forEach((productRangeSuppliersProduct) => {
                        if (supplierProduct._id == productRangeSuppliersProduct._id) {
                            productRangeSuppliersProduct.calculation = supplierProduct.calculation;
                        }
                    });
                });
                productRange.save();
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: productRange,
                    err: []
                });
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
exports.locationDetails = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        locationModel.aggregate([{
                    $match: {
                        $and: [{
                                "status": "1"
                            },
                            {
                                "businessId": mongoose.Types.ObjectId(decode._id)
                            }
                        ]
                    }
                },
                {
                    "$graphLookup": {
                        "from": "location",
                        "startWith": "$parentId",
                        "connectFromField": "parentId",
                        "connectToField": "_id",
                        "as": "parent"
                    }
                },
                {
                    "$project": {
                        "name": {
                            "$concat": [{
                                    "$reduce": {
                                        "input": "$parent",
                                        "initialValue": "",
                                        "in": {
                                            "$concat": ["$$value", "$$this.name", ","]
                                        }
                                    }
                                },
                                "$name"
                            ]
                        },
                        "preferredIndex": 1,
                        "parentId":1
                    }
                },
                {
                    $sort: {
                        "preferredIndex":1
                    }
                },
            ])
            .sort({'preferredIndex': 1})
            .collation({locale:"en_US", numericOrdering:true })
            .then((result) => {
                result.forEach(Element => {
                    Element.name = spaceData(Element.name.split(','))
                })
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: result,
                    err: []
                })
            })
            .catch((err) => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    err: []
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

function spaceData(location) {
    let space = "";
    const length = location.length;
    const lastLocation = location[length - 1];
    for (let i = 0; i < length - 1; i++) {
        space += ". . ";
    }
    space += lastLocation;
    return space;
}