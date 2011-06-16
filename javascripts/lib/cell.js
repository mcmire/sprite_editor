(function() {
  $["export"]("SpriteEditor.Cell", (function() {
    var Cell;
    Cell = (function() {
      function Cell() {
        var obj, _ref, _ref2;
        if (arguments.length === 1 && $.v.is.obj(arguments[0])) {
          obj = arguments[0];
          this.app = obj.app;
          this.loc = (_ref = obj.loc) != null ? _ref.clone() : void 0;
          this.color = (_ref2 = obj.color) != null ? _ref2.clone() : void 0;
        } else {
          this.app = arguments[0];
          this.loc = new SpriteEditor.CellLocation(arguments[0], arguments[1], arguments[2]);
          this.color = new SpriteEditor.Color.HSL();
        }
      }
      Cell.prototype.clear = function() {
        this.color = new SpriteEditor.Color.HSL();
        return this;
      };
      Cell.prototype.asClear = function() {
        return this.clone.clear();
      };
      Cell.prototype.withColor = function(color) {
        var clone;
        clone = this.clone();
        clone.color = color.clone();
        return clone;
      };
      Cell.prototype.coords = function() {
        return [loc.j, this.loc.i].join(",");
      };
      Cell.prototype.clone = function() {
        return new Cell(this);
      };
      return Cell;
    })();
    return Cell;
  })());
}).call(this);
