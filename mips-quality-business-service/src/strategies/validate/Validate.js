// Checks date format in mm/dd/yyyy format.
const isNumber = (input) => {
    if (isNaN(Number(input))) {
        return false;
    } else {
        return true;
    }
}
const isDate = (properties, schema) => {
    var pattern = new RegExp(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/\d{4}$/);
    var fields = [];

    properties.forEach(field => {
        if (!isNullOrEmpty(schema[field])) {
            if (pattern.test(schema[field]) === false) {
                fields.push(field);
            }
        }
    });

    if (fields.length <= properties.length && fields.length !== 0) {
        return { valid: false, error: `${fields.join(",")} in mm/dd/yyyy format!` };
    } else {
        return { valid: true, error: "" };
    }
}

// Checks date time in mm/dd/yyyy hh:mm:ss format.
const isDateTime = (properties, schema) => {
    var pattern = new RegExp(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\d{4} [0-2]\d:[0-5]\d:[0-5]$/);
    var fields = [];

    properties.forEach(field => {
        if (!isNullOrEmpty(schema[field])) {
            if (pattern.test(schema[field]) === false) {
                fields.push(field);
            }
        }
    });

    if (fields.length <= properties.length && fields.length !== 0) {
        return { valid: false, Error: `${fields.join(",")} in mm/dd/yyy hh:mm:ss format!` };
    } else {
        return { valid: true, Error: "" };
    }
}

const dateCompare = (from, to, operator) => {

    var timestamp;
    if (!isNullOrEmpty(from)) {
        timestamp = Date.parse(from);
        var fdate, tdate;
        if (isNaN(timestamp)) {
            return Error("Invalid from date!")
        } else {
            fdate = new Date(from);
        }
    }
    if (!isNullOrEmpty(to)) {
        timestamp = Date.parse(to);
        if (isNaN(timestamp)) {
            return Error("Invalid to date!")
        } else {
            tdate = new Date(to);
        }
    }

    var flag = true;
    if (!isNullOrEmpty(from) && !isNullOrEmpty(from)) {
        switch (operator) {
            case ">":
                flag = (tdate > fdate);
                break;
            case ">=":
                flag = (tdate >= fdate);
                break;
            case "<":
                flag = (tdate < fdate);
                break;
            case "<=":
                flag = (tdate <= fdate);
                break;
            case "=":
                flag = (tdate === fdate);
                break;
        }
    }
    return flag;
}

// Checks maximum length is greated the expected length.
const isMaxLength = (properties, schema, len) => {
    var fields = [];
    properties.forEach(field => {
        if (!isNullOrEmpty(schema[field])) {
            if (typeof schema[field] === "number") {
                var sval = String(schema[field]);
                if (sval.length > len) {
                    fields.push(field);
                }
                fields.push(field);
            } else {
                if (schema[field].length > len) {
                    fields.push(field);
                }
            }
        }
    });

    if (fields.length <= properties.length && fields.length !== 0) {
        return { valid: false, Error: `${fields.join(",")} maximum length must be ${len}!` };
    } else {
        return { valid: true, Error: "" };
    }
}

const isValidLength = (input, operator, len) => {
    var flag = true;
    if (!isNullOrEmpty(input)) {
        if (typeof input === "string") {
            switch (operator) {
                case ">":
                    flag = (input.length > len);
                    break;
                case ">=":
                    flag = (input.length >= len);
                    break;
                case "<":
                    flag = (input.length < len);
                    break;
                case "<=":
                    flag = (input.length <= len);
                    break;
                case "=":
                    flag = (input.length === len);
                    break;
            }
        } else {
            var sval = String(input);
            switch (operator) {
                case ">":
                    flag = (sval.length > len);
                    break;
                case ">=":
                    flag = (sval.length >= len);
                    break;
                case "<":
                    flag = (sval.length < len);
                    break;
                case "<=":
                    flag = (sval.length <= len);
                    break;
                case "=":
                    flag = (sval.length === len);
                    break;
            }
        }
    }
    return flag;
}

// Checks maximum length is greated the expected length.
const isMinLength = (properties, schema, len) => {
    var fields = [];
    properties.forEach(field => {
        if (!isNullOrEmpty(schema[field])) {
            if (typeof schema[field] === "number") {
                var sval = String(schema[field]);
                if (sval.length !== len) {
                    fields.push(field);
                }
            } else {
                if (schema[field].length !== len) {
                    fields.push(field);
                }
            }
        }
    });

    if (fields.length <= properties.length && fields.length !== 0) {
        return { valid: false, Error: `${fields.join(",")} minimum length must be ${len}!` };
    } else {
        return { valid: true, Error: "" };
    }
}

// Checks input value is null, undefined or empty
const isNullOrEmpty = (input) => {
    var flag = false;
    if (input === undefined) {
        flag = true;
    } else if (input === null) {
        flag = true;
    } else {
        if (typeof input === "string" && input === "") {
            flag = true;
        }
    }
    return flag;
}
// Check required field
const isRequired = (mandatory, schema) => {
    var fields = [];
    mandatory.forEach(field => {
        if (isNullOrEmpty(schema[field])) {
            fields.push(field);
        }
    });

    if (fields.length <= mandatory.length && fields.length !== 0) {
        return { valid: false, Error: `${fields.join(",")} required!` };
    } else {
        return { valid: true, Error: "" };
    }
}

const isRequiredCriteria = (mandatory, criteria) => {
    var fields = [];
    if (criteria) {
        mandatory.forEach(field => {
            criteria.forEach(x => {
                if (x.column == field) {
                    if (isNullOrEmpty(x.value)) {
                        fields.push(field);
                    }
                } else {
                    fields.push(field);
                }
            });
        });
        if (fields.length <= mandatory.length && fields.length !== 0) {
            return { valid: false, Error: `${fields.join(",")} required!` };
        } else {
            return { valid: true, Error: "" };
        }
    } else {
        return { valid: false, Error: `Missing required criteria!` };
    }
}

const isDuplicateInObject = (propertyName, inputArray) => {
    var seenDuplicate = false,
        testObject = {};

    inputArray.map(function (item) {
        var itemPropertyName = item[propertyName];
        if (itemPropertyName in testObject) {
            testObject[itemPropertyName].duplicate = true;
            item.duplicate = true;
            seenDuplicate = true;
        }
        else {
            testObject[itemPropertyName] = item;
            delete item.duplicate;
        }
    });

    return seenDuplicate;
}

const validate = {
    isNumber,
    isDate,
    isDateTime,
    dateCompare,
    isNullOrEmpty,
    isRequired,
    isRequiredCriteria,
    isValidLength,
    isMaxLength,
    isMinLength,
    isDuplicateInObject
}
module.exports = validate;