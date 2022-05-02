import Joi from 'joi';
export default {
    // POST /create
    update: {
        body: {
            params: {
                userName:Joi.string().email({ minDomainAtoms: 2 }).required(),
                firstName: Joi.string().required(),
                lastName: Joi.string().required()
            }
        }
    },
};