var jwtDecode = require('jwt-decode');
module.exports = {
  checkLogin: function(cb) {
    var jwt = localStorage.getItem('jwt');
    if (jwt) {
      var decode = jwtDecode(jwt);
      if (decode.exp > Date.now() / 1000) {
        cb(true);
      } else {
        localStorage.clear('jwt');
        cb(false);
      }
    } else {
      cb(false);
    }
  },
  refJwt: function() {

  }
}

