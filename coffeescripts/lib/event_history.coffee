$.export "SpriteEditor.EventHistory",

  events: []
  currentEvent: null
  currentIndex: -1

  init: (app) ->
    @app = app

  recordEvent: (obj, method) ->
    action = obj.actions[method]
    event = action.do()
    # Limit history to 100 events
    @events.shift() if @events.length == 100
    # If the user just performed an undo, all future history which was
    # saved is now gone - POOF!
    nextIndex = @currentIndex + 1
    @events.length = nextIndex
    @events[nextIndex] =
      object: obj
      method: method
      action: action
      event: event
    @currentIndex++

  undo: ->
    e = @events[@currentIndex]
    e.action.undo(e.event)
    @currentIndex--

  canUndo: ->
    @currentIndex > -1

  redo: ->
    e = @events[@currentIndex + 1]
    e.action.redo(e.event)
    @currentIndex++

  canRedo: ->
    @currentIndex < @events.length - 1