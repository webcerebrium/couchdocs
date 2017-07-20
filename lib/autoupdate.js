const PropertiesReader = require('properties-reader');
const request = require('request');
const parseArgs = require('minimist');
const commandArgs = parseArgs(process.argv, { '--': true });
const out = (...a) => { if (commandArgs.v || commandArgs.verbose) console.info(...a); };

const getCredentials = (args) => {
   const result = {
	url: 'http://localhost:5984/'
   };
   // trying to read properties from local .couchdocs file, if this is available
   if (fs.existsSync('./.couchdocs')) {
       const properties = PropertiesReader('./.couchdocs');
       if (properties.path('types')) {
		result.types = properties.get('autoupdate.db');
       }
   }
   return result;   
};





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



/*
const getDocumentId = (args) => {
  if (commandArgs.id) return commandArgs.id;
  const jsonFileName = args.file || args._[3];
  out('FileName=', jsonFileName);
  if (!jsonFileName) { throw 'ERROR: Json document is not provided'; }
  const buf = fs.readFileSync(jsonFileName, 'utf8');
  const doc = JSON.parse(buf);
  return doc._id || jsonFileName.replace(/\.json$/g, '').replace(/^\.\//, '');
};

const getDocumentFromFile = (args) => {
  const jsonFileName = args.file || args._[3];
  out('FileName=', jsonFileName);
  if (!jsonFileName) { throw 'ERROR: Json document was not found'; }
  const buf = fs.readFileSync(jsonFileName, 'utf8');
  return JSON.parse(buf);
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
      const headers = { "Content-Type": 'application/json' };
      const params = {
        url, headers, method, json: true, body: doc
      };
      request(params, (error, response, body) => {
	if (error) { reject(error); return; }
	const docResponse = body;
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
	  const _rev = doc._rev;
  	  const doc2upload = getDocumentFromFile(args);
	  if (_rev) {
            out('Revision:', _rev); 
            doc2upload._rev = _rev;
	  } 
          out("Document 2 Upload", doc2upload);
          uploadCouchDocument(couchCredentials, doc2upload)
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

*/

const autoupdate = (couchCredentials, args) => {
  return new Promise(
    (resolve, reject) => {
        console.log(couchCredentials);
	resolve({});
    }
  );
};


module.exports = autoupdate;