const Helper = require("./Helper");
require("dotenv").config();
class Data {
    fields(info) {
        var columns = [];
        var operation = info.operation;
        var selections = operation.selectionSet.selections[0].selectionSet.selections;
        selections.forEach(field => {
            columns.push(`{ name: "${field.name.value}" }`);
        });
        return columns;
    }

    selectedFields(info,fieldsToRemove) {
        var columns = [];
        var operation = info.operation;
        var selections = operation.selectionSet.selections[0].selectionSet.selections;
        selections.forEach(field => {
            if (fieldsToRemove.findIndex(x=>x===field.name.value) < 0) {
                columns.push(`{ name: "${field.name.value}" }`);
            }
        });
        return columns;
    }

    async count(entity, criteria) {
        var query = `{ count (input: { table: "${entity}"`;
        var clause = this.where(criteria);
        query += `,criteria: [${clause}]})}`;

        var body = { query: query };
        let result = await Helper.post(process.env.DATA_SERVICE_ENDPOINT, body);
        if (result.data) {
            if (result.data.count) {
                return result.data.count;
            } else {
                return 0;
            }
        }
    }

    // Query data using mips data service
    async select(entity, args, columns) {
        try {
            var query = "{ select (input: {";
            query += `tables: [{name: "${entity}",`;
            query += `columns: [${columns.join(",")}]}]`;

            if (args.input) {
                var criteria, orderBy;
                if (args.input.criteria) {
                    let input_criteria = args.input.criteria;
                    criteria = this.where(input_criteria);
                    query += `, criteria: [${criteria}]`;
                }

                if (args.input.orderBy) {
                    orderBy = this.order(args.input.orderBy);
                    query += `, orderBy: [${orderBy}]`;
                }

                let offset = args.input.offset;
                let limit = args.input.limit;
                if (limit) {
                    query += `, limit: ${limit}`;
                }
                if (offset) {
                    query += `, offset: ${offset}`;
                }
            }

            query += `}) { rows count  }}`;
            var body = { query: `${query}` };
            return Helper.post(process.env.DATA_SERVICE_ENDPOINT, body);
        } catch (err) {
            throw err;
        }
    }

    async distinct(entity, args, columns) {
        var query = "{ distinct (input: {";
        query += `tables: [{name: "${entity}",`
        query += `columns: [${columns.join(",")}]}]`;

        if (args.input) {
            var criteria, orderBy;

            if (args.input.criteria) {
                criteria = this.where(args.input.criteria);
                query += `, criteria: [${criteria}]`;
            }
            if (args.input.orderBy) {
                orderBy = this.order(args.input.orderBy);
                query += `, orderBy: [${orderBy}]`;
            }

            let offset = args.input.offset;
            let limit = args.input.limit;
            if (limit) {
                query += `, limit: ${limit}`;
            }
            if (offset) {
                query += `, offset: ${offset}`;
            }
        }
        query += `}) { rows count  }}`;
        var body = { query: `${query}` };
        return Helper.post(process.env.DATA_SERVICE_ENDPOINT, body);
    }

    // Creates record using mips data service
    async insert(entity, args) {
        var icolumns = [];
        var ivalues = [];
        var keys = Object.keys(args.input);
        keys.forEach(key => {
            icolumns.push(`"${key}"`);
            if (typeof args.input[key] === "string") {
                ivalues.push(`"${args.input[key]}"`);
            } else {
                ivalues.push(args.input[key]);
            }
        });

        var query = `mutation { insert (input: {table: "${entity}",`;
        query += `columns: [${icolumns.join(",")}],`;
        query += `values: [${ivalues.join(",")}]`;
        query += `})}`;

        var body = { query: `${query}` };
        //console.log(body);
        return Helper.post(process.env.DATA_SERVICE_ENDPOINT, body);
    }

