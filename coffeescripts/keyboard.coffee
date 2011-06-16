$.export "SpriteEditor.Keyboard", do ->

  Keyboard = {}
  SpriteEditor.DOMEventHelpers.mixin(Keyboard, "SpriteEditor_Keyboard")

  $.extend Keyboard,
    TAB_KEY: 9
    ESC_KEY: 27
    SHIFT_KEY: 16
    CTRL_KEY: 17
    ALT_KEY: 18
    META_KEY: 91
    X_KEY: 88
    Z_KEY: 90

    pressedKeys: {}

    init: ->
      self = this

      @_bindEvents document,
        keydown: (event) ->
          self.pressedKeys[event.keyCode] = true
        keyup: (event) ->
          delete self.pressedKeys[event.keyCode]

      @_bindEvents window,
        blur: (event) ->
          self.pressedKeys = {}

    destroy: ->
      @_unbindEvents document, "keydown", "keyup"
      @_unbindEvents window, "blur"

    modifierKeyPressed: (event) ->
      event.shiftKey or event.ctrlKey or event.altKey or event.metaKey

  Keyboard.modifierKeys =
    Keyboard.SHIFT_KEY
    Keyboard.CTRL_KEY
    Keyboard.ALT_KEY
    Keyboard.META_KEY

  return Keyboard