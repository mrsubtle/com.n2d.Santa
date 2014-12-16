/*
 * index.js
 */
var app = {
  d:{
    l:[]
  },
  init: function() {
    if (localStorage.logs){
      app.d.l = JSON.parse(localStorage.logs);
    }
    console.log("Local Log");
    console.log(app.d.l);
    app.bindEvents();
  },
  l: function(message,type){
    //function to log to console and message queue.
    //type == 0 (log) 1 (warn) 2 (error)
    var d = new Date();
    if (!type) { type = 0; }
    var log = {
      "date" : d.getTime(),
      "msg" : message,
      "type" : type
    };
    if (type == 2){
      console.error(log.date+'('+log.type+'): '+log.msg);
    } else if (type == 1) {
      console.warn(log.date+'('+log.type+'): '+log.msg);
    } else {
      console.log(log.date+'('+log.type+'): '+log.msg);
    }

    //add to localStorage Log
    app.d.l.push(log);
    localStorage.logs = JSON.stringify(app.d.l);
  },
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    app.remE();
    app.addE();
  },
  addE : function(){
    $('.touchable').on('touchstart mousedown',function(){
      $('.touchable').removeClass('touched');
      $(this).addClass('touched');
    });
    $('.touchable').on('touchend touchcancel mouseup',function(){
      $('.touchable').removeClass('touched');
    });
    $('.touchable').hammer().on('tap',function(e){
      e.preventDefault();
      //DEBUG:console.log(e);
      $(this).addClass()
    });
  },
  remE : function(){
    $('.touchable').off('touchstart mousedown');
    $('.touchable').off('touchend touchcancel mouseup');
    $('.touchable').hammer().off('tap');
  },
  onDeviceReady: function() {
    app.l('deviceready');
  }
};
