(function() {

  $["export"]("SpriteEditor.Box.Sizes", function(SpriteEditor) {
    var Keyboard, Sizes;
    Keyboard = SpriteEditor.Keyboard;
    Sizes = {};
    SpriteEditor.DOMEventHelpers.mixin(Sizes, "SpriteEditor_Box_Sizes");
    $.extend(Sizes, {
      name: "Sizes",
      header: "Sizes",
      sizes: [1, 2, 3, 4],
      init: function(app) {
        var size, _fn, _i, _len, _ref;
        SpriteEditor.Box.init.call(this, app);
        this.sizeGrids = {};
        _ref = this.sizes;
        _fn = function(self, size) {
          var grid;
          grid = self._createGrid(self.app.canvases.cellSize * size);
          self.sizeGrids[size] = grid.$element;
          self.$element.append(grid.$element);
          return grid.$element.bind("click", function() {
            return self.select(size);
          });
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          size = _ref[_i];
          _fn(this, size);
        }
        this.reset();
        return this;
      },
      destroy: function() {
        SpriteEditor.Box.destroy.call(this);
        this.currentSize = null;
        this.removeEvents();
        return this;
      },
      reset: function() {
        return this.select(this.sizes[0]);
      },
      addEvents: function() {
        var _this = this;
        return this._bindEvents(document, {
          keydown: function(event) {
            var key;
            key = event.keyCode;
            switch (key) {
              case Keyboard.KEY_1:
                return _this.select(1);
              case Keyboard.KEY_2:
                return _this.select(2);
              case Keyboard.KEY_3:
                return _this.select(3);
              case Keyboard.KEY_4:
                return _this.select(4);
            }
          }
        });
      },
      removeEvents: function() {
        return this._unbindEvents(document, "keydown");
      },
      select: function(size) {
        if (size === this.currentSize) {
          return;
        }
        if (this.currentSize) {
          this.sizeGrids[this.currentSize].removeClass("selected");
        }
        this.currentSize = size;
        return this.sizeGrids[size].addClass("selected");
      },
      _createGrid: function(size) {
        var _this = this;
        return SpriteEditor.Canvas.create(size, size, function(c) {
          var cellSize, fontSize, metrics, text, x, y, _i, _j;
          cellSize = _this.app.canvases.cellSize;
          c.ctx.strokeStyle = "#eee";
          c.ctx.beginPath();
          for (x = _i = 0.5; 0.5 <= size ? _i < size : _i > size; x = _i += cellSize) {
            c.ctx.moveTo(x, 0);
            c.ctx.lineTo(x, size);
          }
          for (y = _j = 0.5; 0.5 <= size ? _j < size : _j > size; y = _j += cellSize) {
            c.ctx.moveTo(0, y);
            c.ctx.lineTo(size, y);
          }
          c.ctx.stroke();
          c.ctx.closePath();
          fontSize = 11;
          c.ctx.font = "" + fontSize + " px Helvetica";
          text = (size / cellSize) + "px";
          metrics = c.ctx.measureText(text);
          return c.ctx.fillText(text, size / 2 - metrics.width / 2, size / 2 + fontSize / 4);
        });
      }
    });
    return Sizes;
  });

}).call(this);
