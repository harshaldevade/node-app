require('dotenv').config();
const Common = require(process.cwd() + '/utility/commonfunctions');
const Helper = require('./HelperFunctions');
const constants = require('../configuration/constants');
const Logger = require('../Logger');
const validation = require('./Validation');

const createTicket = async (req, res, next) => {
    let requestBody = req.body;

    let practiceExternalId=requestBody.practiceId;
    let ticketDescription=requestBody.requestFieldValues.description;

    if(practiceExternalId == "" || practiceExternalId == null || practiceExternalId == undefined){
        throw new error("Please provide practice external id");
    }

    /*
    Practice Authorization(restricting unauthorized practice)
    */
    let practiceId=await Helper.getPracticeIdByExternalId(practiceExternalId);
    let practiceIdArray=[];
    practiceIdArray.push(parseInt(practiceId));
    //practiceAuthorization service call for practice authorization (to allow only allowed practice)
    practiceAuthObject=await Helper.authorizedPracticeAgainstUser(practiceIdArray,null,req);
    
    let authError=practiceAuthObject.getUserAuthorizedPractices.UserAuthorizedEntity.error
    if(authError != null && authError != "" && authError.length > 0){
        throw new Error(authError);
    }


    // requestBody.raiseOnBehalfOf = JSON.parse(await getPracticeDetails(requestBody.practiceId));
    let raiseOnBehalfOf = await getPracticeDetails(requestBody.practiceId)
    //console.log(raiseOnBehalfOf === constants.noTicket.NO_RECORDS_FOUND);
    if (!(raiseOnBehalfOf === constants.noTicket.NO_RECORDS_FOUND)) {
        requestBody.raiseOnBehalfOf = JSON.parse(raiseOnBehalfOf);
    }
    requestBody.requestFieldValues.customfield_11390 = `${req.headers['request-user-id']}`;
    requestBody.requestFieldValues.customfield_11209 = requestBody.practiceId;
    requestBody.requestFieldValues.customfield_11480 = requestBody.createdBy;
    if(requestBody.fileUrl !== undefined && requestBody.fileUrl !== null)
        requestBody.requestFieldValues.customfield_11461 = requestBody.fileUrl;
    
    delete requestBody.practiceId;
    delete requestBody.fileUrl;
    delete requestBody.createdBy;
    requestBody = JSON.stringify(requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();

    var options = {
        url: Common.GenerateUrl('createTicket', process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };
    let returnVal = await Helper.genericRestCall(options);
    
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in Ticket Creation", "error");
    }
    else{
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Ticket Created Successfully", "success");
        //call to notification service
        let createTicketRes=null; 
        try{
            createTicketRes= JSON.parse(returnVal);
        }catch(e){
            console.log("TS: Error: Ticket id not found. :: ",returnVal);
        }
        //send notification functionality
        if (createTicketRes != null) {
            let createdIssueKey = createTicketRes.issueKey;
            let createdTime = createTicketRes.createdDate.iso8601;
            let ticketURL = createTicketRes._links.web;
            let fieldArray = createTicketRes.requestFieldValues;
            let practiceName = await Helper.getPracticeNameByExternalId(practiceExternalId);
            let description = ticketDescription;
        
            let option = {
                "recipientgrouplist": [
                    {
                        "notificationkey": "CREATE_TICKET",
                        "to": "",//get from IAM call in next mehtod
                        "fields": {
                            "registryname": process.env.SD_EMAIL_REGISTRYNAME,
                            "ticketno": createdIssueKey,
                            "practiceid": practiceExternalId,
                            "camemail": process.env.SD_EMAIL_CAM_EMAIL,
                            "username": "",
                            "datetime": createdTime,
                            "ticketurl": ticketURL,
                            "description": description,
                            "practicename":(practiceName == undefined)?"":practiceName
                        }
                    }
                ]
            }

            let emailStatus = await Helper.sendEmailNotification(option, req.headers['request-user-id']);

            if (emailStatus) {
                let emailResult = JSON.parse(emailStatus)
                if (emailResult[0].error.length < 1) {
                    console.log("TS: Notification sent successfully to :", emailResult[0].to);
                } else {
                    console.log("TS: Notification service Error :", emailResult[0].error);
                }
            }
        }   
    }
    return returnVal;

}

const listCustomerTypeTicket = async (req, res, next) => {
    ticketId = req.body.ticketId;
    var headers = Helper.getJsonHeader();
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var body = req.body;
    delete body.ticketId;
    var options = {
        url: Common.GenerateUrl('listCustomerTypeTicket', process.env.UNIT).replace("{0}", ticketId),
        method: 'GET',
        headers: headers,
        body: JSON.stringify(body),
        auth: auth
    };
    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in Ticket listing", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Listed Customer type ticket Successfully", "success");
    return returnVal;
}

