const fs = require('fs');

const mergeDocsAtPath = (path) => {
  const inputPath = path ? path : './';
  return new Promise(
    (resolve, reject) => {
      let output = '{"docs":[\n';
      fs.readdir(inputPath, (err, items) => {
        if (err) { reject(err); return; }
        const it = items.filter(file => (file.indexOf('.json') !== -1 && file !== '_bulk_docs.json'));
        it.forEach((file, index) => { 
          const buff = fs.readFileSync(file);
          if (index > 0) { output += ',\n'; }
          try { 
            const json = JSON.parse(buff);
            if (json && json.docs) {
              json.docs.forEach((doc, docIndex) => {
                if (docIndex > 0) { output += ',\n'; }
                output += JSON.stringify(doc);
              });
            } else { 
              output += JSON.stringify(json);
            }
          } catch (e) {
            console.error('ERROR IN', file, 'MESSAGE', e);
          } 
        });
        output += "\n]}\n";
        resolve(JSON.parse(output));
      });
  });
};

module.exports = mergeDocsAtPath;