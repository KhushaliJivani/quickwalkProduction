import mongoose from 'mongoose';
import nodeCron from 'node-cron';
import moment from 'moment';
import emailUtil from '../../../utils/email';
import orderModel from '../../models/order.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import supplierModel from '../../models/supplier.model';
import orderDetailModel from '../../models/orderDetail.model';
import ejs from 'ejs';
import checklistCombinationModel from '../../models/checklistCombination.model';
import config from '../../../config/config'

exports.croneJOb = async (req, res) => {

    try {
        // console.log('*************************************** Send mail to supplier cronjob ***************************************')
        orderModel.find({ "status": "0" })
            .populate(
                {
                    path: 'supplierId', model: companySuppliersModel,
                    populate: { path: 'supplierId', model: supplierModel, }
                }
            )
            .then((order) => {
                const days = ['Monday', 'Tuesday', "Wednesday", 'Thursday', 'Friday', 'Saturday', 'Sunday']
                order.forEach((rowOrder) => {
                    // console.log("order//////////",rowOrder)
                    if (rowOrder.supplierId !== undefined && rowOrder.supplierId.deliveryDaysStandard !== undefined && rowOrder.supplierId.deliveryDaysStandard !== undefined) {
                        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaafter roworderId : ",rowOrder)
                        const orderDate = moment(rowOrder.expectedDeliveryDate).subtract(rowOrder.supplierId.placeOrderAhead, "days").format("DD-MM-YYYY");
                        const currentDate = moment().format("DD-MM-YYYY");
                        const currentTime = moment().format("HH:ss");
                        console.log("oooooooooooooooooooooooooooooooooooooooooooooooorderDate : ",orderDate)
                        // console.log('currentTime .........', currentTime)
                        // console.log('rowOrder.supplierId.placeOrderBeforeTime .........', rowOrder.supplierId.placeOrderBeforeTime)
                        if (orderDate == currentDate && currentTime >= rowOrder.supplierId.placeOrderBeforeTime) {
                            // if(1 == 1) {
                            console.log("Enter..............................",rowOrder)
                            orderModel.aggregate([
                                { $match: { _id: mongoose.Types.ObjectId(rowOrder._id) } },
                                { $lookup: { from: 'orderDetail', localField: '_id', foreignField: 'orderId', as: 'orderDetail' } },
                                { $unwind: "$orderDetail" },
                                { $match: { "orderDetail.statusIndex": "0" } },
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
                                    console.log("orderProduct : ",orderProduct);
                                    ejs.renderFile(config.mailUrl+"email/sendOrder.ejs", { orderProduct: orderProduct, supplierName: rowOrder.supplierId.supplierId.name }).then((content) => {
                                        console.log("supplier mail id: ",rowOrder.supplierId)
                                        const mailOptions = { to: rowOrder.supplierId.orderEmail, subject: "[Quick-Walk] New order", html: content };
                                        emailUtil.email(mailOptions).then((info) => {
                                            console.log("--------------------------------------------------------------  Mail Send Succssfully   -----------------------------------------------------------------------");
                                            orderProduct.forEach((category) => {
                                                category.products.forEach((product) => {
                                                    orderDetailModel.findByIdAndUpdate(product.orderDetailId, { "statusIndex": "1" }).then((orderDetailUpdate) => {
                                                    }).catch((err) => {
                                                        console.log("err",err)

                                                    });
                                                })
                                            })
                                            orderModel.findByIdAndUpdate(rowOrder._id, { "status": "1" })
                                                .then((orderUpdate) => {
                                                }).catch((err) => {
                                                    console.log("err",err)

                                                })
                                        }).catch((err) => {
                                            console.log("errrr",err)

                                        })
                                    })
                                })
                                .catch((err) => {
                                    console.log("err",err)
                                });
                        } else {
                            // res.send(rowOrder);
                        }
                        // rowOrder.supplierId.deliveryDaysStandard.forEach((deliveryDaysStandard) => {
                        // })
                    }
                })
            }).catch((err) => {
                console.log("err",err)

            });
    } catch (err) {
        console.log("err",err)

    }
}