const getUserIssue = async (req, res, next) => {

    let ticketId = req.body.ticketid;

    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();

    var options = {
        url: Common.GenerateUrl("getUserIssue", process.env.UNIT).replace("{0}", ticketId),
        method: 'GET',
        headers: headers,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting user issue", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "user issues fetched successfully", "success");
    return returnVal;
}

const getIssueComments = async (req, res, next) => {
    let ticketId = req.body.ticketid;
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getIssueComments", process.env.UNIT).replace("{0}", ticketId),
        method: 'GET',
        headers: headers,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting comments", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Got comments successfully", "success");
    return returnVal;
}

const addIssueComments = async (req, res, next) => {

    let ticketId = req.body.ticketid;
    let requestBody = req.body;
    delete requestBody.ticketid;

    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();

    var options = {
        url: Common.GenerateUrl("addIssueComments", process.env.UNIT).replace("{0}", ticketId),
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        auth: auth
    };
    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in adding comments", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Added comments succesfully Successfully", "success");
    return returnVal;
}

const createIssue =async (req, res, next) => {

    let requestBody = req.body;
    requestBody.fields.customfield_11390 = req.headers['request-user-id'];
    requestBody = JSON.stringify(requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();

    var options = {
        url: Common.GenerateUrl("createIssue", process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in Ticket Creation", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "created issue Successfully", "success");
    return returnVal;
}

const getTypeTicketsForPracticeAndCustomers = async (req, res, next) => {
    let requestBody = req.body;
    requestBody.jql = createJQL(requestBody);
    delete requestBody.project;
    delete requestBody.issueType;
    delete requestBody.startDate;
    delete requestBody.endDate;
    delete requestBody.reporters;
    requestBody = JSON.stringify(requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getTypeTicketsForPracticeAndCustomers", process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in type tickets for practice and customers", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "got type tickets for practice and customers successfully", "success");

    return returnVal;
}

const searchTicket = async (req, res, next) => {
    let requestBody = req.body;
    
    //extracting practice external id from JQL
    let JQL=requestBody.jql;
    let practiceIdStr=JQL.includes('cf[11209]') && JQL.split(/and/i).filter(x=>x.includes('cf[11209]'));
    let externalId = typeof practiceIdStr != "boolean" && practiceIdStr[0].trim().split('~')[1];

    if(externalId){
        //get practice id from practice external id
        let practiceId=await Helper.getPracticeIdByExternalId(externalId);

        let practiceIdArray=[];
        practiceIdArray.push(parseInt(practiceId));
        //practiceAuthorization service call for practice authorization (to allow only allowed practice)
        practiceAuthObject=await Helper.authorizedPracticeAgainstUser(practiceIdArray,null,req);
        let authError=practiceAuthObject.getUserAuthorizedPractices.UserAuthorizedEntity.error
        if(authError != null && authError != "" && authError.length > 0){
            throw new Error(authError);
        }

        //call to SD auth 
        let SDAuthObject=await Helper.authorizedSDEntityAgainstUser(req);

        let sdAuthData=SDAuthObject.getUserAuthorizedSDEntity.UserAuthorizedEntity.identifierList;
        let sdAuthError=SDAuthObject.getUserAuthorizedSDEntity.UserAuthorizedEntity.error;

        if(sdAuthError!= "" && sdAuthError != null && sdAuthError.length > 0){
            throw new Error(sdAuthError);
        }
        //Apending created by user id filter if in sd authorization found the entity id agianst the user
        if(sdAuthData != null && sdAuthData.length > 0){
            requestBody.jql = requestBody.jql.concat(` AND 'Created By' ~  '${sdAuthData[0]}'`);
        }

    }else{
        throw new Error("ServiceDesk : practice id is mandatory");
    }

    requestBody = JSON.stringify(requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("searchTicket", process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in searching tickets", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "fetched tickets successfully", "success");

    return returnVal;
}

const getAllTransitionsOfATicket = async (req, res, next) => {
    let ticketId = req.body.ticketId;
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getAllTransitionsOfATicket", process.env.UNIT).replace("{0}", ticketId),
        method: 'GET',
        headers: headers,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting transitions", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "got transactions successfully", "success");
    return returnVal;
}

const getPracticeStatus = async (req, res, next) => {
    let requestBody = req.body;
    let practiceId = req.body.practiceId;
    let isASPS=false;
    
    //calculating current year
    let dt=new Date();
    let currentYear= dt.getFullYear();

    //calculating start and end date of current year
    let startDate = currentYear + "-1-1";
    let endDate = currentYear + "-12-31";

    let programNameStr="";
    if(requestBody.project === "ACC"){
        programNameStr=`"Program Name" in ("PINNACLE", "DIABETES","PINNACLE + DIABETES") AND`;
    }
    else if(requestBody.project === 'ASPS'){
        programNameStr=`"Program Name" IN (QCDR,NBIR) AND`;
        isASPS=true;
    }
    else{
        programNameStr=``;
    }


    //let JQL = `issuetype = ${requestBody.issueType} AND cf[11209] ~ '${requestBody.practiceId}'`
    // let JQL = `project = ${requestBody.project} AND issuetype = DataSource AND created >= ${requestBody.startDate} AND created <= ${requestBody.endDate} AND ${requestBody.project === "ACC" ? `"Program Name" in ("PINNACLE", "DIABETES","PINNACLE + DIABETES")` : `"Program Name" = QCDR`} AND cf[11209] ~ ${requestBody.practiceId}`;
    let JQL = `project = ${requestBody.project} AND issuetype = DataSource AND created >= ${startDate} AND created <= ${endDate} AND  ${programNameStr} cf[11209] ~ ${requestBody.practiceId} AND cf[11272] in ('EHR','PM') AND cf[11435] = ${currentYear} order by createddate desc`;
    requestBody.jql = JQL;

    delete requestBody.issueType;
    delete requestBody.practiceId;
    delete requestBody.project;
    
    //setting status for output 
    requestBody.fields = [
        "status","customfield_11272"
    ];

    requestBody = JSON.stringify(requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getTypeTicketsForPracticeAndCustomers", process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };
    //JIRA API CALL (REST)
    let returnVal = await Helper.genericRestCall(options);

    let APIResponse=JSON.parse(returnVal);

    if (APIResponse.issues.length) {
        
        let IssueList=APIResponse.issues;
        let issueToReturn;

        //inactive issue list
        let inactiveList=await getInActiveIssueList(IssueList);
        
        //other then InActive issue list
        let nonInactiveList=await nonInactiveIssueList(IssueList);
        
        let inactiveListLength=inactiveList.length;
        let nonIncativeListLength=nonInactiveList.length;

        
        
        if (nonIncativeListLength > 0) {//active list

            let EHRListNonInactive=await getEHRIssueList(nonInactiveList);
            let PMListNonInactive=await getPMIssueList(nonInactiveList);

            let EHRListLength=EHRListNonInactive.length;
            let PMListLength=PMListNonInactive.length;
            
            //EHR AND PM FILTER
            if(EHRListLength > 0){
                if(isASPS){
                    //QCDR and NBIR filter
                    let QCDRIssueList=await getQCDRIssueList(EHRListNonInactive);
                    let NBIRIssueList=await getNBIRIssueList(EHRListNonInactive);
                    let QCDRListLength=QCDRIssueList.length;
                    let NBIRListLength=NBIRIssueList.length;

                    if(QCDRListLength > 0 && NBIRListLength == 0){
                        issueToReturn=QCDRIssueList[0];
                    }else if(NBIRListLength > 0 && QCDRListLength == 0){
                        issueToReturn = NBIRIssueList[0]; 
                    }
                }else{
                    issueToReturn=EHRListNonInactive[0];
                }
            }else if(PMListLength > 0 && EHRListLength == 0){
                if(isASPS){
                    //QCDR and NBIR filter
                    let QCDRIssueList=await getQCDRIssueList(PMListInactive);
                    let NBIRIssueList=await getNBIRIssueList(PMListInactive);
                    let QCDRListLength=QCDRIssueList.length;
                    let NBIRListLength=NBIRIssueList.length;

                    if(QCDRListLength > 0 && NBIRListLength == 0){
                        issueToReturn=QCDRIssueList[0];
                    }else if(NBIRListLength > 0 && QCDRListLength == 0){
                        issueToReturn = NBIRIssueList[0]; 
                    }
                }else{
                    issueToReturn=PMListNonInactive[0];
                }
            }
        } else if (inactiveListLength > 0 && nonIncativeListLength == 0) {//inactive filter process
            
            let EHRListInactive=await getEHRIssueList(inactiveList);
            let PMListInactive=await getPMIssueList(inactiveList);

            let EHRListLength=EHRListInactive.length;
            let PMListLength=PMListInactive.length;

            //when EHR and PM both are inactive then showing customer workflow
            if(EHRListLength > 0 && PMListLength > 0){
                return (await getCustomerStatus(practiceId));
            }
            
            //EHR AND PM FILTER
            if(EHRListLength > 0){
                if(isASPS){
                    //QCDR and NBIR filter
                    let QCDRIssueList=await getQCDRIssueList(EHRListInactive);
                    let NBIRIssueList=await getNBIRIssueList(EHRListInactive);
                    let QCDRListLength=QCDRIssueList.length;
                    let NBIRListLength=NBIRIssueList.length;

                    if(QCDRListLength > 0 && NBIRListLength == 0){
                        issueToReturn=QCDRIssueList[0];
                    }else if(NBIRListLength > 0 && QCDRListLength == 0){
                        issueToReturn = NBIRIssueList[0]; 
                    }

                }else{
                    issueToReturn=EHRListInactive[0];
                }
            }else if(PMListLength > 0 && EHRListLength == 0){
                if(isASPS){
                    //QCDR and NBIR filter
                    let QCDRIssueList=await getQCDRIssueList(PMListInactive);
                    let NBIRIssueList=await getNBIRIssueList(PMListInactive);
                    let QCDRListLength=QCDRIssueList.length;
                    let NBIRListLength=NBIRIssueList.length;

                    if(QCDRListLength > 0 && NBIRListLength == 0){
                        issueToReturn=QCDRIssueList[0];
                    }else if(NBIRListLength > 0 && QCDRListLength == 0){
                        issueToReturn = NBIRIssueList[0]; 
                    }
                }else{
                    issueToReturn=PMListInactive[0];
                }
            }
        }


        /*
        final assignment
        */
        returnVal=JSON.parse(returnVal);
        //deleteing all issue from jira response
        returnVal.issues.length=0;
        //assinging appropriate(only one as per the logic) issue to jira response 
        returnVal.issues[0]=issueToReturn;
        //agian converting into string to send response
        returnVal=JSON.stringify(returnVal);

        
        //Error handling part
        if (returnVal.hasOwnProperty('errorMessage')) {
            Logger.addLog(options, req.body, { info: APIResponse }, "Issue in getting practice status", "error");
        }
        else{
            Logger.addLog(options, req.body, { info: APIResponse }, "got practice status", "success");
        }
            
        return returnVal;
    }
    else {
        if (returnVal.hasOwnProperty('errorMessage')) {
            Logger.addLog(options, req.body, { info: APIResponse }, "Issue in Ticket Creation", "error");
        }
        else
            Logger.addLog(options, req.body, { info: APIResponse }, "got practice status", "success");
        //If no DataSource record found then getting customer ticket status
        return (await getCustomerStatus(practiceId));
    }

}

const getInActiveIssueList=async(IssueList)=>{
    let inactiveList=[];
    inactiveList=IssueList.filter(issue =>{
        return issue.fields.status.name.toLowerCase() === 'datasource inactive';
    })
    return inactiveList;
}

const nonInactiveIssueList=async(IssueList)=>{
    let otherThanInactiveList=[];
    otherThanInactiveList=IssueList.filter(issue =>{
        return issue.fields.status.name.toLowerCase() != 'datasource inactive';
    })
    return otherThanInactiveList;
}

const getEHRIssueList=async(IssueList)=>{
    let EHRIssueList=[];
        EHRIssueList=IssueList.filter(issue =>{
            return issue.fields.customfield_11272.value.toLowerCase() === 'ehr';
        })
    return EHRIssueList;
}

const getPMIssueList=async(IssueList)=>{
    let PMIssueList=[];
        PMIssueList=IssueList.filter(issue =>{
            return issue.fields.customfield_11272.value.toLowerCase() === 'pm';
        })
    return PMIssueList;
}

const getQCDRIssueList=async(IssueList)=>{
    let QCDRIssueList=[];
        QCDRIssueList=IssueList.filter(issue =>{
            return issue.fields.customfield_11415.value.toLowerCase() === 'qcdr';
        })
    return QCDRIssueList;
}

const getNBIRIssueList=async(IssueList)=>{
    let NBIRIssueList=[];
        NBIRIssueList=IssueList.filter(issue =>{
            return issue.fields.customfield_11415.value.toLowerCase() === 'nbir';
        })
    return NBIRIssueList;
}

const getMeasureStatus = async (req, res, next) => {

    //let temp = { "errorMessages": ["Remove JIRA call."], "warningMessages": [] };

    return null;
    // return {
    //     "errorMessages": ["Remove JIRA call."],
    //     "warningMessages": []
    // };

    // let requestBody = req.body;

    // let JQL = `project = ${requestBody.project} AND issuetype = ${requestBody.issueType} AND created >= ${requestBody.startDate} AND created <= ${requestBody.endDate} ${requestBody.measureName ? `AND 'Measure ID' = ${requestBody.measureName}` : ''} AND cf[11209] ~ "${requestBody.practiceId}"`  //AND 'Measure ID'=${requestBody.measureName}
    // requestBody.jql = JQL;
    // delete requestBody.project;
    // delete requestBody.issueType;
    // delete requestBody.startDate;
    // delete requestBody.endDate;
    // delete requestBody.practiceId;
    // delete requestBody.measureName;

    // requestBody.fields = [
    //     "status",
    //     "customfield_11314"
    // ];

    // requestBody = JSON.stringify(requestBody);
    // let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    // var headers = Helper.getJsonHeader();
    // var options = {
    //     url: Common.GenerateUrl("getTypeTicketsForPracticeAndCustomers", process.env.UNIT),
    //     method: 'POST',
    //     headers: headers,
    //     body: requestBody,
    //     auth: auth
    // };

    // let returnVal = await Helper.genericRestCall(options);
    // if (returnVal.hasOwnProperty('errorMessage')) {
    //     Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting practice status", "error");
    // }
    // else
    //     Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "got measure status", "success");
    // return returnVal;
}


const getmeasurestatusbymeasureset = async (req, res, next) => {

    console.log(" Step 1: Call Receive.")
    let returnValue={
        data:'',
        error:''
    }

    let requestBody = req.body;

    console.log(" Step 2: Request Body", req.body);

    let validateInput = await validation.validateInputGetMeasurestatusbymeasureset(requestBody);

    console.log(" Step 3: validateInput.", validateInput)

    if (!validateInput.isValidSchema) {
        throw new Error(validateInput.message);
    }

    console.log(" Step 4: validateInput Validated Successfully.")

    // if(Helper.isNullOrUndefined(req.body.measureSetId))
    //     throw new Error("measureSetId is required.");
    //get the measures on the basis of measureset if user is authorized for given measure set
    let measures;
    if(!Helper.isNullOrUndefined(req.body.measureSetId))
        measures= await Common.GetMeasureList(req);
    else if(Helper.isNullOrUndefined(req.body.measureSetId) && req.body.measureNo)
        measures= [...new Set(req.body.measureNo)];

    console.log(" Step 5: Getting Measure List.", JSON.stringify(measures));

    let JQL = `project = ${requestBody.project} 
    AND issuetype = ${requestBody.issueType} 
    AND created >= ${requestBody.startDate} 
    AND created <= ${requestBody.endDate} 
    ${measures.length > 0 ? `AND 'Measure ID' in (${measures.toString()})` : ''} 
    AND cf[11209] ~ "${requestBody.practiceId}"`;

    console.log(" Step 6: JQL.", JQL);

    requestBody.jql = JQL;
    delete requestBody.project;
    delete requestBody.issueType;
    delete requestBody.startDate;
    delete requestBody.endDate;
    delete requestBody.practiceId;
    delete requestBody.measureName;
    delete requestBody.measureSetId;
    delete requestBody.measureidIn;
    delete requestBody.measureNo;
    

    requestBody.fields = [
        "status",
        "customfield_11314"
    ];

    requestBody = JSON.stringify(requestBody);
    console.log(" Step 7: Request Body.", requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getTypeTicketsForPracticeAndCustomers", process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };

    console.log(" Step 8: GenerateJIRAAuthToken complete.");
    console.log(options);

    let returnVal = await Helper.genericRestCall(options);
    if (JSON.parse(returnVal).hasOwnProperty('errorMessages')) {
        returnValue.data = null;
        returnValue.error = JSON.parse(returnVal).errorMessages;
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting practice status", "error");
    }
    else {
        returnValue.data = JSON.parse(returnVal);
        returnValue.error = null;
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "got measure status", "success");
    }
    console.log(" Step 9: genericRestCall complete.");    
    return JSON.stringify(returnValue);
}

const getCustomerStatus = async (req, res, next) => {
    let practiceId = req;
    requestBody = {};
    //let JQL = `issuetype = ${requestBody.issueType} AND cf[11209] ~ '${requestBody.practiceId}'`
    let JQL = `type = Customer  AND cf[11209] ~ ${practiceId} order by createddate desc`
    requestBody.jql = JQL;

    delete requestBody.issueType;
    delete requestBody.practiceId;
    delete requestBody.project;
    delete requestBody.startDate;
    delete requestBody.endDate;

    requestBody.fields = [
        "status"
    ];

    requestBody = JSON.stringify(requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getTypeTicketsForPracticeAndCustomers", process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);

    returnVal = JSON.parse(returnVal);
    //deleting all the response expect first (latest)
    if(returnVal.issues.length > 1){
        returnVal.issues.length=1;
    }

    returnVal = JSON.stringify(returnVal);
    
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting customer status", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Got customer status Successfully", "success");
    return returnVal;
}

const getPracticeDetails = async (req, res, next) => {
    let requestBody = {};
    let JQL = `issuetype = Customer AND cf[11209] ~ '${req}'`
    requestBody.jql = JQL;
    requestBody.fields = [
        "reporter"
    ];

    requestBody = JSON.stringify(requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getTypeTicketsForPracticeAndCustomers", process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);
    let ParsedReturnVal = JSON.parse(returnVal)
    if (ParsedReturnVal.issues[0]) {
        if (returnVal.hasOwnProperty('errorMessage')) {
            Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting practice status", "error");
        }
        else
            Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Got practice status Successfully", "success");
        return JSON.stringify(ParsedReturnVal.issues[0].fields.reporter.accountId);
    }
    else {
        if (returnVal.hasOwnProperty('errorMessage')) {
            Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in Ticket Creation", "error");
        }
        else
            Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Got practice status Successfully", "success");
        return constants.noTicket.NO_RECORDS_FOUND;
    }
}

function createJQL(body) {
    let JQL = `project = ${body.project} AND issuetype = ${body.issueType} AND created >= ${body.startDate}  AND created <= ${body.endDate} AND reporter in (${body.reporters}) order by created DESC`
    return JQL;
}

const getPracticeStatusCustomerWorkflow = async (req, res, next) => {

    let practiceId=req.body.practiceId;

    if(practiceId == null || practiceId == "" || practiceId == undefined){
        throw new Error("practiceId is mandatory.");   
    }

    
    requestBody = {};
    //let JQL = `issuetype = ${requestBody.issueType} AND cf[11209] ~ '${requestBody.practiceId}'`
    let JQL = `type = Customer  AND cf[11209] ~ ${practiceId} order by createddate desc`
    requestBody.jql = JQL;

    
    delete requestBody.practiceId;
    

    requestBody.fields = [
        "status","customfield_11283"
    ];

    requestBody = JSON.stringify(requestBody);
    let auth = Common.GenerateJIRAAuthToken(process.env.UNIT);
    var headers = Helper.getJsonHeader();
    var options = {
        url: Common.GenerateUrl("getTypeTicketsForPracticeAndCustomers", process.env.UNIT),
        method: 'POST',
        headers: headers,
        body: requestBody,
        auth: auth
    };

    let returnVal = await Helper.genericRestCall(options);

    returnVal = JSON.parse(returnVal);
    //deleting all the response expect first (latest)
    if(returnVal.issues.length > 1){
        returnVal.issues.length=1;
    }

    returnVal = JSON.stringify(returnVal);
    
    if (returnVal.hasOwnProperty('errorMessage')) {
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Issue in getting customer status", "error");
    }
    else
        Logger.addLog(options, req.body, { info: JSON.parse(returnVal) }, "Got customer status Successfully", "success");
    return returnVal;
}

module.exports = {
    createTicket,
    listCustomerTypeTicket,
    getUserIssue,
    getIssueComments,
    addIssueComments,
    createIssue,
    getTypeTicketsForPracticeAndCustomers,
    searchTicket,
    getAllTransitionsOfATicket,
    getPracticeStatus,
    getMeasureStatus,
    getmeasurestatusbymeasureset,
    getPracticeStatusCustomerWorkflow
};