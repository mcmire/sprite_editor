(function() {
  $["export"]("SpriteEditor.CellLocation", function(SpriteEditor) {
    var CellLocation;
    return CellLocation = (function() {
      CellLocation.plus = function(l1, l2) {
        return l1.plus(l2);
      };
      CellLocation.add = function() {
        return this.plus.apply(this, arguments);
      };
      CellLocation.minus = function(l1, l2) {
        return l1.minus(l2);
      };
      CellLocation.subtract = function() {
        return this.minus.apply(this, arguments);
      };
      function CellLocation() {
        var obj;
        if (arguments.length === 1 && $.v.is.obj(arguments[0])) {
          obj = arguments[0];
          this.app = obj.app, this.i = obj.i, this.j = obj.j, this.x = obj.x, this.y = obj.y;
        } else {
          this.app = arguments[0], this.i = arguments[1], this.j = arguments[2];
        }
        if (!((this.x != null) || (this.y != null))) {
          this._calculateXandY();
        }
      }
      CellLocation.prototype.add = function(offset) {
        if ((offset.i != null) && (offset.j != null)) {
          this.i += offset.i;
          this.j += offset.j;
          this._calculateXandY();
        } else if ((offset.x != null) && (offset.y != null)) {
          this.x += offset.x;
          this.y += offset.y;
          this._calculateIandJ();
        }
        return this;
      };
      CellLocation.prototype.plus = function(offset) {
        return this.clone().add(offset);
      };
      CellLocation.prototype.subtract = function(offset) {
        if ((offset.i != null) && (offset.j != null)) {
          this.i -= offset.i;
          this.j -= offset.j;
          this._calculateXandY();
        } else if ((offset.x != null) && (offset.y != null)) {
          this.x -= offset.x;
          this.y -= offset.y;
          this._calculateIandJ();
        }
        return this;
      };
      CellLocation.prototype.minus = function(offset) {
        return this.clone().subtract(offset);
      };
      CellLocation.prototype.gt = function(other) {
        return this.i > other.i || this.j > other.j;
      };
      CellLocation.prototype.clone = function() {
        return new CellLocation(this);
      };
      CellLocation.prototype.toJSON = function() {
        return JSON.stringify({
          x: this.x,
          y: this.y,
          i: this.i,
          j: this.j
        });
      };
      CellLocation.prototype.inspect = function() {
        return "(" + this.i + ", " + this.j + ")";
      };
      CellLocation.prototype._calculateXandY = function() {
        this.x = this.j * this.app.cellSize;
        return this.y = this.i * this.app.cellSize;
      };
      CellLocation.prototype._calculateIandJ = function() {
        this.i = this.y / this.app.cellSize;
        return this.j = this.x / this.app.cellSize;
      };
      return CellLocation;
    })();
  });
}).call(this);
