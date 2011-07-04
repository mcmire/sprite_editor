(function() {
  var App, Box, ColorPicker, DrawingCanvases, EventHistory, Keyboard, Toolset;
  Keyboard = SpriteEditor.Keyboard, DrawingCanvases = SpriteEditor.DrawingCanvases, Toolset = SpriteEditor.Toolset, EventHistory = SpriteEditor.EventHistory, ColorPicker = SpriteEditor.ColorPicker, Box = SpriteEditor.Box, App = SpriteEditor.App;
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
        $('#sandbox').append(app.$container);
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
    return describe('#hook', function() {
      beforeEach(function() {
        return app = initApp();
      });
      return it("adds the container to the given element", function() {
        var $body, $sandbox;
        app.hook('#sandbox');
        $body = $(document.body);
        $sandbox = $('#sandbox');
        expect($sandbox.find('div:first-child')).toBeElement(app.$container);
        expect($body.find('#mask')).toBeElement(app.$maskDiv);
        return expect($body).toContainElement(app.colorPicker.$container);
      });
    });
  });
}).call(this);
