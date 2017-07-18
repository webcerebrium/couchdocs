const request = require('request');
const parseArgs = require('minimist');
const commandArgs = parseArgs(process.argv, { '--': true });
const out = (...a) => { if (commandArgs.v || commandArgs.verbose) console.info(...a); };

const database = (config) => {

const upload = (requestBody) => {
  const headers = { "Content-Type": 'application/json' };
  return new Promise(
    (resolve, reject) => {
      const url = config.url + config.db + "/_bulk_docs";
      out('url:', url, 'method:', 'POST');
      request({ url, headers, method: 'POST', json: true, body: requestBody }, (error, response, body) => {
	if (error) { reject(error); return; }
	const doc = body;
  	if (doc.error) { reject('ERROR: Documents bulk upload error: ' + doc.error); return; }
        else resolve(doc);
      });
    }
  );
};


const create = () => {
  const headers = { "Content-Type": 'application/json' };
  return new Promise(
    (resolve, reject) => {
      const url = config.url + config.db;
      out('url:', url, 'method:', 'PUT');
      request({ url, headers, method: 'PUT' }, (error, response, body) => {
	if (error) { reject(error); return; }
	const doc = JSON.parse(body);
  	if (doc.error) { reject('ERROR: Database creation error: ' + doc.error); return; }
        else resolve(doc);
      });
    }
  );
};

const removeIfExists = () => {
  const headers = { "Content-Type": 'application/json' };
  return new Promise(
    (resolve, reject) => {
      const url = config.url + config.db;
      out('url:', url, 'method:', 'DELETE');
      request({ url, headers, method: 'DELETE' }, (error, response, body) => {
	const doc = JSON.parse(body); // not reacting on errors here
        resolve(doc);
      });
    }
  );
};

  return {  upload, create, removeIfExists };
};

module.exports = database;
