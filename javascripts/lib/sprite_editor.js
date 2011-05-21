(function(window, document, $, undefined) {

  var SpriteEditor = {};

  var Grid = {};
  Grid.create = function(editor, width, height) {
    return Canvas.create(width, height, function(c) {
      c.ctx.strokeStyle = "#eee";
      c.ctx.beginPath();
        // Draw vertical lines
        // We start at 0.5 because this is the midpoint of the path we want to stroke
        // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
        for (var x = 0.5; x < width; x += editor.cellSize) {
          c.ctx.moveTo(x, 0);
          c.ctx.lineTo(x, height);
        }
        // Draw horizontal lines
        for (var y = 0.5; y < height; y += editor.cellSize) {
          c.ctx.moveTo(0, y);
          c.ctx.lineTo(width, y);
        }
        c.ctx.stroke();
      c.ctx.closePath();

      var fontSize = 11;
      c.ctx.font = fontSize+"px Helvetica";
      var text = (width / editor.cellSize) + "px";
      var metrics = c.ctx.measureText(text);
      // I don't know why it's /4 here, but it is...
      c.ctx.fillText(text, width/2-metrics.width/2, height/2+fontSize/4);
    });
  }

  var Cell = function() {
    Cell.prototype.init.apply(this, arguments);
  }
  $.extend(Cell.prototype, {
    init: function(editor, x, y) {
      var self = this;
      self.editor = editor;
      self.j = x;
      self.i = y;
      self.actual = {x: x, y: y};
      self.enlarged = {x: x*editor.cellSize, y: y*editor.cellSize};
    },
    key: function() {
      var self = this;
      return [self.actual.x, self.actual.y].join(",")
    },
    clone: function() {
      var self = this;
      var cell = new Cell(self.editor, self.actual.x, self.actual.y);
      if (self.color) cell.color = self.color.clone();
      return cell;
    }
  })

  var CellHistory = {
    fixedSize: 100, // # of actions
    init: function(editor) {
      var self = this;
      self.editor = editor;
      self.events = [];
      self.currentEvent = { // Set
        hash: null,
        array: null
      };
      return self;
    },
    open: function() {
      var self = this;
      // Limit history to a fixed size
      if (self.events.length == self.fixedSize) self.events.shift();
      self.currentEvent.array = [];
      self.currentEvent.hash = {};
    },
    close: function() {
      var self = this;
      if (self.currentEvent.array && self.currentEvent.array.length > 0) {
        self.events.push(self.currentEvent.array);
      }
      self.currentEvent.array = null;
      self.currentEvent.hash = null;
    },
    add: function(cell) {
      var self = this;
      cell = cell.clone();
      if (!(cell.key() in self.currentEvent.hash)) {
        self.currentEvent.hash[cell.key()] = cell;
        self.currentEvent.array.push(cell);
      }
    },
    undo: function() {
      // Kind of weird to have this here as it kind of violates some sort of
      // responsibility principle since it's directly editing the editor,
      // but whatever...
      var self = this;
      var cells = self.events.pop();
      $.v.each(cells, function(cell) {
        self.editor.cells[cell.i][cell.j] = cell;
      })
    }
  };

  var Keyboard = {
    SHIFT_KEY: 16,
    CTRL_KEY: 17,
    ALT_KEY: 18,
    META_KEY: 91,

    pressedKeys: {}
  };

  $.extend(SpriteEditor, {
    $container: null,
    $leftPane: null,
    $centerPane: null,
    $rightPane: null,

    timer: null,
    width: null,
    height: null,
    pixelEditorCanvas: null,
    pixelGridCanvas: null,
    previewCanvas: null,
    currentCell: null,
    cells: [],
    currentFgColor: Color.fromRGB(172, 85, 255),
    currentBgColor: Color.fromRGB(255, 38, 192),
    currentColorType: 'foreground',
    currentTool: "pencil",
    currentBrushSize: 1,
    cellHistory: null,

    tickInterval: 30, // ms/frame
    widthInCells: 16, // cells
    heightInCells: 16, // cells
    cellSize: 30, // pixels

    init: function() {
      var self = this;

      self.cellHistory = CellHistory.init(self);
      self.$container = $('#main');

      self._createMask();
      self._initCells();
      self._createWrapperDivs();
      self._createPixelGridCanvas();
      self._createPixelEditorCanvas();
      self._createToolBox();
      self._createBrushSizesBox();
      self._createColorPickerBox();
      self._createPreviewBox();
      self._addEvents();
      //self.redraw();

      return self;
    },

    start: function() {
      var self = this;
      self.timer = setInterval(function() { self.redraw() }, self.tickInterval);
      return self;
    },

    redraw: function() {
      var self = this;
      self._clearPixelEditorCanvas();
      self._clearPreviewCanvas();
      self._clearTiledPreviewCanvas();
      self._highlightCurrentCells();
      self._fillCells();
      self._updateTiledPreviewCanvas();
    },

    stop: function() {
      var self = this;
      clearInterval(self.timer);
      return self;
    },

    currentColor: function() {
      var self = this;
      if (self.currentColorType == 'foreground') {
        return self.currentFgColor;
      } else {
        return self.currentBgColor;
      }
    },

    _initCells: function() {
      var self = this;
      for (var i=0; i<self.heightInCells; i++) {
        var row = self.cells[i] = [];
        for (var j=0; j<self.widthInCells; j++) {
          row[j] = new Cell(self, j, i);
        }
      }
    },

    _createWrapperDivs: function() {
      var self = this;

      self.$leftPane = $("<div/>");
      self.$leftPane.attr("id", "left_pane");
      self.$container.append(self.$leftPane);

      self.$rightPane = $("<div/>");
      self.$rightPane.attr("id", "right_pane");
      self.$container.append(self.$rightPane);

      self.$centerPane = $("<div/>");
      self.$centerPane.attr("id", "center_pane");
      self.$container.append(self.$centerPane);
    },

    _createPixelGridCanvas: function() {
      var self = this;
      self.pixelGridCanvas = Canvas.create(self.cellSize, self.cellSize, function(c) {
        c.ctx.strokeStyle = "#eee";
        c.ctx.beginPath();
          // Draw a vertical line on the left
          // We use 0.5 instead of 0 because this is the midpoint of the path we want to stroke
          // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
          c.ctx.moveTo(0.5, 0);
          c.ctx.lineTo(0.5, c.element.height);
          // Draw a horizontal line on top
          c.ctx.moveTo(0, 0.5);
          c.ctx.lineTo(c.element.width, 0.5);
        c.ctx.stroke();
        c.ctx.closePath();
      });
    },

    _createPixelEditorCanvas: function() {
      var self = this;
      self.width = self.widthInCells * self.cellSize;
      self.height = self.heightInCells * self.cellSize;
      self.pixelEditorCanvas = Canvas.create(self.width, self.height);
      self.pixelEditorCanvas.$element
        .attr("id", "pixel_editor_canvas")
        .css("background-image", 'url('+self.pixelGridCanvas.element.toDataURL("image/png")+')');
      self.$centerPane.append(self.pixelEditorCanvas.$element);
    },

    _createColorPickerBox: function() {
      var self = this;

      var $boxDiv = $("<div/>").attr("id", "color_box").addClass("box");
      self.$rightPane.append($boxDiv);

      var $header = $("<h3/>").html("Color");
      $boxDiv.append($header);

      var $fgColorSampleDiv = $('<div class="color_sample" />');
      $fgColorSampleDiv.css("background-color", "rgb("+self.currentFgColor.toRGBString()+")");
      $fgColorSampleDiv.bind('click', function() {
        self.colorPickerBox.open(self.currentFgColor);
      })
      $boxDiv.append($fgColorSampleDiv);

      var $bgColorSampleDiv = $('<div class="color_sample" />');
      $bgColorSampleDiv.css("background-color", "rgb("+self.currentBgColor.toRGBString()+")");
      $bgColorSampleDiv.bind('click', function() {
        self.colorPickerBox.open(self.currentBgColor);
      })
      $boxDiv.append($bgColorSampleDiv);

      self.colorPickerBox = SpriteEditor.ColorPickerBox.init($boxDiv, {
        open: function() {
          self._removePixelEditorCanvasEvents();
          //self._showMask();
        },
        close: function() {
          //self._hideMask();
          self._addPixelEditorCanvasEvents();
        }
      });
      $(document.body).append(self.colorPickerBox.$container);
    },

    _createPreviewBox: function() {
      var self = this;

      var $boxDiv = $("<div/>").attr("id", "preview_box").addClass("box");
      self.$rightPane.append($boxDiv);

      var $header = $("<h3/>").html("Preview");
      $boxDiv.append($header);

      self.previewCanvas = Canvas.create(self.widthInCells, self.heightInCells);
      self.previewCanvas.element.id = "preview_canvas";
      $boxDiv.append(self.previewCanvas.$element);

      self.tiledPreviewCanvas = Canvas.create(self.widthInCells * 9, self.heightInCells * 9);
      self.tiledPreviewCanvas.element.id = "tiled_preview_canvas";
      $boxDiv.append(self.tiledPreviewCanvas.$element);
    },

    _createToolBox: function() {
      var self = this;

      var $boxDiv = $("<div/>").attr("id", "tool_box").addClass("box");
      self.$leftPane.append($boxDiv);

      var $header = $("<h3/>").html("Toolbox");
      $boxDiv.append($header);

      var $ul = $("<ul/>");
      $boxDiv.append($ul);

      var $imgs = $([]);
      $.v.each(["pencil", "bucket"], function(tool) {
        var $li = $("<li/>");

        var $img = $("<img/>");
        $img.addClass("tool")
            .attr("width", 24)
            .attr("height", 24)
            .attr("src", "images/"+tool+".png");
        $imgs.push($img[0]);
        $li.append($img);
        $ul.append($li);

        // For some reason this doesn't work right if we just use click()... bug??
        $img.bind('click', function() {
          self.currentTool = tool;
          $imgs.removeClass("selected");
          $img.addClass("selected");
        })
        if (self.currentTool == tool) $img.trigger('click');
      })
    },

    _createBrushSizesBox: function() {
      var self = this;

      var $boxDiv = $("<div/>").attr("id", "sizes_box").addClass("box");
      self.$leftPane.append($boxDiv);

      var $header = $("<h3/>").html("Sizes");
      $boxDiv.append($header);

      var $grids = $([]);
      $.v.each([1, 2, 3, 4], function(brushSize) {
        var grid = Grid.create(self, self.cellSize*brushSize, self.cellSize*brushSize);
        $grids.push(grid.element);
        $boxDiv.append(grid.$element);
        // For some reason this doesn't work right if we just use click()... bug??
        grid.$element.bind('click', function() {
          self.currentBrushSize = brushSize;
          $grids.removeClass("selected");
          grid.$element.addClass("selected");
        })
        if (self.currentBrushSize == brushSize) {
          grid.$element.trigger('click');
        }
      })
    },

    _addEvents: function() {
      var self = this;
      self._addKeyboardEvents();
      self._addPixelEditorCanvasEvents();
    },

    _addKeyboardEvents: function() {
      var self = this;
      $(document).bind({
        "keydown.keyboard": function(event) {
          Keyboard.pressedKeys[event.keyCode] = true;
        },
        "keyup.keyboard": function(event) {
          delete Keyboard.pressedKeys[event.keyCode];
        }
      });
    },

    _removeKeyboardEvents: function() {
      var self = this;
      $(document).unbind([
        'keydown.keyboard',
        'keyup.keyboard'
      ].join(" "));
    },

    _addPixelEditorCanvasEvents: function() {
      var self = this;
      $(document).bind({
        "keydown.pixelEditor": function(event) {
          if (event.keyCode == 90 && (event.ctrlKey || event.metaKey)) {
            // Ctrl-Z or Command-Z: Undo last action
            self.cellHistory.undo();
          }
          if (event.keyCode == Keyboard.SHIFT_KEY) {
            self.currentColorType = 'background';
          }
        },
        "keyup.pixelEditor": function() {
          self.currentColorType = 'foreground';
        }
      })
      self.pixelEditorCanvas.$element.mouseTracker({
        "mouseover": function(event) {
          self.start();
        },
        "mouseout": function(event) {
          self._unsetCurrentCells();
          self.stop();
          self.redraw();
        },
        "mousedown": function(event) {
          self.cellHistory.open();
          event.preventDefault();
        },
        "mouseup": function(event) {
          switch (self.currentTool) {
            case "pencil":
              if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
                self._setCurrentCellsToUnfilled();
              } else {
                self._setCurrentCellsToFilled();
              }
              break;
            case "bucket":
              if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
                self._setCellsLikeCurrentToUnfilled();
              } else {
                self._setCellsLikeCurrentToFilled();
              }
              break;
          }
          self.cellHistory.close();
          event.preventDefault();
        },
        "mousemove": function(event) {
          var mouse = self.pixelEditorCanvas.$element.mouseTracker('pos');
          self._setCurrentCells(mouse);
        },
        "mousedragstart": function(event) {
          self.selectedCells = [];
        },
        "mousedrag": function(event) {
          if (self.currentTool == "pencil") {
            // FIXME: If you drag too fast it will skip some cells!
            // Use the current mouse position and the last mouse position and
            //  fill in or erase cells in between.
            if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
              self._setCurrentCellsToUnfilled();
            } else {
              self._setCurrentCellsToFilled();
            }
          }
        }//,
        //debug: true
      })
      $(window).bind({
        "blur.pixelEditor": function() {
          self.stop();
        }
      })
    },

    _removePixelEditorCanvasEvents: function() {
      var self = this;
      $(document).unbind([
        'keydown.pixelEditor',
        'keyup.pixelEditor'
      ].join(" "));
      // XXX: The issue now is that when we re-initialize the mouse tracker,
      // the events do not seem to get bound correctly
      self.pixelEditorCanvas.$element.mouseTracker('destroy');
      $(window).unbind('blur.pixelEditor');
    },

    _setCurrentCells: function(mouse) {
      var self = this;

      var bs = (self.currentBrushSize-1) * self.cellSize;
      var x = mouse.rel.x;
      var y = mouse.rel.y;

      var currentCells = [];
      // Make a bounding box of pixels within the enlarged canvas based on
      // the brush size
      var x1 = x - (bs / 2),
          x2 = x + (bs / 2),
          y1 = y - (bs / 2),
          y2 = y + (bs / 2);
      // Scale each enlarged coord down to the actual pixel value
      // on the sprite
      var j1 = Math.floor(x1 / self.cellSize),
          j2 = Math.floor(x2 / self.cellSize),
          i1 = Math.floor(y1 / self.cellSize),
          i2 = Math.floor(y2 / self.cellSize);
      // Now that we have a bounding box of pixels, enumerate through all
      // pixels in this bounding box
      for (var i=i1; i<=i2; i++) {
        for (var j=j1; j<=j2; j++) {
          var row = self.cells[i];
          if (row && row[j]) {
            currentCells.push(row[j]);
          }
        }
      }
      self.currentCells = currentCells;
    },

    _unsetCurrentCells: function() {
      var self = this;
      self.currentCells = null;
    },

    _setCurrentCellsToFilled: function() {
      var self = this;
      if (self.currentCells) {
        $.v.each(self.currentCells, function(cell) {
          self.cellHistory.add(cell);
          // Clone so when changing the current color we don't change all cells
          // filled with that color
          cell.color = self.currentColor().clone();
        })
      }
    },

    _setCurrentCellsToUnfilled: function() {
      var self = this;
      if (self.currentCells) {
        $.v.each(self.currentCells, function(cell) {
          self.cellHistory.add(cell);
          cell.color = null;
        })
      }
    },

    _setCellsLikeCurrentToFilled: function() {
      var self = this;
      // Copy this as the color of the current cell will change during this loop
      var currentCellColor = self.currentCells[0].color;
      if (currentCellColor) currentCellColor = currentCellColor.clone();
      // Look for all cells with the color (or non-color) of the current cell
      // and mark them as filled with the current color
      $.v.each(self.cells, function(row, i) {
        $.v.each(row, function(cell, j) {
          if ((!cell.color && !currentCellColor) || cell.color.isEqual(currentCellColor)) {
            self.cellHistory.add(cell);
            cell.color = self.currentColor().clone();
          }
        })
      })
    },

    _setCellsLikeCurrentToUnfilled: function() {
      var self = this;
      // Copy this as the color of the current cell will change during this loop
      var currentCellColor = self.currentCells[0].color;
      if (currentCellColor) currentCellColor = currentCellColor.clone();
      // Look for all cells with the color of the current cell
      // and mark them as unfilled
      $.v.each(self.cells, function(row, i) {
        $.v.each(row, function(cell, j) {
          if (cell.color && cell.color.isEqual(currentCellColor)) {
            self.cellHistory.add(cell);
            cell.color = null;
          }
        })
      })
    },

    _clearPixelEditorCanvas: function() {
      var self = this;
      var c = self.pixelEditorCanvas;
      c.ctx.clearRect(0, 0, c.width, c.height);
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

    _highlightCurrentCells: function() {
      var self = this;
      var ctx = self.pixelEditorCanvas.ctx;
      var isDragging = self.pixelEditorCanvas.$element.mouseTracker('isDragging');
      if (self.currentCells && !(isDragging || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) && self.currentTool == "pencil") {
        ctx.save();
          ctx.fillStyle = 'rgba('+self.currentColor().toRGBString()+',0.5)';
          $.v.each(self.currentCells, function(cell) {
            ctx.fillRect(cell.enlarged.x+1, cell.enlarged.y+1, self.cellSize-1, self.cellSize-1);
          })
        ctx.restore();
      }
    },

    _fillCells: function() {
      var self = this;
      var c = self.pixelEditorCanvas;
      var pc = self.previewCanvas;
      c.ctx.save();
        $.v.each(self.cells, function(row, i) {
          $.v.each(row, function(cell, j) {
            if (cell.color) {
              c.ctx.fillStyle = 'rgb('+cell.color.toRGBString()+')';
              c.ctx.fillRect(cell.enlarged.x+1, cell.enlarged.y+1, self.cellSize-1, self.cellSize-1);
              pc.imageData.fillPixel(cell.actual.x, cell.actual.y, cell.color.red, cell.color.green, cell.color.blue, 255);
            }
          })
        })
      c.ctx.restore();
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
    },

    _createMask: function() {
      var self = this;
      self.$maskDiv = $('<div id="mask" />').hide();
      $(document.body).append(self.$maskDiv);
    },

    _showMask: function() {
      var self = this;
      self.$maskDiv.show();
    },

    _hideMask: function() {
      var self = this;
      self.$maskDiv.hide();
    }
  });
  window.SpriteEditor = SpriteEditor;

})(window, window.document, window.ender);