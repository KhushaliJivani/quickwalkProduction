import Joi from 'joi';
export default {
    add:{
        body:{
            params:{
                name:Joi.string().required(),  
                address:Joi.string().required(),
                type:Joi.string().required()
            }
        }
    },
    edit:{
        body:{
            params:{
                name:Joi.string().required(),  
                address:Joi.string().required(),
            }
        }
    },
    delete:{
        body:{
            params:{
                id:Joi.string().required()
            }
        }
    }
};