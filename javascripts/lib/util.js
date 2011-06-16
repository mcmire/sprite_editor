(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __slice = Array.prototype.slice;
  $.ender;
  ({
    extend: function() {
      var args, deep, obj, objects, prop, target, _i, _len;
      args = Array.prototype.slice.call(arguments);
      deep = false;
      if (typeof args[0] === "boolean") {
        deep = args.shift();
      }
      target = args.shift();
      objects = args;
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        obj = objects[_i];
        for (prop in obj) {
          if (!__hasProp.call(obj, prop)) continue;
          if (typeof target[prop] === "function") {
            (function(_super, _new) {
              return target[prop] = function() {
                var rv, tmp;
                tmp = this._super;
                this._super = _super;
                rv = _new.apply(this, arguments);
                this._super = tmp;
                return rv;
              };
            })(target[prop], obj[prop]);
          } else if (deep && $.v.is.obj(obj[prop])) {
            target[prop] = this.extend(deep, {}, obj[prop]);
          } else {
            target[prop] = obj[prop];
          }
        }
      }
      return target;
    },
    clone: function(obj) {
      return $.extend({}, obj);
    },
    proxy: function(obj, fn) {
      return obj[fn].apply(obj, arguments);
    },
    ns: function(chain) {
      var context, id, _i, _len, _ref;
      context = window;
      if (typeof chain === "string") {
        chain = chain.split(".");
      }
      for (_i = 0, _len = chain.length; _i < _len; _i++) {
        id = chain[_i];
                if ((_ref = context[id]) != null) {
          _ref;
        } else {
          context[id] = {};
        };
        context[id];
      }
      return context;
    },
    "export": function(chain, obj) {
      var tail;
      if (typeof chain === "string") {
        chain = chain.split(".");
      }
      tail = chain.pop();
      chain = this.ns(chain);
      return chain[tail] = obj;
    },
    tap: function(obj, fn) {
      fn(obj);
      return obj;
    }
  });
  $.ender({
    center: function() {
      var left, self, top, vp;
      vp = $.viewport();
      self = $([this[0]]);
      top = (vp.height / 2) - (this.height() / 2);
      left = (vp.width / 2) - (this.width() / 2);
      this.css("top", top + "px").css("left", left + "px");
      return this;
    },
    absoluteOffset: function() {
      var left, node, top;
      if (this.length !== 0) {
        return null;
      }
      node = this[0];
      top = 0;
      left = 0;
      while (true) {
        top += node.offsetTop;
        left += node.offsetLeft;
        if (!(node = node.offsetParent)) {
          break;
        }
      }
      return {
        top: top,
        left: left
      };
    },
    position: function() {
      var o, po;
      po = this.parent().offset();
      o = this.offset();
      return {
        top: o.top - po.top,
        left: o.left - po.left
      };
    },
    parent: function() {
      return $(this[0].parentNode);
    },
    computedStyle: function(prop) {
      var computedStyle, elem;
      elem = this[0];
      if (typeof elem.currentStyle !== "undefined") {
        computedStyle = elem.currentStyle;
      } else {
        computedStyle = document.defaultView.getComputedStyle(elem, null);
      }
      if (prop) {
        return computedStyle[prop];
      } else {
        return computedStyle;
      }
    }
  }, true);
  Math.randomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
  };
  Math.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  String.format = function() {
    var args, i, regexp, str, _ref;
    str = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (i = 0, _ref = args.length; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      regexp = new RegExp("\\{" + i + "\\}", "gi");
      str = str.replace(regexp, args[i]);
    }
    return str;
  };
  String.capitalize = function(str) {
    if (!str) {
      return "";
    }
    return str[0].toUpperCase() + str.slice(1);
  };
}).call(this);
