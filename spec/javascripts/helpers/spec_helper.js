(function() {
  beforeEach(function() {
    this.addMatchers({
      toContainObject: function(expected) {
        var key, success, val;
        success = true;
        for (key in expected) {
          val = expected[key];
          success &= this.env.equals_(this.actual[key], val);
        }
        return success;
      },
      toBeAnInstanceOf: function(cons) {
        var actual_class, actual_match, expected_class, expected_match;
        if (!(typeof cons === "function" || cons.toString().match(/Constructor\b/))) {
          throw "Given constructor is not a Function, it is: " + cons;
        }
        if (this.actual instanceof cons) {
          return true;
        } else {
          expected_match = cons.toString().match(/^\[object (\w+)\]$/);
          actual_match = this.actual.constructor.toString().match(/^\[object (\w+)\]$/);
          if (expected_match && actual_match) {
            expected_class = expected_match[1];
            actual_class = actual_match[1];
            this.message = function() {
              return "Expected object to be an instance of " + expected_class + ", but it was an instance of " + actual_class;
            };
          } else if (expected_match) {
            this.message = function() {
              return "Expected object to be an instance of " + expected_class + ", but it was: " + actual;
            };
          }
          return false;
        }
      },
      toThrowAnything: function() {
        var result;
        if (typeof this.actual !== "function") {
          throw new Error("Actual is not a function");
        }
        try {
          this.actual();
          if (result = !this.isNot) {
            this.message = function() {
              return "Expected function to throw an exception, but it didn't";
            };
          }
        } catch (e) {
          if (result = this.isNot) {
            this.message = function() {
              return "Expected function not to throw an exception, but it threw " + (e.message || e);
            };
          }
        }
        return result;
      },
      toHaveProperty: function(prop) {
        var result, self;
        self = this;
        result = this.actual.hasOwnProperty(prop);
        this.message = function() {
          if (self.isNot && result) {
            return "Expected " + (jasmine.pp(self.actual)) + " to not have property '" + prop + "', but it did";
          } else if (!self.isNot && !result) {
            return "Expected " + (jasmine.pp(self.actual)) + " to have property '" + prop + "', but it didn't";
          }
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
