(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.DrawingCanvases", function(SpriteEditor) {
    var DrawingCanvases, Keyboard;
    Keyboard = SpriteEditor.Keyboard;
    DrawingCanvases = {};
    SpriteEditor.DOMEventHelpers.mixin(DrawingCanvases, "SpriteEditor_DrawingCanvases");
    $.extend(DrawingCanvases, SpriteEditor.Eventable);
    $.extend(DrawingCanvases, {
      timer: null,
      width: null,
      height: null,
      workingCanvas: null,
      gridBgCanvas: null,
      previewCanvas: null,
      cells: [],
      focusedCell: null,
      focusedCells: null,
      startDragAtCell: null,
      clipboard: [],
      tickInterval: 80,
      widthInCells: 16,
      heightInCells: 16,
      cellSize: 30,
      showGrid: true,
      init: function(app) {
        this.app = app;
        this._initCells();
        if (this.showGrid) {
          this._createGridBgCanvas();
        }
        this._createWorkingCanvas();
        this._createPreviewCanvases();
        this.autoSaveTimer = setInterval((__bind(function() {
          return this.save();
        }, this)), 30000);
        return this;
      },
      destroy: function() {
        return this.removeEvents();
      },
      start: function() {
        var self;
        self = this;
        if (this.timer) {
          return;
        }
        this.timer = setInterval((function() {
          return self.draw();
        }), this.tickInterval);
        return this;
      },
      draw: function() {
        var _base;
        this._clearWorkingCanvas();
        this._clearPreviewCanvas();
        this._clearTiledPreviewCanvas();
        this._fillCells();
        if (typeof (_base = this.app.currentTool()).draw === "function") {
          _base.draw();
        }
        return this._updateTiledPreviewCanvas();
      },
      stop: function() {
        if (!this.timer) {
          return;
        }
        clearInterval(this.timer);
        this.timer = null;
        return this;
      },
      save: function() {
        var cell, cellJSON, row, _i, _len, _ref, _results;
        console.log("Saving...");
        localStorage.setItem("pixel_editor.saved", "true");
        _ref = this.cells;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          _results.push((function() {
            var _j, _len2, _results2;
            _results2 = [];
            for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
              cell = row[_j];
              cellJSON = JSON.stringify(cell.color);
              _results2.push(localStorage.setItem("cells." + cell.coords(), cellJSON));
            }
            return _results2;
          })());
        }
        return _results;
      },
      _initCells: function() {
        var color, i, j, needsReload, row, _ref, _results;
        needsReload = localStorage.getItem("pixel_editor.saved") === "true";
        _results = [];
        for (i = 0, _ref = this.heightInCells; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          row = this.cells[i] = [];
          _results.push((function() {
            var _ref2, _results2;
            _results2 = [];
            for (j = 0, _ref2 = this.widthInCells; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
              row[j] = new SpriteEditor.Cell(this, i, j);
              _results2.push(needsReload ? (color = JSON.parse(localStorage["cells." + j + "," + i]), row[j].color = new SpriteEditor.Color.HSL(color)) : void 0);
            }
            return _results2;
          }).call(this));
        }
        return _results;
      },
      addEvents: function() {
        var self;
        self = this;
        this.workingCanvas.$element.mouseTracker({
          mouseout: function(event) {
            self._unsetFocusedCells();
            return self.draw();
          },
          mousedown: function(event) {
            self.app.currentTool().trigger("mousedown", event);
            return event.preventDefault();
          },
          mouseup: function(event) {
            self.app.currentTool().trigger("mouseup", event);
            return event.preventDefault();
          },
          mousemove: function(event) {
            var mouse;
            mouse = self.workingCanvas.$element.mouseTracker("pos");
            self._setFocusedCell(mouse);
            return self._setFocusedCells(mouse);
          },
          mousedragstart: function(event) {
            self.startDragAtCell = self.focusedCell.clone();
            return self.app.currentTool().trigger("mousedragstart", event);
          },
          mousedragstop: function(event) {
            self.startDragAtCell = null;
            return self.app.currentTool().trigger("mousedragstop", event);
          },
          mousedrag: function(event) {
            return self.app.currentTool().trigger("mousedrag", event);
          },
          mouseglide: function(event) {
            return self.app.currentTool().trigger("mouseglide", event);
          }
        });
        this._bindEvents(window, {
          blur: function() {
            return self.stop();
          },
          focus: function() {
            return self.start();
          }
        });
        return this.start();
      },
      removeEvents: function() {
        this.workingCanvas.$element.mouseTracker("destroy");
        this._unbindEvents(window, "blur", "focus");
        return this.stop();
      },
      drawCell: function(cell, opts) {
        this.drawWorkingCell(cell, opts);
        return this.drawPreviewCell(cell);
      },
      drawWorkingCell: function(cell, opts) {
        var color, loc, wc;
        if (opts == null) {
          opts = {};
        }
        wc = this.workingCanvas;
        color = opts.color || cell.color;
        loc = opts.loc || cell.loc;
        if (typeof color !== "string") {
          if (color.isClear()) {
            return;
          }
          color = color.toRGB().toString();
        }
        wc.ctx.fillStyle = color;
        if (this.showGrid) {
          return wc.ctx.fillRect(loc.x + 1, loc.y + 1, this.cellSize - 1, this.cellSize - 1);
        } else {
          return wc.ctx.fillRect(loc.x, loc.y, this.cellSize, this.cellSize);
        }
      },
      drawPreviewCell: function(cell) {
        var color, pc;
        pc = this.previewCanvas;
        color = cell.color.toRGB();
        if (color.isClear()) {
          return;
        }
        return pc.imageData.setPixel(cell.loc.j, cell.loc.i, color.red, color.green, color.blue, 255);
      },
      _createGridBgCanvas: function() {
        return this.gridBgCanvas = SpriteEditor.Canvas.create(this.cellSize, this.cellSize, __bind(function(c) {
          c.ctx.strokeStyle = "#eee";
          c.ctx.beginPath();
          c.ctx.moveTo(0.5, 0);
          c.ctx.lineTo(0.5, this.cellSize);
          c.ctx.moveTo(0, 0.5);
          c.ctx.lineTo(this.cellSize, 0.5);
          c.ctx.stroke();
          return c.ctx.closePath();
        }, this));
      },
      _createWorkingCanvas: function() {
        this.width = this.widthInCells * this.cellSize;
        this.height = this.heightInCells * this.cellSize;
        this.workingCanvas = SpriteEditor.Canvas.create(this.width, this.height);
        this.workingCanvas.$element.attr("id", "working_canvas");
        if (this.showGrid) {
          return this.workingCanvas.$element.css("background-image", "url(" + this.gridBgCanvas.element.toDataURL("image/png") + ")");
        }
      },
      _createPreviewCanvases: function() {
        this.previewCanvas = SpriteEditor.Canvas.create(this.widthInCells, this.heightInCells);
        this.previewCanvas.element.id = "preview_canvas";
        this.tiledPreviewCanvas = SpriteEditor.Canvas.create(this.widthInCells * 9, this.heightInCells * 9);
        return this.tiledPreviewCanvas.element.id = "tiled_preview_canvas";
      },
      _setFocusedCell: function(mouse) {
        var i, j, x, y;
        x = mouse.rel.x;
        y = mouse.rel.y;
        j = Math.floor(x / this.cellSize);
        i = Math.floor(y / this.cellSize);
        return this.focusedCell = this.cells[i][j];
      },
      _setFocusedCells: function(mouse) {
        var bs, cell, focusedCells, i, i1, i2, j, j1, j2, row, x, x1, x2, y, y1, y2;
        bs = (this.app.currentBrushSize - 1) * this.cellSize;
        x = mouse.rel.x;
        y = mouse.rel.y;
        x1 = x - (bs / 2);
        x2 = x + (bs / 2);
        y1 = y - (bs / 2);
        y2 = y + (bs / 2);
        if (x1 < 0) {
          x1 = 0;
          x2 += -x1;
        }
        if (y1 < 0) {
          y1 = 0;
          y2 += -y1;
        }
        j1 = Math.floor(x1 / this.cellSize);
        j2 = Math.floor(x2 / this.cellSize);
        i1 = Math.floor(y1 / this.cellSize);
        i2 = Math.floor(y2 / this.cellSize);
        focusedCells = {};
        for (i = i1; i1 <= i2 ? i <= i2 : i >= i2; i1 <= i2 ? i++ : i--) {
          row = this.cells[i];
          for (j = j1; j1 <= j2 ? j <= j2 : j >= j2; j1 <= j2 ? j++ : j--) {
            cell = row[j];
            focusedCells[cell.coords()] = cell;
          }
        }
        return this.focusedCells = focusedCells;
      },
      _unsetFocusedCells: function() {
        return this.focusedCells = null;
      },
      _clearWorkingCanvas: function() {
        var wc;
        wc = this.workingCanvas;
        return wc.ctx.clearRect(0, 0, wc.width, wc.height);
      },
      _clearPreviewCanvas: function() {
        var pc;
        pc = this.previewCanvas;
        pc.element.width = pc.width;
        return pc.imageData = pc.ctx.createImageData(this.widthInCells, this.heightInCells);
      },
      _clearTiledPreviewCanvas: function() {
        var ptc;
        ptc = this.tiledPreviewCanvas;
        return ptc.ctx.clearRect(0, 0, ptc.width, ptc.height);
      },
      _fillCells: function() {
        var cell, opts, pc, row, wc, _i, _j, _len, _len2, _ref, _ref2;
        _ref = [this.workingCanvas, this.previewCanvas], wc = _ref[0], pc = _ref[1];
        wc.ctx.save();
        _ref2 = this.cells;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          row = _ref2[_i];
          for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
            cell = row[_j];
            opts = this.app.currentTool().trigger("cellOptions", cell) || {};
            this.drawCell(cell, opts);
          }
        }
        wc.ctx.restore();
        return pc.ctx.putImageData(pc.imageData, 0, 0);
      },
      _updateTiledPreviewCanvas: function() {
        var pattern, tpc;
        tpc = this.tiledPreviewCanvas;
        pattern = tpc.ctx.createPattern(this.previewCanvas.element, "repeat");
        tpc.ctx.save();
        tpc.ctx.fillStyle = pattern;
        tpc.ctx.fillRect(0, 0, tpc.width, tpc.height);
        return tpc.ctx.restore();
      }
    });
    return DrawingCanvases;
  });
}).call(this);
