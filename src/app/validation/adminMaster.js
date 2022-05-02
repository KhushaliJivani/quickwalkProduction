import Joi from 'joi';
export default {

    add: {
        body: {
            params: {
                email: Joi.string().email({ minDomainAtoms: 2 }).required(),
                name: Joi.string().required()
            }
        }
    },
};