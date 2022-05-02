import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

// const productSchema = mongoose.Schema({
//     adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
//     supplierId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }],
//     name: { type: String },
//     packaging: { type: String },
//     image: { type: String },
//     uniqueProductKey: { type: String },
//     supplierCatogoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
//     minOrder: { type: Number },
//     orderBy: { type: Number },
//     knownBySupplierIndex: { type: String, enum: [0, 1] },
//     status: { type: String, enum: [0, 1, 2], default: 1 },
//     GlobalProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'globalProduct' },
//     LocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'location' },
// }, { collection: 'product' });
const productSchema = mongoose.Schema({
    name: { type: String },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    image: { type: String },
    packaging: { type: String },
    suppliersProduct: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'supplier' },
        supplierProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'supplierProducts' },
        preferredIndex: { type: Number },
        calculation: { type: String },
        isSoldInStore: { type: String, enum: [0, 1], default: 0 },
    }],
    standardQuantity: { type: Number },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'location' },
    locationPreferredIndex: { type: Number },
    locationOrder: { type: Number },
    status: { type: String, enum: [0, 1, 2], default: 1 },
}, { collection: 'productRangeItems' });

productSchema.plugin(mongooseTimestamp);
const productModel = mongoose.model('productRangeItems', productSchema);
export default productModel;