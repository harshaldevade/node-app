require('dotenv').config();
//const { config, SDAccountDetails, SDEndPoints } = require("../configuration/config");
const Helper = require("../business/HelperFunctions");


const asyncAwait = (fn) => {
    return (req, res, next) => {
        // Make sure to `.catch()` any errors and pass them along to the `next()`
        // middleware in the chain, in this case the error handler.
        fn(req, res, next).catch(next);
    };
}

const promise = (promise) => {
    return promise.then(data => {
        return [null, data];
    })
        .catch(err => [err]);
}

const resultStatus = {
    FAIL: 0,
    SUCCESS: 1,
    DUPLICATE: 2,
    NORECORDS: 3,
    NOACCESS: 4,
    AUTHENTICATIONFAIL: 5
}

const result = {
    data: {},
    statusCode: {},
    description: {}
}

const createResponse = (data, statusCode, description) => {
    result.data = data;
    result.statusCode = statusCode;
    result.description = description;
    //FIGmdLogger.info("response: " + JSON.stringify(result));
    return result;
}

const GenerateUrl = (key, unit) => {
    if (unit === null || unit === undefined || unit.trim() === "") {
        unit = "common";
    }

    let dalEndpoints = Helper.SDEndPoints.filter(function (account) {
        return account.Unit == unit
    });

    if (dalEndpoints === null || dalEndpoints == undefined) {
        endPoint = Helper.SDEndPoints.filter(function (account) {
            return account.Unit == "common";
        });
    }

    let endpointWithKey = "dalEndpoints[0]." + key

    let returnValue = `${process.env.SD_END_POINT_BASEURL}` + eval(endpointWithKey)

    return returnValue;
}

const GenerateJIRAAuthToken = (unit) => {
    if (unit === null || unit === undefined || unit.trim() === "") {
        unit = "common";
    }

    let unitAccountDetails = Helper.SDAccountDetails.filter(function (account) {
        return account.Unit == unit
    });
    if (unitAccountDetails === null || unitAccountDetails == undefined) {
        unitAccountDetails = Helper.SDAccountDetails.filter(function (account) {
            return account.Unit == "common";
        });
    }

    let returnData = {
        'user': unitAccountDetails[0].Username,
        'pass': unitAccountDetails[0].Password
    }
    return returnData
}

const GetMeasureList = async (req) => {

    let user = Helper.getRequestUserId(req);
    if (!user) {
        throw new Error("Logged in User Id required in Header");
    }
    //preparing variables for authService call
    let inactiveFlag = 'false';
    let measureSetId = (req.body.measureSetId) ? req.body.measureSetId : null;
    let measureSetIdArray = [];
    if (measureSetId != null) {
        measureSetIdArray.push(measureSetId);
    }
    //AuthrizationService API Call
    let authMeasureSetObject = await Helper.authorizedMeasureSetAgainstuser(measureSetIdArray, inactiveFlag, req);

    //taking return value and error from authService into readable variable
    let authData = authMeasureSetObject.getUserAuthorizedMeasureSet.UserAuthorizedEntity.identifierList;
    let authError = authMeasureSetObject.getUserAuthorizedMeasureSet.UserAuthorizedEntity.error;
    let authErrorType = authMeasureSetObject.getUserAuthorizedMeasureSet.UserAuthorizedEntity.errorType;

    //if authService return error
    if (authError && authData == null) {
        //LoggerService.addLog(info, args.input, data, authError, authErrorType);
        throw new Error(authError)
    }
    let measureId = [];
    if(req.body.measureNo && req.body.measureNo.length > 0) {
        measureId = await Helper.getMeasuresfromMeasureNo(req);
        if(measureId.length==0)
            throw Error('No record found for given measure.');
        
        req.body.measureId = measureId;
    }

    let measureAgainstMeasureSetList = {}
    measureAgainstMeasureSetList = await Helper.getMeasureAgainstMeasureSet(req);

    let measuresArry = Array.from(measureAgainstMeasureSetList.measuresetdetails, x => x.measures.measureno)

    if(!Helper.isNullOrUndefined(req.body.measureNo) && measuresArry.length ==0){
        throw new Error("Measure not found against given measure set.");
    }
    delete req.body.measureId;
    return measuresArry;

}

module.exports = {
    asyncAwait,
    GenerateUrl,
    resultStatus,
    createResponse,
    promise,
    GenerateJIRAAuthToken,
    GetMeasureList
}
