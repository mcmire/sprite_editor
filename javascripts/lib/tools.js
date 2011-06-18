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
          currentColor = this.app.currentColor[this.app.currentColor.type];
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
          currentColor = this.app.currentColor[this.app.currentColor.type];
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
    Tools.bucket = $.tap($.extend(true, {}, Tools.base), function(t) {
      t.addAction("fillFocusedCells", {
        "do": function() {
          var changedCells, currentColor, event, focusedColor;
          event = {
            canvases: {}
          };
          currentColor = t.app.currentColor[t.app.currentColor.type];
          focusedColor = t.canvases.focusedCells[0].color.clone();
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
          changedCells = {
            src: [],
            tgt: []
          };
          _ref = t.selectedCells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            srcBefore = _ref[_i];
            srcAfter = srcBefore.asClear();
            tgtLoc = srcBefore.loc.plus(t.dragOffset);
            tgtBefore = t.canvases.cells[tgtLoc.i][tgtLoc.j];
            tgtAfter = tgtBefore.withColor(srcBefore.color);
            t.canvases.cells[tgtLoc.i][tgtLoc.j] = tgtAfter;
            changedCells.src.push({
              before: srcBefore,
              after: srcAfter
            });
            changedCells.tgt.push({
              before: tgtBefore,
              after: tgtAfter
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
          var cell, _i, _j, _len, _len2, _ref, _ref2;
          _ref = event.canvases.changedCells.tgt;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
          }
          _ref2 = event.canvases.changedCells.src;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            cell = _ref2[_j];
            t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before;
          }
          t.selectionStart = event.me.selectionStart.before;
          t.selectionEnd = event.me.selectionEnd.before;
          return t.calculateSelectedCells();
        },
        redo: function(event) {
          var cell, _i, _j, _len, _len2, _ref, _ref2;
          _ref = event.canvases.changedCells.src;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after;
          }
          _ref2 = event.canvases.changedCells.tgt;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            cell = _ref2[_j];
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
        selectionStartBeforeDrag: null,
        selectionEndBeforeDrag: null,
        selectedCells: [],
        makingSelection: false,
        animOffset: 0,
        animateSelectionBox: false,
        reset: function() {
          this.selectionStart = null;
          this.selectionEnd = null;
          this.selectionStartBeforeDrag = null;
          this.selectionEndBeforeDrag = null;
          this.selectedCells = [];
          return this.makingSelection = false;
        },
        calculateSelectedCells: function() {
          var i, j, selectedCells;
          selectedCells = [];
          i = this.selectionStart.i;
          while (i <= this.selectionEnd.i) {
            j = this.selectionStart.j;
            while (j <= this.selectionEnd.j) {
              selectedCells.push(this.canvases.cells[i][j].clone());
              j++;
            }
            i++;
          }
          return this.selectedCells = selectedCells;
        },
        select: function() {
          return this.canvases.workingCanvas.$element.addClass("crosshair");
        },
        unselect: function() {
          this.canvases.workingCanvas.$element.removeClass("crosshair");
          this.canvases.workingCanvas.$element.removeClass("move");
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
          var cell, _i, _len, _ref;
          if (this.selectionStart && this._focusIsInsideOfSelection()) {
            _ref = this.selectedCells;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cell = _ref[_i];
              this.canvases.cells[cell.loc.i][cell.loc.j].clear();
            }
            this.selectionStartBeforeDrag = this.selectionStart.clone();
            this.selectionEndBeforeDrag = this.selectionEnd.clone();
          } else {
            this._exitSelection();
            this.makingSelection = true;
            this.selectionStart = this.canvases.focusedCell.loc.clone();
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
            this.selectionStartBeforeDrag = null;
            this.selectionEndBeforeDrag = null;
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
          if (this.selectionStart && this.selectionEnd) {
            this._drawSelectionBox({
              start: this.selectionStart,
              end: this.selectionEnd,
              offset: this.dragOffset,
              animate: this.animateSelectionBox
            });
          }
          if (this.selectionStartBeforeDrag && this.selectionEndBeforeDrag) {
            return this._drawSelectionBox({
              start: this.selectionStartBeforeDrag,
              end: this.selectionEndBeforeDrag,
              animate: false,
              shadow: true
            });
          }
        },
        _drawSelectionBox: function(args) {
          var alpha, bounds, cell, ctx, loc, x, x1, x2, y, y1, y2, _i, _j, _len, _len2, _ref, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _step, _step2, _step3, _step4;
          alpha = (args.shadow ? 0.3 : 1);
          ctx = this.canvases.workingCanvas.ctx;
          ctx.save();
          if (args.offset) {
            _ref = this.selectedCells;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cell = _ref[_i];
              loc = SpriteEditor.CellLocation.add(cell.loc, args.offset);
              this.canvases.drawCell(cell, {
                loc: loc
              });
            }
          } else {
            _ref2 = this.selectedCells;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              cell = _ref2[_j];
              this.canvases.drawCell(cell, {
                color: cell.color["with"]({
                  alpha: alpha
                })
              });
            }
          }
          bounds = this._selectionBounds(args);
          ctx.strokeStyle = "rgba(0, 0, 0, " + alpha + ")";
          ctx.beginPath();
          for (x = _ref3 = bounds.x1 + this.animOffset, _ref4 = bounds.x2, _step = 4; _ref3 <= _ref4 ? x <= _ref4 : x >= _ref4; x += _step) {
            y1 = bounds.y1;
            ctx.moveTo(x, y1 + 0.5);
            ctx.lineTo(x + 2, y1 + 0.5);
          }
          for (y = _ref5 = bounds.y1 + this.animOffset, _ref6 = bounds.y2, _step2 = 4; _ref5 <= _ref6 ? y <= _ref6 : y >= _ref6; y += _step2) {
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
          if (args.animate) {
            this.animOffset++;
            return this.animOffset %= 4;
          }
        },
        _selectionBounds: function(args) {
          var bounds, se, ss, _ref;
          _ref = [args.start, args.end], ss = _ref[0], se = _ref[1];
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
          if (args.offset) {
            bounds.x1 += args.offset.x;
            bounds.x2 += args.offset.x;
            bounds.y1 += args.offset.y;
            bounds.y2 += args.offset.y;
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
