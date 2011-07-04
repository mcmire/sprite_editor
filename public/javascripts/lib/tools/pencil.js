(function() {
  var Keyboard, Toolset;
  Keyboard = SpriteEditor.Keyboard, Toolset = SpriteEditor.Toolset;
  Toolset.addTool("pencil", "E", function(t) {
    t.addAction("updateCells", {
      "do": function() {
        var changedCells, event;
        event = {
          canvases: {}
        };
        changedCells = [];
        $.v.each(t.upcomingCells, function(coords, after) {
          var before;
          before = t.canvases.cells[after.loc.i][after.loc.j];
          t.canvases.cells[after.loc.i][after.loc.j] = after;
          return changedCells.push({
            before: before,
            after: after
          });
        });
        event.canvases.changedCells = changedCells;
        return event;
      },
      undo: function(event) {
        var cell, _i, _len, _ref, _results;
        _ref = event.canvases.changedCells;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          _results.push(t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before);
        }
        return _results;
      },
      redo: function(event) {
        var cell, _i, _len, _ref, _results;
        _ref = event.canvases.changedCells;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          _results.push(t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after);
        }
        return _results;
      }
    });
    return $.extend(t, {
      upcomingCells: {},
      reset: function() {
        return this.upcomingCells = {};
      },
      mousedown: function(event) {
        this.reset();
        return this.mousedrag(event);
      },
      mousedrag: function(event) {
        var cell, currentColor, erase, self, _, _ref, _results;
        self = this;
        erase = event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY];
        currentColor = this.app.boxes.colors.currentColor();
        _ref = this.canvases.focusedCells;
        _results = [];
        for (_ in _ref) {
          cell = _ref[_];
          if (cell.coords() in this.upcomingCells) {
            continue;
          }
          cell = (erase ? cell.asClear() : cell.withColor(currentColor));
          _results.push(this.upcomingCells[cell.coords()] = cell);
        }
        return _results;
      },
      mouseup: function(event) {
        this.recordEvent("updateCells");
        return this.reset();
      },
      cellOptions: function(cell) {
        var currentColor, focusedCell, opts, upcomingCell;
        opts = {};
        currentColor = this.app.boxes.colors.currentColor();
        upcomingCell = this.upcomingCells[cell.coords()];
        focusedCell = this.canvases.focusedCells && this.canvases.focusedCells[cell.coords()];
        if (upcomingCell) {
          opts.color = upcomingCell.color;
        } else if (focusedCell) {
          if (Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
            opts.color = cell.color["with"]({
              alpha: 0.2
            });
          } else {
            opts.color = currentColor["with"]({
              alpha: 0.5
            });
          }
        }
        return opts;
      }
    });
  });
}).call(this);
