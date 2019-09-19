require('dotenv').config();
const parameterize = require('json-parameterization');
var request = require('request');
const customQueries = require(process.cwd() + "/business/CustomQueries.json");
const Client = require("node-rest-client").Client;


var client = new Client({
    mimetypes: {
      json: ["application/json", "application/json; charset=utf-8"]
    }
  });

const SDAccountDetails = [{
    Unit: "common",
    Username: process.env.COMMON_USERNAME,
    Password: process.env.COMMON_PASSWORD
}
];


const AdminCredentials = {
    'user': process.env.ADMIN_USERNAME,
    'pass': process.env.ADMIN_PASSWORD
}

const SDEndPoints = [{
    Unit: "common",
    createTicket: "/rest/servicedeskapi/request",
    createCustomer: "/rest/servicedeskapi/customer",
    addCustomerToOrganization: "/rest/servicedeskapi/organization/{0}/user",
    listCustomerTypeTicket: "/rest/servicedeskapi/request/{0}",
    getCustomerDetails: "/rest/api/3/user/search?query={0}",
    getUserIssue: "/rest/api/3/issue/{0}",
    getIssueComments: "/rest/api/2/issue/{0}/comment",
    addIssueComments: "/rest/api/2/issue/{0}/comment",
    createIssue: "/rest/api/2/issue",
    searchTicket: "/rest/api/3/search",
    getOrganizationInServiceDesk: "/rest/servicedeskapi/organization?start={0}&limit={1}",//post
    listOfServiceDesks: "/rest/servicedeskapi/servicedesk?start={0}&limit={1}",//post
    requestTypesAssociatedWithSpecificServiceDesk: "/rest/servicedeskapi/servicedesk/{0}/requesttype?start={1}&limit={2}&groupId={3}",//post
    specificRequestTypesAssociatedWithSpecificServiceDesk: "/rest/servicedeskapi/servicedesk/{0}/requesttype/{1}?start={2}&limit={3}",//post
    getAllTransitionsOfATicket: "/rest/servicedeskapi/request/{0}/transition",
    getTypeTicketsForPracticeAndCustomers: "/rest/api/3/search",
    getRequestTypeGroup: "/rest/servicedeskapi/servicedesk/{0}/requesttypegroup"
}]

const getJsonHeader = () => {
    let header = {
        'Content-Type': 'application/json'
    }
    return header;
}

const genericRestCall = (option) => {
    return new Promise(function (resolve, reject) {
        request(option, (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve(body);
        })
    });
}

function getFields(info) {
    var queryfields = "";

    if (info.fieldNodes && info.fieldNodes.length > 0) {
        if (info.fieldNodes[0].selectionSet != undefined && info.fieldNodes[0].selectionSet != null) {
            if (info.fieldNodes[0].selectionSet.selections.length > 0) {
                info.fieldNodes[0].selectionSet.selections.map((x) => {
                    queryfields = queryfields + x.name.value + "\n    ";
                });
            }
        }
    }
    return queryfields;
}

function getRequestUserId(req){
    let user = req.headers['request-user-id'];
    return user;
}

function getResultforCustomOperationsFromDAL(args, url) {
    url = url == null || url == undefined ? process.env.DAL_MANAGEMENT_ENDPOINT : url;
    return new Promise(function (resolve, reject) {
      client.post(url, args, (result, response, err) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.data);
          }
        })
        .on("error", function (err) {
          return new Error(err);
        });
    });
  }


