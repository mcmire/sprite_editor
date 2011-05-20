(function(window, document, $, undefined) {

  // The ElementMouseTracker tracks the mouse in the context of an element.
  // So, for instance, when we store the position of the mouse, we not only
  // store the position relative to the document, but also relative to the
  // element in question.
  //
  // To track the mouse in the context of an element, we must bind
  // the ElementMouseTracker to the element. To do this, you simply say:
  //
  //   ElementMouseTracker.bind($element);
  //
  // When you are finished tracking the mouse, you need to unbind the element:
  //
  //   ElementMouseTracker.unbind($element);
  //
  // Note that an ElementMouseTracker can only be bound to one element at a
  // time (otherwise chaos ensues).
  //
  var ElementMouseTracker = {
    $element: null,
    options: {},
    customEvents: {},

    pos: {
      abs: {x: null, y: null},
      rel: {x: null, y: null}
    },
    isDown: false,
    downAt: {
      abs: {x: null, y: null},
      rel: {x: null, y: null}
    },
    isDragging: false,
    initted: false,

    init: function() {
      var self = this;

      // We bind these events to the document rather than of the element to
      // make it possible to do special behavior when the user moves the mouse
      // outside of the element in question. For instance, we definitely want
      // to trigger the mouseup event outside the element. As another example,
      // the ColorPickerBox widget has logic that keeps the hue/saturation
      // selector indicator inside the canvas for hue/saturation even if the
      // user moves the mouse outside of the canvas.
      //
      $(document).bind({
        "mouseup.ElementMouseTracker": function() {
          if (self.isDragging) {
            self.$element.trigger('mousedragstop');
            self.isDragging = false;
          }
          self.isDown = false;
          //event.stopPropagation();
          event.preventDefault();
        },

        "mousemove.ElementMouseTracker": function(event) {
          self.pos = {
            abs: {x: event.pageX, y: event.pageY},
            rel: {x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top}
          };
          // Correct the position if it's outside the bounds of the element
          if (self.pos.rel.x < 0) {
            self.pos.rel.x = 0;
          } else if (self.pos.rel.x > self.elementSize.width) {
            self.pos.rel.x = self.elementSize.width;
          }
          if (self.pos.rel.y < 0) {
            self.pos.rel.y = 0;
          } else if (self.pos.rel.y > self.elementSize.height) {
            self.pos.rel.y = self.elementSize.height
          }

          // If dragging isn't set yet, set it until the mouse is lifted off
          if (self.isDown) {
            if (!self.isDragging) {
              self.isDragging = (!self.draggingDistance || self._distance(self.downAt, self.pos.abs) > self.options.draggingDistance);
              self.$element.trigger('mousedragstart');
            }
          } else {
            self.isDragging = false;
            self.$element.trigger('mouseglide');
          }

          if (self.isDragging) {
            self.$element.trigger('mousedrag');
            self.$element.trigger('mousedownordrag');
          }

          if (self.options.debug) {
            self.debugDiv().html(String.format("abs: ({0}, {1})<br/>rel: ({2}, {3})", self.pos.abs.x, self.pos.abs.y, self.pos.rel.x, self.pos.rel.y))
          }

          //event.stopPropagation();
          event.preventDefault();
        }
      });
    },

    destroy: function() {
      var self = this;
      $(document).unbind(".ElementMouseTracker")
    },

    bind: function($element, options) {
      var self = this;

      if (!self.initted) {
        self.init();
        self.initted = true;
      }

      self.$element = $element;
      $.v.each(options, function(k, v) {
        if (/^mouse/.test(k)) {
          self.customEvents[k] = v;
        } else {
          self.options[k] = v;
        }
      })

      self._addEvents();

      // cache some values for later use
      self.elementOffset = self.$element.absoluteOffset();
      var computedStyle = self.$element.computedStyle();
      self.elementSize = {
        width: parseInt(computedStyle["width"], 10),
        height: parseInt(computedStyle["height"], 10)
      }
    },

    unbind: function($element) {
      var self = this;
      self._removeEvents();
    },

    _addEvents: function() {
      var self = this;

      self.$element.bind({
        "mousedown.ElementMouseTracker": function(event) {
          self.isDown = true;
          self.downAt = {
            abs: {x: event.pageX, y: event.pageY},
            rel: {x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top}
          };
          self.$element.trigger('mousedownordrag');
          //event.stopPropagation();
          event.preventDefault();
        }
      })

      $.v.each(self.customEvents, function(eventName, callback) {
        (/^(mouseup|mousemove)$/.test(eventName) ? $(document) : self.$element).bind(eventName+".ElementMouseTracker.custom", callback);
      })
    },

    _removeEvents: function() {
      $(document).unbind(".ElementMouseTracker");
      self.$element.unbind(".ElementMouseTracker"); // I hope this unbinds the .custom events...
    },

    debugDiv: function() {
      var self = this;
      if (self.$debugDiv) return self.$debugDiv;
      self.$debugDiv = $('<div "/>')
        .html("&nbsp;")
        .css({
          position: "absolute",
          top: 0,
          left: 0,
          padding: "2px",
          "background-color": "lightyellow",
          width: "200px",
          height: "50px"
        })
      $(document.body).append(self.$debugDiv);
      return self.$debugDiv;
    },

    _distance: function(v1, v2) {
      return Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2));
    }
  };
  window.ElementMouseTracker = ElementMouseTracker;

})(window, window.document, window.ender);