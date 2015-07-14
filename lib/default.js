"use strict";
module.exports = {
  url: 'ldap://ldap.example.com:389',
  onAuthBindSuccess: function(dn, callback) {
    callback(null, dn);
  }
};