const authorizedMeasureSetAgainstuser = async (measureSetIdArray,inactiveFlag,req) => {
    let inactiveilterStr = !isNullOrUndefined(inactiveFlag) ? `inactiveflag:${inactiveFlag}` : '';
    let entityidStr = (Array.isArray(measureSetIdArray) && measureSetIdArray.length > 0) ? ` entityid: [${measureSetIdArray}] ` : '';
  
    let input = " ";
      if (inactiveilterStr == '' && entityidStr == '') {
          input = {
              inputs: ''
          }
      } else {
          input = {
              inputs: `(input: {${inactiveilterStr} ${entityidStr} })`
          };
      }
    
    let query = parameterize(customQueries.measuresetauthorizations, input);
    let MeasureSetAuthArgs = {
      data: query,
      headers: {
        "Content-Type": "application/json",
        "request-user-id":req.headers['request-user-id']
      }
    }
    
    let measureSetAuthObject;
    try {
      //HTTP request to authrization service 
      measureSetAuthObject = await getResultforCustomOperationsFromDAL(MeasureSetAuthArgs, process.env.BIZ_AUTHORIZATION_ENDPOINT);
    } catch (e) {
      //LoggerService.addLog(info, practiceIdArray, measureSetAuthObject, e.message, "error");
      throw new Error(e.message);
    }
    
    return measureSetAuthObject;
  }

  //Get the Measure Ids for MeasureSetId
async function getMeasureAgainstMeasureSet(req){
    let measureAgainstMeasureSetList = [];
    let input = {};
    if(!isNullOrUndefined(req.body.measureNo) && !isNullOrUndefined(req.body.measureId) && req.body.measureId.length != 0){
        input = {
            'inputs': `( measuresetid:${req.body.measureSetId}, measureidIn:[${req.body.measureId}])`
        }
    }
    else {
        input = {
            'inputs': `( measuresetid:${req.body.measureSetId})`
        }
    }

    const query = parameterize(customQueries.getmeasuresetdetails, input);
    const measureAgainstMeasureSetArgs = {
        data: query,
        headers: { "Content-Type": "application/json" }
    }    
    measureAgainstMeasureSetList = await getResultforCustomOperationsFromDAL(measureAgainstMeasureSetArgs, process.env.DAL_MEASURE_ENDPOINT);
    return measureAgainstMeasureSetList;
}

async function getMeasuresfromMeasureNo(req){
    let measureId = [];

    if(req.body.measureNo){
    let measureNo = (req.body.measureNo) ? req.body.measureNo : null;
    let measureNoArray = [];
    if (measureNo != null) {
        measureNoArray = [...new Set(measureNo)];
    }
        let inputMeasureID = {};
        inputMeasureID ={
            'inputs': `( measurenoIn:["${measureNoArray.join('","')}"])`
        }
        const measurenoQuery = parameterize(customQueries.measures, inputMeasureID);
        const measurenoArgs = {
            data:measurenoQuery,
            headers: { "Content-Type": "application/json" }
        }

        measureId = await getResultforCustomOperationsFromDAL(measurenoArgs,process.env.DAL_MEASURE_ENDPOINT);
        measureId = Array.from(measureId.measures, id => id.id);
        
    }
    return measureId;
}


function isNullOrUndefined(arg){
    let returnVal = (typeof arg === 'string' && arg.trim() === "") ? true : (arg === null || arg === undefined) ? true :false;
    return returnVal;
}

