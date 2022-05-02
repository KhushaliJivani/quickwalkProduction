import mongoose, { Collection } from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const businessSupplierSchema = mongoose.Schema({
    name: String,
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'suppliers'},
    sortOrder: Number,
    status: { type: String, enum: [0, 1, 2], default: 1 },
}, { Collection: 'supplierCategory' });

businessSupplierSchema.plugin(mongooseTimestamp);
const businessSupplierModel = mongoose.model('supplierCategory', businessSupplierSchema);

export default businessSupplierModel;
