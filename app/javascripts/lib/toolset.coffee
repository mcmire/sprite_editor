$.export "SpriteEditor.Toolset", (SpriteEditor) ->

  {Keyboard} = SpriteEditor

  Toolset =
    toolNames: []
    toolShortcuts: {}
    tools: {}

    BaseTool: $.extend({}, SpriteEditor.Eventable,
      init: (@app, @canvases) ->
      trigger: (name, args...) ->
        @[name]?.apply(this, args)
    )

    init: (@app, @canvases) ->
      tool.init(app, canvases) for name, tool of @tools
      return this

    destroy: ->
      # TODO..........

    createTool: ->
      $.extend({}, @BaseTool)

    addTool: (name, shortcut, def) ->
      tool = @createTool()
      def = def(tool) if typeof def is "function"
      @tools[name] = $.extend(tool, def)
      @toolNames.push(name)
      @toolShortcuts[shortcut] = name

  return Toolset