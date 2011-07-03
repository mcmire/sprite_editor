(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.DrawingCanvases", function(SpriteEditor) {
    var Canvas, DrawingCanvases, Keyboard, defaults;
    Keyboard = SpriteEditor.Keyboard;
    Canvas = SpriteEditor.Canvas;
    DrawingCanvases = {};
    SpriteEditor.DOMEventHelpers.mixin(DrawingCanvases, "SpriteEditor_DrawingCanvases");
    $.extend(DrawingCanvases, SpriteEditor.Eventable);
    defaults = {
      drawInterval: 80,
      saveInterval: 3000,
      widthInCells: 16,
      heightInCells: 16,
      cellSize: 30,
      showGrid: true,
      patternSize: 9
    };
    $.extend(DrawingCanvases, {
      init: function(app, options) {
        if (options == null) {
          options = {};
        }
        this.app = app;
        this.reset();
        $.extend(this, defaults, options);
        this._initCells();
        if (this.showGrid) {
          this._createGridBgCanvas();
        }
        this._createWorkingCanvas();
        this._createPreviewCanvases();
        return this;
      },
      destroy: function() {
        this.removeEvents();
        this.reset();
        localStorage.removeItem("sprite_editor.saved");
        return localStorage.removeItem("sprite_editor.cells");
      },
      reset: function() {
        this.stopDrawing();
        this.stopSaving();
        this.width = null;
        this.height = null;
        this.workingCanvas = null;
        this.gridBgCanvas = null;
        this.previewCanvas = null;
        this.cells = [];
        this.focusedCell = null;
        this.focusedCells = [];
        this.startDragAtCell = null;
        this.clipboard = [];
        this.stateBeforeSuspend = null;
        return this;
      },
      startDrawing: function() {
        var self;
        self = this;
        if (!this.isDrawing) {
          this.isDrawing = true;
          this._keepDrawing();
        }
        return this;
      },
      draw: function() {
        var _base;
        if (!this.workingCanvas) {
          return;
        }
        this._clearWorkingCanvas();
        this._clearPreviewCanvas();
        this._clearTiledPreviewCanvas();
        this._fillCells();
        if (typeof (_base = this.app.boxes.tools.currentTool()).draw === "function") {
          _base.draw();
        }
        this._updateTiledPreviewCanvas();
        return this;
      },
      _keepDrawing: function() {
        var self;
        self = this;
        this.draw();
        if (this.isDrawing) {
          return setTimeout((function() {
            return self._keepDrawing();
          }), this.drawInterval);
        }
      },
      stopDrawing: function() {
        this.isDrawing = false;
        return this;
      },
      startSaving: function() {
        var self;
        self = this;
        if (!this.isSaving) {
          this.isSaving = true;
          this._keepSaving();
        }
        return this;
      },
      save: function() {
        var cell, cells, row, _i, _j, _len, _len2, _ref;
        if (!window.RUNNING_TESTS) {
          console.log("Saving...");
        }
        cells = {};
        _ref = this.cells;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
            cell = row[_j];
            cells[cell.coords()] = cell.color.asJSON();
          }
        }
        localStorage.setItem("sprite_editor.cells", JSON.stringify(cells));
        return localStorage.setItem("sprite_editor.saved", "true");
      },
      _keepSaving: function() {
        var self;
        self = this;
        this.save();
        if (this.isSaving) {
          return setTimeout((function() {
            return self._keepSaving();
          }), this.saveInterval);
        }
      },
      stopSaving: function() {
        if (this.isSaving) {
          clearInterval(this.isSaving);
          this.isSaving = null;
        }
        return this;
      },
      suspend: function() {
        if (!this.stateBeforeSuspend) {
          this.stateBeforeSuspend = {
            wasDrawing: !!this.isDrawing,
            wasSaving: !!this.isSaving
          };
          this.stopDrawing();
          return this.stopSaving();
        }
      },
      resume: function() {
        if (this.stateBeforeSuspend) {
          if (this.stateBeforeSuspend.wasDrawing) {
            this.startDrawing();
          }
          if (this.stateBeforeSuspend.wasSaving) {
            this.startSaving();
          }
          return this.stateBeforeSuspend = null;
        }
      },
      addEvents: function() {
        var self;
        self = this;
        this.startDrawing();
        this.workingCanvas.$element.mouseTracker({
          mousedown: function(event) {
            self.app.boxes.tools.currentTool().trigger("mousedown", event);
            return event.preventDefault();
          },
          mouseup: function(event) {
            self.app.boxes.tools.currentTool().trigger("mouseup", event);
            return event.preventDefault();
          },
          mousemove: function(event) {
            var mouse;
            self.app.boxes.tools.currentTool().trigger("mousemove", event);
            mouse = self.workingCanvas.$element.mouseTracker("pos");
            self._setFocusedCell(mouse);
            return self._setFocusedCells(mouse);
          },
          mousedragstart: function(event) {
            self.startDragAtCell = self.focusedCell.clone();
            return self.app.boxes.tools.currentTool().trigger("mousedragstart", event);
          },
          mousedrag: function(event) {
            return self.app.boxes.tools.currentTool().trigger("mousedrag", event);
          },
          mousedragstop: function(event) {
            self.startDragAtCell = null;
            return self.app.boxes.tools.currentTool().trigger("mousedragstop", event);
          },
          mouseglide: function(event) {
            return self.app.boxes.tools.currentTool().trigger("mouseglide", event);
          },
          mouseout: function(event) {
            self.app.boxes.tools.currentTool().trigger("mouseout", event);
            self._unsetFocusedCell();
            self._unsetFocusedCells();
            return self.draw();
          },
          draggingDistance: 3
        });
        return this._bindEvents(window, {
          blur: function() {
            return self.suspend();
          },
          focus: function() {
            return self.resume();
          }
        });
      },
      removeEvents: function() {
        var _ref;
        this.stopDrawing();
        if ((_ref = this.workingCanvas) != null) {
          _ref.$element.mouseTracker("destroy");
        }
        return this._unbindEvents(window, "blur", "focus");
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
          color = color.toRGBAString();
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
        color = cell.color;
        if (color.isClear()) {
          return;
        }
        return pc.imageData.setPixel(cell.loc.j, cell.loc.i, color.red, color.green, color.blue, Math.floor(color.alpha * 255));
      },
      _initCells: function() {
        var cell, cells, color, i, j, json, row, _ref, _results;
        json = localStorage.getItem("sprite_editor.cells");
        if (json) {
          cells = JSON.parse(json);
        }
        _results = [];
        for (i = 0, _ref = this.heightInCells; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          row = this.cells[i] = [];
          _results.push((function() {
            var _ref2, _results2;
            _results2 = [];
            for (j = 0, _ref2 = this.widthInCells; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
              cell = row[j] = new SpriteEditor.Cell(this, i, j);
              _results2.push(cells ? (color = cells[cell.coords()], row[j].color = new SpriteEditor.Color(color)) : void 0);
            }
            return _results2;
          }).call(this));
        }
        return _results;
      },
      _createGridBgCanvas: function() {
        return this.gridBgCanvas = Canvas.create(this.cellSize, this.cellSize, __bind(function(c) {
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
        this.workingCanvas = Canvas.create(this.width, this.height);
        this.workingCanvas.$element.attr("id", "working_canvas");
        if (this.showGrid) {
          return this.workingCanvas.$element.css("background-image", "url(" + this.gridBgCanvas.element.toDataURL("image/png") + ")");
        }
      },
      _createPreviewCanvases: function() {
        this.previewCanvas = Canvas.create(this.widthInCells, this.heightInCells);
        this.previewCanvas.element.id = "preview_canvas";
        this.tiledPreviewCanvas = Canvas.create(this.widthInCells * this.patternSize, this.heightInCells * this.patternSize);
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
        bs = (this.app.boxes.sizes.currentSize - 1) * this.cellSize;
        x = mouse.rel.x;
        y = mouse.rel.y;
        x1 = x - (bs / 2);
        x2 = x + (bs / 2);
        y1 = y - (bs / 2);
        y2 = y + (bs / 2);
        j1 = Math.floor(x1 / this.cellSize);
        j2 = Math.floor(x2 / this.cellSize);
        i1 = Math.floor(y1 / this.cellSize);
        i2 = Math.floor(y2 / this.cellSize);
        focusedCells = {};
        for (i = i1; i1 <= i2 ? i <= i2 : i >= i2; i1 <= i2 ? i++ : i--) {
          for (j = j1; j1 <= j2 ? j <= j2 : j >= j2; j1 <= j2 ? j++ : j--) {
            row = this.cells[i];
            if (row) {
              cell = row[j];
            }
            if (cell) {
              focusedCells[cell.coords()] = cell;
            }
          }
        }
        return this.focusedCells = focusedCells;
      },
      _unsetFocusedCell: function() {
        return this.focusedCell = null;
      },
      _unsetFocusedCells: function() {
        return this.focusedCells = [];
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
            opts = this.app.boxes.tools.currentTool().trigger("cellOptions", cell) || {};
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
        tpc.ctx.fillStyle = pattern;
        return tpc.ctx.fillRect(0, 0, tpc.width, tpc.height);
      }
    });
    return DrawingCanvases;
  });
}).call(this);
