import mongoose from 'mongoose';
import nodeCron from 'node-cron';
import moment from 'moment';
import momentTimeZone from 'moment-timezone';
import emailUtil from '../../utils/email';
import orderModel from '../models/order.model';
import companySuppliersModel from '../models/companySuppliers.model';
import supplierModel from '../models/supplier.model';
import orderDetailModel from '../models/orderDetail.model';
import ejs from 'ejs';
import checklistCombinationModel from '../models/checklistCombination.model';
import config from '../../config/config'
import AdminModel from '../models/admin.model';
import mailLanguagesModel from '../models/mailLanguages.model';

nodeCron.schedule('*/10 * * * * *', () => {
    try {
        orderModel.find({ "status": "0" })
            .populate(
                {
                    path: 'supplierId', model: companySuppliersModel,
                    populate: { path: 'supplierId', model: supplierModel, }
                }
            ).populate({path:'businessId',model:AdminModel})
            .then((order) => {
                const days = ['Monday', 'Tuesday', "Wednesday", 'Thursday', 'Friday', 'Saturday', 'Sunday']
                order.forEach((rowOrder) => {
                    if (rowOrder.supplierId !== undefined && rowOrder.supplierId.deliveryDaysStandard !== undefined && rowOrder.supplierId.deliveryDaysStandard !== undefined) {
                        const orderDate = moment(rowOrder.expectedDeliveryDate).subtract(rowOrder.supplierId.placeOrderAhead, "days").format("DD-MM-YYYY");
                        const currentDate = moment().format("DD-MM-YYYY");
                        const currentTime = moment().format("HH:mm");
                        // const currentDate = momentTimeZone.tz("Asia/Kathmandu").format("DD-MM-YYYY");
                        // const currentTime = momentTimeZone.tz("Asia/Kathmandu").format("HH:mm");
                        // console.log("currentDate : ",currentDate)
                        // console.log("currentTime : ",currentTime)
                        // console.log("orderDate : ",rowOrder)
                        // if (orderDate == currentDate && currentTime >= rowOrder.supplierId.placeOrderBeforeTime) {
                        //     orderModel.aggregate([
                        //         { $match: { _id: mongoose.Types.ObjectId(rowOrder._id) } },
                        //         { $lookup: { from: 'admin', localField: 'businessId', foreignField: '_id', as: 'adminDetail' } },
                        //         { $lookup: { from: 'orderDetail', localField: '_id', foreignField: 'orderId', as: 'orderDetail' } },
                        //         { $unwind: "$orderDetail" },
                        //         { $match: { "orderDetail.statusIndex": "0" } },
                        //         { $match: { "orderDetail.quantity":{"$ne":0} } },
                        //         { $match: { "orderDetail.statusIndex": { $ne: "4"}} },
                        //         { $lookup: { from: 'productRangeItems', localField: 'orderDetail.productRangeId', foreignField: '_id', as: 'productRangeItems' } },
                        //         { $unwind: "$productRangeItems" },
                        //         { $lookup: { from: 'supplierProducts', localField: 'orderDetail.supplierProductId', foreignField: '_id', as: 'supplierProduct' } },
                        //         { $unwind: "$supplierProduct" },
                        //         { $lookup: { from: 'suppliercategories', localField: 'supplierProduct.categoryId', foreignField: '_id', as: 'category' } },
                        //         { "$unwind": { "path": "$category", "preserveNullAndEmptyArrays": true } },
                        //         {
                        //             $group: {
                        //                 _id: {
                        //                     id: "$orderDetail.supplierProductId",
                        //                     name: "$supplierProduct.name",
                        //                     packaging: "$supplierProduct.packaging",
                        //                     categoryId: "$category._id",
                        //                     // productRangeItems: "$productRangeItems._id",
                        //                     // supplierId: "$supplierProduct.supplierId",
                        //                     // supplierProduct: "$productRangeItems.suppliersProduct",
                        //                     categoryName: "$category.name",
                        //                     // orderDetailId: "$orderDetail._id",
                        //                     // adminId:"$adminDetail",
                        //                     // data: {
                        //                     //     $filter: {
                        //                     //         input: '$productRangeItems.suppliersProduct',
                        //                     //         as: 'prodata',
                        //                     //         cond: { $eq: ['$$prodata.id', '$supplierProduct.supplierId'] }
                        //                     //     }
                        //                     // }
                        //                 },
                        //                 orderDetailId:{$push: "$orderDetail._id"},
                        //                 adminId:{$first:"$adminDetail"},
                        //                 data: {$first:{
                        //                         $filter: {
                        //                             input: '$productRangeItems.suppliersProduct',
                        //                             as: 'prodata',
                        //                             cond: { $eq: ['$$prodata.id', '$supplierProduct.supplierId'] }
                        //                         }
                        //                     }},
                        //                 items: { $sum: "$orderDetail.packaging" }
                        //             }
                        //         },
                        //         {
                        //             $group: {
                        //                 _id: null,
                        //                 _id: "$_id.categoryId",
                        //                 name: { $first: "$_id.categoryName" },
                        //                 adminData:{$first: "$adminId"},
                        //                 products: { 
                        //                     $push: {
                        //                         _id: "$_id.id",
                        //                         name: "$_id.name",
                        //                         packaging: "$_id.packaging",
                        //                         // productRangeItems: "$_id.productRangeItems",
                        //                         items: "$items",
                        //                         // supplierId: "$_id.supplierId",
                        //                         orderDetailId: "$orderDetailId",
                        //                         data: "$data"
                        //                     }
                        //                 },
                        //             }
                        //         }
                        //     ])
                        //         .then(async (orderProduct) => {
                        //             if(orderProduct.length > 0){
                        //                 let mailContent = await findMailLanguage(orderProduct[0].adminData[0].language,"order")
                        //                 await ejs.renderFile(config.mailUrl+"email/sendOrder.ejs", { orderProduct: orderProduct, supplierName: rowOrder.supplierId.supplierId.name, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort, businessAdmin: orderProduct[0].adminData[0].name}).then((content) => {
                        //                     const mailOptions = { to:rowOrder.supplierId.orderEmail, from : { email : orderProduct[0].adminData[0].email , name: orderProduct[0].adminData[0].name }, subject: "[Quick-Walk] New order", html: content };
                        //                     // const mailOptions = { envelope:{from:'verification@quick-walk.com',to:rowOrder.supplierId.orderEmail} ,from:'"'+orderProduct[0].adminData[0].name+'" '+orderProduct[0].adminData[0].email, subject: "[Quick-Walk] New order", html: content };
                        //                     emailUtil.email(mailOptions).then((info) => {
                        //                         orderProduct.forEach((category) => {
                        //                             category.products.forEach((product) => {
                        //                                 orderDetailModel.findByIdAndUpdate({$in:product.orderDetailId}, { "statusIndex": "1" },{new:true}).then((orderDetailUpdate) => {
                        //                                 }).catch((err) => {
                        //                                     console.log("errr",err)

                        //                                 });
                        //                             })
                        //                         })
                        //                         orderModel.findByIdAndUpdate(rowOrder._id, { "status": "1" })
                        //                             .then((orderUpdate) => {
                        //                             }).catch((err) => {

                        //                             })
                        //                     }).catch((err) => {
                        //                         console.log("errrrr",err)
                        //                     })
                        //                 })
                        //             }
                        //             else{
                        //                 orderProduct.forEach((category) => {
                        //                     category.products.forEach((product) => {
                        //                         orderDetailModel.findByIdAndUpdate(product.orderDetailId, { "statusIndex": "1" },{new:true}).then((orderDetailUpdate) => {
                        //                         }).catch((err) => {

                        //                         });
                        //                     })
                        //                 })
                        //                 orderModel.findByIdAndUpdate(rowOrder._id, { "status": "1" })
                        //                     .then((orderUpdate) => {
                        //                     }).catch((err) => {

                        //                     })
                        //             }
                        //         })
                        //         .catch((err) => {
                        //             // sentMailToClient(err);
                        //         });
                        // } else {
                        // }

                        /**NEW MAIL TEMPLATE CHANGES */
                        if (orderDate == currentDate && currentTime >= rowOrder.supplierId.placeOrderBeforeTime) {
                            orderModel.aggregate([
                                { $match: { _id: mongoose.Types.ObjectId(rowOrder._id) } },
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
                                        // console.log(orderProduct[0].products)
                                        let expectedDeliveryDate = moment(orderProduct[0].expectedDeliveryDate).format("DD-MM-YYYY");
                                        let mailContent = await findMailLanguage(orderProduct[0].adminData[0].language,"order")
                                        // await ejs.renderFile(config.mailUrl+"email/sendOrder.ejs", { remark: orderProduct[0].remark, expectedDeliveryDate: expectedDeliveryDate,orderProduct: orderProduct, supplierName: rowOrder.supplierId.supplierId.name, mailContent: mailContent.content, languageType:mailContent.languageType, logoUrl: config.logoUrl, envPort: config.envPort, businessAdmin: orderProduct[0].adminData[0].name}).then((content) => {
                                            const mailOptions = { envelope:{
                                                from:'verification@quick-walk.com',
                                                to:rowOrder.supplierId.orderEmail} ,
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
                                                            // console.log("errr",err)

                                                        });
                                                    })
                                                })
                                                await orderModel.findByIdAndUpdate(rowOrder._id, { "status": "1" },{new:true})
                                                    .then((orderUpdate) => {
                                                    }).catch((err) => {

                                                    })
                                            }).catch((err) => {
                                                // console.log("errrrr",err)
                                            })
                                        // })
                                    }
                                    else{
                                        orderProduct.forEach(async (category) => {
                                            category.products.forEach(async (product) => {
                                                await orderDetailModel.updateMany({_id:{$in:product.orderDetailId}}, { "statusIndex": "1" },{new:true}).then((orderDetailUpdate) => {
                                                }).catch((err) => {

                                                });
                                            })
                                        })
                                        await orderModel.findByIdAndUpdate(rowOrder._id, { "status": "1" },{new:true})
                                            .then((orderUpdate) => {
                                            }).catch((err) => {

                                            })
                                    }
                                })
                                .catch((err) => {
                                    // console.log("errrrrrrrrrrrrrrrrrrr",err)
                                    // sentMailToClient(err);
                                });
                        } else {
                        }
                    }
                })
            }).catch((err) => {
                // console.log("errrrrrrrrrrrrrrrrrrr",err)
                // sentMailToClient(err);
            });
    } catch (err) {

    }
})


