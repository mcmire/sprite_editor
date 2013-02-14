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
      reset: function() {
        return this.upcomingCells = {};
      },
      mousedown: function(event) {
        this.reset();
        return this.mousedrag(event);
      },
      mousedrag: function(event) {
        var cell, coords, currentColor, erase, _ref, _results;
        erase = event.rightClick || Keyboard.isKeyPressed(Keyboard.CTRL_KEY);
        currentColor = (erase ? null : this.app.boxes.colors.currentColor());
        _ref = this.canvases.focusedCells;
        _results = [];
        for (coords in _ref) {
          cell = _ref[coords];
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
        var currentColor, focusedCell, opts, upcomingCell, _ref;
        opts = {};
        upcomingCell = this.upcomingCells[cell.coords()];
        focusedCell = (_ref = this.canvases.focusedCells) != null ? _ref[cell.coords()] : void 0;
        if (upcomingCell) {
          opts.color = upcomingCell.color;
        } else if (focusedCell) {
          if (Keyboard.isKeyPressed(Keyboard.CTRL_KEY)) {
            opts.color = cell.color["with"]({
              alpha: 0.2
            });
          } else {
            currentColor = this.app.boxes.colors.currentColor();
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
