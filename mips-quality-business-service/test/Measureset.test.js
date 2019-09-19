const chai = require("chai");
const expect = chai.expect;
require("dotenv").config();
const queries = require("./Measureset_queries.js");

//Port on which the service is hosted
const url = `http://localhost:8002/mips-quality`;
const request = require('supertest')(url);

describe("getMeasuresetCorrectFunctionName test Query result", () => {
  it("should get me 200 with list of measure list- endpoint getMeasuresetCorrectFunctionName", done => {
    request
      .post("")
      .send({ query: `${queries.Measuresets.getMeasuresetCorrectFunctionName}` })
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

describe("getMeasuresetInCorrectFunctionName test Query result", () => {
  it("should get me 400 with incorrect function- endpoint getMeasuresetInCorrectFunctionName", done => {
    request
      .post("")
      .send({ query: `${queries.Measuresets.getMeasuresetInCorrectFunctionName}` })
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

describe("getMeasuresetMissingInputParameters test Query result", () => {
  it("should get me 404 with missing input parameter- endpoint getMeasuresetMissingInputParameters", done => {
    request
      .post("")
      .send({ query: `${queries.Measuresets.getMeasuresetMissingInputParameters}` })
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

describe("getMeasuresetWrongParameters test Query result", () => {
  it("should get me 404 with wrong parameter- endpoint getMeasuresetWrongParameters", done => {
    request
      .post("")
      .send({ query: `${queries.Measuresets.getMeasuresetWrongParameters}` })
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




















