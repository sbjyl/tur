const {
  AlertDialog
} = require('tabris');
const config = require('../config');

const baseurl = config.apibase;

module.exports = {
  //toast:window.plugins.toast,
  hide:function(){
    //this.toast.hide();
  },
  showShortTop:function(msg){
    /*
    this.toast.showShortTop(msg,()=>{
      this.hide()
    });
    */
    this.alert(msg);
  },
  showLongCenter:function(msg){
    /*
    this.toast.showLongCenter(msg,()=>{
      this.hide()
    });
    */
    this.alert(msg);
  },
  getSerialization: function(obj) {
    var query = [];
    Object.keys(obj).forEach((key) => {
      query.push(key + '=' + obj[key]);
    });
    return query.join('&');
  },
  getJwtHeader: function(options) {
    var jwt = localStorage.getItem("jwt");
    if (jwt) {
      if (options["headers"]) {
        options["headers"]["Authorization"] = "Bearer " + jwt;
      } else {
        options["headers"] = {
          "Authorization": "Bearer " + jwt
        }
      }
    }
    return options;
  },
  get: function(path, params, cb) {
    var query = '?' + this.getSerialization(params);
    var options = {
      method: "GET"
    };
    this.getJwtHeader(options);
    fetch(baseurl + path + query, options).then((res) => {
      res.json().then((ret) => {
        if (ret.status === 200) {
          cb(ret);
        } else {
          this.showLongCenter(ret.message);
        }
      });
    },
    (msg) => {
      console.log(msg);
      this.showLongCenter(msg);
    }).catch(err=>{
      console.log(err); 
    });
  },
  post: function(path, params, cb) {
    var body = this.getSerialization(params);
    var options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body
    };
    this.getJwtHeader(options);
    fetch(baseurl + path, options).then((res) => {
      res.json().then((ret) => {
        if (ret.status === 200) {
          cb(ret);
        } else {
          this.showLongCenter(ret.message);
        }
      });
    },
    (msg) => {
      this.showLongCenter(msg);
    });
  },
  alert: function(msg) {
    new AlertDialog({
      message: msg,
      buttons: {
        ok: 'Yes'
      }
    }).open();
  },
  confirm:function(msg,cb){
     new AlertDialog({
      message: msg,
      buttons: {
        ok: '确定',
        cancel: '取消'
      }
     }).on({
      closeOk: cb,
     }).open(); 
  }
};

