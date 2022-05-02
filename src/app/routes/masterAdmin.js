import { Router } from 'express';
import passport from 'passport';
import validate from 'express-validation';
import masterAdminController from '../controllers/masterAdmin/admin.controller';
import authController from '../controllers/masterAdmin/auth.controller';
import profileController from '../controllers/masterAdmin/profile.controller';
import languageController from '../controllers/masterAdmin/language.controller';
import authValidator from '../validation/auth';
import adminValidator from '../validation/adminMaster';
import importController from '../controllers/masterAdmin/import.controller';




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
router.post('/updateProfile', passport.authenticate('masterAdmin', { session: false }), profileController.updateProfile);

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
// router.post('/changePassword', passport.authenticate('masterAdmin', { session: false }), profileController.changePassword);

/**
 * @api {GET} language data  get 
 * @apiDescription  language status is active data get
 * @apiVersion 1.0.0
 * @apiName get
 * @apiGroup master language
 * 
 * @apiParam  null
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/getLanguage', passport.authenticate('masterAdmin', { session: false }),languageController.get);

/**
 * @api {GET} Admin get
 * @apiDescription  Admin Details get
 * @apiVersion 1.0.0
 * @apiName adminGet
 * @apiGroup Admin profile
 * 
 * @apiParam  {String}  jwt token in headers
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/admin/adminGet', passport.authenticate('masterAdmin', { session: false }), masterAdminController.adminGet);

/**
 * @api {POST} Admin delete
 * @apiDescription  Admin delete
 * @apiVersion 1.0.0
 * @apiName adminDelete
 * @apiGroup Admin profile
 * 
 * @apiParam  {String}  jwt token in headers
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/admin/adminDelete', passport.authenticate('masterAdmin', { session: false }), masterAdminController.adminDelete);

/**
 * @api {POST} signup register MasterAdmin
 * @apiDescription  Signup Master Admin 
 * @apiVersion 1.0.0
 * @apiName add
 * @apiGroup master language
 * 
 * @apiParam  {String}  email       Admin Email
 * @apiParam  {String}  firstName   Admin firstName
 * @apiParam  {String}  lastName    Admin lastName
 *
 * @apiSuccess (200) {String}  message  email sent
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/admin/add', validate(adminValidator.add), passport.authenticate('masterAdmin', { session: false }), masterAdminController.add);

/**
 * @api {POST} Update MasterAdmin
 * @apiDescription  Update Master Admin 
 * @apiVersion 1.0.0
 * @apiName edit
 * @apiGroup master language
 * 
 * @apiParam  {String}  email       Admin Email
 * @apiParam  {String}  firstName   Admin firstName
 * @apiParam  {String}  lastName    Admin lastName
 * @apiParam  {String}  language    Admin language
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     Admin data 
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/admin/edit', passport.authenticate('masterAdmin', { session: false }), masterAdminController.edit);

/**
 * @api {POST} Update MasterAdmin
 * @apiDescription  Update Master Admin 
 * @apiVersion 1.0.0
 * @apiName edit
 * @apiGroup master language
 * 
 * @apiParam  {String}  email       Admin Email
 * @apiParam  {String}  firstName   Admin firstName
 * @apiParam  {String}  lastName    Admin lastName
 * @apiParam  {String}  language    Admin language
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     Admin data 
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/admin/detail', passport.authenticate('masterAdmin', { session: false }), masterAdminController.detail);
router.post('/importExcel', passport.authenticate('masterAdmin', { session: false }), importController.importExcel);
router.post('/powerPassword', passport.authenticate('masterAdmin', { session: false }), profileController.powerPassword);
router.get('/getProfile', passport.authenticate('masterAdmin', { session: false }), profileController.getProfile);
router.post('/saveCutomMail', passport.authenticate('masterAdmin', { session: false }), profileController.saveCutomMail);
module.exports = router;