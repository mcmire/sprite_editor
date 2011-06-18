(function() {
  $["export"]("SpriteEditor.Box.Tools", function(SpriteEditor) {
    var Tools;
    return Tools = {
      name: "Tools",
      header: "Toolbox",
      currentToolName: null,
      init: function(app) {
        var $ul, name, self, _fn, _i, _len, _ref;
        self = this;
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
          this.toolImages[name] = $img;
          $li.append($img);
          $ul.append($li);
          return $img.bind("click", function() {
            return self.select(name);
          });
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          _fn(self, name);
        }
        this.select(this.app.tools.toolNames[0]);
        return this;
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
    };
  });
}).call(this);
