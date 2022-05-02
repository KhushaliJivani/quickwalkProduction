import JWT from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../../config/config';
import Message from '../../../config/message';
import orderModel from '../../models/order.model';
// exports.orderList = async (req, res) => {
//     try {
//         const exe = req.headers.authorization.split(' ');
//         const decode = JWT.verify(exe[1], config.JWTSecret);
//         await orderModel.aggregate([{
//             $match: {
//                 "businessId": mongoose.Types.ObjectId(decode._id)
//             }
//         },
//         {
//             $match: {
//                 "status": "2"
//             }
//         },
//         {
//             "$lookup": {
//                 "from": "companysuppliers",
//                 "localField": "supplierId",
//                 "foreignField": "_id",
//                 "as": "companySupplier"
//             }
//         },
//         {
//             $unwind: "$companySupplier"
//         },
//         {
//             $match: {
//                 "companySupplier.type": "1"
//             }
//         },
//         {
//             "$lookup": {
//                 "from": "suppliers",
//                 "localField": "companySupplier.supplierId",
//                 "foreignField": "_id",
//                 "as": "supplier"
//             }
//         },
//         {
//             $unwind: "$supplier"
//         },
//         {
//             "$lookup": {
//                 "from": "orderDetail",
//                 "localField": "_id",
//                 "foreignField": "orderId",
//                 "as": "orderList"
//             }
//         },
//         {
//             $unwind: "$orderList"
//         },
//         {
//             $match:{
//                 'orderList.quantity':{$ne:0}
//             }
//         },
//         {
//             $match:{
//                 'orderList.statusIndex': { $ne: "4" }
//             }
//         },
//         {
//             $sort: {
//                 "createdAt": -1
//             }
//         },
//         // {
//         //     "$lookup": {
//         //         "from": "productRangeItems",
//         //         "localField": "orderList.productRangeId",
//         //         "foreignField": "_id",
//         //         "as": "productRage"
//         //     }
//         // },
//         // {
//         //     $unwind: "$productRage"
//         // },
//         {
//             $group: {
//                 _id: {
//                     id: "$supplier._id",
//                     supplierName: "$supplier.name",
//                     orderId: "$_id",
//                 },
//                 expectedDeliveryDate: {
//                     "$first": {
//                         $dateToString: {
//                             format: "%Y-%m-%d",
//                             date: "$expectedDeliveryDate"
//                         }
//                     }
//                 },
//                 actualDeliveryDate: {
//                     "$first": {
//                         $dateToString: {
//                             format: "%Y-%m-%d",
//                             date: "$actualDeliveryDate"
//                         }
//                     }
//                 },
//                 status: {
//                     "$first": '$status'
//                 },
//                 orderSupplier: {
//                     "$push": "$orderList"
//                 },
//                 placeOrderAhead: {
//                     "$first": "$companySupplier.placeOrderAhead"
//                 },
//                 placeOrderBeforeTime: {
//                     "$first": "$companySupplier.placeOrderBeforeTime"
//                 },
//                 count: {
//                     $sum: {
//                         $cond: [{
//                             $eq: ["$orderList.statusIndex", "3"]
//                         }, 1, null]
//                     }
//                 }
//             }
//         },
//         {
//             $group: {
//                 _id: {
//                     expectedDeliveryDate: "$expectedDeliveryDate",
//                     id: "$_id.id"
//                 },
//                 actualDeliveryDate: {
//                     "$first": "$actualDeliveryDate"
//                 },
//                 supplierName: {
//                     "$first": "$_id.supplierName"
//                 },
//                 supplierId: {
//                     "$first": "$_id.id"
//                 },
//                 orderId: {
//                     "$first": "$_id.orderId"
//                 },
//                 status: {
//                     "$first": '$status'
//                 },
//                 orderDetails: {
//                     "$first": "$orderSupplier"
//                 },
//                 placeOrderAhead: {
//                     "$first": "$placeOrderAhead"
//                 },
//                 placeOrderBeforeTime: {
//                     "$first": "$placeOrderBeforeTime"
//                 },
//                 numberOfOrder: {
//                     "$first": "$numberOfOrder"
//                 },
//                 numberOfOrder: {
//                     "$first": "$count"
//                 }
//             }
//         }
//         ])
//             .then(async (orderList) => {
//                 if(orderList.length > 0){
//                     for (let singleOrderList of orderList){
//                         let test = [];
//                         let test2 = [];
//                         for(let singleOrderDetails of singleOrderList.orderDetails){
//                             if(String(singleOrderDetails.statusIndex) == "3"){
//                                 test.push(String(singleOrderDetails.productRangeId));
//                             }
//                         }
//                         // test.forEach((el) => {
//                         //     if (!test2.includes(el)) test2.push(el);
//                         // });
//                         // for(let el of test){
//                         //     if (!test2.includes(el)) test2.push(el);
//                         // }
//                         test2 = Array.from(new Set(test));
//                         singleOrderList.numberOfOrder = test2.length;
//                         // test2 = await test.filter(function(a){
//                         //     return test.indexOf(String(a)) !== test.lastIndexOf(String(a))
//                         // });
//                     }
//                 }
//                 return orderList;
//             })
//             .then(orderList => {
//                 res.status(200).send({
//                     code: 200,
//                     message: Message.infoMessage.getDetails,
//                     data: orderList,
//                     err: []
//                 })
//             })
//             .catch((err) => {
//                 res.status(400).send({
//                     code: 400,
//                     Message: Message.errorMessage.genericError,
//                     data: [],
//                     err: err
//                 });
//             });

