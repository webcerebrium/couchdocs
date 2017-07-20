const fs = require('fs');

const verifyDocsAtPath = (path) => {
  const inputPath = path ? path : './';
  return new Promise(
    (resolve, reject) => {
      fs.readdir(inputPath, (err, items) => {
        if (err) { reject(err); return; }
        const it = items.filter(file => (file.indexOf('.json') !== -1 && file !== '_bulk_docs.json'));
        it.forEach((file, index) => { 
          const buff = fs.readFileSync(file);
          try { 
            const json = JSON.parse(buff);
          } catch (e) {
            reject('ERROR IN', file, 'MESSAGE', e);
          } 
        });
        resolve(it);
      });
  });
};

module.exports = verifyDocsAtPath;