    // Updates record using mips data service
    async update(entity, args) {
        var ucolumns = [];
        var uvalues = [];
        var keys = Object.keys(args.input);
        keys.forEach(key => {
            if (key !== "criteria") {
                ucolumns.push(`"${key}"`);
                if (typeof args.input[key] === "string") {
                    uvalues.push(`"${args.input[key]}"`);
                } else {
                    uvalues.push(args.input[key]);
                }
            }
        });
        var query = `mutation { update (input: {table: "${entity}",`;
        query += `columns: [${ucolumns.join(",")}],`;
        query += `values: [${uvalues.join(",")}]`; `
        `
        if (args.input) {
            if (args.input.criteria) {
                var criteria = this.where(args.input.criteria);
                query += `, criteria: [${criteria}]`;
            }
        }
        query += `})}`;

        var body = { query: `${query}` };
        return Helper.post(process.env.DATA_SERVICE_ENDPOINT, body);
    }

    // Deletes record using data access service
    async delete(entity, args) {
        var query = `mutation { delete (input: {table: "${entity}"`;
        if (args.input) {
            if (args.input.criteria) {
                var criteria = this.where(args.input.criteria);
                query += `, criteria: [${criteria}]`;
            }
        }
        query += `})}`;
        var body = { query: `${query}` };
        return Helper.post(process.env.DATA_SERVICE_ENDPOINT, body);
    }

    // Execute simple database transaction using mips data service
    async simple(context) {
        var statements = [];
        if (context.insert) {
            statements.push(`insert: [${context.insert}] `);
        }

        if (context.update) {
            statements.push(`update: [${context.update}] `);
        }

        if (context.delete) {
            statements.push(`delete: [${context.delete}] `);
        }

        var query = `mutation { simple (input:{ ${statements.join(",")} }){  type table content } }`
        var body = { query: `${query}` };
        let result = await Helper.post(process.env.DATA_SERVICE_ENDPOINT, body);
        return result;
    }

    async complex(context) {
        var statements = [];
        if (context.insert) {
            statements.push(`insert: [${context.insert.join(",")}] `);
        }

        if (context.update) {
            statements.push(`update: [${context.update.join(",")}] `);
        }

        if (context.delete) {
            statements.push(`delete: [${context.delete.join(",")}] `);
        }

        var query = `mutation { complex (input:{ ${statements.join(",")} }){ id status reason } }`
        var body = { query: `${query}` };
        let result = await Helper.post(process.env.DATA_SERVICE_ENDPOINT, body);
        return result;
    }

    where(args) {
        var clause = [];
        args.forEach(criteria => {
            if (Array.isArray(criteria.value)) {
                if (criteria.lop) {
                    clause.push(`{column: "${criteria.column}", cop: ${criteria.cop}, lop: ${criteria.lop}, value: [${criteria.value}]}`);
                } else {
                    clause.push(`{column: "${criteria.column}", cop: ${criteria.cop}, value: [${criteria.value}]}`);
                }
            } else {
                if (criteria.lop) {
                    if (typeof criteria.value === "string") {
                        clause.push(`{column: "${criteria.column}", cop: ${criteria.cop}, lop: ${criteria.lop}, value: "${criteria.value}"}`);
                    } else {
                        clause.push(`{column: "${criteria.column}", cop: ${criteria.cop}, lop: ${criteria.lop}, value: ${criteria.value}}`);
                    }
                } else {
                    if (typeof criteria.value === "string") {
                        clause.push(`{column: "${criteria.column}", cop: ${criteria.cop}, value: "${criteria.value}"}`);
                    } else {
                        clause.push(`{column: "${criteria.column}", cop: ${criteria.cop}, value: ${criteria.value}}`);
                    }
                }
            }
        });
        return clause;
    }
    order(args) {
        var orderby = [];
        args.forEach(order => {
            orderby.push(`{column: "${order.column}", asc: ${order.asc}}`);
        });
        return orderby.join(",");
    }
    group(args) {
        var clause = "";
        args.forEach(group => {
            clause += `${group},`;
        });
        clause = clause.substr(0, clause.length - 1);
        return clause;
    }
}
module.exports = new Data();