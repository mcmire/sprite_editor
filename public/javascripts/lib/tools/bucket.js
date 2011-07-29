(function() {
  var Keyboard, Toolset;
  Keyboard = SpriteEditor.Keyboard, Toolset = SpriteEditor.Toolset;
  Toolset.addTool("bucket", "G", function(t) {
    t.addAction("fillFocusedCells", {
      "do": function() {
        var changedCells, currentColor, event, focusedColor;
        event = {
          canvases: {}
        };
        currentColor = t.app.boxes.colors.currentColor();
        focusedColor = t.canvases.focusedCell.color.clone();
        changedCells = [];
        $.v.each(t.canvases.cells, function(row) {
          return $.v.each(row, function(cell, j) {
            var after, before;
            if (cell.color.eq(focusedColor)) {
              before = cell;
              after = cell.withColor(currentColor);
              row[j] = after;
              return changedCells.push({
                before: before,
                after: after
              });
            }
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
    t.addAction("clearFocusedCells", {
      "do": function() {
        var changedCells, event, focusedColor;
        event = {
          canvases: {}
        };
        focusedColor = t.canvases.focusedCells[0].color.clone();
        changedCells = [];
        $.v.each(t.canvases.cells, function(row) {
          return $.v.each(row, function(cell, j) {
            var after, before;
            if (cell.color.eq(focusedColor)) {
              before = cell;
              after = cell.asClear();
              row[j] = after;
              return changedCells.push({
                before: before,
                after: after
              });
            }
          });
        });
        event.canvases.changedCells = changedCells;
        return event;
        return {
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
        };
      }
    });
    return $.extend(t, {
      mousedown: function(event) {
        if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
          return this._setCellsLikeCurrentToUnfilled();
        } else {
          return this._setCellsLikeCurrentToFilled();
        }
      },
      draw: function() {},
      _setCellsLikeCurrentToFilled: function() {
        return this.recordEvent("fillFocusedCells");
      },
      _setCellsLikeCurrentToUnfilled: function() {
        return this.recordEvent("clearFocusedCells");
      }
    });
  });
}).call(this);
