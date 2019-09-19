const chai = require("chai");
const expect = chai.expect;
require("dotenv").config();
const queries = require("./GetMeasures_queries");

//Port on which the service is hosted
const url = `http://localhost:8002/mips-quality`;
const request = require('supertest')(url);

describe("getMeasuresCorrectFunctionName test Query result", () => {
    it("should get me 200 with list of measure list- endpoint getMeasuresetCorrectFunctionName", done => {
        request
            .post("")
            .send({ query: `${queries.Measures.getMeasuresCorrectFunctionName}` })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                let response = res.body.data;
                done();
            });
    })

});

describe("getMeasuresInCorrectFunctionName test Query result", () => {
    it("should get me 400 with incorrect function- endpoint getMeasuresetInCorrectFunctionName", done => {
        request
            .post("")
            .send({ query: `${queries.Measures.getMeasuresInCorrectFunctionName}` })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                let response = res.body.data;
                done();
            });
    })
})

describe("getMeasuresMissingInputParameters test Query result", () => {
    it("should get me 404 with missing input parameter- endpoint getMeasuresetMissingInputParameters", done => {
        request
            .post("")
            .send({ query: `${queries.Measures.getMeasuresMissingInputParameters}` })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                let response = res.body.data;
                done();
            });
    })
})

describe("getMeasuresWrongParameters test Query result", () => {
    it("should get me 404 with wrong parameter- endpoint getMeasuresetWrongParameters", done => {
        request
            .post("")
            .send({ query: `${queries.Measures.getMeasuresWrongParameters}` })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                let response = res.body.data;
                done();
            });
    })
})
