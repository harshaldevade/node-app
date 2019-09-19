const Validate = require("../strategies/validate");
const SubmissionType = require("../helpers/SubmissionType");


module.exports = {
    mutations: {
        update_submissiontype: async (_, args, ctx, info) => {
            if (args.input.tinsplitid === 0) {
                return Error("tinsplitid should not be zero!");
            }

            return await SubmissionType.update(args.input);
        }
    }
}