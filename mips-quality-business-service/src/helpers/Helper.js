var headers = require("../header.json");
const fetch = require('node-fetch');
class Helper {
    async get(url) {
        try {
            let response = await fetch(url, {
                method: 'get',
                headers: headers,
                timeout: 0,
                gzip: true
            });
            return await response.buffer();
        }
        catch (error) {
            console.log(error);
        }
    }
    async getJSON(url) {
        try {
            let response = await fetch(url, {
                method: 'get',
                headers: headers,
                timeout: 0,
                gzip: true
            });
            return await response.json();
        }
        catch (error) {
            throw error;
        }
    }
    async post(url, body, newHeaders) {
        try {
            let response = await fetch(url, {
                method: 'post',
                body: JSON.stringify(body),
                headers: newHeaders ? newHeaders : headers,
                timeout: 0,
                gzip: true
            });
            return await response.json();
        }
        catch (error) {
            throw error;
        }
    }

    async post_with_headers(url, body, header) {
        try {
            let response = await fetch(url, {
                method: 'post',
                body: JSON.stringify(body),
                headers: header,
                timeout: 0,
                gzip: true
            });
            return await response.json();
        }
        catch (error) {
            return (error);
        }
    }

    jsonToString(input) {
        var output = "";
        var keys = Object.keys(input);
        keys.forEach(key => {
            if (typeof input[key] === "string") {
                output += `${key}:"${input[key]}",`;
            } else {
                output += `${key}:${input[key]},`;
            }
        });
        output = output.substring(0, output.length - 1);
        return output;
    }
    extract(args) {
        var inputs = {};
        var other = args.input;
        var keys = Object.keys(args.input);
        if (args.input.orderBy) {
            //console.log(args.input.orderBy);
            delete other["orderBy"]
            inputs["orderBy"] = args.input.orderBy
        }
        return inputs;
    }


    /* Finds specific property based on input json */
    findProp(json, prop) {
        return json[prop];
    }

    /* Sort the json input based on the json property */
    sort(json, prop, asc) {
        var localJson = json.sort(function (a, b) {
            if (asc) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0)
            } else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0)
            }
        });
        return localJson;
    }

    dateConvert(input) {
        var dt = new Date(input);
        var converted = new Date(dt - (dt.getTimezoneOffset() * 60 * 1000));
        return converted.toISOString();
    }
    toDbDate(input) {
        var dt = new Date(input);
        var converted = new Date(dt - (dt.getTimezoneOffset() * 60 * 1000));
        return converted.toISOString().split("T")[0];
    }

    checkIfArrayIsUnique(myArray) {
        return myArray.length === new Set(myArray).size;
    }

}
module.exports = new Helper();
