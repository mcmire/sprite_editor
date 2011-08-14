(function() {
  var proto;
  proto = jasmine.PrettyPrinter.prototype;
  proto.oldFormat_ = proto.format;
  proto.format = function(value) {
    if ((value != null) && typeof value.inspect === "function") {
      return this.append(value.inspect());
    } else {
      return this.oldFormat_(value);
    }
  };
}).call(this);
