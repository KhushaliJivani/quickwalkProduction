import JWT from 'jsonwebtoken';
import moment from 'moment';
import ejs from 'ejs';
import mongoose, {
    Aggregate
} from 'mongoose';
import config from '../../../config/config';
import Message from '../../../config/message';
import productCheckedModel from '../../models/checkedChecklistProduct.model'

exports.checkedChecklistProduct = async (req, res) => {
    try {
        const {
            params
        } = req.body;
        const exe = req.headers.authorization.split(' ');
        const decode = JWT.verify(exe[1], config.JWTSecret);
        productCheckedModel.findOne({
                checklistCombinationId: params.checklistCombinationId,
                productId: params.productId
            })
            .then(checkedProductData => {
                if (checkedProductData) {
                    productCheckedModel.findByIdAndUpdate(checkedProductData._id, {
                            isChecked: params.isChecked
                        }, {
                            new: true
                        })
                        .then((updateData) => {
                            res.status(200).send({
                                code: 200,
                                message: Message.infoMessage.checkUpdate,
                                data: updateData,
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
                } else {
                    params.checkedByUserId = decode._id;
                    const productCheckedData = productCheckedModel(params);
                    productCheckedData.save()
                        .then((saveCheck) => {
                            res.status(200).send({
                                code: 200,
                                message: Message.infoMessage.checkSave,
                                data: saveCheck,
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