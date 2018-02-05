const {
  app,
  ScrollView,
  Button,
  TextInput,
  ImageView,
  Composite,
  ui,
  TextView,
  NavigationView,
  Page
} = require('tabris');
const utils = require('../utils');
const jwtDecode = require('jwt-decode');
const login = require('./login');
const tabsView = require('./tabsView');

module.exports = {
  init:function(tab,title,tabfolder){
    var view = new Composite({
      left: 0, top: 0, right: 0, bottom: 0
    }).appendTo(tab);
    var page = new ScrollView({
      left:0,top:0,right:0,bottom:0
    }).appendTo(view);
    this.tabfolder = tabfolder;
    this.createSetPage(page);
    return view;
  },
  createCell:function(){
    return new Composite({
      left:0,
      top:'prev() 15',
      width:screen.width
    }); 
  },
  createButtonCell:function(data){
    var cell = this.createCell(); 
    var btn = new Button({
      id:data.id,
      text:data.label,
      width:250,
      alignment:'center',
      centerX:0,
      centerY:0
    }).appendTo(cell);
    if(data.select){
      btn.on('select',data.select); 
    }
    return cell;
  },
  createTextCell:function(data){
    var cell = this.createCell(); 
    new TextView({
      text:data.label,
      left:15,
      top:0,
      width:40,
      alignment:'right'
    }).appendTo(cell);
    new TextView({
      id:data.id,
      text:data.text,
      left:'prev() 15',
      top:0,
      width:screen.width - (15 + 40 + 15 + 15)
    }).appendTo(cell);
    return cell;
  },
  createInputCell:function(data){
    var cell = this.createCell(); 
    var isMult = data.inputType === 'multiline';
    new TextView({
      text:data.label,
      left:15,
      top:0,
      width:40,
      alignment:'right'
    }).appendTo(cell);
    var input = new TextInput({
      type:data.inputType || 'default',
      id:data.id,
      text:data.text,
      top:0,
      width:screen.width - (15 + 40 + 15 + 15)
    });
    if(isMult){
      var scroll = new ScrollView({
        right:15,
        top:0,
        height:80,
        width:screen.width - (15 + 40 + 15 + 15)
      }).appendTo(cell); 
      input.on('blur',()=>{
        scroll.scrollToY(0); 
      });
      input.appendTo(scroll);
    }else{
      input.set('left','prev() 15');
      input.appendTo(cell);
    }
    return cell;
  },
  createSetPage:function(page){
    //获取个人信息
    var self = this;
    var jwt = localStorage.getItem('jwt');
    var decode = jwtDecode(jwt);
    var cells = new Composite({
      left:0,
      top:10,
      id:'cells'
    });
    utils.get('user/info',{id:decode.data.id},(ret)=>{
      var userinfo = ret.body.data;
      var pageCells = [{
        type:'text',
        label:'邮箱:',
        text:userinfo.accounts
      },{
        type:'text',
        label:'注册:',
        text:userinfo.created_at.slice(0,10)
      },{
        type:'input',
        id:'nick',
        label:'昵称:',
        text:userinfo.nick
      },{
        type:'input',
        id:'profile',
        label:'签名:',
        text:userinfo.profile
      },{
        type:'input',
        id:'about',
        label:'介绍:',
        text:userinfo.about,
        inputType:'multiline'
      },{
        type:'button',
        label:'修改保存',
        id:'save',
        select:function(){
          var nickwidget = cells.find('#nick')[0];
          var nick = nickwidget.text.trim();
          var profilewidget = cells.find('#profile')[0];
          var profile = profilewidget.text.trim();
          var aboutwidget = cells.find('#about')[0];
          var about = aboutwidget.text.trim();
          if(nick.length > 10 || nick.length === 0){
            utils.showShortTop('昵称不能为空或者大于10个字符');
            return;
          }
          if(profile.length > 30){
            utils.showShortTop('签名不能大于30字符');
            return;
          }
          if(about.length > 600){
            utils.showShortTop('简介不能大于600字符');
            return;
          }
          utils.post('user/update',{
            id:decode.data._id,
            nick:nick,
            profile:profile,
            about:about
          },(ret)=>{
            utils.alert('修改成功');
            cells.dispose();
            self.createSetPage(page);
          });
        }
      },{
        type:'button',
        label:'退出',
        id:'logout',
        select:function(){
          localStorage.clear();
          tabsView.destory();
          login.init();
        }
      }];
      //增加头像
      new ImageView({
        top:'prev() 15',
        left: 20,
        width: 38,
        height: 38,
        background: '#e0e0e0',
        id: 'itemAvatar',
        image:{
          src:userinfo.avatar
        },
        scaleMode: 'fill',
      }).appendTo(cells);
      pageCells.forEach(item => {
        if(item.type == 'text') this.createTextCell(item).appendTo(cells);
        if(item.type == 'input') this.createInputCell(item).appendTo(cells);
        if(item.type == 'button') this.createButtonCell(item).appendTo(cells);
      });
      cells.appendTo(page);
    });
  }
}
