import Joi from 'joi';
export default {
    add:{
        body:{
            params:{
                name:Joi.string().required(),
                image:Joi.string()
            }
        }
    },
    edit:{
        body:{
            params:{
                name:Joi.string().required(),
                image:Joi.string()
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