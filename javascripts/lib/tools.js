(function(window, document, $, undefined) {

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
    var color = self.canvases.focusedCell.color;
    if (color) {
      editor.currentColor[editor.currentColor.type] = color.clone();
      editor.colorSampleDivs[editor.currentColor.type].trigger("update");
    }
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
    if (event.rightClick || SpriteEditor.Keyboard.pressedKeys[SpriteEditor.Keyboard.CTRL_KEY]) {
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
    if (event.rightClick || SpriteEditor.Keyboard.pressedKeys[SpriteEditor.Keyboard.CTRL_KEY]) {
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
  animOffset: 0,

  reset: function() {
    var self = this;
    self.selectionStart = null;
    self.selectionEnd = null;
    self.selectedCells = [];
    self.makingSelection = false;
  },

  select: function() {
    var self = this;
    self.canvases.workingCanvas.$element.addClass("crosshair");
  },

  unselect: function() {
    var self = this;
    self.canvases.workingCanvas.$element.removeClass("crosshair");
    // Ensure that if selection is active, it is merged into the canvas
    self._exitSelection();
  },

  keydown: function(event) {
    var self = this;
    var key = event.keyCode;
    if (key == SpriteEditor.Keyboard.X_KEY && (event.metaKey || event.ctrlKey)) {
      // Ctrl-X: Cut selection
      self.canvases.clipboard = $.v.map(self.selectedCells, function(cell) { return cell.clone() });
      self.canvases.cellHistory.save(function() {
        $.v.each(self.selectedCells, function(cell) {
          self.canvases.cellHistory.add(cell, function() {
            cell.clear();
          });
        })
      });
      self._exitSelection();
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
      self._exitSelection();
      self.makingSelection = true;
      var c = self.canvases.focusedCell;
      self.selectionStart = c.loc.clone();
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
      self.dragOffset = SpriteEditor.CellLocation.subtract(fc.loc, dc.loc);
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
    if (!isDragging && self.selectionStart && self._focusIsOutsideOfSelection()) {
      self._exitSelection();
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
          var loc = SpriteEditor.CellLocation.add(cell.loc, self.dragOffset);
          self.canvases.drawCell(cell, {loc: loc});
        })
      } else {
        $.v.each(self.selectedCells, function(cell) {
          self.canvases.drawCell(cell);
        });
      }

      var ss = self.dragOffset
        ? SpriteEditor.CellLocation.add(self.selectionStart, self.dragOffset)
        : self.selectionStart;
      var se = self.dragOffset
        ? SpriteEditor.CellLocation.add(self.selectionEnd, self.dragOffset)
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
        for (var x = ss.x+self.animOffset; x < se.x; x += 4) {
          var y1 = ss.y;
          ctx.moveTo(x, y1+0.5);
          ctx.lineTo(x+2, y1+0.5);
        }
        // right
        for (var y = ss.y+self.animOffset; y < se.y; y += 4) {
          var x2 = se.x;
          ctx.moveTo(x2+0.5, y);
          ctx.lineTo(x2+0.5, y+2);
        }
        // bottom
        for (var x = se.x-self.animOffset; x > ss.x+2; x -= 4) {
          var y2 = se.y;
          ctx.moveTo(x, y2+0.5);
          ctx.lineTo(x-2, y2+0.5);
        }
        // left
        for (var y = se.y-self.animOffset; y > ss.y+2; y -= 4) {
          var x1 = ss.x;
          ctx.moveTo(x1+0.5, y);
          ctx.lineTo(x1+0.5, y-2);
        }
      ctx.stroke();

    ctx.restore();
    // Animate the "marching ants"
    // FIXME: Only animate on dragstop, not while dragging
    self.animOffset++;
    self.animOffset %= 4;
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

  // Merges the selection layer into the canvas and then clears the selection
  _exitSelection: function() {
    var self = this;
    $.v.each(self.selectedCells, function(cell) {
      self.canvases.cells[cell.loc.i][cell.loc.j] = cell.clone();
    })
    self.reset();
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
$.export('SpriteEditor.Tools', Tools);

})(window, window.document, window.ender);