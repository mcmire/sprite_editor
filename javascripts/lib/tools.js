(function() {
  var __slice = Array.prototype.slice;
  $["export"]("SpriteEditor.Tools", function(SpriteEditor) {
    var Keyboard, Tools;
    Keyboard = SpriteEditor.Keyboard;
    Tools = {
      toolNames: ["pencil", "bucket", "select", "dropper"],
      init: function(app, canvases) {
        var name, _i, _len, _ref;
        _ref = this.toolNames;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          this[name].init(app, canvases);
        }
        return this;
      }
    };
    Tools.base = $.extend({}, SpriteEditor.Eventable, {
      init: function(app, canvases) {
        this.app = app;
        return this.canvases = canvases;
      },
      trigger: function() {
        var args, name, _ref;
        name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = this[name]) != null ? _ref.apply(this, args) : void 0;
      }
    });
    Tools.dropper = $.extend(true, {}, Tools.base, {
      select: function() {
        return this.canvases.workingCanvas.$element.addClass("dropper");
      },
      unselect: function() {
        return this.canvases.workingCanvas.$element.removeClass("dropper");
      },
      mousedown: function(event) {
        var app, color;
        app = this.app;
        color = this.canvases.focusedCell.color;
        app.currentColor[app.currentColor.type] = color.clone();
        return app.colorSampleDivs[app.currentColor.type].trigger("update");
      }
    });
    Tools.pencil = $.tap($.extend(true, {}, Tools.base), function(t) {
      t.addAction("updateCells", {
        "do": function() {
          var after, changedCells, coords, event, _fn, _ref;
          event = {
            canvases: {}
          };
          changedCells = [];
          _ref = t.actionableCells;
          _fn = function(after) {
            var before;
            before = t.canvases.cells[after.loc.i][after.loc.j];
            t.canvases.cells[after.loc.i][after.loc.j] = after;
            return changedCells.push({
              before: before,
              after: after
            });
          };
          for (coords in _ref) {
            after = _ref[coords];
            _fn(after);
          }
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
        actionableCells: {},
        mousedown: function(event) {
          this.actionableCells = {};
          return this.mousedrag(event);
        },
        mousedrag: function(event) {
          var cell, currentColor, erase, self, _i, _len, _ref, _results;
          self = this;
          erase = event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY];
          currentColor = t.app.currentColor[t.app.currentColor.type];
          _ref = t.canvases.focusedCells;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            if (cell.coords() in this.actionableCells) {
              continue;
            }
            cell = (erase ? cell.asClear() : cell.withColor(currentColor));
            _results.push(this.actionableCells[cell.coords()] = cell);
          }
          return _results;
        },
        mouseup: function(event) {
          this.recordEvent("updateCells");
          return this.actionableCells = {};
        },
        cellToDraw: function(cell) {
          if (cell.coords() in this.actionableCells) {
            return this.actionableCells[cell.coords()];
          } else {
            return cell;
          }
        }
      });
    });
    Tools.bucket = $.tap($.extend(true, {}, Tools.base), function(t) {
      t.addAction("fillFocusedCells", {
        "do": function() {
          var cell, changedCells, currentColor, event, focusedColor, row, _i, _j, _len, _len2, _ref;
          event = {
            canvases: {}
          };
          currentColor = t.app.currentColor[t.app.currentColor.type];
          focusedColor = t.canvases.focusedCells[0].color.clone();
          changedCells = [];
          _ref = t.canvases.cells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            row = _ref[_i];
            for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
              cell = row[_j];
              if (cell.color.eq(focusedColor)) {
                (function(before, after) {
                  before = cell;
                  after = cell.withColor(currentColor);
                  row[j] = after;
                  return changedCells.push({
                    before: before,
                    after: after
                  });
                })(before, after);
              }
            }
          }
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
          var cell, changedCells, event, focusedColor, row, _i, _j, _len, _len2, _ref;
          event = {
            canvases: {}
          };
          focusedColor = t.canvases.focusedCells[0].color.clone();
          changedCells = [];
          _ref = t.canvases.cells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            row = _ref[_i];
            for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
              cell = row[_j];
              if (cell.color.eq(focusedColor)) {
                (function(before, after) {
                  before = cell;
                  after = cell.asClear();
                  row[j] = after;
                  return changedCells.push({
                    before: before,
                    after: after
                  });
                })(before, after);
              }
            }
          }
          event.canvases.changedCells = changedCells;
          return event;
          return {
            undo: function(event) {
              var cell, _k, _len3, _ref2, _results;
              _ref2 = event.canvases.changedCells;
              _results = [];
              for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
                cell = _ref2[_k];
                _results.push(t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before);
              }
              return _results;
            },
            redo: function(event) {
              var cell, _k, _len3, _ref2, _results;
              _ref2 = event.canvases.changedCells;
              _results = [];
              for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
                cell = _ref2[_k];
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
    Tools.select = $.tap($.extend(true, {}, Tools.base), function(t) {
      t.addAction("cutSelection", {
        "do": function(event) {
          var after, before, cell, changedCells, _i, _len, _ref;
          event = {
            me: {
              selectionStart: {},
              selectionEnd: {}
            },
            canvases: {}
          };
          t.canvases.clipboard = $.v.map(t.selectedCells, function(cell) {
            return cell.clone();
          });
          changedCells = [];
          _ref = t.selectedCells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            before = t.canvases.cells[cell.loc.i][cell.loc.j];
            after = before.asClear();
            t.canvases.cells[cell.loc.i][cell.loc.j] = after;
            changedCells.push({
              before: before,
              after: after
            });
          }
          event.canvases.changedCells = changedCells;
          event.me.selectionStart.before = t.selectionStart;
          event.me.selectionEnd.before = t.selectionEnd;
          t.reset();
          return event;
        },
        undo: function(event) {
          var cell, _i, _len, _ref;
          _ref = event.canvases.changedCells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
          }
          t.selectionStart = event.before.me.selectionStart;
          t.selectionEnd = event.before.me.selectionEnd;
          return t.calculateSelectedCells();
        },
        redo: function(after) {
          var cell, _i, _len, _ref;
          _ref = event.canvases.changedCells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after;
          }
          return t.reset();
        }
      });
      t.addAction("moveSelection", {
        "do": function() {
          var changedCells, event, srcAfter, srcBefore, tgtAfter, tgtBefore, tgtLoc, _i, _len, _ref;
          event = {
            me: {
              selectionStart: {},
              selectionEnd: {}
            },
            canvases: {}
          };
          changedCells = [];
          _ref = t.selectedCells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            srcBefore = _ref[_i];
            tgtLoc = srcBefore.loc.plus(t.dragOffset);
            tgtBefore = t.canvases.cells[tgtLoc.i][tgtLoc.j];
            tgtAfter = tgtBefore.withColor(srcBefore.color);
            t.canvases.cells[tgtLoc.i][tgtLoc.j] = tgtAfter;
            changedCells.push({
              before: tgtBefore,
              after: tgtAfter
            });
            srcAfter = srcBefore.asClear();
            t.canvases.cells[srcBefore.loc.i][srcBefore.loc.j] = srcAfter;
            changedCells.push({
              before: srcBefore,
              after: srcAfter
            });
          }
          event.canvases.changedCells = changedCells;
          event.me.selectionStart.before = t.selectionStart;
          event.me.selectionStart.after = t.selectionStart = t.selectionStart.plus(t.dragOffset);
          event.me.selectionEnd.before = t.selectionEnd;
          event.me.selectionEnd.after = t.selectionEnd = t.selectionEnd.plus(t.dragOffset);
          t.calculateSelectedCells();
          t.dragOffset = null;
          return event;
        },
        undo: function(event) {
          var cell, _i, _len, _ref;
          _ref = event.canvases.changedCells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
          }
          t.selectionStart = event.me.selectionStart.before;
          t.selectionEnd = event.me.selectionEnd.before;
          return t.calculateSelectedCells();
        },
        redo: function(event) {
          var cell, _i, _len, _ref;
          _ref = event.canvases.changedCells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after;
          }
          t.selectionStart = event.me.selectionStart.after;
          t.selectionEnd = event.me.selectionEnd.after;
          return t.calculateSelectedCells();
        }
      });
      t.addAction("resetSelection", {
        "do": function(event) {
          event = {
            me: {
              selectionStart: {},
              selectionEnd: {}
            }
          };
          event.me.selectionStart.before = t.selectionStart;
          event.me.selectionEnd.before = t.selectionEnd;
          t.reset();
          return event;
        },
        undo: function(event) {
          t.selectionStart = event.me.selectionStart.before;
          return t.selectionEnd = event.me.selectionEnd.before;
        },
        redo: function(event) {
          return t.reset();
        }
      });
      return $.extend(t, {
        selectionStart: null,
        selectionEnd: null,
        selectedCells: [],
        makingSelection: false,
        animOffset: 0,
        animateSelectionBox: false,
        reset: function() {
          this.selectionStart = null;
          this.selectionEnd = null;
          this.selectedCells = [];
          return this.makingSelection = false;
        },
        calculateSelectedCells: function() {
          var i, j, selectedCells, _ref, _ref2, _ref3, _ref4;
          selectedCells = [];
          for (i = _ref = this.selectionStart.i, _ref2 = this.selectionEnd.i; _ref <= _ref2 ? i < _ref2 : i > _ref2; _ref <= _ref2 ? i++ : i--) {
            for (j = _ref3 = this.selectionStart.j, _ref4 = this.selectionEnd.j; _ref3 <= _ref4 ? j < _ref4 : j > _ref4; _ref3 <= _ref4 ? j++ : j--) {
              selectedCells.push(this.canvases.cells[i][j].clone());
            }
          }
          return this.selectedCells = selectedCells;
        },
        select: function() {
          return this.canvases.workingCanvas.$element.addClass("crosshair");
        },
        unselect: function() {
          this.canvases.workingCanvas.$element.removeClass("crosshair");
          return this._exitSelection();
        },
        keydown: function(event) {
          var key;
          key = event.keyCode;
          if (key === Keyboard.X_KEY && (event.metaKey || event.ctrlKey)) {
            return this._cutSelection();
          }
        },
        mouseglide: function(event) {
          if (this._focusIsInsideOfSelection()) {
            return this.canvases.workingCanvas.$element.addClass("move");
          } else {
            return this.canvases.workingCanvas.$element.removeClass("move");
          }
        },
        mousedragstart: function(event) {
          var c, cell, _i, _len, _ref;
          if (this.selectionStart && this._focusIsInsideOfSelection()) {
            _ref = this.selectedCells;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cell = _ref[_i];
              this.canvases.cells[cell.loc.i][cell.loc.j].clear();
            }
          } else {
            this._exitSelection();
            this.makingSelection = true;
            c = this.canvases.focusedCell;
            this.selectionStart = c.loc.clone();
          }
          return this.animateSelectionBox = false;
        },
        mousedrag: function(event) {
          if (this.makingSelection) {
            return this.selectionEnd = this.canvases.focusedCell.loc.clone();
          } else {
            return this.dragOffset = SpriteEditor.CellLocation.subtract(this.canvases.focusedCell.loc, this.canvases.startDragAtCell.loc);
          }
        },
        mousedragstop: function(event) {
          if (this.makingSelection) {
            this.calculateSelectedCells();
          } else {
            this._moveSelection();
            this.dragOffset = null;
          }
          this.makingSelection = false;
          return this.animateSelectionBox = true;
        },
        mouseup: function(event) {
          var isDragging;
          isDragging = this.canvases.workingCanvas.$element.mouseTracker("isDragging");
          if (!isDragging && this.selectionStart && this._focusIsOutsideOfSelection()) {
            return this._exitSelection();
          }
        },
        draw: function() {
          var bounds, cell, ctx, loc, x, x1, x2, y, y1, y2, _i, _j, _len, _len2, _ref, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _step, _step2, _step3, _step4;
          if (!this.selectionStart || !this.selectionEnd) {
            return;
          }
          ctx = this.canvases.workingCanvas.ctx;
          ctx.save();
          if (this.dragOffset) {
            _ref = this.selectedCells;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cell = _ref[_i];
              loc = SpriteEditor.CellLocation.add(cell.loc, this.dragOffset);
              this.canvases.drawCell(cell, {
                loc: loc
              });
            }
          } else {
            _ref2 = this.selectedCells;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              cell = _ref2[_j];
              this.canvases.drawCell(cell);
            }
          }
          bounds = this._selectionBounds(this.dragOffset);
          ctx.strokeStyle = "#000";
          ctx.beginPath();
          for (x = _ref3 = bounds.x1 + this.animOffset, _ref4 = bounds.x2, _step = 4; _ref3 <= _ref4 ? x <= _ref4 : x >= _ref4; x += _step) {
            y1 = bounds.y1;
            ctx.moveTo(x, y1 + 0.5);
            ctx.lineTo(x + 2, y1 + 0.5);
          }
          for (y = _ref5 = bounds.y1 + this.animOffset, _ref6 = bounds.x2, _step2 = 4; _ref5 <= _ref6 ? y <= _ref6 : y >= _ref6; y += _step2) {
            x2 = bounds.x2;
            ctx.moveTo(x2 + 0.5, y);
            ctx.lineTo(x2 + 0.5, y + 2);
          }
          for (x = _ref7 = bounds.x2 - this.animOffset, _ref8 = bounds.x1 + 2, _step3 = -4; _ref7 <= _ref8 ? x <= _ref8 : x >= _ref8; x += _step3) {
            y2 = bounds.y2;
            ctx.moveTo(x, y2 + 0.5);
            ctx.lineTo(x - 2, y2 + 0.5);
          }
          for (y = _ref9 = bounds.y2 - this.animOffset, _ref10 = bounds.y1 + 2, _step4 = -4; _ref9 <= _ref10 ? y <= _ref10 : y >= _ref10; y += _step4) {
            x1 = bounds.x1;
            ctx.moveTo(x1 + 0.5, y);
            ctx.lineTo(x1 + 0.5, y - 2);
          }
          ctx.stroke();
          ctx.restore();
          if (this.animateSelectionBox) {
            this.animOffset++;
            return this.animOffset %= 4;
          }
        },
        _selectionBounds: function(offset) {
          var bounds, se, ss, _ref;
          _ref = [this.selectionStart, this.selectionEnd], ss = _ref[0], se = _ref[1];
          bounds = {};
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
          bounds.x2 += this.canvases.cellSize;
          bounds.y2 += this.canvases.cellSize;
          return bounds;
        },
        _focusIsInsideOfSelection: function() {
          var c, sa, sb;
          c = this.canvases.focusedCell;
          sa = this.selectionStart;
          sb = this.selectionEnd;
          return sa && sb && c.loc.i >= sa.i && c.loc.i <= sb.i && c.loc.j >= sa.j && c.loc.j <= sb.j;
        },
        _focusIsOutsideOfSelection: function() {
          var c, sa, sb;
          c = this.canvases.focusedCell;
          sa = this.selectionStart;
          sb = this.selectionEnd;
          return c.loc.i < sa.i || c.loc.i > sb.i || c.loc.j < sa.j || c.loc.j > sb.j;
        },
        _cutSelection: function() {
          return this.recordEvent("cutSelection");
        },
        _moveSelection: function(dragOffset) {
          return this.recordEvent("moveSelection");
        },
        _exitSelection: function() {
          if (this.selectionStart) {
            return this.recordEvent("resetSelection");
          }
        }
      });
    });
    return Tools;
  });
}).call(this);
