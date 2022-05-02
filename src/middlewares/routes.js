// import JWT from 'jsonwebtoken';
// import config from '../config/config';

// const getTokenFromHeaders = req => {
//     const {
//       headers: { authorization }
//     } = req;
  
//     if (authorization && authorization.split(' ')[0] === 'Token') {
//       return authorization.split(' ')[1];
//     }
//     return null;
//   };
  
//   const auth = {
//     required: JWT({
//       secret: config.JWTSecret,
//       userProperty: 'payload',
//       getToken: getTokenFromHeaders
//     }),
//     optional: JWT({
//       secret: config.JWTSecret,
//       userProperty: 'payload',
//       getToken: getTokenFromHeaders,
//       credentialsRequired: false
//     })
//   };
  
//   module.exports = auth;