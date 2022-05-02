import mongoose, { Collection } from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const globalSupplierSchema = mongoose.Schema({
    type: { type: String, enum: [1, 2] },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    name: { type: String },
    logo: { type: String },
    address: { type: String },
    infoEmail: { type: String },
    orderEmail: { type: String },
    openingDays: [{
        day:  String,
        openingTime: String,
        closingTime: String
    }],
    deliveryDaysAllowed: [],
    productHaveUniqueCode:{type: String, enum:[0, 1]},
    productHaveCategory:{type: String, enum:[0, 1]},
    formatCode:{type: String},
    status: { type: String, enum: [0, 1, 2], default: 1 },
}, { Collection: 'suppliers' });

globalSupplierSchema.plugin(mongooseTimestamp);
const globalSupplierModel = mongoose.model('globalSuppliers', globalSupplierSchema);

export default globalSupplierModel;