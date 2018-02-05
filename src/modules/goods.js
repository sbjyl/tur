const listView = require('./list');

module.exports = {
  init: function(tab, title) {
    return new listView(tab,title,{
      api:'diary/goods'
    });
  }
}
