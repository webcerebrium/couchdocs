const request = require('request');
const shell = require('shelljs');
const parseArgs = require('minimist');
const commandArgs = parseArgs(process.argv, { '--': true });
const out = (...a) => { if (commandArgs.v || commandArgs.verbose) console.info(...a); };

const getList = (config) => {
  const headers = { "Content-Type": 'application/json' };
  return new Promise(
    (resolve, reject) => {
      if (!config.url) { reject('ERROR: invalid database specified'); return; }
      const url = config.url + "/_all_dbs";
      out('url:', url);
      request({ url, headers, method: 'GET' }, (error, response, body) => {
	if (error) { reject(error); return; }
	const doc = JSON.parse(body);
  	if (doc.error) { reject('ERROR: Database list extraction error: ' + doc.error); return; }
        else resolve(doc);
      });
    }
  );
};

const backupAll = (config, args) => {
  return new Promise(
    (resolve, reject) => {
      getList(config).then((list) => {
	list.forEach(db => {
	  if (!db || db.charAt(0) === '_') return;
          console.log(new Date().toISOString(), db);
          const cmd = "couchbackup --mode=shallow --db " + db + " | gzip > " + db + ".backup.gz";
	  shell.exec(cmd);
        });
        resolve(list);
      });
    }
  );
};

module.exports = backupAll;
