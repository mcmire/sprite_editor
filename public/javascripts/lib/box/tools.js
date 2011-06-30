(function() {
  $["export"]("SpriteEditor.Box.Tools", function(SpriteEditor) {
    var Keyboard, Tools;
    Keyboard = SpriteEditor.Keyboard;
    Tools = {};
    SpriteEditor.DOMEventHelpers.mixin(Tools, "SpriteEditor_Box_Tools");
    $.extend(Tools, {
      name: "Tools",
      header: "Toolbox",
      currentToolName: null,
      init: function(app) {
        var $ul, name, _fn, _i, _len, _ref;
        SpriteEditor.Box.init.call(this, app);
        $ul = $("<ul/>");
        this.$element.append($ul);
        this.toolImages = {};
        _ref = this.app.toolset.toolNames;
        _fn = function(self, name) {
          var $img, $li;
          $li = $("<li/>");
          $img = $("<img/>");
          $img.addClass("tool").attr("width", 24).attr("height", 24).attr("src", "images/" + name + ".png");
          self.toolImages[name] = $img;
          $li.append($img);
          $ul.append($li);
          return $img.bind("click", function() {
            return self.select(name);
          });
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          _fn(this, name);
        }
        this.reset();
        return this;
      },
      destroy: function() {
        SpriteEditor.Box.destroy.call(this);
        this.toolImages = {};
        this.currentToolName = null;
        return this.removeEvents();
      },
      reset: function() {
        return this.select(this.app.toolset.toolNames[0]);
      },
      addEvents: function() {
        var self;
        self = this;
        return this._bindEvents(document, {
          keydown: function(event) {
            var key, name;
            key = event.keyCode;
            if (name = self.app.toolset.toolShortcuts[key]) {
              return self.select(name);
            }
          }
        });
      },
      removeEvents: function() {
        return this._unbindEvents(document, "keydown");
      },
      select: function(name) {
        var _base, _base2;
        if (name === this.currentToolName) {
          return;
        }
        if (this.currentToolName) {
          if (typeof (_base = this.currentTool()).unselect === "function") {
            _base.unselect();
          }
          this.toolImages[this.currentToolName].removeClass("selected");
        }
        this.currentToolName = name;
        this.toolImages[name].addClass("selected");
        return typeof (_base2 = this.app.toolset.tools[name]).select === "function" ? _base2.select() : void 0;
      },
      currentTool: function() {
        return this.app.toolset.tools[this.currentToolName];
      }
    });
    return Tools;
  });
}).call(this);
