#!/usr/bin/env node

const parseArgs = require('minimist');
const update = require('./lib/update');
const database = require('./lib/database');
const merge = require('./lib/merge');

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


   } else if (command === 'update' || command === 'u') {
      update(couchCredentials, args).then(done).catch(err);
   } else {
      err( [ "USAGE: couchdocs create|update|rev|rev-apply|rev-remove" ].join('\n'));
   }

} else {
  err( [ "ERROR: couchdocs -- not in main module" ].join('\n'));
}


