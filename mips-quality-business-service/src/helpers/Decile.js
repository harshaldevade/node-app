const Data = require("./Data");
const uuidv1 = require('uuid/v1');

const validate = require("../strategies/validate/Validate");
class Decile {
    async list(criteria) {
        var args = {
            input: {
                criteria: criteria,
                orderBy: [{
                    column: "point",
                    asc: true
                }]
            }
        }

        var columns = [
            `{name:"point" }`,
            `{name:"rangestart" }`,
            `{name:"rangeend" }`,
            `{name:"method" }`
        ];
        let result = await Data.select("decile", args, columns);
        if (result.data) {
            if (result.data.select) {
                return result.data.select.rows;
            }
        }

        return null;
    }

}
module.exports = new Decile();