# couchdocs
Command-line tools to operate with JSON files in sync with CouchDB

## Installation
```
npm install -g couchdocs
```

## Usage

#### Create CouchDB Database from all merged JSON documents in current folder
```
couchdocs create
```

#### Delete existing and re-create CouchDB database from all merged documents in current folder
```
couchdocs recreate
```

#### Update Database document using local json file
```
couchdocs update foo.json
couchdocs update --id _design/backend design_backend.json
```

### Save database into JSON files

Each document becomes a separate file
```
couchdocs save
```

## .couchdocs File Example
Contains properties of CouchDB connection which should be applied for sync of JSON files in the current folder.
```
[couchdb]
db=testdb
url=http://localhost:5984/
```

You could use `COUCH_URL` and `COUCH_DB` variables too for database specification.

Use `-v` to have a verbose output about what is going on.


## coming soon:

Read section in couchdocs file can declared what exact types or files can be safely autoupdated
```
couchdocs autoupdate
```
`[types]` can contain types that should be auto updated
`[docs]` can contain documents that should be auto updated

Verify JSON files in the current folder
```
couchdocs verify 
```	
