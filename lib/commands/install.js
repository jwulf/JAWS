'use strict';

/**
 * JAWS Command: install
 * - Fetches an jaws-module from another github repo and installs it locally
 */

var JawsError = require('../jaws-error'),
  Promise = require('bluebird'),
  path = require('path'),
  fs = require('fs'),
  del = require('del'),
  wrench = require('wrench'),
  shortid = require('shortid'),
  Download = require('Download');

Promise.promisifyAll(fs);


/**
 * Install Files
 */

function _installFiles(url, rootPath) {
  return new Promise(function(resolve, reject) {

    // Check Project Exists
    if (!rootPath) {
      reject(new JawsError(
        'Could\'nt find your JAWS Project.  Are you sure you are in the right directory?',
        JawsError.errorCodes.UNKNOWN
      ));
    }

    // Inform
    console.log('Downloading and installing module...');

    // Prepare URL
    var repo = {};
    url = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/'); //TODO: why not regex?
    repo.owner = url[1];
    repo.repo = url[2];
    repo.branch = 'master';

    if (~repo.repo.indexOf('#')) {
      url[2].split('#');
      repo.repo = url[2].split('#')[0];
      repo.branch = url[2].split('#')[1];
    }

    // Throw error if invalid url
    if (url[0] !== 'github.com' || !repo.owner || !repo.repo) {
      reject(new JawsError(
        'Must be a github url in this format: https://github.com/jaws-stack/JAWS',
        JawsError.errorCodes.UNKNOWN
      ));
    }

    // Prepare Download url
    var downloadUrl = 'https://github.com/' + repo.owner + '/' + repo.repo + '/archive/' + repo.branch + '.zip';

    // Make a temporary directory for the module
    var tempDir = 'temp-' + shortid.generate();
    var tempDirPath = path.join(rootPath, tempDir);

    // Download module
    new Download({
        timeout: 30000,
        extract: true,
        strip: 1,
        mode: '755',
      })
      .get(downloadUrl)
      .dest(tempDirPath)
      .run(function(error) {

        if (error) {
          console.error('Module Download and installation failed.');
          reject(error);
        }

        // Fetch module's jaws.json
        try {
          var jawsJson = require(tempDirPath + '/jaws.json');
        } catch (e) {

          // Remove module and report if malformed
          return del([tempDirPath], {
            force: true,
          }, function(error) {
            if (error) {
              console.error(error);
            }

            reject(e);
          });

        }

        var modulePath = path.join(rootPath, 'back', jawsJson.name);

        // Handle according to module profile
        if (['lambda', 'lambdaGroup'].indexOf(jawsJson.profile) > -1) {

          // If folder exists, create unique module folder name
          if (fs.existsSync(modulePath)) {
            for (var i = 2; i < 500; i++) {
              if (!fs.existsSync(modulePath + '-' + i)) {
                jawsJson.name = jawsJson.name + '-' + i;
                modulePath = path.join(rootPath, 'back', jawsJson.name);
                break;
              }
            }
          }

          // Copy folders into new module folder
          wrench.copyDirSyncRecursive(tempDirPath, modulePath, {
            forceDelete: false,
            excludeHiddenUnix: false,
            // filter: regexpOrFunction // A filter to match files against; if matches, do nothing (exclude).
          });

        } else if (jawsJson.profile === 'front') {
          //TODO: implement
        } else if (jawsJson.profile === 'project') {
          //TODO: implement after v1
        } else {
          reject(new JawsError('This module has an unknown profile', JawsError.errorCodes.UNKNOWN));
        }

        // Delete temp directory
        del([tempDirPath], {
          force: true,
        }, function(error) {

          if (error) {
            reject(error);
          }

          console.log('Module successfully installed');
          resolve(modulePath);
        });
      });
  });
}


/**
 * Save CloudFormation Snippet
 */

function _saveCfTemplate(modulePath) {
  return new Promise(function(resolve, reject) {


    // TODO: Implement

    resolve(modulePath);
  });
}


/**
 * Save Swagger Template
 */

function _saveSwaggerTemplate(modulePath) {
  return new Promise(function(resolve, reject) {


    // TODO: Implement

    resolve();
  });
}


module.exports = function(JAWS) {

  JAWS.install = function(url, save) {

    if (!save) {
      return _installFiles(url, JAWS._meta.projectRootPath).then();
    } else {
      return _installFiles(url, JAWS._meta.projectRootPath)
        .then(_saveCfTemplate)
        .then(_saveSwaggerTemplate);
    }

  };
};
