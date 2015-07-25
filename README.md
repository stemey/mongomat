# mongomat

the best place to manage your mongodb data.

features:

- Completely customizable ui. Customization is done in the app not in a configuration file.
- Querybuilder ui that makes it easy to create simple to medium queries.
- Supports sophisticated validation features.

VIDEO

#Global Installation (not for windows)

- npm install mongomat -g
- mongomat <parameters>

#Installation

- npm install mongomat
- node node_modules/mongomat <parameters>


##Parameters

    -h, --help                output usage information
    -V, --version             output the version number
    -P, --port <n>            Port to run node server on. Default is 3001
    -M, --metadataDb <value>  Name of meta data db. Default is metadata.
    -B, --openBrowser <bool>  true - open app in browser. Default is true.
    -U, --mongoUrl <value>    url of mongo server. Default is localhost:27107
    -S, --synchronize <bool>  synchronze on start up. Default is true
    -A, --authDb <value>      db which holds user data.
    -u, --user <value>        user
    -p, --pwd <value>         password
    -d, --dbs <db1,db2,>      the database visible in the tool. Necessary for all privileges.

## Authentication

if you are running your mongodb with no authentication then you don't need to specify user and pwd or any other 
parameters and get access to all collections. Otherwise you need to specify user/pwd and the dbs you want to access.

## Metadata

mongomat stores metadata about collections and schemas in two extra collections. These are called `mdbCollection` and `mdbSchema`respectively
 and will be created in the database specified by the parameter `metadataDb` - default is `metadata`.
 
## Frontend

The frontend is a single-page app running in the browser. It can be customized and run separately from the server by 
setting `-B false`. The app is available [here](https://github.com/stemey/gform-app).

