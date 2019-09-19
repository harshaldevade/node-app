var headers = require("../header.json");
const Decile = require("./Decile");
const Helper = require("./Helper")
require("dotenv").config();
class QualityScore {
    dataCompleteness(input) {
        if (input.ep) {
            if (input.ep.ep) {
                const Exceptions = input.denomException !== null ? input.denomException : 0;
                const Exclusions = input.denomExclusion !== null ? input.denomExclusion : 0;
                const PerformanceMet = input.numerator !== null ? input.numerator : 0;
                const Denominator = input.denominator !== null ? input.denominator : 0;
                const performanceNotMet = (Denominator - Exceptions - Exclusions - PerformanceMet);
                let dataCompletenessThreshold = ((PerformanceMet + performanceNotMet) / input.ep.ep) * 100;
                if (parseFloat(dataCompletenessThreshold) > 100) {
                    dataCompletenessThreshold = 100;
                }
                dataCompletenessThreshold = parseFloat(dataCompletenessThreshold).toFixed(2);
                return parseFloat(dataCompletenessThreshold);
            } else {
                return parseFloat("0");
            }
        } else {
            return parseFloat("0");
        }
    }

    calculate(input) {
        var range = input.range;
        var performance = input.performance;
        var denominator = input.denominator;
        var isinverse = input.isinverse;
        var istoppedout = input.istoppedout ? input.istoppedout : false;
        var iscehrt = input.iscehrt;
        var issmallpractice = input.issmallpractice;
        var dc = this.dataCompleteness(input);
        var point = 0;
        var points = { highPriorityBonus: 0 };
        let dcMet = false;
        if (iscehrt === false) {
            dcMet = (dc >= 60);
        }
        if (range === undefined || range === null) {
            if (denominator > 0 && denominator > 19) {
                points.point = 3;
                if (iscehrt === false) {
                    if (dcMet === false) {
                        if (issmallpractice) {
                            points.point = 3;
                        } else {
                            points.point = 1;
                        }
                    }
                }
            } else if (denominator > 0 && denominator < 20) {
                if (issmallpractice) {
                    points.point = 3;
                } else {
                    points.point = 1;
                    if (iscehrt === false) {
                        if (dcMet === true) {
                            points.point = 3;
                        } else {
                            points.point = 1;
                        }
                    }
                }
            }
            else {
                points.point = 0;
            }
            points.point = parseFloat(points.point);
            points.total = (parseFloat(points.highPriorityBonus) + parseFloat(points.point)).toFixed(1);
        } else if (range.length > 0) { // Decile Available
            var found = range.find(x => {
                return parseFloat(performance) >= parseFloat(x.rangestart) && parseFloat(performance) <= parseFloat(x.rangeend);
            });
            if (found) { // In Range
                if (isinverse) {
                    point = parseFloat(found.point) + (parseFloat(performance) - parseFloat(found.rangeend)) / (parseFloat(found.rangestart) - parseFloat(found.rangeend));
                } else {
                    if ((parseFloat(performance) - parseFloat(found.rangestart)) > 0 && (parseFloat(found.rangeend) - parseFloat(found.rangestart)) > 0) {
                        point = parseFloat(found.point) + (parseFloat(performance) - parseFloat(found.rangestart)) / (parseFloat(found.rangeend) - parseFloat(found.rangestart));
                    } else {
                        point = parseFloat(found.point);
                    }
                }
                if (denominator === 0) {
                    points.range = found.point;
                    points.point = parseFloat(isNaN(point) ? 0 : point);
                    if (points.point > 10) {
                        points.point = 10
                    }
                }
                else if (denominator > 0 && denominator < 20) {
                    if (issmallpractice) {
                        points.point = 3;
                    } else {
                        points.point = 1;
                        if (iscehrt === false) {
                            if (dcMet === true) {
                                points.point = 3;
                            } else {
                                points.point = 1;
                            }
                        }
                    }
                }
                else if (denominator > 0 && denominator > 19) {
                    points.point = parseFloat(isNaN(point) ? 0 : point);
                    if (points.point > 10) {
                        points.point = 10
                    }

                    if (iscehrt === false) {
                        if (dcMet === false) {
                            if (issmallpractice) {
                                points.point = 3;
                            } else {
                                points.point = 1;
                            }
                        }
                    }
                }

                points.point = parseFloat(parseFloat(points.point).toFixed(1));
                points.total = (parseFloat(points.highPriorityBonus) + parseFloat(points.point)).toFixed(1);
            } else { // Not In Range
                if (denominator > 0 && denominator > 19) {
                    points.point = 3;
                    if (iscehrt === false) {
                        if (dcMet === false) {
                            if (issmallpractice) {
                                points.performance = 3;
                            } else {
                                points.performance = 1;
                            }
                        }
                    }
                } else if (denominator > 0 && denominator < 20) {
                    if (issmallpractice) {
                        points.point = 3;
                    } else {
                        points.point = 1;
                        if (iscehrt === false) {
                            if (dcMet === true) {
                                points.performance = 3;
                            } else {
                                points.performance = 1;
                            }
                        }
                    }
                } else {
                    points.point = 0;
                }
                points.point = parseFloat(parseFloat(points.point).toFixed(1));
                points.total = (parseFloat(points.highPriorityBonus) + parseFloat(points.point)).toFixed(1);
            }
        }

        if (istoppedout) {
            if (parseFloat(points.total) >= parseFloat(7)) {
                points.total = 7;
            }
            if (parseFloat(points.point) >= parseFloat(7)) {
                points.point = 7;
            }
        }
        return points;
    }

