import JWT from 'jsonwebtoken';
import config from '../../../config/config';
import Message from '../../../config/message';
import productRangeItemsModel from '../../models/productRangeItems.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import globalSupplierModel from '../../models/supplier.model';
import locationModel from '../../models/location.model';
import supplierProductModel from '../../models/supplierProducts.model';
import UsersModel from '../../models/users.model';
import mongoose from 'mongoose';
import supplierModel from '../../models/supplier.model';


exports.productDetails = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await supplierProductModel.find({
            name: {
                $regex: params.productName.toString().trim(),
                $options: "$i"
            },
            businessId: decode.businessId,
            status: 1
        })
            .populate({
                path: 'supplierId',
                model: companySuppliersModel,
                select: 'supplierId',
                "populate": {
                    path: 'supplierId',
                    model: globalSupplierModel,
                    select: 'name'
                }
            })
            .then((productRangeItems) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: productRangeItems,
                    err: []
                });
            }).catch(err => {
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
exports.supplierDetails = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        globalSupplierModel.aggregate([{
            $match: {
                name: {
                    $regex: params.supplierName
                }
            }
        },
        {
            $match: {
                businessId: mongoose.Types.ObjectId(decode.businessId)
            }
        },
        {
            $lookup: {
                from: 'companysuppliers',
                localField: '_id',
                foreignField: 'supplierId',
                as: 'linkCompanySupplier'
            }
        },
        {
            $unwind: '$linkCompanySupplier'
        },
        {
            $lookup: {
                from: 'productRangeItems',
                localField: 'linkCompanySupplier._id',
                foreignField: 'suppliersProduct.id',
                as: 'linkProductRange'
            }
        },
        {
            $unwind: '$linkProductRange'
        },
        {
            $project: {
                "supplierId": "$_id",
                "supplierName": "$name",
                "linkCompanySupplier": 1,
                "productId": "$linkProductRange._id",
                "image": "$linkProductRange.image",
                "productName": "$linkProductRange.name",
                "linkProductRange.suppliersProduct.id": '$linkCompanySupplier._id'
            }
        }
        ])

            .then((productRangeItems) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: productRangeItems,
                    err: []
                });
            }).catch(err => {
                res.status(401).send({
                    code: 401,
                    message: Message.errorMessage.genericError,
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

exports.locationAndSubLocationProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        productRangeItemsModel.find({
            "locationId": params.id,
            "businessId": decode.businessId,
            status:1
        }).sort({
            'locationPreferredIndex': 1
        })
        .collation({locale: "en_US", numericOrdering: true})
            .then(locationProduct => {
                return locationProduct;
            })
            .then(async locationProduct => {
                if (params.childProduct == "true") {
                    await locationModel.aggregate([
                        {
                            "$match":{ "status":"1"}
                        },
                        {
                            $match:{ "businessId" : mongoose.Types.ObjectId(decode.businessId)}
                        },
                        {
                            "$graphLookup": {
                                "from": "location",
                                "startWith": "$_id",
                                "connectFromField": "_id",
                                "connectToField": "parentId",
                                "depthField": "depth",
                                "as": "parent"
                            }
                        },
                        {
                            $unwind: '$parent',
                        },
                        {
                            $match:{ "_id" : mongoose.Types.ObjectId(params.id)}
                        },
                        {
                            $lookup: {
                                from: 'productRangeItems',
                                localField: 'parent._id',
                                foreignField: 'locationId',
                                as: 'childLocationProduct'
                            }
                        },
                        {
                            $project: {
                                "locations": "$parent",
                                "childLocationProduct": {
                                    "$filter": {
                                        "input": "$childLocationProduct",
                                        "as": "childLocationProduct",
                                        "cond": {
                                            $and: [
                                                {
                                                    "$eq": ["$$childLocationProduct.businessId", mongoose.Types.ObjectId(decode.businessId)]
                                                },
                                                {
                                                    "$eq": ["$$childLocationProduct.status", "1"]
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $unwind: '$childLocationProduct'
                        },
                        {
                            $sort:{
                                "locations.preferredIndex":1,
                                "childLocationProduct.locationPreferredIndex": 1
                            }
                        },
                        {
                            $group: {
                                "_id": null,
                                "locationData":{"$push":"$locations"},
                                "childLocationProduct": {
                                    "$push": "$childLocationProduct"
                                }
                            }
                        },
                    ]).sort({'locationData.preferredIndex':1})
                    .collation({locale: "en_US", numericOrdering: true})
                        .then(data => {
                            if(data.length == 0){
                                res.status(200).send({
                                    code: 200,
                                    message: Message.infoMessage.getDetails,
                                    data: {
                                        'locationProduct': locationProduct,
                                        childLocationProduct: data
                                    },
                                    err: []
                                });    
                            }
                            else{
                                res.status(200).send({
                                    code: 200,
                                    message: Message.infoMessage.getDetails,
                                    data: {
                                        'locationProduct': locationProduct,
                                        childLocationProduct: data[0].childLocationProduct,
                                        parent: data[0].locationData
                                    },
                                    err: []
                                });
                            }
                        })
                } else {
                    res.status(200).send({
                        code: 200,
                        message: Message.infoMessage.getDetails,
                        data: locationProduct,
                        err: []
                    });
                }
            })
            .catch(err => {
                res.status(401).send({
                    code: 401,
                    message: Message.errorMessage.genericError,
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
exports.getSupplier = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await companySuppliersModel.aggregate([{
            $match: {
                type: "1",
                businessId: mongoose.Types.ObjectId(decode.businessId),
                "status": "1"
            }
        }, {
            $lookup: {
                from: 'suppliers',
                localField: 'supplierId',
                foreignField: '_id',
                as: 'supplier'
            }
        }])
            .then((supplier) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: supplier,
                    err: []
                });
            }).catch(err => {
                res.status(401).send({
                    code: 401,
                    message: Message.errorMessage.genericError,
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
exports.getStore = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await companySuppliersModel.find({
            type: 2,
            businessId: decode.businessId,
            "status": 1
        }).populate({ path: 'supplierId', model: supplierModel, select: 'name' })
            .then((store) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: store,
                    err: []
                });
            }).catch(err => {
                res.status(401).send({
                    code: 401,
                    message: Message.errorMessage.genericError,
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

exports.getLocation = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await locationModel.find({
            businessId: decode.businessId,
            status: "1",
            parentId: null
        }).sort({
            preferredIndex: 1
        })
            .then((location) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: location,
                    err: []
                });
            }).catch(err => {
                res.status(400).send({
                    code: 401,
                    message: Message.errorMessage.genericError,
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
exports.getSubLocation = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        locationModel.find({
            parentId: params.id,
            status: "1",
            "businessId": decode.businessId
        })
            .sort({
                preferredIndex: 1
            })
            .collation({locale:"en_US", numericOrdering: true})
            .then(result => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: result,
                    err: []
                });
            })
            .catch(err => {
                res.status(400).send({
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
exports.getSubLocationDetails = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        locationModel.findOne({
            _id: params.id,
            status: "1"
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
                res.status(400).send({
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
exports.getSupplierAndShop = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        companySuppliersModel.find({
            "status": 1,
            "businessId": decode.businessId
        })
            .populate({
                path: 'supplierId',
                model: supplierModel
            })
            .then(getSupplierAndShop => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: getSupplierAndShop,
                    err: []
                });
            })
            .catch(err => {
                res.status(400).send({
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
exports.supplierProductToProductRangeItem = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.find({ "suppliersProduct.supplierProductId": params.id ,"status":1})
        .populate({path:'locationId',model:locationModel,select:"name"})
            .then(productRangeItem => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: productRangeItem,
                    err: []
                });
            })
            .catch(err => {
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
exports.supplierProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await supplierProductModel.find({
            status:1,
            "supplierId": params.supplierId
        }).sort({
            'name': 1
        })
            .then(supplierProduct => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: supplierProduct,
                    err: []
                });
            }).catch(err => {
                res.status(400).send({
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
exports.productList = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await productRangeItemsModel.find({
            name: {
                $regex: params.productName.toString().trim(),
                $options: "$i"
            },
            businessId: decode.businessId,
            status: 1
        })
            .then((productRangeItems) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: productRangeItems,
                    err: []
                });
            }).catch(err => {
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