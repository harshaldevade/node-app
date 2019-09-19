const Validate = require("../strategies/validate");
const Decile = require("../helpers/Decile")
module.exports = {
    queries: {
        deciles: async (_, args, ctx, info) => {
            let unit = ctx.request.headers["unit"];
            let criteria = [
                {
                    column: 'calendarid',
                    cop: 'eq',
                    value: args.input.calendarid
                },
                {
                    column: 'measureno',
                    cop: 'eq',
                    lop: 'AND',
                    value: args.input.measureno
                },
                {
                    column: 'unit',
                    lop: 'AND',
                    cop: 'eq',
                    value: unit
                },
                {
                    column: 'isactive',
                    lop: 'AND',
                    cop: 'eq',
                    value: true
                }
            ]
            let decileRanges = await Decile.list(criteria)
            if (decileRanges && decileRanges.length > 0) {
                var deciles;
                if (args.input.submissionmethod === 'EHR') {
                    if (args.input.certified) {
                        deciles = decileRanges.filter(x => {
                            return x.method === "EHR"
                        });
                    } else {
                        deciles = decileRanges.filter(x => {
                            return x.method === "Registry/QCDR";
                        });
                    }
                    if (deciles.length === 0) {
                        deciles = decileRanges.filter(x => {
                            return x.method === "Registry/QCDR";
                        });
                    }
                }

                if (args.input.submissionmethod === 'QCDR') {
                    deciles = decileRanges.filter(x => {
                        return x.method === "Registry/QCDR";
                    });
                }

                return deciles.length > 0 ? deciles : null;
            } else {
                return null;
            }
        }
    },

}


