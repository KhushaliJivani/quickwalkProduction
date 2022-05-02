import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const orderSchema = mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'supplier' },
    orderDate: Date,
    standardOrder: Number,
    expectedDeliveryDate: Date,
    deliveryDateTime: Date,
    actualDeliveryDate: Date,
    asap: Boolean,
    remark: String,
    status: { type: String, enum: [0, 1, 2, 3] } //0 = crate order, 1 = mail sent (store then directly create status), 2 = received order, 3 = delete order
}, { collection: 'order' });
orderSchema.plugin(mongooseTimestamp);
const orderModel = mongoose.model('order', orderSchema);
export default orderModel;
