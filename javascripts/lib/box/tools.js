(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
        _ref = this.app.tools.toolNames;
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
        this.select(this.app.tools.toolNames[0]);
        return this;
      },
      addEvents: function() {
        return this._bindEvents(document, {
          keydown: __bind(function(event) {
            var key;
            key = event.keyCode;
            switch (key) {
              case Keyboard.E_KEY:
                return this.select("pencil");
              case Keyboard.G_KEY:
                return this.select("bucket");
              case Keyboard.S_KEY:
                return this.select("select");
              case Keyboard.Q_KEY:
                return this.select("dropper");
            }
          }, this)
        });
      },
      removeEvents: function() {
        return this._unbindEvents(document, "keydown");
      },
      currentTool: function() {
        return this.app.tools[this.currentToolName];
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
        return typeof (_base2 = this.app.tools[name]).select === "function" ? _base2.select() : void 0;
      }
    });
    return Tools;
  });
}).call(this);
