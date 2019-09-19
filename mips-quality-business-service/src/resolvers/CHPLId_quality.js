const Validate = require("../strategies/validate");
const Helper = require("../helpers/Helper")
module.exports = {
    queries: {
        validateCHPLID: async (_, args, ctx, info) => {
            try {
                let url = process.env.CHPLID_ENDPOINT.replace('{0}', process.env.CHPLID_APIKEY).replace('{1}', args.chplId)
                let variable = await Helper.getJSON(url);
                //var checkEdition = JSON.parse(variable.toString())
                if (variable.products) {
                    return variable;
                }
                else {
                    return Error('Incorrect CERT ID.');
                }
            }
            catch (err) {
                return Error(err);
            }
        },

    }
}

