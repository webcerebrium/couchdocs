const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const zipDocsAtPath = (p) => {
  const inputPath = path.resolve(p ? p : './');
  // console.log('inputPath = ', inputPath);
  const folder = path.basename(inputPath);
  // console.log(path.basename(inputPath));
  console.log(folder + '.tar.gz');
  return new Promise(
    (resolve, reject) => {
      const res = shell.exec('cd ' + inputPath + ' && tar cfz ' + folder + '.tar.gz ./*.json ./.couchdocs');
      console.log(res.stderr);
      console.log(res.stdout);
      if (res.stderr) {}
      resolve(res.stdout);
    });
};

module.exports = zipDocsAtPath;