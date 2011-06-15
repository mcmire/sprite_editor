(($, undefined_) ->
  Eventable = 
    actions: {}
    recordEvent: (method) ->
      self = this
      self.app.history.recordEvent self, method
    
    addAction: (name, routines) ->
      self = this
      self.actions[name] = routines
  
  $.export "SpriteEditor.Eventable", Eventable
) window.ender
