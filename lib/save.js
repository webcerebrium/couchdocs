const fs = require('fs');
const request = require('request');

const parseArgs = require('minimist');
const commandArgs = parseArgs(process.argv, { '--': true });
const out = (...a) => { if (commandArgs.v || commandArgs.verbose) console.info(...a); };

const getAllDocs = (config, args) => {
  const headers = { "Content-Type": 'application/json' };
  return new Promise(
    (resolve, reject) => {
      const url = config.url + config.db + "/_all_docs?include_docs=true";
      out('url:', url);
      request({ url, headers }, (error, response, body) => {
	if (error) reject(error);
	const r = JSON.parse(body);
  	if (r.error) reject('ERROR: All Documents receiving error: ' + r.error);
	resolve(r);
      });
    }
  );
};

const saveAllDocuments = (couchCredentials, args) => {
  return new Promise(
    (resolve, reject) => {
      getAllDocs(couchCredentials, args)
	.then(response => {

	  if (response.error) { reject(response.error); return; }
	  if (!response.rows) { reject('Rows expected in response when trying to get all documents'); return; }
	  response.rows.forEach(row => {
		const doc = row.doc;
		if(!doc || !doc._id) return;
	        const fileName = escape(doc._id).replace(/\//g, '_') + ".json";
                delete doc._rev;
		fs.writeFileSync( fileName, JSON.stringify(doc, null, 2), 'utf8');
          });
	
        })
	.catch(reject);
    }
  );
};

module.exports = saveAllDocuments;