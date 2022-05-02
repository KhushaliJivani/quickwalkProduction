import { Router } from 'express';
import passport from 'passport';
import validate from 'express-validation';
import authValidator from '../validation/auth';

import authController from '../controllers/admin/auth.controller';
import profileController from '../controllers/admin/profile.controller';
import supplierController from '../controllers/admin/supplier.contoller';
import productController from '../controllers/admin/product.contoller';
import locationController from '../controllers/admin/location.controller';
import checklistController from '../controllers/admin/checklist.controller';
import supplierProductController from '../controllers/admin/supplierProduct.controller';
import userController from '../controllers/admin/user.contoller';
import userValidator from '../validation/user';
import supplierValidator from '../validation/supplier';
import productValidator from '../validation/product';
import Message from '../../config/message';
import languageController from '../controllers/admin/language.controller';
import reportController from '../controllers/admin/report.controller';
import storeController from '../controllers/admin/store.controller';

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
router.post('/updateProfile', passport.authenticate('Admin', { session: false }), validate(authValidator.signup), profileController.updateProfile);

/**
 * @api {post} verify
 * @apiDescription admin verify
 * @apiVersion 1.0.0
 * @apiName verify
 * @apiGroup Admin verify
 * 
 * @apiParam  {String}  token    User verification token
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/verify', validate(authValidator.verify), authController.verify);


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
router.post('/changePassword', passport.authenticate('Admin', { session: false }), profileController.changePassword);

/**
 * @api {POST} Add Supplier
 * @apiDescription  Add Supplier 
 * @apiVersion 1.0.0
 * @apiName add
 * @apiGroup supplier
 * 
 * @apiParam  {String}  email       Supplier Email
 * @apiParam  {String}  name        Supplier Name
 * @apiParam  {String}  address     Supplier Address
 * @apiParam  {String}  type        Supplier Type
 *
 *  @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}        Supplier data 
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/supplier/add', passport.authenticate('Admin', { session: false }), supplierController.add);

/**
 * @api {POST} Update Supplier
 * @apiDescription  Update Supplier
 * @apiVersion 1.0.0
 * @apiName edit
 * @apiGroup supplier
 * 
 * @apiParam  {String}  email       Admin Email
 * @apiParam  {String}  name        Supplier Name 
 * @apiParam  {String}  address     Supplier Address
 * @apiParam  {String}  type        Supplier Type
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     Supplier data 
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/supplier/edit', passport.authenticate('Admin', { session: false }), supplierController.edit);

/**
 * @api {GET} Supplier get
 * @apiDescription  Supplier Details get
 * @apiVersion 1.0.0
 * @apiName get
 * @apiGroup supplier
 * 
 * @apiParam  {String}  jwt token in headers
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     All Supplier data  
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/supplier/get', passport.authenticate('Admin', { session: false }), supplierController.get);

/**
 * @api {GET} Supplier Single get
 * @apiDescription  Supplier Single Details get
 * @apiVersion 1.0.0
 * @apiName singleGet
 * @apiGroup supplier
 * 
 * @apiParam  {String}  Supplier Id
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     Single Supplier data 
 *
 * 
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/supplier/detail', passport.authenticate('Admin', { session: false }), supplierController.detail);

/**
 * @api {POST} suplier delete
 * @apiDescription  suplier  delete
 * @apiVersion 1.0.0
 * @apiName delete
 * @apiGroup supplier
 * 
 * @apiParam  {String}  Supplier Id
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/supplier/delete', validate(supplierValidator.delete), passport.authenticate('Admin', { session: false }), supplierController.delete);

/**
 * @api {POST} suggestion of supliers
 * @apiDescription  suggestion of supliers
 * @apiVersion 1.0.0
 * @apiName suggestion
 * @apiGroup supplier
 * @apiSuccess (200) {String}      message
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/supplier/suggestion', passport.authenticate('Admin', { session: false }), supplierController.suggestion);

/**
 * @api {POST} Add Product
 * @apiDescription  Add Product 
 * @apiVersion 1.0.0
 * @apiName add
 * @apiGroup product
 * 
 * @apiParam  {String}  prductName       Product Name
 * @apiParam  {String}  standerStoke     Standard Stoke
 * @apiParam  {String}  miniOrder        Mini Order
 * @apiParam  {String}  image            Product Image
 *
 *  @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}        Product data 
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/product/add', validate(productValidator.add), passport.authenticate('Admin', { session: false }), productController.add);

/**
 * @api {POST} Update Product
 * @apiDescription  Update Product
 * @apiVersion 1.0.0
 * @apiName edit
 * @apiGroup product
 * 
 * @apiParam  {String}  prductName       Product Name
 * @apiParam  {String}  standerStoke     Standard Stoke
 * @apiParam  {String}  miniOrder        Mini Order
 * @apiParam  {String}  image            Product Image
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     Product data 
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/product/edit', validate(productValidator.edit), passport.authenticate('Admin', { session: false }), productController.edit);

/**
 * @api {GET} Product get
 * @apiDescription  Product Details get
 * @apiVersion 1.0.0
 * @apiName get
 * @apiGroup product
 * 
 * @apiParam  {String}  jwt token in headers
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     All Product data  
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/product/get', passport.authenticate('Admin', { session: false }), productController.get);

/**
 * @api {GET} Product Single get
 * @apiDescription  Product Single Details get
 * @apiVersion 1.0.0
 * @apiName detail
 * @apiGroup product
 * 
 * @apiParam  {String}  Product Id
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     Single Product data 
 *
 * 
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/product/detail', passport.authenticate('Admin', { session: false }), productController.detail);
/**
 * @api {POST} Product delete
 * @apiDescription  Product delete
 * @apiVersion 1.0.0
 * @apiName delete
 * @apiGroup product
 * 
 * @apiParam  {String}  Product Id
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/product/delete', validate(productValidator.delete), passport.authenticate('Admin', { session: false }), productController.delete);


/**
 * @api {POST} Admin Add location
 * @apiDescription  add location
 * @apiVersion 1.0.0
 * @apiName addLocation
 * @apiGroup location
 * 
 * @apiParam  {String}  businessID, name, image, locationColor, position
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/location/addLocation', passport.authenticate('Admin', { session: false }), locationController.addLocation);

/**
 * @api {POST} Admin edit location
 * @apiDescription  edit location
 * @apiVersion 1.0.0
 * @apiName editLocation
 * @apiGroup location
 * 
 * @apiParam  {String}  businessID, name, image, locationColor, position
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/location/editLocation', passport.authenticate('Admin', { session: false }), locationController.editLocation);

/**
 * @api {POST} Admin delete location
 * @apiDescription  delete location
 * @apiVersion 1.0.0
 * @apiName deleteLocation
 * @apiGroup location
 * 
 * @apiParam  {String}  location id
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/location/deleteLocation', passport.authenticate('Admin', { session: false }), locationController.deleteLocation);
router.post('/location/getSubLocation', passport.authenticate('Admin', { session: false }), locationController.getSubLocation);

/**
 * @api {POST} Admin get all location
 * @apiDescription  get all location
 * @apiVersion 1.0.0
 * @apiName getLocation
 * @apiGroup location
 * 
 * @apiParam  {String}  null
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/location/getLocation', passport.authenticate('Admin', { session: false }), locationController.getLocation);

/**
 * @api {POST} Admin get  location 
 * @apiDescription  get  location
 * @apiVersion 1.0.0
 * @apiName singleLocationGet
 * @apiGroup location
 * 
 * @apiParam  {String}  location id
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/location/detailsLocationGet', passport.authenticate('Admin', { session: false }), locationController.detailsLocationGet);


/**
 * @api {POST} Admin add  checklist 
 * @apiDescription  admin add the checklist of product
 * @apiVersion 1.0.0
 * @apiName addChecklist
 * @apiGroup checklist
 * 
 * @apiParam  {String}  name product businessID  status
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/checklist/addChecklist', passport.authenticate('Admin', { session: false }), checklistController.addChecklist);

/**
 * @api {POST} Admin edit checklist 
 * @apiDescription  admin edit the checklist of product
 * @apiVersion 1.0.0
 * @apiName editChecklist
 * @apiGroup checklist
 * 
 * @apiParam  {String}  name product businessID  status
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/checklist/editChecklist', passport.authenticate('Admin', { session: false }), checklistController.editChecklist);

/**
 * @api {POST} Admin delete checklist 
 * @apiDescription  admin delete the checklist of product
 * @apiVersion 1.0.0
 * @apiName deleteChecklist
 * @apiGroup checklist
 * 
 * @apiParam  {String}  id of checklist
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/checklist/deleteChecklist', passport.authenticate('Admin', { session: false }), checklistController.deleteChecklist);

/**
 * @api {POST} Admin get all checklist 
 * @apiDescription  admin get all  the checklist of product
 * @apiVersion 1.0.0
 * @apiName getChecklist
 * @apiGroup checklist
 * 
 * @apiParam  {String}  null
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/checklist/getChecklist', passport.authenticate('Admin', { session: false }), checklistController.getChecklist);

/**
 * @api {POST} Admin get details of  checklist 
 * @apiDescription  admin get all  the checklist of product
 * @apiVersion 1.0.0
 * @apiName detailsChecklistGet
 * @apiGroup checklist
 * 
 * @apiParam  {String}  id of checklist
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/checklist/detailsChecklistGet', passport.authenticate('Admin', { session: false }), checklistController.detailsChecklistGet);

/**
 * @api {POST} Add user 
 * @apiDescription  User add
 * @apiVersion 1.0.0
 * @apiName add
 * @apiGroup User
 * 
 * @apiParam  {String}  firstName
 * @apiParam  {String}  lastName
 * @apiParam  {String}  userName
 *
 *  @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}        User data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/user/add', passport.authenticate('Admin', { session: false }), validate(userValidator.update), userController.add);

/**
 * @api {post} verify
 * @apiDescription user verify
 * @apiVersion 1.0.0
 * @apiName verify
 * @apiGroup user verify
 * 
 * @apiParam  {String}  token    User verification token
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/user/verify', passport.authenticate('Admin', { session: false }), userController.verify);

/**
 * @api {POST} User get all data
 * @apiDescription  User get all data
 * @apiVersion 1.0.0
 * @apiName get
 * @apiGroup user 
 * 
 * @apiParam  {String}  null
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     Users data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/user/get', passport.authenticate('Admin', { session: false }), userController.get);

/**
 * @api {POST} User single data
 * @apiDescription  User single data
 * @apiVersion 1.0.0
 * @apiName detail
 * @apiGroup user 
 * 
 * @apiParam  {String}  id  User Id
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {array}     User data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/user/detail', passport.authenticate('Admin', { session: false }), userController.detail);

/**
 * @api {POST} User delete  
 * @apiDescription  Single User delete
 * @apiVersion 1.0.0
 * @apiName delete
 * @apiGroup user
 * 
 * @apiParam  {String}  id of User
 *
 * @apiSuccess (200) {String}    message
 * @apiSuccess (200) {String}    Deleted User data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/user/delete', passport.authenticate('Admin', { session: false }), userController.delete);

/**
 * @api {POST} Update user 
 * @apiDescription  UPdate user data
 * @apiVersion 1.0.0
 * @apiName edit
 * @apiGroup User
 * 
 * @apiParam  {String}  firstName
 * @apiParam  {String}  lastName
 * @apiParam  {String}  userName
 *
 *  @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}        Update User data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/user/edit', passport.authenticate('Admin', { session: false }), validate(userValidator.update), userController.edit);

/**
 * @api {GET} language data  get 
 * @apiDescription  language status is active data get
 * @apiVersion 1.0.0
 * @apiName get
 * @apiGroup language
 * 
 * @apiParam  null
 *
 * @apiSuccess (200) {String}    message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/getLanguage', passport.authenticate('Admin', { session: false }), languageController.get);
/**
 * @api {POST} Update user 
 * @apiDescription  UPdate user data
 * @apiVersion 1.0.0
 * @apiName edit
 * @apiGroup User
 * 
 * @apiParam  {String}  firstName
 * @apiParam  {String}  lastName
 * @apiParam  {String}  userName
 *
 *  @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}        Update User data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 * router.post('/supplier/productDetail', passport.authenticate('Admin', { session: false }), supplierController.productDetail);
 */


