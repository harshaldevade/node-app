let Validate = require("../strategies/validate/index")
const measures = require("../helpers/getmeasures")


module.exports = {
    queries: {
        getmeasures: async (_, args, ctx, info) => {
            //validations of input and headers
            var header = await Validate.validate("header", ctx.request.headers);
            if (header.valid === false) {
                return Error(header.error);
            }
            var header = await Validate.validate("measure", { ...args.input, ...ctx.request.headers });
            if (header.valid === false) {
                return Error(header.error);
            }
            let result = await measures.returnMeasures(args, ctx, info);
            return result;
        }
    }
}