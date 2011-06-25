Keyboard = SpriteEditor.Keyboard

describe 'Keyboard', ->
  kb = null
  beforeEach -> kb = Keyboard.init()

  describe 'when initialized', ->
    it "initializes @pressedKeys", ->
      expect(kb.pressedKeys).toEqual({})

    it "when a key is pressed, adds the pressed key to @pressedKeys", ->
      specHelpers.fireEvent document, "keydown", (evt) -> evt.keyCode = 9
      expect(kb.pressedKeys).toHaveProperty(9)

    it "when a key is lifted, removes the pressed key from @pressedKeys", ->
      specHelpers.fireEvent document, "keyup", (evt) -> evt.keyCode = 9
      expect(kb.pressedKeys).not.toHaveProperty(9)

    it "when the window loses focus, resets the pressedKeys hash", ->
      specHelpers.fireEvent window, "blur"
      expect(kb.pressedKeys).toEqual({})

  describe 'when destroyed', ->
    beforeEach -> kb.destroy()

    it "when a key is pressed, does nothing", ->
      specHelpers.fireEvent document, "keydown", (evt) -> evt.keyCode = 9
      expect(kb.pressedKeys).toEqual({})

    it "when a key is lifted, does nothing", ->
      specHelpers.fireEvent document, "keyup", (evt) -> evt.keyCode = 9
      expect(kb.pressedKeys).toEqual({})

    it "when the window loses focus, does nothing", ->
      specHelpers.fireEvent window, "blur"
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