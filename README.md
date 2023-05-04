# DS Template Kit

a [DS Template Kit](http://deliveryscience.co) application

### How to use

The DS template uses the grunt cli server for task automation, to begin you need to run the following commands [skip those already installed]. Please also note, if you use nginx, you need to add the following config line ["error_page 405 = $uri;"] to your localhost configuration to allow 'POST' calls to static json files located in the "dev/api" folder.

### Modify local settings
Copy local.js.default to local.js and change setting to fit you local system.

###### `npm install -g grunt-cli`
###### `npm install -g json-server`
###### `npm install`

###### `grunt`

Runs the `default` task (`grunt/register/default.js`).

###### `grunt json-api'

Runs the `json-api` task (`grunt/register/json-api.js`). This also starts the json mock api server.