(function() {
  var _ensureEnderObject;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.RUNNING_TESTS = true;
  window.$sandbox = $('<div id="sandbox" />');
  window.sandboxAdded = false;
  _ensureEnderObject = function(obj) {
    if (!(typeof obj === "object" && '$' in obj)) {
      throw new Error("Object doesn't seem to be an Ender instance!");
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
      element.dispatchEvent(evt);
      return evt;
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
      toBe: function() {
        if (arguments.length) {
          return jasmine.Matchers.prototype.toBe.apply(this, arguments);
        } else {
          return this.actual != null;
        }
      },
      toEqualCell: function(cell) {
        var result;
        if (!this.actual) {
          throw new Error("Actual object is undefined.");
        }
        if (!(this.actual instanceof SpriteEditor.Cell)) {
          throw new Error("Actual object isn't a Cell!");
        }
        if (!cell) {
          throw new Error("Expected object is undefined.");
        }
        if (!(cell instanceof SpriteEditor.Cell)) {
          throw new Error("Expected object isn't a Cell!");
        }
        result = (this.actual.loc.eq(cell.loc) || (!this.actual.loc && !cell.loc)) && (this.actual.color.eq(cell.color) || (!this.actual.color && !cell.color));
        this.message = function() {
          return ["Expected " + (this.actual.inspect()) + " to be equal to " + (cell.inspect()), "Expected " + (this.actual.inspect()) + " to not be equal to given color"];
        };
        return result;
      },
      toEqualColor: function(color) {
        var result;
        if (!this.actual) {
          throw new Error("Actual object is undefined.");
        }
        if (!(this.actual instanceof SpriteEditor.Color)) {
          throw new Error("Actual object isn't a Color!");
        }
        if (!color) {
          throw new Error("Expected object is undefined.");
        }
        if (!(color instanceof SpriteEditor.Color)) {
          throw new Error("Expected object isn't a Color!");
        }
        result = this.actual.eq(color);
        this.message = function() {
          return ["Expected " + (this.actual.inspect()) + " to be equal to " + (color.inspect()), "Expected " + (this.actual.inspect()) + " to not be equal to given color"];
        };
        return result;
      },
      toBeElementOf: function(nodeName) {
        _ensureEnderObject(this.actual);
        return this.actual[0].nodeName.toLowerCase() === nodeName.toLowerCase();
      },
      toHaveClass: function(cssClass) {
        _ensureEnderObject(this.actual);
        return this.actual.hasClass(cssClass);
      },
      toHaveAttr: function() {
        var actual, props, result;
        _ensureEnderObject(this.actual);
        if (arguments.length === 2) {
          props = {};
          props[arguments[0]] = arguments[1];
        } else {
          props = arguments[0];
        }
        actual = $.v.reduce($.v.keys(props), (__bind(function(h, k) {
          h[k] = this.actual.attr(k);
          return h;
        }, this)), {});
        result = this.env.equals_(actual, props);
        this.message = function() {
          return ["Expected element to have attributes " + (jasmine.pp(props)) + ", but its attributes were " + (jasmine.pp(actual)), "Expected element to not have attributes " + (jasmine.pp(actual))];
        };
        return result;
      },
      toHaveCss: function() {
        var actual, props, result;
        _ensureEnderObject(this.actual);
        if (arguments.length === 2) {
          props = {};
          props[arguments[0]] = arguments[1];
        } else {
          props = arguments[0];
        }
        actual = $.v.reduce($.v.keys(props), (__bind(function(h, k) {
          h[k] = this.actual.css(k);
          return h;
        }, this)), {});
        result = this.env.equals_(actual, props);
        this.message = function() {
          return ["Expected element to have css " + (jasmine.pp(props)) + ", but its css was " + (jasmine.pp(actual)), "Expected element to not have css " + (jasmine.pp(actual))];
        };
        return result;
      },
      toHaveContent: function(html) {
        _ensureEnderObject(this.actual);
        return this.actual.html() === html;
      },
      toBeElement: function(other) {
        _ensureEnderObject(this.actual);
        _ensureEnderObject(other);
        return this.actual[0] === other[0];
      },
      toContainElement: function(selector, options) {
        var $elem, result;
        if (options == null) {
          options = {};
        }
        _ensureEnderObject(this.actual);
        if (typeof selector === "object" && '$' in selector) {
          result = $.isAncestor(this.actual[0], selector[0]);
          if (options.content) {
            result && (result = selector.html() === options.content);
          }
        } else {
          $elem = this.actual.find(selector);
          result = !!$elem.length;
          if (options.content) {
            result && (result = $elem.html() === options.content);
          }
        }
        return result;
      }
    });
    if (window.sandboxAdded) {
      return window.$sandbox.empty();
    } else {
      window.$sandbox.appendTo(document.body);
      return window.sandboxAdded = true;
    }
  });
}).call(this);
