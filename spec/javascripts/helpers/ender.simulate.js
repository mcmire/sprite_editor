(function() {
  $.ender({
    simulate: function(type, options) {
      this.each(function() {
        var opt;
        opt = $.extend({}, $.simulate.defaults, options || {});
        return new $.simulate(this, type, opt);
      });
      return this;
    }
  }, true);
  $.simulate = (function() {
    function simulate(el, type, options) {
      if (type === "drag") {
        this.simulateDragEvent(el, options);
      } else {
        this.simulateEvent(el, type, options);
      }
    }
    simulate.prototype.simulateEvent = function(el, type, options) {
      var evt;
      evt = this.createEvent(type, options);
      this.dispatchEvent(el, type, evt, options);
      return evt;
    };
    simulate.prototype.simulateDragEvent = function(el, options) {
      var center, coord, dx, dy, self, x, y;
      self = this;
      center = this.findCenter(el);
      x = Math.floor(center.x);
      y = Math.floor(center.y);
      dx = options.dx || 0;
      dy = options.dy || 0;
      coord = {
        clientX: x,
        clientY: y
      };
      this.simulateEvent(el, "mousedown", coord);
      coord = {
        clientX: x + 1,
        clientY: y + 1
      };
      this.simulateEvent(document, "mousemove", coord);
      coord = {
        clientX: x + dx,
        clientY: y + dy
      };
      this.simulateEvent(document, "mousemove", coord);
      this.simulateEvent(document, "mousemove", coord);
      return this.simulateEvent(el, "mouseup", coord);
    };
    simulate.prototype.createEvent = function(type, options) {
      if (/^mouse(over|out|down|up|move)|(dbl)?click$/.test(type)) {
        return this.createMouseEvent(type, options);
      } else if (/^key(up|down|press)$/.test(type)) {
        return this.createKeyboardEvent(type, options);
      } else {
        return this.createBasicEvent(type, options);
      }
    };
    simulate.prototype.createMouseEvent = function(type, options) {
      var e, evt, relatedTarget;
      e = $.extend({
        bubbles: true,
        cancelable: type !== "mousemove",
        view: window,
        detail: 0,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        relatedTarget: void 0
      }, options);
      relatedTarget = e.relatedTarget && $(e.relatedTarget)[0];
      if (typeof document.createEvent === "function") {
        evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget || document.body.parentNode);
      } else if (document.createEventObject) {
        evt = document.createEventObject();
        $.extend(evt, e);
        evt.button = {
          0: 1,
          1: 4,
          2: 2
        }[evt.button] || evt.button;
      }
      return evt;
    };
    simulate.prototype.createKeyboardEvent = function(type, options) {
      var e, evt;
      e = $.extend({
        bubbles: true,
        cancelable: true,
        view: window,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        keyCode: 0,
        charCode: 0
      }, options);
      if (typeof document.createEvent === "function") {
        try {
          evt = document.createEvent("KeyEvents");
          evt.initKeyEvent(type, e.bubbles, e.cancelable, e.view, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.keyCode, e.charCode);
        } catch (err) {
          evt = document.createEvent("Events");
          evt.initEvent(type, e.bubbles, e.cancelable);
          $.extend(evt, {
            view: e.view,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            keyCode: e.keyCode,
            charCode: e.charCode
          });
        }
      } else if (document.createEventObject) {
        evt = document.createEventObject();
        $.extend(evt, e);
      }
      if ($.browser.msie || $.browser.opera) {
        evt.keyCode = (e.charCode > 0 ? e.charCode : e.keyCode);
        evt.charCode = void 0;
      }
      return evt;
    };
    simulate.prototype.createBasicEvent = function(type, options) {
      var e, evt;
      e = $.extend({
        bubbles: true,
        cancelable: true,
        view: window
      }, options);
      if (typeof document.createEvent === "function") {
        evt = document.createEvent("Events");
        evt.initEvent(type, e.bubbles, e.cancelable);
        $.extend(evt, {
          view: e.view
        });
      } else if (document.createEventObject) {
        evt = document.createEventObject();
        $.extend(evt, e);
      }
      return evt;
    };
    simulate.prototype.dispatchEvent = function(el, type, evt) {
      if (el.dispatchEvent) {
        el.dispatchEvent(evt);
      } else if (el.fireEvent) {
        el.fireEvent("on" + type, evt);
      }
      return evt;
    };
    simulate.prototype.findCenter = function(el) {
      var o;
      o = $(el).offset();
      return {
        x: o.left + o.width / 2,
        y: o.top + o.height / 2
      };
    };
    return simulate;
  })();
  $.extend($.simulate, {
    defaults: {
      speed: "sync"
    },
    VK_TAB: 9,
    VK_ENTER: 13,
    VK_ESC: 27,
    VK_PGUP: 33,
    VK_PGDN: 34,
    VK_END: 35,
    VK_HOME: 36,
    VK_LEFT: 37,
    VK_UP: 38,
    VK_RIGHT: 39,
    VK_DOWN: 40
  });
}).call(this);
