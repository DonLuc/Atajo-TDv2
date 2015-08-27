//NPM
var os = require('os');
var fs = require('fs');
var path = require('path');
var io = require('socket.io-client');



//LIB
var _squash = require('../lib/squash');

_io = {

  VERSION: null,
  RELEASE: null,
  SOCKET: null,
  HOSTNAME: null,
  URI: null,
  CONFIG: null,
  HASH: null,
  KEYS : null,

  ISBUILDING: false,
  CONNECTED: false,

  RECONNECT_INT: null,
  RECONNECT_DELAY: 5000,


  init: function(RELEASE, URI) {
    var _ = this;


    //SET THE BASE PROVIDER RELEASE VERSION
    _.RELEASE = RELEASE;
      GLOBAL.RELEASE = _.RELEASE;

    _.HOSTNAME = os.hostname();
    _.URI = URI;
    _.CONFIG = require('../../conf/config.json');
    _.KEYS   = require('../../conf/keys.json');


    _.CONFIG.API_KEY    = _.KEYS.API_KEY;
    _.CONFIG.CLIENT_KEY = _.KEYS.CLIENT_KEY;


    _.VERSION = _.CONFIG.VERSIONS[_.RELEASE];




    //  _log.d("INITIALIZING SOCKET LISTENERS...");


    var OPTS = {
      reconnection: true,
      connect_timeout: 10000,
      query: 'UUID='+_.HOSTNAME+'&KEY='+_.CONFIG.API_KEY

    };

    _.SOCKET = io.connect(URI, OPTS);



    //SOCKET HANDLERS
    _.SOCKET.removeAllListeners('connect_timeout');
    _.SOCKET.on('connect_timeout', function() {
      _log.e("CONNECTION TIMEOUT");
    });

    _.SOCKET.removeAllListeners('reconnecting');
    _.SOCKET.on('reconnecting', function() {
      _log.e("CONNECTION RECONNECTING");
    });

    _.SOCKET.removeAllListeners('reconnect_error');
    _.SOCKET.on('reconnect_error', function() {
      _log.e("CONNECTION RECONNECT ERROR");
    });

    _.SOCKET.removeAllListeners('reconnect_failed');
    _.SOCKET.on('reconnect_failed', function() {
      _log.e("CONNECTION RECONNECT FAILED");
    });


    _.SOCKET.removeAllListeners('connect');
    _.SOCKET.on('connect', function() {

      require('../../hooks/onConnect.js').evt();

      var extVersion = path.join(__dirname, '../', '../', '.version');
      var currentProviderVersion = fs.readFileSync(extVersion).toString().replace(/\n/g, '');


      _log.n();
      _log.i("<-----[ ATAJO PROVIDER " + currentProviderVersion + " ]--[ " + _.RELEASE + " : " + _.VERSION.ID + " ]--[ RUNNING ON " + _.HOSTNAME + " ]--[ CONNECTED TO " + _.URI + ' ]----->');
      _log.n();

      _.CONNECTED = true;



      //INIT CHANGE LISTENER
      var watcher = require('./watcher').init(function() {

        _.SOCKET.refreshBase();

      });


      _.SOCKET.refreshBase();


    });





    _.SOCKET.removeAllListeners('disconnect');
    _.SOCKET.on('disconnect', function(reason) {
      _log.e("PROVIDER DISCONNECTED : "+reason);
      _.CONNECTED = false;

      require('../../hooks/onDisconnect.js').evt();


    });





    _.SOCKET.removeAllListeners('event');
    _.SOCKET.on('event', function(data) {

      _log.e("CORE EVENT : " + JSON.stringify(data));

    });

    _.SOCKET.refreshBase = function() { var _ = _io;



      if (_.ISBUILDING) {
        _log.w("ALREADY BUILDING. WILL TRY AGAIN IN 5 SECONDS")
        setTimeout(function() {
          _.SOCKET.refreshBase();
        }, 5000);
        return;
      }

      _.ISBUILDING = true;


      //ADD IMG
      try {
        var icon = fs.readFileSync(path.join(__dirname, '../', 'img', 'icon.png'));
        icon = new Buffer(icon).toString('base64');
      } catch (e) {
        _log.w("ICON FILE NOT FOUND");
        icon = '';
      }

      try {
        var logo = fs.readFileSync(path.join(__dirname, '../', 'img', 'logo.png'));
        logo = new Buffer(logo).toString('base64');
      } catch (e) {
        _log.w("LOGO FILE NOT FOUND");
        logo = '';
      }




      _.HASH = _base.hash();


      _base.build(function(passed) {

        if (typeof passed == 'undefined') {
          passed = true;
        }

        if (!passed) {
          _log.d("COULD NOT BUILD BASE. NOT UPLOADING TO CORE");
          return;
        }

        setTimeout(function() {

          _.CONFIG.DEBUG = _.CONFIG.VERSIONS[RELEASE].DEBUG;
          _.CONFIG.RELEASE = _.RELEASE;

          _PROVIDER = {
            HASH: _.HASH[_.VERSION.ID],
            CONFIG: _.CONFIG,
            LOGO: logo,
            ICON: icon,
            RELEASE: _.RELEASE,
            HOSTNAME: _.HOSTNAME,
            VERSION: _.VERSION,
            DEBUG: _.CONFIG.VERSIONS[RELEASE].DEBUG,
            PAYLOAD: {
              js: fs.readFileSync(path.join(__dirname, '../', 'build', 'base-' + _.VERSION.ID + '.js')),
              css_large: fs.readFileSync(path.join(__dirname, '../', 'build', 'base-' + _.VERSION.ID + '.large.css')),
              css_small: fs.readFileSync(path.join(__dirname, '../', 'build', 'base-' + _.VERSION.ID + '.small.css')),
              html: fs.readFileSync(path.join(__dirname, '../', 'build', 'base-' + _.VERSION.ID + '.html'))
            }
          };


          _log.i("                            RELEASE HASH --[ " + _.HASH[_.VERSION.ID] + " ]--> UPLOADED TO CORE");



          //identify with core
          _.SOCKET.emit('BASEPROVIDER', _PROVIDER);

          _.ISBUILDING = false;

          _log.n();
          _log.i("<<<< WAITING FOR TRANSACTIONS >>>");
          _log.n();



        }, 1000);

      }, _.VERSION.DEBUG);


    };

    _.SOCKET.removeAllListeners('UNAUTHORIZED');
    _.SOCKET.on('UNAUTHORIZED', function(msg) {

      _log.e("CONNECTION UNAUTHORIZED : " + msg);
      process.exit(1);

    });


    //Echo the current code hash
    _.SOCKET.removeAllListeners('hash');
    _.SOCKET.on('hash', function() {

      _.SOCKET.emit('hash', HASH);

    });

    _.SOCKET.removeAllListeners('auth');
    _.SOCKET.on('auth', function(obj) {

      //log the request
      _log.d("AUTH REQUEST : " + JSON.stringify(obj));


      /*
      Authentication ultimately needs to emit a response containing a token / or false if auth failed.
      All calls to the _.SOCKET.req event will contain this token.
      */


      var _handler = require('../../handlers/auth');

      _handler.req(obj, function(obj) {


        _.SOCKET.emit('auth_RESPONSE', obj);




      });


    });


    // API REQUEST
    _.SOCKET.removeAllListeners('req');
    _.SOCKET.on('req', function(obj) {

      //log the request
      _log.d("API REQUEST : " + JSON.stringify(obj));

      //HANDLER (SYNC) OR ACTION  (JOBQUEUE) ?
      if (obj.service != 'sendToQueue') {

        //FIND THE HANDLER
        var service = obj.service;
        var handler = '';

        for (var i in _.CONFIG.SERVICES) {
          curr = _.CONFIG.SERVICES[i];

          if (curr.service == service) {
            handler = curr.handler;
          }
        }


        _log.d("SERVICE HANDLER IS : " + handler);

        try {

          var _handler = require('../../handlers/' + handler);

          _handler.req(obj, function(obj) {


            _.SOCKET.emit('req_RESPONSE', _squash.deflate(obj));


          });

        } catch (e) {

          _log.e("HANDLER NOT FOUND OR HANDLER ERROR : " + handler + " --> "+e);
          obj.RESPONSE = false;
          _.SOCKET.emit('req_RESPONSE', _squash.deflate(obj));



        }

      } else {

        //FIND THE HANDLER
        var action = obj.action;
        var handler = '';

        for (var i in _.CONFIG.ACTIONS) {
          curr = _.CONFIG.ACTIONS[i];

          if (curr.action == action) {
            handler = curr.handler;
          }
        }


        _log.d("ACTION HANDLER IS : " + handler);


        try {

          var _handler = require('../../handlers/' + handler);

          _handler.req(obj, function(obj) {


            _.SOCKET.emit('req_RESPONSE', _squash.deflate(obj));


          });

        } catch (e) {

          _log.e("HANDLER NOT FOUND OR HANDLER ERROR : " + handler + " --> "+e);

          obj.RESPONSE = {jobID: obj.jobID, statusCode: 0, result: {msg:"HANDLER ("+handler+") NOT FOUND ", req:"NO REQUEST", res:"NO RESPONSE"}};
          _.SOCKET.emit('req_RESPONSE', _squash.deflate(obj));



        }


      }


      /*
      An API call ultimately needs to emit a response containing a JSON array / dictionary.

      ...


      note :   obj.service  ==  the name of the sync service you created in config.json


      So here you will typically switch obj.service and pull and/or process data from some source.

      ...




      The client can also call api.req [  function(service, dataObj, cb, noCache) ]
      to pass additional data.

      ...


      and emit the response ... for this example I am emitting a test.js file containing some json data.
      */


      // obj.RESPONSE =  require('./sample/sampleList.json');
      // _.SOCKET.emit('req_RESPONSE', obj);


    });


    // API REQUEST
    _.SOCKET.removeAllListeners('get');
    _.SOCKET.on('get', function(obj) {

      //log the request
      _log.d("API GET : " + JSON.stringify(obj));


        _log.d("SERVICE HANDLER IS : " + obj.handler);

        try {

          var _handler = require('../../handlers/' + obj.handler);

          _handler.req(obj, function(obj) {


            _.SOCKET.emit('req_RESPONSE', _squash.deflate(obj));


          });

        } catch (e) {

          _log.e("HANDLER NOT FOUND OR HANDLER ERROR : " + obj.handler + " --> "+e);
          obj.RESPONSE = false;
          _.SOCKET.emit('req_RESPONSE', _squash.deflate(obj));



        }



    });








  },



};


module.exports = _io;
