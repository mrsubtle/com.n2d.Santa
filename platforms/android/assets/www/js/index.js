/*
 * index.js
 */
var modals = {
  mdl_item_create : {
    el : "#mdl_item_create",
    hide : function(){
      this.remE();
      $('group.modalContainer').one('webkittransitionend transitionend',function(){
        $(modals.mdl_item_create.el).addClass('hidden');
        setTimeout(function(){
          //reset the modal
          $('#frm_item_create')[0].reset();
          $(modals.mdl_item_create.el + ' #item_create_photoContainer').html('');
          $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').addClass('hidden');
        },1);
      });
      $('group.modalContainer').addClass('modalOff');
      $('.app').toggleClass('tilt');
    },
    show : function(){
      $('.app').toggleClass('tilt');
      modals.mdl_item_create.remE();
      modals.mdl_item_create.addE();
      modals.mdl_item_create.render();
      $(modals.mdl_item_create.el + ' content').scrollTop(0);
      $(modals.mdl_item_create.el + ' #item_create_photoContainer').html('');
      $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').addClass("hidden");
    },
    addE : function() {
      $(modals.mdl_item_create.el + ' #frm_item_create').on('submit',function(e){
        e.preventDefault();
      });
      $(modals.mdl_item_create.el + ' #btn_cancel').hammer().on('tap',function(e){
        modals.mdl_item_create.hide();
        e.preventDefault();
      });
      $(modals.mdl_item_create.el + ' #btn_save').hammer().on('tap',function(e){
        modals.mdl_item_create.setData();
        e.preventDefault();
      });
      $(modals.mdl_item_create.el + ' #txt_upc').on('blur',function(e){
        var upc = $(modals.mdl_item_create.el + ' #txt_upc').val();
        if(upc != "" || upc != null){
          try {
            util.getDataUPC(upc,function(d){
              $(modals.mdl_item_create.el + ' #lbl_barcodeStatus').html('...item found!');
              //if an image is available, pre-load the image
              if( d.images.length >= 1 ){
                util.convertImgToBase64(d.images[0],function(base64string){
                  var v = {
                    uri : base64string
                  };
                  var tpl = _.template( $('#tpl_item_create_photo').html() );
                  $(modals.mdl_item_create.el + ' #item_create_photoContainer').html(tpl(v));
                  $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').removeClass("hidden");
                });
              }
              //populate the item name
              $(modals.mdl_item_create.el + ' #txt_name').val(d.name);
            },function(e){
              var obj = $(modals.mdl_item_create.el + ' #lbl_barcodeStatus');
              var objMsg = obj.html();
              obj.html('...item info not found. :(');
              setTimeout(function(){
                obj.html(objMsg);
              },3000);
            });
          } catch (e) {
            //DEBUG
            console.log(e);
          }
        }
      });
      $(modals.mdl_item_create.el + ' #btn_scanBarcode').hammer().on('tap',function(e){
        var lblO = $(modals.mdl_item_create.el + ' #frm_item_create #lbl_barcodeStatus');
        var tmpLbl = lblO.html();
        lblO.html( $('#tpl_loading').html() );
        //scan that code!
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if(result.cancelled == 0){
              lblO.html('...successful scan...');
              $('#frm_item_create #txt_upc').val(result.text);
              var upc = result.text;
              if(upc != "" || upc != null){
                util.getDataUPC(upc,function(d){
                  //if an image is available, pre-load the image
                  if( d.images.length >= 1 ){
                    util.convertImgToBase64(d.images[0],function(base64string){
                      var v = {
                        uri : base64string
                      };
                      var tpl = _.template( $('#tpl_item_create_photo').html() );
                      $(modals.mdl_item_create.el + ' #item_create_photoContainer').html(tpl(v));
                      $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').removeClass("hidden");
                    });
                  }
                  //populate the item name
                  $(modals.mdl_item_create.el + ' #txt_name').val(d.name);

                },function(e){
                  //DEBUG
                  console.log(e);
                });
              }
            } else {
              lblO.html(tmpLbl);
            }
            //DEBUG
            console.log(result);
          },
          function (error) {
            lblO.html(tmpLbl);
            app.e("Oops! Scan seems to have failed, but don't worry - we'll fix it. Eventiually.");
            //DEBUG
            console.log(error);
          }
        );
        e.preventDefault();
      });
      $(modals.mdl_item_create.el + ' #btn_takeItemPhoto').hammer().on('tap',function(e){
        navigator.camera.getPicture(function(imgData){
          //success!
          var v = {
            uri : "data:image/png;base64," + imgData
          };
          var tpl = _.template( $('#tpl_item_create_photo').html() );
          $(modals.mdl_item_create.el + ' #item_create_photoContainer').html(tpl(v));
          $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').removeClass("hidden");
        }, function(error){
          //fail :(
          app.e('Can\'t take a picture.  I don\'t know why.  Do you?');
        }, {
          quality: 80,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          targetWidth: 1024,
          targetHeight: 1024,
          encodingType: Camera.EncodingType.PNG,
          cameraDirection: Camera.Direction.BACK
        });
        e.preventDefault();
      });
      $(modals.mdl_item_create.el + ' #btn_selectItemPhoto').hammer().on('tap',function(e){
        navigator.camera.getPicture(function(imgData){
          //success!
          var v = {
            uri : "data:image/png;base64," + imgData
          };
          var tpl = _.template( $('#tpl_item_create_photo').html() );
          $(modals.mdl_item_create.el + ' #item_create_photoContainer').html(tpl(v));
          $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').removeClass('hidden');
        }, function(error){
          //fail :(
          app.e("Umm... This is embarassing. I can't open the gallery.  I don't know why.  Do you?");
        }, {
          quality: 80,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          targetWidth: 1024,
          targetHeight: 1024,
          encodingType: Camera.EncodingType.PNG
        });
        e.preventDefault();
      });
      $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').hammer().on('tap',function(e){
        $(modals.mdl_item_create.el + ' #item_create_photoContainer').html('');
        $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').addClass('hidden');
        e.preventDefault();
      });
    },
    remE : function() {
      $(modals.mdl_item_create.el + ' #frm_item_create').off('submit');
      $(modals.mdl_item_create.el + ' #btn_cancel').hammer().off('tap');
      $(modals.mdl_item_create.el + ' #btn_save').hammer().off('tap');
      $(modals.mdl_item_create.el + ' #txt_upc').off('blur');
      $(modals.mdl_item_create.el + ' #btn_scanBarcode').hammer().off('tap');
      $(modals.mdl_item_create.el + ' #btn_takeItemPhoto').hammer().off('tap');
      $(modals.mdl_item_create.el + ' #btn_selectItemPhoto').hammer().off('tap');
      $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').hammer().off('tap');
    },
    render : function(){
      //unhide the appropriate modal
      $(modals.mdl_item_create.el).removeClass('hidden');
      //animate modal container
      $('group.modalContainer').removeClass('modalOff');
    },
    setData : function(){
      var Item = Parse.Object.extend("Item");
      var newItem = new Item();
      newItem.set('owner',Parse.User.current());
      newItem.set('name',$(modals.mdl_item_create.el+" #txt_name").val());
      newItem.set('description',$(modals.mdl_item_create.el+" #txt_description").val());
      newItem.set('upc',parseInt($(modals.mdl_item_create.el+" #txt_upc").val()));
      newItem.set('rating',parseInt($(modals.mdl_item_create.el+" #txt_rating").val()));
      newItem.set('lastSeenAt',$(modals.mdl_item_create.el+" #txt_lastSeenAt").val());
      newItem.set('estPrice',parseInt($(modals.mdl_item_create.el+" #txt_estPrice").val()));
      if($('#mdl_item_create #item_create_photoContainer img').length != 0){
        var t = $('#mdl_item_create #item_create_photoContainer img').attr('src');
        var base64data = t.slice("data:image/png;base64,".length);
        var image = new Parse.File('item.png',{ base64 : base64data });
        newItem.set('photo', image);
      }
      newItem.save(null,{
        success : function(newItem){
          user.wishList.push(newItem);
          pages.wishList.init();
          modals.mdl_item_create.hide();
        },
        error : function(newItem,error){
          app.e("Couldn't save that item.  We'll look into it ASAP!");
          app.l(JSON.stringify(error,null,2),2);
        }
      });
    }
  }
};

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
      $('#lbl_loginError').removeClass('bad');
      $('#lbl_loginError').removeClass('good');
      $('#lbl_loginError').html('working...');
      $('#lbl_loginError').removeClass('clear');
      //place the Login code here
      Parse.User.logIn($('#frm_Login #txt_username').val(), $('#frm_Login #txt_password').val(), {
        success: function(u) {
          $('#lbl_loginError').addClass('good');
          $('#lbl_loginError').html('success!');

          // Do stuff after successful login.

          $('input').blur();
          setTimeout(function(){
            $('#lbl_loginError').addClass('clear');
          },5000);

          //do the user sign-in
          app.signin();
        },
        error: function(u, error) {
          $('#lbl_loginError').addClass('bad');
          // The login failed. Check error to see why.
          if(error.code == 101){
            $('#lbl_loginError').html('nope!');
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
      $('#frm_signup #txt_username').on('focus',function(){
        if ($(this).val() == "" || $(this).val() == null){
          $(this).val(util.generateElfName());
          $(this).select();
        }
      });
      /*$('#frm_signup #txt_username').hammer().on('tap',function(){
        if ($(this).val() == "" || $(this).val() == null){
          $(this).val(util.generateElfName());
        }
      });*/
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
      $('#frm_signup #btn_cancel').hammer().on('tap',function(){
        app.showScreen($('section#login'));
      });
    },
    remE : function(){
      $('form#frm_signup').off('submit');
      $('#frm_signup #txt_username').off('focus');
      $('#frm_signup #txt_username').hammer().off('tap');
      $('#frm_signup #txt_passwordConfirm').off('keyup');
      $('section#signup #btn_cancel').hammer().off('tap');
    },
    doSignUp : function(){
      user.parse = new Parse.User();
      user.parse.set("username", $('#frm_signup #txt_username').val());
      user.parse.set("password", $('#frm_signup #txt_password').val());
      user.parse.set("email", $('#frm_signup #txt_email').val());

      // other fields can be set just like with Parse.Object
      user.parse.set("firstName", $('#frm_signup #txt_firstName').val());
      user.parse.set("lastName", $('#frm_signup #txt_lastName').val());
      user.parse.set("displayName", $('#frm_signup #txt_firstName').val()+" "+$('#frm_signup #txt_lastName').val().substr(0,1)+".");

      user.parse.signUp(null, {
        success: function(user) {
          // Hooray! Let them use the app now.
          app.signin();
        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          $('#lbl_signupError').html(error.message);
          $('#lbl_signupError').removeClass('clear');
          app.l(JSON.stringify(error,null,2),2);
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
      //var title = user.parse.get('username')+"'s "+$('section#start').data('title');
      //$('nav#top .right').html(title);

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
    init : function(){
      pages.wishList.getData();
    },
    addE : function(){
      $('nav#top #btn_addItem').hammer().on('tap',function(){
        modals.mdl_item_create.show();
      });
    },
    remE : function(){
      $('nav#top #btn_addItem').hammer().off('tap');
    },
    render : function(callback){
      $('#wishList.screen #wishList').html('');
      $.each(user.wishList,function(i,v){
        //DEBUG
        //console.log(v);
        var t = _.template($('#tpl_wishList_listItem').html());
        var d = {
          objectId : v.get('objectId'),
          name : v.get('name'),
          description : v.get('description'),
          photoURL : v.get('photo').url()
        };
        $('#wishList.screen #wishList').append(t(d));
        //DEBUG
        //console.log(d);
        pages.wishList.remE();
        app.remE();
        app.addE();
        pages.wishList.addE();
      });
      if(callback){
        callback();
      }
    },
    getData : function(successCallback,errorCallback){

      //show the loading indicator on the wishList
      $('#wishList.screen #wishList').html('');
      var loaderTpl = _.template( $('#tpl_loading').html() );
      $('#wishList.screen #wishList').append(loaderTpl(null));

      var Item = Parse.Object.extend('Item');
      var wishListQuery = new Parse.Query(Item);

      wishListQuery.descending('rating');
      wishListQuery.equalTo('owner',Parse.User.current());

      //include the _User object
      wishListQuery.include('owner');

      wishListQuery.find({
        success : function(results){
          //DEBUG
          console.log(results);
          user.wishList = results;
          if(successCallback){
            successCallback();
          }
        },
        error : function(error){
          app.e("Darn it! I couldn't find your Wish List.  Gimmea sec, and try again.");
          app.l(JSON.stringify(error,null,2),2);
          if(errorCallback){
            errorCallback();
          }
        }
      }).then(function(){
        pages.wishList.render();
      });
    }
  },
  events : {
    init : function(){},
    addE : function(){},
    remE : function(){}
  },
  eventCreate : {
    init : function(){},
    addE : function(){},
    remE : function(){},
    render : function(){},
    setData : function(){}
  },
  eventDetail : {
    init : function(){},
    addE : function(){},
    remE : function(){},
    render : function(){},
    getData : function(){}
  },
  itemCreate : {
    init : function(){},
    addE : function(){

    },
    remE : function(){},
    render : function(){},
    setData : function(){}
  },
  itemDetail : {
    init : function(){},
    addE : function(){},
    remE : function(){},
    render : function(){},
    getData : function(){}
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
      pages.settings.getData();
    },
    addE : function(){
      $('section#settings #btn_logout').hammer().on('tap',function(e){
        app.exit();
        e.preventDefault();
      });
    },
    remE : function(){
      $('section#settings #btn_logout').hammer().off('tap');
    },
    render : function(){
      //set the title to the user's Display Name
      $('nav#top .right').html( user.parse.get('firstName')+"'s Settings" );
      var av = null;
      if(user.parse.get('avatar')){
        av = user.parse.get('avatar').url();
      }
      var upData = {
        objectId : user.parse.get('objectId'),
        avatar : av,
        firstName : user.parse.get('firstName'),
        lastName : user.parse.get('lastName'),
        elfName : user.parse.get('username')
      };
      var template = _.template( $('#tpl_userProfile').html() );
      $('section#settings #userProfile').html('');
      $('section#settings #userProfile').append(template(upData));
    },
    getData : function(successCallback,failCallack){
      //get remote info
      Parse.User.current().fetch({
        success: function(user) {
          pages.settings.render();
          if(successCallback){
            successCallback();
          }
        },
        error: function(user,error) {
          app.e("Ah nuts!\nWe couldn't get your profile data!\nWe're on it though, try again later. :)");
          app.l( JSON.stringify(error,null,2) ,2);
          if(failCallack){
            failCallack();
          }
        }
      });
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
    outpan : {
      key : 'e4df75113dd952806a676e683515c618'
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

    //init shake detection
    shake = new Shake({
      threshold : 15
    });
    shake.start();
    $(window).on('shake',function(){
      var newElfName = util.generateElfName();
      navigator.notification.confirm(
        "(tee hee)",//message
        function(buttonIndex){
          //buttonIndex is 1-based
          //alert was dismissed
          switch(buttonIndex){
            case 1:
              console.log(newElfName);
              break;
            case 2:
              cordova.plugins.clipboard.copy(newElfName);
              break;
            default:
          }
        },//callback
        newElfName,//[title]
        ["lol, ok cloze","copy"]//[buttonNames]
      );
    });


    app.bindEvents();

    user.parse = Parse.User.current();
    //check if the user's token exists, and is still valid through Parse
    if(user.parse){
      //load the user data
      app.signin();
    } else {
      //load the login screen
      app.showScreen($('section.screen#login'),true);
    }
  },
  exit: function(){
    Parse.User.logOut();
    user.parse = Parse.User.current(); //should now be NULL
    localStorage.setItem('user',JSON.stringify(user));
    location.reload(true);
  },
  signin: function(){
    user.parse = Parse.User.current();
    //persist to localStorage
    localStorage.setItem('user',JSON.stringify(user));

    //load the start screen on signin
    app.showScreen($('section#start'),true);
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
      case 'wishList':
        pages.wishList.init();
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
  e: function(message){
    if(typeof message == "undefined"){
      message = "Something went wrong - but we've got the best Elves on the job.";
    }
    navigator.notification.alert(
      message,//message
      function(){},//callback
      'What a lump \'o coal',//[title]
      "Nuts."//[buttonNames]
    );
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
  santaList : [],
  eventList : [],
  wishList : []
};

//various utility functions
var util = {
  random : function(min,max){
    return Math.floor(Math.random() * (max - min)) + min;
  },
  elf : {
    firstNameSyllables : [
      "mon",
      "fay",
      "shi",
      "zag",
      "blarg",
      "resh",
      "izen",
      "chi",
      "under",
      "little",
      "hill",
      "donk",
      "larp",
      "jazz",
      "ears",
      "hat",
      "tarp",
      "zion",
      "ity",
      "mirf",
      "mop",
      "tree",
      "pine",
      "magic",
      "mana",
      "tree",
      "sugar",
      "candy",
      "sock",
      "gift",
      "buddy",
      "derp",
      "woo",
      "ear",
      "pointy",
      "kris",
      "grumpy",
      "happy",
      "silly",
      "dopy",
      "wiley",
      "funny",
      "fuzzy"
    ],
    lastNameSyllables : [
      "malo",
      "zak",
      "aboo",
      "wonk",
      "derp",
      "wood",
      "brush",
      "thrup",
      "green",
      "brown",
      "seed",
      "nut",
      "son",
      "kilt",
      "shoe",
      "ion",
      "hole",
      "butch",
      "esis",
      "ou",
      "ash",
      "wind",
      "weak",
      "magi",
      "large",
      "pro",
      "bush",
      "shrub",
      "hill",
      "top",
      "bottom",
      "thistle",
      "leaf",
      "mountain",
      "cliff",
      "isle",
      "islay",
      "pond",
      "candy",
      "cane",
      "pit",
      "hole",
      "story",
      "book",
      "tool",
      "cheer",
      "funny",
      "furry",
      "fuzzy",
      "silly"
    ]
  },
  generateElfName : function(){
    //first name
    var fn = "";
    var numSyllablesFN = util.random(2,4);
    for (var i = 0; i < numSyllablesFN; i++) {
      fn += util.elf.firstNameSyllables[util.random(0,util.elf.firstNameSyllables.length)];
    }
    var fnFirstLetter = fn.substr(0,1).toUpperCase();
    fn = fn.slice(1);
    fn = fnFirstLetter + fn;

    //last name
    var ln = "";
    var numSyllablesLN = util.random(1,4);
    for (var i = 0; i < numSyllablesLN; i++) {
      ln += util.elf.lastNameSyllables[util.random(0,util.elf.lastNameSyllables.length)];
    }
    var lnFirstLetter = ln.substr(0,1).toUpperCase();
    ln = ln.slice(1);
    ln = lnFirstLetter + ln;

    return fn + " " + ln
  },
  shake : null,
  getDataUPCold : function(upc){

    var oauth = OAuth({
      consumer: {
        public: app.d.s3.key,
        secret: app.d.s3.secret
      },
      signature_method: 'PLAINTEXT'
    });

    var request_data = {
      url: app.d.s3.productTestURI,
      method: 'GET',
      data: {
        "upc": upc,
        "fields": [
        "name"
        ]
      }
    };

    var token = {
      public: app.d.s3.key,
      secret: app.d.s3.secret
    };

    $.ajax({
      url: request_data.url,
      type: request_data.method,
      data: oauth.authorize(request_data)
    }).done(function(data) {
      //process your data here
      //DEBUG
      console.log("S3:\n"+data);
    });

  },
  getDataUPC : function(upc, successCallback, errorCallback){
    // NEW lookup via Outpan
    var url = 'http://www.outpan.com/api/get-product.php?barcode='+upc+'&apikey='+app.d.outpan.key;
    //var response = {};
    $.getJSON(url,null).done(function(d){
      //DEBUG
      //console.log(d);
      if(d.error){
        if(errorCallback){
          errorCallback(d);
        }
      } else {
        if(successCallback){
          successCallback(d);
        }
      }
    }).fail(function(e){
      if(errorCallback){
        errorCallback(e);
      }
    }).always(function(){
      console.log('product lookup done');

    });
  },
  convertImgToBase64 : function(url, callback, outputFormat){
    /*
      Supported input formats
      =====
      image/png
      image/jpeg
      image/jpg
      image/gif
      image/bmp
      image/tiff
      image/x-icon
      image/svg+xml
      image/webp
      image/xxx

      Supported output formats
      =====
      image/png
      image/jpeg
      image/webp (chrome)
    */
    var canvas = document.createElement('CANVAS'),
    ctx = canvas.getContext('2d'),
    img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
      var dataURL;
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      callback.call(this, dataURL);
      canvas = null;
    };
    img.src = url;
  }
}
