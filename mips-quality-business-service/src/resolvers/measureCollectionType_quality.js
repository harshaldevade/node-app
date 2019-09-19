const Validate = require("../strategies/validate");
const Data = require('../helpers/Data')
const measureCollectionType = require("../helpers/measureCollectionType")
module.exports = {
    mutations: {
        updatemeasureCollectionType: async (_, args, ctx, info) => {
            let unit = ctx.request.headers["unit"];
            let legacy = JSON.parse(ctx.request.headers["legacy"]);
            var schema = await Validate.validate("updatemeasurecollectiontype", { ...args.input, legacy: legacy });
            if (schema.valid === false) {
                return Error(schema.error);
            }
            if (legacy) {
                if (args.input.measuresetid) {
                    delete input.input.measuresetid;
                    //return Error('remove measuresetid.')
                }
            } else {
                if (args.input.measuresetuid) {
                    delete input.input.measuresetuid;
                    //return Error('remove measuresetuid.')
                }
            }
            var tinsplitid = await measureCollectionType.update(args, legacy);

            return tinsplitid

        }
    }

}
