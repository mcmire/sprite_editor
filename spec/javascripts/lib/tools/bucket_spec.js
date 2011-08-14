(function() {
  var Cell, Color, Keyboard, Tools, Toolset;
  Keyboard = SpriteEditor.Keyboard, Toolset = SpriteEditor.Toolset, Tools = SpriteEditor.Tools, Color = SpriteEditor.Color, Cell = SpriteEditor.Cell;
  describe('The bucket tool', function() {
    var app, canvases, tool;
    canvases = app = tool = null;
    beforeEach(function() {
      Keyboard.init();
      canvases = {};
      app = {
        canvases: canvases
      };
      Toolset.init(app, canvases);
      return tool = $.extend(true, Toolset.tools.bucket);
    });
    afterEach(function() {
      Keyboard.destroy();
      return Toolset.destroy();
    });
    describe('on mouse down', function() {
      it("clears like cells if a cell is right-clicked", function() {
        var event;
        event = {
          rightClick: true
        };
        spyOn(tool, 'recordEvent');
        tool.mousedown(event);
        return expect(tool.recordEvent).toHaveBeenCalledWith('clearFocusedCells');
      });
      it("clears like cells if a cell is Ctrl-clicked", function() {
        spyOn(Keyboard, 'isKeyPressed').andReturn(true);
        spyOn(tool, 'recordEvent');
        tool.mousedown({});
        return expect(tool.recordEvent).toHaveBeenCalledWith('clearFocusedCells');
      });
      return it("fills like cells if a cell is left-clicked", function() {
        spyOn(tool, 'recordEvent');
        tool.mousedown({});
        return expect(tool.recordEvent).toHaveBeenCalledWith('fillFocusedCells');
      });
    });
    describe('the fillFocusedCells event', function() {
      var action;
      action = null;
      beforeEach(function() {
        return action = tool.actions.fillFocusedCells;
      });
      describe('#do', function() {
        var cell1, cell2, cell3, color, color2, color3;
        color = color2 = color3 = cell1 = cell2 = cell3 = tool = null;
        beforeEach(function() {
          color = new Color({
            red: 255,
            blue: 255,
            green: 0
          });
          color2 = new Color({
            red: 0,
            blue: 127,
            green: 127
          });
          color3 = new Color({
            red: 127,
            blue: 127,
            green: 0
          });
          cell1 = new Cell(app, 1, 2);
          cell1.color = color;
          cell2 = new Cell(app, 2, 3);
          cell2.color = color;
          cell3 = new Cell(app, 3, 4);
          cell3.color = color2;
          tool.app = {
            boxes: {
              colors: {
                currentColor: function() {
                  return color3;
                }
              }
            }
          };
          return tool.canvases = {
            focusedCell: cell2,
            cells: [[cell1, cell2, cell3]]
          };
        });
        it("takes the color of the clicked cell and applies it to all cells with the same color", function() {
          var cells;
          action["do"]();
          cells = tool.canvases.cells;
          expect(cells[0][0].color).toEqualColor(color3);
          expect(cells[0][1].color).toEqualColor(color3);
          return expect(cells[0][2].color).toEqualColor(color2);
        });
        return it("returns an event with data to use in undoing and redoing the action", function() {
          var cells, changedCells, event;
          event = action["do"]();
          cells = tool.canvases.cells;
          changedCells = event.canvases.changedCells;
          expect(changedCells[0].before).toBe(cell1);
          expect(changedCells[0].after).toBe(cells[0][0]);
          expect(changedCells[1].before).toBe(cell2);
          expect(changedCells[1].after).toBe(cells[0][1]);
          expect(changedCells[2]).not.toBe();
          return expect(changedCells[2]).not.toBe();
        });
      });
      describe('#undo', function() {
        return it("loops through the changedCells of the last event and restores the 'before' data", function() {
          var cell1, cell2, cell3, cells, changedCells, event;
          cell1 = new Cell(app, 0, 0);
          cell2 = new Cell(app, 0, 1);
          cell3 = new Cell(app, 0, 2);
          changedCells = [
            {
              before: cell1
            }, {
              before: cell2
            }, {
              before: cell3
            }
          ];
          event = {
            canvases: {
              changedCells: changedCells
            }
          };
          cells = [[]];
          tool.canvases = {
            cells: cells
          };
          action.undo(event);
          expect(cells[0][0]).toBe(cell1);
          expect(cells[0][1]).toBe(cell2);
          return expect(cells[0][2]).toBe(cell3);
        });
      });
      return describe('#redo', function() {
        return it("loops through the changedCells of the last event and restores the 'after' data", function() {
          var cell1, cell2, cell3, cells, changedCells, event;
          cell1 = new Cell(app, 0, 0);
          cell2 = new Cell(app, 0, 1);
          cell3 = new Cell(app, 0, 2);
          changedCells = [
            {
              after: cell1
            }, {
              after: cell2
            }, {
              after: cell3
            }
          ];
          event = {
            canvases: {
              changedCells: changedCells
            }
          };
          cells = [[]];
          tool.canvases = {
            cells: cells
          };
          action.redo(event);
          expect(cells[0][0]).toBe(cell1);
          expect(cells[0][1]).toBe(cell2);
          return expect(cells[0][2]).toBe(cell3);
        });
      });
    });
    return describe('the clearFocusedCells event', function() {
      var action;
      action = null;
      beforeEach(function() {
        return action = tool.actions.clearFocusedCells;
      });
      describe('#do', function() {
        var cell1, cell2, cell3, color, color2, color3;
        color = color2 = color3 = cell1 = cell2 = cell3 = tool = null;
        beforeEach(function() {
          color = new Color({
            red: 255,
            blue: 255,
            green: 0
          });
          color2 = new Color({
            red: 0,
            blue: 127,
            green: 127
          });
          color3 = new Color({
            red: 127,
            blue: 127,
            green: 0
          });
          cell1 = new Cell(app, 1, 2);
          cell1.color = color;
          cell2 = new Cell(app, 2, 3);
          cell2.color = color;
          cell3 = new Cell(app, 3, 4);
          cell3.color = color2;
          tool.app = {
            boxes: {
              colors: {
                currentColor: function() {
                  return color3;
                }
              }
            }
          };
          return tool.canvases = {
            focusedCell: cell2,
            cells: [[cell1, cell2, cell3]]
          };
        });
        it("removes the color from all cells with the same color state as the clicked cell", function() {
          var cells;
          action["do"]();
          cells = tool.canvases.cells;
          expect(cells[0][0].color.isClear()).toBe(true);
          expect(cells[0][1].color.isClear()).toBe(true);
          return expect(cells[0][2].color).toEqualColor(color2);
        });
        return it("returns an event with data to use in undoing and redoing the action", function() {
          var cells, changedCells, event;
          event = action["do"]();
          cells = tool.canvases.cells;
          changedCells = event.canvases.changedCells;
          expect(changedCells[0].before).toBe(cell1);
          expect(changedCells[0].after).toBe(cells[0][0]);
          expect(changedCells[1].before).toBe(cell2);
          expect(changedCells[1].after).toBe(cells[0][1]);
          expect(changedCells[2]).not.toBe();
          return expect(changedCells[2]).not.toBe();
        });
      });
      describe('#undo', function() {
        return it("loops through the changedCells of the last event and restores the 'before' data", function() {
          var cell1, cell2, cell3, cells, changedCells, event;
          cell1 = new Cell(app, 0, 0);
          cell2 = new Cell(app, 0, 1);
          cell3 = new Cell(app, 0, 2);
          changedCells = [
            {
              before: cell1
            }, {
              before: cell2
            }, {
              before: cell3
            }
          ];
          event = {
            canvases: {
              changedCells: changedCells
            }
          };
          cells = [[]];
          tool.canvases = {
            cells: cells
          };
          action.undo(event);
          expect(cells[0][0]).toBe(cell1);
          expect(cells[0][1]).toBe(cell2);
          return expect(cells[0][2]).toBe(cell3);
        });
      });
      return describe('#redo', function() {
        return it("loops through the changedCells of the last event and restores the 'after' data", function() {
          var cell1, cell2, cell3, cells, changedCells, event;
          cell1 = new Cell(app, 0, 0);
          cell2 = new Cell(app, 0, 1);
          cell3 = new Cell(app, 0, 2);
          changedCells = [
            {
              after: cell1
            }, {
              after: cell2
            }, {
              after: cell3
            }
          ];
          event = {
            canvases: {
              changedCells: changedCells
            }
          };
          cells = [[]];
          tool.canvases = {
            cells: cells
          };
          action.redo(event);
          expect(cells[0][0]).toBe(cell1);
          expect(cells[0][1]).toBe(cell2);
          return expect(cells[0][2]).toBe(cell3);
        });
      });
    });
  });
}).call(this);
