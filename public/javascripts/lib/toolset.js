(function() {
  var __slice = Array.prototype.slice;
  $["export"]("SpriteEditor.Toolset", function(SpriteEditor) {
    var Keyboard, Toolset;
    Keyboard = SpriteEditor.Keyboard;
    Toolset = {
      toolNames: [],
      toolShortcuts: {},
      tools: {},
      BaseTool: $.extend({}, SpriteEditor.Eventable, {
        init: function(app, canvases) {
          this.app = app;
          this.canvases = canvases;
        },
        trigger: function() {
          var args, name, _ref;
          name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          return (_ref = this[name]) != null ? _ref.apply(this, args) : void 0;
        }
      }),
      init: function(app, canvases) {
        var name, tool, _ref;
        this.app = app;
        this.canvases = canvases;
        _ref = this.tools;
        for (name in _ref) {
          tool = _ref[name];
          tool.init(app, canvases);
        }
        return this;
      },
      destroy: function() {},
      createTool: function() {
        return $.extend({}, this.BaseTool);
      },
      addTool: function(name, shortcut, def) {
        var tool;
        tool = this.createTool();
        if (typeof def === "function") {
          def = def(tool);
        }
        this.tools[name] = $.extend(tool, def);
        return this.toolShortcuts[shortcut] = name;
      },
      toolNames: function() {
        return $.v.keys(this.tools);
      }
    };
    return Toolset;
  });
}).call(this);
