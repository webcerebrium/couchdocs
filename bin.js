#!/usr/bin/env node

const fs = require('fs');

var _isUsingDirectoryConfig;
isUsingDirectoryConfig = () => {
  if(_isUsingDirectoryConfig != null) return _isUsingDirectoryConfig;
  // return _isUsingDirectoryConfig = (process.argv[2] && (process.argv[2].trim() === "-dc"));
  return false;
};

if (process.mainModule && process.mainModule.filename === __filename) {
  console.log( [ "couchdocs -- utility for syncing CouchDb documents" ].join('\n'));
} else {
  console.log( [ "couchdocs -- not in main module" ].join('\n'));
}


