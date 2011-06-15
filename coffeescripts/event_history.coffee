(($, undefined_) ->
  EventHistory = 
    events: []
    currentEvent: null
    currentIndex: -1
    init: (app) ->
      self = this
      self.app = app
      self
    
    recordEvent: (obj, method) ->
      self = this
      action = obj.actions[method]
      event = action["do"]()
      self.events.shift()  if self.events.length == 100
      nextIndex = self.currentIndex + 1
      self.events.length = nextIndex
      self.events[nextIndex] = 
        object: obj
        method: method
        action: action
        event: event
      
      self.currentIndex++
    
    undo: ->
      self = this
      e = self.events[self.currentIndex]
      e.action.undo e.event
      self.currentIndex--
    
    canUndo: ->
      self = this
      self.currentIndex > -1
    
    redo: ->
      self = this
      e = self.events[self.currentIndex + 1]
      e.action.redo e.event
      self.currentIndex++
    
    canRedo: ->
      self = this
      self.currentIndex < self.events.length - 1
  
  $.export "SpriteEditor.EventHistory", EventHistory
) window.ender
