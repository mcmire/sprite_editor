(function() {
  $["export"]("SpriteEditor.ElementMouseTracker", (function() {
    var ElementMouseTracker;
    ElementMouseTracker = {};
    SpriteEditor.DOMEventHelpers.mixin(ElementMouseTracker, "SpriteEditor_ElementMouseTracker")({
      instances: [],
      activeInstance: {
        mouseWithin: null,
        mouseHeldWithin: null
      },
      init: function() {
        var self;
        self = this;
        return this._bindEvents(document, {
          mouseup: function(event) {
            var inst, _i, _len, _ref;
            inst = self.activeInstance.mouseHeldWithin;
            if (inst && inst.isDragging) {
              inst.triggerHandler("mousedragstop");
            }
            _ref = self.activeInstances();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              inst = _ref[_i];
              inst.triggerHandler("mouseup", event);
            }
            return event.preventDefault();
          },
          mousemove: function(event) {
            var inst, _i, _len, _ref;
            self.pos = {
              x: event.pageX,
              y: event.pageY
            };
            _ref = self.activeInstances();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              inst = _ref[_i];
              inst.triggerHandler("mousemove", event);
            }
            return event.preventDefault();
          }
        });
      },
      destroy: function() {
        this._unbindEvents(document, "mouseup", "mousemove");
        return this.debugDiv().hide();
      },
      add: function($element, options) {
        var instance;
        if (this.instances.length === 0) {
          this.init();
        }
        instance = new ElementMouseTracker.instance($element, options);
        this.instances.push(instance);
        return instance;
      },
      remove: function(instance) {
        var index;
        instance.destroy();
        index = $.v.indexOf(this.instances, instance);
        this.instances.splice(index, 1);
        if (this.activeInstance.mouseWithin === instance) {
          delete this.activeInstance.mouseWithin;
        }
        if (this.activeInstance.mouseHeldWithin === instance) {
          delete this.activeInstance.mouseHeldWithin;
        }
        if (this.instances.length === 0) {
          return this.destroy();
        }
      },
      debugDiv: function() {
        return this.$debugDiv || (this.$debugDiv = $('<div />').html("&nbsp;").css({
          position: "absolute",
          top: 0,
          left: 0,
          padding: "2px",
          "background-color": "lightyellow",
          width: "200px",
          height: "50px"
        }).appendTo(document.body));
      },
      activeInstances: function() {
        var instances;
        instances = [this.activeInstance.mouseHeldWithin, this.activeInstance.mouseWithin];
        return $.v(instances).chain().compact().uniq().value();
      }
    });
    ElementMouseTracker.instance = (function() {
      SpriteEditor.DOMEventHelpers.mixin(instance.prototype, "SpriteEditor_ElementMouseTracker");
      function instance($element, options) {
        var computedStyle, key, keys, val, _base, _i, _len, _ref, _ref2;
        this.$element = $element;
        this.options = {};
        this.customEvents = {};
        for (keys in options) {
          val = options[keys];
          _ref = keys.split(" ");
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            if (/^mouse/.test(key)) {
              this.customEvents[key] = val;
            } else {
              this.options[key] = val;
            }
          }
        }
                if ((_ref2 = (_base = this.options).draggingDistance) != null) {
          _ref2;
        } else {
          _base.draggingDistance = 1;
        };
        this.pos = {
          abs: {
            x: null,
            y: null
          },
          rel: {
            x: null,
            y: null
          }
        };
        this.isDown = false;
        this.downAt = {
          abs: {
            x: null,
            y: null
          },
          rel: {
            x: null,
            y: null
          }
        };
        this.isDragging = false;
        this._addEvents();
        this.elementOffset = this.$element.absoluteOffset();
        computedStyle = this.$element.computedStyle();
        this.elementSize = {
          width: parseInt(computedStyle["width"], 10),
          height: parseInt(computedStyle["height"], 10)
        };
      }
      instance.prototype.destroy = function() {
        return this._removeEvents();
      };
      instance.prototype.triggerHandler = function(eventName, event) {
        var _ref, _ref2, _ref3, _ref4;
        if (/(up|stop|leave)$/.test(eventName)) {
          if ((_ref = this.customEvents[eventName]) != null) {
            _ref.call(this, event);
          }
          return (_ref2 = self[eventName]) != null ? _ref2.call(this, event) : void 0;
        } else {
          if ((_ref3 = self[eventName]) != null) {
            _ref3.call(this, event);
          }
          return (_ref4 = this.customEvents[eventName]) != null ? _ref4.call(this, event) : void 0;
        }
      };
      instance.prototype.mousemove = function(event) {
        var dist;
        this._setMousePosition();
        if (this.isDown) {
          if (this.isDragging) {
            dist = this._distance(this.downAt.abs, this.pos.abs);
            this.isDragging = dist >= this.options.draggingDistance;
            this.triggerHandler("mousedragstart", event);
          }
        } else {
          this.isDragging = false;
          this.triggerHandler("mouseglide", event);
        }
        if (this.isDragging) {
          this.triggerHandler("mousedrag", event);
        }
        if (this.options.debug) {
          return ElementMouseTracker.debugDiv().html(String.format("abs: ({0}, {1})<br/>rel: ({2}, {3})", this.pos.abs.x, this.pos.abs.y, this.pos.rel.x, this.pos.rel.y));
        }
      };
      instance.prototype.mousedragstop = function(event) {
        return this.isDragging = false;
      };
      instance.prototype.mouseup = function(event) {
        this.isDown = false;
        delete ElementMouseTracker.activeInstance.mouseHeldWithin;
        if (this.options.debug) {
          return ElementMouseTracker.debugDiv().hide();
        }
      };
      instance.prototype._setMousePosition = function() {
        this.pos = {
          abs: ElementMouseTracker.pos,
          rel: {
            x: event.pageX - this.elementOffset.left,
            y: event.pageY - this.elementOffset.top
          }
        };
        if (this.pos.rel.x < 0) {
          this.pos.rel.x = 0;
        } else if (this.pos.rel.x > this.elementSize.width) {
          this.pos.rel.x = this.elementSize.width;
        }
        if (this.pos.rel.y < 0) {
          return this.pos.rel.y = 0;
        } else if (this.pos.rel.y > this.elementSize.height) {
          return this.pos.rel.y = this.elementSize.height;
        }
      };
      instance.prototype._addEvents = function() {
        var self;
        self = this;
        return this._bindEvents(this.$element, {
          mouseover: function(event) {
            return self.triggerHandler("mouseover", event);
          },
          mouseout: function(event) {
            return self.triggerHandler("mouseout", event);
          },
          mouseenter: function(event) {
            ElementMouseTracker.activeInstance.mouseWithin = self;
            return self.triggerHandler("mouseenter", event);
          },
          mouseleave: function(event) {
            delete ElementMouseTracker.activeInstance.mouseWithin;
            return self.triggerHandler("mouseleave", event);
          },
          mousedown: function(event) {
            ElementMouseTracker.activeInstance.mouseHeldWithin = self;
            self.isDown = true;
            self._setMousePosition();
            self.downAt = {
              abs: {
                x: event.pageX,
                y: event.pageY
              },
              rel: {
                x: event.pageX - self.elementOffset.left,
                y: event.pageY - self.elementOffset.top
              }
            };
            if (self.options.debug) {
              ElementMouseTracker.debugDiv().show();
            }
            self.triggerHandler("mousedown", event);
            return event.preventDefault();
          },
          click: function(event) {
            self.triggerHandler("mouseclick", event);
            return event.preventDefault();
          },
          contextmenu: function(event) {
            self.triggerHandler("contextmenu", event);
            return event.preventDefault();
          }
        });
      };
      instance.prototype._removeEvents = function() {
        return this._unbindEvents(this.$element, "mouseover", "mouseout", "mouseenter", "mouseleave", "mousedown", "click", "contextmenu");
      };
      instance.prototype._distance = function(v1, v2) {
        return Math.floor(Math.sqrt(Math.pow(v2.y - v1.y, 2) + Math.pow(v2.x - v1.x, 2)));
      };
      return instance;
    })();
    return ElementMouseTracker;
  })());
  $.ender({
    mouseTracker: function() {
      var mouseTracker, value;
      if (this.data("mouseTracker")) {
        mouseTracker = this.data("mouseTracker");
      } else if ($.v.is.obj(arguments[0])) {
        mouseTracker = ElementMouseTracker.add(this, arguments[0]);
        this.data("mouseTracker", mouseTracker);
      }
      if (typeof arguments[0] === "string") {
        if (arguments[0] === "destroy") {
          ElementMouseTracker.remove(mouseTracker);
          this.data("mouseTracker", null);
        } else if (arguments[0] === "__instance__") {
          return mouseTracker;
        } else {
          value = mouseTracker[arguments[0]];
          if (typeof value === "function") {
            return value.apply(mouseTracker, Array.prototype.slice.call(arguments, 1));
          } else if (typeof value !== "undefined") {
            return value;
          } else {
            throw "'" + arguments[0] + "' is not a property of ElementMouseTracker!";
          }
        }
      }
      return this;
    }
  }, true);
}).call(this);
