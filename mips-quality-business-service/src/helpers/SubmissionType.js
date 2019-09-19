const Data = require("./Data");
const uuidv1 = require('uuid/v1');
const validate = require("../strategies/validate/Validate");

class SubmissionType {
    async update(input) {
        var criteria = [{ column: "id", cop: 'eq', value: input.tinsplitid }];
        var args = {
            input: {
                submissiontype: input.submissiontype,
                criteria: criteria
            }
        }
        let result = await Data.update("profiletinsplit", args);       
        if (result.data.update) {
            var id = parseInt(result.data.update[0]);
            if (id > 0) {
                return {
                    id: uuidv1(),
                    status: "Success",
                    reason: "",
                }
            }
            else {
                return {
                    id: uuidv1(),
                    status: "Failed",
                    reason: "Unable to update submission type!",
                }
            }
        } else {
            return {
                id: uuidv1(),
                status: "Failed",
                reason: "Unable to update submission type!",
            }
        }
    }
}

module.exports = new SubmissionType();