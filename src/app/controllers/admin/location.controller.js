import JWT from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../../models/admin.model';
import location from '../../models/location.model';
import locationModel from '../../models/location.model';
import productRangeItemsModel from '../../models/productRangeItems.model';
import config from '../../../config/config';
import Message from '../../../config/message';
import util from 'util';
import uploadFile from '../../../utils/uploadFile';
/**
 * location add by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.addLocation = async (req, res) => {
    try {
        const param = {
            'destination': 'location',
            'decodeImage': "",
            fieldName: 'image',
            imageOrignalName: ''
        }
        uploadFile.uploadFile(param, req, res).then((fileName) => {
            const params = req.body;
            const exe = req.headers.authorization.split(' ');
            const decode = JWT.verify(exe[1], config.JWTSecret);
            params.image = fileName;
            params.businessId = decode._id;
            let locationData = location(params);
            locationData.save()
                .then(locationdata => {
                    res.status(200).send({
                        code: 200,
                        Message: Message.infoMessage.saveLocation,
                        data: locationdata,
                        error: []
                    });
                })
        }).catch((err) => {
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

/**
 * location edit by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.editLocation = async (req, res) => {
    try {
        const param = {
            'destination': 'location',
            'decodeImage': "",
            fieldName: 'image',
            imageOrignalName: ''
        }
        uploadFile.uploadFile(param, req, res)
            .then(fileName => {
                const params = req.body;
                if(fileName != '' && fileName != null && fileName !== undefined) {
                    params.image = fileName
                }
                return location.findByIdAndUpdate(params.id, params, {
                    new: true
                })
            })

            .then(locationdata => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.updateData,
                    data: locationdata,
                    error: []
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

/**
 * location delete by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.deleteLocation = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        location.findById(params.id)
            .then(locationData => {
                if (locationData.status == "1") {
                    locationData.status = 0;
                    locationData.save();
                    deleteLocations(decode,locationData,res)
                } else {
                    res.status(409).send({
                        code: 409,
                        Message: Message.infoMessage.alreadyDelete,
                        data: result,
                        err: []
                    });
                }
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
async function deleteLocations(decode,locationData,res){
    await locationModel.aggregate([
        {
            "$match":{ "status":"1","_id":mongoose.Types.ObjectId(locationData._id)},
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
        }
    ]).then(async newLocationData => {
        /*deleted location code with check when any product with connected not allow delete */
        newLocationData[0].parent.forEach(parentData => {
            /* check when product has been not connected then and then location deleted */ 
            // productRangeItemsModel.find({locationId:parentData._id,"status" : "1"})
            // .then(productRangeData => {
            //     if(productRangeData.length == 0){
                    locationModel.findByIdAndUpdate(parentData._id,{status:0},{new:true})
                    .then(updateLocation => {}).catch()
            //     }
            // })
        })
        setTimeout(() => {
            res.status(200).send({
                code: 200,
                Message: Message.infoMessage.dataDelete,
                data: newLocationData,
                err: []
            });
        }, 1000)

    })
}
/**
 * location get by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.getLocation = async (req, res) => {
    try {
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        location.find({
            businessId: decode._id,
            status: "1",
            parentId: null
        })
            .sort({
                preferredIndex: 1
            })
            .then(locationData => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: locationData,
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

/**
 *single location get by business admin
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.detailsLocationGet = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        location.findById(params.id)
            .then(locationData => {
                res.status(200).send({
                    code: 200,
                    Message: Message.infoMessage.getDetails,
                    data: locationData,
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

exports.getSubLocation = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        await location.find({ parentId: params.id, status: "1", businessId: decode._id })
        // .sort({ $natural: 1 })
        .sort({
            preferredIndex: 1
        })
        .collation({locale: "en_US", numericOrdering: true})
            .then(result => {
                // result.sort((x,y) => {
                //     let temp1 = x.preferredIndex.split('-');
                //     let temp2 = y.preferredIndex.split('-');
                //     var xInt = temp1[temp1.length-1];
                //     var yInt = temp2[temp2.length-1]; 
                //     return xInt - yInt;
                // });
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
exports.locationHaveProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        productRangeItemsModel.find({locationId : params.id,
            status: {
                $ne: 0
            }})
        .sort({'locationPreferredIndex': '1'})
        .then((product) => {
            res.status(200).send({
                code: 200,
                Message: Message.infoMessage.locationProduct,
                data: product,
                err: []
            });
        }).catch((err) => {
            res.status(400).send({code: 400, message: Message.errorMessage.genericError, data: [], error: err});
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

exports.locationProductOrder = async (req,res) => {
    try{
        const { params } = req.body;
        await params.locationProduct.forEach(async product => {
            await productRangeItemsModel.findByIdAndUpdate(product._id,{locationPreferredIndex: product.locationPreferredIndex},{new:true})
            .then(productRange => {
            }).catch((err) => {
                res.status(400).send({code: 400, message: Message.errorMessage.genericError, data: [], error: err});
            });
        })
        res.status(200).send({code:200, message: Message.infoMessage.setProductOrder, data: [],error: []})
    }catch (err){
        res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [],error: err});
    }
}

exports.locationOrder = async (req,res) => {
    try{
        const { params } = req.body;
        for (const location of params.location) {
            let childLocation = await childLocationOrderUpdate(location, params,res);
            let parentLocation = await parentLocationOrderUpdate(location, params,res);
        }
        res.status(200).send({code:200, message: Message.infoMessage.setLocationOrder, data: [],error: []})
    }catch (err){
        res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [],error: err});
    }
}
const childLocationOrderUpdate = async (location,params,res) => {
    let changeLocationLevel = location.preferredIndex.split('-')
    await locationModel.aggregate([
        {
            "$match":{ "status":"1","_id":mongoose.Types.ObjectId(location._id)},
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
        }
    ])
    .then(childLocation => {
        for(const childLocationDetail of childLocation[0].parent) {
            let sepratedChildLocation = childLocationDetail.preferredIndex.split('-')
            sepratedChildLocation[params.locationLevel - 1] = changeLocationLevel[params.locationLevel-1];
            locationModel.findByIdAndUpdate(childLocationDetail._id,{preferredIndex: sepratedChildLocation.join('-')},{new:true})
            .then(locationResult => {}).catch((err) => {
                res.status(400).send({code: 400, message: Message.errorMessage.genericError, data: [], error: err});
            })
        }
    }).catch((err) => {
        res.status(400).send({code: 400, message: Message.errorMessage.genericError, data: [], error: err});
    })
}
const parentLocationOrderUpdate = async (location,params,res) => {
    return await locationModel.findByIdAndUpdate(location._id,{preferredIndex: location.preferredIndex},{new:true})
    .then(locationRange => {
    }).catch((err) => {
        res.status(400).send({code: 400, message: Message.errorMessage.genericError, data: [], error: err});
    });
}


exports.updateLocationArea = async (req,res) => {
    try{
        const { params } = req.body;
        locationModel.findByIdAndUpdate(params.id,{area: params.area},{new: true})
        .then(locationUpdate => {
            res.status(200).send({code:200, message: Message.infoMessage.updateData, data: locationUpdate,error: []});
        }).catch((err) => {
            res.status(400).send({code: 400, message: Message.errorMessage.genericError, data: [], error: err});
        })
    }catch (err){
        res.status(400).send({code:400, message: Message.errorMessage.genericError, data: [],error: err});
    }
}