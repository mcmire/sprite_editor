(function(window, document, $, undefined) {

/*!
 * Represents the location of a cell.
 *
 * `i` and `j` are coordinates in the preview canvas (or row-column keys in
 * the cell array). `x` and `y` are coordinates in the working canvas.
 */
var CellLocation = function(/* app, i, j | obj */) {
  var self = this;
  if (arguments.length == 1) {
    var obj = arguments[0];
    self.app = obj.app;
    self.i = obj.i;
    self.j = obj.j;
    self.x = obj.x;
    self.y = obj.y;
  } else {
    self.app = arguments[0];
    self.i = arguments[1];
    self.j = arguments[2];
  }
  if (typeof self.x == "undefined" && typeof self.y == "undefined") {
    self._calculateXandY();
  }
}
$.extend(CellLocation, {
  plus: function(l1, l2) {
    return l1.plus(l2);
  },
  add: function() {
    return this.plus.apply(this, arguments);
  },
  minus: function(l1, l2) {
    return l1.minus(l2);
  },
  subtract: function() {
    return this.minus.apply(this, arguments);
  }
})
$.extend(CellLocation.prototype, {
  // Adds the coordinates in the given CellLocation to this CellLocation
  add: function(offset) {
    var self = this;
    if (typeof offset.x == "undefined" && typeof offset.y == "undefined") {
      self.x += offset.x;
      self.y += offset.y;
      self._calculateIandJ();
    } else {
      self.i += offset.i;
      self.j += offset.j;
      self._calculateXandY();
    }
  },
  // Non-destructive version of #add.
  // You'll probably want to use this sparingly.
  plus: function(offset) {
    var self = this;
    var clone = self.clone();
    clone.add(offset);
    return clone;
  },

  // Subtracts this CellLocation from the coordinates of the given CellLocation
  subtract: function(offset) {
    var self = this;
    if (typeof offset.x == "undefined" && typeof offset.y == "undefined") {
      self.x -= offset.x;
      self.y -= offset.y;
      self._calculateIandJ();
    } else {
      self.i -= offset.i;
      self.j -= offset.j;
      self._calculateXandY();
    }
  },
  // Non-destructive version of #subtract.
  // You'll probably want to use this sparingly.
  minus: function(offset) {
    var self = this;
    var clone = self.clone();
    clone.subtract(offset);
    return clone;
  },

  gt: function(other) {
    var self = this;
    return self.i > other.i || self.j > other.j;
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
    self.x = self.j * self.app.cellSize;
    self.y = self.i * self.app.cellSize;
  },
  _calculateIandJ: function() {
    var self = this;
    self.i = self.y / self.app.cellSize;
    self.j = self.x / self.app.cellSize;
  }
})
$.export('SpriteEditor.CellLocation', CellLocation);

})(window, window.document, window.ender);