(function(window, document, $, undefined) {

var Cell = function(/* editor, i, j | obj */) {
  var self = this;
  if (arguments.length == 1) {
    var obj = arguments[0];
    self.editor = obj.editor;
    self.loc = obj.loc.clone();
    if (obj.color) self.color = obj.color.clone();
  } else {
    self.editor = arguments[0];
    self.loc = new SpriteEditor.CellLocation(arguments[0], arguments[1], arguments[2]);
  }
}
$.extend(Cell.prototype, {
  clear: function() {
    var self = this;
    self.color = null;
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