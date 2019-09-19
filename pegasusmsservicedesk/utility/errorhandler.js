const Common = require(process.cwd() + '/utility/commonfunctions');
//const FIGmdLogger = require(process.cwd() + '/utility/logger').logger;

module.exports = () => {
    return (err, req, res, next) => {
        //FIGmdLogger.error(err.message);
        return res.status(500).send(Common.createResponse({}, Common.resultStatus.FAIL, err.message));
    }
}