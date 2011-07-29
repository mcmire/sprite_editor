(function() {
  $["export"]("SpriteEditor.ElementMouseTracker", function(SpriteEditor) {
    var ElementMouseTracker;
    ElementMouseTracker = {};
    SpriteEditor.DOMEventHelpers.mixin(ElementMouseTracker, "SpriteEditor_ElementMouseTracker");
    $.extend(ElementMouseTracker, {
      init: function() {
        if (!this.isInitialized) {
          this.reset();
          this._eventsAdded = false;
          this.isInitialized = true;
        }
        return this;
      },
      destroy: function() {
        var inst, _i, _len, _ref;
        if (this.isInitialized) {
          this.removeEvents();
          _ref = this.instances;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            inst = _ref[_i];
            this.remove(inst);
          }
          this.reset();
          return this.isInitialized = false;
        }
      },
      reset: function() {
        this.instances = [];
        this.activeInstance = {
          mouseWithin: null,
          mouseDownWithin: null
        };
        this.pos = null;
        this.debugDiv().remove();
        this.$debugDiv = null;
        return this;
      },
      addEvents: function() {
        var self;
        self = this;
        if (!this._eventsAdded) {
          this._bindEvents(document, {
            mouseup: function(event) {
              var inst;
              if (inst = self.activeInstance.mouseDownWithin) {
                inst.triggerHandler("mouseup", event);
              }
              return event.preventDefault();
            },
            mousemove: function(event) {
              var inst;
              self.pos = {
                x: event.pageX,
                y: event.pageY
              };
              if (inst = self.activeInstance.mouseWithin) {
                inst.triggerHandler("mousemove", event);
              }
              return event.preventDefault();
            }
          });
          this._eventsAdded = true;
        }
        return this;
      },
      removeEvents: function() {
        if (this._eventsAdded) {
          this._unbindEvents(document, "mouseup", "mousemove");
          this._eventsAdded = false;
        }
        return this;
      },
      add: function($element, options) {
        var instance;
        if (options == null) {
          options = {};
        }
        if (this.instances.length === 0) {
          this.addEvents();
        }
        instance = new ElementMouseTracker.instance($element, options);
        instance.addEvents();
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
        if (this.activeInstance.mouseDownWithin === instance) {
          delete this.activeInstance.mouseDownWithin;
        }
        if (this.instances.length === 0) {
          return this.removeEvents();
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
          abs: null,
          rel: null
        };
        this.isDown = false;
        this.downAt = {
          abs: null,
          rel: null
        };
        this.isDragging = false;
        this.elementOffset = this.$element.offset();
        computedStyle = this.$element.computedStyle();
        this.elementSize = {
          width: parseInt(computedStyle["width"], 10),
          height: parseInt(computedStyle["height"], 10)
        };
      }
      instance.prototype.destroy = function() {
        return this.removeEvents();
      };
      instance.prototype.addEvents = function() {
        var self;
        self = this;
        if (!this._eventsAdded) {
          this._bindEvents(this.$element, {
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
              ElementMouseTracker.activeInstance.mouseDownWithin = self;
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
          this._eventsAdded = true;
        }
        return this;
      };
      instance.prototype.removeEvents = function() {
        if (this._eventsAdded) {
          this._unbindEvents(this.$element, "mouseover", "mouseout", "mouseenter", "mouseleave", "mousedown", "click", "contextmenu");
          this._eventsAdded = false;
        }
        return this;
      };
      instance.prototype.triggerHandler = function(eventName, event) {
        if (eventName in this) {
          return this[eventName].call(this, event);
        } else if (eventName in this.customEvents) {
          return this.customEvents[eventName].call(this, event);
        }
      };
      instance.prototype.mousemove = function(event) {
        var dist, wasDragging, _ref;
        this._setMousePosition();
        if ((_ref = this.customEvents.mousemove) != null) {
          _ref.call(this, event);
        }
        wasDragging = this.isDragging;
        if (this.isDown) {
          if (!this.isDragging) {
            dist = this._distance(this.downAt.abs, this.pos.abs);
            this.isDragging = dist >= this.options.draggingDistance;
          }
        }
        if (!wasDragging && this.isDragging) {
          this.triggerHandler("mousedragstart", event);
        }
        if (this.isDragging) {
          this.triggerHandler("mousedrag", event);
        } else {
          this.triggerHandler("mouseglide", event);
        }
        if (this.options.debug) {
          return ElementMouseTracker.debugDiv().html(String.format("abs: ({0}, {1})<br/>rel: ({2}, {3})", this.pos.abs.x, this.pos.abs.y, this.pos.rel.x, this.pos.rel.y));
        }
      };
      instance.prototype.mousedragstop = function(event) {
        var _ref;
        this.isDragging = false;
        return (_ref = this.customEvents.mousedragstop) != null ? _ref.call(this, event) : void 0;
      };
      instance.prototype.mouseup = function(event) {
        var _ref;
        this.isDown = false;
        delete ElementMouseTracker.activeInstance.mouseDownWithin;
        if (this.isDragging) {
          this.triggerHandler("mousedragstop");
        }
        if ((_ref = this.customEvents.mouseup) != null) {
          _ref.call(this, event);
        }
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
      instance.prototype._distance = function(v1, v2) {
        return Math.floor(Math.sqrt(Math.pow(v2.y - v1.y, 2) + Math.pow(v2.x - v1.x, 2)));
      };
      return instance;
    })();
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
            if (mouseTracker) {
              ElementMouseTracker.remove(mouseTracker);
            }
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
    return ElementMouseTracker;
  });
}).call(this);
