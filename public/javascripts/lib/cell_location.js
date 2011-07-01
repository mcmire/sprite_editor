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
          this.app = obj.app;
          obj = this._handleCoordsObject(obj, 'CellLocation');
          this.i = obj.i, this.j = obj.j, this.x = obj.x, this.y = obj.y;
        } else {
          this.app = arguments[0], this.i = arguments[1], this.j = arguments[2];
          $.extend(this._fillOutCoords(this));
        }
      }
      CellLocation.prototype.add = function(offset) {
        offset = this._fillOutCoords(offset);
        if (offset.i != null) {
          this.i += offset.i;
        }
        if (offset.j != null) {
          this.j += offset.j;
        }
        if (offset.x != null) {
          this.x += offset.x;
        }
        if (offset.y != null) {
          this.y += offset.y;
        }
        return this;
      };
      CellLocation.prototype.plus = function(offset) {
        return this.clone().add(offset);
      };
      CellLocation.prototype.subtract = function(offset) {
        offset = this._fillOutCoords(offset);
        if (offset.i != null) {
          this.i -= offset.i;
        }
        if (offset.j != null) {
          this.j -= offset.j;
        }
        if (offset.x != null) {
          this.x -= offset.x;
        }
        if (offset.y != null) {
          this.y -= offset.y;
        }
        return this;
      };
      CellLocation.prototype.minus = function(offset) {
        return this.clone().subtract(offset);
      };
      CellLocation.prototype.eq = function(other) {
        return this.i === other.i && this.j === other.j;
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
      CellLocation.prototype._handleCoordsObject = function(obj, sig) {
        if (!(obj instanceof CellLocation)) {
          this._validateCoords(obj, sig);
          obj = this._fillOutCoords(obj);
        }
        return obj;
      };
      CellLocation.prototype._validateCoords = function(obj, sig) {
        var count;
        count = 0;
        if (obj.x != null) {
          count += 1;
        }
        if (obj.y != null) {
          count += 2;
        }
        if (obj.i != null) {
          count += 3;
        }
        if (obj.j != null) {
          count += 4;
        }
        if (count === 5) {
          throw "" + sig + " accepts an object containing either i and j or x and y, but not a mixture!";
        }
        if (count === 0) {
          throw "An object passed to " + sig + " must contain i and j and/or x and y!";
        }
      };
      CellLocation.prototype._fillOutCoords = function(obj) {
        obj = $.extend(obj);
        if ((obj.j != null) && !(obj.x != null)) {
          obj.x = obj.j * this.app.cellSize;
        }
        if ((obj.i != null) && !(obj.y != null)) {
          obj.y = obj.i * this.app.cellSize;
        }
        if ((obj.y != null) && !(obj.i != null)) {
          obj.i = obj.y / this.app.cellSize;
        }
        if ((obj.x != null) && !(obj.j != null)) {
          obj.j = obj.x / this.app.cellSize;
        }
        return obj;
      };
      return CellLocation;
    })();
  });
}).call(this);
