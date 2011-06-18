(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.Boxes.Tools", function(SpriteEditor) {
    var Tools;
    return Tools = {
      init: function(app) {
        var $header, $ul;
        this.app = app;
        this.$element = $("<div/>").attr("id", "tool_box").addClass("box");
        $header = $("<h3/>").html("Toolbox");
        this.$element.append($header);
        $ul = $("<ul/>");
        this.$element.append($ul);
        this.$imgs = $([]);
        $.v.each(this.tools.toolNames, function(name) {
          var $img, $li;
          $li = $("<li/>");
          $img = $("<img/>");
          $img.addClass("tool").attr("width", 24).attr("height", 24).attr("src", "images/" + name + ".png");
          $imgs.push($img[0]);
          $li.append($img);
          $ul.append($li);
          return $img.bind("click", __bind(function() {
            return this.select(name);
          }, this));
        });
        return this.select(this.currentToolName);
      },
      currentTool: function() {
        return this.tools[this.currentToolName];
      },
      select: function(name) {
        var _base, _base2;
        if (name !== this.currentToolName) {
          if (typeof (_base = this.currentTool()).unselect === "function") {
            _base.unselect();
          }
        }
        this.currentToolName = name;
        $imgs.removeClass("selected");
        $img.addClass("selected");
        return typeof (_base2 = self.tools[name]).select === "function" ? _base2.select() : void 0;
      }
    };
  });
}).call(this);
