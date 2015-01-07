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
      $('#btn_signup').hammer().on('tap', function(e){
        //tapped the signup button
        app.showScreen($('section#signup'),true);
        e.preventDefault();
      });
    },
    remE : function(){
      $('#frm_Login').off('submit');
      $('#btn_signup').hammer().off('tap');
    },
    doLogin : function(){
      //place the Login code here
      Parse.User.logIn($('#frm_Login #txt_username').val(), $('#frm_Login #txt_password').val(), {
        success: function(u) {
          user.parse = u;
          localStorage.setItem('user',JSON.stringify(user));
          // Do stuff after successful login.
          app.showScreen($('section#start'),true);
          $('input').blur();
        },
        error: function(u, error) {
          // The login failed. Check error to see why.
          if(error.code == 101){
            $('#lbl_loginError').html('nope!');
            $('#lbl_loginError').removeClass('clear');
            setTimeout(function(){
              $('#lbl_loginError').addClass('clear');
            },5000);
          }
          console.error(error);
        }
      });
    }
  },
  signup : {
    init : function(){
      pages.signup.remE();
      pages.signup.addE();
    },
    addE : function(){
      $('#frm_signup').on('submit', function(e){
        //app.l('Signup submitted');
        pages.signup.doSignUp();
        e.preventDefault();
      });
      $('#frm_signup #txt_passwordConfirm').on('keyup',function(){
        if($(this).val() == $('#frm_signup #txt_password').val()){
          $(this).removeClass('bad');
          $(this).addClass('good');
        } else {
          $(this).removeClass('good');
          $(this).addClass('bad');
        }

        //if there are no "bad" fields, enable the submit
        if($('#frm_signup .bad').length == 0){
          $('#frm_signup #btn_submit-signup').prop('disabled',false);
        } else {
          $('#frm_signup #btn_submit-signup').prop('disabled',true);
        }
      });
    },
    remE : function(){
      $('form#frm_signup').off('submit');
      $('#frm_signup #txt_passwordConfirm').off('keyup');
    },
    doSignUp : function(){
      user.parse = new Parse.User();
      user.parse.set("username", $('#txt_username').val());
      user.parse.set("password", $('#txt_password').val());
      user.parse.set("email", $('#txt_email').val());

      // other fields can be set just like with Parse.Object
      user.parse.set("firstName", $('#txt_firstName').val());
      user.parse.set("lastName", $('#txt_lastName').val());
      user.parse.set("displayName", $('#txt_firstName').val()+" "+$('#txt_lastName').val().substr(0,1)+".");

      user.parse.signUp(null, {
        success: function(user) {
          // Hooray! Let them use the app now.
          pages.start.getData(function(){
            //success
            pages.start.init();
          },function(){
            //fail
            //display an error
            console.error("Could not load Start screen");
          });
        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          $('#lbl_signupError').html(error.message);
          $('#lbl_signupError').removeClass('clear');
          app.l(error,2);
          setTimeout(function(){
            $('#lbl_signupError').addClass('clear');
          },5000);
        }
      });
    }
  },
  start : {
    init : function(callback){
      pages.start.getData(pages.start.render,false);
      //
      //execute callback if defined
      if(callback){
        callback();
      }
    },
    addE : function(){
      $('#santaList li').hammer().on('tap',function(e){
        app.meta.currentPersonObjectID = $(this).attr('id');
        pages.personWishList.getData(app.showScreen($('section#personWishList'),false),function(){
          app.l('Failed to get person data',2);
        });
      });
    },
    remE : function(){
      $('#santaList li .front').hammer().off('tap');
    },
    render: function(callback){
      //update the navbar title for the start page & wish list page
      var title = user.parse.get('username')+"'s "+$('section#start').data('title');
      $('nav#top .right').html(title);

      if(user.santaList.length > 0){
        $('.screen#start #santaList').html("");
        $.each(user.santaList,function(i,v){
          var template = _.template( $('#tpl_start_listItem').html() );
          $('.screen#start #santaList').append(template(v));
        });

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
          //sort results by the 'eventAt' date property, and update the localobject
          user.santaList = _.sortBy(d, function(o) { return -o.eventAt; });
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
  },
  personWishList : {
    init : function(){},
    addE : function(){},
    remE : function(){},
    render : function(){},
    getData : function(successCallback,failCallack){
      var url = "js/person-"+app.meta.currentPersonObjectID+".json";
      $.getJSON(url,function(d){
        //success
      }).done(function(d){
        //anal-retention success
        console.log(d);
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
  settings : {
    init : function(){
      pages.settings.remE();
      pages.settings.addE();
      pages.settings.render();
    },
    addE : function(){
      $('section#settings #btn_logout').hammer().on('tap',function(){
        app.exit();
      });
      $('section#settings #btn_cancel').hammer().on('tap',function(){
        app.showScreen($('section#login'));
      });
    },
    remE : function(){
      $('section#settings #btn_logout').hammer().off('tap');
      $('section#settings #btn_cancel').hammer().off('tap');
    },
    render : function(){
      //nothing to render yet
    },
    getData : function(successCallback,failCallack){
      //get remote settings?
    }
  }
};

var app = {
  meta:{
    "currentPersonObjectID" : ""
  },
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
    app.bindEvents();

    user.parse = Parse.User.current();
    //check if the user's token exists, and is still valid through Parse
    if(user.parse){
      //load the user data
      app.showScreen($('section.screen#start'),true);
    } else {
      //load the login screen
      app.showScreen($('section.screen#login'),true);
    }
  },
  exit: function(){
    Parse.User.logOut();
    user.parse = Parse.User.current();
    localStorage.setItem('user',JSON.stringify(user));
    location.reload(true);
  },
  showScreen: function(s,animateBoolean,callBack){
    if(animateBoolean){
      //animate crap
      $('section.screen:not(.hidden)').each(function(){
        $(this).addClass('animate300').addClass('clear');
        $(this).one('webkitTransitionEnd',function(){
          $(this).addClass('hidden');
          $(this).removeClass('animate300').removeClass('clear');
        });
      });
    } else {
      //toggle crap
      $('section.screen').each(function(){
        $(this).addClass('hidden').addClass('clear');
      });
    }

    //set the nav#top title
    if (s.data('title')) {
      $('nav#top .right').html(s.data('title'));
    } else {
      $('nav#top .right').html('Shh Santa!');
    }

    //show the nav#top left action icon
    $('nav#top .left i').addClass('clear');
    $('nav#top .left i').addClass('hidden');
    if (s.data('nav-icon')) {
      $('nav#top .left i[id='+s.data('nav-icon')+']').removeClass('hidden');
      setTimeout(function(){
        $('nav#top .left i[id='+s.data('nav-icon')+']').removeClass('clear');
      },10);
    }

    //set all tab img to "off"
    $('nav#tab .item img.off').each(function(i){
      $(this).removeClass('hidden');
    });
    $('nav#tab .item img.on').each(function(i){
      $(this).addClass('hidden');
    });
    //set the selected tab img to "on"
    $('nav#tab .item[data-screen='+s.attr('id')+'] img.off').addClass('hidden');
    $('nav#tab .item[data-screen='+s.attr('id')+'] img.on').removeClass('hidden');

    //ready to show the screen

    if(animateBoolean){
      //animate crap
      s.addClass('clear').removeClass('hidden').addClass('animate300');
      setTimeout(function(){
        s.removeClass('clear');
      },10);
      s.one('webkitTransitionEnd',function(){
        s.removeClass('animate300');
      });
    } else {
      //toggle crap
      s.removeClass('clear').removeClass('hidden');
    }


    //custom page events
    switch (s.attr('id')) {
      case 'login':
        pages.login.init();
        break;
      case 'start':
        pages.start.init();
        break;
      case 'signup':
        pages.signup.init();
        break;
      case 'settings':
        pages.settings.init();
        break;
      default:
        console.log(s.attr('id'));
    }

    if(s.data("nav")==true){
      $('nav#top').removeClass('hidden');
    }
    if(s.data("tabbar")==true){
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
    //tab bar item actions
    $('nav#tab .item').hammer().on('tap',function(e){
      var s = $('section.screen#'+$(this).data('screen'));
      //console.log('Loading: '+$(this).data('screen'));
      app.showScreen(s,false);
    });
  },
  remE : function(){
    $('.touchable').off('touchstart mousedown');
    $('.touchable').off('touchend touchcancel mouseup');
    $('.touchable').hammer().off('tap');
    $('.shakeable').off('touchstart mousedown');
    $('.shakeable').off('touchend touchcancel mouseup');
    //tab bar item actions
    $('nav#tab .item').hammer().off('tap');
  },
  onDeviceReady: function() {
    app.s('deviceready');
  }
};

var user = {
  parse : null,
  name : "Richard",
  santaList : [],
  eventList : [],
  wishList : []
};
