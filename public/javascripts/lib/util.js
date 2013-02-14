(function() {
  var __slice = [].slice;

  Math.randomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
  };

  Math.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  String.format = function() {
    var args, i, regexp, str, _i, _ref;
    str = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (i = _i = 0, _ref = args.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
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
