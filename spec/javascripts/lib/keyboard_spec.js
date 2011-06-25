(function() {
  var Keyboard;
  Keyboard = SpriteEditor.Keyboard;
  describe('Keyboard', function() {
    var createEvent, kb;
    kb = null;
    beforeEach(function() {
      return kb = Keyboard.init();
    });
    createEvent = function(type) {
      var evt;
      evt = document.createEvent("HTMLEvents");
      evt.initEvent(type, true, true);
      return evt;
    };
    describe('when initialized', function() {
      it("initializes @pressedKeys", function() {
        return expect(kb.pressedKeys).toEqual({});
      });
      describe('on document keydown', function() {
        return it("adds the pressed key to @pressedKeys", function() {
          var evt;
          evt = createEvent("keydown");
          evt.keyCode = 9;
          document.dispatchEvent(evt);
          return expect(kb.pressedKeys).toHaveProperty(9);
        });
      });
      describe('on document keyup', function() {
        return it("removes the pressed key from @pressedKeys", function() {
          var evt;
          evt = createEvent("keyup");
          evt.keyCode = 9;
          document.dispatchEvent(evt);
          return expect(kb.pressedKeys).not.toHaveProperty(9);
        });
      });
      return describe('on window blur', function() {
        return it("resets the pressedKeys hash", function() {
          var evt;
          evt = createEvent("blur");
          window.dispatchEvent(evt);
          return expect(kb.pressedKeys).toEqual({});
        });
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return kb.destroy();
      });
      describe('on document keydown', function() {
        return it("does not add the pressed key to @pressedKeys", function() {
          var evt;
          evt = createEvent("keydown");
          evt.keyCode = 9;
          document.dispatchEvent(evt);
          return expect(kb.pressedKeys).toEqual({});
        });
      });
      describe('on document keyup', function() {
        return it("does not remove the pressed key from @pressedKeys", function() {
          var evt;
          evt = createEvent("keyup");
          evt.keyCode = 9;
          document.dispatchEvent(evt);
          return expect(kb.pressedKeys).toEqual({});
        });
      });
      return describe('on window blur', function() {
        return it("does not reset the pressedKeys hash", function() {
          var evt;
          evt = createEvent("blur");
          window.dispatchEvent(evt);
          return expect(kb.pressedKeys).toEqual({});
        });
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
