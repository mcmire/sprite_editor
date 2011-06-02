(function(window, document, $, undefined) {

/*!
 * Represents the location of a cell.
 *
 * `i` and `j` are coordinates in the preview canvas (or row-column keys in
 * the cell array). `x` and `y` are coordinates in the working canvas.
 */
var CellLocation = function(/* editor, i, j | obj */) {
  var self = this;
  if (arguments.length == 1) {
    var obj = arguments[0];
    self.editor = obj.editor;
    self.i = obj.i;
    self.j = obj.j;
    self.x = obj.x;
    self.y = obj.y;
  } else {
    self.editor = arguments[0];
    self.i = arguments[1];
    self.j = arguments[2];
  }
  if (typeof self.x == "undefined" && typeof self.y == "undefined") {
    self._calculateXandY();
  }
}
$.extend(CellLocation, {
  add: function(l1, l2) {
    l1 = l1.clone();
    l1.add(l2);
    return l1;
  },
  subtract: function(l1, l2) {
    l1 = l1.clone();
    l1.subtract(l2);
    return l1;
  }
})
$.extend(CellLocation.prototype, {
  add: function(offset) {
    var self = this;
    self.i += offset.i;
    self.j += offset.j;
    if (typeof offset.x == "undefined" && typeof offset.y == "undefined") {
      self._calculateXandY();
    } else {
      self.x += offset.x;
      self.y += offset.y;
    }
  },
  subtract: function(offset) {
    var self = this;
    self.i -= offset.i;
    self.j -= offset.j;
    if (typeof offset.x == "undefined" && typeof offset.y == "undefined") {
      self._calculateXandY();
    } else {
      self.x -= offset.x;
      self.y -= offset.y;
    }
  },
  clone: function() {
    var self = this;
    var loc = new CellLocation(self);
    return loc;
  },
  toJSON: function() {
    var self = this;
    return JSON.stringify({
      x: self.x,
      y: self.y,
      i: self.i,
      j: self.j
    });
  },
  _calculateXandY: function() {
    var self = this;
    self.x = self.j * self.editor.cellSize;
    self.y = self.i * self.editor.cellSize;
  }
})
$.export('SpriteEditor.CellLocation', CellLocation);

})(window, window.document, window.ender);