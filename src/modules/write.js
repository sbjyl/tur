const {
  app,
  ScrollView,
  Picker,
  Button,
  TextInput,
  Composite,
  ImageView,
  ui,
  Switch,
  TextView,
  NavigationView,
  Page
} = require('tabris');
const utils = require('../utils');
const _ = require('lodash');
const jwtDecode = require('jwt-decode');
const config = require('../config');

var contentList = [];

module.exports = {
  init: function(tab, title, tabfolder) {
    this.view = view = new Composite({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    }).appendTo(tab);
    this.page = page = new ScrollView({
      left: 0,
      top: 0,
      right: 0,
      bottom: 60
    }).appendTo(view);
    this.tabfolder = tabfolder;
    this.createWritePage(page);
    return view;
  },
  createWritePage:function(page){
    this.createNoteBook(page,()=>{
      this.createOthers(page); 
      this.createFiled(page); 
      this.createFoot(this.view); 
    }); 
  },
  createNoteBook:function(page,cb){
    var jwt = localStorage.getItem('jwt');
    var decode = jwtDecode(jwt);
    utils.get('notebook/get',{
      userid:decode.data._id
    },(ret)=>{
      var list = ret.body.data;
      this.notebookList = list;
      var title = new TextView({
        text:'选择日记本:',
        left: 20, top: 20
      }).appendTo(page);
      this.notebooks = new Picker({
        left: 20, top: 'prev() 20', right: 20,
        itemCount: list.length,
        itemText: (index) => list[index].name,
        selectionIndex: 0
      }).appendTo(page);
      var title = new TextView({
        id:'notebook',
        text:'管理日记本请到PC端,本版本暂不支持',
        font:'thin normal 12px sans-serif',
        left: 20, top: 'prev() 20', right: 20,
      }).appendTo(page);
      cb();
    });
  },
  createOthers:function(page){
    new TextView({
      id:'moodText',
      left:20,top:['#notebook',20],
      text:'心情:',
    }).appendTo(page);
    new TextInput({
      id:'mood',
      left:['#moodText',10],top:['#notebook',15],
      message:'喜,怒,哀,乐...'
    }).appendTo(page);
    new TextView({
      id:'weatherText',
      left:20,top:['#moodText',20],
      text:'天气:'
    }).appendTo(page);
    new TextInput({
      id:'weather',
      left:['#weatherText',10],top:['#moodText',15],
      message:'阴,晴,雨,雪...'
    }).appendTo(page);
    new TextView({
      id:'locationText',
      left:20,top:['#weatherText',20],
      text:'地点:'
    }).appendTo(page);
    new TextInput({
      id:'location',
      left:['#locationText',10],top:['#weatherText',15],
      message:'写日记的地点...'
    }).appendTo(page);
    new TextView({
      id:'privacyText',
      left:20,top:['#locationText',20],
      text:'私密:'
    }).appendTo(page);
    var jwt = localStorage.getItem('jwt');
    var decode = jwtDecode(jwt);
    if(decode.data.emailnotallow){
      new TextView({
        text:'未绑定邮箱只允许发私密日记，请尽快激活邮箱',
        font:'thin normal 12px sans-serif',
        left:['#privacyText',10],top:['#locationText',21]
      }).appendTo(page);
    }else{
      this.privacy = new Switch({
        id: 'privacy',
        left:['#privacyText',10],top:['#locationText',15],
        checked:false
      }).appendTo(page);
    }
    new TextView({
      id:'allowCommentText',
      left:20,top:['#privacyText',20],
      text:'评论:'
    }).appendTo(page);
    new Switch({
      id: 'allowComment',
      left:['#allowCommentText',10],top:['#privacyText',15],
      checked:true 
    }).appendTo(page);
  },
  createFoot:function(page){
    var foot = new Composite({
      bottom:0,left:0,
      height:60,
      width:screen.width,
      background:config.themeColor.topBarColor
    }).appendTo(page);
    new Button({
      id:'textBtn',
      text:'插入文字',
      left:'prev() 10',
      top:10
    }).on('select',()=>{
      this.callText(page);
      this.page.scrollToY(0);
    }).appendTo(foot);
    new Button({
      id:'imgBtn',
      text:'插入图片',
      top:10,
      left:'prev() 10'
    }).on('select',()=>{
      this.callImg(page);
    }).appendTo(foot);
    //删除字段
    new Button({
      id:'save',
      top:10,
      left:'prev() 10',
      text:'发布'
    }).on('select',()=>{
      //保存发布
      var content = this.getContent();
      var bookid = this.notebookList[this.notebooks.selectionIndex]._id;
      var mood = this.page.find('#mood')[0].text.trim();
      var weather = this.page.find('#weather')[0].text.trim();
      var location = this.page.find('#location')[0].text.trim();
      var privacy = this.privacy ? this.privacy.checked : true;
      var allowComment = this.page.find('#allowComment')[0].checked;
      if(!content){
        return utils.alert('日记内容不能为空');
      }
      if(content.length > 22000){
        return utils.alert('日记长度不能超过22000字符');
      }
      if (location.length > 10 || weather.length > 10 || mood.length > 10) {
        return utils.alert('地点,天气,心情最多10个字');
      }
      utils.post('diary/save',{
        bookid:bookid,
        mood:mood,
        weather:weather,
        location:location,
        privacy:privacy ? 1 : 0,
        forbid:allowComment ? 0 : 1,
        content:content
      },(ret)=>{
        contentList = [];
        var childs = this.content.find("*");
        for(var i=0; i<childs.length;i++){
          childs[i].dispose();
        }
        utils.alert('发布成功!');
      });
    }).appendTo(foot);
  },
  createFiled:function(page){
    var msg = new TextView({
      id:'message',
      top:'prev() 10',
      left:10,
      text:'日记目前只支持图文形式,日记长度不超过22000字节',
      font:'thin normal 12px sans-serif',
    }).appendTo(page);
    this.content = new Composite({
      id:'content',
      top:'prev() 10',
      width:screen.width,
      left:0
    }).appendTo(page);
  },
  callText:function(page){
    var layer = new Composite({
      background:'#fff',
      right:0,bottom:0,
      top:0,left:0 
    }).appendTo(page);
    var msg = new TextView({
      top:10,
      left:10,
      text:'请输入文本:',
    }).appendTo(layer);
    var textinput = new TextInput({
      id:'textContent',
      type:'multiline',
      left:10,
      top:'prev() 10',
      width:screen.width - 20
    }).appendTo(layer);
    new Button({
      id:'textSave',
      text:'确定',
      top:['#textContent',10],
      left:10
    }).on('select',()=>{
      var text = textinput.text;
      this.createText(text);
      layer.dispose(); 
    }).appendTo(layer);
    new Button({
      id:'textCancel',
      text:'取消',
      top:['#textContent',10],
      left:['#textSave',10]
    }).on('select',()=>{
      layer.dispose(); 
    }).appendTo(layer);
  },
  callImg:function(page){
    //调用摄像头
    let onFail = message => utils.alert('Camera failed because: ' + message);
    navigator.camera.getPicture((img)=>{
      this.createImg(img);
    }, onFail, {
      quality: 70,
      targetWidth: 800,
      targetHeight: 800,
      correctOrientation:true,
      encodingType:window.Camera.EncodingType.PNG,
      sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: window.Camera.DestinationType.DATA_URL
    });
  },
  createText:function(text){
    var newText = new TextView({
      text:text,
      width:screen.width-20,
      left:10,
      top:'prev() 10'
    }).appendTo(this.content);
    var contentdata = {
      type:'text',
      value:text,
      v:Date.now()
    };
    var deleteBtn = new Button({
      text:'删除段落',
      top:'prev() 10',
      right:10
    }).on('select',()=>{
      newText.dispose();
      deleteBtn.dispose();
      _.remove(contentList,(item)=>{
        return item.v = contentdata.v;
      });
    }).appendTo(this.content);
    contentList.push(contentdata);
  },
  createImg:function(img){
    //upload image
    utils.post('images/upload',{data:encodeURIComponent(img)},(ret)=>{
      var imageinfo = ret.body.data;
      var contentdata = {
        type:'image',
        value:imageinfo.url,
        v:Date.now()
      };
      var newImg = new ImageView({
        top:'prev() 10',
        width:300,
        scaleMode: 'fill',
        left:10
      }).appendTo(this.content);
      var deleteBtn = new Button({
        text:'删除图片',
        top:'prev() 10',
        right:10
      }).on('select',()=>{
        newImg.dispose();
        deleteBtn.dispose();
        _.remove(contentList,(item)=>{
          return item.v = contentdata.v;
        });
      }).appendTo(this.content);
      contentList.push(contentdata);
      newImg.set('image',{src:imageinfo.url});
    });
  },
  getContent:function(){
    var html = '';
    var func = {
      text:function(val){
        return val;
      },
      image:function(val){
        return '<img src="'+val+'">';
      }
    };
    contentList.forEach((item)=>{
      html += '<p>'+func[item.type](item.value)+'</p>'
    });
    return html;
  }
}
