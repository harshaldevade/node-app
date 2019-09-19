const validate = require("../strategies/validate/Validate");

module.exports = {
    build: (input) => {
        var criteria = [];
        var keys = Object.keys(input);
        var idx = 0;
        keys.forEach(key => {
            if (idx === 0) {
                if (!validate.isNullOrEmpty(input[key])) {
                    criteria.push({
                        column: key,
                        cop: 'eq',
                        value: input[key]
                    });
                }
            } else {
                if (!validate.isNullOrEmpty(input[key])) {
                    criteria.push({
                        column: key,
                        cop: 'eq',
                        lop: 'AND',
                        value: input[key]
                    });
                }
            }
            idx++;
        });
        return criteria;
    }
}