(function() {
  beforeEach(function() {
    return this.addMatchers({
      toContainObject: function(expected) {
        var key, success, val;
        success = true;
        for (key in expected) {
          val = expected[key];
          success &= this.env.equals_(this.actual[key], val);
        }
        return success;
      },
      toBeAnInstanceOf: function(klass) {
        return this.actual instanceof klass;
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
      }
    });
  });
}).call(this);
