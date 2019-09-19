const Data = require("./Data");
const uuidv1 = require('uuid/v1');
const validate = require("../strategies/validate/Validate");
const Criteria = require("../helpers/Criteria");
var headers = require("../header.json");
const Helper = require("./Helper");
class Measureset {
    async list(input,info) {        
        // var columns = [
        //     `{name:"id" }`,
        //     `{name:"submissionkeyid" }`,
        //     `{name:"measuresetid" }`,
        //     `{name:"isactive" }`,
        //     `{name:"unit" }`,
        //     `{name:"measuresetuid" }`,
        //     `{name:"practicetype" }`
        // ];
        
        var columns = Data.selectedFields(info,["name","listorder","isformips"]);

        let result = await Data.select("submissionkeymeasureset", input, columns);
        if (result.data) {
            if (result.data.select) {
                return result.data.select.rows;
            }
        }

        return null;
    }


    async getMasterMeasureSet(userid,legacy, request_header) {               
        var body = {};
       
        if (legacy) {
            body = {
                operationName: null,
                query: "query($input:GetMeasureSetsInput){  getMeasureSets(input:$input){  id    name    inactive     listorder  }}",
                variables: {
                    "input": {
                        "inactive": false,
                        "orderBy": 'listorder'                        
                    }
                }
            }
        }
        else {
            body = {
                operationName: null,
                query: "query($input:GetMeasureSetsInput){  getMeasureSets(input:$input){  id    name    inactive    isformips    listorder  }}",
                variables: {
                    "input": {
                        "inactive": false,
                        "orderBy": 'listorder',
                        "isformips": true
                    }
                }
            }
        }

        headers["request-user-id"] = userid;
        headers["request-action"] = "view";
        headers["request-user-auth-details"] = request_header["request-user-auth-details"];
        headers["request-resource"] = "measure";
        headers["request-resource-actions"] = "view";


        // headers["Authorization"]="MGE3MGYwYWQtMjVjNi00YjQ3LWFmYTgtYmI5Yzk3MjhhMWI2OjUxMWNiYjViLTJmZTAtNDgwYS1iZjE4LTA0ODU2YTMwZmZkOQ==";        
        // headers["Content-Type"]="application/json";                
        // headers["action"] = "view";
        // headers["unit"] = "view";
        // headers["origin"]="http://localhost:300";
         


        var url;
        if (legacy) {
            url = process.env.LEGACY_MEASURE_BL;
        } else {
            url = process.env.MEASURE_BL;
        }        
        
        let result = await Helper.post_with_headers(url, body, headers);
        if (result) {
            if (result.data) {
                return result.data.getMeasureSets;
            }
        }
        return null;
    }

}

module.exports = new Measureset();