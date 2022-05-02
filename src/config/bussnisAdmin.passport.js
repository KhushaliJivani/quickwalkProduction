import { Strategy, ExtractJwt } from 'passport-jwt';
import Admin from '../app/models/admin.model';
import config from './config';
import Message from '../config/message';

module.exports = (passport) => {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.JWTSecret;
    console.log("the Admin passport called....");
    passport.use('Admin', new Strategy(opts, (jwt_payload, done) => {
        Admin.findOne({ _id: jwt_payload._id, applicationStatus: {$in:[1, 2]}}, (err, admin) => {
            if (err) {
                return done(err, false);
            }
            if (admin) {
                if (admin.adminType == 1) {
                    done(null, admin);
                }
                else {
                    return done(null, false);
                }
            } else {
                return done(null, false);
            }
        })
    }));
}