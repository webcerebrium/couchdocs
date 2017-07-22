# couchdocs
Command-line tools to operate with JSON files in sync with CouchDB

## Installation
```
npm install -g couchdocs
```

## Usage

#### (c) Create CouchDB Database from all merged JSON documents in current folder
```
couchdocs create
couchdocs create http://example.com/database.tar.gz
```

#### (r) Delete existing and re-create CouchDB database from all merged documents in current folder
```
couchdocs recreate
couchdocs recreate http://example.com/database.tar.gz
```

#### (u) Update Database document using local json file
```
couchdocs update foo.json
couchdocs update --id _design/backend design_backend.json
```

### (a) Partial database autoupdate

Read section in couchdocs file, it can declare what exact types or what documents can be safely autoupdated.
`[autoupdate]` section can contain types that should be auto updated.
`[exclude]` section can contain documents that should be auto updated.

```
couchdocs autoupdate
couchdocs autoupdate  http://example.com/database.tar.gz
```

Typical Example of couchdocs sections for configuring autoupdates
```
[autoupdate]
_id=_design/servers _design/public _design/auth
type=template layout widget webapp-config

[exclude]
_id=User-Backup
```

### (s) Save database into JSON files

Each document becomes a separate file
```
couchdocs save
```

### (z) Create tarball from JSON files in current folders

```
couchdocs zip
```

## .couchdocs File Configuration Example
Contains properties of CouchDB connection which should be applied for sync of JSON files in the current folder.
```
[couchdb]
db=testdb
url=http://localhost:5984/
```
You could also use `COUCH_URL` and `COUCH_DB` variables too for database specification.

Use `-v` to have a verbose output about what is going on.

## Reference to other handy CLI utilities

- [https://github.com/zaach/jsonlint]
- [https://github.com/glynnbird/couchbackup]

