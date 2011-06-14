(function(window, document, $, undefined) {

var DrawingCanvases = (function() {
  var canvases = {};
  SpriteEditor.DOMEventHelpers.mixin(canvases, "SpriteEditor_DrawingCanvases");
  $.extend(canvases, SpriteEditor.Eventable);

  $.extend(canvases, {
    timer: null,
    width: null,
    height: null,
    workingCanvas: null,
    gridBgCanvas: null,
    previewCanvas: null,
    cells: [],
    focusedCell: null,
    focusedCells: [],
    startDragAtCell: null,
    clipboard: [],

    tickInterval: 80,  // ms/frame
    widthInCells: 16,  // cells
    heightInCells: 16, // cells
    cellSize: 30       // pixels
  })

  $.extend(canvases, {
    init: function(app) {
      var self = this;
      self.app = app;

      self._initCells();
      self._createGridBgCanvas();
      self._createWorkingCanvas();
      self._createPreviewCanvases();
      self.autoSaveTimer = setInterval(function() { self.save() }, 30000);

      return self;
    },

    destroy: function() {
      var self = this;
      self.removeEvents();
    },

    start: function() {
      var self = this;
      if (self.timer) return;
      self.timer = setInterval(function() { self.draw() }, self.tickInterval);
      return self;
    },

    draw: function() {
      var self = this;
      self._clearWorkingCanvas();
      self._clearPreviewCanvas();
      self._clearTiledPreviewCanvas();
      self._fillCells();
      self._highlightFocusedCells();

      var tool = self.app.currentTool();
      if (typeof tool.draw != "undefined") tool.draw();

      self._updateTiledPreviewCanvas();
    },

    stop: function() {
      var self = this;
      if (!self.timer) return;
      clearInterval(self.timer);
      self.timer = null;
      return self;
    },

    save: function() {
      var self = this;
      localStorage.setItem('pixel_editor.saved', 'true')
      $.v.each(self.cells, function(row) {
        $.v.each(row, function(cell) {
          var cellJSON = cell.color;
          localStorage.setItem('cells.'+cell.coords(), JSON.stringify(cellJSON));
        });
      })
    },

    updateCell: function(cell) {
      var self = this;
      self.cells[cell.i][cell.j] = cell.clone();
    },

    _initCells: function() {
      var self = this;
      var needsReload = (localStorage.getItem('pixel_editor.saved') == 'true');
      for (var i=0; i<self.heightInCells; i++) {
        var row = self.cells[i] = [];
        for (var j=0; j<self.widthInCells; j++) {
          row[j] = new SpriteEditor.Cell(self, i, j);
          if (needsReload) {
            row[j].color = new SpriteEditor.Color.HSL(JSON.parse(localStorage['cells.'+j+','+i]));
          }
        }
      }
    },

    addEvents: function() {
      var self = this;
      self.workingCanvas.$element.mouseTracker({
        "mouseover": function(event) {
          //self.start();
        },
        "mouseout": function(event) {
          self._unsetFocusedCells();
          //self.stop();
          self.draw();
        },
        "mousedown": function(event) {
          self.app.currentTool().trigger('mousedown', event);
          event.preventDefault();
        },
        "mouseup": function(event) {
          self.app.currentTool().trigger('mouseup', event);
          event.preventDefault();
        },
        "mousemove": function(event) {
          var mouse = self.workingCanvas.$element.mouseTracker('pos');
          self._setFocusedCell(mouse);
          self._setFocusedCells(mouse);
        },
        "mousedragstart": function(event) {
          self.startDragAtCell = self.focusedCell.clone();
          self.app.currentTool().trigger('mousedragstart', event);
        },
        "mousedragstop": function(event) {
          self.startDragAtCell = null;
          self.app.currentTool().trigger('mousedragstop', event);
        },
        "mousedrag": function(event) {
          self.app.currentTool().trigger('mousedrag', event);
        },
        "mouseglide": function(event) {
          self.app.currentTool().trigger('mouseglide', event);
        }//,
        //debug: true
      })
      self._bindEvents(window, {
        blur: function() {
          self.stop();
        },
        focus: function() {
          self.start();
        }
      })
      self.start();
    },

    removeEvents: function() {
      var self = this;
      self.workingCanvas.$element.mouseTracker('destroy');
      self._unbindEvents(window, "blur", "focus");
      self.stop();
    },

    drawCell: function(cell, opts) {
      var self = this;
      self.drawWorkingCell(cell, opts);
      self.drawPreviewCell(cell);
    },

    drawWorkingCell: function(cell, opts) {
      var self = this;
      var wc = self.workingCanvas;
      var opts = opts || {};
      var color = opts.color || cell.color;
      var loc   = opts.loc   || cell.loc;
      if (typeof color != "string") {
        if (color.isClear()) return;
        color = color.toRGB().toString();
      }
      wc.ctx.fillStyle = color;
      wc.ctx.fillRect(loc.x+1, loc.y+1, self.cellSize-1, self.cellSize-1);
    },

    drawPreviewCell: function(cell) {
      var self = this;
      var pc = self.previewCanvas;
      var color = cell.color.toRGB();
      if (color.isClear()) return;
      pc.imageData.setPixel(cell.loc.j, cell.loc.i, color.red, color.green, color.blue, 255);
    },

    _createGridBgCanvas: function() {
      var self = this;
      self.gridBgCanvas = SpriteEditor.Canvas.create(self.cellSize, self.cellSize, function(c) {
        c.ctx.strokeStyle = "#eee";
        c.ctx.beginPath();
          // Draw a vertical line on the left
          // We use 0.5 instead of 0 because this is the midpoint of the path we want to stroke
          // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
          c.ctx.moveTo(0.5, 0);
          c.ctx.lineTo(0.5, self.cellSize);
          // Draw a horizontal line on top
          c.ctx.moveTo(0, 0.5);
          c.ctx.lineTo(self.cellSize, 0.5);
        c.ctx.stroke();
        c.ctx.closePath();
      });
    },

    _createWorkingCanvas: function() {
      var self = this;
      self.width = self.widthInCells * self.cellSize;
      self.height = self.heightInCells * self.cellSize;
      self.workingCanvas = SpriteEditor.Canvas.create(self.width, self.height);
      self.workingCanvas.$element
        .attr("id", "working_canvas")
        .css("background-image", 'url('+self.gridBgCanvas.element.toDataURL("image/png")+')');
    },

    _createPreviewCanvases: function() {
      var self = this;
      self.previewCanvas = SpriteEditor.Canvas.create(self.widthInCells, self.heightInCells);
      self.previewCanvas.element.id = "preview_canvas";
      self.tiledPreviewCanvas = SpriteEditor.Canvas.create(self.widthInCells * 9, self.heightInCells * 9);
      self.tiledPreviewCanvas.element.id = "tiled_preview_canvas";
    },

    _setFocusedCell: function(mouse) {
      var self = this;

      var x = mouse.rel.x,
          y = mouse.rel.y;

      var j = Math.floor(x / self.cellSize),
          i = Math.floor(y / self.cellSize);

      self.focusedCell = self.cells[i][j];
    },

    _setFocusedCells: function(mouse) {
      var self = this;

      var bs = (self.app.currentBrushSize-1) * self.cellSize;
      var x = mouse.rel.x,
          y = mouse.rel.y;

      var focusedCells = [];
      // Make a bounding box of pixels within the working canvas based on
      // the brush size
      var x1 = x - (bs / 2),
          x2 = x + (bs / 2),
          y1 = y - (bs / 2),
          y2 = y + (bs / 2);
      // Scale each coordinate on the working canvas down to the coordinate
      // on the preview canvas (which also serves as the cell coordinate
      // within the cells array-of-arrays)
      var j1 = Math.floor(x1 / self.cellSize),
          j2 = Math.floor(x2 / self.cellSize),
          i1 = Math.floor(y1 / self.cellSize),
          i2 = Math.floor(y2 / self.cellSize);
      // Now that we have a bounding box of cells, enumerate through all
      // cells in the box and add them to the set of current cells
      for (var i=i1; i<=i2; i++) {
        for (var j=j1; j<=j2; j++) {
          var row = self.cells[i];
          if (row && row[j]) {
            focusedCells.push(row[j]);
          }
        }
      }
      self.focusedCells = focusedCells;
    },

    _unsetFocusedCells: function() {
      var self = this;
      self.focusedCells = null;
    },

    _clearWorkingCanvas: function() {
      var self = this;
      var wc = self.workingCanvas;
      wc.ctx.clearRect(0, 0, wc.width, wc.height);
    },

    _clearPreviewCanvas: function() {
      var self = this;
      var pc = self.previewCanvas;
      // clearRect() won't clear image data set using createImageData(),
      // so this is another way to clear the canvas that works
      pc.element.width = pc.width;
      pc.imageData = pc.ctx.createImageData(self.widthInCells, self.heightInCells);
    },

    _clearTiledPreviewCanvas: function() {
      var self = this;
      var ptc = self.tiledPreviewCanvas;
      ptc.ctx.clearRect(0, 0, ptc.width, ptc.height);
    },

    _highlightFocusedCells: function() {
      var self = this;
      var ctx = self.workingCanvas.ctx;
      var isDragging = self.workingCanvas.$element.mouseTracker('isDragging');
      if (self.focusedCells && !(isDragging || SpriteEditor.Keyboard.pressedKeys[SpriteEditor.Keyboard.CTRL_KEY]) && self.app.currentToolName == "pencil") {
        var currentColor = self.app.currentColor[self.app.currentColor.type];
        ctx.save();
          // If a cell is already filled in, fill it in with white before
          // filling it with the current color, since we want to let the user
          // know which color each cell would get replaced with
          $.v.each(self.focusedCells, function(cell) {
            self.drawWorkingCell(cell, {color: '#fff'});
            self.drawWorkingCell(cell, {color: currentColor.with({alpha: 0.5})});
          })
        ctx.restore();
      }
    },

    _fillCells: function() {
      var self = this;
      var wc = self.workingCanvas,
          pc = self.previewCanvas;
      wc.ctx.save();
        $.v.each(self.cells, function(row, i) {
          $.v.each(row, function(origCell, j) {
            var customCell = self.app.currentTool().trigger('cellToDraw', origCell);
            self.drawCell(customCell || origCell);
          })
        })
      wc.ctx.restore();
      pc.ctx.putImageData(pc.imageData, 0, 0);
    },

    _updateTiledPreviewCanvas: function() {
      var self = this;
      var tpc = self.tiledPreviewCanvas;
      var pattern = tpc.ctx.createPattern(self.previewCanvas.element, 'repeat');
      tpc.ctx.save();
        tpc.ctx.fillStyle = pattern;
        tpc.ctx.fillRect(0, 0, tpc.width, tpc.height);
      tpc.ctx.restore();
    }
  })

  return canvases;
})() // end closure

$.export('SpriteEditor.DrawingCanvases', DrawingCanvases);

})(window, window.document, window.ender);