//     } catch (err) {
//         res.status(400).send({
//             code: 400,
//             Message: Message.errorMessage.genericError,
//             data: [],
//             err: err
//         });
//     }
// }
exports.orderList = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await orderModel.aggregate([{
            $match: {
                "businessId": mongoose.Types.ObjectId(decode._id)
            }
        },
        {
            $match: {
                "status": "2"
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
            $match:{
                'orderList.quantity':{$ne:0}
            }
        },
        {
            $match:{
                'orderList.statusIndex': { $ne: "4" }
            }
        },
        {
            $sort: {
                "createdAt": -1
            }
        },
        // {
        //     "$lookup": {
        //         "from": "productRangeItems",
        //         "localField": "orderList.productRangeId",
        //         "foreignField": "_id",
        //         "as": "productRage"
        //     }
        // },
        // {
        //     $unwind: "$productRage"
        // },
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
                actualDeliveryDate: {
                    "$first": {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$actualDeliveryDate"
                        }
                    }
                },
                status: {
                    "$first": '$status'
                },
                orderSupplier: {
                    "$push": "$orderList"
                },
                placeOrderAhead: {
                    "$first": "$companySupplier.placeOrderAhead"
                },
                placeOrderBeforeTime: {
                    "$first": "$companySupplier.placeOrderBeforeTime"
                },
                count: {
                    $sum: {
                        $cond: [{
                            $eq: ["$orderList.statusIndex", "3"]
                        }, 1, null]
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    expectedDeliveryDate: "$expectedDeliveryDate",
                    id: "$_id.orderId"
                },
                actualDeliveryDate: {
                    "$first": "$actualDeliveryDate"
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
                orderDetails: {
                    "$first": "$orderSupplier"
                },
                placeOrderAhead: {
                    "$first": "$placeOrderAhead"
                },
                placeOrderBeforeTime: {
                    "$first": "$placeOrderBeforeTime"
                },
                numberOfOrder: {
                    "$first": "$numberOfOrder"
                },
                numberOfOrder: {
                    "$first": "$count"
                }
            }
        }
        ])
            .then(async (orderList) => {
                if(orderList.length > 0){
                    for (let singleOrderList of orderList){
                        let test = [];
                        let test2 = [];
                        for(let singleOrderDetails of singleOrderList.orderDetails){
                            if(String(singleOrderDetails.statusIndex) == "3"){
                                test.push(String(singleOrderDetails.productRangeId));
                            }
                        }
                        // test.forEach((el) => {
                        //     if (!test2.includes(el)) test2.push(el);
                        // });
                        // for(let el of test){
                        //     if (!test2.includes(el)) test2.push(el);
                        // }
                        test2 = Array.from(new Set(test));
                        singleOrderList.numberOfOrder = test2.length;
                        // test2 = await test.filter(function(a){
                        //     return test.indexOf(String(a)) !== test.lastIndexOf(String(a))
                        // });
                    }
                }
                return orderList;
            })
            .then(orderList => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: orderList,
                    err: []
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

exports.orderListProductWise = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        await orderModel.aggregate([
            {
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
                $match:{
                    'orderDetailsData.quantity':{$ne:0}
                }
            },
            {
                $match:{
                    'orderDetailsData.statusIndex': { $ne: "4" }
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
            // {
            //     $group: {
            //         "_id": {
            //             "matchOrder": { $cond: [{ $eq: ["$orderDetailsData.statusIndex", "2"] }, '$orderDetailsData', 0] },
            //             "notMatchOrder": { $cond: [{ $eq: ["$orderDetailsData.statusIndex", "3"] }, '$orderDetailsData', 0] },
            //             "orderSupplierProduct": "$productRage"
            //         }
            //     }
            // },
            {
                $group: {
                    "_id": {
                        "id": "$productRage._id",
                    },
                    "orderSupplierProductTemp": { "$first": "$productRage" },
                    "orderDetailsTemp": { "$push": '$orderDetailsData' },
                    "orderStatus": { "$first": '$status' },
                    "quantity": {
                        $sum: "$orderDetailsData.quantity"
                    }
                }
            }
            
            // {
            //     $group: {
            //         "_id": {
            //             "matchOrder": { $cond: [{ $eq: ["$orderDetailsTemp.statusIndex", "2"] }, '$orderDetailsTemp', 0] },
            //             "notMatchOrder": { $cond: [{ $eq: ["$orderDetailsTemp.statusIndex", "3"] }, '$orderDetailsTemp', 0] },
            //             "orderSupplierProduct": "$orderSupplierProductTemp"
            //         }
            //     }
            // },
            // {
            //     $group: {
            //         "_id": null,
            //         "NewmatchOrder": {"$push":{$cond: [{ $eq: ["$_id.matchOrder", 0] },,{ "matchOrder": "$_id.matchOrder", "orderSupplierProduct": "$_id.orderSupplierProduct" } ]}},
            //         "NewnotMatchOrder": {"$push":{$cond: [{ $eq: ["$_id.notMatchOrder", 0] },,{ "notMatchOrder": "$_id.notMatchOrder", "orderSupplierProduct": "$_id.orderSupplierProduct" } ]}}
            //     }
            // }
        ]).then(async (supplierProduct) => {
            let NewmatchOrder = [];
            let NewnotMatchOrder = [];
            let test = [];
            if(supplierProduct.length > 0){
                for(let singleSupplierProduct of supplierProduct){
                    let length = singleSupplierProduct.orderDetailsTemp.length;
                    if(String(singleSupplierProduct.orderDetailsTemp[length-1].statusIndex) == "3"){
                        singleSupplierProduct.orderDetailsTemp[length-1].quantity = singleSupplierProduct.quantity;
                        NewnotMatchOrder.push({notMatchOrder: singleSupplierProduct.orderDetailsTemp[length-1],orderSupplierProduct: singleSupplierProduct.orderSupplierProductTemp})
                    }
                    if(String(singleSupplierProduct.orderDetailsTemp[length-1].statusIndex) == "2"){
                        singleSupplierProduct.orderDetailsTemp[length-1].quantity = singleSupplierProduct.quantity;
                        NewmatchOrder.push({matchOrder: singleSupplierProduct.orderDetailsTemp[length-1], orderSupplierProduct: singleSupplierProduct.orderSupplierProductTemp})
                    }
                }
            }
            test.push({NewmatchOrder:NewmatchOrder,NewnotMatchOrder:NewnotMatchOrder});
            // supplierProduct[0].NewmatchOrder = supplierProduct[0].NewmatchOrder.filter(matchData => {
            //     return matchData != null;
            // });
            // supplierProduct[0].NewnotMatchOrder = supplierProduct[0].NewnotMatchOrder.filter(matchData => {
            //     return matchData != null;
            // });
            // return supplierProduct;
            return test;
            
        })
        .then(test1 => {
            res.status(200).send({
                code: 200,
                message: Message.infoMessage.getDetails,
                data: test1,
                err: []
            })
        })
        .catch(err => {
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