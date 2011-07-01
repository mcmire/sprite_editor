(function() {
  var Cell, CellLocation, Color, DrawingCanvases, Keyboard, Toolset;
  DrawingCanvases = SpriteEditor.DrawingCanvases, Keyboard = SpriteEditor.Keyboard, Cell = SpriteEditor.Cell, CellLocation = SpriteEditor.CellLocation, Color = SpriteEditor.Color, Toolset = SpriteEditor.Toolset;
  describe('DrawingCanvases', function() {
    var app, canvases, currentTool;
    currentTool = app = canvases = null;
    beforeEach(function() {
      localStorage.clear();
      currentTool = Toolset.createTool();
      return app = {
        boxes: {
          tools: {
            currentTool: function() {
              return currentTool;
            }
          }
        }
      };
    });
    afterEach(function() {
      return DrawingCanvases.destroy();
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(Keyboard._bindEvents).toBeTypeOf("function");
      return expect(Keyboard._unbindEvents).toBeTypeOf("function");
    });
    it("also responds to recordEvent and addAction", function() {
      expect(DrawingCanvases.recordEvent).toBeTypeOf("function");
      return expect(DrawingCanvases.addAction).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      it("resets key variables", function() {
        spyOn(DrawingCanvases, 'reset');
        canvases = DrawingCanvases.init(app);
        return expect(DrawingCanvases.reset).toHaveBeenCalled();
      });
      it("sets default properties", function() {
        canvases = DrawingCanvases.init(app);
        expect(canvases.tickInterval).toBe();
        expect(canvases.widthInCells).toBe();
        expect(canvases.heightInCells).toBe();
        expect(canvases.cellSize).toBe();
        return expect(canvases.showGrid).toBe();
      });
      it("initializes @cells to an array of arrays of Cells, initializing those Cells to empty Colors", function() {
        var result;
        canvases = DrawingCanvases.init(app, {
          widthInCells: 2,
          heightInCells: 2
        });
        expect(canvases.cells.length).toBe(2);
        expect(canvases.cells[0].length).toBe(2);
        result = $.v.every(canvases.cells, function(row) {
          return $.v.every(row, function(cell) {
            return cell.isClear();
          });
        });
        return expect(result).toBeTruthy();
      });
      describe('if showGrid is enabled', function() {
        it("creates the canvas element for the background of the working canvas (grid pattern)", function() {
          var c;
          canvases = DrawingCanvases.init(app, {
            showGrid: true
          });
          c = canvases.gridBgCanvas;
          expect(c.$element).toBeElementOf("canvas");
          expect(c.ctx).toBeDefined();
          expect(c.width).toBe(30);
          return expect(c.height).toBe(30);
        });
        return it("attaches the grid pattern to the working canvas", function() {
          canvases = DrawingCanvases.init(app, {
            showGrid: true
          });
          return expect(canvases.workingCanvas.$element.css('background-image')).toMatch(/^url\(data:image\/png;base64,.+\)$/);
        });
      });
      describe('if showGrid is not enabled', function() {
        return it("doesn't create a working canvas background pattern", function() {
          canvases = DrawingCanvases.init(app, {
            showGrid: false
          });
          return expect(canvases.gridBgCanvas).not.toBe();
        });
      });
      it("creates the canvas element where the main editing takes place", function() {
        var c;
        canvases = DrawingCanvases.init(app, {
          widthInCells: 2,
          heightInCells: 2,
          cellSize: 10
        });
        c = canvases.workingCanvas;
        expect(c.$element).toBeElementOf("canvas");
        expect(c.$element).toHaveAttr("id", "working_canvas");
        expect(c.ctx).toBeDefined();
        expect(c.width).toBe(20);
        return expect(c.height).toBe(20);
      });
      it("creates the canvas element where the preview gets drawn", function() {
        var c;
        canvases = DrawingCanvases.init(app, {
          widthInCells: 2,
          heightInCells: 2,
          cellSize: 10
        });
        c = canvases.previewCanvas;
        expect(c.$element).toBeElementOf("canvas");
        expect(c.$element).toHaveAttr("id", "preview_canvas");
        expect(c.ctx).toBeDefined();
        expect(c.width).toBe(2);
        return expect(c.height).toBe(2);
      });
      return it("creates the canvas element where the preview gets tiled", function() {
        var c;
        canvases = DrawingCanvases.init(app, {
          widthInCells: 2,
          heightInCells: 2,
          cellSize: 10,
          patternSize: 4
        });
        c = canvases.tiledPreviewCanvas;
        expect(c.$element).toBeElementOf("canvas");
        expect(c.$element).toHaveAttr("id", "tiled_preview_canvas");
        expect(c.ctx).toBeDefined();
        expect(c.width).toBe(8);
        return expect(c.height).toBe(8);
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      it("resets key variables", function() {
        spyOn(canvases, 'reset');
        canvases.destroy();
        return expect(canvases.reset).toHaveBeenCalled();
      });
      it("removes any events that may have been added", function() {
        spyOn(canvases, 'removeEvents');
        canvases.destroy();
        return expect(canvases.removeEvents).toHaveBeenCalled();
      });
      return it("removes any local storage keys that may be present", function() {
        localStorage.setItem("sprite_editor.saved", "true");
        localStorage.setItem("sprite_editor.cells", "something");
        canvases.destroy();
        expect(localStorage.getItem("sprite_editor.saved")).not.toBe();
        return expect(localStorage.getItem("sprite_editor.cells")).not.toBe();
      });
    });
    describe('when reset', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      it("stops the draw loop", function() {
        spyOn(canvases, 'stopDrawing');
        canvases.reset();
        return expect(canvases.stopDrawing).toHaveBeenCalled();
      });
      it("stops the auto-save loop", function() {
        spyOn(canvases, 'stopSaving');
        canvases.reset();
        return expect(canvases.stopSaving).toHaveBeenCalled();
      });
      it("clears @width", function() {
        canvases.width = "whatever";
        canvases.reset();
        return expect(canvases.width).toBeNull();
      });
      it("clears @workingCanvas", function() {
        canvases.workingCanvas = "whatever";
        canvases.reset();
        return expect(canvases.workingCanvas).not.toBe();
      });
      it("clears @gridBgCanvas", function() {
        canvases.gridBgCanvas = "whatever";
        canvases.reset();
        return expect(canvases.gridBgCanvas).not.toBe();
      });
      it("clears @previewCanvas", function() {
        canvases.previewCanvas = "whatever";
        canvases.reset();
        return expect(canvases.previewCanvas).not.toBe();
      });
      it("clears @cells", function() {
        canvases.cells = "whatever";
        canvases.reset();
        return expect(canvases.cells).toEqual([]);
      });
      it("clears @focusedCell", function() {
        canvases.focusedCell = "whatever";
        canvases.reset();
        return expect(canvases.focusedCell).not.toBe();
      });
      it("clears @focusedCells", function() {
        canvases.focusedCells = "whatever";
        canvases.reset();
        return expect(canvases.focusedCells).toEqual([]);
      });
      it("clears @startDragAtCell", function() {
        canvases.startDragAtCell = "whatever";
        canvases.reset();
        return expect(canvases.startDragAtCell).not.toBe();
      });
      it("clears the @clipboard", function() {
        canvases.clipboard = "whatever";
        canvases.reset();
        return expect(canvases.clipboard).toEqual([]);
      });
      return it("clears the pre-suspend state", function() {
        canvases.stateBeforeSuspend = "whatever";
        canvases.reset();
        return expect(canvases.stateBeforeSuspend).not.toBe();
      });
    });
    describe('#startDrawing', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      it("starts the draw loop", function() {
        canvases.startDrawing();
        return expect(canvases.drawTimer).toBe();
      });
      return it("doesn't do anything if the draw loop is already running", function() {
        var timer;
        canvases.startDrawing();
        timer = canvases.drawTimer;
        canvases.startDrawing();
        return expect(canvases.drawTimer).toBe(timer);
      });
    });
    describe('#draw', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      it("clears the working canvas");
      it("clears the preview canvas");
      it("clears the tiled preview canvas");
      it("draws each cell", function() {
        spyOn(canvases, 'drawCell');
        canvases.draw();
        return expect(canvases.drawCell).toHaveBeenCalledWith(jasmine.any(Cell), {});
      });
      return it("uses the current tool to draw the cell if it provides cell options", function() {
        var opts;
        opts = {
          foo: "bar"
        };
        currentTool.cellOptions = function() {
          return opts;
        };
        spyOn(canvases, 'drawCell');
        canvases.draw();
        return expect(canvases.drawCell).toHaveBeenCalledWith(jasmine.any(Cell), opts);
      });
    });
    describe('#stopDrawing', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      it("stops the draw loop", function() {
        canvases.startDrawing();
        canvases.stopDrawing();
        return expect(canvases.drawTimer).not.toBe();
      });
      return it("doesn't bomb if the draw loop is not running", function() {
        return expect(function() {
          return canvases.stopDrawing();
        }).not.toThrowAnything();
      });
    });
    describe('#startSaving', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      it("starts the auto-save loop", function() {
        canvases.startSaving();
        return expect(canvases.autoSaveTimer).toBe();
      });
      return it("doesn't do anything if the auto-save loop is already running", function() {
        var timer;
        canvases.startSaving();
        timer = canvases.autoSaveTimer;
        canvases.startSaving();
        return expect(canvases.autoSaveTimer).toBe(timer);
      });
    });
    describe('#save', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app, {
          widthInCells: 2,
          heightInCells: 2
        });
      });
      return it("stores the cells in local storage", function() {
        var json;
        canvases.cells[0][0] = new Cell({
          app: app,
          loc: new CellLocation({
            app: app,
            i: 0,
            j: 0
          }),
          color: new Color({
            red: 255,
            green: 0,
            blue: 0
          })
        });
        canvases.cells[0][1] = new Cell({
          app: app,
          loc: new CellLocation({
            app: app,
            i: 0,
            j: 1
          }),
          color: new Color({
            red: 0,
            green: 255,
            blue: 0
          })
        });
        canvases.cells[1][0] = new Cell({
          app: app,
          loc: new CellLocation({
            app: app,
            i: 1,
            j: 0
          }),
          color: new Color({
            red: 0,
            green: 0,
            blue: 255
          })
        });
        canvases.cells[1][1] = new Cell({
          app: app,
          loc: new CellLocation({
            app: app,
            i: 1,
            j: 1
          }),
          color: new Color({
            red: 255,
            green: 255,
            blue: 255
          })
        });
        canvases.save();
        json = localStorage.getItem("sprite_editor.cells");
        return expect(JSON.parse(json)).toEqual({
          "0,0": {
            _s: true,
            red: 255,
            green: 0,
            blue: 0,
            hue: 0,
            sat: 100,
            lum: 50,
            alpha: 1
          },
          "0,1": {
            _s: true,
            red: 0,
            green: 255,
            blue: 0,
            hue: 120,
            sat: 100,
            lum: 50,
            alpha: 1
          },
          "1,0": {
            _s: true,
            red: 0,
            green: 0,
            blue: 255,
            hue: 240,
            sat: 100,
            lum: 50,
            alpha: 1
          },
          "1,1": {
            _s: true,
            red: 255,
            green: 255,
            blue: 255,
            hue: 0,
            sat: 100,
            lum: 100,
            alpha: 1
          }
        });
      });
    });
    describe('#stopSaving', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      it("stops the auto-save loop", function() {
        canvases.startSaving();
        canvases.stopSaving();
        return expect(canvases.autoSaveTimer).not.toBe();
      });
      return it("doesn't bomb if the auto-save loop is not running", function() {
        return expect(function() {
          return canvases.stopSaving();
        }).not.toThrowAnything();
      });
    });
    describe('#suspend', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      describe('if not suspended yet', function() {
        it("stores the state of the draw loop", function() {
          canvases.drawTimer = "something";
          canvases.suspend();
          return expect(canvases.stateBeforeSuspend.wasDrawing).toBeTruthy();
        });
        it("stores the state of the auto-save loop", function() {
          canvases.autoSaveTimer = null;
          canvases.suspend();
          return expect(canvases.stateBeforeSuspend.wasSaving).toBeFalsy();
        });
        it("stops the draw loop", function() {
          spyOn(canvases, 'stopDrawing');
          canvases.suspend();
          return expect(canvases.stopDrawing).toHaveBeenCalled();
        });
        return it("stops the auto-save loop", function() {
          spyOn(canvases, 'stopSaving');
          canvases.suspend();
          return expect(canvases.stopSaving).toHaveBeenCalled();
        });
      });
      return describe('if already suspended', function() {
        beforeEach(function() {
          return canvases.stateBeforeSuspend = "something";
        });
        it("doesn't try to stop the draw loop", function() {
          spyOn(canvases, 'stopDrawing');
          canvases.suspend();
          return expect(canvases.stopDrawing).not.toHaveBeenCalled();
        });
        return it("doesn't try to stop the auto-save loop", function() {
          spyOn(canvases, 'stopSaving');
          canvases.suspend();
          return expect(canvases.stopSaving).not.toHaveBeenCalled();
        });
      });
    });
    describe('#resume', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      describe('if not resumed yet', function() {
        it("starts the draw loop if it had been running prior to suspension", function() {
          canvases.stateBeforeSuspend = {
            wasDrawing: true
          };
          spyOn(canvases, 'startDrawing');
          canvases.resume();
          return expect(canvases.startDrawing).toHaveBeenCalled();
        });
        it("doesn't start the draw loop if it had not been running prior to suspension", function() {
          canvases.stateBeforeSuspend = {
            wasDrawing: false
          };
          spyOn(canvases, 'startDrawing');
          canvases.resume();
          return expect(canvases.startDrawing).not.toHaveBeenCalled();
        });
        it("starts the save loop if it had been running prior to suspension", function() {
          canvases.stateBeforeSuspend = {
            wasSaving: true
          };
          spyOn(canvases, 'startSaving');
          canvases.resume();
          return expect(canvases.startSaving).toHaveBeenCalled();
        });
        return it("doesn't start the save loop if it had not been running prior to suspension", function() {
          canvases.stateBeforeSuspend = {
            wasSaving: false
          };
          spyOn(canvases, 'startSaving');
          canvases.resume();
          return expect(canvases.startSaving).not.toHaveBeenCalled();
        });
      });
      return describe('if already resumed', function() {
        beforeEach(function() {
          return canvases.stateBeforeSuspend = null;
        });
        return it("doesn't bomb", function() {
          return expect(function() {
            return canvases.resume();
          }).not.toThrowAnything();
        });
      });
    });
    return describe('when events have been added', function() {
      var $canvas, o;
      $canvas = o = null;
      beforeEach(function() {
        app.boxes.sizes = {
          currentSize: 1
        };
        canvases = DrawingCanvases.init(app, {
          cellSize: 10,
          widthInCells: 10,
          heightInCells: 10
        });
        $canvas = canvases.workingCanvas.$element.appendTo('#sandbox');
        o = $canvas.offset();
        return canvases.addEvents();
      });
      it("starts the draw loop", function() {
        return expect(canvases.drawTimer).toBe();
      });
      describe('when the mouse is down over the element', function() {
        return it("triggers a possible mousedown event on the current tool", function() {
          currentTool.mousedown = jasmine.createSpy();
          $canvas.simulate("mousedown", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          return expect(currentTool.mousedown).toHaveBeenCalled();
        });
      });
      describe('when the mouse is lifted', function() {
        return it("triggers a possible mouseup event on the current tool", function() {
          currentTool.mouseup = jasmine.createSpy();
          $(document).simulate("mouseup");
          return expect(currentTool.mouseup).toHaveBeenCalled();
        });
      });
      describe('when the mouse is moved', function() {
        var simulateEvent;
        simulateEvent = function(dx, dy) {
          if (dx == null) {
            dx = 1;
          }
          if (dy == null) {
            dy = 1;
          }
          $canvas.simulate("mouseover", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          return $(document).simulate("mousemove", {
            clientX: o.left + dx,
            clientY: o.top + dy
          });
        };
        it("triggers a possible mousemove event on the current tool", function() {
          currentTool.mousemove = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mousemove).toHaveBeenCalled();
        });
        it("stores the cell that has focus", function() {
          var cell;
          cell = new Cell(app, 3, 6);
          canvases.cells[3][6] = cell;
          simulateEvent(65, 35);
          return expect(canvases.focusedCell).toEqual(cell);
        });
        return it("stores the cells that has focus (considering the brush size)", function() {
          var cell, cells, i, _len, _ref, _results;
          app.boxes.sizes = {
            currentSize: 4
          };
          cells = [];
          cells[0] = new Cell(app, 2, 5);
          cells[1] = new Cell(app, 2, 6);
          cells[2] = new Cell(app, 3, 5);
          cells[3] = new Cell(app, 3, 6);
          canvases.cells[2][5] = cells[0];
          canvases.cells[2][6] = cells[1];
          canvases.cells[3][5] = cells[2];
          canvases.cells[3][6] = cells[3];
          simulateEvent(65, 35);
          _ref = canvases.focusedCells;
          _results = [];
          for (i = 0, _len = _ref.length; i < _len; i++) {
            cell = _ref[i];
            _results.push(expect(cell).toEqualCell(cells[i]));
          }
          return _results;
        });
      });
      describe('when the mouse starts to be dragged while over the element', function() {
        var cell, simulateEvent;
        cell = null;
        beforeEach(function() {
          cell = new Cell(app, 0, 0);
          return canvases.cells[0][0] = cell;
        });
        simulateEvent = function() {
          $canvas.simulate("mouseover", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          $canvas.simulate("mousedown", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          return $(document).simulate("mousemove", {
            clientX: o.left + 5,
            clientY: o.top + 5
          });
        };
        it("sets startDragAtCell to a clone of the cell that has focus", function() {
          simulateEvent();
          expect(canvases.startDragAtCell).toEqualCell(cell);
          return expect(canvases.startDragAtCell).not.toBe(cell);
        });
        return it("triggers a possible mousedragstart event on the current tool", function() {
          currentTool.mousedragstart = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mousedragstart).toHaveBeenCalled();
        });
      });
      describe('when the mouse is being dragged', function() {
        var simulateEvent;
        simulateEvent = function() {
          $canvas.simulate("mouseover", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          $canvas.simulate("mousedown", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          return $(document).simulate("mousemove", {
            clientX: o.left + 5,
            clientY: o.top + 5
          });
        };
        return it("triggers a possible mousedrag event on the current tool", function() {
          currentTool.mousedrag = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mousedrag).toHaveBeenCalled();
        });
      });
      describe('when the mouse drag ends', function() {
        var simulateEvent;
        simulateEvent = function() {
          $canvas.simulate("mouseover", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          $canvas.simulate("mousedown", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          $(document).simulate("mousemove", {
            clientX: o.left + 5,
            clientY: o.top + 5
          });
          return $(document).simulate("mouseup", {
            clientX: o.left + 5,
            clientY: o.top + 5
          });
        };
        return it("triggers a possible mousedrag event on the current tool", function() {
          currentTool.mousedragstop = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mousedragstop).toHaveBeenCalled();
        });
      });
      describe('when the mouse is moved over the element but not being dragged', function() {
        var simulateEvent;
        simulateEvent = function() {
          $canvas.simulate("mouseover", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          return $(document).simulate("mousemove", {
            clientX: o.left + 5,
            clientY: o.top + 5
          });
        };
        return it("triggers a possible mousedrag event on the current tool", function() {
          currentTool.mouseglide = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mouseglide).toHaveBeenCalled();
        });
      });
      describe('when the mouse leaves the element', function() {
        var simulateEvent;
        beforeEach(function() {
          canvases.focusedCell = "whatever";
          return canvases.focusedCells = "blah blah";
        });
        simulateEvent = function() {
          return $canvas.simulate("mouseout", {
            clientX: o.left - 1,
            clientY: o.top - 1
          });
        };
        it("triggers a possible mouseout event on the current tool", function() {
          currentTool.mouseout = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mouseout).toHaveBeenCalled();
        });
        it("clears the cell that has focus", function() {
          simulateEvent();
          return expect(canvases.focusedCell).not.toBe();
        });
        it("clears the cells that have focus (considering the brush size)", function() {
          simulateEvent();
          return expect(canvases.focusedCells).toEqual([]);
        });
        return it("redraws the canvas", function() {
          spyOn(canvases, 'draw');
          simulateEvent();
          return expect(canvases.draw).toHaveBeenCalled();
        });
      });
      describe('when the window loses focus', function() {
        var simulateEvent;
        simulateEvent = function() {
          return $(window).simulate("blur");
        };
        return it("suspends the draw and auto-save loop", function() {
          spyOn(canvases, 'suspend');
          simulateEvent();
          return expect(canvases.suspend).toHaveBeenCalled();
        });
      });
      return describe('when the window gains focus again', function() {
        var simulateEvent;
        simulateEvent = function() {
          return $(window).simulate("focus");
        };
        return it("resumes the draw and auto-save loop (if they were running before suspension)", function() {
          spyOn(canvases, 'resume');
          simulateEvent();
          return expect(canvases.resume).toHaveBeenCalled();
        });
      });
    });
  });
}).call(this);
