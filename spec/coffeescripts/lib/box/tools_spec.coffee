Tools    = SpriteEditor.Box.Tools
Keyboard = SpriteEditor.Keyboard

describe 'Box.Tools', ->
  app = tools = null
  toolNames = ["tool1", "tool2"]
  toolShortcuts = {
    tool1: "A",
    tool2: "B"
  }

  beforeEach ->
    app = {
      toolset: {
        toolNames: -> toolNames,
        toolShortcuts: toolShortcuts,
        tools: {
          tool1: {
            select: ->
            unselect: ->
          },
          tool2: {
            select: ->
            unselect: ->
          }
        }
      }
    }

  afterEach ->
    Tools.destroy()
    tools = null

  it "responds to _bindEvents and _unbindEvents", ->
    expect(Tools._bindEvents).toBeTypeOf("function")
    expect(Tools._unbindEvents).toBeTypeOf("function")

  describe 'when initialized', ->
    it "sets @app to the given App instance", ->
      tools = Tools.init(app)
      expect(tools.app).toBe(app)

    it "creates a container element for the box, with an h3 inside", ->
      tools = Tools.init(app)
      $e = tools.$element
      $h = tools.$element.find("h3")

      expect($e).toBeElementOf("div")
      expect($e).toHaveAttr("id", "se-box-tools")
      expect($e).toHaveClass("se-box")

      expect($h).toBeElementOf("h3")
      expect($h).toHaveContent("Toolbox")

    #for tool, i in app.toolset.toolNames
    $.v.each toolNames, (tool, i) ->
      it "adds an element to the container for the #{tool} tool and stores it in @toolImages", ->
        tools = Tools.init(app)
        e = tools.$element.find("img.tool")[i]
        e2 = tools.toolImages[tool][0]
        expect(e).toBe(e2)

    it "resets the UI elements", ->
      spyOn(Tools, 'reset')
      tools = Tools.init(app)
      expect(Tools.reset).toHaveBeenCalled()

  describe 'when destroyed', ->
    beforeEach ->
      tools = Tools.init(app)

    it "clears the container element variable", ->
      tools.destroy()
      expect(tools.element).toBeUndefined()

    it "clears the tool images", ->
      tools.destroy()
      expect(tools.toolImages).toEqual({})

    it "clears the current tool name", ->
      tools.destroy()
      expect(tools.currentToolName).toBeNull()

    it "removes any events that may have been added", ->
      spyOn(tools, 'removeEvents')
      tools.destroy()
      expect(tools.removeEvents).toHaveBeenCalled()

  describe 'when reset', ->
    beforeEach ->
      tools = Tools.init(app)

    it "selects the first tool", ->
      spyOn(tools, 'select')
      tools.reset()
      expect(tools.select).toHaveBeenCalledWith(app.toolset.toolNames()[0])

  describe 'when events have been added', ->
    beforeEach ->
      tools = Tools.init(app)
      tools.addEvents()
      spyOn(tools, 'select')

    for key, name in toolShortcuts
      it "if the #{key} key is pressed, marks the element corresponding to #{tool} tool as selected", ->
        specHelpers.fireNativeEvent document, "keydown", (evt) -> evt.keyCode = Keyboard["KEY_#{key}"]
        expect(tools.select).toHaveBeenCalledWith(name)

  describe 'when events have been removed', ->
    beforeEach ->
      tools = Tools.init(app)
      tools.addEvents()
      tools.removeEvents()
      spyOn(tools, 'select')

    for key, name in toolShortcuts
      it "if the #{key} key is pressed, does nothing", ->
        specHelpers.fireNativeEvent document, "keydown", (evt) -> evt.keyCode = Keyboard["KEY_#{key}"]
        expect(tools.select).not.toHaveBeenCalled()

  describe 'on select', ->
    beforeEach ->
      tools = Tools.init(app)
      tools.currentToolName = "tool1"
      spyOn(app.toolset.tools.tool1, 'unselect')
      spyOn(app.toolset.tools.tool2, 'select')
      $img.removeClass("selected") for name, $img of tools.toolImages

    it "marks the element corresponding to the given tool as selected", ->
      tools.select("tool2")
      expect(tools.currentToolName).toBe("tool2")
      for name, $img in tools.toolImages
        if name == "tool2"
          expect($img).toHaveClass("selected")
        else
          expect($img).not.toHaveClass("selected")

    it "calls 'unselect' on the currently selected tool before changing it", ->
      tools.select("tool2")
      expect(app.toolset.tools.tool1.unselect).toHaveBeenCalled()

    it "calls 'select' on the newly selected tool", ->
      tools.select("tool2")
      expect(app.toolset.tools.tool2.select).toHaveBeenCalled()

    it "does nothing if the given size is already selected", ->
      tools.select("tool1")
      for name, $img in tools.toolImages
        expect($img).not.toHaveClass("selected")

  describe '.currentTool', ->
    beforeEach ->
      tools = Tools.init(app)

    it "returns the tool object corresponding to the current tool", ->
      tools.currentToolName = "tool1"
      expect(tools.currentTool()).toEqual(app.toolset.tools.tool1)
