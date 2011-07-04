{Keyboard, DrawingCanvases, Toolset, EventHistory, ColorPicker, Box, App} = SpriteEditor

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
    # stub this as we don't need stuff to be drawing unnecessarily
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
      $('#sandbox').append(app.$container)
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
      app.hook('#sandbox')
      $body = $(document.body)
      $sandbox = $('#sandbox')
      expect($sandbox.find('div:first-child')).toBeElement(app.$container)
      expect($body.find('#mask')).toBeElement(app.$maskDiv)
      expect($body).toContainElement(app.colorPicker.$container)

  #describe 'import form actions'

  #describe 'export form actions'

  #describe 'color picker actions'
















