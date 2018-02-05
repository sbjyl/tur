const listView = require('./list');

module.exports = {
  init: function(tab, title) {
    new listView(tab,title,{
      api:'diary/followers'
    });
  }
}
