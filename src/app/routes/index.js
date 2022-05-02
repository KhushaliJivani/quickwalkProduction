import {
    Router
} from 'express';
import userRoutes from './users';
import adminRoutes from './admin';
import systemAdmin from './masterAdmin';
import swaggerJson from './../../public/doc/swagger.json';
import swaggerUiExpress from 'swagger-ui-express';
import scriptController from '../script/script';

const router = Router();

router.use('/api', userRoutes);
router.use('/admin', adminRoutes);
router.use('/master-admin', systemAdmin);
router.get('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerJson));
router.get('/script', scriptController.businessIdReplace);


module.exports = router;