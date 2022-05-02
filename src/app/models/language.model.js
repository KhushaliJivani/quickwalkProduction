import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const languageSchema = mongoose.Schema({
    name: { type: String },
    shortCode: { type: String },
    status: { type: String, enum: [0, 1] },
    businessId:{type: mongoose.Schema.Types.ObjectId, ref: 'admin'},
}, { collection: 'language' });
languageSchema.plugin(mongooseTimestamp);
const languageModel = mongoose.model('language', languageSchema);
export default languageModel;
