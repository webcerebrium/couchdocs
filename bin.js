#!/usr/bin/env node

const fs = require('fs');

const parseArgs = require('minimist');
const update = require('./lib/update');
const database = require('./lib/database');
const merge = require('./lib/merge');
const save = require('./lib/save');
const autoupdate = require('./lib/autoupdate');
const verify = require('./lib/verify');
const zip = require('./lib/zip');

const err = (e) => {
  console.log(e);
  process.exit(1);
};
const done = (data) => {
  if (typeof data === 'string') console.log(data);
  process.exit(0);
};

if (process.mainModule && process.mainModule.filename === __filename) {
   const args = parseArgs(process.argv, { '--': true });
   const couchCredentials = require('./lib/credentials')(args);
   const command = args._[2];
   if (command === 'show') {
      console.log(couchCredentials);

   } else if (command === 'merge' || command === 'm') {
      merge('./')
	.then(data => { 
	   fs.writeFileSync('./_bulk_docs.json', JSON.stringify(data));
	   done();
        })
	.catch(err);

   } else if (command === 'verify' || command === 'e') {

      verify('./').then(done).catch(e);

   } else if (command === 'zip' || command === 'z') {

      verify('./')
	.then((files)=> { zip('./').then(done).catch(err); })
	.catch(err);

   } else if (command === 'create' || command === 'c') {
      merge('./')
        .then(data => { 
           const db = database(couchCredentials);
	   db.create().then(() => (upload(data))).then(done).catch(err); 
	})
        .catch(err);

   } else if (command === 'recreate' || command === 'r') {
      merge('./')
	.then(data => { 
	   const db = database(couchCredentials);
	   db.removeIfExists()
             .then(() => (db.create().then(() => (db.upload(data).then(done).catch(err))).then(done).catch(err)))
             .catch(err); 
	})
        .catch(err);

   } else if (command === 'save' || command === 's') {
      save(couchCredentials, args).then(done).catch(err);

   } else if (command === 'update' || command === 'u') {
      update(couchCredentials, args).then(done).catch(err);

   } else if (command === 'autoupdate' || command === 'a') {
      autoupdate(couchCredentials, args).then(done).catch(err);

   } else {
      err( [ "USAGE: couchdocs create|update|save|update|autoupdate" ].join('\n'));
   }

} else {
  err( [ "ERROR: couchdocs -- not in main module" ].join('\n'));
}

