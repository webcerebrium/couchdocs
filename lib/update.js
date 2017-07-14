const fs = require('fs');
const request = require('request');

const parseArgs = require('minimist');
const commandArgs = parseArgs(process.argv, { '--': true });
const out = (...a) => { if (commandArgs.v || commandArgs.verbose) console.info(...a); };

const getDocumentId = (args) => {
  const jsonFileName = args.file || args._[3];
  out('FileName=', jsonFileName);
  if (!jsonFileName) { throw 'ERROR: Json document is not provided'; }
  const buf = fs.readFileSync(jsonFileName, 'utf8');
  const doc = JSON.parse(buf);
  return doc._id || jsonFileName.replace(/\.json$/g, '').replace(/^\.\//, '');
};

const getCouchDocument = (config, args) => {
  const headers = { "Content-Type": 'application/json' };
  return new Promise(
    (resolve, reject) => {
      const id = getDocumentId(args);
      out('_id', id);      
      if (!id) { reject('ERROR: Document _id cannot be detected from arguments'); return; }
      const url = id ? config.url + config.db + "/" + id : config.url + config.db;
      out('url:', url);
      request({ url, headers }, (error, response, body) => {
	if (error) reject(error);
	const doc = JSON.parse(body);
  	if (doc.error && doc.error !== 'not_found') reject('ERROR: Document receiving error: ' + doc.error);
	
	if (doc.error === 'not_found') {
           const jsonFileName = args.file || args._[3];
  	   const buf = fs.readFileSync(jsonFileName, 'utf8');
           resolve(JSON.parse(buf));
        } else {
	   resolve(doc);
        }
      });
    }
  );
};

const uploadCouchDocument = (config, doc) => {
  return new Promise(
    (resolve, reject) => {
      const payload = JSON.stringify(doc);
      const url = doc._id ? config.url + config.db + "/" + doc._id : config.url + config.db;
      const method = doc._id ? 'PUT' : 'POST';
      out('url:', url, 'method:', method);
      const headers = { "Content-Type": 'application/json', 'Content-Length': payload.length };
      request({ url, headers, method, body: payload }, (error, response, body) => {
	if (error) { reject(error); return; }
	const docResponse = JSON.parse(body);
	out(docResponse);
  	if (docResponse.error) { reject('ERROR: Document receiving error: ' + doc.error); return; }
	const newDoc = { _id: docResponse.id, _rev: docResponse.rev };
	Object.keys(doc).forEach(key => (newDoc[key] = doc[key]));
	resolve(newDoc);
      });
    }
  );
};


const writeDocumentJson = (name, doc, callback) => {
  fs.writeFile(name, JSON.stringify(doc, null, 2), {}, (err, data) => {
    if (err) throw err;
    if (typeof callback === 'function') callback(data);
  });  
};

const updateDocument = (couchCredentials, args) => {
  return new Promise(
    (resolve, reject) => {
      getCouchDocument(couchCredentials, args)
	.then(doc => {
          out("Document", doc);
	  const _rev = doc._rev;
	  if (_rev) {
            out('Revision:', _rev); 
	    doc._rev = _rev;
	  } 
          uploadCouchDocument(couchCredentials, doc)
	     .then((docResponse) => { 
		const jsonFileName = args.file || args._[3];
		delete docResponse._rev;
	        writeDocumentJson(jsonFileName, docResponse, () => (resolve(docResponse)));
	     })
	     .catch(reject);
        })
	.catch(reject);
    }
  );
};

module.exports = updateDocument;