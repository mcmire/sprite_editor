(function() {
  var Color, Colors, Keyboard;

  Colors = SpriteEditor.Box.Colors;

  Keyboard = SpriteEditor.Keyboard;

  Color = SpriteEditor.Color;

  describe('Box.Colors', function() {
    var app, colors;
    app = colors = null;
    beforeEach(function() {
      return app = {
        colorPicker: {}
      };
    });
    afterEach(function() {
      Colors.destroy();
      return colors = null;
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(Colors._bindEvents).toBeTypeOf("function");
      return expect(Colors._unbindEvents).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      it("sets @app to the given App instance", function() {
        colors = Colors.init(app);
        return expect(colors.app).toBe(app);
      });
      it("creates a container element for the box, with an h3 inside", function() {
        var $e, $h;
        colors = Colors.init(app);
        $e = colors.$element;
        $h = colors.$element.find("h3");
        expect($e[0].nodeName).toEqual("DIV");
        expect($e[0].id).toEqual("se-box-colors");
        expect($e[0].className).toMatch(/\bse-box\b/);
        expect($h[0].nodeName).toEqual("H3");
        return expect($h.html()).toEqual("Colors");
      });
      it("adds a div to the container for the foreground color sample, and stores it in colorSampleDivs", function() {
        var $e, $e2;
        colors = Colors.init(app);
        $e = colors.$element.find('div.color_sample:nth-of-type(1)');
        $e2 = colors.colorSampleDivs.foreground;
        return expect($e[0]).toBe($e2[0]);
      });
      it("renders the foreground color sample", function() {
        var $e;
        colors = Colors.init(app);
        $e = colors.colorSampleDivs.foreground;
        return expect($e.css('background-color')).not.toBeNull();
      });
      it("adds a div to the container for the background color sample, and stores it in colorSampleDivs", function() {
        var $e, $e2;
        colors = Colors.init(app);
        $e = colors.$element.find('div.color_sample:nth-of-type(2)');
        $e2 = colors.colorSampleDivs.background;
        return expect($e[0]).toBe($e2[0]);
      });
      it("renders the background color sample", function() {
        var $e;
        colors = Colors.init(app);
        $e = colors.colorSampleDivs.background;
        return expect($e.css('background-color')).not.toBeNull();
      });
      return it("resets the UI", function() {
        spyOn(Colors, 'reset').andCallThrough();
        colors = Colors.init(app);
        return expect(Colors.reset).toHaveBeenCalled();
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return colors = Colors.init(app);
      });
      it("clears the container element variable", function() {
        colors.destroy();
        return expect(colors.element).toBeUndefined();
      });
      it("clears the color sample divs", function() {
        colors.destroy();
        return expect(colors.colorSampleDivs).toEqual({});
      });
      it("clears the current color type", function() {
        colors.destroy();
        return expect(colors.currentColorType).toBeNull();
      });
      it("clears the current colors", function() {
        colors.destroy();
        return expect(colors.currentColors).toEqual({});
      });
      return it("removes any events that may have been added", function() {
        spyOn(colors, 'removeEvents');
        colors.destroy();
        return expect(colors.removeEvents).toHaveBeenCalled();
      });
    });
    describe('when reset', function() {
      beforeEach(function() {
        return colors = Colors.init(app);
      });
      it("sets the foreground color to a predetermined value", function() {
        return expect(colors.currentColors.foreground).toEqualColor(new Color({
          red: 172,
          green: 85,
          blue: 255
        }));
      });
      it("sets the background color to a predetermined value", function() {
        return expect(colors.currentColors.background).toEqualColor(new Color({
          red: 255,
          green: 38,
          blue: 192
        }));
      });
      return it("marks the foreground color sample as selected", function() {
        var $bg, $fg;
        expect(colors.currentColorType).toEqual("foreground");
        $fg = colors.colorSampleDivs.foreground;
        expect($fg).toHaveClass("selected");
        $bg = colors.colorSampleDivs.background;
        return expect($bg).not.toHaveClass("selected");
      });
    });
    describe('when events have been added', function() {
      beforeEach(function() {
        colors = Colors.init(app);
        return colors.addEvents();
      });
      describe('if X is pressed', function() {
        beforeEach(function() {
          return specHelpers.fireNativeEvent(document, "keydown", function(evt) {
            return evt.keyCode = Keyboard.X_KEY;
          });
        });
        it("switches the foreground and background colors", function() {
          expect(colors.currentColors.foreground).toEqualColor(new Color({
            red: 255,
            green: 38,
            blue: 192
          }));
          return expect(colors.currentColors.background).toEqualColor(new Color({
            red: 172,
            green: 85,
            blue: 255
          }));
        });
        it("redraws the foreground color sample with the new foreground color", function() {
          var $fg;
          $fg = colors.colorSampleDivs.foreground;
          return expect($fg).toHaveCss("background-color", "rgb(255, 38, 192)");
        });
        return it("redraws the background color sample with the new background color", function() {
          var $bg;
          $bg = colors.colorSampleDivs.background;
          return expect($bg).toHaveCss("background-color", "rgb(172, 85, 255)");
        });
      });
      describe('if shift is pressed', function() {
        beforeEach(function() {
          return specHelpers.fireNativeEvent(document, "keydown", function(evt) {
            return evt.keyCode = Keyboard.SHIFT_KEY;
          });
        });
        return it("marks the background color sample as selected", function() {
          var $bg, $fg;
          expect(colors.currentColorType).toEqual("background");
          $fg = colors.colorSampleDivs.foreground;
          expect($fg).not.toHaveClass("selected");
          $bg = colors.colorSampleDivs.background;
          return expect($bg).toHaveClass("selected");
        });
      });
      return describe('if a key is lifted', function() {
        beforeEach(function() {
          return specHelpers.fireNativeEvent(document, "keyup");
        });
        return it("marks the foreground color sample as selected", function() {
          var $bg, $fg;
          expect(colors.currentColorType).toEqual("foreground");
          $fg = colors.colorSampleDivs.foreground;
          expect($fg).toHaveClass("selected");
          $bg = colors.colorSampleDivs.background;
          return expect($bg).not.toHaveClass("selected");
        });
      });
    });
    describe('when events have been removed', function() {
      beforeEach(function() {
        colors = Colors.init(app);
        colors.addEvents();
        return colors.removeEvents();
      });
      describe('if X is pressed', function() {
        beforeEach(function() {
          return specHelpers.fireNativeEvent(document, "keydown", function(evt) {
            return evt.keyCode = Keyboard.X_KEY;
          });
        });
        it("doesn't switch the foreground and background colors", function() {
          expect(colors.currentColors.foreground).toEqualColor(new Color({
            red: 172,
            green: 85,
            blue: 255
          }));
          return expect(colors.currentColors.background).toEqualColor(new Color({
            red: 255,
            green: 38,
            blue: 192
          }));
        });
        it("keeps the foreground color sample the same", function() {
          var $fg;
          $fg = colors.colorSampleDivs.foreground;
          return expect($fg).toHaveCss("background-color", "rgb(172, 85, 255)");
        });
        return it("keeps the background color sample the same", function() {
          var $bg;
          $bg = colors.colorSampleDivs.background;
          return expect($bg).toHaveCss("background-color", "rgb(255, 38, 192)");
        });
      });
      describe('if shift is pressed', function() {
        beforeEach(function() {
          return specHelpers.fireNativeEvent(document, "keydown", function(evt) {
            return evt.keyCode = Keyboard.SHIFT_KEY;
          });
        });
        return it("doesn't mark the background color sample as selected", function() {
          var $bg, $fg;
          expect(colors.currentColorType).toEqual("foreground");
          $fg = colors.colorSampleDivs.foreground;
          expect($fg).toHaveClass("selected");
          $bg = colors.colorSampleDivs.background;
          return expect($bg).not.toHaveClass("selected");
        });
      });
      return describe('if a key is lifted', function() {
        beforeEach(function() {
          return specHelpers.fireNativeEvent(document, "keyup");
        });
        return it("keeps the selected color sample as the foreground color sample", function() {
          var $bg, $fg;
          expect(colors.currentColorType).toEqual("foreground");
          $fg = colors.colorSampleDivs.foreground;
          expect($fg).toHaveClass("selected");
          $bg = colors.colorSampleDivs.background;
          return expect($bg).not.toHaveClass("selected");
        });
      });
    });
    describe('the foreground color sample', function() {
      var color;
      color = null;
      beforeEach(function() {
        colors = Colors.init(app);
        return color = colors.currentColors.foreground = new Color({
          red: 255,
          green: 0,
          blue: 0
        });
      });
      describe('on click', function() {
        return it("opens the color picker set to the current foreground color", function() {
          var $fg;
          app.colorPicker.open = jasmine.createSpy();
          $fg = colors.colorSampleDivs.foreground;
          specHelpers.fireNativeEvent($fg[0], 'click');
          return expect(app.colorPicker.open).toHaveBeenCalledWith(color, "foreground");
        });
      });
      return describe('on render', function() {
        return it("draws the foreground color sample with the current foreground color", function() {
          var $fg;
          $fg = colors.colorSampleDivs.foreground;
          specHelpers.fireCustomEvent($fg[0], 'render');
          return expect($fg).toHaveCss("background-color", "rgb(255, 0, 0)");
        });
      });
    });
    describe('the background color sample', function() {
      var color;
      color = null;
      beforeEach(function() {
        colors = Colors.init(app);
        return color = colors.currentColors.background = new Color({
          red: 255,
          green: 0,
          blue: 0
        });
      });
      describe('on click', function() {
        return it("opens the color picker set to the current background color", function() {
          var $bg;
          app.colorPicker.open = jasmine.createSpy();
          $bg = colors.colorSampleDivs.background;
          specHelpers.fireNativeEvent($bg[0], 'click');
          return expect(app.colorPicker.open).toHaveBeenCalledWith(color, "background");
        });
      });
      return describe('on render', function() {
        return it("draws the background color sample with the current background color", function() {
          var $bg;
          $bg = colors.colorSampleDivs.background;
          specHelpers.fireCustomEvent($bg[0], 'render');
          return expect($bg).toHaveCss("background-color", "rgb(255, 0, 0)");
        });
      });
    });
    describe('on update', function() {
      var color;
      color = null;
      beforeEach(function() {
        colors = Colors.init(app);
        return color = new Color({
          red: 255,
          green: 0,
          blue: 0
        });
      });
      describe('when the foreground color is selected', function() {
        beforeEach(function() {
          return colors.currentColorType = "foreground";
        });
        it("sets the foreground color to the given color", function() {
          colors.update(color);
          return expect(colors.currentColors.foreground).toBe(color);
        });
        return it("redraws the foreground color sample with the new color", function() {
          var $fg;
          $fg = colors.colorSampleDivs.foreground;
          spyOn($fg, "trigger");
          colors.update(color);
          return expect($fg.trigger).toHaveBeenCalledWith("render");
        });
      });
      return describe('when the background color is selected', function() {
        beforeEach(function() {
          return colors.currentColorType = "background";
        });
        it("sets the background color to the given color", function() {
          colors.update(color);
          return expect(colors.currentColors.background).toBe(color);
        });
        return it("redraws the background color sample with the new color", function() {
          var $bg;
          $bg = colors.colorSampleDivs.background;
          spyOn($bg, "trigger");
          colors.update(color);
          return expect($bg.trigger).toHaveBeenCalledWith("render");
        });
      });
    });
    return describe('.currentColor', function() {
      beforeEach(function() {
        return colors = Colors.init(app);
      });
      it("returns the foreground color when the foreground color is selected", function() {
        colors.currentColorType = "foreground";
        colors.currentColors.foreground = new Color({
          red: 255,
          green: 0,
          blue: 0
        });
        return expect(colors.currentColor()).toEqualColor(new Color({
          red: 255,
          green: 0,
          blue: 0
        }));
      });
      return it("returns the background color when the background color is selected", function() {
        colors.currentColorType = "background";
        colors.currentColors.background = new Color({
          red: 255,
          green: 0,
          blue: 0
        });
        return expect(colors.currentColor()).toEqualColor(new Color({
          red: 255,
          green: 0,
          blue: 0
        }));
      });
    });
  });

}).call(this);
