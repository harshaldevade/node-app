const validate = require("./Validate");
const BaseValidate = require("./BaseValidate");
const Quality = require("../../helpers/Quality");

class ValidateQuality extends BaseValidate {
    constructor() {
        super()
    }
    async validate(input) {        
        if (input.profileid == 0) {
            return { valid: false, error: "profileid should not be zero!" };
        }

        if (input.tinsplitid == 0) {
            return { valid: false, error: "tinsplitid should not be zero!" };
        }

        if (validate.isNullOrEmpty(input.measureno)) {
            return { valid: false, error: "measureno should not be empty!" };
        }

        var exist = await Quality.profileExist(input.profileid);
        if (exist === 0) {
            return { valid: false, error: "Profile does not exist!" };
        }

        exist = await Quality.tinSplitExist(input.tinsplitid, input.profileid);
        if (exist === 0) {
            return { valid: false, error: "TIN Split does not exist!" };
        }
        return { valid: true, error: "" };
    }
}
module.exports = ValidateQuality;