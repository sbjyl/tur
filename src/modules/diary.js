const {TextInput,ImageView,Composite,TextView,Button,ActivityIndicator,ScrollView} = require('tabris');
const utils = require('../utils');
const parse  = require('../utils/contentParse').parse;
const jwtDecode = require('jwt-decode');

class diary {
  constructor(parent){
    this.pageNumber = 0;  
    this.lock = false;
    this.parent = parent;
  }
  open(item,tab){
    this.diarydata = item;
    this.createDeatil(item,tab);
  }
  close(){
    this.view.dispose(); 
    this.page.dispose(); 
    this.diary.dispose(); 
    this.pageNumber = 0;
  }
  createDiary(view,item){
    let diary = new Composite({id:'diary'}).appendTo(view);
    this.diary = diary;
    let closeBtn = new Button({
      id:'closeBtn',
      top:10,
      left:15,
      width:screen.width - 30,
      height:40,
      textColor:'#fff',
      background:'#0273b1',
      alignment:'center',
      font:'normal normal 14px sans-serif',
      text:'返回上一页'
    }).on('select',()=>{
      this.close();
    }).appendTo(diary);
    new Composite({
      left: 15, top: 'prev() 10',
      width:screen.width - 30,
      height:1,
      background:'#eee'
    }).appendTo(diary);
    new ImageView({
      top:'prev() 10',
      left:15,
      width:30,
      height:30,
      cornerRadius:15,
      id:'avatar',
      background:'#e0e0e0',
      scaleMode:'fill',
      image:{
        src:item.author.avatar 
      }
    }).appendTo(diary);
    new TextView({
      top:['#closeBtn',30],
      font:'normal normal 14px sans-serif',
      textColor:'#8590a6',
      left:'prev() 10',
      id:'title',
      maxLines: 1,
      text:item.other,
    }).appendTo(diary);
    new TextView({
      id: 'notebook',
      text:'《'+item.notebook.name+'》',
      width: screen.width - 30,
      alignment: 'left',
      lineSpacing: '1.5',
      textColor:item.color,
      top:['#avatar' ,10],
      left: 55
    }).appendTo(diary);
    //开始content
    var list = parse(item.content);
    for(var i=0;i<list.length;i++){
      var contentItem = list[i];
      if(contentItem.type === 'text'){
        new TextView({
          text:contentItem.value,
          alignment: 'left',
          width: screen.width - 75,
          font:'light normal 14px sans-serif',
          lineSpacing: '1.5',
          top: 'prev() 15',
          left: 55
        }).appendTo(diary);
      }else if(contentItem.type === 'image'){
        new ImageView({
          background: '#e0e0e0',
          cornerRadius:10,
          image:{
            src:contentItem.value
          },
          scaleMode:'fill',
          width:300,
          top: 'prev() 15',
          left: 55
        }).appendTo(diary);
      }
    }
    //结束content
    new TextView({
      text:item.time,
      id:'time',
      width: screen.width - 30,
      alignment: 'left',
      font:'normal normal 12px sans-serif',
      textColor:'#8590a6',
      top: 'prev() 20',
      left: 55
    }).appendTo(diary);
    var jwt = localStorage.getItem('jwt');
    var decode = jwtDecode(jwt);
    if(item.author._id === decode.data._id){
      new Button({
        text:'删除',
        id:'delete',
        font:'normal normal 11px sans-serif',
        width:45,
        height:20,
        textColor:'#fff',
        background:'#da4f49',
        alignment: 'center',
        top: 'prev() 10',
        left: 55
      }).on('select',()=>{
        utils.confirm('确认删除吗?',()=>{
          utils.post('diary/remove',{
            diaryid:item._id
          },(ret)=>{
            utils.alert('删除日记成功');
            this.close();       
            this.parent.initRemote();
          }); 
        }); 
      }).appendTo(diary);
    }
    new Composite({
      left: 15, top: 'prev() 10',
      width:screen.width - 30,
      height:1,
      background:'#eee'
    }).appendTo(diary);
    diary.appendTo(view);
    return diary;
  }
  createDeatil(item,tab){
    let page = new Composite({
      top:0,left:0,right:0,bottom:0,
      background:'#fff'
    }).appendTo(tab);
    let view = new ScrollView({
      top:0,left:0,right:0,bottom:50,
    }).appendTo(page);
    this.view = view;
    this.page = page;
    this.createDiary(view,item);
    //创建评论 
    var activityIndicator = new ActivityIndicator({
      id:'loading',
      top: 'prev() -20',
      left:['#morebtn',10]
    });
    let commentComposite = this.createComment(item,view,page,activityIndicator);
    this.morebtn = new Button({
      id:'morebtn',
      top:'prev() 10',
      font:'normal normal 10px sans-serif',
      background:'#5bb75b',
      textColor:'#fff',
      width:90,
      height:20,
      text:'加载更多',
      left:15
    }).on('select',()=>{
      this.addComment(item,commentComposite,activityIndicator);
    }).appendTo(view);
    activityIndicator.appendTo(view);
  }
  addComment(item,commentComposite,activityIndicator){
    //获取评论信息 -> 返回第一页的
    if(!this.lock){
      this.lock = true;
      utils.get('comment/get',{
        count:5,
        page:this.pageNumber+1,
        did:item._id
      },(ret)=>{
        if(ret.body.data.length){
          if(this.pageNumber === 0){
            var childs = commentComposite.find("*");
            for(var i=0; i<childs.length;i++){
              childs[i].dispose();
            }
          }
          this.createCommentList(ret,commentComposite,activityIndicator);
          this.pageNumber+=1;
          this.lock = false;
        }else{
          this.morebtn.set({text:'没有评论了..'});
          setTimeout(()=>{
            this.morebtn.set({text:'加载更多'});
            this.lock = false;
          },1000);
        }
        activityIndicator.visible = false;
      });
    }
  }
  createComment(item,view,page,activityIndicator){
    var commentFlag = new TextView({
      top:'#diary 10',
      left:15,
      font:'medium normal 14px sans-serif',
      text:'评论列表'
    }).appendTo(view); 
    let commentComposite = new Composite({
      top:'prev() 0' 
    }).appendTo(view);
    this.addComment(item,commentComposite,activityIndicator);
    //评论
    if(item.forbid == '1'){
      let disableText = new TextView({
        bottom:15,
        text: '日记作者已禁止评论功能',
        font:'thin normal 12px sans-serif',
        width:screen.width,
        alignment:'center'
      }).appendTo(page);
    }else{
      let commentInput = new TextInput({
        bottom:5,
        height:40,
        borderColor:'#0273b1',
        width:screen.width - 85,
        message: '点击评论',
        left:10
      }).appendTo(page);
      let commentBtn = new Button({
        text:'回复',
        background:'#0273b1',
        textColor:'#fff',
        bottom:5,
        height:40,
        width:60,
        right:10
      }).on('select',()=>{
        var text = commentInput.text.trim();
        if(text.length > 200 || text.length === 0){
          utils.alert('评论字数限制0-200个字符'); 
          return;
        }
        var jwt = localStorage.getItem('jwt');
        var decode = jwtDecode(jwt);
        activityIndicator.visible = true;
        utils.post('comment/save',{
          content:text,
          related_id:item._id,
          userid:decode.data._id
        },(ret)=>{
          activityIndicator.visible = false;
          //单条，增加到最新的comment上方,insertBefore
          this.createCommentOne(commentComposite,ret.body.data,'insert');
          commentInput.set('text','');
          if(this.diary.bounds.height > screen.height){
            view.scrollToY(this.diary.bounds.height);
          }
        });
      }).appendTo(page);
    }
    return commentComposite;
  }
  createCommentOne(commentComposite,item,type){
    var comment = new Composite({
      top:'prev() 10',
      left:15,
      width:screen.width - 30
    });
    var avatar = new ImageView({
      top:0,
      left:0,
      width:20,
      height:20,
      background:'#e0e0e0',
      scaleMode:'fill',
      image:{
        src:item.author.avatar
      }
    }).appendTo(comment);
    var nick = new TextView({
      left:'prev() 5',
      font:'normal normal 12px sans-serif',
      textColor:'#8590a6',
      top:4,
      text:item.author.nick + ' ('+(item.author.profile || 'nothing yet~')+')'
    }).appendTo(comment);
    var content = new TextView({
      top:'prev() 20',
      font:'light normal 14px sans-serif',
      left:25,
      right:15,
      text:item.content
    }).appendTo(comment);
    var time = new TextView({
      text:item.created_at,
      alignment: 'left',
      font:'normal normal 12px sans-serif',
      textColor:'#8590a6',
      top: 'prev() 20',
      left: 25
    }).appendTo(comment);
    var jwt = localStorage.getItem('jwt');
    var decode = jwtDecode(jwt);
    if(item.author._id === decode.data._id){
      var removeBtn = new Button({
        text:'删除',
        font:'normal normal 11px sans-serif',
        width:45,
        height:20,
        textColor:'#fff',
        background:'#da4f49',
        alignment: 'center',
        top: 'prev() 10',
        left: 25
      }).on('select',()=>{
        utils.confirm('确认删除吗?',()=>{
          utils.post('comment/remove',{
            diaryid:this.diarydata._id,
            commentid:item._id
          },(ret)=>{
            utils.alert('删除评论成功');
            this.close();
            this.parent.initRemote();
          });
        });
      }).appendTo(comment);
    }
    new Composite({
      left: 15, top: 'prev() 10',
      width:screen.width - 30,
      height:1,
      background:'#eee'
    }).appendTo(comment);
    if(type === 'append'){
      comment.appendTo(commentComposite);
    }else if(type === 'insert'){
      var first = commentComposite.children().first()
      if(first){
        comment.insertBefore(first);
      }else{
        comment.appendTo(commentComposite);
      }
    }
  }
  createCommentList(ret,commentComposite){
    ret.body.data.forEach((item)=>{
      this.createCommentOne(commentComposite,item,'append');
    });
  }
}

module.exports = diary;
