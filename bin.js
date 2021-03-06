#!/usr/bin/env node

const fs = require('fs');
const tmp = require('tmp');
const parseArgs = require('minimist');
const update = require('./lib/update');
const database = require('./lib/database');
const merge = require('./lib/merge');
const save = require('./lib/save');
const autoupdate = require('./lib/autoupdate');
const backup = require('./lib/backup');
const verify = require('./lib/verify');
const zip = require('./lib/zip');
const shell = require('shelljs');

const commandArgs = parseArgs(process.argv, { '--': true });
const isVerbose = () => (commandArgs.v || commandArgs.verbose);
const out = (...a) => { if (isVerbose()) console.info(...a); };

let localPath = './';
const getLocalPath = (args) => {
  
  return new Promise((resolve, reject) => {
    const url = args._[3];
    if (!url || ! /^https?:/.test(url)) { resolve(localPath); return; }
    out('Remote URL= ', url);
    if (!/\.tar\.gz$/.test(url)) { reject('ERROR: only TAR.GZ is expected in remote URL'); return; }

    const tmpobj = tmp.dirSync();
    localPath = tmpobj.name;
    out('Temporary Directory: ', tmpobj.name);
    shell.exec('cd ' + localPath + ' && curl -s ' + url + ' | tar xz');

    resolve(localPath);
  });
};

const cleanup = () => {
  if (localPath  && localPath !== './') {
    out('Cleaning Path=', localPath);
    shell.exec( 'rm -rf ' + localPath );
  }
};

const err = (e) => {
  console.log(e);
  cleanup();
  process.exit(1);
};

const done = (data) => {
  if (typeof data === 'string') console.log(data);
  cleanup();
  process.exit(0);
};

if (process.mainModule && process.mainModule.filename === __filename) {
   const args = parseArgs(process.argv, { '--': true });
   
   const command = args._[2];

   if (command === 'merge' || command === 'm') {
      merge('./')
	.then(data => { 
	   fs.writeFileSync('./_bulk_docs.json', JSON.stringify(data));
	   done();
        })
	.catch(err);

   } else if (command === 'zip' || command === 'z') {

      verify('./')
	.then((files)=> { zip('./').then(done).catch(err); })
	.catch(err);

   } else if (command === 'verify' || command === 'e') {

      getLocalPath(args).then(path => {
        verify(path).then(done).catch(e);
      }).catch(err);

   } else if (command === 'create' || command === 'c') {

      getLocalPath(args).then(path => {
	const couchCredentials = require('./lib/credentials')(path, args);
        merge(path).then(data => { 
           const db = database(couchCredentials);
           db.create().then(() => (db.upload(data))).then(done).catch(err); 
	}).catch(err);
      }).catch(err);

   } else if (command === 'recreate' || command === 'r') {

      getLocalPath(args).then(path => {
        const couchCredentials = require('./lib/credentials')(path, args);
        merge(path).then(data => { 
	   const db = database(couchCredentials);
	   db.removeIfExists()
             .then(() => (db.create().then(() => (db.upload(data).then(done).catch(err))).then(done).catch(err)))
             .catch(err); 
	}).catch(err);
      }).catch(err);

   } else if (command === 'autoupdate' || command === 'a') {

      getLocalPath(args).then(path => {
        const couchCredentials = require('./lib/credentials')(path, args);
        autoupdate(couchCredentials, path, args).then(done).catch(err);
      }).catch(err);

   } else if (command === 'backup' || command === 'b') {

      // backing up all databases using couchbackup
      const couchCredentials = require('./lib/credentials')('./', args);
      backup(couchCredentials, args).then(done).catch(err);

   } else if (command === 'save' || command === 's') {

      // save existing database into current folder
      const couchCredentials = require('./lib/credentials')('./', args);
      save(couchCredentials, args).then(done).catch(err);

   } else if (command === 'update' || command === 'u') {

      // update document from a current folder
      const couchCredentials = require('./lib/credentials')('./', args);
      update(couchCredentials, args).then(done).catch(err);

   } else {
      err( [ "USAGE: couchdocs create|recreate|save|update|autoupdate|verify|merge" ].join('\n'));
   }

} else {
  err( [ "ERROR: couchdocs -- not in main module" ].join('\n'));
}

