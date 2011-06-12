(function(window, document, $, undefined) {

var Cell = function(/* app, i, j | obj */) {
  var self = this;
  if (arguments.length == 1) {
    var obj = arguments[0];
    self.app = obj.app;
    if (obj.loc) self.loc = obj.loc.clone();
    if (obj.color) self.color = obj.color.clone();
  } else {
    self.app = arguments[0];
    self.loc = new SpriteEditor.CellLocation(arguments[0], arguments[1], arguments[2]);
  }
}
$.extend(Cell.prototype, {
  clear: function() {
    var self = this;
    self.color = null;
  },
  asClear: function() {
    var self = this;
    var clone = self.clone();
    clone.clear();
    return clone;
  },
  withColor: function(color) {
    var self = this;
    var clone = self.clone();
    clone.color = color.clone();
    return clone;
  },
  coords: function() {
    var self = this;
    return [self.loc.j, self.loc.i].join(",");
  },
  clone: function() {
    var self = this;
    var cell = new Cell(self);
    return cell;
  }
})
$.export('SpriteEditor.Cell', Cell);

})(window, window.document, window.ender);