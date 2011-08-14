(function() {
  var Cell, Color, Toolset;
  Color = SpriteEditor.Color, Cell = SpriteEditor.Cell, Toolset = SpriteEditor.Toolset;
  describe('The dropper tool', function() {
    var app, canvases, tool;
    canvases = app = tool = null;
    beforeEach(function() {
      canvases = {};
      app = {
        canvases: canvases
      };
      Toolset.init(app, canvases);
      return tool = Toolset.tools.dropper.init(app, canvases);
    });
    afterEach(function() {
      Toolset.destroy();
      return tool.destroy();
    });
    describe('when selected', function() {
      return it("adds the dropper class to the working canvas", function() {
        var $div;
        $div = $('<div />');
        canvases.workingCanvas = {
          $element: $div
        };
        tool.select();
        return expect($div).toHaveClass("dropper");
      });
    });
    describe('when deselected', function() {
      return it("removes the dropper class from the working canvas", function() {
        var $div;
        $div = $('<div />').addClass("dropper");
        canvases.workingCanvas = {
          $element: $div
        };
        tool.unselect();
        return expect($div).not.toHaveClass("dropper");
      });
    });
    return describe('#mousedown', function() {
      var currentColor, newColor;
      newColor = null;
      currentColor = new Color({
        hue: 100,
        sat: 50,
        lum: 30
      });
      beforeEach(function() {
        app.boxes = {
          colors: {
            update: function(color) {
              return newColor = color;
            }
          }
        };
        spyOn(app.boxes.colors, 'update').andCallThrough();
        canvases.focusedCell = new Cell(app, 1, 2);
        return canvases.focusedCell.color = currentColor;
      });
      it("handles updating the current editor color with a the color of the clicked cell", function() {
        tool.mousedown();
        return expect(app.boxes.colors.update).toHaveBeenCalledWith(new Color({
          hue: 100,
          sat: 50,
          lum: 30
        }));
      });
      return it("sends a copy of the color", function() {
        tool.mousedown();
        newColor.sat = 89;
        return expect(currentColor.sat).toBe(50);
      });
    });
  });
}).call(this);
