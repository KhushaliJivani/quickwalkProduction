import {Strategy, ExtractJwt} from 'passport-jwt';
import Users from '../app/models/users.model';
import Admin from '../app/models/admin.model';
import config from './config';

module.exports = (passport) => {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.JWTSecret;
    passport.use(new Strategy(opts, (jwt_payload, done) => {
        Users.findOne({id: jwt_payload.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                Admin.findOne({id: jwt_payload.id}, (err, user) => {
                    if (err) {
                        return done(err, false);
                    }
                    if (user) {
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                })
            }
        })
    }));
}