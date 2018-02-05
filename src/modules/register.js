const {
  TextInput, TextView,
  Button,
  ImageView,
  Composite,
  ui
} = require('tabris');
const utils = require('../utils');
const login = require('./login');


module.exports = {
  constant:null,
  init:function(){
    if(!this.constant) this.constant = new register();
  },
  destory:function(){
    if(this.constant){
      this.constant.destory();
      this.constant = null;
    }
  }
};
