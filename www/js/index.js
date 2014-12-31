/*
 * index.js
 */

var pages = {
  login : {
    init : function(){
      pages.login.remE();
      pages.login.addE();
    },
    addE : function(){
      $('#frm_Login').on('submit', function(e){
        //app.l('Login submitted');
        pages.login.doLogin();
        e.preventDefault();
      });
    },
    remE : function(){
      $('#frm_Login').off('submit');
    },
    doLogin : function(){
      //place the Login code here
      pages.start.getData(function(){
        //success
        pages.start.init();
      },function(){
        //fail
        //display an error
        console.error("Could not load Start screen");
      });
    }
  },
  signup : {
    init : function(){},
    addE : function(){},
    remE : function(){}
  },
  start : {
    init : function(callback){
      pages.start.render(function(){
        //show the start screen if data exists
        app.showScreen( $('section.screen#start'), 1 );
      });
      //
      //execute callback if defined
      if(callback){
        callback();
      }
    },
    addE : function(){
      $('#santaList li').hammer().on('press',function(e){
        $(this).oriDomi('accordion', 60, 'left');
        $(this).addClass('folded');
        //window.alert('tapped item');
      });
      $('#santaList li').hammer().on('pressup',function(e){
        $(this).oriDomi('accordion', 0);
        $(this).removeClass('folded');
        //window.alert('tapped item');
      });
      $('#santaList li').hammer().on('tap',function(e){
        $(this).oriDomi('accordion', 0);
        $(this).removeClass('folded');
        //window.alert('tapped item');
      });
    },
    remE : function(){
      $('#santaList li').hammer().off('tap press pressup');
    },
    render: function(callback){
      if(user.santaList.length > 0){
        $('.screen#start #santaList').html("");
        $.each(user.santaList,function(i,v){
          var template = _.template( $('#tpl_start_listItem').html() );
          $('.screen#start #santaList').append(template(v));
        });
        //init oriDomi on items in the list
        var $santaPaper = $('#santaList li').oriDomi({
          hPanels: 4,
          vPanels: 4,
          shading: 'soft', //soft, hard, false
          shadingIntensity: 0.5,
          speed: 300, //in ms
          maxAngle: 50, //do not exceed 90
          easingMethod: 'cubic-bezier(.11,1,.97,1)',
          gapNudge: 0.55,
          touchEnabled: false
        });
        $santaPaper.oriDomi('accordion', 0, 'left');
        //init start page events
        pages.start.remE();
        pages.start.addE();
        //re-init global app events
        app.remE();
        app.addE();
      }
      //
      //execute callback if defined
      if(callback){
        callback();
      }
    },
    getData : function(successCallback,failCallack){
      var url = "js/santaList.json";
      $.getJSON(url,function(d){
        //success
      }).done(function(d){
        //anal-retention success
        user.santaList = d;
        if(successCallback){
          successCallback();
        }
      }).fail(function(d){
        //failover
        app.l(d,2);
        if(failCallack){
          failCallack();
        }
      }).always(function(){
        //do this no matter what
      });
    }
  },
  wishList : {
    init : function(){},
    addE : function(){},
    remE : function(){}
  },
  events : {
    init : function(){},
    addE : function(){},
    remE : function(){}
  },
  items : {
    init : function(){},
    addE : function(){},
    remE : function(){}
  }
};

var app = {
  d:{
    s3:{
      key : 'SEM3B276C4B7FC81D24558D608D8121DF6AA',
      secret : 'YjQ1NTMzNDRmMTNmMzQyNzgyMjhlOWQ1ODVjMThlZGM',
      productURI : 'https://api.semantics3.com/v1/products?q=',
      productTestURI : 'https://api.semantics3.com/test/v1/products?q='
    },
    //session log
    s:[],
    //persistent log
    l:[]
  },
  init: function() {
    localStorage.sessionLog = "";
    if (localStorage.logs){
      app.d.l = JSON.parse(localStorage.logs);
    }
    console.log("Local Log Contents");
    console.log(app.d.l);
    app.bindEvents();

    //Setup Parse Models and Collections

    //transient app state, not persisted to Parse (although it could be)
    var AppState = Parse.Object.extend("AppState", {
      defaults: {
        filter: "all"
      }
    });
    var Event = Parse.Object.extend("Event",{
      //instance methods
      initialize: function(attrs,options){
        this.title = "Event title";
        this.description = "Our Secret Santa Event";
        this.eventAt = new Date();
        this.createdAt = new Date();
      }
    }, {
      //class methods
    });


    //begin rendering the app
    app.showScreen($('section.screen#login'),1);
  },
  showScreen: function(s,animateBoolean,callBack){
    //hide all the other screens
    $('section.screen:not(.hidden)').each(function(){
      $(this).addClass('animate300').addClass('clear');
      $(this).one('webkitTransitionEnd',function(){
        $(this).addClass('hidden');
        $(this).removeClass('animate300').removeClass('clear');
      });
    });
    //ready to show the screen
    s.addClass('clear').removeClass('hidden').addClass('animate300');
    setTimeout(function(){
      s.removeClass('clear');
    },10);
    s.one('webkitTransitionEnd',function(){
      s.removeClass('animate300');
    });

    //custom page events
    switch (s.attr('id')) {
      case 'login':
        pages.login.init();
        break;
      default:
        console.log(s.attr('id'));
    }

    if(s.data("nav")==true){
      $('nav#top').removeClass('hidden');
    }
    if(s.data("tabBar")==true){
      $('nav#tab').removeClass('hidden');
    }

    if (callBack) {
      callBack();
    }
  },
  s: function(message,type){
    //function to log to console and message session queue.
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
      app.d.s.push(log);
      localStorage.sessionLog = JSON.stringify(app.d.s);
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
      $(this).addClass();
    });
    $('.shakeable').on('touchstart mousedown',function(){
      $('.shakeable').removeClass('shake');
      $(this).addClass('shake');
    });
    $('.shakeable').on('touchend touchcancel mouseup',function(){
      $('.shakeable').removeClass('shake');
    });
  },
  remE : function(){
    $('.touchable').off('touchstart mousedown');
    $('.touchable').off('touchend touchcancel mouseup');
    $('.touchable').hammer().off('tap');
    $('.shakeable').off('touchstart mousedown');
    $('.shakeable').off('touchend touchcancel mouseup');
  },
  onDeviceReady: function() {
    app.s('deviceready');
  }
};

var user = {
  name : "Richard",
  santaList : [],
  eventList : [],
  wishList : []
};
