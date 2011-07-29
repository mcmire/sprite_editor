(function() {
  var App, Box, ColorPicker, DrawingCanvases, ElementMouseTracker, EventHistory, Keyboard, Toolset;
  Keyboard = SpriteEditor.Keyboard, ElementMouseTracker = SpriteEditor.ElementMouseTracker, DrawingCanvases = SpriteEditor.DrawingCanvases, Toolset = SpriteEditor.Toolset, EventHistory = SpriteEditor.EventHistory, ColorPicker = SpriteEditor.ColorPicker, Box = SpriteEditor.Box, App = SpriteEditor.App;
  describe('App', function() {
    var app, initApp;
    app = null;
    initApp = function() {
      var cp;
      spyOn(DrawingCanvases, 'init').andCallThrough();
      spyOn(Toolset, 'init').andCallThrough();
      spyOn(EventHistory, 'init').andCallThrough();
      cp = {
        "$container": $('<div />')
      };
      spyOn(ColorPicker, 'init').andReturn(cp);
      return App.init();
    };
    beforeEach(function() {
      return spyOn(DrawingCanvases, 'draw');
    });
    afterEach(function() {
      return App.destroy();
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(App._bindEvents).toBeTypeOf("function");
      return expect(App._unbindEvents).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      var initAppWithSandbox;
      initAppWithSandbox = function() {
        app = initApp();
        $sandbox.append(app.$container);
        return app;
      };
      return describe('when not initialized yet', function() {
        it("resets key variables", function() {
          spyOn(App, 'reset').andCallThrough();
          app = initAppWithSandbox();
          return expect(App.reset).toHaveBeenCalled();
        });
        it("initializes the Keyboard", function() {
          spyOn(Keyboard, 'init').andCallThrough();
          app = initAppWithSandbox();
          return expect(Keyboard.init).toHaveBeenCalled();
        });
        it("initializes the ElementMouseTracker", function() {
          spyOn(ElementMouseTracker, 'init').andCallThrough();
          app = initAppWithSandbox();
          return expect(ElementMouseTracker.init).toHaveBeenCalled();
        });
        it("initializes the drawing canvases and stores them in @canvases", function() {
          app = initAppWithSandbox();
          return expect(app.canvases).toBe();
        });
        it("initializes the toolset and stores it in @toolset", function() {
          app = initAppWithSandbox();
          return expect(app.toolset).toBe();
        });
        it("initializes the history and stores it in @history", function() {
          app = initAppWithSandbox();
          return expect(app.history).toBe();
        });
        it("creates a div which will house all of the UI elements", function() {
          app = initAppWithSandbox();
          return expect(app.$container).toBeElementOf("div");
        });
        it("creates a div for the content mask (which appears when the color picker is opened)", function() {
          app = initAppWithSandbox();
          return expect(app.$maskDiv).toBeElementOf("div");
        });
        it("creates divs for the left content and adds it to the container element", function() {
          app = initAppWithSandbox();
          return expect(app.$container.find('div#left_pane')).toBeElement(app.$leftPane);
        });
        it("creates a div for the center content and adds it to the container element", function() {
          app = initAppWithSandbox();
          return expect(app.$container.find('div#center_pane')).toBeElement(app.$centerPane);
        });
        it("creates a div for the right content and adds it to the container element", function() {
          app = initAppWithSandbox();
          return expect(app.$container.find('div#right_pane')).toBeElement(app.$rightPane);
        });
        it("creates a div to hold the import/export buttons and adds it to the center pane", function() {
          var $exportDiv, $importDiv;
          app = initAppWithSandbox();
          $importDiv = app.$centerPane.find('div#import');
          $exportDiv = app.$centerPane.find('form#export');
          expect($importDiv[0]).toBe();
          expect($exportDiv[0]).toBe();
          expect($importDiv).toContainElement('input[type=file]');
          expect($importDiv).toContainElement('button', {
            content: 'Import PNG'
          });
          return expect($exportDiv).toContainElement('button', {
            content: 'Export PNG'
          });
        });
        it("adds the working canvas to the container", function() {
          app = initAppWithSandbox();
          return expect(app.$centerPane.find('canvas')).toBeElement(app.canvases.workingCanvas.$element);
        });
        it("initializes and adds the tools box to the left pane", function() {
          app = initAppWithSandbox();
          expect(app.boxes.tools).toBe();
          return expect(app.$leftPane).toContainElement('#' + Box.Tools.containerId);
        });
        it("initializes and adds the brush sizes box to the left pane", function() {
          app = initAppWithSandbox();
          expect(app.boxes.sizes).toBe();
          return expect(app.$leftPane).toContainElement('#' + Box.Sizes.containerId);
        });
        it("initializes and adds the colors box to the right pane", function() {
          app = initAppWithSandbox();
          return expect(app.$rightPane).toContainElement('#' + Box.Colors.containerId);
        });
        it("also initializes the color picker widget (although it doesn't attach it anywhere just yet)", function() {
          app = initAppWithSandbox();
          return expect(app.colorPicker).toBe();
        });
        return it("initializes and adds the preview box to the right pane", function() {
          var $previewBox;
          app = initAppWithSandbox();
          $previewBox = app.$rightPane.find('#preview_box');
          expect($previewBox[0]).toBe();
          expect($previewBox.find('canvas:nth-of-type(1)')).toBeElement(app.canvases.previewCanvas.$element);
          return expect($previewBox.find('canvas:nth-of-type(2)')).toBeElement(app.canvases.tiledPreviewCanvas.$element);
        });
      });
    });
    describe('#hook', function() {
      beforeEach(function() {
        return app = initApp();
      });
      it("adds the container to the given element", function() {
        app.hook($sandbox);
        return expect($sandbox.find('div:first-child')).toBeElement(app.$container);
      });
      return it("adds the mask and the color picker to the body", function() {
        var $body, mask1, mask2;
        app.hook($sandbox);
        $body = $(document.body);
        mask1 = $body.find('#mask')[0];
        mask2 = app.$maskDiv[0];
        expect(mask1).toBe(mask2);
        return expect($body).toContainElement(app.colorPicker.$container);
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return app = initApp();
      });
      describe('if not destroyed yet', function() {
        it("removes any events that may have been added", function() {
          spyOn(app, 'removeEvents');
          app.destroy();
          return expect(app.removeEvents).toHaveBeenCalled();
        });
        it("un-initializes the Keyboard module", function() {
          spyOn(Keyboard, 'destroy');
          app.destroy();
          return expect(Keyboard.destroy).toHaveBeenCalled();
        });
        it("un-initializes the drawing canvases", function() {
          spyOn(DrawingCanvases, 'destroy');
          app.destroy();
          return expect(DrawingCanvases.destroy).toHaveBeenCalled();
        });
        it("doesn't blow up if @canvases is null", function() {
          app.canvases = null;
          return expect(function() {
            return app.destroy();
          }).not.toThrowAnything();
        });
        it("un-initializes the toolset", function() {
          spyOn(Toolset, 'destroy');
          app.destroy();
          return expect(Toolset.destroy).toHaveBeenCalled();
        });
        it("doesn't blow up if @toolset is null", function() {
          app.toolset = null;
          return expect(function() {
            return app.destroy();
          }).not.toThrowAnything();
        });
        it("un-initializes the event history", function() {
          spyOn(EventHistory, 'destroy');
          app.destroy();
          return expect(EventHistory.destroy).toHaveBeenCalled();
        });
        it("doesn't blow up if @history is null", function() {
          app.history = null;
          return expect(function() {
            return app.destroy();
          }).not.toThrowAnything();
        });
        it("resets key variables", function() {
          spyOn(app, 'reset');
          app.destroy();
          return expect(app.reset).toHaveBeenCalled();
        });
        return it("sets @isInitialized to false", function() {
          app.destroy();
          return expect(app.isInitialized).toBeFalsy();
        });
      });
      return describe('if already destroyed', function() {
        beforeEach(function() {
          return app.destroy();
        });
        it("doesn't try to remove events", function() {
          spyOn(app, 'removeEvents');
          app.destroy();
          return expect(app.removeEvents).not.toHaveBeenCalled();
        });
        it("doesn't try to un-initialize the Keyboard module", function() {
          spyOn(Keyboard, 'destroy');
          app.destroy();
          return expect(Keyboard.destroy).not.toHaveBeenCalled();
        });
        it("doesn't try to un-initialize the drawing canvases", function() {
          spyOn(DrawingCanvases, 'destroy');
          app.destroy();
          return expect(DrawingCanvases.destroy).not.toHaveBeenCalled();
        });
        it("doesn't try to un-initialize the toolset", function() {
          spyOn(Toolset, 'destroy');
          app.destroy();
          return expect(Toolset.destroy).not.toHaveBeenCalled();
        });
        it("doesn't try to un-initialize the event history", function() {
          spyOn(EventHistory, 'destroy');
          app.destroy();
          return expect(EventHistory.destroy).not.toHaveBeenCalled();
        });
        return it("doesn't reset key variables", function() {
          spyOn(app, 'reset');
          app.destroy();
          return expect(app.reset).not.toHaveBeenCalled();
        });
      });
    });
    describe('when reset', function() {
      beforeEach(function() {
        return app = initApp();
      });
      it("resets @canvases", function() {
        app.canvases = "something";
        app.reset();
        return expect(app.canvases).not.toBe();
      });
      it("resets @toolset", function() {
        app.toolset = "something";
        app.reset();
        return expect(app.toolset).not.toBe();
      });
      it("resets @history", function() {
        app.history = "something";
        app.reset();
        return expect(app.history).not.toBe();
      });
      it("resets @boxes", function() {
        app.boxes = "something";
        app.reset();
        return expect(app.boxes).toEqual({});
      });
      it("removes the container from the document, if it's present", function() {
        app.$container.appendTo($sandbox);
        app.reset();
        return expect($sandbox).not.toContainElement('#container');
      });
      it("resets @$container", function() {
        app.reset();
        return expect(app.$container).not.toBe();
      });
      it("resets @$leftPane", function() {
        app.$leftPane = "something";
        app.reset();
        return expect(app.$leftPane).not.toBe();
      });
      it("resets @$centerPane", function() {
        app.$centerPane = "something";
        app.reset();
        return expect(app.$centerPane).not.toBe();
      });
      it("resets @$rightPane", function() {
        app.$rightPane = "something";
        app.reset();
        return expect(app.$rightPane).not.toBe();
      });
      it("removes the mask from the body, if it's present", function() {
        app.$maskDiv.appendTo($sandbox);
        app.reset();
        return expect($sandbox).not.toContainElement('#mask');
      });
      it("resets @$maskDiv", function() {
        app.reset();
        return expect(app.$maskDiv).not.toBe();
      });
      it("removes the color picker container from the body, if it's present", function() {
        var $elem, id;
        $elem = app.colorPicker.$container;
        id = $elem.attr("id");
        $elem.appendTo($sandbox);
        app.reset();
        return expect($sandbox).not.toContainElement("#" + id);
      });
      return it("resets @colorPicker", function() {
        app.reset();
        return expect(app.colorPicker).not.toBe();
      });
    });
    describe('when events have been added', function() {
      var currentTool;
      currentTool = null;
      beforeEach(function() {
        app = initApp();
        currentTool = Toolset.createTool();
        return spyOn(app.boxes.tools, 'currentTool').andReturn(currentTool);
      });
      it("adds keyboard events", function() {
        spyOn(Keyboard, 'addEvents');
        app.addEvents();
        return expect(Keyboard.addEvents).toHaveBeenCalled();
      });
      it("adds mouse tracker events", function() {
        spyOn(ElementMouseTracker, 'addEvents');
        app.addEvents();
        return expect(ElementMouseTracker.addEvents).toHaveBeenCalled();
      });
      it("adds canvas events", function() {
        spyOn(DrawingCanvases, 'addEvents');
        app.addEvents();
        return expect(DrawingCanvases.addEvents).toHaveBeenCalled();
      });
      it("adds tools box events", function() {
        spyOn(Box.Tools, 'addEvents');
        app.addEvents();
        return expect(Box.Tools.addEvents).toHaveBeenCalled();
      });
      it("adds sizes box events", function() {
        spyOn(Box.Sizes, 'addEvents');
        app.addEvents();
        return expect(Box.Sizes.addEvents).toHaveBeenCalled();
      });
      it("adds colors box events", function() {
        spyOn(Box.Colors, 'addEvents');
        app.addEvents();
        return expect(Box.Colors.addEvents).toHaveBeenCalled();
      });
      describe('when Ctrl-Z is pressed', function() {
        return it("undoes the last action", function() {
          app.addEvents();
          spyOn(app.history, 'undo');
          $(document).simulate("keydown", {
            keyCode: Keyboard.Z_KEY,
            ctrlKey: true
          });
          return expect(app.history.undo).toHaveBeenCalled();
        });
      });
      describe('when Cmd-Z is pressed', function() {
        return it("undoes the last action", function() {
          app.addEvents();
          spyOn(app.history, 'undo');
          $(document).simulate("keydown", {
            keyCode: Keyboard.Z_KEY,
            metaKey: true
          });
          return expect(app.history.undo).toHaveBeenCalled();
        });
      });
      describe('when Ctrl-Shift-Z is pressed', function() {
        return it("redoes the last action", function() {
          app.addEvents();
          spyOn(app.history, 'redo');
          $(document).simulate("keydown", {
            keyCode: Keyboard.Z_KEY,
            ctrlKey: true,
            shiftKey: true
          });
          return expect(app.history.redo).toHaveBeenCalled();
        });
      });
      describe('when Cmd-Shift-Z is pressed', function() {
        return it("redoes the last action", function() {
          app.addEvents();
          spyOn(app.history, 'redo');
          $(document).simulate("keydown", {
            keyCode: Keyboard.Z_KEY,
            metaKey: true,
            shiftKey: true
          });
          return expect(app.history.redo).toHaveBeenCalled();
        });
      });
      describe('when a key is pressed', function() {
        return it("calls a possible keydown event on the current tool", function() {
          app.addEvents();
          currentTool.keydown = function() {};
          spyOn(currentTool, 'keydown');
          $(document).simulate("keydown");
          return expect(currentTool.keydown).toHaveBeenCalled();
        });
      });
      return describe('when a key is lifted', function() {
        return it("calls a possible keyup event on the current tool", function() {
          app.addEvents();
          currentTool.keyup = function() {};
          spyOn(currentTool, 'keyup');
          $(document).simulate("keyup");
          return expect(currentTool.keyup).toHaveBeenCalled();
        });
      });
    });
    return describe('when events have been removed', function() {
      var currentTool;
      currentTool = null;
      beforeEach(function() {
        app = initApp();
        app.addEvents();
        currentTool = Toolset.createTool();
        return spyOn(app.boxes.tools, 'currentTool').andReturn(currentTool);
      });
      it("removes keyboard events", function() {
        spyOn(Keyboard, 'removeEvents');
        app.removeEvents();
        return expect(Keyboard.removeEvents).toHaveBeenCalled();
      });
      it("removes canvas events", function() {
        spyOn(DrawingCanvases, 'removeEvents');
        app.removeEvents();
        return expect(DrawingCanvases.removeEvents).toHaveBeenCalled();
      });
      it("removes tools box events", function() {
        spyOn(Box.Tools, 'removeEvents');
        app.removeEvents();
        return expect(Box.Tools.removeEvents).toHaveBeenCalled();
      });
      it("removes sizes box events", function() {
        spyOn(Box.Sizes, 'removeEvents');
        app.removeEvents();
        return expect(Box.Sizes.removeEvents).toHaveBeenCalled();
      });
      it("removes colors box events", function() {
        spyOn(Box.Colors, 'removeEvents');
        app.removeEvents();
        return expect(Box.Colors.removeEvents).toHaveBeenCalled();
      });
      describe('when Ctrl-Z is pressed', function() {
        return it("doesn't undo the last action", function() {
          app.removeEvents();
          spyOn(app.history, 'undo');
          $(document).simulate("keydown", {
            keyCode: Keyboard.Z_KEY,
            ctrlKey: true
          });
          return expect(app.history.undo).not.toHaveBeenCalled();
        });
      });
      describe('when Cmd-Z is pressed', function() {
        return it("doesn't undo the last action", function() {
          app.removeEvents();
          spyOn(app.history, 'undo');
          $(document).simulate("keydown", {
            keyCode: Keyboard.Z_KEY,
            metaKey: true
          });
          return expect(app.history.undo).not.toHaveBeenCalled();
        });
      });
      describe('when Ctrl-Shift-Z is pressed', function() {
        return it("doesn't redo the last action", function() {
          app.removeEvents();
          spyOn(app.history, 'redo');
          $(document).simulate("keydown", {
            keyCode: Keyboard.Z_KEY,
            ctrlKey: true,
            shiftKey: true
          });
          return expect(app.history.redo).not.toHaveBeenCalled();
        });
      });
      describe('when Cmd-Shift-Z is pressed', function() {
        return it("doesn't redo the last action", function() {
          app.removeEvents();
          spyOn(app.history, 'redo');
          $(document).simulate("keydown", {
            keyCode: Keyboard.Z_KEY,
            metaKey: true,
            shiftKey: true
          });
          return expect(app.history.redo).not.toHaveBeenCalled();
        });
      });
      describe('when a key is pressed', function() {
        return it("doesn't call a keydown event on the current tool", function() {
          app.removeEvents();
          currentTool.keydown = function() {};
          spyOn(currentTool, 'keydown');
          $(document).simulate("keydown");
          return expect(currentTool.keydown).not.toHaveBeenCalled();
        });
      });
      return describe('when a key is lifted', function() {
        return it("doesn't call a keyup event on the current tool", function() {
          app.removeEvents();
          currentTool.keyup = function() {};
          spyOn(currentTool, 'keyup');
          $(document).simulate("keyup");
          return expect(currentTool.keyup).not.toHaveBeenCalled();
        });
      });
    });
  });
}).call(this);
