/**
 * Module Dependencies
 */

"use strict";

var SandGrain = require('sand-grain');
var ldap = require('ldapjs');
var _ = require('lodash');
var Client = require('./Client');

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

  bindToContext(ctx) {
    ctx.ldap = this.createClient();
    ctx.on('end', function() {
      if (ctx.ldap.isConnected) {
        ctx.ldap.unbind(function (err) {
          if (err) {
            sand.error(err);
          }
        });
      }
    });
  }

  createClient() {
    return new Client(this.config);
  }

}

exports = module.exports = Ldap;