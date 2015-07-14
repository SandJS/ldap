module.exports = {

  runWithCallbackOrPromise: function (run, callback) {
    if ('function' === typeof callback) {
      return run(callback);
    }

    return new Promise(function(resolve, reject) {
      run(function(err, result) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

};