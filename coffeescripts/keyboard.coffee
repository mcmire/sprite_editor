((window, document, $, undefined_) ->
  Keyboard = 
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
      $(document).bind 
        "keydown.Keyboard": (event) ->
          self.pressedKeys[event.keyCode] = true
        
        "keyup.Keyboard": (event) ->
          delete self.pressedKeys[event.keyCode]
      
      $(window).bind "blur.Keyboard": (event) ->
        self.pressedKeys = {}
    
    destroy: ->
      self = this
      $(document).unbind "keydown.Keyboard", "keyup.Keyboard"
      $(window).unbind "blur.Keyboard"
    
    modifierKeyPressed: (event) ->
      event.shiftKey or event.ctrlKey or event.altKey or event.metaKey
  
  Keyboard.modifierKeys = [ Keyboard.SHIFT_KEY, Keyboard.CTRL_KEY, Keyboard.ALT_KEY, Keyboard.META_KEY ]
  $.export "SpriteEditor.Keyboard", Keyboard
) window, window.document, window.ender
