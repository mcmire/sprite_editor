Keyboard = SpriteEditor.Keyboard

describe 'Keyboard', ->
  kb = null

  afterEach ->
    Keyboard.destroy()

  it "responds to _bindEvents and _unbindEvents", ->
    expect(Keyboard._bindEvents).toBeTypeOf("function")
    expect(Keyboard._unbindEvents).toBeTypeOf("function")

  describe 'when initialized', ->
    describe 'if not initialized yet', ->
      it "resets key variables", ->
        spyOn(Keyboard, 'reset')
        Keyboard.init()
        expect(Keyboard.reset).toHaveBeenCalled()

      it "sets @isInitialized to true", ->
        kb = Keyboard.init()
        expect(kb.isInitialized).toBeTruthy()

    describe 'if already initialized', ->
      beforeEach ->
        Keyboard.init()

      it "resets key variables", ->
        spyOn(Keyboard, 'reset')
        Keyboard.init()
        expect(Keyboard.reset).not.toHaveBeenCalled()

  describe 'when destroyed', ->
    beforeEach ->
      kb = Keyboard.init()

    describe 'if not destroyed yet', ->
      it "removes any events that may have been added", ->
        spyOn(kb, 'removeEvents')
        kb.destroy()
        expect(kb.removeEvents).toHaveBeenCalled()

      it "sets @isInitialized to false", ->
        kb.destroy()
        expect(kb.isInitialized).toBeFalsy()

    describe 'if already destroyed', ->
      beforeEach ->
        Keyboard.destroy()

      it "does not try to remove events", ->
        spyOn(kb, 'removeEvents')
        kb.destroy()
        expect(kb.removeEvents).not.toHaveBeenCalled()

  describe 'when events have been added', ->
    beforeEach ->
      kb = Keyboard.init()

    describe 'when a key is pressed', ->
      it "adds the pressed key to @pressedKeys", ->
        kb.addEvents()
        $(document).simulate "keydown", keyCode: 9
        expect(kb.pressedKeys).toHaveProperty(9)

    describe 'when a key is lifted', ->
      it "removes the pressed key from @pressedKeys", ->
        kb.addEvents()
        $(document).simulate "keyup", keyCode: 9
        expect(kb.pressedKeys).not.toHaveProperty(9)

    describe 'when the window loses focus', ->
      it "resets the pressedKeys hash", ->
        kb.addEvents()
        $(window).simulate "blur"
        expect(kb.pressedKeys).toEqual({})

  describe 'when events have been removed', ->
    beforeEach ->
      kb = Keyboard.init()
      kb.addEvents()

    describe 'when a key is pressed', ->
      it "does nothing", ->
        kb.removeEvents()
        $(document).simulate "keydown", keyCode: 9
        expect(kb.pressedKeys).toEqual({})

    describe 'when a key is lifted', ->
      it "does nothing", ->
        kb.removeEvents()
        $(document).simulate "keyup", keyCode: 9
        expect(kb.pressedKeys).toEqual({})

    describe 'when the window loses focus', ->
      it "does nothing", ->
        kb.removeEvents()
        $(window).simulate "blur"
        expect(kb.pressedKeys).toEqual({})

  describe 'when reset', ->
    beforeEach ->
      kb = Keyboard.init()

    it "resets @pressedKeys", ->
      kb.pressedKeys = "something"
      kb.reset()
      expect(kb.pressedKeys).toEqual({})

  describe '#modifierKeyPressed', ->
    beforeEach ->
      kb = Keyboard.init()

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