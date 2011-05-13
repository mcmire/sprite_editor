(function(window, document, $, undefined) {

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
    extend: function(obj, props) {
      for (var prop in props) {
        if (props.hasOwnProperty(prop)) {
          if ((prop in obj) && typeof obj[prop] == "function") {
            var _super = obj[prop],
                _new   = props[prop];
            obj[prop] = function() {
              var args = Array.prototype.slice.call(arguments);
              args.unshift(_super);
              return _new.apply(obj, args);
            }
          } else {
            obj[prop] = props[prop];
          }
        }
      }
      return obj;
    },

    // Makes a shallow clone of the given object. That is, any properties which
    // are objects will be copied by reference, not value, so if you change them
    // you'll be changing the original objects.
    //
    clone: function(obj) {
      return $.extend({}, obj);
    }
  })
  
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