import JWT from 'jsonwebtoken';
import mongoose from 'mongoose';

import Message from '../../../config/message';


exports.excelToJson = async (req,res) => {
    try{

    }catch(err){
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
}