import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const locationSchema = mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'location' },
    name: { type: String },
    image: { type: String },
    imageManipulation: { type: String },
    locationColor: [{ range: { type: String }, color: { type: String } }],
    area: {},
    settings: {},
    status: { type: String, enum: [0, 1], default: 1 },
    isChild: { type: String, enum: [0, 1] },
    parentPosition: { type: String },
    svgSetting:{},
    preferredIndex: { type: String }
}, { collection: 'location' });
locationSchema.plugin(mongooseTimestamp);
const locationModel = mongoose.model('location', locationSchema);
export default locationModel;
