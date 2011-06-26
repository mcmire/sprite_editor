(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
        return this.removeEvents();
      },
      reset: function() {
        return this.select(this.sizes[0]);
      },
      addEvents: function() {
        return this._bindEvents(document, {
          keydown: __bind(function(event) {
            var key;
            key = event.keyCode;
            switch (key) {
              case Keyboard.KEY_1:
                return this.select(1);
              case Keyboard.KEY_2:
                return this.select(2);
              case Keyboard.KEY_3:
                return this.select(3);
              case Keyboard.KEY_4:
                return this.select(4);
            }
          }, this)
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
        return SpriteEditor.Canvas.create(size, size, __bind(function(c) {
          var cellSize, fontSize, metrics, text, x, y, _step, _step2;
          cellSize = this.app.canvases.cellSize;
          c.ctx.strokeStyle = "#eee";
          c.ctx.beginPath();
          for (x = 0.5, _step = cellSize; 0.5 <= size ? x < size : x > size; x += _step) {
            c.ctx.moveTo(x, 0);
            c.ctx.lineTo(x, size);
          }
          for (y = 0.5, _step2 = cellSize; 0.5 <= size ? y < size : y > size; y += _step2) {
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
        }, this));
      }
    });
    return Sizes;
  });
}).call(this);
