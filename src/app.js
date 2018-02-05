const { app,ui } = require('tabris');
const status = require('./modules/status');
const tabsView = require('./modules/tabsView');
const login = require('./modules/login');
const utils = require('./utils');
const config = require('./config');

//应该在呼起时也同时要检查登录态
//localStorage.clear();
getStatus();
function getStatus(){
  status.checkLogin((isLogin)=>{
    if(isLogin){
      tabsView.init();
    }else{
      login.init();
    }
  });
}

