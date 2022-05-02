import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import mongooseTimestamp from 'mongoose-timestamp';


const SystemSettingSchema = mongoose.Schema({
    powerPassword: {
        type: String
    },
    masterEmail: {
        type: String
    },
    powerPasswordStatus: { type: String, enum: [0, 1], default:0},
}, {
        collection: 'system_settings'
    });


SystemSettingSchema.plugin(mongooseTimestamp);



exports.savePowerPassword = function (powerPassword,cb) {
    console.log('Enterrrrrrrrrrrrrrrr')
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(powerPassword, salt, null, (err, hash) => {
            if (err) {
                return cb(err);
            }
            console.log("hash : ",hash)
            cb(null,hash);
        });
    });
}


exports.comparePowerPassword = function (passw1,passw2, cb) {
    bcrypt.compare(passw1, passw2, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
const SystemSettingModel = mongoose.model('system_settings', SystemSettingSchema);

export default SystemSettingModel;