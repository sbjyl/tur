var contentParse = module.exports = {
  parse:function(html){
    var list = [];
    var tagStart = false;
    var split = 0;
    var pos = [0];
    var len = html.length;
    var currentPos = 0;
    for(currentPos=0;currentPos<len;currentPos++){
      var c = html.charAt(currentPos);
      if(c === '<' && !tagStart){
        tagStart = true;
        split = currentPos;
      }
      if(tagStart && c === '>'){
        pos.push(split);
        pos.push(currentPos + 1);
        tagStart = false; 
      }
    }
    pos.push(html.length);
    var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
    for(var i=0;i<pos.length;i++){
      var end = pos[i + 1];
      if(end){
        var str = html.slice(pos[i],end)
        if(str){
          if(/^\<img/.test(str)){
            var src = str.match(srcReg)[1];
            src = src.replace(/w=600&amp;h=600/g,'w=400&h=400');
            list.push({type:'image',value:src});
          }else{
            list.push({type:'text',value:str}); 
          }
        }
      }
    }
    return list;
  }
}
