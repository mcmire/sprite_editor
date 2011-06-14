(function(window, document, $, undefined) {

var Tools = {
  toolNames: ["pencil", "bucket", "select", "dropper"],

  init: function(app, canvases) {
    var self = this;
    $.v.each(self.toolNames, function(name) {
      self[name].init(app, canvases);
    })
    return self;
  }
};

//------------------------------------------------------------------------------

Tools.base = $.extend({}, SpriteEditor.Eventable, {
  init: function(app, canvases) {
    var self = this;
    self.app = app;
    self.canvases = canvases;
  },

  trigger: function(/*name, args...*/) {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    if (typeof self[name] != "undefined") {
      return self[name].apply(self, args);
    }
  }
})

//------------------------------------------------------------------------------

Tools.dropper = (function() {

  var t = $.extend(true, {}, Tools.base);

  $.extend({
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
      var app = self.app;
      var color = self.canvases.focusedCell.color;
      app.currentColor[app.currentColor.type] = color.clone();
      app.colorSampleDivs[app.currentColor.type].trigger("update");
    }
  })

  return t;

})(); // end dropper tool

//------------------------------------------------------------------------------

Tools.pencil = (function() {

  var t = $.extend(true, {}, Tools.base);

  $.extend(t, {
    actionableCells: {}
  })

  t.addAction('updateCells', {
    "do": function() {
      var event = {
        canvases: {}
      }

      var changedCells = [];
      $.v.each(t.actionableCells, function(coords, after) {
        var before = t.canvases.cells[after.loc.i][after.loc.j];
        t.canvases.cells[after.loc.i][after.loc.j] = after;
        changedCells.push({before: before, after: after});
      })
      event.canvases.changedCells = changedCells;

      return event;
    },

    "undo": function(event) {
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
      })
    },

    "redo": function(event) {
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after;
      })
    }
  })

  $.extend(t, {
    mousedown: function(event) {
      var self = this;
      self.actionableCells = {};
      self.mousedrag(event);
    },

    mousedrag: function(event) {
      var self = this;
      // FIXME: If you drag too fast it will skip some cells!
      // Use the current mouse position and the last mouse position and
      //  fill in or erase cells in between.
      var erase = (event.rightClick || SpriteEditor.Keyboard.pressedKeys[SpriteEditor.Keyboard.CTRL_KEY]);
      var currentColor = t.app.currentColor[t.app.currentColor.type];
      $.v.each(t.canvases.focusedCells, function(cell) {
        if (cell.coords() in self.actionableCells) return;
        // Copy the cell so that if its color changes in the future, it won't
        // cause all cells with that color to also change
        var cell = erase ? cell.asClear() : cell.withColor(currentColor);
        self.actionableCells[cell.coords()] = cell;
      })
    },

    mouseup: function(event) {
      var self = this;
      self.recordEvent('updateCells');
      self.actionableCells = {};
    },

    cellToDraw: function(cell) {
      var self = this;
      if (cell.coords() in self.actionableCells) {
        return self.actionableCells[cell.coords()];
      } else {
        return cell;
      }
    }
  })

  return t;

})() // end pencil tool

//------------------------------------------------------------------------------

Tools.bucket = (function() {

  var t = $.extend(true, {}, Tools.base);

  t.addAction('fillFocusedCells', {
    "do": function() {
      var event = {
        canvases: {}
      }

      var currentColor = t.app.currentColor[t.app.currentColor.type],
          focusedColor = t.canvases.focusedCells[0].color.clone();

      // Look for all cells with the color of the current cell (or look for all
      // empty cells, if the current cell is empty) and mark them as filled
      // with the current color
      var changedCells = [];
      $.v.each(t.canvases.cells, function(row, i) {
        $.v.each(row, function(cell, j) {
          if (cell.color.eq(focusedColor)) {
            var before = cell;
            var after = cell.withColor(currentColor);
            row[j] = after;
            changedCells.push({before: before, after: after});
          }
        })
      })
      event.canvases.changedCells = changedCells;

      return event;
    },

    "undo": function(event) {
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
      })
    },

    "redo": function(event) {
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after;
      })
    }
  })

  t.addAction('clearFocusedCells', {
    "do": function() {
      var event = {
        canvases: {}
      }

      // Copy this as the color of the current cell will change during this loop
      var focusedColor = t.canvases.focusedCells[0].color.clone();
      // Look for all cells with the color of the current cell
      // and mark them as unfilled
      var changedCells = [];
      $.v.each(t.canvases.cells, function(row, i) {
        $.v.each(row, function(cell, j) {
          if (cell.color.eq(focusedColor)) {
            var before = cell;
            var after = cell.asClear();
            row[j] = after;
            changedCells.push({before: before, after: after});
          }
        })
      })
      event.canvases.changedCells = changedCells;

      return event;
    },

    "undo": function(event) {
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
      })
    },

    "redo": function(event) {
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after;
      })
    }
  })

  $.extend(t, {
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
      self.recordEvent('fillFocusedCells');
    },

    _setCellsLikeCurrentToUnfilled: function() {
      var self = this;
      self.recordEvent('clearFocusedCells');
    }
  })

  return t;

})() // end bucket tool

