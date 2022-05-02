import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const orderDetailSchema = mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'order' },
    checklistCombinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'checklistCombination' },
    productRangeId: { type: mongoose.Schema.Types.ObjectId, ref: 'productRangeItems' },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'supplier' },
    supplierProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'supplierProducts' },
    quantity: Number,
    packaging: Number,
    intentionIndex: Number,
    intentionDescription: String,
    orderByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    orderOnDateTime: String,
    orderComment: String,
    deliveryCheckByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    deliveryCheckOnDateTime: String,
    deliveryComment: String,
    isFlush: Boolean,
    deliveredQuantity: Number,
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    asap: Boolean,
    statusIndex: { type: String, enum: [0, 1, 2, 3, 4] }  //0 = crate order, 1 = mail sent, 2 = received proper quantity, 3 = received miss-match quantity, 4 = deleted order 
}, { collection: 'orderDetail' });
orderDetailSchema.plugin(mongooseTimestamp);
const orderDetailModel = mongoose.model('orderDetail', orderDetailSchema);
export default orderDetailModel;