    async decile(measureno, calendarid, unit, method, certified) {
        var criteria = [
            {
                column: 'calendarid',
                cop: 'eq',
                value: calendarid
            },
            {
                column: 'measureno',
                cop: 'eq',
                lop: 'AND',
                value: measureno
            },
            {
                column: 'unit',
                lop: 'AND',
                cop: 'eq',
                value: unit
            },
            {
                column: 'isactive',
                lop: 'AND',
                cop: 'eq',
                value: true
            }
        ];
        let decileRanges = await Decile.list(criteria);
        if (decileRanges && decileRanges.length > 0) {
            var deciles;
            if (method === 'EHR') {
                if (certified) {
                    deciles = decileRanges.filter(x => {
                        return x.method === "EHR"
                    });
                } else {
                    deciles = decileRanges.filter(x => {
                        return x.method === "Registry/QCDR";
                    });
                }
                if (deciles.length === 0) {
                    deciles = decileRanges.filter(x => {
                        return x.method === "Registry/QCDR";
                    });
                }
            }

            if (method === 'QCDR') {
                deciles = decileRanges.filter(x => {
                    return x.method === "Registry/QCDR";
                });
            }
            return deciles;
        } else {
            return null;
        }
    }

    async  measureList(userid, measureSetId, legacy, request_header) {
        var body = {};
        if (legacy) {
            body = {
                operationName: null,
                query: "query ($input: GetMeasuresInput) { getMeasures(input: $input) { uid parentmeasureid measureno system ispatientspecific type subtype unit isinverse istoppedout ishighpriority isoutcome, strataaveragetype, id } }",
                variables: {
                    "input": {
                        "measuresetid": measureSetId,
                        "inactive": false
                    }
                }
            }
        } else {
            body = {
                operationName: null,
                query: "query ($input: GetMeasuresInput) { getMeasures(input: $input) { id parentmeasureid measureno system ispatientspecific type subtype unit isinverse istoppedout ishighpriority isoutcome, strataaveragetype } }",
                variables: {
                    "input": {
                        "measuresetid": measureSetId,
                        "inactive": false
                    }
                }
            }
        }
        headers["request-user-id"] = userid;
        headers["request-action"] = "view";
        headers["request-user-auth-details"] = request_header["request-user-auth-details"];
        headers["request-resource"] = "measure";
        headers["request-resource-actions"] = "view";
        var url;
        if (legacy) {
            url = process.env.LEGACY_MEASURE_BL;
        } else {
            url = process.env.MEASURE_BL;
        }
        let result = await Helper.post_with_headers(url, body, headers);
        if (result) {
            if (result.data) {
                return result.data.getMeasures;
            }
        }
        return null;
    }

