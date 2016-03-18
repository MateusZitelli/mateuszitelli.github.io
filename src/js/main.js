(function(){
  var repos = require('./github-repos.js').repos;
  //var Trianglify = require('trianglify');
  var MZ = require('./mzlogo').MZ();


  var completeIndex = function(){
    endLoading();
    completeSensitiveFields();
    repos.addReposList("#repos");
  };

  var completeCv = function(){
    endLoading();
  };

  var wellcome = function(){
    runLogo();
  };

  var templates = {
    index:{
      wellcome: wellcome,
      template: require('../templates/index.html'),
      postRender: completeIndex
    },
    cv:{
      wellcome: wellcome,
      template: require('../templates/cv.html'),
      postRender: completeCv
    }
  };

  var $mainContainer = $('#main-container');

  // Place the logo on the svg canvas and start the animaion
  var runLogo = function(){
    var $logo = $("#logo");
    var $logoSvg = $('#logo-svg');
    var logoWidth = $logo.width();
    var logoHeight = $logo.height();
    /* var pattern = Trianglify({
       height: $loading.height(),
       width: $loading.width(),
       cell_size: 40}); */
    $logoSvg.width(logoWidth);
    $logoSvg.height(logoHeight+1);
    MZ.init('#logo-svg', logoWidth-2, logoHeight, 500);
    MZ.startAnimation();
  };

  var initializeContent = function(){
    $('.hidden').each(function(){
      var $this = $(this);
      $this.hide();
      $this.removeClass('hidden');
      $this.fadeIn(1000);
      setTimeout(function(){
        manageScrollFadeIns();
      }, 100);
    });
  };

  var manageScrollFadeIns = function(scrollBottom){
    if(scrollBottom === undefined){
      scrollBottom = $(window).scrollTop() + $(window).height();
    }
    $('.fadeIn').each(function(){
      var $this = $(this);
      var thisTop = $this.offset().top;
      var thisBottom = thisTop + $this.height();
      if(thisTop >= scrollBottom){
        $this.css('opacity', 0.3);
        $.data(this, 'viewed', false);
      }

      if(thisBottom < scrollBottom && !$.data(this, 'viewed')){
        $.data(this, 'viewed', true);
        $this.animate({opacity:1}, 1000);
      }
    });
  };

  var endLoading = function(){
    var $loading = $('#loading');
    if($loading.is(":visible")){
      // Wait the logo animation completes
      setTimeout(function(){
        $loading.fadeOut(500);
        initializeContent();
      }, 3000);
    }else{
      initializeContent();
    }
  };

  var completeSensitiveFields = function(){
    var name = 'zitellimateus';
    var domain = 'gmail.com';
    var country = '+61';
    var region = '';
    var phone = '0402 586';
    $('#email-adress').text(name + '@' + domain);
    $('#phone-number').text([country, region, phone].join(' '));
  };

  var scrollTo = function(div){
    var duration = 400;
    $('html, body').animate({
      scrollTop: $(div).offset().top
    }, duration);
  };

  var loadContent = function(wellcome){
    var hash = document.location.hash.slice(1);
    var targetTemplate = templates.index;
    if(hash !== ''){
      targetTemplate = templates[hash];
    }

    if(wellcome && targetTemplate.wellcome){
      targetTemplate.wellcome();
    }

    if(targetTemplate.preRender){
      targetTemplate.preRender();
    }

    var html = targetTemplate.template.render();
    $mainContainer.html(html);

    if(targetTemplate.postRender){
      targetTemplate.postRender();
    }
    setEvents();
  };

  var setEvents = function(){
    $(".down-arrow").click(function(){
      var target = $(this).attr('data-destination');
      scrollTo(target);
    });

    $("ul.navigation-links a").each(function(){
      var $this = $(this);
      var scrollToElement = $this.attr('href');
      $this.on('click', function(e){
        e.preventDefault();
        if(templates[scrollToElement.slice(1)]){
          document.location.hash = scrollToElement;
        }
        scrollTo(scrollToElement);
      });
    });

    $(window).on('scroll', function(e){
      var scrollTop = e.originalEvent.pageY;
      var scrollBottom = scrollTop + $(this).height();
      manageScrollFadeIns(scrollBottom);
    });

    $(window).on('hashchange',function(){
      loadContent();
    });
  };

  setEvents();
  loadContent(true);
}());
