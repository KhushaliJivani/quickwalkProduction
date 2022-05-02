import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const checklistCollectionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    checklistId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'checklist'
    }],
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    isDelete: {
        type: String,
        enum: [0, 1],
        default: 0
    },
    isPause: {
        type: String,
        enum: [0, 1]
    },
    pauseData: {
        checklistCombinationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'checklistCombination'
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'productRangeItems'
        },
        productIndex: {
            type: Number
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    },
    finishDate: Date,
    finsishByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
}, {
        collection: 'checklistCombination'
    });
checklistCollectionSchema.plugin(mongooseTimestamp,{
    createdAt: true,
    updatedAt: { path: 'updatedAt', setOnInsert: false }
  });
const checklistCollectionModel = mongoose.model('checklistCombination', checklistCollectionSchema);
export default checklistCollectionModel;