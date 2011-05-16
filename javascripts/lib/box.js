(function(window, document, $, undefined) {
  
  var DialogBox = function() {
    var self = this;
    self.$container = $('<div/>').addClass("dialog");
  }
  $.extend(DialogBox, {
    toggle: function() {
      var self = this;
      self.hidden() ? self.show() : self.hide();
    },
    hidden: function() {
      var self = this;
      return self.$container.css('opacity') == 0
    },
    show: function() {
      var self = this;
      self.$container.fadeIn(300);
    },
    hide: function() {
      var self = this;
      self.$container.fadeOut(300);
    },
    center: function() {
      var self = this;
      var vp = $.viewport();
      $self.container
        .css("top", (vp.height / 2) - (self.$container.height() / 2))
        .css("left", (vp.width / 2) - (self.$container.width() / 2))
    }
  })
  
})(window, window.document, window.ender);