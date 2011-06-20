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
      }
    });
  });
}).call(this);
