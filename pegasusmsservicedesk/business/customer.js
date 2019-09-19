require('dotenv').config();
const Common = require(process.cwd() + '/utility/commonfunctions');
const Helper = require('./HelperFunctions');
const Logger = require('../Logger')

const createCustomer = async (req, res, next) => {

    var headers = Helper.getJsonHeader();
    let auth = Helper.AdminCredentials;
    var body = JSON.stringify(req.body);
    var options = {
        url: Common.GenerateUrl('createCustomer', process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: body,
        auth: auth
    };
    let returnVal = Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in creating customer", "error");
    }
    else
        Logger.addLog(options, req.body, returnVal, "Customer Created Successfully", "success");
    return returnVal;
}

const addCustomerToOrganization = async (req, res, next) => {
    var Oid = req.body.Organizationid;
    var headers = Helper.getJsonHeader();
    let auth = Helper.AdminCredentials;
    var body = req.body;
    delete body.Organizationid;
    var options = {
        url: Common.GenerateUrl('addCustomerToOrganization', process.env.UNIT).replace("{0}", Oid),
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        auth: auth
    };
    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in adding customer to organization", "error");
    }
    else
        Logger.addLog(options, req.body, returnVal, "Customer Added Successfully", "success");
    return "customer added successfully";
}

//Manish
const getCustomerDetails = async (req, res, next) => {
    let customerName = req.body.email
    var headers = Helper.getJsonHeader();
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var options = {
        url: Common.GenerateUrl("getCustomerDetails", process.env.UNIT).replace("{0}", customerName),
        method: 'GET',
        headers: headers,
        auth: auth
    };
    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in fetching customer details", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Customer details fetched successfully", "success");
    return returnVal;
};

const getOrganizationInServiceDesk = async (req, res, next) => {
    let start = req.body.start;
    let limit = req.body.limit;
    if (limit === undefined) {
        limit = 10;
    }
    if (start === undefined) {
        start = 0;
    }
    var headers = Helper.getJsonHeader();
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);

    var options = {
        url: Common.GenerateUrl("getOrganizationInServiceDesk", process.env.UNIT).replace("{0}", start).replace("{1}", limit),
        method: 'GET',
        headers: headers,
        auth: auth
    };

    let returnVal = Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting organization in service desk", "error");
    }
    else
        Logger.addLog(options, req.body, returnVal, "fetched Organization successfully Successfully", "success");
    return returnVal;
};

const listOfServiceDesks = async (req, res, next) => {
    let start = req.body.start;
    let limit = req.body.limit;
    if (limit === undefined) {
        limit = 10;
    }
    if (start === undefined) {
        start = 0;
    }
    var headers = Helper.getJsonHeader();
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);

    var options = {
        url: Common.GenerateUrl("listOfServiceDesks", process.env.UNIT).replace("{0}", start).replace("{1}", limit),
        method: 'GET',
        headers: headers,
        auth: auth
    };

    let returnVal = Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in listing service desk", "error");
    }
    else
        Logger.addLog(options, req.body, returnVal, "list of service desks", "success");
    return returnVal;
};

const requestTypesAssociatedWithSpecificServiceDesk = async (req, res, next) => {
    let groupId = await getRequestTypeGroup(req);
    let serviceDeskId = req.body.serviceDeskId
    let start = req.body.start;
    let limit = req.body.limit;
    if (limit === undefined) {
        limit = 10;
    }
    if (start === undefined) {
        start = 0;
    }
    var headers = Helper.getJsonHeader();
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);

    var options = {
        url: Common.GenerateUrl("requestTypesAssociatedWithSpecificServiceDesk", process.env.UNIT)
            .replace("{0}", serviceDeskId)
            .replace("{1}", start)
            .replace("{2}", limit)
            .replace("{3}", groupId),
        method: 'GET',
        headers: headers,
        auth: auth
    };

    let returnVal = Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting request types associated with service desk", "error");
    }
    else
        Logger.addLog(options, req.body, returnVal, "request types associated with service desks", "success");
    return returnVal;
};


const specificRequestTypesAssociatedWithSpecificServiceDesk = async (req, res, next) => {

    let serviceDeskId = req.body.serviceDeskId
    let requestTypeId = ""
    if (req.body.requestTypeId) {
        requestTypeId = req.body.requestTypeId;
    }
    else {
        requestTypeId = ""
    }
    var headers = Helper.getJsonHeader();
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);

    var options = {
        url: Common.GenerateUrl("specificRequestTypesAssociatedWithSpecificServiceDesk", process.env.UNIT).replace("{0}", serviceDeskId).replace("{1}", requestTypeId),
        method: 'GET',
        headers: headers,
        auth: auth,
        body: JSON.stringify(body)
    };

    let returnVal = Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting specific request types associated with service desk", "error");
    }
    else
        Logger.addLog(options, req.body, returnVal, "request types associated with service desks", "success");
    return returnVal;
};

getRequestTypeGroup = async (req, res, next) => {
    let serviceDeskId = req.body.serviceDeskId
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getRequestTypeGroup", process.env.UNIT).replace("{0}", serviceDeskId),
        method: 'GET',
        headers: headers,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);
    let ParsedReturnVal = JSON.parse(returnVal)
    let group = ParsedReturnVal.values.filter(object => {
        return object.name === req.body.groupname
    });
    if (group.length) {
        return group[0].id;
    }
    else {
        return ParsedReturnVal.values[1].id;
    }
}


module.exports = {
    createCustomer,
    addCustomerToOrganization,
    getCustomerDetails,
    getOrganizationInServiceDesk,
    listOfServiceDesks,
    requestTypesAssociatedWithSpecificServiceDesk,
    specificRequestTypesAssociatedWithSpecificServiceDesk
};