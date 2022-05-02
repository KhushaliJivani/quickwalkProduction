import { Router } from 'express';
import passport from 'passport';
import validate from 'express-validation';

import authController from '../controllers/systemAdmin/auth.controller';
import profileController from '../controllers/admin/profile.controller';

import authValidator from '../validation/auth';



const router = Router();

/**
 * @api {post} /login login admin
 * @apiDescription Login admin
 * @apiVersion 1.0.0
 * @apiName login
 * @apiGroup Admin Authenticate
 * 
 * @apiParam  {String}  email     Admin Email
 * @apiParam  {String}  password  Admin Password
 *
 * @apiSuccess (Created 200) {String}  token  Token For Authenticate
 *
 * @apiError (Bad Request 400) ValidationError  Some parameters may contain invalid values
 */
router.post('/login', validate(authValidator.login), authController.login);

/**
 * @api {post} /signup register Admin
 * @apiDescription signup Admin
 * @apiVersion 1.0.0
 * @apiName signup
 * @apiGroup Admin Authenticate
 * 
 * @apiParam  {String}  email       Admin Email
 * @apiParam  {String}  username    Username
 * @apiParam  {String}  password    Admin Password
 * @apiParam  {String}  company     Admin Company
 * @apiParam  {String}  firstName   Admin firstName
 * @apiParam  {String}  lastName    Admin lastName
 *
 * @apiSuccess (Created 200) {String}  id       Admin's id
 * @apiSuccess (Created 200) {String}  email    Admin's email
 * @apiSuccess (Created 200) {String}  company  Admin's company
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/signup', validate(authValidator.signup), authController.singup);

/**
 * @api {post} /forgotPassword 
 * @apiDescription Forgot Password Admin
 * @apiVersion 1.0.0
 * @apiName forgotPassword
 * @apiGroup Admin Authenticate
 * 
 * @apiParam  {String}  email  Email
 *
 * @apiSuccess (200) {String}  message  email sent
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/forgotPassword', validate(authValidator.forgotPassword), authController.forgotPassword);

/**
 * @api {post} /resetPassword 
 * @apiDescription Reset Password Admin
 * @apiVersion 1.0.0
 * @apiName resetPassword
 * @apiGroup Admin Authenticate
 * 
 * @apiParam  {String}  token  Token from forgot password email link
 *
 * @apiSuccess (200) {String}  message  reset password 
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/resetPassword', validate(authValidator.resetPassword), authController.resetPassword);


/**
 * @api {post} updateProfile
 * @apiDescription Update Profile
 * @apiVersion 1.0.0
 * @apiName Update Profile
 * @apiGroup profile
 * 
 * @apiParam  {String}  email       Admin Email
 * @apiParam  {String}  username    Username
 * @apiParam  {String}  password    Admin Password
 * @apiParam  {String}  firstName   Admin firstName
 * @apiParam  {String}  lastName    Admin lastName
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     admin data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/updateProfile', passport.authenticate('jwt', { session: false}), validate(authValidator.signup), profileController.updateProfile);

/**
 * @api {post} changePassword
 * @apiDescription  Change admin password
 * @apiVersion 1.0.0
 * @apiName changePassword
 * @apiGroup Admin profile
 * 
 * @apiParam  {String}  password  New Password
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/changePassword', passport.authenticate('jwt', { session: false}), profileController.changePassword);


module.exports = router;