// helpers for get measures 
const Data = require("./Data");
const uuidv1 = require('uuid/v1');
const validate = require("../strategies/validate/Validate");
const criteriaBuilder = require('../helpers/Criteria')
require("dotenv").config();
const queries = require('../queries.json')
const parameterize = require('json-parameterization');
const Helper = require("../helpers/Helper");
const Quality = require("../helpers/Quality");

class GetMeasures {

    //function that clubs every call together 
    async returnMeasures(args, ctx, profile) {
        try {
            //call get measures
            let allMeasures = await this.getmeasures(args, ctx, profile)
            //build criteria
            //call helper for selected measures
            let selectedMeasures = await this.getselectedMeasures(args)
            let selectedMeasureArray;
            if (selectedMeasures && selectedMeasures.length)
                selectedMeasureArray = selectedMeasures.map(measure => measure.measureno)
            else
                selectedMeasureArray = [];
            //map selected measures
            let returnData = allMeasures.data.getMeasures.map(measure => {
                if (selectedMeasureArray.indexOf(measure.measureno) >= 0) {
                    measure.isselected = true;
                    return measure
                }
                else {
                    measure.isselected = false;
                    return measure
                }
            })

            //to get all the selected measures on the top.
            if (allMeasures) {
                let selectedMeasuresOnly = allMeasures.data.getMeasures.filter(measure => {
                    if (measure.isselected === true) {
                        return measure
                    }
                })
                let unSelectedMeasuresOnly = allMeasures.data.getMeasures.filter(measure => {
                    if (measure.isselected === false) {
                        return measure
                    }
                })
                returnData = [...selectedMeasuresOnly, ...unSelectedMeasuresOnly];
            }
            // if (args.input.selectedfirst && selectedMeasureArray.length > 0)
            //     returnData.sort(function (a, b) { return a.isselected - b.isselected }).reverse();

            //-----------------------------------------------------------------------------call helper for equivalent measures

            let listEquivalenMeasures = await this.getEquivalentMeasure(args, ctx, profile);
            if (!listEquivalenMeasures.message) {

                returnData = returnData.map(measure => {
                    let eqmeasure = listEquivalenMeasures.find((element) => {
                        return element.measureid.toLowerCase() == measure.measureno.toLowerCase()
                    });
                    if (eqmeasure)
                        measure.equivalentmeasure = eqmeasure.equivalentmeasureecqmid;
                    return measure;
                })

            }

            if (returnData.length)
                return returnData
            else
                return new Error('No data found.')
        }
        catch (e) {
            console.log(e);
        }

    }

    async getmeasures(args, ctx, profile) {
        let sentObj;
        let legacy = JSON.parse(ctx.request.headers["legacy"]);
        var headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Accept-Charset": "utf-8",
            "request-user-id": ctx.request.headers["request-user-id"],
            "request-action": "view"
        }
        try {
            sentObj = `{
                    measuresetid: ${legacy ? '"' + args.input.measuresetid + '"' : args.input.measuresetid},
                    inactive: ${args.input.inactive ? args.input.inactive : false},
                    orderBy: ${args.input.orderBy ? args.input.orderBy : "listorder"}
              }`

            var input = {
                inputs: `( input: ${sentObj})`
            }
            var obj = parameterize(queries.reportingtype.getMeasures, input)

            let providers = {};
            providers = await Helper.post(legacy ? process.env.LEGACY_GETMEASURES_BY_MEASUREID :
                process.env.PEGASUS_GETMEASURES_BY_MEASUREID, obj, headers)
            return providers;
        }
        catch (e) {
            throw new Error(e);
        }

    }

    async getselectedMeasures(args, ctx, profile) {
        let columns = [
            '{ name: "measureno"}',
        ];
        args.input.criteria = [{
            column: "profileid",
            cop: 'eq',
            value: args.input.profileid
        },
        {
            lop: 'AND',
            column: "tinsplitid",
            cop: 'eq',
            value: args.input.tinsplitid
        }]
        let selectedMeasures = await Quality.list(args.input, columns);
        return selectedMeasures;
    }

    async getEquivalentMeasure(args, ctx, profile) {
        let columns = [
            '{ name: "measureid"}',
            '{ name: "equivalentmeasureecqmid"}'
        ];
        // args.input.criteria = [{
        //     column: "measureid",
        //     cop: 'eq',
        //     value: args.input.profileid
        // }]
        let selectedMeasures = await Quality.listEquivalenMeasures(args.input, columns);
        return selectedMeasures;
    }

}
module.exports = new GetMeasures();