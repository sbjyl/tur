const {
  TextInput, TextView,
  Button,
  ImageView,
  Composite,
  ui
} = require('tabris');
const utils = require('../utils');
const tabsView = require('./tabsView');

var registerView,loginView;
var commonStyle = {
  '.longButton':{
    width:230,
    height:40,
    cornerRadius:15,
    background:'#0273b1',
    textColor:'#fff',
    centerX:0,
    top:'prev() 20'
  },
  '.smallTipLogin':{
    centerX:0,
    top:'prev() 20',
    width:230,
    alignment:'center',
    font:'light normal 12px sans-serif',
    textColor:'#222'
  },
  '.bigTitle':{
    top:'prev() 60',
    width:230,
    centerX:0,
    font:'medium normal 24px sans-serif',
    alignment:'center',
  },
  '.textinput':{
    top:'prev() 20',
    borderColor:'#0273b1',
    width:230,
    height:40,
    centerX:0,
    font:'light normal 14px sans-serif'
  }
};

class register {
  constructor(){
    this.el = new Composite({
      left:0,top:0,bottom:0,right:0
    });
    this.init();
  }
  init(){
    this.el.appendTo(ui.contentView);
    var Title = new TextView({
      class:'bigTitle',
      text:'欢迎注册兔耳日记'
    }).appendTo(this.el);
    var account = new TextInput({
      class:'textinput',
      keyboard:'email',
      message:'注册邮箱'
    }).appendTo(this.el);
    var nick = new TextInput({
      class:'textinput',
      keyboard:'email',
      message:'注册昵称'
    }).appendTo(this.el);
    var pwd = new TextInput({
      class:'textinput',
      type:'password',
      message:'注册密码'
    }).appendTo(this.el);
    var confirmpwd = new TextInput({
      class:'textinput',
      type:'password',
      message:'确认密码'
    }).appendTo(this.el);
    var registerBtn = new Button({
      class:'longButton',
      text:'注 册',
    }).appendTo(this.el);
    var register = new TextView({
      class:'smallTipLogin',
      text:'有账号，立刻登录'
    }).on('tap',()=>{
      this.destory();
      loginView = new login(); 
    }).appendTo(this.el);
    registerBtn.on('select',()=>{
      var accountsValue = account.text.trim(),
      nickValue = nick.text.trim(),
      pwdValue = pwd.text.trim(),
      confirmpwdValue = confirmpwd.text.trim();
      if(!nickValue || !accountsValue || !pwdValue || !confirmpwdValue){
        return utils.alert('昵称，账号，密码不能为空');
      }
      if(nickValue.length > 20){
        return utils.alert('昵称不能大于20个字符');
      }
      if(accountsValue.length > 50){
        return utils.alert('邮箱不能大于50个字符');
      }
      if(!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(accountsValue)){
        return utils.alert('邮箱格式不正确');
      }
      if(pwdValue.length > 30 || pwdValue.length < 6){
        return utils.alert('密码不能小于6位大于30位');
      }
      if(pwdValue !== confirmpwdValue){
        return utils.alert('两次输入的密码不一致');
      }
      utils.post('register',{
        nick:nickValue,
        pwd:pwdValue,
        accounts:accountsValue
      },(ret)=>{
        console.log(ret);  
        utils.alert('注册成功，请登录');
        this.destory();
        loginView = new login();
      });
    });
    this.el.apply(commonStyle);
  }
  destory(){
    this.el.dispose();
  }
}

class login {
  constructor(){
    ui.statusBar.background = '#fff';
    this.el = new Composite({
      left:0,top:0,bottom:0,right:0
    });
    this.init();
  }
  destory(){
    this.el.dispose();
  }
  init() {
    this.el.appendTo(ui.contentView);
    var Title = new TextView({
      class:'bigTitle',
      text:'欢迎来到兔耳日记'
    }).appendTo(this.el);
    var account = new TextInput({
      class:'textinput',
      keyboard:'email',
      message:'登录邮箱'
    }).appendTo(this.el);
    var pwd = new TextInput({
      class:'textinput',
      type:'password',
      message:'登录密码',
    }).appendTo(this.el);
    var loginBtn = new Button({
      class:'longButton',
      text:'登 录'
    }).appendTo(this.el);
    var registerText = new TextView({
      class:'smallTipLogin',
      text:'没有账号，注册一个'
    }).on('tap',()=>{
       this.destory();
       registerView = new register();
    }).appendTo(this.el);
    loginBtn.on('select',()=>{
      //验证
      var accountValue = account.text.trim(),
          pwdValue = pwd.text.trim();
      if(!accountValue || !pwdValue){
        utils.showShortTop('邮箱，密码不能为空'); 
        return;
      }
      if(!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(accountValue)){
        utils.showShortTop('邮箱格式不正确'); 
        return;
      }
      utils.post('login',{
        accounts:accountValue,
        pwd:pwdValue
      },(ret)=>{
        localStorage.setItem('jwt',ret.body.data.jwt); 
        this.destory();
        tabsView.init();
        loginView = null;
      });
    });
    this.el.apply(commonStyle);
  }
}

module.exports = {
  init:function(){
    if(!loginView){
       loginView = new login();
    }
  },
  destory:function(){
    if(loginView){
      loginView.destory();
      loginView = null;
    }
  }
};
