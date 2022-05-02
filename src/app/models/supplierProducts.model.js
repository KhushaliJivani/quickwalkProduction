import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const globalProductSchema = mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    supplierId: {type: mongoose.Schema.Types.ObjectId, ref: 'companySuppliers'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    name: { type: String },
    packaging: { type: String },
    image: { type: String },
    uniqueProductKey: {type: String},
    categoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'supplierCategory'},
    minOrder: { type: Number },
    orderBy: { type: Number },
    status: { type: String, enum: [0, 1, 2], default: 1 },
    knownBySupplierIndex: { type: String, enum: [0, 1] },
}, { collection: 'supplierProducts' });

globalProductSchema.plugin(mongooseTimestamp);
const globalProductModel = mongoose.model('supplierProducts', globalProductSchema);
export default globalProductModel;