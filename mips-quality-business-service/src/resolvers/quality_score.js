const Validate = require("../strategies/validate");
const Quality = require("../helpers/Quality");
const Helper = require("../helpers/Helper")
const QualityScore = require("../helpers/QualityScore");
const epCapture = require("../helpers/ep_quality");

module.exports = {
    queries: {
        quality_score: async (_, args, ctx, info) => {        
            var bonus = 0;
            var output = { highPriorityBonus: 0, outcomeBonus: 0, endtoendBonus: 0, smallPracticeBonus: 0, points: 0, total: 0 };
            try {
                var schema = await Validate.validate("qualityscore", args.input);
                if (schema.valid === false) {
                    return Error(schema.error);
                }
                var legacy = JSON.parse(ctx.request.headers["legacy"]);
                var userid;
                if (legacy) {
                    userid = ctx.request.headers["request-user-id"];
                    args.input.createdbyuid = userid
                } else {
                    userid = parseInt(ctx.request.headers["request-user-id"]);
                    args.input.createdbyuid = userid
                }

                var cols = ['{ name: "measureno" }'];
                var input = {
                    criteria: [
                        {
                            column: "profileid",
                            cop: 'eq',
                            value: args.input.profileid
                        },
                        {
                            lop: 'AND',
                            column: "tinsplitid",
                            cop: 'eq',
                            value: args.input.tinsplitid
                        }
                    ]
                }
                let profile = await Quality.profile(args.input.profileid, args.input.tinsplitid);
                let rows = await Quality.list(input, cols);
                let unit = ctx.request.headers["unit"];
                let calendarid = profile.calendarid;
                let method = args.input.submissionmethod;
                let certified = args.input.certified;
                let type = profile.reportingtypeid;
                let profileonnpi = args.input.profileonnpi;
                let virtualProfiles = [], practice_uids = [], provider_uids = [];
                if (profileonnpi) {
                    try {
                        virtualProfiles = await Quality.virtualProfileList(args.input.profileid);
                        if (virtualProfiles) {
                            practice_uids = [...new Set(virtualProfiles.map(x => x.practiceuid))].filter(x => x !== undefined);
                            provider_uids = [...new Set(virtualProfiles.map(x => x.provideruid))].filter(x => x !== undefined);
                        }
                    } catch (err) {

                    }
                }

                var measureSetId;
                if (rows) {
                    if (rows.length > 0) {
                        measureSetId = legacy ? profile.measuresetuid : profile.measuresetid;
                        let measure_list = await QualityScore.measureList(userid, measureSetId, legacy, ctx.request.headers);

                        let measures = rows.map(x => {
                            return measure_list.find(y => {
                                return y.measureno === x.measureno;
                            });
                        });

                        var selectedMeasures = [];
                        measures.forEach(x => {
                            if (x) {
                                var strata;
                                if (legacy) {
                                    strata = measure_list.filter(y => {
                                        return y.parentmeasureid === x.uid;
                                    });
                                } else {
                                    strata = measure_list.filter(y => {
                                        return y.parentmeasureid === x.id;
                                    });
                                }

                                if (strata) {
                                    if (strata.length > 0) {
                                        selectedMeasures.push({ ...x, strata: true });
                                        if (strata) {
                                            strata.forEach(z => {
                                                selectedMeasures.push({ ...z, strata: true })
                                            });
                                        }
                                    } else {
                                        selectedMeasures.push({ ...x, strata: false })
                                    }
                                } else {
                                    selectedMeasures.push({ ...x, strata: false })
                                }
                            }
                        });
                        var list = await Promise.all(selectedMeasures.map(async x => {
                            let lvInput;
                            if (profileonnpi) {
                                if (type == 1) {
                                    lvInput = {
                                        fromdate: profile.fromdate.split("T")[0],
                                        todate: profile.todate.split("T")[0],
                                        measureno: x.uid,
                                        npi: `${profile.npi}`,
                                        flag: "QCNR",
                                        isPatientSpecific: x.ispatientspecific
                                    }
                                } else {
                                    lvInput = {
                                        practiceuids: practice_uids.join(","),
                                        provideruids: provider_uids.join(","),
                                        fromdate: profile.fromdate.split("T")[0],
                                        todate: profile.todate.split("T")[0],
                                        measureno: x.uid,
                                        flag: "QCNR",
                                        isPatientSpecific: x.ispatientspecific
                                    }
                                }
                            } else {
                                if (legacy) {
                                    lvInput = {
                                        practiceuid: profile.practiceuid,
                                        provideruid: profile.provideruid,
                                        fromdate: profile.fromdate.split("T")[0],
                                        todate: profile.todate.split("T")[0],
                                        measureno: x.uid,
                                        unit: unit,
                                        flag: "QCNR",
                                        isPatientSpecific: x.ispatientspecific
                                    }
                                } else {
                                    lvInput = {
                                        practiceid: profile.practiceid,
                                        providerid: profile.providerid,
                                        fromdate: profile.fromdate.split("T")[0],
                                        todate: profile.todate.split("T")[0],
                                        measureno: x.measureno,
                                        unit: unit,
                                        flag: "QCNR",
                                        isPatientSpecific: x.ispatientspecific
                                    }
                                }
                            }
                            var measure_performance;
                            if (profileonnpi) {
                                measure_performance = await QualityScore.npiBasePerformance(lvInput, type, userid, ctx.request.headers);
                            } else {
                                measure_performance = await QualityScore.performance(lvInput, type, userid, legacy, ctx.request.headers);
                            }

                            if (measure_performance) {
                                return { ...x, performance: measure_performance.EntityAverage, numerator: measure_performance.Numerator, denominator: measure_performance.Denominator, 
                                    numException: measure_performance.NumException, numExclusion: measure_performance.NumExclusion, denomException: measure_performance.DenomException,  denomExclusion:  measure_performance.DenomExclusion};
                            }
                        }));

                        let non_strata = list.filter(x => {
                            return x && x.strata === false;
                        });
                        var strata = list.filter(x => {
                            return x && x.strata === true;
                        });

                        if (strata) {
                            strata.forEach(x => {
                                if (x.parentmeasureid === undefined || x.parentmeasureid === null) {
                                    let sumOfNumerators = 0;                            
                                    let sumOfDenominators = 0;
                                    let sumOfDenomException = 0;                            
                                    let sumOfDenomExclusion = 0;
                                    let weighted = 0;
                                    let simpleStrata = 0;
                                    let sumOfPerformance = 0;
                                    let strata1;
                                    switch (x.strataaveragetype) {
                                        case 1:
                                            strata.forEach(y => {
                                                if (y.parentmeasureid === x.id) {
                                                    sumOfNumerators += y.numerator;
                                                    sumOfDenominators += y.denominator;
                                                    sumOfDenomException += y.denomException;
                                                    sumOfDenomExclusion += y.denomExclusion;
                                                    if (y.denominator > 0) {
                                                        sumOfPerformance += ((y.numerator / y.denominator) * 100);
                                                    }
                                                }
                                            });
                                            simpleStrata = sumOfPerformance / strata.filter(x => x.parentmeasureid != null).length;
                                            strata1 = { ...x };
                                            strata1.numerator = sumOfNumerators;
                                            strata1.denominator = sumOfDenominators;
                                            strata1.denomException = sumOfDenomException;
                                            strata1.denomExclusion = sumOfDenomExclusion;                                            
                                            strata1.performance = parseFloat(parseFloat(simpleStrata).toFixed(2));
                                            non_strata.push(strata1);

                                            break;
                                        case 2:
                                            strata.forEach(y => {
                                                if (y.parentmeasureid === x.id) {
                                                    sumOfNumerators += y.numerator;
                                                    sumOfDenominators += y.denominator;
                                                    sumOfDenomException += y.denomException;
                                                    sumOfDenomExclusion += y.denomExclusion;
                                                }
                                            });
                                            if (sumOfNumerators > 0 && sumOfDenominators > 0) {
                                                weighted = (sumOfNumerators / sumOfDenominators) * 100;
                                            }
                                            weighted = Number.isInteger(weighted) ? weighted : parseFloat(weighted).toFixed(2);
                                            strata1 = { ...x };
                                            strata1.numerator = sumOfNumerators;
                                            strata1.denominator = sumOfDenominators;
                                            strata1.denomException = sumOfDenomException;
                                            strata1.denomExclusion = sumOfDenomExclusion; 
                                            strata1.performance = isNaN(weighted) ? 0 : weighted;
                                            non_strata.push(strata1);

                                            break;
                                        case 3:
                                            var children = strata.find(y => {
                                                return y.parentmeasureid === x.id && y.strataaveragetype === 3;
                                            });
                                            let performance = 0;
                                            if (children.numerator > 0 && children.denominator > 0) {
                                                performance = (children.numerator / children.denominator) * 100;
                                            }
                                            strata1 = { ...x };
                                            strata1.numerator = children.numerator;
                                            strata1.denominator = children.denominator;
                                            strata1.denomException = children.denomException;
                                            strata1.denomExclusion = children.denomExclusion; 
                                            strata1.performance = performance;
                                            non_strata.push(strata1);
                                            break;
                                    }
                                }
                            });
                        }
                        non_strata = await Promise.all(non_strata.map(async x => {
                            var decile = await QualityScore.decile(x.measureno, calendarid, unit, method, certified);
                            var input = {
                                profileid: args.input.profileid,
                                tinsplitid: args.input.tinsplitid,
                                measureno: x.measureno
                            }
                            var epCols = ['{ name: "ep"}', '{ name: "epexception"}']
                            var ep = await epCapture.single(input, epCols);

                            /*var calc = {
                                range: decile,                            
                                performance: x.performance,
                                denominator: x.denominator,
                                isinverse: x.isinverse,
                                ishighpriority: x.ishighpriority,
                                isoutcome: x.isoutcome,
                                istoppedout: x.istoppedout,
                                iscehrt: args.input.certified,
                                issmallpractice: args.input.isSmallPractice,
                                ep: ep,
                                perform: x
                            }*/

                            var calc = {
                                range: decile,
                                ...x,
                                iscehrt: args.input.certified,
                                issmallpractice: args.input.isSmallPractice,
                                ep: ep
                            };

                            var res = QualityScore.calculate(calc);
                            res.total = parseFloat(res.total);
                            return { ...x, performance: x.performance, numerator: x.numerator, denominator: x.denominator, ...res };
                        }));

                        non_strata = Helper.sort(non_strata, 'total', false);

                        var idx = 0;
                        var outcome = 0;
                        var highPriority = 0;
                        var top6Measures = [];
                        non_strata.forEach(x => {
                            if (idx <= 5) {
                                top6Measures.push(x);
                            } else {
                                return;
                            }
                            idx++;
                        });
                        idx = 0;
                        top6Measures.forEach(x => {
                            output.points += (x.point === null || x.point === undefined) ? 0 : x.point;
                        });

                        non_strata.forEach(x => {
                            if (x.denominator >= 20) {
                                if (x.isoutcome) {
                                    outcome++;
                                } else if (x.ishighpriority === true && x.isoutcome === false) {
                                    highPriority++;
                                }
                            }
                        });

                        if (outcome === 0 && highPriority >= 1) {
                            output.highPriorityBonus = (highPriority - 1) * 1;
                        } else {
                            if (outcome > 1) {
                                output.outcomeBonus = (outcome - 1) * 2;
                            }
                            if (outcome === 1 && highPriority >= 1) {
                                output.highPriorityBonus = highPriority * 1;
                            } else if (outcome > 1 && highPriority >= 1) {
                                output.highPriorityBonus = (highPriority) * 1;
                            }
                        }

                        if (args.input.isSmallPractice) {
                            output.smallPracticeBonus = 6;
                        }

                        if (certified) {
                            if (top6Measures.length <= 6) {
                                output.endtoendBonus = top6Measures.length * 1;
                            }
                        }

                        bonus = (output.highPriorityBonus + output.outcomeBonus);
                        if (bonus > 6) {
                            bonus = 6
                        }
                        output.total = (bonus + output.smallPracticeBonus + output.endtoendBonus + output.points);
                        return output;
                    } else {
                        return Error("No data found!");
                    }
                } else {
                    return Error("No data found!");
                }
            } catch (err) {
                return Error(err.message);
            }
        }
    }
}