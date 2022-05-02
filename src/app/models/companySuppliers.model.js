import mongoose, { Collection } from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const businessSupplierSchema = mongoose.Schema({
    type: { type: String, enum: [1, 2] },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    orderEmail: { type: String },
    deliveryDaysStandard : [],
    logo: { type: String },
    minOrderProduct: { type: Number },
    placeOrderAhead: Number,
    placeOrderBeforeTime: String,
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'suppliers' },
    status: { type: String, enum: [0, 1, 2], default: 1 },
}, { Collection: 'companySuppliers' });

businessSupplierSchema.plugin(mongooseTimestamp);
const businessSupplierModel = mongoose.model('companySuppliers', businessSupplierSchema);

export default businessSupplierModel;