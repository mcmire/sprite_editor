(function() {
  var Keyboard;
  Keyboard = SpriteEditor.Keyboard;
  describe('Keyboard', function() {
    var kb;
    kb = null;
    beforeEach(function() {
      return kb = Keyboard.init();
    });
    describe('when initialized', function() {
      it("initializes @pressedKeys", function() {
        return expect(kb.pressedKeys).toEqual({});
      });
      it("when a key is pressed, adds the pressed key to @pressedKeys", function() {
        specHelpers.fireNativeEvent(document, "keydown", function(evt) {
          return evt.keyCode = 9;
        });
        return expect(kb.pressedKeys).toHaveProperty(9);
      });
      it("when a key is lifted, removes the pressed key from @pressedKeys", function() {
        specHelpers.fireNativeEvent(document, "keyup", function(evt) {
          return evt.keyCode = 9;
        });
        return expect(kb.pressedKeys).not.toHaveProperty(9);
      });
      return it("when the window loses focus, resets the pressedKeys hash", function() {
        specHelpers.fireNativeEvent(window, "blur");
        return expect(kb.pressedKeys).toEqual({});
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return kb.destroy();
      });
      it("when a key is pressed, does nothing", function() {
        specHelpers.fireNativeEvent(document, "keydown", function(evt) {
          return evt.keyCode = 9;
        });
        return expect(kb.pressedKeys).toEqual({});
      });
      it("when a key is lifted, does nothing", function() {
        specHelpers.fireNativeEvent(document, "keyup", function(evt) {
          return evt.keyCode = 9;
        });
        return expect(kb.pressedKeys).toEqual({});
      });
      return it("when the window loses focus, does nothing", function() {
        specHelpers.fireNativeEvent(window, "blur");
        return expect(kb.pressedKeys).toEqual({});
      });
    });
    return describe('#modifierKeyPressed', function() {
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
