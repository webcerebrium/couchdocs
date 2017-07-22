const fs = require('fs');
const PropertiesReader = require('properties-reader');

const getCredentials = (path, args) => {
   const result = {
	url: 'http://localhost:5984/'
   };
   // reading environment variables
   if (process.env.COUCH_URL) { result.url = process.env.COUCH_URL; }
   if (process.env.COUCH_DB) { result.db = process.env.COUCH_DB; }
   // trying to read properties from local .couchdocs file, if this is available
   if (fs.existsSync(path + '/.couchdocs')) {
       const properties = PropertiesReader(path + '/.couchdocs');
       if (properties.get('couchdb.db')) result.db = properties.get('couchdb.db');
       if (properties.get('couchdb.url')) result.url = properties.get('couchdb.url');
   }
   // finally, the highest priority is for 
   if (args.db) result.db = args.db;
   if (args.url) result.url = args.url;
   return result;   
};

module.exports = getCredentials;