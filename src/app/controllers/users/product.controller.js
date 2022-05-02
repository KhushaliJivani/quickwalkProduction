import JWT from 'jsonwebtoken';
import Message from '../../../config/message';
import config from '../../../config/config';
import uploadFile from '../../../utils/uploadFile';
import productRangeItemsModel from '../../models/productRangeItems.model';
import supplierProductsModel from '../../models/supplierProducts.model';
import orderDetailModel from '../../models/orderDetail.model';
import checklistModel from '../../models/checklist.model';

exports.add = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        let productId = [];
        let i = 0;
        var photo;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);

        const productRangeSave = productRangeItemsModel({
            userId: decode._id,
            name: params.name,
            businessId: decode.businessId,
            packaging: params.packaging,
            standardQuantity: params.standardQuantity,
            locationId: params.locationId,
            locationPreferredIndex: params.locationPreferredIndex,
            suppliersProduct: params.suppliersProduct
        });
        await productRangeSave.save()
            .then((productRange) => {
                return productRange
            })
            .then((productRange) => {
                if (Boolean(params.imageName)) {
                    const param = {
                        'destination': 'product',
                        'decodeImage': params.imageName,
                        fieldName: 'imageName',
                        imageOrignalName: params.image
                    };
                    return uploadFile.base64Upload(param).then((image) => {
                        photo = image;
                        productRange.image = photo;
                        productRange.save();
                        return productRange;
                    })
                }
                else if (!Boolean(params.imageName) && Boolean(params.image)) {
                    photo = params.image;
                    productRange.image = params.image;
                    productRange.save();
                    return productRange;
                }
                else {
                    return productRange;
                }
            })
            .then(async (productRangeData) => {
                for(const element of params.suppliersProduct){
                    if (i == params.suppliersProduct.length - 1) { }
                    if (element.isSoldInStore == "0") {
                        if (element.supplierProductId) {
                            supplierProductsModel.findByIdAndUpdate(element.supplierProductId,
                                {
                                    name: element.name,
                                    packaging: element.packaging,
                                    minOrder: element.minOrder,
                                    orderBy: element.orderBy,
                                }, { upsert: true, new: true })
                                .then()
                                .catch()
                        }
                        else {
                            const productSave = supplierProductsModel({
                                name: element.name,
                                businessId: decode.businessId,
                                packaging: element.packaging,
                                minOrder: element.minOrder,
                                orderBy: element.orderBy,
                                userId: decode._id,
                                image: photo,
                                supplierId: element.id
                            });
                            await productSave.save().then((result) => {
                                productId.push(result._id);
                            })
                        }
                    }
                    i++;
                }
                
                    let j = 0;
                    for(const element of productRangeData.suppliersProduct ){
                        if (element.isSoldInStore == "0") {
                            if(!element.supplierProductId){
                                element.supplierProductId = productId[j];
                                j++;
                            }
                        }
                    }
                    return await productRangeItemsModel.findByIdAndUpdate(productRangeData._id,{suppliersProduct:productRangeData.suppliersProduct},{new:true}).then((productRangeUpData) => {
                        return productRangeUpData
                    })
            })
            .then(async productRangeUpData => {
                if(params.locationProduct){
                    for(const product of params.locationProduct ){
                        await productRangeItemsModel.findByIdAndUpdate(product._id,{locationPreferredIndex: product.locationPreferredIndex},{new:true})
                        .then(productRange => {
                        }).catch((err) => {
                            res.status(400).send({code: 400, message: Message.errorMessage.genericError, data: [], error: err});
                        });
                    }
                }
                return productRangeUpData;
            })
            .then(async (productRange) => {
                if(params.checklist != undefined && params.checklist.length > 0){
                    for(let singleChecklist of params.checklist){
                        await checklistModel.findByIdAndUpdate(singleChecklist.checklistId,{$push:{product: productRange._id}},{new:true}).then(checklistUpdate => {
                        }).catch(err => {});
                    }
                    res.status(201).send({ code: 201, Message: Message.infoMessage.saveProduct, data: productRange, err: [] });
                }else{
                    res.status(201).send({ code: 201, Message: Message.infoMessage.saveProduct, data: productRange, err: [] });
                }
            }).catch((err) => {
                res.status(400).send({
                    code: 400,
                    Message: Message.errorMessage.genericError,
                    data: [],
                    err: err
                })
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

exports.locationProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        productRangeItemsModel.find({
            "locationId": params.id,
            "businessId": decode.businessId,
            "status": 1
        })
            .sort({
                locationPreferredIndex: 1
            })
            .sort({
                "name": 1
            })
            .then(locationProduct => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.getDetails,
                    data: locationProduct,
                    err: []
                });
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
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}
exports.unCheckedProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        orderDetailModel.findByIdAndRemove(params.id)
            .then((unCheckedProduct) => {
                res.status(200).send({
                    code: 200,
                    message: Message.infoMessage.unCheckedProduct,
                    data: unCheckedProduct,
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
    } catch (err) {
        res.status(400).send({
            code: 400,
            Message: Message.errorMessage.genericError,
            data: [],
            err: err
        });
    }
}
exports.productPhoto = async (req,res) => {
    try {
        const {
            params
        } = req.body;
        const param = {
            'destination': 'product',
            'decodeImage': params.photo,
            fieldName: 'imageName',
            imageOrignalName: params.imageName
        }
        uploadFile.base64Upload(param).then((image) => {
            productRangeItemsModel.findByIdAndUpdate(params.productId,{image: image},{new:true})
            .then(updatePhoto => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.updateData,
                    data: [],
                    err: []
                });
            })
            .catch(err => {
                res.status(400).send({
                    code: 400,
                    Message: Message.errorMessage.genericError,
                    data: [],
                    err: err
                });
            })
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