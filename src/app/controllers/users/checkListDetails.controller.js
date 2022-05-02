import Message from '../../../config/message';
import config from '../../../config/config';
import JWT from 'jsonwebtoken';
import checklistCombinationModel from '../../models/checklistCombination.model';
import checklistModel from '../../models/checklist.model';
import locationModel from '../../models/location.model';
import productRangeItemsModel from '../../models/productRangeItems.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import supplierModel from '../../models/supplier.model';
import supplierProductsModel from '../../models/supplierProducts.model';
import mongoose from 'mongoose';
import orderDetailModel from '../../models/orderDetail.model';
import checkedChecklistCombinationModel from '../../models/checkedChecklistProduct.model';
import UsersModel from '../../models/users.model';
exports.productDetails = async (req, res) => {
    try {
        const { params } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await productRangeItemsModel.findById(params.id)
        .populate({path:'suppliersProduct.id',model:companySuppliersModel,"select":"supplierId deliveryDaysStandard  placeOrderAhead placeOrderBeforeTime",
        "populate":{path:'supplierId',model:supplierModel,"select":"name deliveryDaysAllowed logo"}})
        .populate({path:'suppliersProduct.supplierProductId',model:supplierProductsModel,"select":"minOrder orderBy name packaging" })
        .populate({path:'locationId',model:locationModel})
        .then((productData) => {
            return orderDetailModel.find({ checklistCombinationId: params.checklistCombinationId, productRangeId: params.id, statusIndex: {$in:[0,1]}, quantity:{$ne:0} }).populate({path:'supplierId',model:companySuppliersModel,"select":"type"})
            .then((order) => {
                let tempData = [];
                let tempData2 = [];
                if(order.length > 0){
                    // if(order[0].supplierId.type != undefined){
                        tempData = order.filter(orderData => {return (String(orderData.statusIndex) ==  "0" && (orderData.supplierId != undefined && String(orderData.supplierId.type) ==  "1"))})
                        tempData2 = order.filter(orderData => {return (String(orderData.statusIndex) ==  "1" && (orderData.supplierId == undefined || String(orderData.supplierId.type) ==  "2" ))})
                        let temp3 = [...tempData,...tempData2]
                        if(temp3.length > 0){
                            return orderDetailModel.find({ _id:{ $in:temp3} }).populate({path:'checklistCombinationId',model:checklistCombinationModel,"select":"name"})
                            .then((order) => {
                                return { productData: productData, order: order }
                            })
                        }
                        else{
                            return { productData: productData, order: [] }
                        }
                    // }
                    // else{
                    //     let tempData3 = order.filter(orderData => {return (String(orderData.statusIndex) ==  "1")})
                    //     if(tempData2.length > 0){
                    //         return orderDetailModel.find({ _id:{ $in:tempData3} }).populate({path:'checklistCombinationId',model:checklistCombinationModel,"select":"name"})
                    //         .then((order) => {
                    //             return { productData: productData, order: order }
                    //         })
                    //     }
                    // }
                }
                else{
                    return { productData: productData, order: [] }
                }
            })


            // return orderDetailModel.find({ checklistCombinationId: params.checklistCombinationId, productRangeId: params.id, statusIndex: {$in:[0]}, quantity:{$ne:0} }).populate({path:'checklistCombinationId',model:checklistCombinationModel,"select":"name"})
            // .then((order) => {
            //     return { productData: productData, order: order }
            // })
        })
        .then((result) => {
            return orderDetailModel.find({ productRangeId: params.id, $nor:[{checklistCombinationId:params.checklistCombinationId}], statusIndex : {$in:[0,1]}, quantity:{$ne:0} })
                    .populate({path:'checklistCombinationId',model:checklistCombinationModel,"select":"name"})
                    .populate({path:'orderByUserId',model:UsersModel,"select":"firstName lastName"})
                    .then((otherOrder) => {
                        return { product: result.productData, order: result.order, otherOrder: otherOrder }
                    })
        })
        .then((productList) => {
            checkedChecklistCombinationModel.find({ checklistCombinationId: params.checklistCombinationId,productId: params.id })
            .populate({path:'checklistCombinationId',model:checklistCombinationModel,"select":"name"})
            .then((checkedChecklistCombination) => {
                res.status(200).send({
                    code:200,
                    Message:Message.infoMessage.getDetails,
                    data:{product: productList.product, order: productList.order, otherOrder: productList.otherOrder , checkedChecklistCombination: checkedChecklistCombination},
                    err:[]
                });
            })
        })
        .catch((err) => {
            res.status(400).send({
                code:400,
                Message:Message.errorMessage.genericError,
                data:[],
                err:err
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
function compare(a, b) {
    const genreA = a.preferredIndex;
    const genreB = b.preferredIndex;
    
    let comparison = 0;
    if (genreA > genreB) {
        comparison = 1;
    } else if (genreA < genreB) {
        comparison = -1;
    }
    return comparison;
}


exports.otherChecklistOrderProduct = async (req,res) => {
    try{
        const { params } = req.body;
        let query = {};
        if(params.id !== undefined){
            query.productRangeId = params.id;
        }
        if(params.checklistCombinationId !== undefined){
            query.$nor = [{checklistCombinationId:params.checklistCombinationId}]
        }
        if(params.expectedDeliveryDate !== undefined){
            query.expectedDeliveryDate = new Date(params.expectedDeliveryDate)
        }
        query.statusIndex = {$in:["0","1"]};
        query.quantity={$ne:0};
        await orderDetailModel.find( query )
        // await orderDetailModel.find({ productRangeId: params.id, $nor:[{checklistCombinationId:params.checklistCombinationId}], statusIndex : {$in:[0,1]}, expectedDeliveryDate: new Date(params.expectedDeliveryDate), quantity:{$ne:0} })
            .populate({path:'checklistCombinationId',model:checklistCombinationModel,"select":"name"})
            .populate({path:'orderByUserId',model:UsersModel,"select":"firstName lastName"})
            .then((otherOrder) => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: otherOrder,
                    err: []
                });
            })
            .catch((err) => {
                res.status(400).send({
                    code:400,
                    Message:Message.errorMessage.genericError,
                    data:[],
                    err:err
                });
            });
    }catch (err) {
        res.status(400).send({
            code: 400,
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}