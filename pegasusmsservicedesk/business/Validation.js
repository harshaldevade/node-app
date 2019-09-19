require("dotenv").config();
const Helper = require("./HelperFunctions");
const parameterize = require('json-parameterization');


const validateInputGetMeasurestatusbymeasureset = obj => {
    let returnValue = {
        isValidSchema: true,
        message: ""
    }
    if(!hasKey(obj, 'project')){
        returnValue.isValidSchema = false;
        returnValue.message = "Project parameter is mandatory."

    }
    if(!hasKey(obj, 'issueType')){
        returnValue.isValidSchema = false;
        returnValue.message = "issueType parameter is mandatory."
    }
    if(!hasKey(obj, 'startDate')){
        returnValue.isValidSchema = false;
        returnValue.message = "startDate parameter is mandatory."
    }
    if(!hasKey(obj, 'endDate')){
        returnValue.isValidSchema = false;
        returnValue.message = "endDate parameter is mandatory."
    }
    if(!hasKey(obj, 'practiceId')){
        returnValue.isValidSchema = false;
        returnValue.message = "practiceId parameter is mandatory."
    }
    if(!hasKey(obj, 'measureSetId') && !hasKey(obj, 'measureNo')){
        returnValue.isValidSchema = false;
        returnValue.message = "measureSetId or measureNo parameter is mandatory."
    }
    return returnValue;

}

function hasKey(obj, key) {
    return Object.keys(obj).indexOf(key) !== -1
}

module.exports ={
    validateInputGetMeasurestatusbymeasureset
}