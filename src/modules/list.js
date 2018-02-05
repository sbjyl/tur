const {
  Composite,
  ImageView,
  fs,
  TextView,
  CollectionView
} = require('tabris');

const loading = require('./loading');
const utils = require('../utils');
const diary = require('./diary');

function emptyCell(){
  return new TextView({
    centerY: 0,
    alignment: 'center',
    font:'normal normal 12px sans-serif',
    text: 'There is nothing yet!'
  });
}

function createLoadingCell() {
  return new TextView({
    centerY: 0,
    alignment: 'center',
    font:'normal normal 12px sans-serif',
    text: '...Loading...'
  });
}

function createListCell(){
  let cell = new Composite();
  new ImageView({
    top: 8,
    left: 15,
    width: 30,
    height: 30,
    cornerRadius:15,
    background: '#e0e0e0',
    id: 'itemAvatar',
    scaleMode: 'fill',
  }).appendTo(cell);
  new TextView({
    top: 15,
    font:'normal normal 12px sans-serif',
    textColor:'#8590a6',
    left: 'prev() 10',
    right:10,
    maxLines: 1,
    id: 'other'
  }).appendTo(cell);
  new TextView({
    id: 'notebook',
    font:'light normal 12px sans-serif',
    width: screen.width - 30,
    alignment: 'left',
    lineSpacing: '1.5',
    top: ['#other',10],
    left: 50
  }).appendTo(cell);
  var content = new TextView({
    id: 'content',
    right:15,
    maxLines:1,
    font:'light normal 14px sans-serif',
    height:16,
    alignment: 'left',
    lineSpacing: '1.5',
    top: ['#notebook',10],
    left: 50
  }).appendTo(cell);
  new ImageView({
    top: 'prev() 10',
    left: 50,
    right:35,
    height: 150,
    cornerRadius:5,
    id: 'itemImage',
    scaleMode: 'fill',
    background: '#e0e0e0'
  }).appendTo(cell);
  new TextView({
    id: 'time',
    width: screen.width - 30,
    font:'normal normal 12px sans-serif',
    textColor:'#8590a6',
    alignment: 'left',
    top: 'prev() 10',
    left: 50
  }).appendTo(cell);
  new Composite({
    left: 10, top: 'prev() 10',
    right: 10,
    height:1,
    background:'#eee'
  }).appendTo(cell);
  return cell;
}

function createCell(cell, diary) {
  if(diary.img){
    cell.find('#itemImage').set({
      'image': {
        src: diary.img
      },
      'visible':true,
      'height':150
    });
  }else{
    cell.find('#itemImage').set({
      'visible':false,
      'height':0
    });
  }
  cell.find('#itemAvatar').set('image', {
    src: diary.author.avatar
  });
  var content = cell.find('#content');
  diary.shortContent = diary.content.replace(/(&nbsp;|\s\s+|\s$|^\s)/g, '').replace(/<\/?[^>]*>/g,'');
  content.set({
    'text': diary.shortContent
  });
  cell.find('#notebook').set('text', '《'+diary.notebook.name+'》');
  var time = diary.created_at + ' 浏览:' + diary.view + ' 回复:' + diary.commentcount + ' 喜欢:' + diary.assist.length;
  diary.time = time;
  cell.find('#time').set('text', time);
  var mood = diary.mood ? ' 心情:' + diary.mood: '';
  var weather = diary.weather ? ' 天气:' + diary.weather: '';
  var location = diary.location ? ' 地点:' + diary.location: '';
  var other = diary.author.nick + mood + weather + location;
  if(diary.privacy){
    other += ' 私密日记'; 
  }
  var color = diary.notebook.bgcolor ? '#'+diary.notebook.bgcolor : '#4d67d1';
  diary.other = other;
  diary.color = color;
  cell.find('#notebook').set('textColor',color);
  cell.find('#other').set('text', other);
}

