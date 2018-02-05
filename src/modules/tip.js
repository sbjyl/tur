const {
  TextView,
  Composite,
  NavigationView,
  Page
} = require('tabris');
module.exports = {
  init:function(tab,title){
    return new Composite({
      left: 0, top: 0, right: 0, bottom: 0
    }).appendTo(tab);
  }
}
