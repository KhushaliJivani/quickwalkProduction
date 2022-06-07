import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import swaggerUiExpress from 'swagger-ui-express';
import environment from '../environment';
import mongoose from './config/mongoose';
import error from './middlewares/error';
import routes from './app/routes/';
import path from 'path';
import https from 'https';
import fs from 'fs';
import swaggerJson from './public/doc/swagger.json';
import swaggerJsDoc from 'swagger-jsdoc';
import cron from './app/cronjob';
require('./config/user.passport')(passport);
require('./config/masterAdmin.passport')(passport);
require('./config/bussnisAdmin.passport')(passport);

// getting application environment
const env = process.env.NODE_ENV;

// getting application config based on environment
const envConfig = environment[env];

// setting port value
const PORT = envConfig.port || 3000;

/**
* Express instance
* @public
*/
const app = express();

const swaggerDefinition = {
  info: {
    title: 'QuickWalk Swagger API',
    version: '0.0.1',
    description: 'Quick Walk',
  },
  host: 'localhost:4000',
  basePath: '/',
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: "Authorization",
      scheme: 'bearer',
      in: 'header',
    }
  }
};
const options = {
  swaggerDefinition,
  apis: ['/app/routes/']
};
const swaggerSpec = swaggerJsDoc(options);
app.get('swagger.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
})
// app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));
// open mongoose connection
mongoose.connect(envConfig, env);

// request logging. dev: console | production: file
app.use(morgan(envConfig.logs));

// parse body params and attache them to req.body
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.multipart());
app.use(express.static(path.join(__dirname, '/public')));

// enable CORS - Cross Origin Resource Sharing
app.use(cors());
app.set('view engine', 'ejs');

// mount api routes
app.use('/', routes);
// if error is not an instanceOf APIError, convert it.
app.use(error.converter);
// app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerJson));
// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);
//
app.use(passport.initialize());
app.use(passport.session());
// listen to requests

// const privateKey = fs.readFileSync(
//     '/etc/letsencrypt/live/api.quick-walk.com/privkey.pem',
//     'utf8'
//   );
// const certificate = fs.readFileSync(
//     '/etc/letsencrypt/live/api.quick-walk.com/fullchain.pem',
//     'utf8'
// );
// var credentials = {key: privateKey, cert: certificate};
// https.createServer(credentials, app).listen(PORT);
// app.listen(PORT);
app.listen(PORT,"192.168.1.215");

module.exports = app;