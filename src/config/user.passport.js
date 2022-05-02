import { Strategy, ExtractJwt } from 'passport-jwt';
import Users from '../app/models/users.model';
import Admin from '../app/models/admin.model';
import config from './config';

module.exports = (passport) => {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.JWTSecret;
    console.log("the user  passport called....");
    passport.use('User', new Strategy(opts, (jwt_payload, done) => {
        Users.findOne({ _id: jwt_payload._id, status: 1 }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                Admin.findById(user.businessId,(err,admin) => {
                    if(err){
                        return done(err, false);
                    }
                    if(admin.applicationStatus == "2" || admin.applicationStatus == "1"){
                        return done(null, user);
                    }
                    else{
                        return done(null, false);
                    }
                })
            } else {
                return done(null, false);
            }
        })
    }));
}