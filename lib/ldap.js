/**
 * Module Dependencies
 */

"use strict";

var SandGrain = require('sand-grain');
var LdapAuth = require('ldapauth-fork');
var ldap = require('ldapjs');


/**
 * Expose `Ldap`
 */
class Ldap extends SandGrain {

  constructor() {
    super();
    this.name = this.configName = 'ldap';
    this.defaultConfig = require('./default');
    this.version = require('../package').version;
  }

  authenticate(username, password, callback) {
    let self = this;

    let client = ldap.createClient({
      url: this.config.url
    });

    if ('function' === typeof callback) {
      return auth(callback);
    }

    return new Promise(function(resolve, reject) {
      auth(function(err, user) {
        if(err) {
          return reject(err);
        }
        resolve(user);
      });
    });

    function auth(callback) {

      if (self.config.template) {
        username = self.config.template.replace(/<%username%>/g, username);
      }

      client.bind(username, password, function(err, user) {
        if (err) {
          return callback(err);
        }

        client.unbind(function(err2) {
          if (err2) {
            self.error(err2.stack || err2.message || err2);
          }
          callback(err, user);
        });
      });
    }
  }

}


exports = module.exports = Ldap;