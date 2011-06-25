Keyboard = SpriteEditor.Keyboard

describe 'Keyboard', ->
  kb = null
  beforeEach -> kb = Keyboard.init()

  createEvent = (type) ->
    evt = document.createEvent("HTMLEvents")
    evt.initEvent(type, true, true)
    evt

  describe 'when initialized', ->
    it "initializes @pressedKeys", ->
      expect(kb.pressedKeys).toEqual({})

    describe 'on document keydown', ->
      it "adds the pressed key to @pressedKeys", ->
        evt = createEvent("keydown")
        evt.keyCode = 9
        document.dispatchEvent(evt)
        expect(kb.pressedKeys).toHaveProperty(9)

    describe 'on document keyup', ->
      it "removes the pressed key from @pressedKeys", ->
        evt = createEvent("keyup")
        evt.keyCode = 9
        document.dispatchEvent(evt)
        expect(kb.pressedKeys).not.toHaveProperty(9)

    describe 'on window blur', ->
      it "resets the pressedKeys hash", ->
        evt = createEvent("blur")
        window.dispatchEvent(evt)
        expect(kb.pressedKeys).toEqual({})

  describe 'when destroyed', ->
    beforeEach -> kb.destroy()

    describe 'on document keydown', ->
      it "does not add the pressed key to @pressedKeys", ->
        evt = createEvent("keydown")
        evt.keyCode = 9
        document.dispatchEvent(evt)
        expect(kb.pressedKeys).toEqual({})

    describe 'on document keyup', ->
      it "does not remove the pressed key from @pressedKeys", ->
        evt = createEvent("keyup")
        evt.keyCode = 9
        document.dispatchEvent(evt)
        expect(kb.pressedKeys).toEqual({})

    describe 'on window blur', ->
      it "does not reset the pressedKeys hash", ->
        evt = createEvent("blur")
        window.dispatchEvent(evt)
        expect(kb.pressedKeys).toEqual({})

  describe '#modifierKeyPressed', ->
    it "returns true if given an event, we detect that a modifier key (shift, alt, ctrl, or meta) was pressed", ->
      res = kb.modifierKeyPressed(
        shiftKey: true
        altKey: false
        ctrlKey: false
        metaKey: false
      )
      expect(res).toBeTruthy()

      res = kb.modifierKeyPressed(
        shiftKey: false
        altKey: true
        ctrlKey: false
        metaKey: false
      )
      expect(res).toBeTruthy()

      res = kb.modifierKeyPressed(
        shiftKey: false
        altKey: false
        ctrlKey: true
        metaKey: false
      )
      expect(res).toBeTruthy()

      res = kb.modifierKeyPressed(
        shiftKey: false
        altKey: false
        ctrlKey: false
        metaKey: true
      )
      expect(res).toBeTruthy()

    it "returns false if given an event, a modifier key was not pressed", ->
      res = kb.modifierKeyPressed(
        shiftKey: false
        altKey: false
        ctrlKey: false
        metaKey: false
      )
      expect(res).toBeFalsy()