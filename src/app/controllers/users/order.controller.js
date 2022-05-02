import JWT from 'jsonwebtoken';
import ejs from 'ejs';
import pdf from 'html-pdf';
import fs from 'fs';
import mongoose from 'mongoose';
import moment from 'moment';
import emailUtil from '../../../utils/email';
import config from '../../../config/config';
import orderModel from '../../models/order.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import supplierModel from '../../models/supplier.model';
import orderDetailModel from '../../models/orderDetail.model';
import Message from '../../../config/message';
import momentTimeZone from 'moment-timezone';
import AdminModel from '../../models/admin.model';
import mailLanguagesModel from '../../models/mailLanguages.model';




exports.createOrder = async (req, res) => {
    try {
        const { params } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        if(params.expectedDeliveryDate){
            params.expectedDeliveryDate = new Date(params.expectedDeliveryDate);

        }
        await orderModel.find({ supplierId: params.supplierId, status:(!params.expectedDeliveryDate)?0:params.statusIndex, expectedDeliveryDate: params.expectedDeliveryDate})
        .then(async (order) => {
            if (order.length == 0 && params.supplierId && params.expectedDeliveryDate) {
                const orderForSave = orderModel({
                    businessId: decode.businessId,
                    expectedDeliveryDate: params.expectedDeliveryDate,
                    status: (params.statusIndex == "1")?1:0,
                    supplierId: params.supplierId,
                    asap: params.asap
                });
                return orderForSave.save();
            } 
            else if(!params.supplierId && !params.expectedDeliveryDate){
                if(params.checklistCombinationId){
                    return await orderDetailModel.findOne({checklistCombinationId: params.checklistCombinationId, productRangeId: params.productRangeId, statusIndex: 1})
                    .then(async orderDetailData => {
                        if(orderDetailData){
                            let data = {_id:orderDetailData.orderId}
                            return data;
                        }
                        else{
                            let createdNewOrder = await createNewOrder(decode,params);
                            return createdNewOrder;
                        }
                    })
                }else{
                    let createdNewOrder = await createNewOrder(decode,params);
                    return createdNewOrder;
                }
            }
            else {
                return order[0];
            }
        })
        .then((order) => {
            if( params.checklistCombinationId !== undefined){
                updateOrderDetails(order._id, params, decode, res);
            }
            else{
                createOrderDetails(order._id, params, decode, res);
            }
        })
        .catch((err) => {
            res.status(401).send({
                code: 401,
                message: Message.errorMessage.genericError,
                data: [],
                error: err
            });
        })
    } catch (err) {
        res.status(401).send({
            code: 401,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}
const createNewOrder = async (decode,params) => {
    return await orderModel({
        businessId: decode.businessId,
        expectedDeliveryDate: params.expectedDeliveryDate,
        status: (params.statusIndex == "1")?1:0,
        supplierId: params.supplierId,
        asap: params.asap
    }).save().then(orderData => {return orderData})
}

exports.supplierMail = async (req, res) => {
    try {
        orderModel.find({ "status": "0" })
            .populate(
                {
                    path: 'supplierId',
                    model: companySuppliersModel,
                    populate: {
                        path: 'supplierId',
                        model: supplierModel,
                    }
                }
            )
            .then((order) => {
                const days = ['Monday', 'Tuesday', "Wednesday", 'Thursday', 'Friday', 'Saturday', 'Sunday']
                order.forEach((rowOrder) => {
                    if (rowOrder.supplierId !== null && rowOrder.supplierId.deliveryDaysStandard !== undefined && rowOrder.supplierId.deliveryDaysStandard !== null) {
                        const orderDate = moment(rowOrder.expectedDeliveryDate).subtract(rowOrder.supplierId.placeOrderAhead, "days").format("DD-MM-YYYY");
                        const currentDate = moment().format("DD-MM-YYYY");
                        const currentTime = moment().format("HH:ss");
                        if (1 == 1) {
                            orderModel.aggregate([
                                { $match: { _id: mongoose.Types.ObjectId(rowOrder._id) } },
                                { $lookup: { from: 'orderDetail', localField: '_id', foreignField: 'orderId', as: 'orderDetail' } },
                                { $unwind: "$orderDetail" },
                                { $match: { "orderDetail.statusIndex": "1" } },
                                { $lookup: { from: 'productRangeItems', localField: 'orderDetail.productRangeId', foreignField: '_id', as: 'productRangeItems' } },
                                { $unwind: "$productRangeItems" },
                                { $lookup: { from: 'supplierProducts', localField: 'orderDetail.supplierProductId', foreignField: '_id', as: 'supplierProduct' } },
                                { $unwind: "$supplierProduct" },
                                { $lookup: { from: 'suppliercategories', localField: 'supplierProduct.categoryId', foreignField: '_id', as: 'category' } },
                                { "$unwind": { "path": "$category", "preserveNullAndEmptyArrays": true } },
                                {
                                    $group: {
                                        _id: {
                                            id: "$orderDetail.supplierProductId",
                                            name: "$supplierProduct.name",
                                            packaging: "$supplierProduct.packaging",
                                            categoryId: "$category._id",
                                            productRangeItems: "$productRangeItems._id",
                                            supplierId: "$supplierProduct.supplierId",
                                            supplierProduct: "$productRangeItems.suppliersProduct",
                                            categoryName: "$category.name",
                                            orderDetailId: "$orderDetail._id",
                                            data: {
                                                $filter: {
                                                    input: '$productRangeItems.suppliersProduct',
                                                    as: 'prodata',
                                                    cond: { $eq: ['$$prodata.id', '$supplierProduct.supplierId'] }
                                                }
                                            }
                                        },
                                        items: { $sum: "$orderDetail.quantity" }
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$_id.categoryId",
                                        name: { $first: "$_id.categoryName" },
                                        products: {
                                            $push: {
                                                _id: "$_id.id",
                                                name: "$_id.name",
                                                packaging: "$_id.packaging",
                                                productRangeItems: "$_id.productRangeItems",
                                                items: "$items",
                                                supplierId: "$_id.supplierId",
                                                orderDetailId: "$_id.orderDetailId",
                                                data: "$_id.data"
                                            }
                                        },
                                    }
                                }
                            ])
                                .then((orderProduct) => {
                                    ejs.renderFile("src/views/email/sendOrder.ejs", { orderProduct: orderProduct, supplierName:  rowOrder.supplierId.name}).then((content) => {
                                        const mailOptions = { to: rowOrder.orderEmail, subject: "[Quick-Walk] New order", html: content };
                                        emailUtil.email(mailOptions).then((info) => {
                                            orderProduct.forEach((category) => {
                                                category.products.forEach((product) => {
                                                    orderDetailModel.findByIdAndUpdate(product.orderDetailId, { "statusIndex": "2" }).then((orderDetailUpdate) => {
                                                    }).catch((err) => { });
                                                })
                                            })
                                            orderModel.findByIdAndUpdate(rowOrder._id, { "status": "1" })
                                                .then((orderUpdate) => { }).catch((err) => { })
                                        }).catch((err) => { })
                                    })
                                })
                                .catch((err) => { });
                        } else {
                        }
                    }
                })
            }).catch((err) => { });
    } catch (err) { }
}
exports.categoryProduct = async (req, res) => {
    try {
        await orderModel.find({ "status": 0 })
            .then((order) => {
                if (order.length > 0) {
                    const orderReturn = [];
                    order.forEach((rowOrder) => {
                        orderModel.aggregate([
                            { $match: { _id: mongoose.Types.ObjectId(rowOrder._id) } },
                            {
                                $lookup: {
                                    from: 'companysuppliers',
                                    localField: 'supplierId',
                                    foreignField: '_id',
                                    as: 'companySupplier'
                                }
                            }
                        ]).then((cumpanySupplier) => {
                            orderReturn.push(cumpanySupplier);
                            res.send(orderReturn);
                        })
                    });
                }
            }).catch((err) => {

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
exports.pdfGeneratar = async (req, res) => {
    try {
        let compiled = ejs.compile(fs.readFileSync('./src/public/template/testpdf.ejs', 'utf8'));
        const options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm'
        };
        const category = 'Hello World';
        const html = compiled({
            category: category
        });
        pdf.create(html, options).toFile('./src/public/template/testpdf.pdf', (err, result) => {
            if (err) {
                res.send({
                    code: 400,
                    message: Message.errorMessage.genericError,
                    data: [],
                    error: err
                });
            } else {
                res.send({
                    code: 200,
                    message: Message.infoMessage.pdfGenerated,
                    error: [],
                    data: {
                        filName: 'testpdf.pdf'
                    }
                });
            }
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
async function createOrderDetails(orderId, params, decode, res){
    params.businessId = decode.businessId;
    params.orderId = orderId;
    params.orderByUserId = decode._id;
    params.orderOnDateTime = Date.now();
    params.statusIndex = params.statusIndex;
    const orderDetailForSave = orderDetailModel(params);
    await orderDetailForSave.save().then((orderDetail) => {
        res.status(201).send({
            code: 201,
            message: Message.infoMessage.orderSave,
            data: orderDetail,
            error: []
        });
    });
}
// function updateOrderDetails(orderId, params, decode, res){
//     // orderDetailModel.findOne({ checklistCombinationId: params.checklistCombinationId, productRangeId: params.productRangeId, orderByUserId: decode._id })
//     orderDetailModel.findOne({ checklistCombinationId: params.checklistCombinationId, productRangeId: params.productRangeId,"statusIndex" : {$ne:4} })
//     .then(orderDetailsList => {
//         if(orderDetailsList){
//             // orderDetailModel.findByIdAndUpdate(orderDetailsList._id,{statusIndex:4})
//             orderDetailModel.findByIdAndUpdate(orderDetailsList._id,{statusIndex:4},{new:true})
//             .then(() => {
//                 createOrderDetails(orderId,params,decode,res);
//             })
//         }else{
//             createOrderDetails(orderId,params,decode,res);
//         }
//     })
// }


/**Mulitiple order create that's here created */
async function updateOrderDetails(orderId, params, decode, res){
    orderDetailModel.find({ checklistCombinationId: params.checklistCombinationId, productRangeId: params.productRangeId,statusIndex: {$in:[0,1]}, quantity:{$ne:0} })
    .populate({path:'supplierId',model:companySuppliersModel,"select":"type"})
    .then(async orderDetailsList => {
        if(orderDetailsList.length > 0){
            let supplier = [];
            let store = [];
            supplier = await orderDetailsList.filter(orderData => {return (String(orderData.statusIndex) ==  "0" && (orderData.supplierId != undefined && String(orderData.supplierId.type) ==  "1"))})
            store = await orderDetailsList.filter(orderData => {return (String(orderData.statusIndex) ==  "1" && (orderData.supplierId == undefined || String(orderData.supplierId.type) ==  "2" ))})
            if(supplier.length > 0){
                await orderDetailModel.findByIdAndUpdate(supplier[0]._id,{statusIndex:4},{new:true})
                .then(() => {
                    createOrderDetails(orderId,params,decode,res);
                })
            }
            else if(store.length > 0){
                await orderDetailModel.findByIdAndUpdate(store[0]._id,{statusIndex:4},{new:true})
                .then(() => {
                    createOrderDetails(orderId,params,decode,res);
                })
            }
            else{
                createOrderDetails(orderId,params,decode,res);
            }
        }else{
            createOrderDetails(orderId,params,decode,res);
        }
    })
}

exports.sentOrder = async (req,res) => {
    try {
        const { params } = req.body;


        orderModel.findById(params.orderId)
            .populate(
                {
                    path: 'supplierId', model: companySuppliersModel,
                    populate: { path: 'supplierId', model: supplierModel, }
                }
            ).populate({path:'businessId',model:AdminModel})
            .then(rowOrder => {
                orderModel.aggregate([
                    { $match: { _id: mongoose.Types.ObjectId(params.orderId) } },
                    { $lookup: { from: 'admin', localField: 'businessId', foreignField: '_id', as: 'adminDetail' } },
                    { $lookup: { from: 'orderDetail', localField: '_id', foreignField: 'orderId', as: 'orderDetail' } },
                    { $unwind: "$orderDetail" },
                    { $match: { "orderDetail.statusIndex": "0" } },
                    { $match: { "orderDetail.quantity":{"$ne":0} } },
                    { $match: { "orderDetail.statusIndex": { $ne: "4"}} },
                    { $lookup: { from: 'productRangeItems', localField: 'orderDetail.productRangeId', foreignField: '_id', as: 'productRangeItems' } },
                    { $unwind: "$productRangeItems" },
                    { $lookup: { from: 'supplierProducts', localField: 'orderDetail.supplierProductId', foreignField: '_id', as: 'supplierProduct' } },
                    { $unwind: "$supplierProduct" },
                    { $lookup: { from: 'suppliercategories', localField: 'supplierProduct.categoryId', foreignField: '_id', as: 'category' } },
                    { "$unwind": { "path": "$category", "preserveNullAndEmptyArrays": true } },
                    {
                        $group: {
                            _id: {
                                id: "$orderDetail.supplierProductId",
                                name: "$supplierProduct.name",
                                packaging: "$supplierProduct.packaging",
                                categoryId: "$category._id",
                                // productRangeItems: "$productRangeItems._id",
                                // supplierId: "$supplierProduct.supplierId",
                                // supplierProduct: "$productRangeItems.suppliersProduct",
                                categoryName: "$category.name",
                                // orderDetailId: "$orderDetail._id",
                                // adminId:"$adminDetail",
                                // data: {
                                //     $filter: {
                                //         input: '$productRangeItems.suppliersProduct',
                                //         as: 'prodata',
                                //         cond: { $eq: ['$$prodata.id', '$supplierProduct.supplierId'] }
                                //     }
                                // }
                            },
                            uniqueProductKeyNew: {$first:"$supplierProduct.uniqueProductKey"},
                            orderDetailId:{$push: "$orderDetail._id"},
                            adminId:{$first:"$adminDetail"},
                            expectedDeliveryDate:{$first:"$expectedDeliveryDate"},
                            remark:{$first:"$remark"},
                            data: {$first:{
                                    $filter: {
                                        input: '$productRangeItems.suppliersProduct',
                                        as: 'prodata',
                                        cond: { $eq: ['$$prodata.id', '$supplierProduct.supplierId'] }
                                    }
                                }},
                            items: { $sum: "$orderDetail.packaging" }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            _id: "$_id.categoryId",
                            name: { $first: "$_id.categoryName" },
                            adminData:{$first: "$adminId"},
                            expectedDeliveryDate:{$first:"$expectedDeliveryDate"},
                            remark:{$first:"$remark"},
                            products: { 
                                $push: {
                                    _id: "$_id.id",
                                    name: "$_id.name",
                                    uniqueProductKey: "$uniqueProductKeyNew",
                                    packaging: "$_id.packaging",
                                    // productRangeItems: "$_id.productRangeItems",
                                    items: "$items",
                                    // supplierId: "$_id.supplierId",
                                    orderDetailId: "$orderDetailId",
                                    data: "$data"
                                }
                            },
                        }
                    }
                ])
                    .then(async (orderProduct) => {
                        if(orderProduct.length > 0){
                            let expectedDeliveryDate = moment(orderProduct[0].expectedDeliveryDate).format("DD-MM-YYYY");
                            let mailContent = await findMailLanguage(orderProduct[0].adminData[0].language,"order")
                            // await ejs.renderFile(config.mailUrl+"email/sendOrder.ejs", { remark: orderProduct[0].remark, expectedDeliveryDate: expectedDeliveryDate,orderProduct: orderProduct, supplierName: rowOrder.supplierId.supplierId.name, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort, businessAdmin: orderProduct[0].adminData[0].name}).then((content) => {
                                // const mailOptions = { to:rowOrder.supplierId.orderEmail, from : { email : orderProduct[0].adminData[0].email , name: orderProduct[0].adminData[0].name }, subject: rowOrder.supplierId.supplierId.name+" has to Deliver the order to "+orderProduct[0].adminData[0].name+" on "+expectedDeliveryDate, html: content };
                                // const mailOptions = { envelope:{from:'verification@quick-walk.com',to:rowOrder.supplierId.orderEmail} ,from:'"'+orderProduct[0].adminData[0].name+'" '+orderProduct[0].adminData[0].email, subject: "[Quick-Walk] New order", html: content };
                                const mailOptions = { envelope:{from:'verification@quick-walk.com',to:rowOrder.supplierId.orderEmail} ,
                                from:'"'+orderProduct[0].adminData[0].name+'" '+orderProduct[0].adminData[0].email,
                                subject: orderProduct[0].adminData[0].name + " " + rowOrder.supplierId.supplierId.name + " " + mailContent.content.content13 + " " + expectedDeliveryDate,
                                template: 'sendOrder.ejs',
                                to:rowOrder.supplierId.orderEmail,
                                type: 'business',
                                id: orderProduct[0].adminData[0]._id,
                                data: { remark: orderProduct[0].remark, expectedDeliveryDate: expectedDeliveryDate,orderProduct: orderProduct, supplierName: rowOrder.supplierId.supplierId.name, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort, businessAdmin: orderProduct[0].adminData[0].name, supplierProductUniqueCode: rowOrder.supplierId.supplierId.productHaveUniqueCode }
                            };
                                emailUtil.email(mailOptions).then(async (info) => {
                                    orderProduct.forEach((category) => {
                                        category.products.forEach(async (product) => {
                                            await orderDetailModel.updateMany({_id:{$in:product.orderDetailId}}, { "statusIndex": "1" },{new:true}).then((orderDetailUpdate) => {
                                            }).catch((err) => {
        
                                                res.status(400).send({
                                                    code: 400,
                                                    message: Message.errorMessage.genericError,
                                                    data: [],
                                                    error: err
                                                });
        
                                            });
                                        })
                                    })
                                    await orderModel.findByIdAndUpdate(rowOrder._id, { "status": "1" },{new:true})
                                        .then((orderUpdate) => {
                                            res.status(200).send({
                                                code: 200,
                                                message: Message.infoMessage.updateOrder,
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
                            // })
                        }
                        else{
                            orderProduct.forEach(async (category) => {
                                category.products.forEach(async (product) => {
                                    await orderDetailModel.updateMany({_id:{$in:product.orderDetailId}}, { "statusIndex": "1" },{new:true}).then((orderDetailUpdate) => {
                                    }).catch((err) => {
                                        res.status(400).send({
                                            code: 400,
                                            message: Message.errorMessage.genericError,
                                            data: [],
                                            error: err
                                        });
                                    });
                                })
                            })
                            await orderModel.findByIdAndUpdate(rowOrder._id, { "status": "1" },{new:true})
                                .then((orderUpdate) => {
                                    res.status(200).send({
                                        code: 200,
                                        message: Message.infoMessage.updateOrder,
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
            })
            .catch((err) => {
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

let findMailLanguage = async (languageId,label) => {
    return mailLanguagesModel.findOne({languageId:languageId,label:label});
}

exports.deleteOrder = async (req,res) => {
    try {
        const { params } = req.body;
        const orderData = await orderModel.findByIdAndUpdate(params.orderId,{ status: "3" },{ new: true }).exec();
        const orderDetailData = await orderDetailModel.updateMany({ orderId: params.orderId },{ statusIndex: "4" },{ new: true }).exec();
        res.status(200).send({ code: 200, message: Message.infoMessage.deleteOrder, data: [], err: [] })
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}