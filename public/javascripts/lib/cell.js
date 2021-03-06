(function() {

  $["export"]("SpriteEditor.Cell", function(SpriteEditor) {
    var Cell;
    Cell = (function() {

      function Cell() {
        var obj, _ref, _ref1;
        if (arguments.length === 1 && $.v.is.obj(arguments[0])) {
          obj = arguments[0];
          this.canvases = obj.canvases;
          this.loc = (_ref = obj.loc) != null ? _ref.clone() : void 0;
          this.color = (_ref1 = obj.color) != null ? _ref1.clone() : void 0;
        } else {
          this.canvases = arguments[0];
          this.loc = new SpriteEditor.CellLocation(arguments[0], arguments[1], arguments[2]);
          this.color = new SpriteEditor.Color();
        }
      }

      Cell.prototype.isClear = function() {
        return this.color.isClear();
      };

      Cell.prototype.clear = function() {
        this.color = new SpriteEditor.Color();
        return this;
      };

      Cell.prototype.asClear = function() {
        return this.clone().clear();
      };

      Cell.prototype.withColor = function(color) {
        var clone;
        clone = this.clone();
        if (!color.isClear()) {
          clone.color = color.clone();
        }
        return clone;
      };

      Cell.prototype.coords = function() {
        return [this.loc.i, this.loc.j].join(",");
      };

      Cell.prototype.clone = function() {
        return new Cell(this);
      };

      Cell.prototype.inspect = function() {
        return "{loc: " + (this.loc.inspect()) + ", color: " + (this.color.inspect()) + "}";
      };

      return Cell;

    })();
    return Cell;
  });

}).call(this);