    async performance(args, type, userid, legacy, request_header) {
        var body;
        var parentEntityId = [];
        var parentEntityUId = args.practiceuid;
        var entityId = `${legacy ? args.provideruid : args.providerid}`;
        var entityName = "provider";
        try {
            if (legacy) {
                if (type === 1) {
                    body = {
                        operationName: null,
                        query: `query ($input:FilterMeasureInfoInput) { getMeasurePerformanceAverage (input: $input) {  Numerator Denominator NumException NumExclusion DenomException DenomExclusion EntityAverage }}`,
                        variables: {
                            input: {
                                ParentEntityUid: parentEntityUId,
                                ParentEntityName: "practice",
                                EntityName: entityName,
                                EntityId: entityId,
                                DurationFrom: args.fromdate,
                                DurationTo: args.todate,
                                Flag: args.flag,
                                MeasureId: args.measureno,
                                Unit: args.unit,
                                IsPatientSpecific: args.isPatientSpecific,
                                tinsplitid: args.tinsplitid
                            }
                        }
                    }
                } else {
                    body = {
                        operationName: null,
                        query: `query ($input:FilterMeasureInfoInput) { getMeasurePerformanceAverage (input: $input) {  Numerator Denominator NumException NumExclusion DenomException DenomExclusion EntityAverage }}`,
                        variables: {
                            input: {
                                ParentEntityUid: parentEntityUId,
                                ParentEntityName: "",
                                EntityName: "practice",
                                EntityId: parentEntityUId,
                                DurationFrom: args.fromdate,
                                DurationTo: args.todate,
                                Flag: args.flag,
                                MeasureId: args.measureno,
                                Unit: args.unit,
                                IsPatientSpecific: args.isPatientSpecific,
                                tinsplitid: args.tinsplitid
                            }
                        }
                    }
                }
            } else {
                if (type === 1) {
                    body = {
                        operationName: null,
                        query: `query ($input:FilterMeasureInfoInput) { getMeasurePerformanceAverage (input: $input) {  Numerator Denominator NumException NumExclusion DenomException DenomExclusion EntityAverage }}`,
                        variables: {
                            input: {
                                ParentEntityId: [args.practiceid],
                                ParentEntityName: "practice",
                                EntityName: entityName,
                                EntityId: entityId,
                                DurationFrom: args.fromdate,
                                DurationTo: args.todate,
                                Flag: args.flag,
                                MeasureId: args.measureno,
                                Unit: args.unit,
                                IsPatientSpecific: args.isPatientSpecific
                            }
                        }
                    }
                } else {
                    body = {
                        operationName: null,
                        query: `query ($input:FilterMeasureInfoInput) { getMeasurePerformanceAverage (input: $input) {  Numerator Denominator NumException NumExclusion DenomException DenomExclusion EntityAverage }}`,
                        variables: {
                            input: {
                                ParentEntityId: null,
                                ParentEntityName: "",
                                EntityName: "practice",
                                EntityId: `${args.practiceid}`,
                                DurationFrom: args.fromdate,
                                DurationTo: args.todate,
                                Flag: args.flag,
                                MeasureId: args.measureno,
                                Unit: args.unit,
                                IsPatientSpecific: args.isPatientSpecific
                            }
                        }
                    }
                }
            }
            headers["request-user-id"] = userid;
            headers["request-action"] = "view";
            headers["request-user-auth-details"] = request_header["request-user-auth-details"];
            headers["request-resource"] = "performance";
            headers["request-resource-actions"] = "view";
            var url;
            if (legacy) {
                url = process.env.LEGACY_PERFORMANCE_BL;
            } else {
                url = process.env.PERFORMANCE_BL;
            }
            let result = await Helper.post_with_headers(url, body, headers);
            if (result) {
                if (result.data) {
                    return result.data.getMeasurePerformanceAverage;
                } else {
                    return result.data;
                }
            } else {
                return result;
            }

        } catch (err) {
            return Error(err.message);
        }
    }

    async npiBasePerformance(args, type, userid, request_header) {
        var body;
        try {
            if (type === 1) {
                body = {
                    operationName: null,
                    query: `query ($input:FilterMeasureInfoInput) { getMeasurePerformanceAverage (input: $input) {  Numerator Denominator NumException NumExclusion DenomException DenomExclusion EntityAverage }}`,
                    variables: {
                        input: {
                            DurationFrom: args.fromdate,
                            DurationTo: args.todate,
                            Flag: args.flag,
                            MeasureId: args.measureno,
                            IsPatientSpecific: args.isPatientSpecific,
                            NPI: args.npi
                        }
                    }
                }
            } else {
                body = {
                    operationName: null,
                    query: `query ($input:FilterMeasureInfoInput) { getMeasurePerformanceAverage (input: $input) {  Numerator Denominator NumException NumExclusion DenomException DenomExclusion EntityAverage }}`,
                    variables: {
                        input: {
                            PracticeUids: args.practiceuids,
                            ProviderUids: args.provideruids,
                            DurationFrom: args.fromdate,
                            DurationTo: args.todate,
                            Flag: args.flag,
                            MeasureId: args.measureno,
                            IsPatientSpecific: args.isPatientSpecific
                        }
                    }
                }
            }
            headers["request-user-id"] = userid;
            headers["request-action"] = "view";
            headers["request-user-auth-details"] = request_header["request-user-auth-details"];
            headers["request-resource"] = request_header["request-resource"];
            headers["request-resource-actions"] = request_header["request-resource-actions"];
            var url = process.env.LEGACY_PERFORMANCE_BL;
            let result = await Helper.post_with_headers(url, body, headers);
            if (result) {
                if (result.data) {
                    return result.data.getMeasurePerformanceAverage;
                } else {
                    return result.data;
                }
            } else {
                return result;
            }

        } catch (err) {
            return Error(err.message);
        }
    }
}

module.exports = new QualityScore();