(function(window, document, $, undefined) {
  
  var Mouse = {};

  Mouse.tracker = function() {
    Mouse.tracker.prototype.init.apply(this, arguments)
  }
  $.extend(Mouse.tracker.prototype, {
    parent: null,
    options: null,
    pos: {x: null, y: null},
    isDown: false,
    downAt: {x: null, y: null},
    isDragging: false,
    
    init: function($parent, options) {
      var self = this;
      self.$parent = $parent;
      self.options = options || {};
      if (self.options.on) {
        $.v.each(self.options.on, function(eventName, callback) {
          self.$parent.bind(eventName, callback);
        })
      }
      self._addEvents();
      self.$parent.data('mouse', self);
      
      // cache some values for later use
      self.parentOffset = self.$parent.offset();
      var parentComputedStyle = self.$parent.computedStyle();
      self.parentBorder = {
        top:    parentComputedStyle["border-top-width"],
        right:  parentComputedStyle["border-right-width"],
        bottom: parentComputedStyle["border-bottom-width"],
        left:   parentComputedStyle["border-left-width"]
      }
    },
    _addEvents: function() {
      var self = this;
      // This has to be bound on the document instead of the element in case the
      // user starts dragging, moves the mouse outside the window, and then lets go
      $(document).bind({
        mouseup: function() {
          if (self.isDragging) {
            self.$parent.trigger('stopdrag');
            self.isDragging = false;
          }
          self.isDown = false;
          event.stopPropagation();
          event.preventDefault();
        }
      })
      self.$parent.bind({
        mousedown: function(event) {
          self.isDown = true;
          self.downAt = {
            abs: {
              x: event.pageX,
              y: event.pageY
            },
            rel: {
              x: event.pageX - self.parentOffset.left - self.parentBorder.left,
              y: event.pageY - self.parentOffset.top - self.parentBorder.top
            }
          };
          self.$parent.trigger('dragOrMouseDown');
          event.stopPropagation();
          event.preventDefault();
        },
        /*
        mouseout: function(event) {
          self.isDown = false;
          self.downAt = null;
        },
        */
        mousemove: function(event) {
          self.pos = {
            abs: {x: event.pageX, y: event.pageY},
            rel: {x: event.pageX - self.parentOffset.left, y: event.pageY - self.parentOffset.top}
          };
        
          // If dragging isn't set yet, set it until the mouse is lifted off
          if (self.isDown) {
            if (!self.isDragging) {
              self.isDragging = self.options.draggingDistance ?
                (self._distance(self.downAt.abs, self.pos.abs) > draggingDistance) :
                true;
              self.$parent.trigger('startdrag');
            }
          } else {
            self.isDragging = false;
          }
          
          if (self.isDragging && self.pos.rel.x >= 0 && self.pos.rel.y >= 0) {
            self.$parent.trigger('drag');
            self.$parent.trigger('dragOrMouseDown');
          }
          
          event.stopPropagation();
          event.preventDefault();
        }
      });
    },
    _distance: function(v1, v2) {
      return Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2));
    }
  })
  window.Mouse = Mouse;
  
  $.ender({
    trackMouse: function(options) {
      new Mouse.tracker(this, options);
    }
  }, true);
  
})(window, window.document, window.ender);