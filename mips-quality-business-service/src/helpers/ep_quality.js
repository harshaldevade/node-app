const Data = require("./Data");
const uuidv1 = require('uuid/v1');
const Criteria = require("../helpers/Criteria")

class epCapture {
    async list(input, cols) {
        var args = {
            input: {
                criteria: [{
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
                }]
            }
        }
        // if (input.criteria === undefined) {
        //     args.input.criteria = Criteria.build(input);
        // }
        let result = await Data.select("epcapture", args, cols);
        if (result.data.select) {
            return result.data.select.rows[0];
        } else {
            return Error("No data found!");
        }
    }

    async single(input, cols) {
        var args = {
            input: {
                criteria: [{
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
                }]
            }
        }        
        let result = await Data.select("epcapture", args, cols);
        if (result.data.select) {
            return result.data.select.rows[0];
        } else {
            return null;
        }
    }
    async save(input) {
        var epexp = input.epexception;
        epexp = epexp!== ""? parseInt(epexp): 0;
        if (epexp > input.ep) {
            return Error("The EP Exception should not be greater than EP.")
        }
        var exist = await this.measureExist(input);
        try {
            if (exist == 0) {
                let args = {
                    input: {
                        profileid: input.profileid,
                        tinsplitid: input.tinsplitid,
                        measureno: input.measureno,
                        ep: input.ep                        
                    }
                }
                if((input.epexception !== "" && input.epexception !== null)){
                    args.input.epexception = input.epexception;                    
                }
               
                // insert it does not exist
                var result = await Data.insert("epcapture", args);
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
            } else if (exist > 0) {
                //update if it exists
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
                            },
                        ],
                        ep: input.ep
                        //epexception: input.epexception!=="" || input.epexception!==null ? input.epexception : "null"
                    }
                }

                if((input.epexception !== "" && input.epexception !== null)){
                    args.input.epexception = input.epexception;                    
                }

                var result = await Data.update("epcapture", args);
                if (result.data.update) {
                    var id = result.data.update;
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
                            reason: "Unable to update data!"
                        }
                    }
                } else {
                    return {
                        id: uuidv1(),
                        type: "Failed",
                        reason: "Unable to update data!"
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

        return await Data.count("epcapture", criteria);
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

    async delete(input, cols) {
        var args = {
            input: {
                criteria: [{
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
                }]
            }
        }
        // if (input.criteria === undefined) {
        //     args.input.criteria = Criteria.build(input);
        // }
        let result = await Data.delete("epcapture", args);
        if (result.data.delete) {
            return result.data.delete;
        } else {
            return Error("No data found!");
        }
    }
}
module.exports = new epCapture();