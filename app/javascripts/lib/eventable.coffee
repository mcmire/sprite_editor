$.export "SpriteEditor.Eventable",

  actions: {}

  recordEvent: (method) ->
    @app.history.recordEvent(this, method)

  addAction: (name, routines) ->
    @actions[name] = routines
