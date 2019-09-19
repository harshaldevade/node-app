const performance = require("../helpers/performance");
const Validate = require("../strategies/validate/index");
const decile_range = require("./decile_quality")
const QualityScore = require("../helpers/QualityScore")

module.exports = {
    queries: {
        getMeasurePerformanceAverage: async (_, args, ctx, info) => {
            if (args.input.Unit == undefined)
                args.input.Unit = ctx.request.headers["unit"];
            var header = await Validate.validate("performance", { ...args.input, ...ctx.request.headers });
            if (header.valid === false) {
                return Error(header.error);
            }
            let legacy = JSON.parse(ctx.request.headers["legacy"]);
            var userid;
            if (legacy) {
                userid = ctx.request.headers["request-user-id"];
            } else {
                userid = parseInt(ctx.request.headers["request-user-id"]);
            }

            let decile = await decile_range.queries.deciles(_, args, ctx, info);
            let lvInput;
            if (args.input.profileonnpi) {
                if (args.input.reportingtypeid == 1) {
                    lvInput = {
                        fromdate: args.input.DurationFrom,
                        todate: args.input.DurationTo,
                        measureno: args.input.MeasureId,
                        npi: `${args.input.NPI}`,
                        flag: args.input.Flag,
                        isPatientSpecific: args.input.IsPatientSpecific
                    }
                } else {
                    lvInput = {
                        practiceuids: args.input.PracticeUids,
                        provideruids: args.input.ProviderUids,
                        fromdate: args.input.DurationFrom,
                        todate: args.input.DurationTo,
                        measureno: args.input.MeasureId,
                        flag: args.input.Flag,
                        isPatientSpecific: args.input.IsPatientSpecific
                    }
                }
            } else {
                if (legacy) {
                    lvInput = {
                        practiceuid: args.input.practiceid,
                        provideruid: args.input.providerid,
                        fromdate: args.input.DurationFrom,
                        todate: args.input.DurationTo,
                        measureno: args.input.MeasureId,
                        unit: args.input.Unit,
                        flag: args.input.Flag,
                        isPatientSpecific: args.input.IsPatientSpecific,
                        tinsplitid: args.input.tinsplitid
                    }
                } else {
                    lvInput = {
                        practiceid: Number(args.input.practiceid),
                        providerid: args.input.providerid,
                        fromdate: args.input.DurationFrom,
                        todate: args.input.DurationTo,
                        measureno: args.input.MeasureId,
                        unit: args.input.Unit,
                        flag: "QCNR",
                        isPatientSpecific: args.input.IsPatientSpecific
                    }
                }
            }
            let measure_performance;
            if (args.input.profileonnpi) {
                measure_performance = await QualityScore.npiBasePerformance(lvInput, args.input.reportingtypeid, userid, ctx.request.headers);
            } else {
                measure_performance = await QualityScore.performance(lvInput, args.input.reportingtypeid, userid, legacy, ctx.request.headers);
            }
            let returnObject = {
                DecileRange: decile,
                ...measure_performance
            }
            console.log(returnObject);
            return returnObject;

        }
    }
}