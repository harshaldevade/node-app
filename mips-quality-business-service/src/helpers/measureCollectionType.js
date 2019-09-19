const Data = require("./Data");
const uuidv1 = require('uuid/v1');

const validate = require("../strategies/validate/Validate");
class measureCollectionType {
    async update(args, legacy) {
        try {
            var context = { update: [], delete: [] };
            if (args.input.tinsplitid) {
                var criteria = [`{ column: "id", cop: eq, value: ${args.input.tinsplitid} }`];
                if (legacy) {
                    var columns = ["measuresetuid"];
                    var values = [args.input.measuresetuid];
                } else {
                    var columns = ["measuresetid"];
                    var values = [args.input.measuresetid];
                }

                context.update.push(`{table: "profiletinsplit", columns: ${[JSON.stringify(columns)]}, values: ${[JSON.stringify(values)]}, criteria: [${criteria}] }`);

                criteria = [`{ column: "tinsplitid", cop: eq, value: ${args.input.tinsplitid} }`];
                context.delete.push(`{table: "profilequality", criteria: [${criteria}]}`);
                let result = await Data.simple(context);
                var response;
                if (result.data) {
                    if (result.data.simple) {
                        var one = result.data.simple.find(x => {
                            if (x.content) {
                                x.content.id === undefined || x.content.id === null
                            } else {
                                x.content === undefined || x.content === null
                            }
                        });
                        if (one) {
                            response = {
                                id: uuidv1(),
                                status: "Failed",
                                reason: "Unable to complete transaction!",
                            };
                        } else {
                            response = {
                                id: uuidv1(),
                                status: "Success",
                                reason: "",
                            };
                        }
                        return response;
                    } else {
                        return {
                            id: uuidv1(),
                            status: "Failed",
                            reason: "Unable to delete tin data!",
                        };
                    }
                } else {
                    return {
                        id: uuidv1(),
                        status: "Failed",
                        reason: "Unable to delete tin data!",
                    };
                }
            } else {
                return Error("Profile does not exist!");
            }
        } catch (err) {
            return Error(err);
        }
    }

}
module.exports = new measureCollectionType();