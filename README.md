# couchdocs
Command line tools to operate with JSON files in sync with CouchDB

## Installation
`npm install -g couchdocs`

## Usage
Database and url of couchdb

#### Merge All Documents and create database from it
```couchdocs create .```

#### Create Database from all merged documents folder
```couchdocs merge .```

#### Update Database document using local json file
```
couchdocs update foo.json
couchdocs update --id _design/backend design_backend.json
```
There is also a bunch of low-level options used for this

Display Revision from document file:
```
couchdocs rev foo.json
cat foo.json | couchdocs rev
```

Apply/Inject Revision into the document:
```
couchdocs rev-apply foo.json
cat foo.json | couchdocs rev-apply
```

## .couchdocs File
Contains properties of CouchDB connection