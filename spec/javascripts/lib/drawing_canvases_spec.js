(function() {
  var Cell, CellLocation, Color, DrawingCanvases, ElementMouseTracker, Keyboard, Toolset;
  DrawingCanvases = SpriteEditor.DrawingCanvases, ElementMouseTracker = SpriteEditor.ElementMouseTracker, Keyboard = SpriteEditor.Keyboard, Cell = SpriteEditor.Cell, CellLocation = SpriteEditor.CellLocation, Color = SpriteEditor.Color, Toolset = SpriteEditor.Toolset;
  describe('DrawingCanvases', function() {
    var app, canvases;
    app = canvases = null;
    beforeEach(function() {
      localStorage.clear();
      return app = {
        isInitialized: true
      };
    });
    afterEach(function() {
      return DrawingCanvases.destroy();
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(DrawingCanvases._bindEvents).toBeTypeOf("function");
      return expect(DrawingCanvases._unbindEvents).toBeTypeOf("function");
    });
    it("also responds to recordEvent and addAction", function() {
      expect(DrawingCanvases.recordEvent).toBeTypeOf("function");
      return expect(DrawingCanvases.addAction).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      it("resets key variables", function() {
        spyOn(DrawingCanvases, 'reset').andCallThrough();
        canvases = DrawingCanvases.init(app);
        return expect(DrawingCanvases.reset).toHaveBeenCalled();
      });
      it("sets default properties", function() {
        canvases = DrawingCanvases.init(app);
        expect(canvases.drawInterval).toBe();
        expect(canvases.widthInCells).toBe();
        expect(canvases.heightInCells).toBe();
        expect(canvases.cellSize).toBe();
        return expect(canvases.showGrid).toBe();
      });
      it("initializes ElementMouseTracker if it hasn't been initialized yet", function() {
        spyOn(ElementMouseTracker, 'init').andCallThrough();
        spyOn(ElementMouseTracker, 'addEvents').andCallThrough();
        canvases = DrawingCanvases.init(app);
        expect(ElementMouseTracker.init).toHaveBeenCalled();
        return expect(ElementMouseTracker.addEvents).toHaveBeenCalled();
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
      it("creates the canvas element where the preview gets tiled", function() {
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
      return it('sets @isInitialized to true', function() {
        canvases = DrawingCanvases.init(app);
        return expect(canvases.isInitialized).toBeTruthy();
      });
    });
    describe('when destroyed', function() {
      describe('if initialized', function() {
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
        return it('sets @isInitialized to false', function() {
          canvases.destroy();
          return expect(canvases.isInitialized).toBeFalsy();
        });
      });
      return describe('if not initialized', function() {
        it("does not try to reset key variables", function() {
          spyOn(DrawingCanvases, 'reset');
          DrawingCanvases.destroy();
          return expect(DrawingCanvases.reset).not.toHaveBeenCalled();
        });
        return it("does not try to remove events", function() {
          spyOn(DrawingCanvases, 'removeEvents');
          DrawingCanvases.destroy();
          return expect(DrawingCanvases.removeEvents).not.toHaveBeenCalled();
        });
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
      it("removes any local storage keys that may be present", function() {
        localStorage.setItem("sprite_editor.saved", "true");
        localStorage.setItem("sprite_editor.cells", "something");
        canvases.reset();
        expect(localStorage.getItem("sprite_editor.saved")).not.toBe();
        return expect(localStorage.getItem("sprite_editor.cells")).not.toBe();
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
        canvases = DrawingCanvases.init(app);
        return spyOn(canvases, 'draw');
      });
      describe("if the draw loop isn't started yet", function() {
        beforeEach(function() {
          return canvases.isDrawing = false;
        });
        it("starts the draw loop", function() {
          canvases.startDrawing();
          return expect(canvases.draw).toHaveBeenCalled();
        });
        return it("sets the state of the canvases to drawing", function() {
          canvases.startDrawing();
          return expect(canvases.isDrawing).toBeTruthy();
        });
      });
      return describe("if the draw loop is already started", function() {
        beforeEach(function() {
          return canvases.isDrawing = true;
        });
        return it("doesn't re-start the draw loop", function() {
          canvases.startDrawing();
          return expect(canvases.draw).not.toHaveBeenCalled();
        });
      });
    });
    describe('#draw', function() {
      var currentTool;
      currentTool = null;
      beforeEach(function() {
        canvases = DrawingCanvases.init(app);
        currentTool = Toolset.createTool();
        return app.boxes = {
          tools: {
            currentTool: function() {
              return currentTool;
            }
          }
        };
      });
      it("clears the working canvas", function() {
        var wc;
        wc = canvases.workingCanvas;
        wc.width = 100;
        wc.height = 100;
        spyOn(wc.ctx, 'clearRect');
        canvases.draw();
        return expect(wc.ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 100);
      });
      it("clears the preview canvas");
      it("clears the tiled preview canvas", function() {
        var tpc;
        tpc = canvases.tiledPreviewCanvas;
        tpc.width = 100;
        tpc.height = 100;
        spyOn(tpc.ctx, 'clearRect');
        canvases.draw();
        return expect(tpc.ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 100);
      });
      it("draws each cell onto the working canvas", function() {
        spyOn(canvases, 'drawCell');
        canvases.draw();
        return expect(canvases.drawCell).toHaveBeenCalledWith(jasmine.any(Cell), {});
      });
      it("uses the current tool to draw the cell onto the working canvas if it provides cell options", function() {
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
      it("writes the changes to the preview canvas", function() {
        var pc;
        pc = canvases.previewCanvas;
        pc.imageData = "imageData";
        spyOn(canvases, '_clearPreviewCanvas');
        spyOn(pc.ctx, 'putImageData');
        canvases.draw();
        return expect(pc.ctx.putImageData).toHaveBeenCalledWith("imageData", 0, 0);
      });
      it("triggers a possible draw event on the current tool", function() {
        currentTool.draw = jasmine.createSpy();
        canvases.draw();
        return expect(currentTool.draw).toHaveBeenCalled();
      });
      return it("applies the preview canvas to the tiled preview canvas (tiling it, of course)", function() {
        var tpc;
        tpc = canvases.tiledPreviewCanvas;
        tpc.width = 100;
        tpc.height = 100;
        spyOn(tpc.ctx, 'createPattern').andReturn('#ff0000');
        spyOn(tpc.ctx, 'fillRect');
        canvases.draw();
        expect(tpc.ctx.createPattern).toHaveBeenCalledWith(canvases.previewCanvas.element, "repeat");
        expect(tpc.ctx.fillStyle).toEqual('#ff0000');
        return expect(tpc.ctx.fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
      });
    });
    describe('#stopDrawing', function() {
      beforeEach(function() {
        canvases = DrawingCanvases.init(app);
        spyOn(canvases, 'draw');
        return canvases.startDrawing();
      });
      return it("sets the state of the canvases to not-drawing", function() {
        canvases.stopDrawing();
        return expect(canvases.isDrawing).toBeFalsy();
      });
    });
    describe('#startSaving', function() {
      beforeEach(function() {
        canvases = DrawingCanvases.init(app);
        return spyOn(canvases, 'save');
      });
      describe("if the draw loop isn't started yet", function() {
        beforeEach(function() {
          return canvases.isSaving = false;
        });
        it("starts the save loop", function() {
          canvases.startSaving();
          return expect(canvases.save).toHaveBeenCalled();
        });
        return it("sets the state of the canvases to drawing", function() {
          canvases.startSaving();
          return expect(canvases.isSaving).toBeTruthy();
        });
      });
      return describe("if the draw loop is already started", function() {
        beforeEach(function() {
          return canvases.isSaving = true;
        });
        return it("doesn't re-start the draw loop", function() {
          canvases.startSaving();
          return expect(canvases.save).not.toHaveBeenCalled();
        });
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
          canvases: canvases,
          loc: new CellLocation({
            canvases: canvases,
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
          canvases: canvases,
          loc: new CellLocation({
            canvases: canvases,
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
          canvases: canvases,
          loc: new CellLocation({
            canvases: canvases,
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
          canvases: canvases,
          loc: new CellLocation({
            canvases: canvases,
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
        canvases = DrawingCanvases.init(app);
        return canvases.startSaving();
      });
      return it("sets the state of the canvases to not-saving", function() {
        canvases.stopSaving();
        return expect(canvases.isSaving).toBeFalsy();
      });
    });
    describe('#suspend', function() {
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app);
      });
      describe('if not suspended yet', function() {
        it("stores the state of the draw loop", function() {
          canvases.isDrawing = true;
          canvases.suspend();
          return expect(canvases.stateBeforeSuspend.wasDrawing).toBeTruthy();
        });
        it("stores the state of the auto-save loop", function() {
          canvases.isSaving = false;
          canvases.suspend();
          return expect(canvases.stateBeforeSuspend.wasSaving).toBeFalsy();
        });
        it("stops the draw loop", function() {
          spyOn(canvases, 'stopDrawing');
          canvases.suspend();
          return expect(canvases.stopDrawing).toHaveBeenCalled();
        });
        return it("stops the save loop", function() {
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
        canvases = DrawingCanvases.init(app);
        spyOn(canvases, 'startDrawing');
        return spyOn(canvases, 'startSaving');
      });
      describe('if not resumed yet', function() {
        it("starts the draw loop if it had been running prior to suspension", function() {
          canvases.stateBeforeSuspend = {
            wasDrawing: true
          };
          canvases.resume();
          return expect(canvases.startDrawing).toHaveBeenCalled();
        });
        it("doesn't start the draw loop if it had not been running prior to suspension", function() {
          canvases.stateBeforeSuspend = {
            wasDrawing: false
          };
          canvases.resume();
          return expect(canvases.startDrawing).not.toHaveBeenCalled();
        });
        it("starts the save loop if it had been running prior to suspension", function() {
          canvases.stateBeforeSuspend = {
            wasSaving: true
          };
          canvases.resume();
          return expect(canvases.startSaving).toHaveBeenCalled();
        });
        it("doesn't start the save loop if it had not been running prior to suspension", function() {
          canvases.stateBeforeSuspend = {
            wasSaving: false
          };
          canvases.resume();
          return expect(canvases.startSaving).not.toHaveBeenCalled();
        });
        return it("clears stateBeforeSuspend", function() {
          canvases.stateBeforeSuspend = {};
          canvases.resume();
          return expect(canvases.stateBeforeSuspend).not.toBe();
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
    describe('when events have been added', function() {
      var $canvas, currentTool, o;
      currentTool = $canvas = o = null;
      beforeEach(function() {
        currentTool = Toolset.createTool();
        app.boxes = {
          tools: {
            currentTool: function() {
              return currentTool;
            }
          },
          sizes: {
            currentSize: 1
          }
        };
        canvases = DrawingCanvases.init(app, {
          cellSize: 10,
          widthInCells: 10,
          heightInCells: 10
        });
        $canvas = canvases.workingCanvas.$element.appendTo('#sandbox');
        o = $canvas.offset();
        return spyOn(canvases, 'draw');
      });
      it("starts the draw loop", function() {
        spyOn(canvases, 'startDrawing');
        canvases.addEvents();
        return expect(canvases.startDrawing).toHaveBeenCalled();
      });
      describe('when the mouse is down over the element', function() {
        return it("triggers a possible mousedown event on the current tool", function() {
          currentTool.mousedown = jasmine.createSpy();
          canvases.addEvents();
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
          canvases.addEvents();
          $canvas.simulate("mousedown", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
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
          canvases.addEvents();
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
          cell = new Cell(canvases, 3, 6);
          canvases.cells[3][6] = cell;
          simulateEvent(65, 35);
          return expect(canvases.focusedCell).toEqual(cell);
        });
        return it("stores the cells that have focus (considering the brush size)", function() {
          var cell, cells, i, _len, _ref, _results;
          app.boxes.sizes = {
            currentSize: 4
          };
          cells = [];
          cells[0] = new Cell(canvases, 2, 5);
          cells[1] = new Cell(canvases, 2, 6);
          cells[2] = new Cell(canvases, 3, 5);
          cells[3] = new Cell(canvases, 3, 6);
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
          cell = new Cell(canvases, 0, 0);
          return canvases.cells[0][0] = cell;
        });
        simulateEvent = function() {
          canvases.addEvents();
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
          canvases.addEvents();
          simulateEvent();
          return expect(currentTool.mousedragstart).toHaveBeenCalled();
        });
      });
      describe('when the mouse is being dragged', function() {
        var simulateEvent;
        simulateEvent = function() {
          canvases.addEvents();
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
          canvases.addEvents();
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
          canvases.addEvents();
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
          canvases.addEvents();
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
          simulateEvent();
          return expect(canvases.draw).toHaveBeenCalled();
        });
      });
      describe('when the window loses focus', function() {
        var simulateEvent;
        simulateEvent = function() {
          canvases.addEvents();
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
          canvases.addEvents();
          return $(window).simulate("focus");
        };
        return it("resumes the draw and auto-save loop (if they were running before suspension)", function() {
          spyOn(canvases, 'resume');
          simulateEvent();
          return expect(canvases.resume).toHaveBeenCalled();
        });
      });
    });
    describe('when events have been removed', function() {
      var $canvas, currentTool, o;
      currentTool = $canvas = o = null;
      beforeEach(function() {
        currentTool = Toolset.createTool();
        app.boxes = {
          tools: {
            currentTool: function() {
              return currentTool;
            }
          },
          sizes: {
            currentSize: 1
          }
        };
        canvases = DrawingCanvases.init(app, {
          cellSize: 10,
          widthInCells: 10,
          heightInCells: 10
        });
        $canvas = canvases.workingCanvas.$element.appendTo('#sandbox');
        o = $canvas.offset();
        canvases.addEvents();
        return spyOn(canvases, 'draw');
      });
      it("stops the draw loop", function() {
        spyOn(canvases, 'stopDrawing');
        canvases.removeEvents();
        return expect(canvases.stopDrawing).toHaveBeenCalled();
      });
      describe('when the mouse is down over the element', function() {
        return it("does not trigger a possible mousedown event on the current tool", function() {
          currentTool.mousedown = jasmine.createSpy();
          canvases.removeEvents();
          $canvas.simulate("mousedown", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          return expect(currentTool.mousedown).not.toHaveBeenCalled();
        });
      });
      describe('when the mouse is lifted', function() {
        return it("does not trigger a possible mouseup event on the current tool", function() {
          currentTool.mouseup = jasmine.createSpy();
          canvases.removeEvents();
          $canvas.simulate("mousedown", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          $(document).simulate("mouseup");
          return expect(currentTool.mouseup).not.toHaveBeenCalled();
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
          canvases.removeEvents();
          $canvas.simulate("mouseover", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          return $(document).simulate("mousemove", {
            clientX: o.left + dx,
            clientY: o.top + dy
          });
        };
        it("does not trigger a possible mousemove event on the current tool", function() {
          currentTool.mousemove = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mousemove).not.toHaveBeenCalled();
        });
        it("does not store the cell that has focus", function() {
          var cell;
          cell = new Cell(canvases, 3, 6);
          canvases.cells[3][6] = cell;
          simulateEvent(65, 35);
          return expect(canvases.focusedCell).not.toBe();
        });
        return it("does not store the cells that have focus (considering the brush size)", function() {
          var cells;
          app.boxes.sizes = {
            currentSize: 4
          };
          cells = [];
          cells[0] = new Cell(canvases, 2, 5);
          cells[1] = new Cell(canvases, 2, 6);
          cells[2] = new Cell(canvases, 3, 5);
          cells[3] = new Cell(canvases, 3, 6);
          canvases.cells[2][5] = cells[0];
          canvases.cells[2][6] = cells[1];
          canvases.cells[3][5] = cells[2];
          canvases.cells[3][6] = cells[3];
          simulateEvent(65, 35);
          return expect(canvases.focusedCells).toEqual([]);
        });
      });
      describe('when the mouse starts to be dragged while over the element', function() {
        var cell, simulateEvent;
        cell = null;
        beforeEach(function() {
          cell = new Cell(canvases, 0, 0);
          return canvases.cells[0][0] = cell;
        });
        simulateEvent = function() {
          canvases.removeEvents();
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
        it("does not set startDragAtCell to a clone of the cell that has focus", function() {
          simulateEvent();
          return expect(canvases.startDragAtCell).not.toBe();
        });
        return it("does not trigger a possible mousedragstart event on the current tool", function() {
          currentTool.mousedragstart = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mousedragstart).not.toHaveBeenCalled();
        });
      });
      describe('when the mouse is being dragged', function() {
        var simulateEvent;
        simulateEvent = function() {
          canvases.removeEvents();
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
        return it("does not trigger a possible mousedrag event on the current tool", function() {
          currentTool.mousedrag = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mousedrag).not.toHaveBeenCalled();
        });
      });
      describe('when the mouse drag ends', function() {
        var simulateEvent;
        simulateEvent = function() {
          canvases.removeEvents();
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
        return it("does not trigger a possible mousedrag event on the current tool", function() {
          currentTool.mousedragstop = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mousedragstop).not.toHaveBeenCalled();
        });
      });
      describe('when the mouse is moved over the element but not being dragged', function() {
        var simulateEvent;
        simulateEvent = function() {
          canvases.removeEvents();
          $canvas.simulate("mouseover", {
            clientX: o.left + 1,
            clientY: o.top + 1
          });
          return $(document).simulate("mousemove", {
            clientX: o.left + 5,
            clientY: o.top + 5
          });
        };
        return it("does not trigger a possible mousedrag event on the current tool", function() {
          currentTool.mouseglide = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mouseglide).not.toHaveBeenCalled();
        });
      });
      describe('when the mouse leaves the element', function() {
        var simulateEvent;
        beforeEach(function() {
          canvases.focusedCell = "whatever";
          return canvases.focusedCells = "blah blah";
        });
        simulateEvent = function() {
          canvases.removeEvents();
          return $canvas.simulate("mouseout", {
            clientX: o.left - 1,
            clientY: o.top - 1
          });
        };
        it("does not trigger a possible mouseout event on the current tool", function() {
          currentTool.mouseout = jasmine.createSpy();
          simulateEvent();
          return expect(currentTool.mouseout).not.toHaveBeenCalled();
        });
        it("does not clear the cell that has focus", function() {
          simulateEvent();
          return expect(canvases.focusedCell).toEqual("whatever");
        });
        it("does not clear the cells that have focus (considering the brush size)", function() {
          simulateEvent();
          return expect(canvases.focusedCells).toEqual("blah blah");
        });
        return it("does not redraw the canvas", function() {
          simulateEvent();
          return expect(canvases.draw).not.toHaveBeenCalled();
        });
      });
      describe('when the window loses focus', function() {
        var simulateEvent;
        simulateEvent = function() {
          canvases.removeEvents();
          return $(window).simulate("blur");
        };
        return it("does not suspend the draw and auto-save loop", function() {
          spyOn(canvases, 'suspend');
          simulateEvent();
          return expect(canvases.suspend).not.toHaveBeenCalled();
        });
      });
      return describe('when the window gains focus again', function() {
        var simulateEvent;
        simulateEvent = function() {
          canvases.removeEvents();
          return $(window).simulate("focus");
        };
        return it("does not resume the draw and auto-save loop", function() {
          spyOn(canvases, 'resume');
          simulateEvent();
          return expect(canvases.resume).not.toHaveBeenCalled();
        });
      });
    });
    describe('#drawCell', function() {
      beforeEach(function() {
        spyOn(canvases, 'drawWorkingCell');
        return spyOn(canvases, 'drawPreviewCell');
      });
      it("draws the cell to the working canvas", function() {
        canvases.drawCell("cell", {
          foo: "bar"
        });
        return expect(canvases.drawWorkingCell).toHaveBeenCalledWith("cell", {
          foo: "bar"
        });
      });
      return it("draws the cell to the preview canvas", function() {
        canvases.drawCell("cell", {
          foo: "bar"
        });
        return expect(canvases.drawPreviewCell).toHaveBeenCalledWith("cell");
      });
    });
    describe('#drawWorkingCell', function() {
      var cell, ctx, prepare;
      cell = ctx = null;
      prepare = function() {
        cell = new Cell({
          canvases: canvases,
          loc: new CellLocation(canvases, 5, 3),
          color: new Color({
            red: 255,
            green: 0,
            blue: 0
          })
        });
        ctx = canvases.workingCanvas.ctx;
        return spyOn(ctx, 'fillRect');
      };
      beforeEach(function() {
        return canvases = DrawingCanvases.init(app, {
          cellSize: 10
        });
      });
      describe('when showGrid is true', function() {
        beforeEach(function() {
          canvases.showGrid = true;
          return prepare();
        });
        describe('when just given a cell', function() {
          it("fills in a section of the working canvas with the color of the cell", function() {
            var fillStyle;
            canvases.drawWorkingCell(cell);
            fillStyle = typeof JHW !== "undefined" && JHW !== null ? 'rgba(255, 0, 0, 1)' : '#ff0000';
            return expect(ctx.fillStyle).toEqual(fillStyle);
          });
          return it("separates each cell with a border", function() {
            canvases.drawWorkingCell(cell);
            return expect(ctx.fillRect).toHaveBeenCalledWith(31, 51, 9, 9);
          });
        });
        describe('when given a cell + a color', function() {
          it("fills in a section of the working canvas with the given color", function() {
            var fillStyle;
            canvases.drawWorkingCell(cell, {
              color: new Color({
                red: 0,
                green: 255,
                blue: 0
              })
            });
            fillStyle = typeof JHW !== "undefined" && JHW !== null ? 'rgba(0, 255, 0, 1)' : '#00ff00';
            return expect(ctx.fillStyle).toEqual(fillStyle);
          });
          it("also accepts color as a string", function() {
            canvases.drawWorkingCell(cell, {
              color: '#00ff00'
            });
            return expect(ctx.fillStyle).toEqual('#00ff00');
          });
          it("separates each cell with a border", function() {
            canvases.drawWorkingCell(cell, {
              color: new Color({
                red: 0,
                green: 255,
                blue: 0
              })
            });
            return expect(ctx.fillRect).toHaveBeenCalledWith(31, 51, 9, 9);
          });
          return it("does nothing if given a clear color", function() {
            canvases.drawWorkingCell(cell, {
              color: new Color()
            });
            return expect(ctx.fillRect).not.toHaveBeenCalled();
          });
        });
        return describe('when given a cell + a location', function() {
          it("fills in a section of the working canvas with the given color", function() {
            var fillStyle;
            canvases.drawWorkingCell(cell, {
              loc: new CellLocation(canvases, 10, 2)
            });
            fillStyle = typeof JHW !== "undefined" && JHW !== null ? 'rgba(255, 0, 0, 1)' : '#ff0000';
            return expect(ctx.fillStyle).toEqual(fillStyle);
          });
          return it("separates each cell with a border", function() {
            canvases.drawWorkingCell(cell, {
              loc: new CellLocation(canvases, 10, 2)
            });
            return expect(ctx.fillRect).toHaveBeenCalledWith(21, 101, 9, 9);
          });
        });
      });
      return describe('when showGrid is false', function() {
        beforeEach(function() {
          canvases.showGrid = false;
          return prepare();
        });
        describe('when just given a cell', function() {
          it("fills in a section of the working canvas with the color of the cell", function() {
            var fillStyle;
            canvases.drawWorkingCell(cell);
            fillStyle = typeof JHW !== "undefined" && JHW !== null ? 'rgba(255, 0, 0, 1)' : '#ff0000';
            return expect(ctx.fillStyle).toEqual(fillStyle);
          });
          return it("separates each cell with a border", function() {
            canvases.drawWorkingCell(cell);
            return expect(ctx.fillRect).toHaveBeenCalledWith(30, 50, 10, 10);
          });
        });
        describe('when given a cell + a color', function() {
          it("fills in a section of the working canvas with the given color", function() {
            var fillStyle;
            canvases.drawWorkingCell(cell, {
              color: new Color({
                red: 0,
                green: 255,
                blue: 0
              })
            });
            fillStyle = typeof JHW !== "undefined" && JHW !== null ? 'rgba(0, 255, 0, 1)' : '#00ff00';
            return expect(ctx.fillStyle).toEqual(fillStyle);
          });
          it("also accepts color as a string", function() {
            canvases.drawWorkingCell(cell, {
              color: '#00ff00'
            });
            return expect(ctx.fillStyle).toEqual('#00ff00');
          });
          it("separates each cell with a border", function() {
            canvases.drawWorkingCell(cell, {
              color: new Color({
                red: 0,
                green: 255,
                blue: 0
              })
            });
            return expect(ctx.fillRect).toHaveBeenCalledWith(30, 50, 10, 10);
          });
          return it("does nothing if given a clear color", function() {
            canvases.drawWorkingCell(cell, {
              color: new Color()
            });
            return expect(ctx.fillRect).not.toHaveBeenCalled();
          });
        });
        return describe('when given a cell + a location', function() {
          it("fills in a section of the working canvas with the given color", function() {
            var fillStyle;
            canvases.drawWorkingCell(cell, {
              loc: new CellLocation(canvases, 10, 2)
            });
            fillStyle = typeof JHW !== "undefined" && JHW !== null ? 'rgba(255, 0, 0, 1)' : '#ff0000';
            return expect(ctx.fillStyle).toEqual(fillStyle);
          });
          return it("separates each cell with a border", function() {
            canvases.drawWorkingCell(cell, {
              loc: new CellLocation(canvases, 10, 2)
            });
            return expect(ctx.fillRect).toHaveBeenCalledWith(20, 100, 10, 10);
          });
        });
      });
    });
    return describe('#drawPreviewCell', function() {
      var cell, imageData;
      cell = imageData = null;
      beforeEach(function() {
        var currentTool;
        cell = new Cell({
          canvases: canvases,
          loc: new CellLocation(canvases, 5, 3),
          color: new Color({
            red: 255,
            green: 0,
            blue: 0,
            alpha: 0.5
          })
        });
        currentTool = Toolset.createTool();
        app.boxes = {
          tools: {
            currentTool: function() {
              return currentTool;
            }
          }
        };
        canvases = DrawingCanvases.init(app);
        canvases.draw();
        imageData = canvases.previewCanvas.imageData;
        return spyOn(imageData, 'setPixel');
      });
      it("fills in the pixel on the preview canvas with the color of the cell", function() {
        canvases.drawPreviewCell(cell);
        return expect(imageData.setPixel).toHaveBeenCalledWith(3, 5, 255, 0, 0, 127);
      });
      return it("does nothing if the color of the cell being drawn is clear", function() {
        cell.color = new Color();
        canvases.drawPreviewCell(cell);
        return expect(imageData.setPixel).not.toHaveBeenCalled();
      });
    });
  });
}).call(this);
