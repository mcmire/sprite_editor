$.export "SpriteEditor.EventHistory",

  init: (app) ->
    @app = app
    @reset()
    return this

  reset: ->
    @events = []
    @currentEvent = null
    @currentIndex = -1

  recordEvent: (obj, method) ->
    action = obj.actions[method]
    data = action.do()
    # Limit history to 100 events
    if @events.length == 100
      @events.shift()
      @currentIndex = 99
    else
      @currentIndex++
      # If the user just performed an undo, all future history which was
      # saved is now gone - POOF!
      @events.length = @currentIndex
    @events[@currentIndex] = {
      object: obj
      method: method
      action: action
      data: data
    }

  undo: ->
    if @currentIndex > -1
      e = @events[@currentIndex]
      e.action.undo(e.data)
      @currentIndex--

  redo: ->
    if @currentIndex < @events.length - 1
      e = @events[@currentIndex + 1]
      e.action.redo(e.data)
      @currentIndex++