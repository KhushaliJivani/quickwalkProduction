import { Strategy, ExtractJwt } from 'passport-jwt';
import Admin from '../app/models/admin.model';
import config from './config';
import Message from '../config/message';

module.exports = (passport, req, res) => {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.JWTSecret;
    console.log("the master  Admin passport called....");
    passport.use('masterAdmin', new Strategy(opts, (jwt_payload, done) => {
        Admin.findOne({ _id: jwt_payload._id }, (err, admin) => {
            if (err) {
                console.log('Error', err)
                console.log("err>>>>>>>>>>>>>>>>>>>>>>>>>>>", err);
                return done(err, false);
            }
            if (admin) {
                // console.log('admin', admin)
                if (admin.adminType === "0") {
                    done(null, admin);
                }
                else {
                    return done(null, false);
                }
            } else {
                console.log('Else Call original')
                return done(null, false);
            }
        })
    }));
}