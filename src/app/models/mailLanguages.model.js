import mongoose from 'mongoose';
import mongooseTimestamp from 'mongoose-timestamp';

const mailLanguagesSchema = mongoose.Schema({
    languageId: {type: mongoose.Schema.Types.ObjectId, ref: 'language'},
    label: { type: String },
    languageType: { type: String },
    content: {
        content0 :{ type: String },
        content1 :{ type: String },
        content2 :{ type: String },
        content3 :{ type: String },
        content4 :{ type: String },
        content5 :{ type: String },
        content6 :{ type: String },
        content7 :{ type: String },
        content8 :{ type: String },
        content9 :{ type: String },
        content10 :{ type: String },
        content11 :{ type: String },
        content12 :{ type: String },
        content13 :{ type: String },
        content14 :{ type: String }
    },
}, { collection: 'mailLanguages' });
mailLanguagesSchema.plugin(mongooseTimestamp);
const mailLanguagesModel = mongoose.model('mailLanguages', mailLanguagesSchema);
export default mailLanguagesModel;
