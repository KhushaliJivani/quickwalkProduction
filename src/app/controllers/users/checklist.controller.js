"use strict";

import JWT from 'jsonwebtoken';
import moment from 'moment';
import ejs from 'ejs';
import mongoose, {
    Aggregate
} from 'mongoose';
import checklist from '../../models/checklist.model';
import config from '../../../config/config';
import Message from '../../../config/message';
import userModel from '../../models/users.model';
import emailUtil from '../../../utils/email';
import checklistCombination from '../../models/checklistCombination.model';
import checklistCollectionModel from '../../models/checklistCombination.model';
import orderDetailModel from '../../models/orderDetail.model';
import productRangeModel from '../../models/productRangeItems.model';
import comapnySupplierModel from '../../models/companySuppliers.model';
import supplierModel from '../../models/supplier.model';
import supplierProductsModel from '../../models/supplierProducts.model'
import orderModel from '../../models/order.model';
import locationModel from '../../models/location.model';
import checkedChecklistCombinationModel from '../../models/checkedChecklistProduct.model';
import {
    adminDetails
} from './shoppinglist.controller';
exports.getChecklist = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        checklist.find({
                status: "1",
                businessId: decode.businessId
            }).sort({
                createdAt: 'desc'
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
exports.checklistCombination = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        params.userId = decode._id;
        params.businessId = decode.businessId;
        params.isDelete = 0;
        const data = checklistCombination(params);
        data.save()
            .then(result => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.checklistCollection,
                    data: result,
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
exports.getChecklistCombination = async (req, res) => {
    try {
        let resturnArray;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await checklistCollectionModel.find({
                isDelete: "0",
                "businessId": decode.businessId
            })
            .populate({
                path: 'userId',
                model: userModel,
                businessId: decode.businessId
            })
            .then(linkChecklist => {
                if (linkChecklist.length > 0) {
                    resturnArray = linkChecklist.map((checklist, index) => {
                        return {
                            checklistCombinationDetail: checklist,
                            checklistCombinationProduct: []
                        }
                    })
                    return resturnArray
                } else {
                    res.status(200).send({
                        code: 200,
                        Message: Message.errorMessage.dataNotFound,
                        data: [],
                        err: []
                    });
                    return null;
                }
            })
            .then(async (checklistCombination) => {
                let index = 0;
                for (let checklist of checklistCombination) {
                    // await checklistCollectionModel.aggregate([
                    //     { "$match": { "isDelete": "0", "_id": mongoose.Types.ObjectId(checklist.checklistCombinationDetail._id) } },
                    //     { "$lookup": { "from": "Users", "localField": "userId", "foreignField": "_id", "as": "user" } },
                    //     { "$lookup": { "from": "checklist", "localField": "checklistId", "foreignField": "_id", "as": "linkChecklist" } },
                    //     { "$unwind": "$linkChecklist" },
                    //     { "$lookup": { "from": "orderDetail", "localField": "linkChecklist.product", "foreignField": "productRangeId", "as": "orderProduct" } },
                    //     { "$unwind": { "path": "$orderProduct" } },
                    //     { "$match": { "orderProduct.quantity": { $ne: 0 } } },
                    //     { "$match": { "orderProduct.statusIndex": { $ne: "4" } } },
                    //     { "$match": { "orderProduct.checklistCombinationId": mongoose.Types.ObjectId(checklist.checklistCombinationDetail._id) } },
                    //     { "$lookup": { "from": "companysuppliers", "localField": "orderProduct.supplierId", "foreignField": "_id", "as": "comapnySupplier" } },
                    //     { "$unwind": { "path": "$comapnySupplier" } },
                    //     { "$lookup": { "from": "order", "localField": "orderProduct.orderId", "foreignField": "_id", "as": "orderData" } },
                    //     { "$unwind": { "path": "$orderData" } },
                    //     { "$lookup": { "from": "suppliers", "localField": "comapnySupplier.supplierId", "foreignField": "_id", "as": "supplier" } },
                    //     { "$unwind": { "path": "$supplier" } },
                    //     { "$project": { "_id": 1, "name": 1, "createdAt": 1, "user": 1, "linkChecklist": 1, "orderProduct": 1, "isPause": 1, 'orderData': 1, "comapnySupplier": 1, "supplier": 1 } },
                    //     {
                    //         $group: {
                    //             _id: { id: '$_id', name: '$name', userName: '$user.firstName', supplierId: "$supplier._id", supplierName: "$supplier.name", supplierType: "$comapnySupplier.type" },
                    //             placeOrderAhead: { "$first": '$comapnySupplier.placeOrderAhead' },
                    //             placeOrderBeforeTime: { "$first": '$comapnySupplier.placeOrderBeforeTime' },
                    //             expectedDeliveryDate: { "$first": '$orderData.expectedDeliveryDate' },
                    //             items: { "$sum": "$orderProduct.quantity" },
                    //             createdDate: { "$first": '$createdAt' },
                    //             isPause: { "$first": "$isPause" }
                    //         }
                    //     },
                    //     {
                    //         $group: {
                    //             _id: '$_id._id',
                    //             name: { "$first": "$_id.name" },
                    //             userName: { "$first": "$_id.userName" },
                    //             createdDate: { "$first": '$createdDate' },
                    //             product: { $push: "$linkChecklist.product" },
                    //             isPause: { "$first": "$isPause" },
                    //             supplier: {
                    //                 "$push": {
                    //                     "supplierId": "$_id.supplierId",
                    //                     "supplierName": "$_id.supplierName",
                    //                     "items": '$items',
                    //                     "placeOrderBeforeTime": '$placeOrderBeforeTime',
                    //                     "placeOrderAhead": '$placeOrderAhead',
                    //                     "expectedDeliveryDate": '$expectedDeliveryDate',
                    //                     "type": '$_id.supplierType'
                    //                 }
                    //             },
                    //         }
                    //     }
                    // ])


                    /**Solve after multiple checklist into checklist-combination */
                    await checklistCollectionModel.aggregate([{
                                "$match": {
                                    "isDelete": "0",
                                    "_id": mongoose.Types.ObjectId(checklist.checklistCombinationDetail._id)
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "Users",
                                    "localField": "userId",
                                    "foreignField": "_id",
                                    "as": "user"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "checklist",
                                    "localField": "checklistId",
                                    "foreignField": "_id",
                                    "as": "linkChecklist"
                                }
                            },
                            {
                                "$unwind": "$linkChecklist"
                            },
                            {
                                "$lookup": {
                                    "from": "orderDetail",
                                    "localField": "linkChecklist.product",
                                    "foreignField": "productRangeId",
                                    "as": "orderProduct"
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$orderProduct"
                                }
                            },
                            {
                                "$match": {
                                    "orderProduct.quantity": {
                                        $ne: 0
                                    }
                                }
                            },
                            {
                                "$match": {
                                    "orderProduct.statusIndex": {
                                        $ne: "4"
                                    }
                                }
                            },
                            {
                                "$match": {
                                    "orderProduct.checklistCombinationId": mongoose.Types.ObjectId(checklist.checklistCombinationDetail._id)
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "companysuppliers",
                                    "localField": "orderProduct.supplierId",
                                    "foreignField": "_id",
                                    "as": "comapnySupplier"
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$comapnySupplier"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "order",
                                    "localField": "orderProduct.orderId",
                                    "foreignField": "_id",
                                    "as": "orderData"
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$orderData"
                                }
                            },
                            {
                                "$match": {
                                    "orderData.status": "0"
                                }
                            },
                            {
                                "$match": {
                                    "orderData.status": {
                                        $ne: "3"
                                    }
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "suppliers",
                                    "localField": "comapnySupplier.supplierId",
                                    "foreignField": "_id",
                                    "as": "supplier"
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$supplier"
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "name": 1,
                                    "createdAt": 1,
                                    "user": 1,
                                    "linkChecklist": 1,
                                    "orderProduct": 1,
                                    "isPause": 1,
                                    'orderData': 1,
                                    "comapnySupplier": 1,
                                    "supplier": 1
                                }
                            },
                            {
                                $group: {
                                    _id: {
                                        id: '$_id',
                                        name: '$name',
                                        userName: '$user.firstName',
                                        supplierId: "$supplier._id",
                                        supplierName: "$supplier.name",
                                        supplierType: "$comapnySupplier.type",
                                        expectedDeliveryDate: '$orderData.expectedDeliveryDate'
                                    },
                                    placeOrderAhead: {
                                        "$first": '$comapnySupplier.placeOrderAhead'
                                    },
                                    placeOrderBeforeTime: {
                                        "$first": '$comapnySupplier.placeOrderBeforeTime'
                                    },
                                    expectedDeliveryDate: {
                                        "$first": '$orderData.expectedDeliveryDate'
                                    },
                                    // items: { "$sum": "$orderProduct.quantity" },
                                    orderDta: {
                                        "$addToSet": '$orderProduct'
                                    },
                                    createdDate: {
                                        "$first": '$createdAt'
                                    },
                                    isPause: {
                                        "$first": "$isPause"
                                    }
                                }
                            },
                            {
                                $unwind: '$orderDta'
                            },
                            {
                                $group: {
                                    _id: {
                                        id: '$_id.id',
                                        name: '$_id.name',
                                        userName: '$_id.userName',
                                        supplierId: "$_id.supplierId",
                                        supplierName: "$_id.supplierName",
                                        supplierType: "$_id.supplierType",
                                        expectedDeliveryDate: '$_id.expectedDeliveryDate'
                                    },
                                    placeOrderAhead: {
                                        "$first": '$placeOrderAhead'
                                    },
                                    placeOrderBeforeTime: {
                                        "$first": '$placeOrderBeforeTime'
                                    },
                                    expectedDeliveryDate: {
                                        "$first": '$expectedDeliveryDate'
                                    },
                                    items: {
                                        "$sum": "$orderDta.quantity"
                                    },
                                    // orderDta:{"$push":'$orderProduct'},
                                    createdDate: {
                                        "$first": '$createdDate'
                                    },
                                    isPause: {
                                        "$first": "$isPause"
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: '$_id.id',
                                    name: {
                                        "$first": "$_id.name"
                                    },
                                    userName: {
                                        "$first": "$_id.userName"
                                    },
                                    createdDate: {
                                        "$first": '$createdDate'
                                    },
                                    product: {
                                        $push: "$linkChecklist.product"
                                    },
                                    isPause: {
                                        "$first": "$isPause"
                                    },
                                    supplier: {
                                        "$push": {
                                            "supplierId": "$_id.supplierId",
                                            "supplierName": "$_id.supplierName",
                                            "items": '$items',
                                            "placeOrderBeforeTime": '$placeOrderBeforeTime',
                                            "placeOrderAhead": '$placeOrderAhead',
                                            "expectedDeliveryDate": '$expectedDeliveryDate',
                                            "type": '$_id.supplierType'
                                        }
                                    },
                                }
                            }
                        ])

                        .then(async (checklistCombinationProduct) => {
                            return checklistCombinationProduct;
                        })
                        .then(async checklistCombinationProduct => {
                            checklist.checklistCombinationProduct = checklistCombinationProduct;
                            if ((checklistCombination.length) - 1 == index) {
                                res.status(200).send({
                                    code: 200,
                                    Message: Message.infoMessage.suggestedProduct,
                                    data: checklistCombination,
                                    err: []
                                });
                            }
                        })
                        .catch((err) => {
                            res.status(400).send({
                                code: 400,
                                message: Message.errorMessage.genericError,
                                data: [],
                                error: err
                            });
                        });
                    index++;
                }
            })
            .catch((err) => {
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


const getProduct = (id, index) => {
    return new Promise((resolve, reject) => {
        try {
            checklistCollectionModel.aggregate([{
                    "$match": {
                        "isDelete": "0",
                        "_id": mongoose.Types.ObjectId(id)
                    }
                },
                {
                    "$lookup": {
                        "from": "Users",
                        "localField": "userId",
                        "foreignField": "_id",
                        "as": "user"
                    }
                },
                {
                    "$lookup": {
                        "from": "checklist",
                        "localField": "checklistId",
                        "foreignField": "_id",
                        "as": "linkChecklist"
                    }
                },
                {
                    "$unwind": "$linkChecklist"
                },
                {
                    "$lookup": {
                        "from": "orderDetail",
                        "localField": "linkChecklist.product",
                        "foreignField": "productRangeId",
                        "as": "orderProduct"
                    }
                },
                {
                    "$unwind": {
                        "path": "$orderProduct"
                    }
                },
                {
                    "$match": {
                        "orderProduct.checklistCombinationId": mongoose.Types.ObjectId(id)
                    }
                },
                {
                    "$lookup": {
                        "from": "companysuppliers",
                        "localField": "orderProduct.supplierId",
                        "foreignField": "_id",
                        "as": "comapnySupplier"
                    }
                },
                {
                    "$unwind": {
                        "path": "$comapnySupplier"
                    }
                },
                {
                    "$lookup": {
                        "from": "order",
                        "localField": "orderProduct.orderId",
                        "foreignField": "_id",
                        "as": "orderData"
                    }
                },
                {
                    "$unwind": {
                        "path": "$orderData"
                    }
                },
                {
                    "$lookup": {
                        "from": "suppliers",
                        "localField": "comapnySupplier.supplierId",
                        "foreignField": "_id",
                        "as": "supplier"
                    }
                },
                {
                    "$unwind": {
                        "path": "$supplier"
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "name": 1,
                        "createdAt": 1,
                        "user": 1,
                        "linkChecklist": 1,
                        "orderProduct": 1,
                        "isPause": 1,
                        'orderData': 1,
                        "comapnySupplier": 1,
                        "supplier": 1
                    }
                },
                {
                    $group: {
                        _id: {
                            id: '$_id',
                            name: '$name',
                            userName: '$user.firstName',
                            supplierId: "$supplier._id",
                            supplierName: "$supplier.name",
                            supplierType: "$comapnySupplier.type"
                        },
                        placeOrderAhead: {
                            "$first": '$comapnySupplier.placeOrderAhead'
                        },
                        placeOrderBeforeTime: {
                            "$first": '$comapnySupplier.placeOrderBeforeTime'
                        },
                        expectedDeliveryDate: {
                            "$first": '$orderData.expectedDeliveryDate'
                        },
                        items: {
                            "$sum": "$orderProduct.quantity"
                        },
                        createdDate: {
                            "$first": '$createdAt'
                        },
                        isPause: {
                            "$first": "$isPause"
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id._id',
                        name: {
                            "$first": "$_id.name"
                        },
                        userName: {
                            "$first": "$_id.userName"
                        },
                        createdDate: {
                            "$first": '$createdDate'
                        },
                        product: {
                            $push: "$linkChecklist.product"
                        },
                        isPause: {
                            "$first": "$isPause"
                        },
                        supplier: {
                            "$push": {
                                "supplierId": "$_id.supplierId",
                                "supplierName": "$_id.supplierName",
                                "items": '$items',
                                "placeOrderBeforeTime": '$placeOrderBeforeTime',
                                "placeOrderAhead": '$placeOrderAhead',
                                "expectedDeliveryDate": '$expectedDeliveryDate',
                                "type": '$_id.supplierType'
                            }
                        },
                    }
                }
            ]).then((product) => {
                resolve({
                    product: product,
                    index: index
                });
            }).catch((err) => {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
}


exports.checklistProductDetail = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        /**Base on location base product listing */
        if (params.custom === "1") {
            await checklistCollectionModel
                .aggregate([{
                        $match: {
                            _id: mongoose.Types.ObjectId(params.id)
                        }
                    },
                    {
                        $lookup: {
                            from: 'checklist',
                            localField: 'checklistId',
                            foreignField: '_id',
                            as: 'checklist'
                        }
                    },
                    {
                        $unwind: '$checklist'
                    },
                    /**  get only active Checklist  */
                    {
                        $match: {
                            "checklist.status": "1"
                        }
                    },

                    {
                        $lookup: {
                            from: 'productRangeItems',
                            localField: 'checklist.product',
                            foreignField: '_id',
                            as: 'checklistProduct'
                        }
                    },
                    {
                        $unwind: '$checklistProduct'
                    },

                    /**  get only active product  */
                    {
                        $match: {
                            'checklistProduct.status': "1"
                        }
                    },
                    {
                        $lookup: {
                            from: 'location',
                            localField: 'checklistProduct.locationId',
                            foreignField: '_id',
                            as: 'locationData'
                        }
                    },
                    {
                        $unwind: '$locationData'
                    },
                    {
                        $lookup: {
                            from: 'checkedChecklistProduct',
                            localField: '_id',
                            foreignField: 'checklistCombinationId',
                            as: 'checkedChecklistProduct'
                        }
                    },
                    {
                        $lookup: {
                            from: 'orderDetail',
                            localField: 'checklistProduct._id',
                            foreignField: 'productRangeId',
                            as: 'orderProduct'
                        }
                    },
                    {
                        $project: {
                            "checklistProduct": 1,
                            "locationData": 1,
                            "checkedChecklistProduct": {
                                $filter: {
                                    "input": "$checkedChecklistProduct",
                                    "as": "checkedChecklistProduct",
                                    "cond": {
                                        $and: [{
                                                $eq: ["$$checkedChecklistProduct.productId", "$checklistProduct._id"]
                                            }
                                        ]
                                    }
                                }
                            },
                            "orderProduct": {
                                $filter: {
                                    "input": "$orderProduct",
                                    "as": "orderProduct",
                                    "cond": {
                                        $and: [{
                                                $eq: ["$$orderProduct.statusIndex", "0"]
                                            },
                                            {
                                                $ne: ["$$orderProduct.statusIndex", "4"]
                                            },
                                            {
                                                $eq: ["$$orderProduct.checklistCombinationId", mongoose.Types.ObjectId(params.id)]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$checklistProduct._id",
                            locationData: {
                                "$push": "$locationData"
                            },
                            checklistProduct: {
                                "$first": "$checklistProduct"
                            },
                            orderProduct: {
                                "$first": "$orderProduct"
                            },
                            checkedChecklistProduct: {
                                "$first": "$checkedChecklistProduct"
                            },
                        }
                    },
                    {
                        $sort: {
                            // "locationData.preferredIndex":1,
                            "checklistProduct.locationPreferredIndex": 1
                        }
                    }
                ])
                .sort({
                    'locationData.preferredIndex': 1
                })
                .collation({
                    locale: "en_US",
                    numericOrdering: true
                })
                .then(async orderProduct => {
                    if (orderProduct.length > 0) {
                        let tempOrderProduct = orderProduct;
                        let temp = 0;
                        let tempArray = [];
                        for (let singleChecklistProduct of orderProduct) {
                            // console.log("singleChecklistProduct.checkedChecklistProduct : ",singleChecklistProduct)
                            if (singleChecklistProduct.checkedChecklistProduct.length > 0  &&  singleChecklistProduct.checkedChecklistProduct[0].isChecked == true) {
                                // console.log("singleChecklistProduct.checkedChecklistProduct.isChecked : ",singleChecklistProduct.checkedChecklistProduct[0].isChecked)
                                // console.log("temp :---------- ",temp)
                                // tempOrderProduct.splice(temp, 1);
                                // console.log("tempOrderProduct.length : ",tempOrderProduct.length)
                            }
                            else if (singleChecklistProduct.checkedChecklistProduct.length > 0  &&  singleChecklistProduct.checkedChecklistProduct[0].isChecked == false) {
                                // console.log("temp :---------- ",temp)
                                // tempOrderProduct.splice(temp, 1);
                                // console.log("tempOrderProduct.length : ",tempOrderProduct.length)
                                tempArray.push(singleChecklistProduct);
                            }
                            else{
                                tempArray.push(singleChecklistProduct);
                            }
                            // if (singleChecklistProduct.checkedChecklistProduct.length > 0) {
                            //     orderProduct.splice(temp, 1);
                            // }
                            // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                            // temp++;
                        }

                        // console.log("________________________________________________________________")
                        res.status(200).send({
                            code: 200,
                            message: Message.infoMessage.getDetails,
                            data: tempArray,
                            err: []
                        });
                    }
                    else{

                        res.status(200).send({
                            code: 200,
                            message: Message.infoMessage.getDetails,
                            data: orderProduct,
                            err: []
                        });
                    }
                })
                .catch(err => {
                    console.log("err",err)
                    res.status(400).send({
                        code: 400,
                        message: Message.errorMessage.genericError,
                        data: [],
                        error: err
                    });
                });
        } else {
            await checklistCollectionModel
                .aggregate([{
                        $match: {
                            _id: mongoose.Types.ObjectId(params.id)
                        }
                    },
                    {
                        $lookup: {
                            from: 'checklist',
                            localField: 'checklistId',
                            foreignField: '_id',
                            as: 'checklist'
                        }
                    },
                    {
                        $unwind: '$checklist'
                    },
                    /**  get only active Checklist  */
                    {
                        $match: {
                            "checklist.status": "1"
                        }
                    },
                    {
                        $lookup: {
                            from: 'productRangeItems',
                            localField: 'checklist.product',
                            foreignField: '_id',
                            as: 'checklistProduct'
                        }
                    },
                    {
                        $unwind: '$checklistProduct'
                    },

                    /**  get only active product  */
                    {
                        $match: {
                            'checklistProduct.status': "1"
                        }
                    },
                    {
                        $lookup: {
                            from: 'location',
                            localField: 'checklistProduct.locationId',
                            foreignField: '_id',
                            as: 'locationData'
                        }
                    },
                    {
                        $unwind: '$locationData'
                    },
                    {
                        $lookup: {
                            from: 'checkedChecklistProduct',
                            localField: '_id',
                            foreignField: 'checklistCombinationId',
                            as: 'checkedChecklistProduct'
                        }
                    },
                    {
                        $lookup: {
                            from: 'orderDetail',
                            localField: 'checklistProduct._id',
                            foreignField: 'productRangeId',
                            as: 'orderProduct'
                        }
                    },
                    {
                        $project: {
                            "checklistProduct": 1,
                            "locationData": 1,
                            "checkedChecklistProduct": {
                                $filter: {
                                    "input": "$checkedChecklistProduct",
                                    "as": "checkedChecklistProduct",
                                    "cond": {
                                        $and: [{
                                                $eq: ["$$checkedChecklistProduct.productId", "$checklistProduct._id"]
                                            },
                                            {
                                                $eq: ["$$checkedChecklistProduct.isChecked", true]
                                            }
                                        ]
                                    }
                                }
                            },
                            "orderProduct": {
                                $filter: {
                                    "input": "$orderProduct",
                                    "as": "orderProduct",
                                    "cond": {
                                        $and: [{
                                                $eq: ["$$orderProduct.statusIndex", "0"]
                                            },
                                            {
                                                $ne: ["$$orderProduct.statusIndex", "4"]
                                            },
                                            {
                                                $eq: ["$$orderProduct.checklistCombinationId", mongoose.Types.ObjectId(params.id)]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$checklistProduct._id",
                            locationData: {
                                "$push": "$locationData"
                            },
                            checklistProduct: {
                                "$first": "$checklistProduct"
                            },
                            orderProduct: {
                                "$first": "$orderProduct"
                            },
                            checkedChecklistProduct: {
                                "$first": "$checkedChecklistProduct"
                            },
                        }
                    },
                    {
                        $sort: {
                            // "locationData.preferredIndex":1,
                            "checklistProduct.locationPreferredIndex": 1
                        }
                    }
                ])
                .sort({
                    'locationData.preferredIndex': 1
                })
                .collation({
                    locale: "en_US",
                    numericOrdering: true
                })
                .then(orderProduct => {
                    res.status(200).send({
                        code: 200,
                        message: Message.infoMessage.getDetails,
                        data: orderProduct,
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
                });
        }
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}
exports.orderSuppplierProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        let storeOrderList = await storeOrder(params);
        let supplierOrderList = await supplierOrder(params);
        let allOrder = [...storeOrderList, ...supplierOrderList]
        res.status(200).send({
            code: 200,
            message: Message.infoMessage.getDetails,
            data: allOrder,
            err: []
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

let storeOrder = async (params) => {
    return orderDetailModel.aggregate([{
            $match: {
                checklistCombinationId: mongoose.Types.ObjectId(params.checklistCombinationId)
            }
        },
        {
            $match: {
                quantity: {
                    $ne: 0
                },
                statusIndex: {
                    $ne: "4"
                },
                statusIndex: {
                    $eq: "1"
                },
            }
        },
        {
            $lookup: {
                from: 'productRangeItems',
                localField: 'productRangeId',
                foreignField: '_id',
                as: 'productRangeList'
            }
        },
        {
            $unwind: '$productRangeList'
        },
        {
            $lookup: {
                from: 'companysuppliers',
                localField: 'supplierId',
                foreignField: '_id',
                as: 'companySupplier'
            }
        },
        {
            "$unwind": {
                "path": "$companySupplier",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $match: {
                'companySupplier.type': {
                    $ne: "1"
                }
            }
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'companySupplier.supplierId',
                foreignField: '_id',
                as: 'supplier'
            }
        },
        {
            $group: {
                _id: {
                    supplierId: "$supplier._id",
                    supplierName: "$supplier.name",
                    placeOrderBeforeTime: '$companySupplier.placeOrderBeforeTime',
                    placeOrderAhead: '$companySupplier.placeOrderAhead',
                    supplierType: '$companySupplier.type',
                    estimatedDate: '$expectedDeliveryDate'
                },
                quantity: {
                    "$push": "$quantity"
                },
                checklistProduct: {
                    "$push": {
                        "_id": "$productRangeList._id",
                        "status": "$productRangeList.status",
                        "name": "$productRangeList.name",
                        "packaging": "$productRangeList.packaging",
                        "standardQuantity": "$productRangeList.standardQuantity",
                        "locationId": "$productRangeList.locationId",
                        "businessId": "$productRangeList.businessId",
                        "locationPreferredIndex": "$productRangeList.locationPreferredIndex",
                        "suppliersProduct": "$productRangeList.suppliersProduct",
                        "updatedAt": "$productRangeList.updatedAt",
                        "createdAt": "$productRangeList.createdAt",
                        "image": "$productRangeList.image",
                        "asap": "$asap"
                    }
                },
                asap: {
                    "$push": {
                        'asap': "$asap",
                        'id': '$productRangeId'
                    }
                },
                estimatedDate: {
                    "$first": '$expectedDeliveryDate'
                },
            }
        }
    ])
}
let supplierOrder = async (params) => {
    return orderDetailModel.aggregate([{
            $match: {
                checklistCombinationId: mongoose.Types.ObjectId(params.checklistCombinationId)
            }
        },
        {
            $match: {
                quantity: {
                    $ne: 0
                },
                statusIndex: {
                    $ne: "4"
                },
                statusIndex: {
                    $eq: "0"
                },
            }
        },
        {
            $lookup: {
                from: 'productRangeItems',
                localField: 'productRangeId',
                foreignField: '_id',
                as: 'productRangeList'
            }
        },
        {
            $unwind: '$productRangeList'
        },
        {
            $lookup: {
                from: 'companysuppliers',
                localField: 'supplierId',
                foreignField: '_id',
                as: 'companySupplier'
            }
        },
        {
            "$unwind": {
                "path": "$companySupplier",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $match: {
                'companySupplier.type': {
                    $eq: "1"
                }
            }
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'companySupplier.supplierId',
                foreignField: '_id',
                as: 'supplier'
            }
        },
        {
            $group: {
                _id: {
                    supplierId: "$supplier._id",
                    supplierName: "$supplier.name",
                    placeOrderBeforeTime: '$companySupplier.placeOrderBeforeTime',
                    placeOrderAhead: '$companySupplier.placeOrderAhead',
                    supplierType: '$companySupplier.type',
                    estimatedDate: '$expectedDeliveryDate'
                },
                quantity: {
                    "$push": "$quantity"
                },
                checklistProduct: {
                    "$push": {
                        "_id": "$productRangeList._id",
                        "status": "$productRangeList.status",
                        "name": "$productRangeList.name",
                        "packaging": "$productRangeList.packaging",
                        "standardQuantity": "$productRangeList.standardQuantity",
                        "locationId": "$productRangeList.locationId",
                        "businessId": "$productRangeList.businessId",
                        "locationPreferredIndex": "$productRangeList.locationPreferredIndex",
                        "suppliersProduct": "$productRangeList.suppliersProduct",
                        "updatedAt": "$productRangeList.updatedAt",
                        "createdAt": "$productRangeList.createdAt",
                        "image": "$productRangeList.image",
                        "asap": "$asap"
                    }
                },
                asap: {
                    "$push": {
                        'asap': "$asap",
                        'id': '$productRangeId'
                    }
                },
                estimatedDate: {
                    "$first": '$expectedDeliveryDate'
                },
            }
        }
    ])
}
exports.finalOrder = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await orderDetailModel.find({
                checklistCombinationId: params.checklistCombinationId,
                statusIndex: 1
            })
            .populate({
                path: 'supplierId',
                model: comapnySupplierModel,
                "select": "supplierId deliveryDaysStandard placeOrderAhead placeOrderBeforeTime",
                "populate": {
                    path: 'supplierId',
                    model: supplierModel,
                    "select": "name"
                }
            })
            .then((supplier) => {
                const dateTime = new Date();
                const currentTime = dateTime.getHours() + ':' + dateTime.getMinutes();
                let date;
                let errorProduct = [];
                supplier.forEach(supplierData => {

                    date = moment(supplierData.expectedDeliveryDate).subtract(supplierData.supplierId.placeOrderAhead, "days").format("MM-DD-YYYY");
                    if (new Date(moment().format("MM-DD-YYYY")) < new Date(date) && moment().format("HH:mm") > supplierData.supplierId.placeOrderBeforeTime) {
                        errorProduct.push(supplierData);
                    }
                })
                if (errorProduct.length > 0) {
                    res.status(401).send({
                        code: 401,
                        message: Message.infoMessage.changeDeliveryDate,
                        data: errorProduct,
                        err: []
                    })
                } else {
                    orderDetailModel.updateMany({
                            checklistCombinationId: params.checklistCombinationId
                        }, {
                            $set: {
                                statusIndex: "1"
                            }
                        })
                        .then((orderDetails) => {
                            res.status(200).send({
                                code: 200,
                                message: Message.infoMessage.orderConfirm,
                                data: orderDetails,
                                err: []
                            });
                        }).catch(err => {
                            res.status(400).send({
                                code: 400,
                                message: Message.errorMessage.genericError,
                                data: [],
                                err: err
                            });
                        })
                }
            }).catch(err => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    err: err
                })
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
exports.asap = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        const orderForSave = orderModel({
            businessId: decode.businessId,
            expectedDeliveryDate: params.expectedDeliveryDate,
            status: 0,
            supplierId: params.supplierId,
            asap: params.asap,
        });
        orderForSave.save()
            .then((order) => {
                params.businessId = decode.businessId;
                params.orderId = order._id;
                params.orderByUserId = decode._id;
                params.orderOnDateTime = Date.now();
                params.statusIndex = 0;
                const orderDetailForSave = orderDetailModel(params);
                orderDetailForSave.save();
                return productRangeModel.findById(params.productRangeId)
            })
            .then((orderDetail) => {
                comapnySupplierModel.findById(params.supplierId).select('orderEmail')
                    .then((companySupplier) => {
                        ejs.renderFile('src/views/email/sendAsap.ejs', {
                                orderDetail: orderDetail,
                                items: params.quantity
                            })
                            .then((content) => {
                                const mailOptions = {
                                    to: companySupplier.orderEmail,
                                    subject: "Check That",
                                    html: content
                                };
                                emailUtil.email(mailOptions).then((info) => {
                                        res.send(orderDetail);
                                    })
                                    .catch(err => {})
                            })
                    })
            }).catch(err => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
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
exports.orderList = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await orderModel.aggregate([{
                    $match: {
                        "businessId": mongoose.Types.ObjectId(decode.businessId),
                        "status": "0"
                    }
                },
                {
                    "$lookup": {
                        "from": "companysuppliers",
                        "localField": "supplierId",
                        "foreignField": "_id",
                        "as": "companySupplier"
                    }
                },
                {
                    $unwind: "$companySupplier"
                },
                {
                    $match: {
                        "companySupplier.type": "1"
                    }
                },
                {
                    "$lookup": {
                        "from": "suppliers",
                        "localField": "companySupplier.supplierId",
                        "foreignField": "_id",
                        "as": "supplier"
                    }
                },

                {
                    $unwind: "$supplier"
                },
                {
                    "$lookup": {
                        "from": "orderDetail",
                        "localField": "_id",
                        "foreignField": "orderId",
                        "as": "orderList"
                    }
                },

                {
                    $unwind: "$orderList"
                },
                {
                    $match: {
                        'orderList.quantity': {
                            $ne: 0
                        }
                    }
                },
                {
                    $match: {
                        'orderList.statusIndex': {
                            $ne: "4"
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            id: "$supplier._id",
                            supplierName: "$supplier.name",
                            orderId: "$_id",
                        },
                        expectedDeliveryDate: {
                            "$first": {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$expectedDeliveryDate"
                                }
                            }
                        },
                        status: {
                            "$first": '$status'
                        },
                        orderSupplier: {
                            "$first": "$orderList"
                        },
                        placeOrderAhead: {
                            "$first": "$companySupplier.placeOrderAhead"
                        },
                        placeOrderBeforeTime: {
                            "$first": "$companySupplier.placeOrderBeforeTime"
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            expectedDeliveryDate: "$expectedDeliveryDate",
                            id: "$_id.id"
                        },
                        supplierName: {
                            "$first": "$_id.supplierName"
                        },
                        supplierId: {
                            "$first": "$_id.id"
                        },
                        orderId: {
                            "$first": "$_id.orderId"
                        },
                        status: {
                            "$first": '$status'
                        },
                        orderSupplier: {
                            "$push": "$orderSupplier"
                        },
                        placeOrderAhead: {
                            "$first": "$placeOrderAhead"
                        },
                        placeOrderBeforeTime: {
                            "$first": "$placeOrderBeforeTime"
                        }
                    }
                },
                {
                    "$sort": {
                        "_id.expectedDeliveryDate": 1
                    }
                }
            ])
            .then((orderList) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: orderList,
                    err: []
                })
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
exports.orderListSend = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await orderModel.aggregate([{
                    $match: {
                        "businessId": mongoose.Types.ObjectId(decode.businessId),
                        "status": "1"
                    }
                },
                {
                    "$lookup": {
                        "from": "companysuppliers",
                        "localField": "supplierId",
                        "foreignField": "_id",
                        "as": "companySupplier"
                    }
                },
                {
                    $unwind: "$companySupplier"
                },
                {
                    $match: {
                        "companySupplier.type": "1"
                    }
                },
                {
                    "$lookup": {
                        "from": "suppliers",
                        "localField": "companySupplier.supplierId",
                        "foreignField": "_id",
                        "as": "supplier"
                    }
                },

                {
                    $unwind: "$supplier"
                },
                {
                    "$lookup": {
                        "from": "orderDetail",
                        "localField": "_id",
                        "foreignField": "orderId",
                        "as": "orderList"
                    }
                },

                {
                    $unwind: "$orderList"
                },
                {
                    $match: {
                        'orderList.quantity': {
                            $ne: 0
                        }
                    }
                },
                {
                    $match: {
                        'orderList.statusIndex': {
                            $ne: "4"
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            id: "$supplier._id",
                            supplierName: "$supplier.name",
                            orderId: "$_id",
                        },
                        expectedDeliveryDate: {
                            "$first": {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$expectedDeliveryDate"
                                }
                            }
                        },
                        status: {
                            "$first": '$status'
                        },
                        orderSupplier: {
                            "$first": "$orderList"
                        },
                        placeOrderAhead: {
                            "$first": "$companySupplier.placeOrderAhead"
                        },
                        placeOrderBeforeTime: {
                            "$first": "$companySupplier.placeOrderBeforeTime"
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            expectedDeliveryDate: "$expectedDeliveryDate",
                            id: "$_id.orderId"
                        },
                        supplierName: {
                            "$first": "$_id.supplierName"
                        },
                        supplierId: {
                            "$first": "$_id.id"
                        },
                        orderId: {
                            "$first": "$_id.orderId"
                        },
                        status: {
                            "$first": '$status'
                        },
                        orderSupplier: {
                            "$push": "$orderSupplier"
                        },
                        placeOrderAhead: {
                            "$first": "$placeOrderAhead"
                        },
                        placeOrderBeforeTime: {
                            "$first": "$placeOrderBeforeTime"
                        }
                    }
                },
                {
                    "$sort": {
                        "_id.expectedDeliveryDate": 1
                    }
                }
            ])
            .then((orderList) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: orderList,
                    err: []
                })
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
exports.orderListReceived = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        const date = moment(new Date()).subtract('days', 1);
        // let admin = await adminDetails(decode.businessId);
        await orderModel.aggregate([{
                    $match: {
                        "businessId": mongoose.Types.ObjectId(decode.businessId),
                        "status": "2",
                        "actualDeliveryDate": {
                            $gt: new Date(date)
                        }
                        // "actualDeliveryDate":{ $gt: momentTimeZone.tz(new Date(date),admin.timeZone) }
                    }
                },
                {
                    "$lookup": {
                        "from": "companysuppliers",
                        "localField": "supplierId",
                        "foreignField": "_id",
                        "as": "companySupplier"
                    }
                },
                {
                    $unwind: "$companySupplier"
                },
                {
                    $match: {
                        "companySupplier.type": "1"
                    }
                },
                {
                    "$lookup": {
                        "from": "suppliers",
                        "localField": "companySupplier.supplierId",
                        "foreignField": "_id",
                        "as": "supplier"
                    }
                },

                {
                    $unwind: "$supplier"
                },
                {
                    "$lookup": {
                        "from": "orderDetail",
                        "localField": "_id",
                        "foreignField": "orderId",
                        "as": "orderList"
                    }
                },

                {
                    $unwind: "$orderList"
                },
                {
                    $match: {
                        'orderList.quantity': {
                            $ne: 0
                        }
                    }
                },
                {
                    $match: {
                        'orderList.statusIndex': {
                            $ne: "4"
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            id: "$supplier._id",
                            supplierName: "$supplier.name",
                            orderId: "$_id",
                        },
                        expectedDeliveryDate: {
                            "$first": {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$expectedDeliveryDate"
                                }
                            }
                        },
                        status: {
                            "$first": '$status'
                        },
                        orderSupplier: {
                            "$first": "$orderList"
                        },
                        placeOrderAhead: {
                            "$first": "$companySupplier.placeOrderAhead"
                        },
                        placeOrderBeforeTime: {
                            "$first": "$companySupplier.placeOrderBeforeTime"
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            expectedDeliveryDate: "$expectedDeliveryDate",
                            id: "$_id.orderId"
                        },
                        supplierName: {
                            "$first": "$_id.supplierName"
                        },
                        supplierId: {
                            "$first": "$_id.id"
                        },
                        orderId: {
                            "$first": "$_id.orderId"
                        },
                        status: {
                            "$first": '$status'
                        },
                        orderSupplier: {
                            "$push": "$orderSupplier"
                        },
                        placeOrderAhead: {
                            "$first": "$placeOrderAhead"
                        },
                        placeOrderBeforeTime: {
                            "$first": "$placeOrderBeforeTime"
                        }
                    }
                },
                {
                    "$sort": {
                        "_id.expectedDeliveryDate": 1
                    }
                }
            ])
            .then((orderList) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: orderList,
                    err: []
                })
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
exports.orderListProductWise = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await orderModel.aggregate([{
                $match: {
                    "_id": mongoose.Types.ObjectId(params.id)
                }
            },
            {
                "$lookup": {
                    "from": "orderDetail",
                    "localField": "_id",
                    "foreignField": "orderId",
                    "as": "orderDetailsData"
                }
            },
            {
                $unwind: "$orderDetailsData"
            },
            {
                $match: {
                    'orderDetailsData.quantity': {
                        "$ne": 0
                    }
                }
            },
            {
                $match: {
                    'orderDetailsData.statusIndex': {
                        $ne: "4"
                    }
                }
            },
            {
                "$lookup": {
                    "from": "companysuppliers",
                    "localField": "orderDetailsData.supplierId",
                    "foreignField": "_id",
                    "as": "companySupplier"
                }
            },
            {
                $unwind: "$companySupplier"
            },
            {
                $match: {
                    "companySupplier.type": "1"
                }
            },
            {
                "$lookup": {
                    "from": "suppliers",
                    "localField": "companySupplier.supplierId",
                    "foreignField": "_id",
                    "as": "supplier"
                }
            },
            {
                $unwind: "$supplier"
            },
            {
                "$lookup": {
                    "from": "productRangeItems",
                    "localField": "orderDetailsData.productRangeId",
                    "foreignField": "_id",
                    "as": "productRage"
                }
            },
            {
                $unwind: "$productRage"
            },
            {
                $group: {
                    "_id": {
                        "id": "$productRage._id",
                        "name": "$productRage.name"
                    },
                    "orderSupplierProduct": {
                        "$first": "$productRage"
                    },
                    "orderDetails": {
                        "$push": '$orderDetailsData'
                    },
                    "remark": {
                        "$first": '$remark'
                    },
                    "orderStatus": {
                        "$first": '$status'
                    },
                    "quantity": {
                        $sum: "$orderDetailsData.quantity"
                    },
                    "packaging": {
                        $sum: "$orderDetailsData.packaging"
                    }
                }
            }, {
                $project: {
                    name: "$_id.name",
                    "orderSupplierProduct": "$orderSupplierProduct",
                    "Quantity": "$quantity",
                    "orderDetails": "$orderDetails",
                    "packaging": "$packaging",
                    "remark": "$remark",
                    "orderStatus": "$orderStatus"
                }
            }
        ]).then((supplierProduct) => {
            supplierProductsModel.populate(supplierProduct, {
                    path: 'orderSupplierProduct.suppliersProduct.supplierProductId'
                })
                .then(data => {
                    res.status(200).send({
                        code: 200,
                        message: Message.infoMessage.getDetails,
                        data: data,
                        err: []
                    })
                })
        }).catch(err => {
            res.status(400).send({
                code: 400,
                message: Message.errorMessage.genericError,
                data: [],
                err: err
            })
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

// **New change */
// exports.orderListProductWise = async (req, res) => {
//     try {
//         const {
//             params
//         } = req.body;
//         let tempArray = [];
//         let addProductPrice = [];
//         const array = ['5e0dd21c2778cc210c294e45','5e0dd4982778cc210c294e48'];
//         const arrayValue = array.values();
//         for (let singleValue of arrayValue){
//             await orderModel.aggregate([{
//                 $match: {
//                     "_id": mongoose.Types.ObjectId(singleValue)
//                 }
//             },
//             {
//                 "$lookup": {
//                     "from": "orderDetail",
//                     "localField": "_id",
//                     "foreignField": "orderId",
//                     "as": "orderDetailsData"
//                 }
//             },
//             {
//                 $unwind: "$orderDetailsData"
//             },
//             {
//                 $match: {
//                     'orderDetailsData.quantity': {
//                         "$ne": 0
//                     }
//                 }
//             },
//             {
//                 $match: {
//                     'orderDetailsData.statusIndex': {
//                         $ne: "4"
//                     }
//                 }
//             },
//             {
//                 "$lookup": {
//                     "from": "companysuppliers",
//                     "localField": "orderDetailsData.supplierId",
//                     "foreignField": "_id",
//                     "as": "companySupplier"
//                 }
//             },
//             {
//                 $unwind: "$companySupplier"
//             },
//             {
//                 $match: {
//                     "companySupplier.type": "1"
//                 }
//             },
//             {
//                 "$lookup": {
//                     "from": "suppliers",
//                     "localField": "companySupplier.supplierId",
//                     "foreignField": "_id",
//                     "as": "supplier"
//                 }
//             },
//             {
//                 $unwind: "$supplier"
//             },
//             {
//                 "$lookup": {
//                     "from": "productRangeItems",
//                     "localField": "orderDetailsData.productRangeId",
//                     "foreignField": "_id",
//                     "as": "productRage"
//                 }
//             },
//             {
//                 $unwind: "$productRage"
//             },
//             {
//                 $group: {
//                     "_id": {
//                         "id": "$productRage._id",
//                         "name": "$productRage.name"
//                     },
//                     "orderSupplierProduct": {
//                         "$first": "$productRage"
//                     },
//                     "orderDetails": {
//                         "$push": '$orderDetailsData'
//                     },
//                     "remark": {
//                         "$first": '$remark'
//                     },
//                     "orderStatus": {
//                         "$first": '$status'
//                     },
//                     "quantity": {
//                         $sum: "$orderDetailsData.quantity"
//                     },
//                     "packaging": {
//                         $sum: "$orderDetailsData.packaging"
//                     }
//                 }
//             }, {
//                 $project: {
//                     name: "$_id.name",
//                     "orderSupplierProduct": "$orderSupplierProduct",
//                     "Quantity": "$quantity",
//                     "orderDetails": "$orderDetails",
//                     "packaging": "$packaging",
//                     "remark": "$remark",
//                     "orderStatus": "$orderStatus"
//                 }
//             }
//         ]).then(async(supplierProduct) => {
//             await supplierProductsModel.populate(supplierProduct, {
//                     path: 'orderSupplierProduct.suppliersProduct.supplierProductId'
//                 })
//                 .then(data => {
//                     tempArray = [...tempArray,...data];
//                 })
//         }).catch(err => {
//             res.status(400).send({
//                 code: 400,
//                 message: Message.errorMessage.genericError,
//                 data: [],
//                 err: err
//             })
//         })
//         }
//         tempArray.forEach(function (a) {
//             console.log("a : ",a._id.id)
//             if (!this[a._id.id]) {
//                 this[a._id.id] = { _id: a._id, name: a.name, orderSupplierProduct: a.orderSupplierProduct, Quantity: 0, packaging: a.packaging, remark: a.remark, orderStatus: a.orderStatus };
//                 addProductPrice.push(this[a._id.id]);
//             }
//             this[a._id.id].Quantity += a.Quantity;
//             this[a._id.id].packaging += a.packaging;
//         }, Object.create(null));
        
//         res.status(200).send({
//             code: 200,
//             message: Message.infoMessage.getDetails,
//             // data: tempArray,
//             data: addProductPrice,
//             err: []
//         })
        
//     } catch (err) {
//         console.log("errrr",err)
//         res.status(400).send({
//             code: 400,
//             message: Message.errorMessage.genericError,
//             data: [],
//             error: err
//         });
//     }
// }

exports.orderProductComment = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        let i = 0;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        // let admin = await adminDetails(decode.businessId);
        await params.product.forEach(Element => {
            if (i == params.product.length - 1) {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.updateData,
                    data: [],
                    err: []
                });
            }
            if (Element.status == 3) {
                orderDetailModel.findByIdAndUpdate(Element.id, {
                        deliveryComment: Element.orderComment,
                        deliveredQuantity: Element.quantity,
                        actualDeliveryDate: new Date(),
                        // actualDeliveryDate: momentTimeZone.tz(new Date(),admin.timeZone),
                        statusIndex: 3
                    }, {
                        new: true
                    })
                    .then(async (updateOrderDetails) => {
                        await orderModel.findByIdAndUpdate(updateOrderDetails.orderId, {
                                deliveryDateTime: Date.now(),
                                status: 2,
                                actualDeliveryDate: new Date()
                            }, {
                                new: true
                            })
                            // orderModel.findByIdAndUpdate(updateOrderDetails.orderId, { deliveryDateTime: momentTimeZone.tz(new Date(),admin.timeZone), status: 2, actualDeliveryDate: momentTimeZone.tz(new Date(),admin.timeZone) }, { new: true })
                            .then(async (updateOrder) => {
                                await orderDetailModel.updateMany({
                                        orderId: updateOrderDetails.orderId,
                                        productRangeId: updateOrderDetails.productRangeId,
                                        statusIndex: {
                                            $ne: "4"
                                        },
                                        quantity: {
                                            $ne: 0
                                        }
                                    }, {
                                        deliveryComment: Element.orderComment,
                                        deliveredQuantity: Element.quantity,
                                        actualDeliveryDate: new Date(),
                                        // actualDeliveryDate: momentTimeZone.tz(new Date(),admin.timeZone),
                                        statusIndex: 3
                                    }, {
                                        new: true
                                    })
                                    .then((data => {}))
                            })
                    })
            } else {
                orderDetailModel.findByIdAndUpdate(Element.id, {
                        deliveryComment: Element.orderComment,
                        deliveredQuantity: Element.quantity,
                        actualDeliveryDate: new Date(),
                        // actualDeliveryDate: momentTimeZone.tz(new Date(),admin.timeZone),
                        statusIndex: 2
                    }, {
                        new: true
                    })
                    .then((updateOrderDetails) => {
                        orderModel.findByIdAndUpdate(updateOrderDetails.orderId, {
                                deliveryDateTime: Date.now(),
                                status: 2,
                                actualDeliveryDate: new Date()
                            }, {
                                new: true
                            })
                            // orderModel.findByIdAndUpdate(updateOrderDetails.orderId, { deliveryDateTime: momentTimeZone.tz(new Date(),admin.timeZone), status: 2, actualDeliveryDate: momentTimeZone.tz(new Date(),admin.timeZone) }, { new: true })
                            .then(async (updateOrder) => {
                                await orderDetailModel.updateMany({
                                        orderId: updateOrderDetails.orderId,
                                        productRangeId: updateOrderDetails.productRangeId,
                                        statusIndex: {
                                            $ne: "4"
                                        },
                                        quantity: {
                                            $ne: 0
                                        }
                                    }, {
                                        deliveryComment: Element.orderComment,
                                        deliveredQuantity: Element.quantity,
                                        actualDeliveryDate: new Date(),
                                        // actualDeliveryDate: momentTimeZone.tz(new Date(),admin.timeZone),
                                        statusIndex: 2
                                    }, {
                                        new: true
                                    })
                                    .then((data => {}))
                            })
                    })
            }
            i++;
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
exports.getChecklistCombinationName = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        checklistCollectionModel.findOne({
            checklistId: params.checklist
        }).then(checklist => {
            if (checklist) {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: checklist.name,
                    err: []
                })
            } else {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.checklistCombinationName,
                    data: [],
                    err: []
                })
            }

        }).catch(err => {
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
exports.checklistCombinationPause = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        checklistCollectionModel.findByIdAndUpdate(params.checklistCombinationId, {
                isPause: 1,
                "pauseData.checklistCombinationId": params.checklistCombinationId,
                "pauseData.productId": params.productId,
                "pauseData.productIndex": params.productIndex,
                "pauseData.userId": decode._id
            }, {
                upsert: true,
                new: true
            })
            .then(pausedata => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.checklistComninationPause,
                    data: pausedata,
                    err: []
                })
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
exports.resumeChecklistCombination = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await checklistCollectionModel.findByIdAndUpdate(params.checklistCombinationId, {
                isPause: 0
            }, {
                new: true
            }).populate({
                path: 'userId',
                model: userModel
            }).populate({
                path: 'productId',
                model: productRangeModel
            })
            .then(pauseData => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: pauseData,
                    err: []
                })
            }).catch(err => {
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

exports.checklistProductList = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await checklistCollectionModel.aggregate([{
                    $match: {
                        _id: mongoose.Types.ObjectId(params.id)
                    }
                },
                {
                    $lookup: {
                        from: 'checklist',
                        localField: 'checklistId',
                        foreignField: '_id',
                        as: 'checklist'
                    }
                },
                {
                    $unwind: '$checklist'
                },
                {
                    $lookup: {
                        from: 'productRangeItems',
                        localField: 'checklist.product',
                        foreignField: '_id',
                        as: 'checklistProduct'
                    }
                },
                {
                    $unwind: '$checklistProduct'
                },
                {
                    $lookup: {
                        from: 'orderDetail',
                        localField: 'checklistProduct._id',
                        foreignField: 'productRangeId',
                        as: 'orderProduct'
                    }
                },
                {
                    "$project": {
                        "checklistProduct": "$checklistProduct",
                        "orderProduct": {
                            "$filter": {
                                "input": "$orderProduct",
                                "as": "orderProduct",
                                "cond": {
                                    "$eq": ["$$orderProduct.checklistCombinationId", mongoose.Types.ObjectId(params.id)]
                                }
                            }
                        }
                    }
                }
            ])
            .then((checklistWiseData) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: checklistWiseData,
                    err: []
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

exports.submitOrder = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        // let admin = await adminDetails(decode.businessId);
        checklistCollectionModel.findOne({
                _id: params.checklistCombinationId,
                isDelete: 0
            }).select('finishDate finsishByUserId')
            .then((checklistCombination) => {
                if (checklistCombination === null) {
                    res.status(404).send({
                        code: 404,
                        message: Message.errorMessage.dataNotFound,
                        data: [],
                        err: []
                    });
                } else if (!checklistCombination.finishDate) {
                    checklistCollectionModel.findByIdAndUpdate(checklistCombination._id, {
                            finishDate: new Date(),
                            finsishByUserId: decode._id
                        }, {
                            new: true,
                            upsert: true
                        })
                        // checklistCollectionModel.findByIdAndUpdate(checklistCombination._id, { finishDate: momentTimeZone.tz(new Date(),admin.timeZone), finsishByUserId: decode._id }, { new: true, upsert: true })
                        .then(checklistData => {
                            res.status(200).send({
                                code: 200,
                                message: Message.infoMessage.updateData,
                                data: checklistData,
                                err: []
                            });
                        })
                        .catch((err) => {
                            res.status(400).send({
                                code: 400,
                                message: Message.errorMessage.genericError,
                                data: [],
                                error: err
                            });
                        })
                } else {
                    res.status(409).send({
                        code: 409,
                        message: Message.infoMessage.alreadySubmitted,
                        data: [],
                        err: []
                    });
                }
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

exports.editOrder = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await orderDetailModel.findOneAndUpdate({
                _id: params.orderDetailsId,
                statusIndex: 0
            }, {
                quantity: params.quantity,
                packaging: params.packaging
            }, {
                new: true
            })
            .then((updateOrder) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.updateData,
                    data: updateOrder,
                    err: []
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

exports.allOrderProductListing = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await orderDetailModel.find({
                productRangeId: params.productRangeId,
                orderId: params.orderId,
                quantity: {
                    $ne: 0
                },
                statusIndex: {
                    $ne: "4"
                }
            })
            .populate({
                path: 'orderId',
                model: orderModel,
                select: "status"
            })
            .populate({
                path: 'checklistCombinationId',
                model: checklistCombination,
                select: "name"
            })
            .populate({
                path: 'productRangeId',
                model: productRangeModel
            })
            .populate({
                path: 'supplierId',
                model: comapnySupplierModel,
                select: "supplierId",
                "populate": {
                    path: 'supplierId',
                    model: supplierModel,
                    select: "name"
                }
            })
            .then((orderProductData) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: orderProductData,
                    error: []
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

//**New Changes */
// exports.allOrderProductListing = async (req, res) => {
//     try {
//         const {
//             params
//         } = req.body;
//         const exe = req.headers.authorization.split(' ');
//         const decode = JWT.verify(exe[1], config.JWTSecret);
//         let tempArray = [];
//         const array = ['5e0dd21c2778cc210c294e45','5e0dd4982778cc210c294e48'];
//         const productRangeId = ['5e09dfac585b6b0d30c4153d','5e09dfac585b6b0d30c4153b'];
//         const arrayValue = array.values();
//         for (let singleValue  of arrayValue){
//             await orderDetailModel.find({
//                 productRangeId: productRangeId,
//                 orderId: singleValue,
//                 quantity: {
//                     $ne: 0
//                 },
//                 statusIndex: {
//                     $ne: "4"
//                 }
//             })
//             .populate({
//                 path: 'orderId',
//                 model: orderModel,
//                 select: "status"
//             })
//             .populate({
//                 path: 'checklistCombinationId',
//                 model: checklistCombination,
//                 select: "name"
//             })
//             .populate({
//                 path: 'productRangeId',
//                 model: productRangeModel
//             })
//             .populate({
//                 path: 'supplierId',
//                 model: comapnySupplierModel,
//                 select: "supplierId",
//                 "populate": {
//                     path: 'supplierId',
//                     model: supplierModel,
//                     select: "name"
//                 }
//             })
//             .then((orderProductData) => {
//                 tempArray = [ ...tempArray, ...orderProductData];
//             }).catch((err) => {
//                 res.status(400).send({
//                     code: 400,
//                     message: Message.errorMessage.genericError,
//                     data: [],
//                     error: err
//                 });
//             })
//         }
//         res.status(200).send({
//             code: 200,
//             message: Message.infoMessage.getDetails,
//             data: tempArray,
//             // data: tempArray,
//             error: []
//         })
//     } catch (err) {
//         console.log("err",err)
//         res.status(400).send({
//             code: 400,
//             message: Message.errorMessage.genericError,
//             data: [],
//             error: err
//         });
//     }
// }
exports.orderProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await orderDetailModel.findById(params.orderDetailId)
            .populate({
                path: 'checklistCombinationId',
                model: checklistCombination,
                select: "name"
            })
            .populate({
                path: 'orderId',
                model: orderModel
            })
            .populate({
                path: 'productRangeId',
                model: productRangeModel,
                "populate": {
                    path: 'suppliersProduct.supplierProductId',
                    model: supplierProductsModel,
                    "select": "minOrder orderBy name packaging"
                }
            })
            .populate({
                path: 'supplierId',
                model: comapnySupplierModel,
                "populate": {
                    path: 'supplierId',
                    model: supplierModel
                }
            })
            .then(async (orderProduct) => {
                orderProduct.orderId.asap = orderProduct.asap;
                orderProduct.productRangeId.suppliersProduct.filter(supplierProducts => {
                    if (supplierProducts.supplierProductId !== undefined && String(supplierProducts.supplierProductId._id) == String(orderProduct.supplierProductId)) {
                        return orderProduct.productRangeId.suppliersProduct = supplierProducts;
                    }
                })
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: orderProduct,
                    error: []
                })
            })
            .catch((err) => {
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


exports.checklistProductAndDetail = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const checklistProductsList = await checklistProducts(params);
        const productDetails = await productDetail(checklistProductsList, params.id);
        res.status(200).send({
            code: 200,
            message: Message.infoMessage.getDetails,
            data: {
                checklistProductsList: checklistProductsList,
                productDetails: productDetails
            },
            error: []
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
const checklistProducts = async (params) => {

    /**Base on location base product listing */
    return await checklistCollectionModel
        .aggregate([{
                $match: {
                    _id: mongoose.Types.ObjectId(params.id)
                }
            },
            {
                $lookup: {
                    from: 'checklist',
                    localField: 'checklistId',
                    foreignField: '_id',
                    as: 'checklist'
                }
            },
            {
                $unwind: '$checklist'
            },
            /**  get only active Checklist  */
            {
                $match: {
                    "checklist.status": "1"
                }
            },

            {
                $lookup: {
                    from: 'productRangeItems',
                    localField: 'checklist.product',
                    foreignField: '_id',
                    as: 'checklistProduct'
                }
            },
            {
                $unwind: '$checklistProduct'
            },

            /**  get only active product  */
            {
                $match: {
                    'checklistProduct.status': "1"
                }
            },

            {
                $lookup: {
                    from: 'location',
                    localField: 'checklistProduct.locationId',
                    foreignField: '_id',
                    as: 'locationData'
                }
            },
            {
                $unwind: '$locationData'
            },
            {
                $lookup: {
                    from: 'checkedChecklistProduct',
                    localField: '_id',
                    foreignField: 'checklistCombinationId',
                    as: 'checkedChecklistProduct'
                }
            },
            {
                $lookup: {
                    from: 'orderDetail',
                    localField: 'checklistProduct._id',
                    foreignField: 'productRangeId',
                    as: 'orderProduct'
                }
            },
            {
                $project: {
                    "checklistProduct": 1,
                    "locationData": 1,
                    "checkedChecklistProduct": {
                        $filter: {
                            "input": "$checkedChecklistProduct",
                            "as": "checkedChecklistProduct",
                            "cond": {
                                $and: [{
                                        $eq: ["$$checkedChecklistProduct.productId", "$checklistProduct._id"]
                                    },
                                    {
                                        $eq: ["$$checkedChecklistProduct.isChecked", true]
                                    }
                                ]
                            }
                        }
                    },
                    "orderProduct": {
                        $filter: {
                            "input": "$orderProduct",
                            "as": "orderProduct",
                            "cond": {
                                $and: [{
                                        $eq: ["$$orderProduct.statusIndex", "0"]
                                    },
                                    {
                                        $ne: ["$$orderProduct.statusIndex", "4"]
                                    },
                                    {
                                        $eq: ["$$orderProduct.checklistCombinationId", mongoose.Types.ObjectId(params.id)]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$checklistProduct._id",
                    locationData: {
                        "$push": "$locationData"
                    },
                    checklistProduct: {
                        "$first": "$checklistProduct"
                    },
                    orderProduct: {
                        "$first": "$orderProduct"
                    },
                    checkedChecklistProduct: {
                        "$first": "$checkedChecklistProduct"
                    },
                }
            },
            {
                $sort: {
                    "locationData.preferredIndex": 1,
                    "checklistProduct.locationPreferredIndex": 1
                }
            }
        ])
}

const productDetail = async (checklistProductsList, paramChecklistCombiantion) => {
    try {
        let productDetailsArray = [];
        let i = 0;
        for (let oneChecklistProducts of checklistProductsList) {
            await productRangeModel.findById(oneChecklistProducts.checklistProduct._id)
                .populate({
                    path: 'suppliersProduct.id',
                    model: comapnySupplierModel,
                    "select": "supplierId deliveryDaysStandard  placeOrderAhead placeOrderBeforeTime",
                    "populate": {
                        path: 'supplierId',
                        model: supplierModel,
                        "select": "name deliveryDaysAllowed logo"
                    }
                })
                .populate({
                    path: 'suppliersProduct.supplierProductId',
                    model: supplierProductsModel,
                    "select": "minOrder orderBy name packaging"
                })
                .populate({
                    path: 'locationId',
                    model: locationModel
                })
                .then((productData) => {
                    return orderDetailModel.find({
                            checklistCombinationId: paramChecklistCombiantion,
                            productRangeId: oneChecklistProducts.checklistProduct._id,
                            statusIndex: {
                                $in: [0, 1]
                            },
                            quantity: {
                                $ne: 0
                            }
                        }).populate({
                            path: 'checklistCombinationId',
                            model: checklistCollectionModel,
                            "select": "name"
                        })
                        .then((order) => {
                            return {
                                productData: productData,
                                order: order
                            }
                        })
                })
                .then(async (result) => {
                    return await orderDetailModel.find({
                            productRangeId: oneChecklistProducts.checklistProduct._id,
                            $nor: [{
                                checklistCombinationId: paramChecklistCombiantion
                            }],
                            statusIndex: {
                                $in: [0, 1]
                            },
                            quantity: {
                                $ne: 0
                            }
                        })
                        .populate({
                            path: 'checklistCombinationId',
                            model: checklistCollectionModel,
                            "select": "name"
                        })
                        .populate({
                            path: 'orderByUserId',
                            model: userModel,
                            "select": "firstName lastName"
                        })
                        .then((otherOrder) => {
                            return {
                                product: result.productData,
                                order: result.order,
                                otherOrder: otherOrder
                            }
                        })
                })
                .then(async (productList) => {
                    await checkedChecklistCombinationModel.find({
                            checklistCombinationId: paramChecklistCombiantion,
                            productId: oneChecklistProducts.checklistProduct._id
                        })
                        .populate({
                            path: 'checklistCombinationId',
                            model: checklistCollectionModel,
                            "select": "name"
                        })
                        .then((checkedChecklistCombination) => {
                            productDetailsArray.push({
                                product: productList.product,
                                order: productList.order,
                                otherOrder: productList.otherOrder,
                                checkedChecklistCombination: checkedChecklistCombination
                            });
                        })
                })
                .catch((err) => {})
            i++;
        }
        return productDetailsArray;
    } catch (err) {}
}



exports.remarkUpdateOrder = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await orderModel.findByIdAndUpdate(params.id, {
                remark: params.remark
            }, {
                new: true
            })
            .then(orderUpdate => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.updateData,
                    data: [],
                    error: []
                })
            }).catch((err) => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    error: err
                })
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