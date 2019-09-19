const ep_quality = require("../helpers/ep_quality");
const Validate = require("../strategies/validate/index");

module.exports = {
    queries: {
        getEpAndEpException: async (_, args, ctx, info) => {
            var cols = ctx.db.fields(info);
            let rows = await ep_quality.list(args.input, cols);
            if (rows) {
                if (rows) {
                    return rows;
                } else {
                    return Error("No data found!");
                }
            } else {
                return Error("No data found!");
            }
        }
    },
    mutations: {
        saveEpAndEpException: async (_, args, ctx, info) => {
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
            return await ep_quality.save(args.input);
        },
        deleteEpAndEpException: async (_, args, ctx, info) => {
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
            return await ep_quality.delete(args.input);
        }
    }
}