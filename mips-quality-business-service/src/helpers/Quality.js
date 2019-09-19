const Data = require("./Data");
const uuidv1 = require('uuid/v1');
const Criteria = require("../helpers/Criteria")

class Quality {
    async list(input, cols) {
        var args = {
            input: {
                criteria: input.criteria
            }
        }
        if (input.criteria === undefined) {
            args.input.criteria = Criteria.build(input);
        }
        let result = await Data.select("profilequality", args, cols);
        if (result.data.select) {
            return result.data.select.rows;
        } else {
            return Error("No data found!");
        }
    }

    async listEquivalenMeasures(input, cols) {
        var args = {}
        // if (input.criteria === undefined) {
        //     args.input.criteria = Criteria.build(input);
        // }
        let result = await Data.select("equivalentmeasure", args, cols);
        if (result.data.select) {
            return result.data.select.rows;
        } else {
            return Error("No data found!");
        }
    }

    async save(input) {
        var exist = await this.measureExist(input);
        try {
            if (exist == 0 && input.selected === true) {
                let args = {
                    input: {
                        profileid: input.profileid,
                        tinsplitid: input.tinsplitid,
                        measureno: input.measureno
                    }
                }
                // insert it does not exist
                var result = await Data.insert("profilequality", args);
                if (result.data.insert) {
                    var id = result.data.insert;
                    if (id > 0) {
                        return {
                            id: uuidv1(),
                            type: "Success",
                            reason: ""
                        }
                    }
                } else {
                    return {
                        id: uuidv1(),
                        type: "Failed",
                        reason: "Unable to insert data!"
                    }
                }
            } else if (exist > 0 && input.selected === false) {
                //remove if exist
                let args = {
                    input: {
                        criteria: [
                            {
                                column: "profileid",
                                cop: 'eq',
                                value: input.profileid
                            },
                            {
                                lop: 'AND',
                                column: "tinsplitid",
                                cop: 'eq',
                                value: input.tinsplitid
                            },
                            {
                                lop: 'AND',
                                column: "measureno",
                                cop: 'eq',
                                value: input.measureno
                            }
                        ]
                    }
                }

                var result = await Data.delete("profilequality", args);
                if (result.data.delete) {
                    var id = result.data.delete;
                    if (id > 0) {
                        return {
                            id: uuidv1(),
                            type: "Success",
                            reason: ""
                        }
                    } else {
                        return {
                            id: uuidv1(),
                            type: "Failed",
                            reason: "Unable to delete data!"
                        }
                    }
                } else {
                    return {
                        id: uuidv1(),
                        type: "Failed",
                        reason: "Unable to delete data!"
                    }
                }
            } else {
                return {
                    id: uuidv1(),
                    type: "Failed",
                    reason: "Quality measure already exist!"
                }
            }
        } catch (err) {
            return {
                id: uuidv1(),
                type: "Failed",
                reason: err.message
            }
        }
    }
    async tinSplitExist(id, profileid) {
        var criteria = [{
            column: "id",
            cop: 'eq',
            value: id
        },
        {
            lop: 'AND',
            column: "profileid",
            cop: 'eq',
            value: profileid
        }];

        var count = await Data.count("profiletinsplit", criteria);
        if (count) {
            return count;
        } else {
            return 0;
        }
    }


    async profileExist(id) {
        var criteria = [{
            column: "id",
            cop: 'eq',
            value: id
        }];

        var count = await Data.count("profile", criteria);
        if (count) {
            return count;
        } else {
            return 0;
        }
    }

    async virtualProfileList(id) {
        var criteria = [{
            column: "profileid",
            cop: 'eq',
            value: id
        }];

        let args = {
            input: {
                criteria: criteria
            }
        }
        let cols = ['{ name: "practiceuid"}', '{ name: "provideruid"}']
        try {
            var result = await Data.select("virtualprofilepracticeprovider", args, cols);
            if (result.data.select) {
                return result.data.select.rows;
            } else {
                return null;
            }
        } catch (err) {
            throw err;
        }
    }

    async measureExist(input) {
        var profileid = input.profileid;
        var tinsplitid = input.tinsplitid;
        var measureno = input.measureno;

        var criteria = [{
            column: "profileid",
            cop: 'eq',
            value: profileid
        },
        {
            lop: 'AND',
            column: "tinsplitid",
            cop: 'eq',
            value: tinsplitid
        },
        {
            lop: 'AND',
            column: "measureno",
            cop: 'eq',
            value: measureno
        }];

        return await Data.count("profilequality", criteria);
    }

    async profile(id, tinsplitid) {
        var criteria = [{
            column: "id",
            cop: 'eq',
            value: id
        },
        {
            column: "tinsplitid",
            cop: 'eq',
            value: tinsplitid,
            lop: 'AND'
        }];
        let args = {
            input: {
                criteria: criteria
            }
        }
        let cols = ['{ name: "calendarid"}', '{ name: "reportingtypeid"}', '{ name: "practiceid"}', '{ name: "measuresetid"}', '{ name: "measuresetuid"}', '{ name: "practiceuid"}', '{ name: "providerid"}', , '{ name: "provideruid"}', '{ name: "npi"}', '{ name: "fromdate"}', '{ name: "todate"}']
        var result = await Data.select("profiles", args, cols);
        if (result.data.select) {
            return result.data.select.rows[0];
        } else {
            return null;
        }
    }

    async saveQualityscore(input,legacy) {
        let args = {
            input: {
                criteria: [
                    {
                        column: "profileid",
                        cop: 'eq',
                        value: input.profileid
                    },
                    {
                        lop: 'AND',
                        column: "id",
                        cop: 'eq',
                        value: input.tinsplitid
                    }
                ],
                qualityscore: input.qualityscore
            }
        }

        if(legacy){
            args.input.updatedbyuid=input.updatedbyuid
        }else{
            args.input.updatedbyuid=input.updatedbyid
        }

        var result = await Data.update("profiletinsplit", args);
        return input;
    }

    async getQualityScore(input) {

        var criteria = [
            {
                column: "profileid",
                cop: 'eq',
                value: input.profileid
            },
            {
                lop: 'AND',
                column: "id",
                cop: 'eq',
                value: input.tinsplitid
            }
        ];

        let args = {
            input: {
                criteria: criteria
            }
        }

        let columns = [
            '{ name: "qualityscore"}'
        ];
        let result = await Data.select("profiletinsplit", args, columns);
        if (result.data.select) {
            return result.data.select.rows[0];
        } else {
            return Error("No data found!");
        }
    }

}
module.exports = new Quality();