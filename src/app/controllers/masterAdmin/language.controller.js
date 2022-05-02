import language from '.././../models/language.model';
import Message from '../../../config/message';

/**
 * get language 
 * @public
 * @param req
 * @param res
 * @returns {*}
 */
exports.get = async (req, res) => {
    try {
        await language.find({ "status": 1 })
            .then(result => {
                res.status(200).send({ code: 200, message: Message.infoMessage.languageGet, data: result, error: [] });
            })
            .catch(err => {
                res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err.stack });
            })
    }
    catch (err) {
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err.stack });
    }
}