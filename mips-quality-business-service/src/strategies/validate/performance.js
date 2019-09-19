
const validate = require("./Validate");
const BaseValidate = require("./BaseValidate");
var validator = require('validator');

class Performance extends BaseValidate {
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

        if (legacy && input.profileonnpi == false) {
            if ((input.providerid == undefined || input.providerid == null) || validator.isUUID(input.providerid)) {
                valid.push({ valid: true, error: "" });
            } else {
                valid.push({ valid: false, error: "provide correct providerid" });
            }
            if (validator.isUUID(input.practiceid)) {
                valid.push({ valid: true, error: "" });
            } else {
                valid.push({ valid: false, error: "provide correct practiceid" });
            }
            if (validator.isUUID(input.MeasureId)) {
                valid.push({ valid: true, error: "" });
            } else {
                valid.push({ valid: false, error: "provide correct MeasureId" });
            }
            // if (validate.isDate(['DurationFrom', 'DurationTo'], input).valid) {
            //     valid.push({ valid: true, error: "" });
            // } else {
            //     valid.push({ valid: false, error: "provide correct DurationFrom or DurationTo" });
            // }

        } else if (!legacy && input.profileonnpi == false) {

            if (isNaN(input.practiceid)) {
                valid.push({ valid: false, error: "provide correct practiceid" });
            } else {
                valid.push({ valid: true, error: "" });
            }
            if (input.providerid && isNaN(input.providerid)) {
                valid.push({ valid: false, error: "provide correct providerid" });
            } else {
                valid.push({ valid: true, error: "" });
            }
            // if (validate.isDate(['DurationFrom', 'DurationTo'], input).valid) {
            //     valid.push({ valid: true, error: "" });
            // } else {
            //     valid.push({ valid: false, error: "provide correct DurationFrom or DurationTo" });
            // }
        }
        else if (legacy && input.profileonnpi == true) {
            if ((input.NPI == undefined || input.NPI == null) || isNaN(input.NPI)) {
                valid.push({ valid: false, error: "provide correct NPI" });
            } else {
                valid.push({ valid: true, error: "" });
            }
            if (validator.isUUID(input.MeasureId)) {
                valid.push({ valid: true, error: "" });
            } else {
                valid.push({ valid: false, error: "provide correct MeasureId" });
            }
            // if (validate.isDate(['DurationFrom', 'DurationTo'], input).valid) {
            //     valid.push({ valid: true, error: "" });
            // } else {
            //     valid.push({ valid: false, error: "provide correct DurationFrom or DurationTo" });
            // }
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

module.exports = Performance;