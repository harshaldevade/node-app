const Quality = require("../helpers/Quality");
const Validate = require("../strategies/validate/index");

module.exports = {
    queries: {
        measures: async (_, args, ctx, info) => {
            var cols = ctx.db.fields(info);
            let rows = await Quality.list(args.input, cols);
            if (rows) {
                if (rows.length > 0) {
                    return rows;
                } else {
                    return Error("No data found!");
                }
            } else {
                return Error("No data found!");
            }
        },
        getqualityscore: async (_, args, ctx, info) => {
            let abc = await Quality.getQualityScore(args.input);
            console.log(abc);
            return abc;
        }
    },
    mutations: {
        save_measure: async (_, args, ctx, info) => {
            var schema = await Validate.validate("quality", args.input);
            if (schema.valid === false) {
                return Error(schema.error);
            }
            var legacy = JSON.parse(ctx.request.headers["legacy"]);
            if (legacy) {
                var userid = ctx.request.headers["request-user-id"];
                args.input.createdbyuid = userid
            } else {
                var userid = parseInt(ctx.request.headers["request-user-id"]);
                args.input.createdbyuid = userid
            }
            return await Quality.save(args.input);
        },
        save_qualityscore: async (_, args, ctx, info) => {
            var legacy = JSON.parse(ctx.request.headers["legacy"]);
            if (legacy) {
                var userid = ctx.request.headers["request-user-id"];
                args.input.updatedbyuid = userid
            } else {
                var userid = parseInt(ctx.request.headers["request-user-id"]);
                args.input.updatedbyid = userid
            }

            return await Quality.saveQualityscore(args.input,legacy);
        }
    }
}