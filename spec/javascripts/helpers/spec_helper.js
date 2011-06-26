(function() {
  var _ensureEnderObject;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ensureEnderObject = function(obj) {
    if (!('$' in obj)) {
      throw new Error("Actual doesn't seem to be an Ender instance!");
    }
  };
  window.specHelpers = {
    fireEvent: function(element, type, isNative, fn) {
      var evt;
      evt = document.createEvent(isNative ? 'HTMLEvents' : 'UIEvents');
      evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, window, 1);
      if (typeof fn === "function") {
        fn(evt);
      }
      return element.dispatchEvent(evt);
    },
    fireNativeEvent: function(element, type, fn) {
      return this.fireEvent(element, type, true, fn);
    },
    fireCustomEvent: function(element, type, fn) {
      return this.fireEvent(element, type, false, fn);
    }
  };
  beforeEach(function() {
    this.addMatchers({
      toContainObject: function(expected) {
        var key, result, val;
        result = true;
        for (key in expected) {
          val = expected[key];
          result &= this.env.equals_(this.actual[key], expected[key]);
        }
        return result;
      },
      toBeAnInstanceOf: function(cons) {
        var actual_class, actual_match, expected_class, expected_match, failure_message, negative_failure_message, result;
        if (!(typeof cons === "function" || cons.toString().match(/Constructor\b/))) {
          throw "Given constructor is not a Function, it is: " + cons;
        }
        failure_message = negative_failure_message = null;
        result = null;
        if (this.actual instanceof cons) {
          result = true;
        } else {
          expected_match = cons.toString().match(/^\[object (\w+)\]$/);
          actual_match = this.actual.constructor.toString().match(/^\[object (\w+)\]$/);
          if (expected_match && actual_match) {
            expected_class = expected_match[1];
            actual_class = actual_match[1];
            failure_message = "Expected object to be an instance of " + expected_class + ", but it was an instance of " + actual_class;
          } else if (expected_match) {
            failure_message = "Expected object to be an instance of " + expected_class + ", but it was: " + actual;
          }
          result = false;
        }
        this.message = function() {
          return [failure_message, negative_failure_message];
        };
        return result;
      },
      toThrowAnything: function() {
        var failure_message, negative_failure_message, result;
        if (typeof this.actual !== "function") {
          throw new Error("Actual is not a function");
        }
        failure_message = negative_failure_message = null;
        result = null;
        try {
          this.actual();
          result = false;
        } catch (e) {
          negative_failure_message = "Expected function not to throw an exception, but it threw " + (e.message || e);
          result = true;
        }
        this.message = function() {
          return [failure_message, negative_failure_message];
        };
        return result;
      },
      toHaveProperty: function(prop) {
        return this.actual.hasOwnProperty(prop);
      },
      toBeTypeOf: function(type) {
        return typeof this.actual === type;
      },
      toEqualColor: function(color) {
        var result;
        if (!(this.actual instanceof SpriteEditor.Color)) {
          throw new Error("Actual object isn't a Color!");
        }
        if (!(color instanceof SpriteEditor.Color)) {
          throw new Error("Expected object isn't a Color!");
        }
        result = this.actual.eq(color);
        this.message = function() {
          return ["Expected " + (this.actual.inspect()) + " to be equal to " + (color.inspect()) + ", but it wasn't", "Expected " + (this.actual.inspect()) + " to not be equal to given color, but it was"];
        };
        return result;
      },
      toHaveClass: function(cssClass) {
        _ensureEnderObject(this.actual);
        return this.actual.hasClass(cssClass);
      },
      toHaveCss: function() {
        var actual, opts, result;
        _ensureEnderObject(this.actual);
        if (arguments.length === 2) {
          opts = {};
          opts[arguments[0]] = arguments[1];
        } else {
          opts = arguments[0];
        }
        actual = $.v.reduce($.v.keys(opts), (__bind(function(h, k) {
          h[k] = this.actual.css(k);
          return h;
        }, this)), {});
        result = this.env.equals_(actual, opts);
        this.message = function() {
          return ["Expected " + (jasmine.pp(actual)) + " to be equal to " + (jasmine.pp(opts)), "Expected " + (jasmine.pp(actual)) + " to not be equal to given object"];
        };
        return result;
      }
    });
    return $('<div id="sandbox"/>').appendTo(document.body);
  });
  afterEach(function() {
    return $('#sandbox').remove();
  });
}).call(this);
