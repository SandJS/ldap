"use strict";

const ldap = require('ldapjs');
const util = require('./util');

class Client {

  constructor(config) {
    this.config = config;
    this.isConnected = false;
  }

  connect() {
    if (!this.isConnected) {
      this.isConnected = true;
      this.client = ldap.createClient({
        url: this.config.url
      });
    }
  }

  unbind(callback) {
    this.connect();
    let self = this;

    return util.runWithCallbackOrPromise(unbind, callback);

    function unbind(callback) {
      if (!self.client) {
        return callback();
      }

      self.client.unbind(callback);
      self.client = null;
    }
  }

  authenticate(dn, password, callback) {
    let self = this;

    return util.runWithCallbackOrPromise(authenticate, callback);

    function authenticate(callback) {
      self.bind(dn, password, function(err, result) {
        if (err) {
          return callback(err);
        }
        self.config.onAuthBindSuccess.call(self, dn, callback);
      });
    }

  }

  bind(dn, password, callback) {
    this.connect();
    let self = this;

    return util.runWithCallbackOrPromise(bind, callback);

    function bind(callback) {
      self.client.bind(dn, password, callback);
    }

  }

  search(dn, opts, callback) {
    let self = this;

    if (!callback && 'function' === typeof opts) {
      callback = opts;
      opts = null;
    }

    if (!opts) {
      opts = {};
    }

    if (callback) {
      callback = _.once(callback);
    }

    return util.runWithCallbackOrPromise(search, callback);

    function search(callback) {

      // find the entry in ldap records
      self.client.search(dn, opts, function (err, res) {
        if (err) {
          return callback(err);
        }

        // collect the entries
        let entries = [];
        res.on('searchEntry', function (entry) {
          entries.push(entry.object);
        });

        // check for errors
        res.on('error', callback);

        // once we're done with searching users
        res.on('end', function (result) {
          if (0 != result.status) {
            return callback(result);
          }
          callback(null, entries);
        });

      });

    }
  }
}

module.exports = Client;