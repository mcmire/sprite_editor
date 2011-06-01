(function(window, document, $, undefined) {

  var Grid = {};
  Grid.create = function(editor, width, height) {
    return Canvas.create(width, height, function(c) {
      var cellSize = editor.canvases.cellSize;

      c.ctx.strokeStyle = "#eee";
      c.ctx.beginPath();
        // Draw vertical lines
        // We start at 0.5 because this is the midpoint of the path we want to stroke
        // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
        for (var x = 0.5; x < width; x += cellSize) {
          c.ctx.moveTo(x, 0);
          c.ctx.lineTo(x, height);
        }
        // Draw horizontal lines
        for (var y = 0.5; y < height; y += cellSize) {
          c.ctx.moveTo(0, y);
          c.ctx.lineTo(width, y);
        }
        c.ctx.stroke();
      c.ctx.closePath();

      var fontSize = 11;
      c.ctx.font = fontSize+"px Helvetica";
      var text = (width / cellSize) + "px";
      // Place the text that indicates the brush size in the center of the canvas
      // I don't know why it's /4 here, but it is...
      var metrics = c.ctx.measureText(text);
      c.ctx.fillText(text, width/2-metrics.width/2, height/2+fontSize/4);
    });
  }

 /*!
  * Represents the location of a cell.
  *
  * `i` and `j` are coordinates in the preview canvas (or row-column keys in
  * the cell array). `x` and `y` are coordinates in the working canvas.
  */
  var CellLocation = window.CellLocation = function() {
    CellLocation.prototype.init.apply(this, arguments);
  }
  $.extend(CellLocation, {
    add: function(l1, l2) {
      l1 = l1.clone();
      l1.add(l2);
      return l1;
    },
    subtract: function(l1, l2) {
      l1 = l1.clone();
      l1.subtract(l2);
      return l1;
    }
  })
  $.extend(CellLocation.prototype, {
    init: function(/* editor, i, j | obj */) {
      var self = this;
      if (arguments.length == 1) {
        var obj = arguments[0];
        self.editor = obj.editor;
        self.i = obj.i;
        self.j = obj.j;
        self.x = obj.x;
        self.y = obj.y;
      } else {
        self.editor = arguments[0];
        self.i = arguments[1];
        self.j = arguments[2];
      }
      if (typeof self.x == "undefined" && typeof self.y == "undefined") {
        self._calculateXandY();
      }
    },
    add: function(offset) {
      var self = this;
      self.i += offset.i;
      self.j += offset.j;
      if (typeof offset.x == "undefined" && typeof offset.y == "undefined") {
        self._calculateXandY();
      } else {
        self.x += offset.x;
        self.y += offset.y;
      }
    },
    subtract: function(offset) {
      var self = this;
      self.i -= offset.i;
      self.j -= offset.j;
      if (typeof offset.x == "undefined" && typeof offset.y == "undefined") {
        self._calculateXandY();
      } else {
        self.x -= offset.x;
        self.y -= offset.y;
      }
    },
    clone: function() {
      var self = this;
      var loc = new CellLocation(self);
      return loc;
    },
    toJSON: function() {
      var self = this;
      return JSON.stringify({
        x: self.x,
        y: self.y,
        i: self.i,
        j: self.j
      });
    },
    _calculateXandY: function() {
      var self = this;
      self.x = self.j * self.editor.cellSize;
      self.y = self.i * self.editor.cellSize;
    }
  })

  var Cell = function() {
    Cell.prototype.init.apply(this, arguments);
  }
  $.extend(Cell.prototype, {
    init: function(/* editor, i, j | obj */) {
      var self = this;
      if (arguments.length == 1) {
        var obj = arguments[0];
        self.editor = obj.editor;
        self.loc = obj.loc.clone();
        if (obj.color) self.color = obj.color.clone();
      } else {
        self.editor = arguments[0];
        self.loc = new CellLocation(arguments[0], arguments[1], arguments[2]);
      }
    },
    clear: function() {
      var self = this;
      self.color = null;
    },
    coords: function() {
      var self = this;
      return [self.loc.j, self.loc.i].join(",");
    },
    clone: function() {
      var self = this;
      var cell = new Cell(self);
      return cell;
    }
  })

 /*!
  * CellHistory is responsible for storing the version history of cells in
  * the working canvas, and for providing the undo/redo functionality by
  * reversing and restoring different versions of the canvas.
  *
  * The different versions of the canvas in time are kept in an array, where
  * each element in the array corresponds to a cell on the canvas. When a cell
  * is changed, an object is created that contains a copy of the cell before it
  * was changed ("old") and after it was changed ("new").
  *
  * In order to undo and redo history, it's helpful to keep track of where in
  * the "timeline" (which index of the versions array) the current state of the
  * pixel editor points to. Undoing history is a matter of looking at the
  * current version in the history array, applying the "old" copies of the
  * changed cells therein, and moving back the pointer. Redoing history is then
  * achieved by looking at the next version after the pointer, applying the
  * "new" copies of the changed cells therein, and moving forward the pointer.
  * (Technically, for slightly cleaner code, the pointer points to the next
  * version after the current one, but the idea is the same.)
  */
  var CellHistory = {
    fixedSize: 100, // # of actions

    versions: [],
    workingVersion: {},
    numWorkingCells: 0,
    nextIndex: 0,

    init: function(canvases) {
      var self = this;
      self.canvases = canvases;
      return self;
    },
    open: function() {
      var self = this;
      self.workingVersion = {};
      self.numWorkingCells = 0;
    },
    close: function() {
      var self = this;
      if (self.numWorkingCells > 0) {
        // Limit history to a fixed size
        if (self.versions.length == self.fixedSize) self.versions.shift();
        // If the user just performed an undo, all future history which was
        // saved is now gone - POOF!
        self.versions.length = self.nextIndex;
        self.versions[self.nextIndex] = self.workingVersion;
        self.nextIndex++;
      }
      self.workingVersion = {};
      self.numWorkingCells = 0;
    },
    save: function(callback) {
      var self = this;
      self.open();
      callback();
      self.close();
    },
    add: function(cell, callback) {
      var self = this;
      if (cell.loc.toJSON() in self.workingVersion) return;
      var change = {};
      change['old'] = cell.clone();
      callback();
      change['new'] = cell.clone();
      self.workingVersion[cell.loc.toJSON()] = change;
      self.numWorkingCells++;
    },
    undo: function() {
      var self = this;

      var version = self.versions[self.nextIndex-1];
      $.v.each(version, function(key, change) {
        var loc = JSON.parse(key);
        self.canvases.cells[loc.y][loc.x] = change['old'].clone();
      })
      self.canvases.draw();

      self.nextIndex--;
    },
    canUndo: function() {
      var self = this;
      return (self.nextIndex >= 1);
    },
    redo: function() {
      var self = this;

      var version = self.versions[self.nextIndex];
      $.v.each(version, function(key, change) {
        var loc = JSON.parse(key);
        self.canvases.cells[loc.y][loc.x] = change['new'].clone();
      })
      self.canvases.draw();

      self.nextIndex++;
    },
    canRedo: function() {
      var self = this;
      return (self.nextIndex <= self.versions.length-1);
    },
  };

  var Tools = {
    toolNames: ["pencil", "bucket", "select", "dropper"],
    init: function(editor, canvases) {
      var self = this;
      $.v.each(self.toolNames, function(name) {
        self[name].init(editor, canvases);
      })
      return self;
    }
  };
  Tools.base = {
    init: function(editor, canvases) {
      var self = this;
      self.editor = editor;
      self.canvases = canvases;
    },
    trigger: function(name, event) {
      var self = this;
      if (typeof self[name] != "undefined") {
        self[name](event);
      }
    }
  };

  Tools.dropper = $.extend({}, Tools.base, {
    select: function() {
      var self = this;
      self.canvases.workingCanvas.$element.addClass("dropper");
    },
    unselect: function() {
      var self = this;
      self.canvases.workingCanvas.$element.removeClass("dropper");
    },
    mousedown: function(event){
      var self = this;
      var editor = self.editor;
      var color = self.canvases.focusedCells[0].color.clone();
      editor.currentColor[editor.currentColor.type] = color;
      editor.colorSampleDivs[editor.currentColor.type].trigger("update");
    }
  })

  Tools.pencil = $.extend({}, Tools.base, {
    mousedown: function(event) {
      this._handle(event);
    },
    mousedrag: function(event) {
      this._handle(event);
    },
    draw: function() {
      // ...
    },
    _handle: function(event) {
      var self = this;
      // FIXME: If you drag too fast it will skip some cells!
      // Use the current mouse position and the last mouse position and
      //  fill in or erase cells in between.
      if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
        self._setFocusedCellsToUnfilled();
      } else {
        self._setFocusedCellsToFilled();
      }
    },
    _setFocusedCellsToFilled: function() {
      var self = this;
      var cc   = self.editor.currentColor;
      if (self.canvases.focusedCells) {
        $.v.each(self.canvases.focusedCells, function(cell) {
          self.canvases.cellHistory.add(cell, function() {
            // Make a copy of the current color object so that if the current
            // color changes it doesn't change all cells that have that color
            cell.color = cc[cc.type].clone();
          })
        })
      }
    },
    _setFocusedCellsToUnfilled: function() {
      var self = this;
      if (self.canvases.focusedCells) {
        $.v.each(self.canvases.focusedCells, function(cell) {
          self.canvases.cellHistory.add(cell, function() {
            cell.clear();
          })
        })
      }
    }
  });
  Tools.bucket = $.extend({}, Tools.base, {
    mousedown: function(event) {
      var self = this;
      if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
        self._setCellsLikeCurrentToUnfilled();
      } else {
        self._setCellsLikeCurrentToFilled();
      }
    },
    draw: function() {
      // ...
    },
    _setCellsLikeCurrentToFilled: function() {
      var self = this;
      var cc  = self.editor.currentColor,
          ccc = self.canvases.focusedCells[0].color;
      // Copy the color of the current cell as it will change during this loop
      // (since one of the cells that matches the current color is the current cell itself)
      if (ccc) ccc = ccc.clone();
      // Look for all cells with the color (or non-color) of the current cell
      // and mark them as filled with the current color
      $.v.each(self.canvases.cells, function(row, i) {
        $.v.each(row, function(cell, j) {
          if ((!ccc && !cell.color) || (cell.color && cell.color.isEqual(ccc))) {
            self.canvases.cellHistory.add(cell, function() {
              cell.color = cc[cc.type].clone();
            })
          }
        })
      })
    },
    _setCellsLikeCurrentToUnfilled: function() {
      var self = this;
      // Copy this as the color of the current cell will change during this loop
      var currentCellColor = self.canvases.focusedCells[0].color;
      if (currentCellColor) currentCellColor = currentCellColor.clone();
      // Look for all cells with the color of the current cell
      // and mark them as unfilled
      $.v.each(self.canvases.cells, function(row, i) {
        $.v.each(row, function(cell, j) {
          if (cell.color && cell.color.isEqual(currentCellColor)) {
            self.canvases.cellHistory.add(cell, function() {
              cell.clear();
            })
          }
        })
      })
    }
  });
  Tools.select = $.extend({}, Tools.base, {
    selectionStart: null,
    selectionEnd: null,
    selectedCells: [],
    makingSelection: false,
    offset: 0,

    /*
    init: function() {
      var self = this;
      self._super.apply(self, arguments);
      self._clearSelection();
    },
    */

    select: function() {
      var self = this;
      self.canvases.workingCanvas.$element.addClass("crosshair");
    },
    unselect: function() {
      var self = this;
      self.canvases.workingCanvas.$element.removeClass("crosshair");
      self._clearSelection();
    },
    keydown: function(event) {
      var self = this;
      var key = event.keyCode;
      if (key == Keyboard.X_KEY && (event.metaKey || event.ctrlKey)) {
        // Ctrl-X: Cut selection
        self.canvases.clipboard = $.v.map(self.selectedCells, function(cell) { return cell.clone() });
        self._clearSelection();
        self.canvases.cellHistory.save(function() {
          $.v.each(self.selectedCells, function(cell) {
            self.canvases.cellHistory.add(cell, function() {
              cell.clear();
            });
          })
        });
      }
    },
    mouseglide: function(event) {
      var self = this;
      if (self._focusIsInsideOfSelection()) {
        self.canvases.workingCanvas.$element.addClass("move");
      } else {
        self.canvases.workingCanvas.$element.removeClass("move");
      }
    },
    mousedragstart: function(event) {
      var self = this;
      // If something is selected and drag started from within the selection,
      // then detach the selected cells from the canvas and put them in a
      // separate selection layer
      if (self.selectionStart && self._focusIsInsideOfSelection()) {
        $.v.each(self.selectedCells, function(cell) {
          self.canvases.cells[cell.loc.i][cell.loc.j].clear();
        })
      }
      // Otherwise, the user is making a new selection
      else {
        self._clearSelection();
        self.makingSelection = true;
        var c = self.canvases.focusedCell;
        self.selectionStart = c.loc.clone();
        //self.selectionEnd   = {x: c.x+self.canvases.cellSize, y: c.y+self.canvases.cellSize, i: c.i, j: c.j};
      }
    },
    mousedrag: function(event) {
      var self = this;
      if (self.makingSelection) {
        // Expand or contract the selection box
        // TODO: Support starting selection and dragging northwest instead of southeast
        var c = self.canvases.focusedCell;
        self.selectionEnd = c.loc.clone();
        self.selectionEnd.x += self.canvases.cellSize;
        self.selectionEnd.y += self.canvases.cellSize;
        self._calculateSelectedCells();
      } else {
        // Move the selected cells by the amount the selection box has been dragged
        // TODO: Make this undoable
        var dc = self.canvases.startDragAtCell,
            fc = self.canvases.focusedCell;
        self.dragOffset = CellLocation.subtract(fc.loc, dc.loc);
      }
    },
    mousedragstop: function(event) {
      var self = this;
      if (!self.makingSelection) {
        // Apply the drag offset to the selection box and cells inside
        self.selectionStart.add(self.dragOffset);
        self.selectionEnd.add(self.dragOffset);
        $.v.each(self.selectedCells, function(cell) {
          cell.loc.add(self.dragOffset);
        })
        self.dragOffset = null;
      }
      self.makingSelection = false;
    },
    mouseup: function(event) {
      var self = this;
      // If mouse is clicked out of the selection, merge the selection layer
      // into the canvas and then clear the selection
      var isDragging = self.canvases.workingCanvas.$element.mouseTracker('isDragging');
      if (!isDragging && self._focusIsOutsideOfSelection()) {
        $.v.each(self.selectedCells, function(cell) {
          self.canvases.cells[cell.loc.i][cell.loc.j] = cell.clone();
        })
        self._clearSelection();
      }
    },
    draw: function() {
      var self = this;
      if (!self.selectionStart || !self.selectionEnd) return;

      var ctx = self.canvases.workingCanvas.ctx;
      ctx.save();
        // Draw the selected cells, which is actually a separate layer, since
        // they may have been dragged to a different place than the actual
        // cells they originally point to
        if (self.dragOffset) {
          $.v.each(self.selectedCells, function(cell) {
            var loc = CellLocation.add(cell.loc, self.dragOffset);
            self.canvases.drawCell(cell, {loc: loc});
          })
        } else {
          $.v.each(self.selectedCells, function(cell) {
            self.canvases.drawCell(cell);
          });
        }

        var ss = self.dragOffset
          ? CellLocation.add(self.selectionStart, self.dragOffset)
          : self.selectionStart;
        var se = self.dragOffset
          ? CellLocation.add(self.selectionEnd, self.dragOffset)
          : self.selectionEnd;

        // Draw a translucent rectangle that represents the selection area to
        // make it stand out
        ctx.fillStyle = "rgba(186, 229, 250, 0.3)";
        ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(se.x, ss.y);
          ctx.lineTo(se.x, se.y);
          ctx.lineTo(ss.x, se.y);
          ctx.lineTo(ss.x, ss.y);
        ctx.fill();

        // Draw a rectangle that represents the selection area, with an animated
        // "marching ants" dotted border
        ctx.strokeStyle = "#000";
        ctx.beginPath();
          // top
          for (var x = ss.x+self.offset; x < se.x; x += 4) {
            var y1 = ss.y;
            ctx.moveTo(x, y1+0.5);
            ctx.lineTo(x+2, y1+0.5);
          }
          // right
          for (var y = ss.y+self.offset; y < se.y; y += 4) {
            var x2 = se.x;
            ctx.moveTo(x2+0.5, y);
            ctx.lineTo(x2+0.5, y+2);
          }
          // bottom
          for (var x = se.x-self.offset; x > ss.x+2; x -= 4) {
            var y2 = se.y;
            ctx.moveTo(x, y2+0.5);
            ctx.lineTo(x-2, y2+0.5);
          }
          // left
          for (var y = se.y-self.offset; y > ss.y+2; y -= 4) {
            var x1 = ss.x;
            ctx.moveTo(x1+0.5, y);
            ctx.lineTo(x1+0.5, y-2);
          }
        ctx.stroke();

      ctx.restore();
      // Animate the "marching ants"
      // FIXME: Only animate on dragstop, not while dragging
      self.offset++;
      self.offset %= 4;
    },
    _clearSelection: function() {
      var self = this;
      self.selectionStart = null;
      self.selectionEnd = null;
      self.selectedCells = [];
      self.makingSelection = false;
    },
    _calculateSelectedCells: function() {
      var self = this;
      var selectedCells = [];
      for (var i=self.selectionStart.i; i<=self.selectionEnd.i; i++) {
        for (var j=self.selectionStart.j; j<=self.selectionEnd.j; j++) {
          selectedCells.push(self.canvases.cells[i][j].clone());
        }
      }
      self.selectedCells = selectedCells;
    },
    _focusIsInsideOfSelection: function() {
      var self = this;
      var c  = self.canvases.focusedCell,
          sa = self.selectionStart,
          sb = self.selectionEnd;
      return (sa && sb && c.loc.i >= sa.i && c.loc.i <= sb.i && c.loc.j >= sa.j && c.loc.j <= sb.j);
    },
    _focusIsOutsideOfSelection: function() {
      var self = this;
      var c  = self.canvases.focusedCell,
          sa = self.selectionStart,
          sb = self.selectionEnd;
      return (c.loc.i < sa.i || c.loc.i > sb.i || c.loc.j < sa.j || c.loc.j > sb.j);
    }
  })

  var DrawingCanvases = {
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
    cellHistory: null,
    clipboard: [],

    tickInterval: 80,  // ms/frame
    widthInCells: 16,  // cells
    heightInCells: 16, // cells
    cellSize: 30,      // pixels

    init: function(editor) {
      var self = this;
      self.editor = editor;

      self.cellHistory = CellHistory.init(self);
      self._initCells();
      self._createGridBgCanvas();
      self._createWorkingCanvas();
      self._createPreviewCanvases();
      self.autoSaveTimer = setInterval(function() { self.save() }, 30000);
      self.start();

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

      var tool = self.editor.currentTool();
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

    save: function(){
      var self = this;
      localStorage.setItem('pixel_editor.saved', 'true')
      $.v.each(self.cells, function(row) {
        $.v.each(row, function(cell) {
          var cellJSON = cell.color;
          localStorage.setItem('cells.'+cell.coords(), JSON.stringify(cellJSON));
        });
      })
    },

    _initCells: function() {
      var self = this;
      var needsReload = (localStorage.getItem('pixel_editor.saved') == 'true');
      for (var i=0; i<self.heightInCells; i++) {
        var row = self.cells[i] = [];
        for (var j=0; j<self.widthInCells; j++) {
          row[j] = new Cell(self, i, j);
          if (needsReload) {
            if (localStorage['cells.'+j+','+i] != 'undefined') {
              var color = JSON.parse(localStorage['cells.'+j+','+i]);
            } else {
              var color = null;
            }
            if (color && color.red != 0 && color.green != 0 && color.blue != 0 && color.alpha != 0) {
              row[j].color = Color.fromRGB(color.red, color.green, color.blue).clone();
            }
          }
        }
      }
    },

    addEvents: function() {
      var self = this;
      $(document).bind({
        "keydown.pixelEditor": function(event) {
          var key = event.keyCode;
          if (key == Keyboard.Z_KEY && (event.ctrlKey || event.metaKey)) {
            if (event.shiftKey) {
              // Ctrl-Shift-Z or Command-Shift-Z: Redo last action
              if (self.cellHistory.canRedo()) self.cellHistory.redo();
            } else {
              // Ctrl-Z or Command-Z: Undo last action
              if (self.cellHistory.canUndo()) self.cellHistory.undo();
            }
          } else if (key == Keyboard.SHIFT_KEY) {
            self.editor.selectColorType('background');
          }
          self.editor.currentTool().trigger('keydown', event);
        },
        "keyup.pixelEditor": function() {
          self.editor.selectColorType('foreground');
        }
      })
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
          self.cellHistory.open();
          self.editor.currentTool().trigger('mousedown', event);
          event.preventDefault();
        },
        "mouseup": function(event) {
          self.editor.currentTool().trigger('mouseup', event);
          self.cellHistory.close();
          event.preventDefault();
        },
        "mousemove": function(event) {
          var mouse = self.workingCanvas.$element.mouseTracker('pos');
          self._setFocusedCell(mouse);
          self._setFocusedCells(mouse);
        },
        "mousedragstart": function(event) {
          self.startDragAtCell = self.focusedCell.clone();
          self.editor.currentTool().trigger('mousedragstart', event);
        },
        "mousedragstop": function(event) {
          self.startDragAtCell = null;
          self.editor.currentTool().trigger('mousedragstop', event);
        },
        "mousedrag": function(event) {
          self.editor.currentTool().trigger('mousedrag', event);
        },
        "mouseglide": function(event) {
          self.editor.currentTool().trigger('mouseglide', event);
        }//,
        //debug: true
      })
      $(window).bind({
        "blur.pixelEditor": function() {
          self.stop();
        },
        "focus.pixelEditor": function() {
          self.start();
        }
      })
    },

    removeEvents: function() {
      var self = this;
      $(document).unbind([
        'keydown.pixelEditor',
        'keyup.pixelEditor'
      ].join(" "));
      self.workingCanvas.$element.mouseTracker('destroy');
      $(window).unbind('blur.pixelEditor', 'focus.pixelEditor');
    },

    drawCell: function(cell, opts) {
      var self = this;
      var opts = opts || {};
      var color = opts.color || cell.color;
      var loc   = opts.loc   || cell.loc;
      if (!color) return;
      if (typeof color != "string") color = color.toRGBAString();
      var ctx = self.workingCanvas.ctx;
      ctx.fillStyle = color;
      ctx.fillRect(loc.x+1, loc.y+1, self.cellSize-1, self.cellSize-1);
    },

    _createGridBgCanvas: function() {
      var self = this;
      self.gridBgCanvas = Canvas.create(self.cellSize, self.cellSize, function(c) {
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
      self.workingCanvas = Canvas.create(self.width, self.height);
      self.workingCanvas.$element
        .attr("id", "working_canvas")
        .css("background-image", 'url('+self.gridBgCanvas.element.toDataURL("image/png")+')');
    },

    _createPreviewCanvases: function() {
      var self = this;
      self.previewCanvas = Canvas.create(self.widthInCells, self.heightInCells);
      self.previewCanvas.element.id = "preview_canvas";
      self.tiledPreviewCanvas = Canvas.create(self.widthInCells * 9, self.heightInCells * 9);
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

      var bs = (self.editor.currentBrushSize-1) * self.cellSize;
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
      if (self.focusedCells && !(isDragging || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) && self.editor.currentToolName == "pencil") {
        var currentColor = self.editor.currentColor[self.editor.currentColor.type];
        ctx.save();
          // If a cell is already filled in, fill it in with white before
          // filling it with the current color, since we want to let the user
          // know which color each cell would get replaced with
          $.v.each(self.focusedCells, function(cell) {
            self.drawCell(cell, {color: '#fff'});
            self.drawCell(cell, {color: currentColor.withAlpha(0.5)});
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
          $.v.each(row, function(cell, j) {
            if (cell.color) {
              self.drawCell(cell);
              pc.imageData.setPixel(cell.loc.j, cell.loc.i, cell.color.red, cell.color.green, cell.color.blue, 255);
            }
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
  }

  var SpriteEditor = {
    $container: null,
    $leftPane: null,
    $centerPane: null,
    $rightPane: null,
    colorSampleDivs: {
      foreground: null,
      background: null,
    },
    currentColor: {
      type: "foreground",
      foreground: Color.fromRGB(172, 85, 255),
      background: Color.fromRGB(255, 38, 192)
    },
    currentToolName: "select",
    currentBrushSize: 1,

    init: function() {
      var self = this;

      Keyboard.init();

      self.canvases = DrawingCanvases.init(self);
      self.tools = Tools.init(self, self.canvases);

      self.$container = $('#main');
      self._createMask();
      self._createWrapperDivs();
      self._createImportExportDiv();
      self._addWorkingCanvas();
      self._createToolBox();
      self._createBrushSizesBox();
      self._createColorPickerBox();
      self._createPreviewBox();

      self.addEvents();

      self.canvases.draw();

      return self;
    },

    addEvents: function() {
      var self = this;
      self.canvases.addEvents();
      $(document).bind({
        "keydown.colorBox": function(event) {
          var key = event.keyCode;
          if (key == Keyboard.X_KEY) {
            self._switchForegroundAndBackgroundColor();
          }
        }
      })
    },

    removeEvents: function() {
      var self = this;
      self.canvases.removeEvents();
      $(document).unbind("keydown.colorBox");
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

    _createImportExportDiv: function() {
      var self = this;
      var $importExportDiv = $('<div id="import_export" />');

      var $importDiv = $('<div id="import" />');
      var $importErrorSpan = $('<span id="import_error" style="display: none" />');
      var $importFileInput = $('<input type="file" style="position: absolute; top: -10000px; left: -10000px" />');
      var $importFileButton = $('<button>Import PNG</button>');
      $importFileButton.bind('click', function() {
        // Make the file chooser pop up
        $importFileInput.trigger('click');
      })
      $importFileInput.bind('change', function(event)
      {
        // We'd like to handle the uploaded file asynchronously. Conventionally
        // we'd use Ajax and an iframe to do this, but this is always been sort
        // of a hack in my opinion. Fortunately, this is 2011 and we now have
        // support for the W3C File API in at least two of the major browsers
        // (Firefox 3.6 and Chrome 6 -- not sure about the others).
        //
        // As you can see the following solution is unbelievably clean. The
        // first thing is that file inputs now have a #files method which is an
        // array of File objects corresponding to the files that the user
        // uploaded (it's an array in case the file input had a "multiple"
        // property). Each File object has properties like `type`, `size`, etc.
        // We use these to make sure the user is uploading small PNGs.
        //
        // The second thing is the FileReader class which can be used to read
        // data from File objects. One of its methods is #readAsDataURL, which
        // returns a data: URI that corresponds to the image data. How does that
        // help? Well, remember that the `src` attribute of an <img> accepts a
        // URL (it doesn't matter what format). So we simply make a new <img>
        // tag and feed it the data: URI.
        //
        // So that's great, but we need to get that image and map it onto the
        // pixel editor, so how do we do that? Well, remember that Canvas
        // lets us draw an image element using the #drawImage method. So
        // first we make a new Canvas (with the same width and height as the
        // image) and call this method. That gets us an actual size version of
        // the image in canvas form, but we need to update the enlarged version
        // (the canvas that the user will actually interact with, with the
        // pixels). So the final step in the importing process is to read the
        // pixel data from this temporary canvas (using #createImageData and
        // #getPixelData) and fill in the cells in the enlarged canvas manually.
        //
        // If you want more info about the HTML File API, see:
        //
        // * <http://demos.hacks.mozilla.org/openweb/uploadingFiles/>
        // * <http://www.html5rocks.com/tutorials/file/dndfiles/>
        // * <http://dev.w3.org/2006/webapi/FileAPI/>
        //
        var input = $importFileInput[0];
        var file = input.files[0];
        var error = "";
        if (!file) {
          error = "Please select a file."
        } else if (!file.type || file.type != "image/png") {
          // file.type will be empty if the type couldn't be detected
          error = "Sorry, you can only import PNGs."
        } else if (file.size > 1000) {
          error = "Sorry, the image you're trying to import is too big."
        }
        if (error) {
          $importErrorSpan.html(error).show();
        } else {
          $importErrorSpan.hide();
          var reader = new FileReader();
          reader.onload = function(event) {
            var img = document.createElement("img");
            img.src = event.target.result;
            console.log(img.src);
            // We *could* update the preview canvas here, but it already gets
            // updated automatically when draw() is called
            var c = Canvas.create(img.width, img.height);
            c.ctx.drawImage(img, 0, 0);
            var imageData = c.ctx.getImageData(0, 0, img.width, img.height);
            for (var x=0; x<img.width; x++) {
              for (var y=0; y<img.height; y++) {
                var color = imageData.getPixel(x, y);
                // Transparent black means the pixel wasn't set
                if (color.red != 0 && color.green != 0 && color.blue != 0 && color.alpha != 0) {
                  self.cells[y][x].color = Color.fromRGB(color.red, color.green, color.blue);
                }
              }
            }
            self.draw();
          }
          reader.readAsDataURL(file);
        }
      })
      $importDiv.append($importErrorSpan);
      $importDiv.append($importFileInput);
      $importDiv.append($importFileButton);
      $importExportDiv.append($importDiv);

      // XXX: Getting an error in the Chrome console when the form is submitted:
      //
      //   POST http://localhost:5005/ undefined (undefined)
      //
      // I'm not sure what this means??
      //
      var $exportForm = $('<form id="export" action="/" method="POST"><input name="data" type="hidden" /><button type="submit">Export PNG</button></form>');
      $exportForm.bind('submit', function() {
        var data = self.previewCanvas.element.toDataURL("image/png");
        data = data.replace(/^data:image\/png;base64,/, "");
        $exportForm.find('input').val(data);
      })
      $importExportDiv.append($exportForm);

      self.$centerPane.append($importExportDiv);
    },

    _addWorkingCanvas: function() {
      var self = this;
      self.$centerPane.append(self.canvases.workingCanvas.$element);
    },

    _createColorPickerBox: function() {
      var self = this;

      var $boxDiv = $("<div/>").attr("id", "color_box").addClass("box");
      self.$rightPane.append($boxDiv);

      var $header = $("<h3/>").html("Color");
      $boxDiv.append($header);

      self.colorSampleDivs = $.v.reduce(["foreground", "background"], function(hash, colorType) {
        var $div = $('<div class="color_sample" />');
        $div.bind({
          click: function() {
            self.currentColor.beingEdited = colorType;
            self.colorPickerBox.open(self.currentColor[colorType]);
          },
          update: function() {
            $div.css("background-color", self.currentColor[colorType].toRGBAString())
          }
        })
        $div.trigger('update');
        $boxDiv.append($div);
        hash[colorType] = $div;
        return hash;
      }, {});

      self.selectColorType(self.currentColor.type);

      self.colorPickerBox = SpriteEditor.ColorPickerBox.init({
        open: function() {
          self.removeEvents();
          self._showMask();
        },
        close: function() {
          self._hideMask();
          self.addEvents();
          self.currentColor.beingEdited = null;
        },
        change: function(color) {
          self.colorSampleDivs[self.currentColor.beingEdited].trigger('update');
        }
      });
      $(document.body).append(self.colorPickerBox.$container);
    },
    selectColorType: function(colorType) {
      var self = this;
      self.colorSampleDivs[self.currentColor.type].removeClass('selected');
      self.currentColor.type = colorType;
      self.colorSampleDivs[colorType].addClass('selected');
    },
    _switchForegroundAndBackgroundColor: function() {
      var self = this;
      var tmp = self.currentColor.foreground;
      self.currentColor.foreground = self.currentColor.background;
      self.currentColor.background = tmp;
      self.colorSampleDivs.foreground.trigger('update');
      self.colorSampleDivs.background.trigger('update');
    },

    _createPreviewBox: function() {
      var self = this;

      var $boxDiv = $("<div/>").attr("id", "preview_box").addClass("box");
      self.$rightPane.append($boxDiv);

      var $header = $("<h3/>").html("Preview");
      $boxDiv.append($header);

      $boxDiv.append(self.canvases.previewCanvas.$element);
      $boxDiv.append(self.canvases.tiledPreviewCanvas.$element);
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
      $.v.each(Tools.toolNames, function(name) {
        var $li = $("<li/>");

        var $img = $("<img/>");
        $img.addClass("tool")
            .attr("width", 24)
            .attr("height", 24)
            .attr("src", "images/"+name+".png");
        $imgs.push($img[0]);
        $li.append($img);
        $ul.append($li);

        $img.bind('click', function() {
          if (name != self.currentToolName && typeof self.currentTool().unselect != "undefined") {
            self.currentTool().unselect();
          }
          self.currentToolName = name;
          $imgs.removeClass("selected");
          $img.addClass("selected");
          if (typeof self.tools[name].select != "undefined") {
            self.tools[name].select();
          }
        })
        if (self.currentToolName == name) $img.trigger('click');
      })
    },
    currentTool: function() {
      return this.tools[this.currentToolName];
    },

    // TODO: when the paint bucket tool is selected, hide the brush sizes box
    // and set the brush size to 1
    _createBrushSizesBox: function() {
      var self = this;

      var $boxDiv = $("<div/>").attr("id", "sizes_box").addClass("box");
      self.$leftPane.append($boxDiv);

      var $header = $("<h3/>").html("Sizes");
      $boxDiv.append($header);

      var $grids = $([]);
      $.v.each([1, 2, 3, 4], function(brushSize) {
        var grid = Grid.create(self, self.canvases.cellSize*brushSize, self.canvases.cellSize*brushSize);
        $grids.push(grid.element);
        $boxDiv.append(grid.$element);
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
  };
  window.SpriteEditor = SpriteEditor;

})(window, window.document, window.ender);