/**
 * @api {POST} Update user 
 * @apiDescription  UPdate user data
 * @apiVersion 1.0.0
 * @apiName edit
 * @apiGroup User
 * 
 * @apiParam  {String}  firstName
 * @apiParam  {String}  lastName
 * @apiParam  {String}  userName
 *
 *  @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}        Update User data
 *
* @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
router.post('/supplier/suggestedProduct', passport.authenticate('Admin', { session: false }), supplierController.suggestedProduct);
 */

/**
 * @api {POST} Delete Product 
 * @apiDescription  Delete Supplier Product
 * @apiVersion 1.0.0
 * @apiName deleteProduct
 * @apiGroup Suppplier
 * 
 * @apiParam  {String}  productId
 * @apiParam  {String}  supplierId
 *
 *  @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}        Supplier data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 *  router.post('/supplier/deleteProduct', passport.authenticate('Admin', { session: false }), supplierController.deleteProduct);
 */



/**
 * @api {POST} Update user
 * @apiDescription  UPdate user data
 * @apiVersion 1.0.0
 * @apiName assignSupplier
 * @apiGroup Suppplier
 *
 * @apiParam  {String}  firstName
 * @apiParam  {String}  lastName
 * @apiParam  {String}  userName
 *
 *  @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}        Update User data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 * router.post('/supplier/assignSupplier', passport.authenticate('Admin', { session: false }), supplierController.assignSupplier);
 */


