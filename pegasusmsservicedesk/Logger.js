const loggerInterface = require("loggerinterface")
const Helper = require("./business/HelperFunctions");

const getLogObject = (requestObject, responseObject, message) => {
    var returnVal = {
        userId: "",
        userName: "",
        sessionId: "",
        requestObject: requestObject,
        responseObject: responseObject,
        practiceUID: "",
        messgae: message

    }
    return returnVal;
}

const addLog = (info, parameters, data, message, logType) => {

    var requestInfo = {
        fieldName: info.fieldName,
        queryFields: Helper.getFields(info),
        parameters: (parameters == undefined || parameters == null) ? {} : parameters
    }


    var logObject = getLogObject(requestInfo, data, message);
    
    switch (logType) {
        case "success":
            loggerInterface.info(logObject);
            break;
        case "error":
            loggerInterface.error(logObject);
            break;
    }
}

module.exports = {
    addLog
}