const loadCount = 10;

class views {
  fixnone (){
    if(this.items.length) {
      for(var i=0;i<this.items.length;i++){
          var item = this.items[i];
          if(item.nothing){
            this.items.splice(i,1);
            if(this.view){
              this.view.remove(i,1);
              this.view.refresh();
            }
            break;
          }
      }
    }else{
      this.items.push({nothing:true}); 
    }
  }
  initRemote () {
    if(this.status === 'loaded'){
      this.status = 'loading';
      if(this.view){
        this.view.refreshIndicator = true;
      }
      utils.get(this.api, {
        count: loadCount,
        page:1
      },
      (ret) => {
        if(!this.view){
          this.items = ret.body.data;
          this.fixnone();
          this.view = this.createView(this.items.length);
          this.view.appendTo(this.el);
        }else{
          this.view.remove(0,this.items.length);
          this.view.refresh();
          this.items = ret.body.data;
          this.fixnone();
          this.view.load(this.items.length);
        }
        this.view.refreshIndicator = false;
        this.status = 'loaded';
        this.loading.hide();
      });
    }
  }
  loadRemote(){
    if(this.status === 'loaded'){
      this.status = 'loading';
      this.items.push({loading: true});
      this.view.insert(this.items.length, 1);
      utils.get(this.api,{
        count:loadCount,
        page:this.page + 1
      },(ret)=>{
        this.items.splice(this.items.length - 1, 1);
        this.view.remove(-1);
        this.status = 'loaded';
        var insertIndex = this.items.length;
        var len = ret.body.data.length;
        this.items = this.items.concat(ret.body.data);
        this.view.insert(insertIndex,len);
        this.page = this.page + 1;
      })
    }
  }
  createView (count){
    var cellsview = new CollectionView({
      left: 0,
      background:'#fff',
      top: 'prev() 2',
      right: 0,
      bottom: 0,
      refreshEnabled:true,
      itemCount: count,
      cellHeight:(index,cellType)=>{
        if(cellType === 'loading'){
          return 80;
        }else{
          return this.items[index].img ? 280 : 130;
        }
      },
      cellType: (index) =>{
        var item = this.items[index];
        if(item.loading) return 'loading';
        if(item.nothing) return 'nothing';
        return 'normal';
      },
      createCell: (type) => {
        if(type === 'normal'){
          return createListCell();
        }else if(type === 'loading'){
          return createLoadingCell();
        }else{
          return emptyCell();
        }
      },
      updateCell: (cell, index) => {
        let diary = this.items[index];
        if(diary && !diary.loading && !diary.nothing){
            createCell(cell, diary);
        }
      }
    }).on('scroll',({target: scrollView, deltaY})=>{
        if (deltaY > 0) {
          let remaining = this.items.length - scrollView.lastVisibleIndex;
          if (remaining < loadCount) {
            this.loadRemote();
          }
        }
    }).on('refresh',()=>{
      this.initRemote();
    }).on('select',({index})=>{
      var item = this.items[index];
      if(item.id){
        this.openDetail(item);
      }
    });
    return cellsview;
  }
  openDetail(item){
    new diary(this).open(item,this.tab);
  }
  constructor(tab, title, options) {
    this.page = 1;
    this.el = new Composite({
      left: 0, top: 0, bottom: 0, right: 0
    });
    new TextView({
      top: 15,
      left: 20,
      font:'light normal 18px sans-serif',
      text: title
    }).appendTo(this.el);
    new Composite({
      left: 10, top: 'prev() 15',
      right: 10,
      height:1,
      background:'#eee'
    }).appendTo(this.el);
    this.tab = tab;
    this.status = 'loaded';
    this.loading = new loading(this.el);
    this.items = [];
    this.api = options.api;
    //请求数据，渲染列表
    this.el.appendTo(tab);
    this.loading.show();
    this.initRemote();
  }
};

module.exports = views;
