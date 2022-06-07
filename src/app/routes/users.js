import {
    Router
} from 'express';
import passport from 'passport';
import validate from 'express-validation';
import authController from '../controllers/users/auth.controller';
import profileController from '../controllers/users/profile.controller';
import quickOrderController from '../controllers/users/quickOrder.contoller';
import authValidator from '../validation/auth';
import userValidator from '../validation/user';
import checklistController from '../controllers/users/checklist.controller'
import productController from '../controllers/users/product.controller';
import orderController from '../controllers/users/order.controller';
import checkListDetailsController from '../controllers/users/checkListDetails.controller';
import shoppingListController from '../controllers/users/shoppinglist.controller';
import productCheckedController from '../controllers/users/productChecked.controller';
const router = Router();
/**
 * GET v1/status
 */
router.get('/status', passport.authenticate('User', {
    session: false
}), (req, res) => res.send('OK'));
/**
 * @api {post} /signup register user
 * @apiDescription signup user
 * @apiVersion 1.0.0
 * @apiName signup
 * @apiGroup Post
 * 
 * @apiParam  {String}  email     User Email
 * @apiParam  {String}  username  Username
 * @apiParam  {String}  password  User Password
 * @apiParam  {String}  company   User Company
 *
 * @apiSuccess (Created 200) {String}  id       User's id
 * @apiSuccess (Created 200) {String}  email    User's email
 * @apiSuccess (Created 200) {String}  company  User's company
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/signup', validate(authValidator.signup), authController.signup);

/**
 * @api {post} /login login user
 * @apiDescription Login user
 * @apiVersion 1.0.0
 * @apiName login
 * @apiGroup Post
 * 
 * @apiParam  {String}  email     User Email
 * @apiParam  {String}  password  User Password
 *
 * @apiSuccess (Created 200) {String}  token  Token For Authenticate
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/login', authController.login);

/**
 * @api {post} /forgotPassword 
 * @apiDescription Forgot Password user
 * @apiVersion 1.0.0
 * @apiName forgotPassword
 * @apiGroup Post
 * 
 * @apiParam  {String}  email     Email
 *
 * @apiSuccess (200) {String}  message  email sent
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/forgotPassword', authController.forgotPassword);

/**
 * @api {post} /resetPassword 
 * @apiDescription Reset Password user
 * @apiVersion 1.0.0
 * @apiName resetPassword
 * @apiGroup Post
 * 
 * @apiParam  {String}  token  Token from forgot password email link
 *
 * @apiSuccess (200) {String}  message  reset password 
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/resetPassword', validate(authValidator.resetPassword), authController.resetPassword);

/**
 * @api {post} /verify 
 * @apiDescription Verify Account
 * @apiVersion 1.0.0
 * @apiName verify
 * @apiGroup User Authenticate
 * 
 * @apiParam  {String}  token  Token from Active account email link
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/verify', validate(authValidator.verify), authController.verify);


/**
 * @api {post} /updateProfile
 * @apiDescription Update User profile
 * @apiVersion 1.0.0
 * @apiName updateProfile
 * @apiGroup Users Profile
 *
 * @apiSuccess (200) {String}  message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/updateProfile', passport.authenticate('User', { session: false }), validate(userValidator.update), profileController.updateProfile);
/**
 * @api {post} /changePassword
 * @apiDescription Update User password
 * @apiVersion 1.0.0
 * @apiName changePassword
 * @apiGroup Users Profile
 *
 * @apiParam  {String}  password     User password
 *
 * @apiSuccess (200) {String}  message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/changePassword', passport.authenticate('User', { session: false }), profileController.changePassword);
/**
 * @api {post} /getProfile
 * @apiDescription Get User profile
 * @apiVersion 1.0.0
 * @apiName getProfile
 * @apiGroup Users Profile
 *
 * @apiSuccess (200) {String}  message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/getProfile', passport.authenticate('User', { session: false }), profileController.get);

/**
 * @api {get} /getChecklist
 * @apiDescription Get all checklist
 * @apiVersion 1.0.0
 * @apiName getChecklist
 * @apiGroup Users checklist
 *
 * @apiSuccess (200) {String}  message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.get('/getChecklist', passport.authenticate('User', { session: false }), checklistController.getChecklist);


/**
 * @api {get} /checklistCollection
 * @apiDescription user checklist collection save
 * @apiVersion 1.0.0
 * @apiGroup Users checklistCollection
 * @apiName checklistCollection
 *
 * @apiSuccess (200) {String}  message
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 */
router.post('/checklistCombination', passport.authenticate('User', { session: false }), checklistController.checklistCombination);
router.post('/productDetails', passport.authenticate('User', { session: false }), quickOrderController.productDetails);
router.post('/supplierDetails', passport.authenticate('User', { session: false }), quickOrderController.supplierDetails);
router.post('/locationAndSubLocationProduct', passport.authenticate('User', { session: false }), quickOrderController.locationAndSubLocationProduct);
router.post('/locationProduct', passport.authenticate('User', { session: false }), productController.locationProduct);
router.get('/getChecklistCombination', passport.authenticate('User', { session: false }), checklistController.getChecklistCombination);
router.post('/getCombinationProducts', passport.authenticate('User', { session: false }), checklistController.checklistProductDetail);
router.post('/product/add', passport.authenticate('User', { session: false }), productController.add);
router.post('/checkList/productDetails', passport.authenticate('User', { session: false }), checkListDetailsController.productDetails);
router.post('/checkList/otherChecklistOrderProduct', passport.authenticate('User', { session: false }), checkListDetailsController.otherChecklistOrderProduct);
router.post('/order/create', passport.authenticate('User', { session: false }), orderController.createOrder);
router.get('/getSupplier', passport.authenticate('User', { session: false }), quickOrderController.getSupplier);
router.get('/getStore', passport.authenticate('User', { session: false }), quickOrderController.getStore);
router.get('/getLocation', passport.authenticate('User', { session: false }), quickOrderController.getLocation);
router.post('/getSubLocation', passport.authenticate('User', { session: false }), quickOrderController.getSubLocation);
router.post('/getSubLocationDetails', passport.authenticate('User', { session: false }), quickOrderController.getSubLocationDetails);
router.get('/getSupplierAndShop', passport.authenticate('User', { session: false }), quickOrderController.getSupplierAndShop);
router.post('/unCheckedProduct', passport.authenticate('User', { session: false }), productController.unCheckedProduct);
router.get('/pdfGeneratar', passport.authenticate('User', { session: false }), orderController.pdfGeneratar);
router.post('/checklist/orderSuppplierProduct', passport.authenticate('User', { session: false }), checklistController.orderSuppplierProduct);
router.post('/checklist/finalOrder', passport.authenticate('User', { session: false }), checklistController.finalOrder);
router.post('/checklist/asap', passport.authenticate('User', { session: false }), checklistController.asap);
router.post('/checklist/orderList', passport.authenticate('User', { session: false }), checklistController.orderList);
router.post('/order/orderListSend', passport.authenticate('User', { session: false }), checklistController.orderListSend);
router.post('/order/orderListReceived', passport.authenticate('User', { session: false }), checklistController.orderListReceived);
router.post('/checklist/orderListProductWise', passport.authenticate('User', { session: false }), checklistController.orderListProductWise);
router.post('/checklist/orderProductComment', passport.authenticate('User', { session: false }), checklistController.orderProductComment);
router.post('/supplierProduct', passport.authenticate('User', { session: false }), quickOrderController.supplierProduct);

