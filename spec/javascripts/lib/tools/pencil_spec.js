(function() {
  var Cell, Color, Keyboard, Toolset;

  Keyboard = SpriteEditor.Keyboard, Toolset = SpriteEditor.Toolset, Cell = SpriteEditor.Cell, Color = SpriteEditor.Color;

  describe('The pencil tool', function() {
    var app, canvases, tool;
    canvases = app = tool = null;
    beforeEach(function() {
      Keyboard.init();
      canvases = {};
      app = {
        canvases: canvases
      };
      return tool = Toolset.tools.pencil.init(app, canvases);
    });
    afterEach(function() {
      Keyboard.destroy();
      Toolset.destroy();
      return tool.destroy();
    });
    describe('on mouse down', function() {
      beforeEach(function() {
        spyOn(tool, 'reset');
        return spyOn(tool, 'mousedrag');
      });
      it("resets the tool", function() {
        tool.mousedown({});
        return expect(tool.reset).toHaveBeenCalled();
      });
      return it("calls the mousedrag callback with the event", function() {
        tool.mousedown({
          foo: 'bar'
        });
        return expect(tool.mousedrag).toHaveBeenCalledWith({
          foo: 'bar'
        });
      });
    });
    describe('on mouse drag', function() {
      it("erases cells that have focus if a cell is right-clicked", function() {
        var event;
        event = {
          rightClick: true
        };
        canvases.focusedCells = {
          "0,1": new Cell(canvases, 0, 1),
          "0,2": new Cell(canvases, 0, 2),
          "0,3": new Cell(canvases, 0, 3)
        };
        tool.mousedrag(event);
        expect(tool.upcomingCells["0,1"].color.isClear()).toBe(true);
        expect(tool.upcomingCells["0,2"].color.isClear()).toBe(true);
        return expect(tool.upcomingCells["0,3"].color.isClear()).toBe(true);
      });
      it("erases cells that have focus if a cell is Ctrl-clicked", function() {
        spyOn(Keyboard, 'isKeyPressed').andReturn(true);
        canvases.focusedCells = {
          "0,1": new Cell(canvases, 0, 1),
          "0,2": new Cell(canvases, 0, 2),
          "0,3": new Cell(canvases, 0, 3)
        };
        tool.mousedrag({});
        expect(tool.upcomingCells["0,1"]).toHaveNoColor();
        expect(tool.upcomingCells["0,2"]).toHaveNoColor();
        return expect(tool.upcomingCells["0,3"]).toHaveNoColor();
      });
      return it("fills cells that have focus with the current color if a cell is left-clicked", function() {
        var currentColor;
        currentColor = new Color({
          red: 255,
          green: 255,
          blue: 0
        });
        app.boxes = {
          colors: {
            currentColor: function() {
              return currentColor;
            }
          }
        };
        canvases.focusedCells = {
          "0,1": new Cell(canvases, 0, 1),
          "0,2": new Cell(canvases, 0, 2),
          "0,3": new Cell(canvases, 0, 3)
        };
        tool.mousedrag({});
        expect(tool.upcomingCells["0,1"]).toHaveColor(currentColor);
        expect(tool.upcomingCells["0,2"]).toHaveColor(currentColor);
        return expect(tool.upcomingCells["0,3"]).toHaveColor(currentColor);
      });
    });
    describe('on mouse up', function() {
      beforeEach(function() {
        spyOn(tool, 'recordEvent');
        return spyOn(tool, 'reset');
      });
      it("draws the cells with their updated colors", function() {
        tool.mouseup({});
        return expect(tool.recordEvent).toHaveBeenCalledWith('updateCells');
      });
      return it("resets the tool", function() {
        tool.mouseup({});
        return expect(tool.reset).toHaveBeenCalled();
      });
    });
    describe('#cellOptions', function() {
      it("returns a hash with the color of the given cell if it is one of the cells over which the user has dragged", function() {
        var cell, color, opts;
        cell = new Cell(canvases, 0, 1);
        color = cell.color = new Color({
          red: 255,
          green: 255,
          blue: 0
        });
        tool.upcomingCells["0,1"] = cell;
        opts = tool.cellOptions(cell);
        return expect(opts.color).toEqualColor(color);
      });
      it("returns a hash with a lightened version of the current color if the given cell has focus", function() {
        var cell, color, opts;
        cell = new Cell(canvases, 0, 1);
        color = new Color({
          red: 255,
          green: 255,
          blue: 0
        });
        app.boxes = {
          colors: {
            currentColor: function() {
              return color;
            }
          }
        };
        canvases.focusedCells = {
          "0,1": cell
        };
        opts = tool.cellOptions(cell);
        return expect(opts.color).toEqualColor({
          red: 255,
          green: 255,
          blue: 0,
          alpha: 0.5
        });
      });
      it("returns an even lighter version of the current color if the given cell has focus and Ctrl is being pressed", function() {
        var cell, color, opts;
        cell = new Cell(canvases, 0, 1);
        color = cell.color = new Color({
          red: 255,
          green: 255,
          blue: 0
        });
        app.boxes = {
          colors: {
            currentColor: function() {
              return color;
            }
          }
        };
        canvases.focusedCells = {
          "0,1": cell
        };
        spyOn(Keyboard, 'isKeyPressed').andReturn(true);
        opts = tool.cellOptions(cell);
        return expect(opts.color).toEqualColor({
          red: 255,
          green: 255,
          blue: 0,
          alpha: 0.2
        });
      });
      return it("returns an empty hash otherwise", function() {
        var cell, opts;
        cell = new Cell(canvases, 0, 1);
        opts = tool.cellOptions(cell);
        return expect(opts).toEqual({});
      });
    });
    return describe('the updateCells event', function() {
      var action;
      action = null;
      beforeEach(function() {
        return action = tool.actions.updateCells;
      });
      describe('#do', function() {
        var oldCanvasCells, upcomingCells;
        upcomingCells = oldCanvasCells = null;
        beforeEach(function() {
          tool.upcomingCells = {
            "0,1": new Cell(canvases, 0, 0),
            "0,2": new Cell(canvases, 0, 1),
            "0,3": new Cell(canvases, 0, 2)
          };
          oldCanvasCells = [new Cell(canvases, 0, 0), new Cell(canvases, 0, 1), new Cell(canvases, 0, 2)];
          return canvases.cells = [[oldCanvasCells[0], oldCanvasCells[1], oldCanvasCells[2]]];
        });
        it("takes the @upcomingCells and applies them to the canvas", function() {
          action["do"]();
          expect(canvases.cells[0][0]).toBe(tool.upcomingCells["0,1"]);
          expect(canvases.cells[0][1]).toBe(tool.upcomingCells["0,2"]);
          return expect(canvases.cells[0][2]).toBe(tool.upcomingCells["0,3"]);
        });
        return it("returns an event with data to use for undoing and redoing the action", function() {
          var changedCells, event;
          event = action["do"]();
          changedCells = event.canvases.changedCells;
          expect(changedCells[0].before).toBe(oldCanvasCells[0]);
          expect(changedCells[0].after).toBe(tool.upcomingCells["0,1"]);
          expect(changedCells[1].before).toBe(oldCanvasCells[1]);
          expect(changedCells[1].after).toBe(tool.upcomingCells["0,2"]);
          expect(changedCells[2].before).toBe(oldCanvasCells[2]);
          return expect(changedCells[2].after).toBe(tool.upcomingCells["0,3"]);
        });
      });
      describe('#undo', function() {
        return it("loops through the changedCells of the last event and restores the 'before' data", function() {
          var changedCells, event;
          changedCells = [new Cell(canvases, 0, 0), new Cell(canvases, 0, 1), new Cell(canvases, 0, 2)];
          event = {
            canvases: {
              changedCells: [
                {
                  before: changedCells[0]
                }, {
                  before: changedCells[1]
                }, {
                  before: changedCells[2]
                }
              ]
            }
          };
          canvases.cells = [[]];
          action.undo(event);
          expect(canvases.cells[0][0]).toEqualCell(changedCells[0]);
          expect(canvases.cells[0][1]).toEqualCell(changedCells[1]);
          return expect(canvases.cells[0][2]).toEqualCell(changedCells[2]);
        });
      });
      return describe('#redo', function() {
        return it("loops through the changedCells of the last event and restores the 'after' data", function() {
          var changedCells, event;
          changedCells = [new Cell(canvases, 0, 0), new Cell(canvases, 0, 1), new Cell(canvases, 0, 2)];
          event = {
            canvases: {
              changedCells: [
                {
                  after: changedCells[0]
                }, {
                  after: changedCells[1]
                }, {
                  after: changedCells[2]
                }
              ]
            }
          };
          canvases.cells = [[]];
          action.redo(event);
          expect(canvases.cells[0][0]).toEqualCell(changedCells[0]);
          expect(canvases.cells[0][1]).toEqualCell(changedCells[1]);
          return expect(canvases.cells[0][2]).toEqualCell(changedCells[2]);
        });
      });
    });
  });

}).call(this);
