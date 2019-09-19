const Validate = require("../strategies/validate");
const Measureset = require("../helpers/Measureset");

module.exports = {
    queries: {
        measuresets: async (_, args, ctx, info) => {
            let returnObject = [];
            let unit = ctx.request.headers["unit"];
            let legacy = JSON.parse(ctx.request.headers["legacy"]);
            args.input.unit = unit;
            var userid;
            if (legacy) {
                userid = ctx.request.headers["request-user-id"];

            } else {
                userid = parseInt(ctx.request.headers["request-user-id"]);

            }

            let masterMeasureSet = await Measureset.getMasterMeasureSet(userid, legacy, ctx.request.headers)


            if (masterMeasureSet && masterMeasureSet !== null) {
                let rows = await Measureset.list(args, info);
                if (legacy) {
                    if (rows) {
                        rows = rows.filter(measureset => measureset.measuresetuid != null)
                    }
                }
                if (rows && rows.length > 0) {

                    // rows.forEach(element => {
                    //     let findMeasureSet = [];
                    //     let measureSetName = "";
                    //     if (legacy) {
                    //         findMeasureSet = masterMeasureSet.filter(x => x.id === element.measuresetuid);
                    //     }
                    //     else {
                    //         findMeasureSet = masterMeasureSet.filter(x => x.id === element.measuresetid);
                    //     }
                    //     element.name = findMeasureSet.length > 0 ? findMeasureSet.name : "";

                    //     returnObject.push(element);
                    // });

                    masterMeasureSet.forEach(element => {

                        if (legacy) {
                            findMeasureSet = rows.filter(x => x.measuresetuid.toLowerCase() === element.id.toLowerCase());
                        }
                        else {
                            findMeasureSet = rows.filter(x => x.measuresetid === element.id);
                        }

                        if (findMeasureSet.length > 0) {
                            findMeasureSet.forEach(x => {
                                x.name=element.name
                                returnObject.push(x);
                            })
                        }
                    });

                } else {
                    return Error("No data found!");
                }
            }
            else {
                return Error("No data found!");
            }

            return returnObject;
        }
    }
}