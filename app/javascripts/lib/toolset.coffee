$.export "SpriteEditor.Toolset", (SpriteEditor) ->

  {Keyboard} = SpriteEditor

  Toolset =
    toolNames: []
    toolShortcuts: {}
    tools: {}

    BaseTool: $.extend({}, SpriteEditor.Eventable,
      init: (@app, @canvases) ->
        unless @isInitialized
          @reset()
          @isInitialized = true
        return this

      destroy: ->
        if @isInitialized
          @reset()
          @isInitialized = false
        return this

      reset: ->
        # ...

      trigger: (name, args...) ->
        @[name]?.apply(this, args)
    )

    init: (@app, @canvases) ->
      tool.init(app, canvases) for name, tool of @tools
      return this

    destroy: ->
      tool.destroy() for name, tool of @tools
      return this

    createTool: ->
      $.extend({}, @BaseTool)

    addTool: (name, shortcut, def) ->
      tool = @createTool()
      def = def(tool) if typeof def is "function"
      @tools[name] = $.extend(tool, def)
      #@toolNames.push(name)
      @toolShortcuts[shortcut] = name

    toolNames: ->
      $.v.keys(@tools)

  return Toolset
