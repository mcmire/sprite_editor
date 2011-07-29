{Keyboard, ElementMouseTracker, DrawingCanvases, Toolset, EventHistory, ColorPicker, Box, App} = SpriteEditor

describe 'App', ->
  app = null

  initApp = ->
    spyOn(DrawingCanvases, 'init').andCallThrough()
    spyOn(Toolset, 'init').andCallThrough()
    spyOn(EventHistory, 'init').andCallThrough()
    # Stub this as it takes a really, really long time to initialize the color picker
    cp = { "$container": $('<div />') }
    spyOn(ColorPicker, 'init').andReturn(cp)
    App.init()

  beforeEach ->
    # always stub this as we don't need stuff to be drawing unnecessarily
    spyOn(DrawingCanvases, 'draw')

  afterEach ->
    App.destroy()

  it "responds to _bindEvents and _unbindEvents", ->
    expect(App._bindEvents).toBeTypeOf("function")
    expect(App._unbindEvents).toBeTypeOf("function")

  describe 'when initialized', ->
    initAppWithSandbox = ->
      app = initApp()
      # make the container exist in the document so any find's that take place will work
      $sandbox.append(app.$container)
      app

    describe 'when not initialized yet', ->
      it "resets key variables", ->
        spyOn(App, 'reset').andCallThrough()
        app = initAppWithSandbox()
        expect(App.reset).toHaveBeenCalled()

      it "initializes the Keyboard", ->
        spyOn(Keyboard, 'init').andCallThrough()
        app = initAppWithSandbox()
        expect(Keyboard.init).toHaveBeenCalled()

      it "initializes the ElementMouseTracker", ->
        spyOn(ElementMouseTracker, 'init').andCallThrough()
        app = initAppWithSandbox()
        expect(ElementMouseTracker.init).toHaveBeenCalled()

      it "initializes the drawing canvases and stores them in @canvases", ->
        app = initAppWithSandbox()
        expect(app.canvases).toBe()

      it "initializes the toolset and stores it in @toolset", ->
        app = initAppWithSandbox()
        expect(app.toolset).toBe()

      it "initializes the history and stores it in @history", ->
        app = initAppWithSandbox()
        expect(app.history).toBe()

      it "creates a div which will house all of the UI elements", ->
        app = initAppWithSandbox()
        expect(app.$container).toBeElementOf("div")

      it "creates a div for the content mask (which appears when the color picker is opened)", ->
        app = initAppWithSandbox()
        expect(app.$maskDiv).toBeElementOf("div")

      it "creates divs for the left content and adds it to the container element", ->
        app = initAppWithSandbox()
        expect(app.$container.find('div#left_pane')).toBeElement(app.$leftPane)

      it "creates a div for the center content and adds it to the container element", ->
        app = initAppWithSandbox()
        expect(app.$container.find('div#center_pane')).toBeElement(app.$centerPane)

      it "creates a div for the right content and adds it to the container element", ->
        app = initAppWithSandbox()
        expect(app.$container.find('div#right_pane')).toBeElement(app.$rightPane)

      it "creates a div to hold the import/export buttons and adds it to the center pane", ->
        app = initAppWithSandbox()
        $importDiv = app.$centerPane.find('div#import')
        $exportDiv = app.$centerPane.find('form#export')
        expect($importDiv[0]).toBe()
        expect($exportDiv[0]).toBe()
        expect($importDiv).toContainElement('input[type=file]')
        expect($importDiv).toContainElement('button', content: 'Import PNG')
        expect($exportDiv).toContainElement('button', content: 'Export PNG')

      it "adds the working canvas to the container", ->
        app = initAppWithSandbox()
        expect(app.$centerPane.find('canvas')).toBeElement(app.canvases.workingCanvas.$element)

      it "initializes and adds the tools box to the left pane", ->
        app = initAppWithSandbox()
        expect(app.boxes.tools).toBe()
        expect(app.$leftPane).toContainElement('#' + Box.Tools.containerId)

      it "initializes and adds the brush sizes box to the left pane", ->
        app = initAppWithSandbox()
        expect(app.boxes.sizes).toBe()
        expect(app.$leftPane).toContainElement('#' + Box.Sizes.containerId)

      it "initializes and adds the colors box to the right pane", ->
        app = initAppWithSandbox()
        expect(app.$rightPane).toContainElement('#' + Box.Colors.containerId)

      it "also initializes the color picker widget (although it doesn't attach it anywhere just yet)", ->
        app = initAppWithSandbox()
        expect(app.colorPicker).toBe()

      it "initializes and adds the preview box to the right pane", ->
        app = initAppWithSandbox()
        $previewBox = app.$rightPane.find('#preview_box')
        expect($previewBox[0]).toBe()
        expect($previewBox.find('canvas:nth-of-type(1)')).toBeElement(app.canvases.previewCanvas.$element)
        expect($previewBox.find('canvas:nth-of-type(2)')).toBeElement(app.canvases.tiledPreviewCanvas.$element)

  describe '#hook', ->
    beforeEach ->
      app = initApp()

    it "adds the container to the given element", ->
      app.hook($sandbox)
      expect($sandbox.find('div:first-child')).toBeElement(app.$container)

    it "adds the mask and the color picker to the body", ->
      app.hook($sandbox)
      #console.log $(document.body).html()
      $body = $(document.body)
      mask1 = $body.find('#mask')[0]
      mask2 = app.$maskDiv[0]
      expect(mask1).toBe(mask2)
      expect($body).toContainElement(app.colorPicker.$container)

  describe 'when destroyed', ->
    beforeEach ->
      app = initApp()

    describe 'if not destroyed yet', ->
      it "removes any events that may have been added", ->
        spyOn(app, 'removeEvents')
        app.destroy()
        expect(app.removeEvents).toHaveBeenCalled()

      it "un-initializes the Keyboard module", ->
        spyOn(Keyboard, 'destroy')
        app.destroy()
        expect(Keyboard.destroy).toHaveBeenCalled()

      it "un-initializes the drawing canvases", ->
        spyOn(DrawingCanvases, 'destroy')
        app.destroy()
        expect(DrawingCanvases.destroy).toHaveBeenCalled()

      it "doesn't blow up if @canvases is null", ->
        app.canvases = null
        expect(-> app.destroy()).not.toThrowAnything()

      it "un-initializes the toolset", ->
        spyOn(Toolset, 'destroy')
        app.destroy()
        expect(Toolset.destroy).toHaveBeenCalled()

      it "doesn't blow up if @toolset is null", ->
        app.toolset = null
        expect(-> app.destroy()).not.toThrowAnything()

      it "un-initializes the event history", ->
        spyOn(EventHistory, 'destroy')
        app.destroy()
        expect(EventHistory.destroy).toHaveBeenCalled()

      it "doesn't blow up if @history is null", ->
        app.history = null
        expect(-> app.destroy()).not.toThrowAnything()

      it "resets key variables", ->
        spyOn(app, 'reset')
        app.destroy()
        expect(app.reset).toHaveBeenCalled()

      it "sets @isInitialized to false", ->
        app.destroy()
        expect(app.isInitialized).toBeFalsy()

    describe 'if already destroyed', ->
      beforeEach ->
        app.destroy()

      it "doesn't try to remove events", ->
        spyOn(app, 'removeEvents')
        app.destroy()
        expect(app.removeEvents).not.toHaveBeenCalled()

      it "doesn't try to un-initialize the Keyboard module", ->
        spyOn(Keyboard, 'destroy')
        app.destroy()
        expect(Keyboard.destroy).not.toHaveBeenCalled()

      it "doesn't try to un-initialize the drawing canvases", ->
        spyOn(DrawingCanvases, 'destroy')
        app.destroy()
        expect(DrawingCanvases.destroy).not.toHaveBeenCalled()

      it "doesn't try to un-initialize the toolset", ->
        spyOn(Toolset, 'destroy')
        app.destroy()
        expect(Toolset.destroy).not.toHaveBeenCalled()

      it "doesn't try to un-initialize the event history", ->
        spyOn(EventHistory, 'destroy')
        app.destroy()
        expect(EventHistory.destroy).not.toHaveBeenCalled()

      it "doesn't reset key variables", ->
        spyOn(app, 'reset')
        app.destroy()
        expect(app.reset).not.toHaveBeenCalled()

  describe 'when reset', ->
    beforeEach ->
      app = initApp()

    it "resets @canvases", ->
      app.canvases = "something"
      app.reset()
      expect(app.canvases).not.toBe()

    it "resets @toolset", ->
      app.toolset = "something"
      app.reset()
      expect(app.toolset).not.toBe()

    it "resets @history", ->
      app.history = "something"
      app.reset()
      expect(app.history).not.toBe()

    it "resets @boxes", ->
      app.boxes = "something"
      app.reset()
      expect(app.boxes).toEqual({})

    it "removes the container from the document, if it's present", ->
      app.$container.appendTo($sandbox)
      app.reset()
      expect($sandbox).not.toContainElement('#container')

    it "resets @$container", ->
      app.reset()
      expect(app.$container).not.toBe()

    it "resets @$leftPane", ->
      app.$leftPane = "something"
      app.reset()
      expect(app.$leftPane).not.toBe()

    it "resets @$centerPane", ->
      app.$centerPane = "something"
      app.reset()
      expect(app.$centerPane).not.toBe()

    it "resets @$rightPane", ->
      app.$rightPane = "something"
      app.reset()
      expect(app.$rightPane).not.toBe()

    it "removes the mask from the body, if it's present", ->
      app.$maskDiv.appendTo($sandbox)
      app.reset()
      expect($sandbox).not.toContainElement('#mask')

    it "resets @$maskDiv", ->
      app.reset()
      expect(app.$maskDiv).not.toBe()

    it "removes the color picker container from the body, if it's present", ->
      $elem = app.colorPicker.$container
      id = $elem.attr("id")
      $elem.appendTo($sandbox)
      app.reset()
      expect($sandbox).not.toContainElement("##{id}")

    it "resets @colorPicker", ->
      app.reset()
      expect(app.colorPicker).not.toBe()

  describe 'when events have been added', ->
    currentTool = null

    beforeEach ->
      app = initApp()
      currentTool = Toolset.createTool()
      spyOn(app.boxes.tools, 'currentTool').andReturn(currentTool)

    it "adds keyboard events", ->
      spyOn(Keyboard, 'addEvents')
      app.addEvents()
      expect(Keyboard.addEvents).toHaveBeenCalled()

    it "adds mouse tracker events", ->
      spyOn(ElementMouseTracker, 'addEvents')
      app.addEvents()
      expect(ElementMouseTracker.addEvents).toHaveBeenCalled()

    it "adds canvas events", ->
      spyOn(DrawingCanvases, 'addEvents')
      app.addEvents()
      expect(DrawingCanvases.addEvents).toHaveBeenCalled()

    it "adds tools box events", ->
      spyOn(Box.Tools, 'addEvents')
      app.addEvents()
      expect(Box.Tools.addEvents).toHaveBeenCalled()

    it "adds sizes box events", ->
      spyOn(Box.Sizes, 'addEvents')
      app.addEvents()
      expect(Box.Sizes.addEvents).toHaveBeenCalled()

    it "adds colors box events", ->
      spyOn(Box.Colors, 'addEvents')
      app.addEvents()
      expect(Box.Colors.addEvents).toHaveBeenCalled()

    describe 'when Ctrl-Z is pressed', ->
      it "undoes the last action", ->
        app.addEvents()
        spyOn(app.history, 'undo')
        $(document).simulate "keydown", keyCode: Keyboard.Z_KEY, ctrlKey: true
        expect(app.history.undo).toHaveBeenCalled()

    describe 'when Cmd-Z is pressed', ->
      it "undoes the last action", ->
        app.addEvents()
        spyOn(app.history, 'undo')
        $(document).simulate "keydown", keyCode: Keyboard.Z_KEY, metaKey: true
        expect(app.history.undo).toHaveBeenCalled()

    describe 'when Ctrl-Shift-Z is pressed', ->
      it "redoes the last action", ->
        app.addEvents()
        spyOn(app.history, 'redo')
        $(document).simulate "keydown", keyCode: Keyboard.Z_KEY, ctrlKey: true, shiftKey: true
        expect(app.history.redo).toHaveBeenCalled()

    describe 'when Cmd-Shift-Z is pressed', ->
      it "redoes the last action", ->
        app.addEvents()
        spyOn(app.history, 'redo')
        $(document).simulate "keydown", keyCode: Keyboard.Z_KEY, metaKey: true, shiftKey: true
        expect(app.history.redo).toHaveBeenCalled()

    describe 'when a key is pressed', ->
      it "calls a possible keydown event on the current tool", ->
        app.addEvents()
        currentTool.keydown = ->
        spyOn(currentTool, 'keydown')
        $(document).simulate("keydown")
        expect(currentTool.keydown).toHaveBeenCalled()

    describe 'when a key is lifted', ->
      it "calls a possible keyup event on the current tool", ->
        app.addEvents()
        currentTool.keyup = ->
        spyOn(currentTool, 'keyup')
        $(document).simulate("keyup")
        expect(currentTool.keyup).toHaveBeenCalled()

  describe 'when events have been removed', ->
    currentTool = null

    beforeEach ->
      app = initApp()
      app.addEvents()
      currentTool = Toolset.createTool()
      spyOn(app.boxes.tools, 'currentTool').andReturn(currentTool)

    it "removes keyboard events", ->
      spyOn(Keyboard, 'removeEvents')
      app.removeEvents()
      expect(Keyboard.removeEvents).toHaveBeenCalled()

    it "removes canvas events", ->
      spyOn(DrawingCanvases, 'removeEvents')
      app.removeEvents()
      expect(DrawingCanvases.removeEvents).toHaveBeenCalled()

    it "removes tools box events", ->
      spyOn(Box.Tools, 'removeEvents')
      app.removeEvents()
      expect(Box.Tools.removeEvents).toHaveBeenCalled()

    it "removes sizes box events", ->
      spyOn(Box.Sizes, 'removeEvents')
      app.removeEvents()
      expect(Box.Sizes.removeEvents).toHaveBeenCalled()

    it "removes colors box events", ->
      spyOn(Box.Colors, 'removeEvents')
      app.removeEvents()
      expect(Box.Colors.removeEvents).toHaveBeenCalled()

    describe 'when Ctrl-Z is pressed', ->
      it "doesn't undo the last action", ->
        app.removeEvents()
        spyOn(app.history, 'undo')
        $(document).simulate "keydown", keyCode: Keyboard.Z_KEY, ctrlKey: true
        expect(app.history.undo).not.toHaveBeenCalled()

    describe 'when Cmd-Z is pressed', ->
      it "doesn't undo the last action", ->
        app.removeEvents()
        spyOn(app.history, 'undo')
        $(document).simulate "keydown", keyCode: Keyboard.Z_KEY, metaKey: true
        expect(app.history.undo).not.toHaveBeenCalled()

    describe 'when Ctrl-Shift-Z is pressed', ->
      it "doesn't redo the last action", ->
        app.removeEvents()
        spyOn(app.history, 'redo')
        $(document).simulate "keydown", keyCode: Keyboard.Z_KEY, ctrlKey: true, shiftKey: true
        expect(app.history.redo).not.toHaveBeenCalled()

    describe 'when Cmd-Shift-Z is pressed', ->
      it "doesn't redo the last action", ->
        app.removeEvents()
        spyOn(app.history, 'redo')
        $(document).simulate "keydown", keyCode: Keyboard.Z_KEY, metaKey: true, shiftKey: true
        expect(app.history.redo).not.toHaveBeenCalled()

    describe 'when a key is pressed', ->
      it "doesn't call a keydown event on the current tool", ->
        app.removeEvents()
        currentTool.keydown = ->
        spyOn(currentTool, 'keydown')
        $(document).simulate("keydown")
        expect(currentTool.keydown).not.toHaveBeenCalled()

    describe 'when a key is lifted', ->
      it "doesn't call a keyup event on the current tool", ->
        app.removeEvents()
        currentTool.keyup = ->
        spyOn(currentTool, 'keyup')
        $(document).simulate("keyup")
        expect(currentTool.keyup).not.toHaveBeenCalled()

  #describe 'import form actions'

  #describe 'export form actions'

  #describe 'color picker actions'
















