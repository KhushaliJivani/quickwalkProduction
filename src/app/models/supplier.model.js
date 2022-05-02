import mongoose, { Collection } from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const supplierSchema = mongoose.Schema({
    type: { type: String, enum: [1, 2] },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    name: { type: String },
    logo: { type: String },
    address: { type: String },
    infoEmail: { type: String },
    orderEmail: { type: String },
    openingDays: [{
        day: String,
        openingTime: String,
        closingTime: String
    }],
    deliveryDay: { type: String },
    orderTime: { type: String },
    deliveryDaysAllowed: [],
    productHaveUniqueCode: { type: String, enum: [0, 1] },
    productHaveCategory: { type: String, enum: [0, 1] },
    formatCode: { type: String },
    globalSupplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'globalSuppliers' },
    status: { type: String, enum: [0, 1, 2], default: 1 },
}, { Collection: 'suppliers' });

supplierSchema.plugin(mongooseTimestamp);
const supplierModel = mongoose.model('suppliers', supplierSchema);

export default supplierModel;