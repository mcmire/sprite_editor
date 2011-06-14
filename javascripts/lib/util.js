(function(window, document, $, undefined) {

// Add class methods to the global ender object
$.ender({
  // Takes the given object and adds the given properties to it.
  //
  // Properties that already exist in the object are overridden. Functions are
  // handled specially, however. To wit, if two properties share the same name
  // and are functions (let's call them function A and B), instead of function A
  // being overridden with function B, you get a new function C which wraps
  // function B. Function C is exactly the same as B, except its argument list
  // is prepended with a reference to function A (you could call it the "_super"
  // reference).
  //
  extend: function(/*[deep, ]target, objects...*/) {
    var args = Array.prototype.slice.call(arguments);
    var deep = false, target, objects;
    if (typeof args[0] == "boolean") {
      deep = args.shift();
    }
    target = args.shift();
    objects = args;

    var self = this;
    $.v.each(objects, function(obj) {
      for (var prop in obj) {
        if (!obj.hasOwnProperty(prop)) continue;
        if (typeof target[prop] == "function") {
          (function(_super, _new) {
            target[prop] = function() {
              var tmp = this._super;
              this._super = _super;
              var rv = _new.apply(this, arguments);
              this._super = tmp;
              return rv;
            }
          })(target[prop], obj[prop])
        } else if (deep && $.v.is.obj(obj[prop])) {
          target[prop] = self.extend(deep, {}, obj[prop]);
        } else {
          target[prop] = obj[prop];
        }
      }
    })
    return target;
  },

  // Makes a shallow clone of the given object. That is, any properties which
  // are objects will be copied by reference, not value, so if you change them
  // you'll be changing the original objects.
  //
  clone: function(obj) {
    return $.extend({}, obj);
  },

  // Wraps the given function in another function which will call the original
  // function in the given context. Useful if you want to use a method of
  // an object as an event listener, while keeping the 'this' reference inside
  // the function as the object.
  //
  proxy: function(obj, fn) {
    return obj[fn].apply(obj, arguments);
  },

  // Given a chain of named objects, ensures that all objects in the chain
  // exist. For instance, given "Foo.Bar.Baz", `Foo` would be created if it
  // doesn't exist, then `Foo.Bar`, then `Foo.Bar.Baz`.
  //
  ns: function(chain) {
    var context = window;
    if (typeof chain == "string") {
      chain = chain.split(".");
    }
    $.v.each(chain, function(id) {
      if (typeof context[id] == "undefined") {
        context[id] = {};
      }
      context = context[id];
    })
    return context;
  },

  // Given a chain of named objects and an object, ensures that all objects in
  // the chain exist, then adds the given object to the end of the chain.
  export: function(chain, obj) {
    if (typeof chain == "string") {
      chain = chain.split(".");
    }
    tail = chain.pop();
    chain = this.ns(chain);
    chain[tail] = obj;
  }
})

// Add methods to each ender element
$.ender({
  center: function() {
    var vp = $.viewport();
    var self = $([this[0]]);
    var top = (vp.height / 2) - (self.height() / 2);
    var left = (vp.width / 2) - (self.width() / 2);
    self.css("top", top+"px").css("left", left+"px");
    return this;
  },
  // Adapted from code by Peter-Paul Koch
  // <http://www.quirksmode.org/js/findpos.html>
  absoluteOffset: function() {
    if (this.length == 0) return null;

    var node = this[0];
    var top = 0, left = 0;

    do {
      top  += node.offsetTop;
      left += node.offsetLeft;
    } while (node = node.offsetParent);

    /*
    var computedStyle = this.computedStyle();
    var border = {
      top:  parseInt(computedStyle["border-top-width"], 10),
      left: parseInt(computedStyle["border-left-width"], 10)
    }
    if (border.top)  top  -= border.top;
    if (border.left) left -= border.left;
    */

    return {top: top, left: left};
  },
  position: function() {
    var po = this.parent().offset();
    var o  = this.offset();
    return {top: o.top - po.top, left: o.left - po.left};
  },
  parent: function() {
    return $(this[0].parentNode);
  },
  // Copied from <http://blog.stchur.com/2006/06/21/css-computed-style/>
  computedStyle: function(prop) {
    var elem = this[0];
    var computedStyle;
    if (typeof elem.currentStyle !== 'undefined') {
      computedStyle = elem.currentStyle;
    } else {
      computedStyle = document.defaultView.getComputedStyle(elem, null);
    }
    return prop ? computedStyle[prop] : computedStyle;
  }
}, true);


// Returns a random number between min (inclusive) and max (exclusive).
// Copied from the MDC wiki
Math.randomFloat = function(min, max) {
  return Math.random() * (max - min) + min;
};

// Returns a random integer between min (inclusive) and max (exclusive?).
// Using Math.round() will give you a non-uniform distribution!
// Copied from the MDC wiki
Math.randomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// <http://stackoverflow.com/questions/610406/javascript-printf-string-format>
String.format = function(/* str, var1, var2, ... */) {
  var args = Array.prototype.slice.call(arguments);
  var str = args.shift();
  for (var i = 0; i < args.length; i++) {
    var regexp = new RegExp('\\{'+i+'\\}', 'gi');
    str = str.replace(regexp, args[i]);
  }
  return str;
};

String.capitalize = function(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}

})(window, window.document, window.ender);