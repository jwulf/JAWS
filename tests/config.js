'use strict';

let path = require('path'),
    AWS = require('aws-sdk');

// Require ENV lets, can also set ENV lets in your IDE
require('dotenv').config({path: path.join(__dirname, '.env'), silent: true});

process.env.JAWS_VERBOSE = true;

let config = {
  name: 'test-prj',
  domain: process.env.TEST_JAWS_DOMAIN,
  notifyEmail: 'tester@jawsstack.com',
  stage: 'unittest',
  region: 'us-east-1',
  stage2: 'unittest2',
  region2: 'us-west-2',
  iamRoleArnApiGateway: process.env.TEST_JAWS_APIGATEWAY_ROLE,
  iamRoleArnLambda: process.env.TEST_JAWS_LAMBDA_ROLE,
  profile: process.env.TEST_JAWS_PROFILE,
  noExecuteCf: (process.env.TEST_JAWS_NO_EXE_CF != "false"),
};

AWS.config.credentials = new AWS.SharedIniFileCredentials({
  profile: config.profile,
});

AWS.config.update({
  region: config.region,
});

module.exports = config;
