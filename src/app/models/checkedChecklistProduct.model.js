import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const checkedChecklistCombinationSchema = mongoose.Schema({
    checklistCombinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'checklistCombination' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'productRangeItems' },
    checkedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    isChecked: { type: Boolean }
}, { collection: 'checkedChecklistProduct' });
checkedChecklistCombinationSchema.plugin(mongooseTimestamp);
const checkedChecklistCombinationModel = mongoose.model('checkedChecklistProduct', checkedChecklistCombinationSchema);
export default checkedChecklistCombinationModel;
