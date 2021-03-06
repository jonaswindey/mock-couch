/* jslint node: true */
'use strict';

var restify = require('restify'),
    util = require('util'),
    events = require("events");




function MockCouch () {
  events.EventEmitter.call(this);

  /** The var 'server' contains the restify server */
  var server = (function() {
    var server = restify.createServer({
      formatters : {
        'application/json' : function(req, res, body) {
          res.setHeader('Server', 'CouchDB/1.0.1 (Erlang OTP/R13B)');
          return JSON.stringify(body);
        }
      }
    });
    server.use(restify.bodyParser({ mapParams: false }));
    server.pre(restify.pre.sanitizePath());
    server.use(restify.queryParser());
    return server;
  }());

  // This is where the mock databases dwell
  this.databases = {};

  (function (server, self) {
    /**
     * Add the routes
     */

    // GET _all_docs
    server.get('/:db/_all_docs', require('./lib/all_docs')(self));

    // GET certain document
    server.get('/:db/:doc', require('./lib/get_doc')(self));

    // PUT and POST a document
    var put_doc = require('./lib/save_doc')(self);
    server.put('/:db/:doc', put_doc);
    server.post('/:db/', put_doc);

    // DELETE a document
    server.del('/:db/:doc', require('./lib/delete')(self) );
  }(server, this));

  this.addDB = require('./lib/addDB');
  this.listen = function() {
    return server.listen.apply(server, arguments);
  };
  this.close = function() {
    return server.close.apply(server, arguments);
  };
}
util.inherits(MockCouch, events.EventEmitter);

module.exports = {
  createServer : function() {
    /** Returns a brand new mock couch! */
    return new MockCouch();
  }
};
