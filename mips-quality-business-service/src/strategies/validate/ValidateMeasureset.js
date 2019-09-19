const validate = require("./Validate");
const BaseValidate = require("./BaseValidate");
const Quality = require("../../helpers/Quality");

class ValidateMeasureset extends BaseValidate {
    constructor() {
        super()
    }
    async validate(input) {
        var valid = {};
        if (input.legacy) {
            if (!input.measuresetuid) {
                //throw new Error('measuresetuid is required.')
                return { valid: false, error: "measuresetuid is required." };
            }
            if (input.measuresetid) {
                delete input.input.measuresetid;
                //return Error('remove measuresetid.')
            }
        } else {
            if (!input.measuresetid) {
                // throw new Error('measuresetid is required.')
                return { valid: false, error: "measuresetid is required." };
            }
            if (input.measuresetuid) {
                delete input.input.measuresetuid;
                //return Error('remove measuresetuid.')
            }
        }
        return valid;
    }
}
module.exports = ValidateMeasureset;