router.post('/supplierMail', orderController.supplierMail);
router.post('/categoryProduct', passport.authenticate('User', { session: false }), orderController.categoryProduct);
router.post('/shoppingList', passport.authenticate('User', { session: false }), shoppingListController.shoppingList);
router.post('/shoppingListProductUpdate', passport.authenticate('User', { session: false }), shoppingListController.shoppingListProductUpdate);


router.post('/supplierProductToProductRangeItem',passport.authenticate('User', { session: false }), quickOrderController.supplierProductToProductRangeItem);
router.post('/checklist/getChecklistCombinationName', passport.authenticate('User', { session: false }), checklistController.getChecklistCombinationName);
router.post('/checklist/checklistCombinationPause', passport.authenticate('User', { session: false }), checklistController.checklistCombinationPause);
router.post('/checklist/resumeChecklistCombination', passport.authenticate('User', { session: false }), checklistController.resumeChecklistCombination);
router.post('/checkedChecklistProduct', passport.authenticate('User', { session: false }), productCheckedController.checkedChecklistProduct);
router.post('/checklist/submitOrder', passport.authenticate('User', { session: false }), checklistController.submitOrder);
router.post('/order/editOrder', passport.authenticate('User', { session: false }), checklistController.editOrder);
router.post('/quickShop/productList', passport.authenticate('User', { session: false }), quickOrderController.productList);
router.post('/order/allOrderProductListing', passport.authenticate('User', { session: false }), checklistController.allOrderProductListing);
router.post('/order/orderProduct', passport.authenticate('User', { session: false }), checklistController.orderProduct);
router.post('/checklistProductAndDetail', passport.authenticate('User', { session: false }), checklistController.checklistProductAndDetail);
router.post('/order/remarkUpdateOrder', passport.authenticate('User', { session: false }), checklistController.remarkUpdateOrder);
router.post('/order/sentOrder', passport.authenticate('User', { session: false }), orderController.sentOrder);
router.post('/order/deleteOrder', passport.authenticate('User', { session: false }), orderController.deleteOrder);
router.post('/flushShoppingList', passport.authenticate('User', { session: false }), shoppingListController.flushShoppingList);
router.post('/productPhoto', passport.authenticate('User', { session: false }), productController.productPhoto);
module.exports = router;