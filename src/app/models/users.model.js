import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import mongooseTimestamp from 'mongoose-timestamp';
const Schema = mongoose.Schema;

const UsersSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    userName: {
        type: String
    },
    password: {
        type: String
    },
    status: {
        type: String,
        enum: [0, 1, 2],
        default: 2
    },
    isUserActive: {
        type: String,
        enum: [0, 1]
    },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerificationToken: String,
    emailVerificationTokenExpire: Date,
}, {
        collection: 'Users'
    });


UsersSchema.plugin(mongooseTimestamp);
UsersSchema.pre('save', function (next) {
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

UsersSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

const UsersModel = mongoose.model('Users', UsersSchema);

UsersModel.saveUser = (saveToUser) => {
    return saveToUser.save();
}

UsersModel.filter = (filterParam) => {
    return UsersModel.find(filterParam);
}
export default UsersModel;