//------------------------------------------------------------------------------

Tools.select = (function() {

  var t = $.extend(true, {}, Tools.base);

  $.extend(t, {
    selectionStart: null,
    selectionEnd: null,
    selectedCells: [],
    makingSelection: false,
    animOffset: 0,
    animateSelectionBox: false
  });

  t.addAction('cutSelection', {
    "do": function(event) {
      var event = {
        me: {
          selectionStart: {},
          selectionEnd: {}
        },
        canvases: {}
      };

      // Put the selected cells on the clipboard
      t.canvases.clipboard = $.v.map(t.selectedCells, function(cell) { return cell.clone() });
      // Clear the cells
      var changedCells = [];
      $.v.each(t.selectedCells, function(cell) {
        var before = t.canvases.cells[cell.loc.i][cell.loc.j];
        var after = before.asClear();
        t.canvases.cells[cell.loc.i][cell.loc.j] = after;
        changedCells.push({before: before, after: after});
      })
      event.canvases.changedCells = changedCells;

      // Hide the selection box
      event.me.selectionStart.before = t.selectionStart;
      event.me.selectionEnd.before   = t.selectionEnd;
      t.reset();

      return event;
    },

    "undo": function(event) {
      // Restore the cleared cells
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
      })
      // Restore the selection box
      t.selectionStart = event.before.me.selectionStart;
      t.selectionEnd = event.before.me.selectionEnd;
      t.calculateSelectedCells();
    },

    "redo": function(after) {
      // Re-clear the cleared cells
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after;
      })
      // Re-hide the selection box
      t.reset();
    }
  });

  t.addAction('moveSelection', {
    "do": function() {
      var event = {
        me: {
          selectionStart: {},
          selectionEnd: {}
        },
        canvases: {}
      };

      // Move the cells that the currently selected cells point to
      var changedCells = [];
      $.v.each(t.selectedCells, function(srcBefore) {
        // Use the dragOffset to find the target cell, and replace it with a
        // copy of the source cell
        var tgtLoc = srcBefore.loc.plus(t.dragOffset);
        var tgtBefore = t.canvases.cells[tgtLoc.i][tgtLoc.j];
        var tgtAfter = tgtBefore.withColor(srcBefore.color);
        t.canvases.cells[tgtLoc.i][tgtLoc.j] = tgtAfter;
        changedCells.push({before: tgtBefore, after: tgtAfter});

        // Clear the source cell
        var srcAfter = srcBefore.asClear();
        t.canvases.cells[srcBefore.loc.i][srcBefore.loc.j] = srcAfter;
        changedCells.push({before: srcBefore, after: srcAfter});
      })
      event.canvases.changedCells = changedCells;

      // Move the selection box
      // We don't offset the selectedCells themselves since we can recalculate them
      event.me.selectionStart.before = t.selectionStart;
      event.me.selectionStart.after = t.selectionStart = t.selectionStart.plus(t.dragOffset);
      event.me.selectionEnd.before = t.selectionEnd;
      event.me.selectionEnd.after = t.selectionEnd = t.selectionEnd.plus(t.dragOffset);
      t.calculateSelectedCells();

      // Does this belong here?
      t.dragOffset = null;

      return event;
    },

    "undo": function(event) {
      // Move the cells themselves back
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
      })
      // Move the selection box back
      t.selectionStart = event.me.selectionStart.before;
      t.selectionEnd   = event.me.selectionEnd.before;
      t.calculateSelectedCells();

    },

    "redo": function(event) {
      // Move the cells themselves back
      $.v.each(event.canvases.changedCells, function(cell) {
        t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after;
      })
      // Move the selection box back
      t.selectionStart = event.me.selectionStart.after;
      t.selectionEnd   = event.me.selectionEnd.after;
      t.calculateSelectedCells();
    }
  })

  t.addAction('resetSelection', {
    "do": function(event) {
      var event = {
        me: {
          selectionStart: {},
          selectionEnd: {}
        }
      };

      // Hide the selection box
      event.me.selectionStart.before = t.selectionStart;
      event.me.selectionEnd.before   = t.selectionEnd;
      t.reset();

      return event;
    },

    "undo": function(event) {
      // Restore the selection box
      t.selectionStart = event.me.selectionStart.before;
      t.selectionEnd   = event.me.selectionEnd.before;
    },

    "redo": function(event) {
      // Re-hide the selection box
      t.reset();
    }
  })

  $.extend(t, {
    reset: function() {
      var self = this;
      // Clear the selection box and reset other involved variables
      self.selectionStart = null;
      self.selectionEnd = null;
      self.selectedCells = [];
      self.makingSelection = false;
    },

    calculateSelectedCells: function() {
      var self = this;
      var selectedCells = [];
      for (var i=self.selectionStart.i; i<=self.selectionEnd.i; i++) {
        for (var j=self.selectionStart.j; j<=self.selectionEnd.j; j++) {
          selectedCells.push(self.canvases.cells[i][j].clone());
        }
      }
      self.selectedCells = selectedCells;
    },

    select: function() {
      var self = this;
      self.canvases.workingCanvas.$element.addClass("crosshair");
    },

    unselect: function() {
      var self = this;
      self.canvases.workingCanvas.$element.removeClass("crosshair");
      self._exitSelection();
    },

    keydown: function(event) {
      var self = this;
      var key = event.keyCode;
      if (key == SpriteEditor.Keyboard.X_KEY && (event.metaKey || event.ctrlKey)) {
        // Ctrl-X: Cut selection
        self._cutSelection();
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
      //---
      // FIXME: This actually removes the corresponding pixels from the preview
      // canvas. Our cells array should have a concept of layers -- and so then
      // to render the preview canvas we just flatten the layers
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
      self.animateSelectionBox = false;
    },

    mousedrag: function(event) {
      var self = this;
      if (self.makingSelection) {
        // Expand or contract the selection box based on the location of the cell that has focus
        self.selectionEnd = self.canvases.focusedCell.loc.clone();
      } else {
        // Record the amount the selection box has been dragged.
        // While the box is being dragged, the selected cells have virtual
        // positions, and so the drag offset affects where the cells are drawn
        // until the drag stops, at which point the virtual positions become
        // real positions.
        self.dragOffset = SpriteEditor.CellLocation.subtract(
          self.canvases.focusedCell.loc,
          self.canvases.startDragAtCell.loc
        );
      }
    },

    mousedragstop: function(event) {
      var self = this;
      if (self.makingSelection) {
        self.calculateSelectedCells();
      } else {
        self._moveSelection();
        self.dragOffset = null;
      }
      self.makingSelection = false;
      self.animateSelectionBox = true;
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

        var bounds = self._selectionBounds(self.dragOffset);

        // Draw a rectangle that represents the selection area, with an animated
        // "marching ants" dotted border
        ctx.strokeStyle = "#000";
        ctx.beginPath();
          // top
          for (var x = bounds.x1+self.animOffset; x < bounds.x2; x += 4) {
            var y1 = bounds.y1;
            ctx.moveTo(x, y1+0.5);
            ctx.lineTo(x+2, y1+0.5);
          }
          // right
          for (var y = bounds.y1+self.animOffset; y < bounds.y2; y += 4) {
            var x2 = bounds.x2;
            ctx.moveTo(x2+0.5, y);
            ctx.lineTo(x2+0.5, y+2);
          }
          // bottom
          for (var x = bounds.x2-self.animOffset; x > bounds.x1+2; x -= 4) {
            var y2 = bounds.y2;
            ctx.moveTo(x, y2+0.5);
            ctx.lineTo(x-2, y2+0.5);
          }
          // left
          for (var y = bounds.y2-self.animOffset; y > bounds.y1+2; y -= 4) {
            var x1 = bounds.x1;
            ctx.moveTo(x1+0.5, y);
            ctx.lineTo(x1+0.5, y-2);
          }
        ctx.stroke();
      ctx.restore();

      if (self.animateSelectionBox) {
        // Animate the "marching ants"
        self.animOffset++;
        self.animOffset %= 4;
      }
    },

    _selectionBounds: function(offset) {
      var self = this;
      var ss = self.selectionStart,
          se = self.selectionEnd;
      var bounds = {};
      // Ensure that x2 > x1 and y2 > y1, as the following could happen if the
      // selection box is created by the following motions:
      // - dragging from top-right to bottom-left: x1 > x2
      // - dragging from bottom-left to top-right: y1 > y2
      // - dragging from bottom-right to top-left: both x1 > x2 and y1 > y2
      if (ss.i > se.i) {
        bounds.y1 = se.y;
        bounds.y2 = ss.y;
      } else {
        bounds.y1 = ss.y;
        bounds.y2 = se.y;
      }
      if (ss.j > se.j) {
        bounds.x1 = se.x;
        bounds.x2 = ss.x;
      } else {
        bounds.x1 = ss.x;
        bounds.x2 = se.x;
      }
      if (offset) {
        bounds.x1 += offset.x;
        bounds.x2 += offset.x;
        bounds.y1 += offset.y;
        bounds.y2 += offset.y;
      }
      // Snap the bottom-right corner of the selection box to the bottom-right
      // corner of the bottom-right cell (got it?)
      bounds.x2 += self.canvases.cellSize;
      bounds.y2 += self.canvases.cellSize;
      return bounds;
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
    },

    _cutSelection: function() {
      var self = this;
      self.recordEvent('cutSelection');
    },

    _moveSelection: function(dragOffset) {
      var self = this;
      self.recordEvent('moveSelection');
    },

    _exitSelection: function() {
      var self = this;
      if (self.selectionStart) {
        self.recordEvent('resetSelection');
      }
    },
  })

  return t;

})(); // end select tool

$.export('SpriteEditor.Tools', Tools);

})(window, window.document, window.ender);