/**
 * @api {POST} Supplier Product
 * @apiDescription  Get Particular Supplier Product Data
 * @apiVersion 1.0.0
 * @apiName supplierProduct
 * @apiGroup Suppplier
 *
 * @apiParam  {String}  supplierId
 *
 * @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}       Perticular Supplier Product data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
// router.post('/supplier/supplierProduct', passport.authenticate('Admin', { session: false }), productController.supplierProduct);

/**
 * @api {POST} Supplier Product
 * @apiDescription  Get Particular Supplier Product Data
 * @apiVersion 1.0.0
 * @apiName supplierProduct
 * @apiGroup Suppplier
 *
 * @apiParam  {String}  supplierId
 *
 * @apiSuccess (200) {String}      message
 * @apiSuccess (200) {array}       Perticular Supplier Product data
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/supplier/createProduct', passport.authenticate('Admin', { session: false }), supplierProductController.add);
router.post('/supplier/editProduct', passport.authenticate('Admin', { session: false }), supplierProductController.edit);
router.post('/supplier/deleteProduct', passport.authenticate('Admin', { session: false }), supplierProductController.delete);
router.get('/supplier/getProduct', passport.authenticate('Admin', { session: false }), supplierProductController.get);
router.post('/supplier/category', passport.authenticate('Admin', { session: false }), supplierProductController.category);
router.post('/supplier/detailProduct', passport.authenticate('Admin', { session: false }), supplierProductController.detail);
router.post('/supplier/productRange', passport.authenticate('Admin', { session: false }), supplierProductController.productRange);
router.post('/supplier/linkProduct', passport.authenticate('Admin', { session: false }), supplierProductController.linkProduct);
router.post('/supplier/delinkProduct', passport.authenticate('Admin', { session: false }), supplierProductController.delinkProduct);
router.post('/supplier/deleteCategory', passport.authenticate('Admin', { session: false }), supplierController.deleteCategory);
router.post('/product/supplierProduct', passport.authenticate('Admin', { session: false }), productController.linkedProductWithSupplierProduct);
router.post('/product/order', passport.authenticate('Admin', { session: false }), productController.order);
router.post('/product/calculation', passport.authenticate('Admin', { session: false }), productController.calculation);
router.post('/product/linkProducts', passport.authenticate('Admin', { session: false }), productController.linkProducts);
router.post('/product/delinkProducts', passport.authenticate('Admin', { session: false }), productController.delinkProducts);
router.post('/store/add', passport.authenticate('Admin', { session: false }), storeController.add);
router.get('/store/get', passport.authenticate('Admin', { session: false }), storeController.get);
router.post('/store/delete', passport.authenticate('Admin', { session: false }), storeController.delete);
router.post('/store/edit', passport.authenticate('Admin', { session: false }), storeController.edit);
router.get('/store/suggestion', passport.authenticate('Admin', { session: false }), storeController.suggestion);
router.post('/store/detail', passport.authenticate('Admin', { session: false }), storeController.detail);
router.get('/supplier/getSupplier', passport.authenticate('Admin', { session: false }), supplierProductController.getSupplier);
router.get('/product/locationDetails', passport.authenticate('Admin', { session: false }), productController.locationDetails);
router.get('/report/orderList', passport.authenticate('Admin', { session: false }), reportController.orderList);
router.post('/report/orderListProductWise', passport.authenticate('Admin', { session: false }), reportController.orderListProductWise);
router.post('/location/product', passport.authenticate('Admin', { session: false }), locationController.locationHaveProduct);
router.post('/location/locationProductOrder', passport.authenticate('Admin', { session: false }), locationController.locationProductOrder);
router.post('/location/locationOrder', passport.authenticate('Admin', { session: false }), locationController.locationOrder);
router.post('/location/updateLocationArea', passport.authenticate('Admin', { session: false }), locationController.updateLocationArea);

module.exports = router;