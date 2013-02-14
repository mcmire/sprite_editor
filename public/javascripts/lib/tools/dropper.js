(function() {
  var Keyboard, Toolset;

  Keyboard = SpriteEditor.Keyboard, Toolset = SpriteEditor.Toolset;

  Toolset.addTool("dropper", "Q", {
    select: function() {
      return this.canvases.workingCanvas.$element.addClass("dropper");
    },
    unselect: function() {
      return this.canvases.workingCanvas.$element.removeClass("dropper");
    },
    mousedown: function(event) {
      return this.app.boxes.colors.update(this.canvases.focusedCell.color.clone());
    }
  });

}).call(this);
