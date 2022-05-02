import moment from 'moment';
import momentTimeZone from 'moment-timezone';
import orderModel from '../../models/order.model';
import orderDetailModel from '../../models/orderDetail.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import productRangeItemsModel from '../../models/productRangeItems.model';
import UserModel from '../../models/users.model';
import Message from '../../../config/message';
import JWT from 'jsonwebtoken';
import config from '../../../config/config';
import mongoose from 'mongoose';
import AdminModel from '../../models/admin.model';

exports.shoppingList = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        const date = moment(new Date()).subtract('days', 1);
        // let admin = await adminDetails(decode.businessId);
        await orderDetailModel.aggregate([
                {
                    "$match": {
                        'businessId': mongoose.Types.ObjectId(decode.businessId)
                    }
                },
                {
                    $match:{
                        'quantity':{"$ne":0}
                    }
                },
                { $match: { "statusIndex": { $ne: "4"}} },
                {
                    "$lookup": {
                        "from": 'order',
                        "localField": 'orderId',
                        "foreignField": '_id',
                        "as": 'orderData'
                    }
                },
                {
                    "$unwind": "$orderData"
                },
                {
                    "$lookup": {
                        "from": 'productRangeItems',
                        "localField": 'productRangeId',
                        "foreignField": '_id',
                        "as": 'productDetails'
                    }
                },
                {
                    "$lookup": {
                        "from": 'companysuppliers',
                        "localField": 'supplierId',
                        "foreignField": '_id',
                        "as": 'companySupplierDetails'
                    }
                },
                {
                    "$unwind": {
                        "path": "$companySupplierDetails",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        "from": 'suppliers',
                        "localField": 'companySupplierDetails.supplierId',
                        "foreignField": '_id',
                        "as": 'supplierDetails'
                    },

                },
                {
                    "$unwind": {
                        "path": "$supplierDetails",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$match": {
                        $or: [{
                                "supplierDetails.type": "2"
                            },
                            {
                                "supplierDetails": null
                            }
                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        sendShoppingList: {
                            $push: {
                                "$cond": [{
                                    "$eq": ["$orderData.status", "1"]
                                }, {
                                    "orderDetailsId": "$_id",
                                    "productName": "$productDetails.name",
                                    "orderDetailStatus": "$statusIndex",
                                    "orderStatus": "$orderData.status",
                                    "asap": "$asap",
                                    "packaging": "$productDetails.packaging",
                                    "orderBy": decode.firstName,
                                    "date": "$createdAt",
                                    "reason": "$orderComment",
                                    "stock": "$quantity",
                                    "shopName": "$supplierDetails.name",
                                    "openingDays":"$supplierDetails.openingDays",
                                    "image": {
                                        "$arrayElemAt": ["$productDetails.image", 0]
                                    },
                                    "orderComment": "$orderComment",
                                    "statusIndex": "$statusIndex",
                                    "ASAP": "$asap",
                                    "deliveryComment":"$deliveryComment",
                                    "expectedDeliveryDate": "$orderData.expectedDeliveryDate"
                                }, 0]
                            }
                        },
                        receivedShoppingList: {
                            $push: {
                                "$cond": [{
                                    "$eq": ["$orderData.status", "2"]
                                }, {
                                    "orderDetailsId": "$_id",
                                    "productName": "$productDetails.name",
                                    "orderDetailStatus": "$statusIndex",
                                    "orderStatus": "$orderData.status",
                                    "asap": "$asap",
                                    "packaging": "$productDetails.packaging",
                                    "orderBy": decode.firstName,
                                    "date": "$createdAt",
                                    "reason": "$orderComment",
                                    "isFlush": "$isFlush",
                                    "stock": "$quantity",
                                    "shopName": "$supplierDetails.name",
                                    "openingDays":"$supplierDetails.openingDays",
                                    // "image": "$productDetails.image",
                                    "image": {
                                        "$arrayElemAt": ["$productDetails.image", 0]
                                    },
                                    "orderComment": "$orderComment",
                                    "statusIndex": "$statusIndex",
                                    "ASAP": "$asap",
                                    "deliveryComment":"$deliveryComment",
                                    "expectedDeliveryDate": "$orderData.expectedDeliveryDate",
                                    "actualDeliveryDate":"$orderData.actualDeliveryDate"
                                }, 0]
                            }
                        }
                    }
                },
                {
                    "$project": {
                        "sendShoppingList": {
                            "$filter": {
                                "input": '$sendShoppingList',
                                "as": 'item',
                                "cond": {
                                    "$ne": ['$$item', 0]
                                }
                            }
                        },
                        "receivedShoppingList": {
                            "$filter": {
                                "input": '$receivedShoppingList',
                                "as": 'item',
                                "cond": {
                                    $and: [{
                                            "$ne": ['$$item', 0]
                                        },
                                        {
                                            $gt: ["$$item.actualDeliveryDate", new Date(date)]
                                            // $gt: ["$$item.actualDeliveryDate", momentTimeZone.tz(new Date(),admin.timeZone).subtract('days', 1);]
                                        }
                                    ]
                                }

                            }
                        }
                    }
                },
                { "$sort" : { "expectedDeliveryDate" : 1 }}
            ])
            .then(async shoppingList => {
                let tempReceivedShoppingList = [];
                if(shoppingList.length > 0 && shoppingList[0].receivedShoppingList.length > 0){
                    for(let receivedShoppingListSingle of shoppingList[0].receivedShoppingList){
                        if(receivedShoppingListSingle.isFlush === undefined && receivedShoppingListSingle.isFlush !== true) {
                            tempReceivedShoppingList.push(receivedShoppingListSingle);
                        }
                    }
                    shoppingList[0].receivedShoppingList = tempReceivedShoppingList;
                }
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: shoppingList,
                    err: []
                });
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

exports.adminDetails = async (adminId) => {
    return AdminModel.findById(adminId).exec();
}

exports.shoppingListProductUpdate = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        // let admin = await adminDetails(decode.businessId);
        orderDetailModel.findByIdAndUpdate(params.id, {
                // deliveryComment: params.orderComment,
                statusIndex: params.statusIndex,    
                actualDeliveryDate: new Date()
                // actualDeliveryDate: momentTimeZone.tz(new Date(),admin.timeZone)
            }, {
                upsert: true,
                new: true
            })
            .then(data => {
                orderModel.findByIdAndUpdate(data.orderId, {
                        deliveryDateTime: Date.now(),
                        // deliveryDateTime: momentTimeZone.tz(new Date(),admin.timeZone),
                        status: (params.statusIndex == '1') ? 1: 2,
                        actualDeliveryDate: new Date()
                        // actualDeliveryDate: momentTimeZone.tz(new Date(),admin.timeZone)
                    }, {
                        new: true
                    })
                    .then((updateOrder) => {
                        res.status(200).send({
                            code: 200,
                            Message: Message.infoMessage.getDetails,
                            data: data,
                            err: []
                        });
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


exports.flushShoppingList = async (req, res) => {
    try {
        const { params } = req.body;
        if(params.flushIds.length > 0){
            await orderDetailModel.updateMany({_id: {$in:params.flushIds}},{isFlush: true})
            .then(orderData => {
                res.status(200).send({ code: 200, message: Message.infoMessage.flushShoppingList, data: [], err: [] })
            }).catch(err => {
                res.status(400).send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    error: err
                });
            })
        }else{
            res.status(200).send({ code: 200, message: Message.infoMessage.flushShoppingList, data: [], error: [] });    
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