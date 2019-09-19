module.exports.Measures = {
    getMeasuresCorrectFunctionName: `query{getmeasures(input:{measuresetid:"3",profileid:1555,tinsplitid:326,calendarid:1}){id,measuredescription,system,cmsno,isselected,measureno}}`,
    getMeasuresInCorrectFunctionName: `query{getmeasure(input:{measuresetid:"3",profileid:1555,tinsplitid:326,calendarid:1}){id,measuredescription,system,cmsno,isselected,measureno}}`,
    getMeasuresMissingInputParameters: `query{getmeasures(input:{measuresetid:"3",profileid:1555,tinsplitid:326,calendarid:1}){id,measuredescription,system,cmsno,isselected,measureno}}`,
    getMeasuresWrongParameters: `query{getmeasures(input:{measureseid:"3",profileid:1555,tinsplitid:326,calendarid:1}){id,measuredescription,system,cmsno,isselected,measureno}}`
};