import Joi from 'joi';
export default {

  // POST /signup
  signup: {
    body: {
      params: {
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        name: Joi.string().required()
      }
    }
  },
  login: {
    body: {
      params: {
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().required()
      }
    }
  },
  forgotPassword: {
    body: {
      params: {
        email: Joi.string().email({ minDomainAtoms: 2 }).required()
      }
    }
  },
  resetPassword: {
    body: {
      params: {
        password: Joi.string().required(),
        token: Joi.string().required()
      }
    }
  },
  verify: {
    body: {
      params: {
        token: Joi.string().required(),
        password: Joi.string().required()
      }
    }
  },
  create: {
    body: {
      params: {
        email: Joi.string().required(),
        name: Joi.string().required()
      }
    }
  },
  deleteUser: {
    body: {
      params: {
        id: Joi.string().required()
      }
    }
  },
  add: {
    body: {
      params: {
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        name: Joi.string().required()
      }
    }
  }
};