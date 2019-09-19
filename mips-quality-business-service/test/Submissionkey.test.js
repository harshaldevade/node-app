const chai = require("chai");
const expect = chai.expect;
require("dotenv").config();
const queries = require("./Submissionkey_queries.js");

//Port on which the service is hosted
const url = `http://localhost:8002/mips-quality`;
const request = require('supertest')(url);

describe("getSubmissionkeyCorrectFunctionName test Query result", () => {
    it("should get me 200 with Submission key- endpoint getSubmissionkeyCorrectFunctionName", done => {
      request
        .post("")
        .send({ query: `${queries.Submissionkey.getSubmissionkeyCorrectFunctionName}` })
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

describe("getSubmissionkeyInCorrectFunctionName test Query result", () => {
  it("should get me 400 withSubmission key incorrect function- endpoint getSubmissionkeyInCorrectFunctionName", done => {
    request
      .post("")
      .send({ query: `${queries.Submissionkey.getSubmissionkeyInCorrectFunctionName}` })
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

describe("getSubmissionkeyMissingInputParameters test Query result", () => {
  it("should get me 404 with missing input parameter- endpoint getSubmissionkeyMissingInputParameters", done => {
    request
      .post("")
      .send({ query: `${queries.Submissionkey.getSubmissionkeyMissingInputParameters}` })
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

describe("getSubmissionkeyWrongParameters test Query result", () => {
  it("should get me 404 with wrong parameter- endpoint getSubmissionkeyWrongParameters", done => {
    request
      .post("")
      .send({ query: `${queries.Submissionkey.getSubmissionkeyWrongParameters}` })
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

