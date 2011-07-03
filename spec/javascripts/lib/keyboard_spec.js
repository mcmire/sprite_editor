(function() {
  var Keyboard;
  Keyboard = SpriteEditor.Keyboard;
  describe('Keyboard', function() {
    var kb;
    kb = null;
    afterEach(function() {
      return Keyboard.destroy();
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(Keyboard._bindEvents).toBeTypeOf("function");
      return expect(Keyboard._unbindEvents).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      describe('if not initialized yet', function() {
        it("resets key variables", function() {
          spyOn(Keyboard, 'reset');
          Keyboard.init();
          return expect(Keyboard.reset).toHaveBeenCalled();
        });
        return it("sets @isInitialized to true", function() {
          kb = Keyboard.init();
          return expect(kb.isInitialized).toBeTruthy();
        });
      });
      return describe('if already initialized', function() {
        beforeEach(function() {
          return Keyboard.init();
        });
        return it("resets key variables", function() {
          spyOn(Keyboard, 'reset');
          Keyboard.init();
          return expect(Keyboard.reset).not.toHaveBeenCalled();
        });
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return kb = Keyboard.init();
      });
      describe('if not destroyed yet', function() {
        it("removes any events that may have been added", function() {
          spyOn(kb, 'removeEvents');
          kb.destroy();
          return expect(kb.removeEvents).toHaveBeenCalled();
        });
        return it("sets @isInitialized to false", function() {
          kb.destroy();
          return expect(kb.isInitialized).toBeFalsy();
        });
      });
      return describe('if already destroyed', function() {
        beforeEach(function() {
          return Keyboard.destroy();
        });
        return it("does not try to remove events", function() {
          spyOn(kb, 'removeEvents');
          kb.destroy();
          return expect(kb.removeEvents).not.toHaveBeenCalled();
        });
      });
    });
    describe('when events have been added', function() {
      beforeEach(function() {
        return kb = Keyboard.init();
      });
      describe('when a key is pressed', function() {
        return it("adds the pressed key to @pressedKeys", function() {
          kb.addEvents();
          $(document).simulate("keydown", {
            keyCode: 9
          });
          return expect(kb.pressedKeys).toHaveProperty(9);
        });
      });
      describe('when a key is lifted', function() {
        return it("removes the pressed key from @pressedKeys", function() {
          kb.addEvents();
          $(document).simulate("keyup", {
            keyCode: 9
          });
          return expect(kb.pressedKeys).not.toHaveProperty(9);
        });
      });
      return describe('when the window loses focus', function() {
        return it("resets the pressedKeys hash", function() {
          kb.addEvents();
          $(window).simulate("blur");
          return expect(kb.pressedKeys).toEqual({});
        });
      });
    });
    describe('when events have been removed', function() {
      beforeEach(function() {
        kb = Keyboard.init();
        return kb.addEvents();
      });
      describe('when a key is pressed', function() {
        return it("does nothing", function() {
          kb.removeEvents();
          $(document).simulate("keydown", {
            keyCode: 9
          });
          return expect(kb.pressedKeys).toEqual({});
        });
      });
      describe('when a key is lifted', function() {
        return it("does nothing", function() {
          kb.removeEvents();
          $(document).simulate("keyup", {
            keyCode: 9
          });
          return expect(kb.pressedKeys).toEqual({});
        });
      });
      return describe('when the window loses focus', function() {
        return it("does nothing", function() {
          kb.removeEvents();
          $(window).simulate("blur");
          return expect(kb.pressedKeys).toEqual({});
        });
      });
    });
    describe('when reset', function() {
      beforeEach(function() {
        return kb = Keyboard.init();
      });
      return it("resets @pressedKeys", function() {
        kb.pressedKeys = "something";
        kb.reset();
        return expect(kb.pressedKeys).toEqual({});
      });
    });
    return describe('#modifierKeyPressed', function() {
      beforeEach(function() {
        return kb = Keyboard.init();
      });
      it("returns true if given an event, we detect that a modifier key (shift, alt, ctrl, or meta) was pressed", function() {
        var res;
        res = kb.modifierKeyPressed({
          shiftKey: true,
          altKey: false,
          ctrlKey: false,
          metaKey: false
        });
        expect(res).toBeTruthy();
        res = kb.modifierKeyPressed({
          shiftKey: false,
          altKey: true,
          ctrlKey: false,
          metaKey: false
        });
        expect(res).toBeTruthy();
        res = kb.modifierKeyPressed({
          shiftKey: false,
          altKey: false,
          ctrlKey: true,
          metaKey: false
        });
        expect(res).toBeTruthy();
        res = kb.modifierKeyPressed({
          shiftKey: false,
          altKey: false,
          ctrlKey: false,
          metaKey: true
        });
        return expect(res).toBeTruthy();
      });
      return it("returns false if given an event, a modifier key was not pressed", function() {
        var res;
        res = kb.modifierKeyPressed({
          shiftKey: false,
          altKey: false,
          ctrlKey: false,
          metaKey: false
        });
        return expect(res).toBeFalsy();
      });
    });
  });
}).call(this);