const authorizedPracticeAgainstUser = async (practiceIdArray,inactiveFlag,req) => {

    let userId=req.headers['request-user-id'];
    if(userId == undefined || userId == null || userId== ""){
      throw Error("Please provide userId.")
    }

    let inactiveilterStr = !isNullOrUndefined(inactiveFlag) ? `inactiveflag:${inactiveFlag}` : '';
    let entityidStr = (Array.isArray(practiceIdArray) && practiceIdArray.length > 0) ? ` parententityid: [${practiceIdArray}] ` : '';
  
    let input = " ";
      if (inactiveilterStr == '' && entityidStr == '') {
          input = {
              inputs: ''
          }
      } else {
          input = {
              inputs: `(input: {${inactiveilterStr} ${entityidStr} })`
          };
      }
    
    let query = parameterize(customQueries.getuserauthorizedpractice, input);
    let MeasureSetAuthArgs = {
      data: query,
      headers: {
        "Content-Type": "application/json",
        "request-user-id":req.headers['request-user-id']
      }
    }
    
    let practiceAuthObject;
    try {
      //HTTP request to authrization service 
      practiceAuthObject = await getResultforCustomOperationsFromDAL(MeasureSetAuthArgs, process.env.BIZ_AUTHORIZATION_ENDPOINT);
    } catch (e) {
      throw new Error("Error in practiceAuthorization : "+e.message);
    }
    return practiceAuthObject;
  }

  const authorizedSDEntityAgainstUser = async (req) => {
    let input = "";

    input = {
        inputs: ''
    }
      
    let query = parameterize(customQueries.getuserauthorizedsdentity, input);
    let SDAuthArgs = {
      data: query,
      headers: {
        "Content-Type": "application/json",
        "request-user-id":req.headers['request-user-id']
      }
    }
    
    let SDAuthObject;
    try {
      //HTTP request to authrization service 
      SDAuthObject = await getResultforCustomOperationsFromDAL(SDAuthArgs, process.env.BIZ_AUTHORIZATION_ENDPOINT);
    } catch (e) {
      throw new Error(e.message);
    }
    return SDAuthObject;
  }


  const getPracticeIdByExternalId = async (externalId) => {

    let input = {
        'inputs': `( externalid:${externalId})`
    }

    let query = parameterize(customQueries.getpracticeidbyexternalid, input);
    let practiceArgs = {
        data: query,
        headers: { "Content-Type": "application/json" }
    }

    let data = await getResultforCustomOperationsFromDAL(practiceArgs, process.env.DAL_MANAGEMENT_ENDPOINT);
    if(data.practice== null || data.practice == undefined){
        throw new Error("No Practice available against given ExternalId");
    }else{
        return data.practice.id;
    }
}

const sendEmailNotification = async (requestParam, userId) => {
  //call IAM method to get the to address
  let userDetails = await getUserEmail(userId);

  requestParam.recipientgrouplist[0].to =userDetails[0].emailaddress;
  requestParam.recipientgrouplist[0].fields.username =userDetails[0].firstname+' '+userDetails[0].lastname;

  var options = {
    url: process.env.BIZ_NOTIFICATION_ENDPOINT,
    method: 'POST',
    headers: getJsonHeader(),
    body: JSON.stringify(requestParam)
  };
  let returnVal = await genericRestCall(options);

  if(returnVal == undefined ||  returnVal == "" || returnVal == null ){
    throw new Error("error while sending email notification");
  }

  return returnVal; 

}

//IAM method to get the user email address from user id
const getUserEmail = async(userId) => {

  let body= {
    "userid":userId
  }

  var options = {
    url: process.env.IAM_LOGIN_USER,
    method: 'POST',
    headers: getJsonHeader(),
    body:JSON.stringify(body)
  };

  let returnVal;
  try {
    returnVal = await genericRestCall(options).then(async function (value) {
      return value
    })
  } catch (Error) {
    throw Error.message;
  }

  if(returnVal == undefined || returnVal == "" || returnVal == null){
      throw new Error("Error while getting user email details from IAM");
  }
  returnVal= JSON.parse(returnVal);

  if(returnVal.statusCode == 1 && returnVal.data.user){
    return returnVal.data.user;
  }else{
    throw new Error("GetUserEmail:IAM Error :"+JSON.stringify(returnVal.description));
  }
}

const getPracticeNameByExternalId = async (externalId) => {

  let input = {
      'inputs': `( externalid:${externalId})`
  }

  let query = parameterize(customQueries.getpracticenamebyexternalid, input);
  let practiceArgs = {
      data: query,
      headers: { "Content-Type": "application/json" }
  }

  let data = await getResultforCustomOperationsFromDAL(practiceArgs, process.env.DAL_MANAGEMENT_ENDPOINT);
  if(data.practice== null || data.practice == undefined){
      throw new Error("No Practice available against given ExternalId");
  }else{
      return data.practice.name;
  }
}


module.exports = {
    getJsonHeader,
    genericRestCall,
    SDAccountDetails,
    SDEndPoints,
    AdminCredentials,
    getFields,
    getRequestUserId,
    authorizedMeasureSetAgainstuser,
    getMeasureAgainstMeasureSet,
    isNullOrUndefined,
    getMeasuresfromMeasureNo,
    authorizedPracticeAgainstUser,
    getPracticeIdByExternalId,
    authorizedSDEntityAgainstUser,
    sendEmailNotification,
    getPracticeNameByExternalId
}