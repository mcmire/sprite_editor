(function() {
  var Keyboard, Tools;
  Tools = SpriteEditor.Box.Tools;
  Keyboard = SpriteEditor.Keyboard;
  describe('Box.Tools', function() {
    var app, toolNames, toolShortcuts, tools;
    app = tools = null;
    toolNames = ["tool1", "tool2"];
    toolShortcuts = {
      tool1: "A",
      tool2: "B"
    };
    beforeEach(function() {
      return app = {
        tools: {
          toolNames: toolNames,
          toolShortcuts: toolShortcuts,
          tool1: {
            select: function() {},
            unselect: function() {}
          },
          tool2: {
            select: function() {},
            unselect: function() {}
          }
        }
      };
    });
    afterEach(function() {
      Tools.destroy();
      return tools = null;
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(Tools._bindEvents).toBeTypeOf("function");
      return expect(Tools._unbindEvents).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      it("sets @app to the given App instance", function() {
        tools = Tools.init(app);
        return expect(tools.app).toBe(app);
      });
      it("creates a container element for the box, with an h3 inside", function() {
        var $e, $h;
        tools = Tools.init(app);
        $e = tools.$element;
        $h = tools.$element.find("h3");
        expect($e).toBeElementOf("div");
        expect($e).toHaveAttr("id", "se-box-tools");
        expect($e).toHaveClass("se-box");
        expect($h).toBeElementOf("h3");
        return expect($h).toHaveContent("Toolbox");
      });
      $.v.each(toolNames, function(tool, i) {
        return it("adds an element to the container for the " + tool + " tool and stores it in @toolImages", function() {
          var e, e2;
          tools = Tools.init(app);
          e = tools.$element.find("img.tool")[i];
          e2 = tools.toolImages[tool][0];
          return expect(e).toBe(e2);
        });
      });
      return it("resets the UI elements", function() {
        spyOn(Tools, 'reset');
        tools = Tools.init(app);
        return expect(Tools.reset).toHaveBeenCalled();
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return tools = Tools.init(app);
      });
      it("clears the container element variable", function() {
        tools.destroy();
        return expect(tools.element).toBeUndefined();
      });
      it("clears the tool images", function() {
        tools.destroy();
        return expect(tools.toolImages).toEqual({});
      });
      it("clears the current tool name", function() {
        tools.destroy();
        return expect(tools.currentToolName).toBeNull();
      });
      return it("removes any events that may have been added", function() {
        spyOn(tools, 'removeEvents');
        tools.destroy();
        return expect(tools.removeEvents).toHaveBeenCalled();
      });
    });
    describe('when reset', function() {
      beforeEach(function() {
        return tools = Tools.init(app);
      });
      return it("selects the first tool", function() {
        spyOn(tools, 'select');
        tools.reset();
        return expect(tools.select).toHaveBeenCalledWith(app.tools.toolNames[0]);
      });
    });
    describe('when events have been added', function() {
      var key, name, _len, _results;
      beforeEach(function() {
        tools = Tools.init(app);
        tools.addEvents();
        return spyOn(tools, 'select');
      });
      _results = [];
      for (name = 0, _len = toolShortcuts.length; name < _len; name++) {
        key = toolShortcuts[name];
        _results.push(it("if the " + key + " key is pressed, marks the element corresponding to " + tool + " tool as selected", function() {
          specHelpers.fireNativeEvent(document, "keydown", function(evt) {
            return evt.keyCode = Keyboard["KEY_" + key];
          });
          return expect(tools.select).toHaveBeenCalledWith(name);
        }));
      }
      return _results;
    });
    describe('when events have been removed', function() {
      var key, name, _len, _results;
      beforeEach(function() {
        tools = Tools.init(app);
        tools.addEvents();
        tools.removeEvents();
        return spyOn(tools, 'select');
      });
      _results = [];
      for (name = 0, _len = toolShortcuts.length; name < _len; name++) {
        key = toolShortcuts[name];
        _results.push(it("if the " + key + " key is pressed, does nothing", function() {
          specHelpers.fireNativeEvent(document, "keydown", function(evt) {
            return evt.keyCode = Keyboard["KEY_" + key];
          });
          return expect(tools.select).not.toHaveBeenCalled();
        }));
      }
      return _results;
    });
    describe('on select', function() {
      beforeEach(function() {
        var $img, name, _ref, _results;
        tools = Tools.init(app);
        tools.currentToolName = "tool1";
        spyOn(app.tools.tool1, 'unselect');
        spyOn(app.tools.tool2, 'select');
        _ref = tools.toolImages;
        _results = [];
        for (name in _ref) {
          $img = _ref[name];
          _results.push($img.removeClass("selected"));
        }
        return _results;
      });
      it("marks the element corresponding to the given tool as selected", function() {
        var $img, name, _len, _ref, _results;
        tools.select("tool2");
        expect(tools.currentToolName).toBe("tool2");
        _ref = tools.toolImages;
        _results = [];
        for ($img = 0, _len = _ref.length; $img < _len; $img++) {
          name = _ref[$img];
          _results.push(name === "tool2" ? expect($img).toHaveClass("selected") : expect($img).not.toHaveClass("selected"));
        }
        return _results;
      });
      it("calls 'unselect' on the currently selected tool before changing it", function() {
        tools.select("tool2");
        return expect(app.tools.tool1.unselect).toHaveBeenCalled();
      });
      it("calls 'select' on the newly selected tool", function() {
        tools.select("tool2");
        return expect(app.tools.tool2.select).toHaveBeenCalled();
      });
      return it("does nothing if the given size is already selected", function() {
        var $img, name, _len, _ref, _results;
        tools.select("tool1");
        _ref = tools.toolImages;
        _results = [];
        for ($img = 0, _len = _ref.length; $img < _len; $img++) {
          name = _ref[$img];
          _results.push(expect($img).not.toHaveClass("selected"));
        }
        return _results;
      });
    });
    return describe('.currentTool', function() {
      beforeEach(function() {
        return tools = Tools.init(app);
      });
      return it("returns the tool object corresponding to the current tool", function() {
        tools.currentToolName = "tool1";
        return expect(tools.currentTool()).toEqual(app.tools.tool1);
      });
    });
  });
}).call(this);
