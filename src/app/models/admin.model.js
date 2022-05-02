import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import mongooseTimestamp from 'mongoose-timestamp';

const AdminSchema = mongoose.Schema({
    name: { type: String },
    language: { type: mongoose.Schema.Types.ObjectId, ref: 'language' },
    contactName: { type: String },
    contactNumber: { type: String },
    email: { type: String, required: true },
    customMail: { type: String},
    comment: { type: String },
    companyStatus: { type: String, enum: [0, 1, 2, 3] },
    applicationStatus: { type: String, enum: [0, 1, 2, 3] ,default:1},
    password: { type: String },
    powerPassword: { type: String },
    powerPasswordStatus: { type: String, enum: [0, 1], default:0},
    adminType: { type: String, enum: [0, 1] },
    isAdminActive: { type: String, enum: [0, 1] },
    resetPasswordToken: String,
    // timeZone: String,
    resetPasswordExpires: Date,
    emailVerificationToken: String,
    emailVerificationTokenExpire: Date,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
}, { collection: 'admin' });


AdminSchema.plugin(mongooseTimestamp);
AdminSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, (err, hash) => {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

AdminSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

const AdminModel = mongoose.model('admin', AdminSchema);

exports.savePowerPassword = function (powerPassword,cb) {
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

AdminModel.saveUser = (saveToUser) => {
    return saveToUser.save();
}

AdminModel.filter = (filterParam) => {
    return AdminModel.find(filterParam);
}
export default AdminModel;