nodeCron.schedule('*/10 * * * * *', () => {
    try {
        checklistCombinationModel.find({ "isDelete": 0 })
            .then(checklistCombination => {
                checklistCombination.forEach(checklistCombinationData => {
                    if (new Date() > new Date(moment(checklistCombinationData.createdAt).add(12, 'hours'))) {
                        checklistCombinationData.isDelete = 1;
                        checklistCombinationData.save();
                    }
                })
            })
            .catch(err => {
            })
    } catch (err) {
    }
});

/**Checklist expire base on timeZone */
// nodeCron.schedule('*/10 * * * * *', () => {
//     try {
//         checklistCombinationModel.find({ "isDelete": 0 })
//             .then(checklistCombination => {
//                 checklistCombination.forEach(checklistCombinationData => {
//                         AdminModel.findById(checklistCombinationData.businessId)
//                         .then(adminDetail => {
//                             if (momentTimeZone.tz(adminDetail.timeZone) > momentTimeZone.tz(checklistCombinationData.createdAt,adminDetail.timeZone).add(12, 'hours')) {
//                                 checklistCombinationData.isDelete = 1;
//                                 checklistCombinationData.save();
//                             }
//                         })
//                         .catch(err=>{})
//                 })
//             })
//             .catch(err => {
//             })
//     } catch (err) {
//     }
// });




// nodeCron.schedule('0 0 * * *',() => {
//     try{
//         const mailOptions = { to: "darshan.patel@viitor.cloud", subject: "[Quick-Walk] server was running", html: "Quickwalk server was running" };
//         emailUtil.email(mailOptions).then(sentMail => {
//         }).catch(err => {
//         })
//     } catch (err){
//         console.log("conrone errr",err)
//     }
// })

let sentMailToClient = async (error) => {
    const mailOptions = { to: "ram.solanki@viitor.cloud", subject: "[Quick-Walk] Error order", html: "some error generated which is timming of order sent" };
    emailUtil.email(mailOptions).then(sentMail => {
    }).catch(err => {
    })
}

let findMailLanguage = async (languageId,label) => {
    return mailLanguagesModel.findOne({languageId:languageId,label:label});
}