
const validate = require("./Validate");
const BaseValidate = require("./BaseValidate");
var validator = require('validator');

class ValidateHeader extends BaseValidate {
    constructor() {
        super();
    }

    async validate(input) {
        var valid = [];
        var userid = input["request-user-id"];
        var legacy = false;
        if (validate.isNullOrEmpty(input["legacy"])) {
            valid.push({ valid: false, error: "Legacy required!" });
        } else {
            legacy = JSON.parse(input.legacy);
            valid.push({ valid: true, error: "" });
        }

        if (legacy) {
            if (validator.isUUID(userid)) {
                valid.push({ valid: true, error: "" });
            } else {
                valid.push({ valid: false, error: "Unauthorized Access!" });
            }
        } else {

            if (isNaN(userid)) {
                valid.push({ valid: false, error: "Unauthorized Access!" });
            } else {
                valid.push({ valid: true, error: "" });
            }
        }

        if (validate.isNullOrEmpty(input["unit"])) {
            valid.push({ valid: false, error: "Unit required!" });
        } else {
            valid.push({ valid: true, error: "" });
        }



        var one = valid.find(x => {
            return x.valid === false;
        });

        if (one) {
            if (one.valid) {
                return await { valid: true, error: "" };
            } else {
                return one;
            }
        } else {
            return await { valid: true, error: "" };
        }
    }
}

module.exports = ValidateHeader;