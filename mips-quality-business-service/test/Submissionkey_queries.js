
module.exports.Submissionkey = {
    getSubmissionkeyCorrectFunctionName: `mutation{update_submissionkey(input: {id: 50,submissiontype:\"QCDR\",criteria:[{column: id, cop: eq, value: 50 }]}){id,submissiontype}}`,
    getSubmissionkeyInCorrectFunctionName:`mutation{updatesubmissionkey(input: {id: 50,submissiontype:\"QCDR\",criteria:[{column: id, cop: eq, value: 50 }]}){id,submissiontype}}`,
    getSubmissionkeyMissingInputParameters:`mutation{update_submissionkey(input: {id: 50,criteria:[{column: id, cop: eq, value: 50 }]}){id,submissiontype}}`,
    getSubmissionkeyWrongParameters:`mutation{update_submissionkey(input: {id: \"50\",submissiontype:\"QCDR\",criteria:[{column: id, cop: eq, value: 50 }]}){id,submissiontype}}`
  };
  
  