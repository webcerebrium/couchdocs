const fs = require('fs');
const PropertiesReader = require('properties-reader');
const request = require('request');
const parseArgs = require('minimist');
const commandArgs = parseArgs(process.argv, { '--': true });
const out = (...a) => { if (commandArgs.v || commandArgs.verbose) console.info(...a); };

const propertyToArray = (s) => {
    return s ? s.split(' ') : [];
};

const getAllProps = (obj) => {
    const res = {};
    Object.keys(obj).forEach(field => {
	res[field] = propertyToArray(obj[field]);
    });
    return res;
};

const loadMatchingRules = (path) => {
   // trying to read properties from local .couchdocs file, if this is available
   const properties = PropertiesReader( path + '/.couchdocs');
   const configCouchDocs = properties.path();
   const included = configCouchDocs.autoupdate ? getAllProps(configCouchDocs.autoupdate) : {};
   const excluded = configCouchDocs.excluded ? getAllProps(configCouchDocs.excluded) : {};
   return { included, excluded };   
};

const docMatchRules = (doc, rules) => {
   let matchExcluded = false;
   Object.keys(rules.excluded).forEach(field => {
      if (doc[field] && rules.excluded[field].indexOf(doc[field]) !== -1) { matchExcluded = true; }
   });
   if (matchExcluded) return false;
   let matchIncluded = false;
   Object.keys(rules.included).forEach(field => {
      if (doc[field] && rules.included[field].indexOf(doc[field]) !== -1) { matchIncluded = true; }
   });   
   return matchIncluded;
};

const upload = (config, requestBody) => {
  const headers = { "Content-Type": 'application/json' };
  return new Promise(
    (resolve, reject) => {
      if (!config.url || !config.db) { reject('ERROR: invalid database specified'); return; }

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

const getRevisionsMap = (config) => {
  return new Promise(
    (resolve, reject) => {
      // there could be multiple requests to compile a map for a huge database
      const url = config.url + config.db + "/_all_docs?limit=1000000";
      out('url:', url);
      request({ url, json: true, method: 'GET' }, (error, response, body) => {
	if (error) { reject(error); return; }
	const doc = body;
  	if (doc.error) { reject('ERROR: receiving revisions error: ' + doc.error); return; }
        const map = {};
	if (doc.rows) {
           for (let ri = 0; ri < doc.rows.length; ri++) { 
	       const row = doc.rows[ri];
	       if (row.id && row.value && row.value.rev) map[row.id] = row.value.rev;
	   }
	}
	resolve(map);
      });
    }
  );
};

const getDocsAtPath = (path, rules, revisions ) => {
  const inputPath = path ? path : './';
  return new Promise(
    (resolve, reject) => {
      let output = '{"docs":[\n';
      fs.readdir(inputPath, (err, items) => {
        if (err) { reject(err); return; }
        const it = items.filter(file => (file.indexOf('.json') !== -1 && file !== '_bulk_docs.json'));
        let index = 0;
        it.forEach((file) => { 
          const buff = fs.readFileSync(file);
          try { 
            const json = JSON.parse(buff);
            if (json && json.docs) {
              json.docs.forEach((doc, docIndex) => {

		// document in a local file batch
		if (docMatchRules(doc, rules)) {
		  out('MATCH _id=', doc._id, 'type=', doc.type);
		  // injecting revision from the map
		  if (revisions && doc._id && revisions[doc._id]) doc._rev = revisions[doc._id];
                  if (index > 0) { output += ',\n\n'; }
                  output += JSON.stringify(doc);
		  index ++;
                }
              });
              
            } else { 
              // single document
	      if (docMatchRules(json, rules)) {
		out('MATCH _id=', json._id, 'type=', json.type);
	      	if (revisions && json._id && revisions[json._id]) json._rev = revisions[json._id];
		if (index > 0) { output += ',\n\n'; }
	        output += JSON.stringify(json);
	        index ++;
              }
            }
          } catch (e) {
            console.error('ERROR IN', file, 'MESSAGE', e);
          } 
        });
        output += "\n]}\n";
        out("documents to be uploaded: " + index);
        resolve(output);
      });
  });
};

const autoupdate = (couchCredentials, path, args) => {
  return new Promise(
    (resolve, reject) => {
	// check couchdocs, cancel if none or there is no autoupdate section
   	if (!fs.existsSync(path + '/.couchdocs')) {
       	    reject('.couchdocs file should be declared for this operation'); return;
   	}
        const properties = PropertiesReader( path + '/.couchdocs');
        if (!properties.path().autoupdate) {
	    reject('.couchdocs file is required for autoupdate operation'); return;
        }
	const rules = loadMatchingRules(path);
	// download actual revisitions of existing documents
   	getRevisionsMap(couchCredentials).then(revisions => {
            // reject('revisions ready');
	    // go throiugh JSON files and get documents that match type and _id, similar to merge
	    // set up revision for each document
            getDocsAtPath(path, rules, revisions).then((bulkBody) => {
		// do bulk upload of them
		upload(couchCredentials, JSON.parse(bulkBody)).then(resolve).catch(reject);
	    }).catch(reject);
        }).catch(reject);
    }
  );
};


module.exports = autoupdate;