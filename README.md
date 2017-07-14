# couchdocs
Command-line tools to operate with JSON files in sync with CouchDB

## Installation
`npm install -g couchdocs`

## Usage

#### Create Database from all merged documents in current folder
```couchdocs create .```

#### Update Database document using local json file
```
couchdocs update foo.json
couchdocs update --id _design/backend design_backend.json
```
## .couchdocs File Example
Contains properties of CouchDB connection which should be applied for sync of JSON files in the current folder.
```
[couchdb]
db=testdb
url=http://localhost:5984/
```