(function() {
  var Keyboard, Sizes;
  Sizes = SpriteEditor.Box.Sizes;
  Keyboard = SpriteEditor.Keyboard;
  describe('Box.Sizes', function() {
    var app, sizes;
    app = sizes = null;
    beforeEach(function() {
      return app = {
        canvases: {
          cellSize: 30
        }
      };
    });
    afterEach(function() {
      Sizes.destroy();
      return sizes = null;
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(Sizes._bindEvents).toBeTypeOf("function");
      return expect(Sizes._unbindEvents).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      it("sets @app to the given App instance", function() {
        sizes = Sizes.init(app);
        return expect(sizes.app).toBe(app);
      });
      it("creates a container element for the box, with an h3 inside", function() {
        var $e, $h;
        sizes = Sizes.init(app);
        $e = sizes.$element;
        $h = sizes.$element.find("h3");
        expect($e[0].nodeName).toEqual("DIV");
        expect($e[0].id).toEqual("se-box-sizes");
        expect($e[0].className).toMatch(/\bse-box\b/);
        expect($h[0].nodeName).toEqual("H3");
        return expect($h.html()).toEqual("Sizes");
      });
      it("adds a canvas element to the container for size 1 and stores it in @sizeGrids", function() {
        var $e, $e2;
        sizes = Sizes.init(app);
        $e = sizes.$element.find('canvas:nth-of-type(1)');
        $e2 = sizes.sizeGrids[1];
        return expect($e[0]).toBe($e2[0]);
      });
      it("adds a canvas element to the container for size 2 and stores it in @sizeGrids", function() {
        var $e, $e2;
        sizes = Sizes.init(app);
        $e = sizes.$element.find('canvas:nth-of-type(2)');
        $e2 = sizes.sizeGrids[2];
        return expect($e[0]).toBe($e2[0]);
      });
      it("adds a canvas element to the container for size 3 and stores it in @sizeGrids", function() {
        var $e, $e2;
        sizes = Sizes.init(app);
        $e = sizes.$element.find('canvas:nth-of-type(3)');
        $e2 = sizes.sizeGrids[3];
        return expect($e[0]).toBe($e2[0]);
      });
      it("adds a canvas element to the container for size 4 and stores it in @sizeGrids", function() {
        var $e, $e2;
        sizes = Sizes.init(app);
        $e = sizes.$element.find('canvas:nth-of-type(4)');
        $e2 = sizes.sizeGrids[4];
        return expect($e[0]).toBe($e2[0]);
      });
      return it("resets the UI elements", function() {
        spyOn(Sizes, 'reset');
        sizes = Sizes.init(app);
        return expect(Sizes.reset).toHaveBeenCalled();
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return sizes = Sizes.init(app);
      });
      it("clears the container element variable", function() {
        sizes.destroy();
        return expect(sizes.element).toBeUndefined();
      });
      it("clears the current size", function() {
        sizes.destroy();
        return expect(sizes.currentSize).toBeNull();
      });
      return it("removes any events that may have been added", function() {
        spyOn(sizes, 'removeEvents');
        sizes.destroy();
        return expect(sizes.removeEvents).toHaveBeenCalled();
      });
    });
    describe('when reset', function() {
      beforeEach(function() {
        return sizes = Sizes.init(app);
      });
      return it("selects the first size", function() {
        spyOn(sizes, 'select');
        sizes.reset();
        return expect(sizes.select).toHaveBeenCalledWith(1);
      });
    });
    describe('when events have been added', function() {
      var size, _i, _len, _ref, _results;
      beforeEach(function() {
        sizes = Sizes.init(app);
        sizes.addEvents();
        return spyOn(sizes, 'select');
      });
      _ref = Sizes.sizes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        size = _ref[_i];
        _results.push(it("if the " + size + " key is pressed, marks the element corresponding to the size as selected", function() {
          specHelpers.fireNativeEvent(document, "keydown", function(evt) {
            return evt.keyCode = Keyboard["KEY_" + size];
          });
          return expect(sizes.select).toHaveBeenCalledWith(size);
        }));
      }
      return _results;
    });
    describe('when events have been removed', function() {
      var size, _i, _len, _ref, _results;
      beforeEach(function() {
        sizes = Sizes.init(app);
        sizes.addEvents();
        sizes.removeEvents();
        return spyOn(sizes, 'select');
      });
      _ref = Sizes.sizes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        size = _ref[_i];
        _results.push(it("if the " + size + " key is pressed, does nothing", function() {
          specHelpers.fireNativeEvent(document, "keydown", function(evt) {
            return evt.keyCode = Keyboard["KEY_" + size];
          });
          return expect(sizes.select).not.toHaveBeenCalled();
        }));
      }
      return _results;
    });
    return describe('on select', function() {
      beforeEach(function() {
        var $grid, size, _ref, _results;
        sizes = Sizes.init(app);
        sizes.currentSize = 3;
        _ref = sizes.sizeGrids;
        _results = [];
        for (size in _ref) {
          $grid = _ref[size];
          _results.push($grid.removeClass("selected"));
        }
        return _results;
      });
      it("marks the element corresponding to the given size as selected", function() {
        var $grid, size, _len, _ref, _results;
        sizes.select(1);
        expect(sizes.currentSize).toBe(1);
        _ref = sizes.sizeGrids;
        _results = [];
        for ($grid = 0, _len = _ref.length; $grid < _len; $grid++) {
          size = _ref[$grid];
          _results.push(size === 1 ? expect($grid).toHaveClass("selected") : expect($grid).not.toHaveClass("selected"));
        }
        return _results;
      });
      return it("does nothing if the given size is already selected", function() {
        var $grid, size, _len, _ref, _results;
        sizes.select(3);
        _ref = sizes.sizeGrids;
        _results = [];
        for ($grid = 0, _len = _ref.length; $grid < _len; $grid++) {
          size = _ref[$grid];
          _results.push(expect($grid).not.toHaveClass("selected"));
        }
        return _results;
      });
    });
  });
}).call(this);
