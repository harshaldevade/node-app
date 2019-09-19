
module.exports.Measuresets = {
  getMeasuresetCorrectFunctionName: `query{measuresets(input:{submissionkeyid:1,id:1,unit:\"ABFM\"}){id,measuresetid,unit}}`,
  getMeasuresetInCorrectFunctionName:`query{measureset(input:{submissionkeyid:1,id:1,unit:\"ABFM\"}){id,measuresetid,unit}}`,
  getMeasuresetMissingInputParameters:`query{measuresets(input:{submissionkeyid:1}){id,measuresetid,unit}}`,
  getMeasuresetWrongParameters:`query{measuresets(input:{submissionkeyid:1,id:1,unit:ABFM}){id,measuresetid,unit}}`
};

