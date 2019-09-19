const ValidateHeader = require("./ValidateHeader");
const ValidateQuality = require("./ValidateQuality");
const ValidateMeasureCollectionType = require("./ValidateMeasureCollectionType");
const ValidateMeasureset = require("./ValidateMeasureset");
const ValidateQualityScore = require("./ValidateQualityScore");
const Measure = require("./Measure");
const Performance = require("./performance");

class Validate {
    async validate(type, input) {
        let schema;
        switch (type) {
            case "header":
                schema = new ValidateHeader();
                break;
            case "quality":
                schema = new ValidateQuality();
                break;
            case "measuresets":
                schema = new ValidateMeasureset();
                break;
            case "updatemeasurecollectiontype":
                schema = new ValidateMeasureCollectionType();
                break;
            case "qualityscore":
                schema = new ValidateQualityScore();
                break;
            case "measure":
                schema = new Measure();
                break;

            case "performance":
                schema = new Performance();
                break;

        }
        return await schema.validate(input);
    }
}
module.exports = new Validate();