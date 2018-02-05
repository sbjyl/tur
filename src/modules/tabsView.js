const {
  Tab,
  TabFolder,
  TextView,
  ui
} = require('tabris');
const Lodash = require('lodash');
const config = require('../config');

class tabView {
  constructor (){
    ui.statusBar.background = config.themeColor.topBarColor;
    this.el = new TabFolder({
      background:config.themeColor.topBarColor,
      textColor:config.themeColor.topBarFontColor,
      tabBarLocation:'top',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    });
    this.tabs = [{
      title:'我的',
      content:require('./index')
    }
    /*
    ,{
      title:'关注',
      content:require('./followers')
    }
    */
    /*
    ,{
      title:'提醒',
      content:require('./tip')
    }
    */
    ,{
      title:'发现',
      content:require('./goods')
    },{
      title:'写日记',
      content:require('./write')
    },{
      title:'设置',
      content:require('./set')
    }];
    this.el.appendTo(ui.contentView);
    this.tabs.forEach((tabObj)=>{
      tabObj.tab = this.createTab(tabObj);
    });
    this.initTab(this.tabs[0],this.tabs[0].tab);
    this.tabs[0].init = true;
    this.el.on('select',({selection:tab})=>{
      var obj = Lodash.find(this.tabs,['title',tab.title]);
      if(!obj.init){
        this.initTab(obj,tab);
        obj.init = true;
      }
    });
  }
  initTab(obj,tab){
    obj.content.init(tab,obj.title,this.el);
  }
  createTab(source) {
    let tab = new Tab({
      background:'#fff',
      title: source.title // converted to upper-case on Android
      //image: {src: image, scale: 2},
      //selectedImage: {src: seletedImage, scale: 2}
    }).appendTo(this.el);
    return tab;
  }
  destory(){
    this.el.dispose();
    this.tabs.forEach((tabObj)=>{
      tabObj.tab.dispose();
    })
  }
}

module.exports = {
  constant:null,
  init:function(){
    if(!this.constant) this.constant = new tabView();
  },
  destory:function(){
    if(this.constant){
      this.constant.destory(); 
      this.constant = null;
    }
  }
};

