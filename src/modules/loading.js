const {
  Composite,
  TextView
} = require('tabris');

class loading {
  constructor (parent,txt){
    this.txt = txt || '...正在用绳命加载中...';
    this.status = false;
    this.parent = parent;
    this.el = new Composite({
      left:0,top:0,right:0,bottom:0
    });
    this.textEl = new TextView({
      centerY:0,
      centerX:0,
      width:screen.width,
      font:'normal normal 12px sans-serif',
      alignment:'center',
      text:this.txt
    }).appendTo(this.el);
  }
  show(){
    if(!this.status){
      this.el.appendTo(this.parent);
      this.status = true;
    }
  }
  hide(){
    if(this.status){
      this.el.dispose();
    }
  }
}

module.exports = loading;
