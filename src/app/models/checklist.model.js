import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const checklistSchema = mongoose.Schema({
    name: { type: String, required: true },
    product: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    status: { type: String, enum: [0, 1, 2] }
}, { collection: 'checklist' });
checklistSchema.plugin(mongooseTimestamp);
const checklistModel = mongoose.model('checklist', checklistSchema);
export default checklistModel;
