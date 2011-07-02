{DrawingCanvases, Keyboard, Cell, CellLocation, Color, Toolset} = SpriteEditor

describe 'DrawingCanvases', ->
  currentTool = app = canvases = null

  beforeEach ->
    localStorage.clear()
    currentTool = Toolset.createTool()
    app = {
      boxes: {
        tools: { currentTool: -> currentTool }
      }
    }

  afterEach ->
    DrawingCanvases.destroy()

  it "responds to _bindEvents and _unbindEvents", ->
    expect(Keyboard._bindEvents).toBeTypeOf("function")
    expect(Keyboard._unbindEvents).toBeTypeOf("function")

  it "also responds to recordEvent and addAction", ->
    expect(DrawingCanvases.recordEvent).toBeTypeOf("function")
    expect(DrawingCanvases.addAction).toBeTypeOf("function")

  describe 'when initialized', ->
    it "resets key variables", ->
      spyOn(DrawingCanvases, 'reset')
      canvases = DrawingCanvases.init(app)
      expect(DrawingCanvases.reset).toHaveBeenCalled()

    it "sets default properties", ->
      canvases = DrawingCanvases.init(app)
      expect(canvases.drawInterval).toBe()
      expect(canvases.widthInCells).toBe()
      expect(canvases.heightInCells).toBe()
      expect(canvases.cellSize).toBe()
      expect(canvases.showGrid).toBe()

    it "initializes @cells to an array of arrays of Cells, initializing those Cells to empty Colors", ->
      canvases = DrawingCanvases.init(app, {widthInCells: 2, heightInCells: 2})
      expect(canvases.cells.length).toBe(2)
      expect(canvases.cells[0].length).toBe(2)
      result = $.v.every canvases.cells, (row) ->
        $.v.every row, (cell) -> cell.isClear()
      expect(result).toBeTruthy()

    describe 'if showGrid is enabled', ->
      it "creates the canvas element for the background of the working canvas (grid pattern)", ->
        canvases = DrawingCanvases.init(app, showGrid: true)
        c = canvases.gridBgCanvas
        expect(c.$element).toBeElementOf("canvas")
        expect(c.ctx).toBeDefined()
        expect(c.width).toBe(30)
        expect(c.height).toBe(30)

      it "attaches the grid pattern to the working canvas", ->
        canvases = DrawingCanvases.init(app, showGrid: true)
        expect(canvases.workingCanvas.$element.css('background-image')).toMatch(/^url\(data:image\/png;base64,.+\)$/)

    describe 'if showGrid is not enabled', ->
      it "doesn't create a working canvas background pattern", ->
        canvases = DrawingCanvases.init(app, showGrid: false)
        expect(canvases.gridBgCanvas).not.toBe()

    it "creates the canvas element where the main editing takes place", ->
      canvases = DrawingCanvases.init(app, widthInCells: 2, heightInCells: 2, cellSize: 10)
      c = canvases.workingCanvas
      expect(c.$element).toBeElementOf("canvas")
      expect(c.$element).toHaveAttr("id", "working_canvas")
      expect(c.ctx).toBeDefined()
      expect(c.width).toBe(20)
      expect(c.height).toBe(20)

    it "creates the canvas element where the preview gets drawn", ->
      canvases = DrawingCanvases.init(app, widthInCells: 2, heightInCells: 2, cellSize: 10)
      c = canvases.previewCanvas
      expect(c.$element).toBeElementOf("canvas")
      expect(c.$element).toHaveAttr("id", "preview_canvas")
      expect(c.ctx).toBeDefined()
      expect(c.width).toBe(2)
      expect(c.height).toBe(2)

    it "creates the canvas element where the preview gets tiled", ->
      canvases = DrawingCanvases.init(app, widthInCells: 2, heightInCells: 2, cellSize: 10, patternSize: 4)
      c = canvases.tiledPreviewCanvas
      expect(c.$element).toBeElementOf("canvas")
      expect(c.$element).toHaveAttr("id", "tiled_preview_canvas")
      expect(c.ctx).toBeDefined()
      expect(c.width).toBe(8)
      expect(c.height).toBe(8)

    #it "starts the auto-save loop", ->
    #  spyOn(DrawingCanvases, 'startSaving')
    #  canvases = DrawingCanvases.init(app)
    #  expect(DrawingCanvases.startSaving).toHaveBeenCalled()

  describe 'when destroyed', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)

    it "resets key variables", ->
      spyOn(canvases, 'reset')
      canvases.destroy()
      expect(canvases.reset).toHaveBeenCalled()

    it "removes any events that may have been added", ->
      spyOn(canvases, 'removeEvents')
      canvases.destroy()
      expect(canvases.removeEvents).toHaveBeenCalled()

    it "removes any local storage keys that may be present", ->
      localStorage.setItem("sprite_editor.saved", "true")
      localStorage.setItem("sprite_editor.cells", "something")
      canvases.destroy()
      expect(localStorage.getItem("sprite_editor.saved")).not.toBe()
      expect(localStorage.getItem("sprite_editor.cells")).not.toBe()

  describe 'when reset', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)

    it "stops the draw loop", ->
      spyOn(canvases, 'stopDrawing')
      canvases.reset()
      expect(canvases.stopDrawing).toHaveBeenCalled()

    it "stops the auto-save loop", ->
      spyOn(canvases, 'stopSaving')
      canvases.reset()
      expect(canvases.stopSaving).toHaveBeenCalled()

    it "clears @width", ->
      canvases.width = "whatever"
      canvases.reset()
      expect(canvases.width).toBeNull()

    it "clears @workingCanvas", ->
      canvases.workingCanvas = "whatever"
      canvases.reset()
      expect(canvases.workingCanvas).not.toBe()

    it "clears @gridBgCanvas", ->
      canvases.gridBgCanvas = "whatever"
      canvases.reset()
      expect(canvases.gridBgCanvas).not.toBe()

    it "clears @previewCanvas", ->
      canvases.previewCanvas = "whatever"
      canvases.reset()
      expect(canvases.previewCanvas).not.toBe()

    it "clears @cells", ->
      canvases.cells = "whatever"
      canvases.reset()
      expect(canvases.cells).toEqual([])

    it "clears @focusedCell", ->
      canvases.focusedCell = "whatever"
      canvases.reset()
      expect(canvases.focusedCell).not.toBe()

    it "clears @focusedCells", ->
      canvases.focusedCells = "whatever"
      canvases.reset()
      expect(canvases.focusedCells).toEqual([])

    it "clears @startDragAtCell", ->
      canvases.startDragAtCell = "whatever"
      canvases.reset()
      expect(canvases.startDragAtCell).not.toBe()

    it "clears the @clipboard", ->
      canvases.clipboard = "whatever"
      canvases.reset()
      expect(canvases.clipboard).toEqual([])

    it "clears the pre-suspend state", ->
      canvases.stateBeforeSuspend = "whatever"
      canvases.reset()
      expect(canvases.stateBeforeSuspend).not.toBe()

  describe '#startDrawing', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)

    describe "if the draw loop isn't started yet", ->
      beforeEach ->
        canvases.isDrawing = false

      it "starts the draw loop", ->
        spyOn(canvases, 'draw')
        canvases.startDrawing()
        expect(canvases.draw).toHaveBeenCalled()

      it "sets the state of the canvases to drawing", ->
        canvases.startDrawing()
        expect(canvases.isDrawing).toBeTruthy()

    describe "if the draw loop is already started", ->
      beforeEach ->
        canvases.isDrawing = true

      it "doesn't re-start the draw loop", ->
        spyOn(canvases, 'draw')
        canvases.startDrawing()
        expect(canvases.draw).not.toHaveBeenCalled()

  describe '#draw', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)

    it "clears the working canvas"  # not sure how to test this?

    it "clears the preview canvas"  # not sure how to test this?

    it "clears the tiled preview canvas"  # not sure how to test this?

    it "draws each cell", ->
      spyOn(canvases, 'drawCell')
      canvases.draw()
      expect(canvases.drawCell).toHaveBeenCalledWith(jasmine.any(Cell), {})

    it "uses the current tool to draw the cell if it provides cell options", ->
      opts = {foo: "bar"}
      currentTool.cellOptions = -> opts
      spyOn(canvases, 'drawCell')
      canvases.draw()
      expect(canvases.drawCell).toHaveBeenCalledWith(jasmine.any(Cell), opts)

    # ---- TODO Add more tests ----

  describe '#stopDrawing', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)
      canvases.startDrawing()

    it "sets the state of the canvases to not-drawing", ->
      canvases.stopDrawing()
      expect(canvases.isDrawing).toBeFalsy()

  describe '#startSaving', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)

    describe "if the draw loop isn't started yet", ->
      beforeEach ->
        canvases.isSaving = false

      it "starts the save loop", ->
        spyOn(canvases, 'save')
        canvases.startSaving()
        expect(canvases.save).toHaveBeenCalled()

      it "sets the state of the canvases to drawing", ->
        canvases.startSaving()
        expect(canvases.isSaving).toBeTruthy()

    describe "if the draw loop is already started", ->
      beforeEach ->
        canvases.isSaving = true

      it "doesn't re-start the draw loop", ->
        spyOn(canvases, 'save')
        canvases.startSaving()
        expect(canvases.save).not.toHaveBeenCalled()

  describe '#save', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app, widthInCells: 2, heightInCells: 2)

    it "stores the cells in local storage", ->
      canvases.cells[0][0] = new Cell(
        canvases: canvases
        loc: new CellLocation(canvases: canvases, i: 0, j: 0)
        color: new Color(red: 255, green: 0, blue: 0)
      )
      canvases.cells[0][1] = new Cell(
        canvases: canvases
        loc: new CellLocation(canvases: canvases, i: 0, j: 1)
        color: new Color(red: 0, green: 255, blue: 0)
      )
      canvases.cells[1][0] = new Cell(
        canvases: canvases
        loc: new CellLocation(canvases: canvases, i: 1, j: 0)
        color: new Color(red: 0, green: 0, blue: 255)
      )
      canvases.cells[1][1] = new Cell(
        canvases: canvases
        loc: new CellLocation(canvases: canvases, i: 1, j: 1)
        color: new Color(red: 255, green: 255, blue: 255)
      )
      canvases.save()
      json = localStorage.getItem("sprite_editor.cells")
      expect(JSON.parse(json)).toEqual(
        "0,0": {_s: true, red: 255, green: 0, blue: 0, hue: 0, sat: 100, lum: 50, alpha: 1},
        "0,1": {_s: true, red: 0, green: 255, blue: 0, hue: 120, sat: 100, lum: 50, alpha: 1},
        "1,0": {_s: true, red: 0, green: 0, blue: 255, hue: 240, sat: 100, lum: 50, alpha: 1},
        "1,1": {_s: true, red: 255, green: 255, blue: 255, hue: 0, sat: 100, lum: 100, alpha: 1}
      )

  describe '#stopDrawing', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)
      canvases.startSaving()

    it "sets the state of the canvases to not-saving", ->
      canvases.stopSaving()
      expect(canvases.isSaving).toBeFalsy()

  describe '#suspend', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)

    describe 'if not suspended yet', ->
      it "stores the state of the draw loop", ->
        canvases.isDrawing = true
        canvases.suspend()
        expect(canvases.stateBeforeSuspend.wasDrawing).toBeTruthy()

      it "stores the state of the auto-save loop", ->
        canvases.isSaving = false
        canvases.suspend()
        expect(canvases.stateBeforeSuspend.wasSaving).toBeFalsy()

      it "stops the draw loop", ->
        spyOn(canvases, 'stopDrawing')
        canvases.suspend()
        expect(canvases.stopDrawing).toHaveBeenCalled()

      it "stops the save loop", ->
        spyOn(canvases, 'stopSaving')
        canvases.suspend()
        expect(canvases.stopSaving).toHaveBeenCalled()

    describe 'if already suspended', ->
      beforeEach ->
        canvases.stateBeforeSuspend = "something"

      it "doesn't try to stop the draw loop", ->
        spyOn(canvases, 'stopDrawing')
        canvases.suspend()
        expect(canvases.stopDrawing).not.toHaveBeenCalled()

      it "doesn't try to stop the auto-save loop", ->
        spyOn(canvases, 'stopSaving')
        canvases.suspend()
        expect(canvases.stopSaving).not.toHaveBeenCalled()

  describe '#resume', ->
    beforeEach ->
      canvases = DrawingCanvases.init(app)

    describe 'if not resumed yet', ->
      it "starts the draw loop if it had been running prior to suspension", ->
        canvases.stateBeforeSuspend = {wasDrawing: true}
        spyOn(canvases, 'startDrawing')
        canvases.resume()
        expect(canvases.startDrawing).toHaveBeenCalled()

      it "doesn't start the draw loop if it had not been running prior to suspension", ->
        canvases.stateBeforeSuspend = {wasDrawing: false}
        spyOn(canvases, 'startDrawing')
        canvases.resume()
        expect(canvases.startDrawing).not.toHaveBeenCalled()

      it "starts the save loop if it had been running prior to suspension", ->
        canvases.stateBeforeSuspend = {wasSaving: true}
        spyOn(canvases, 'startSaving')
        canvases.resume()
        expect(canvases.startSaving).toHaveBeenCalled()

      it "doesn't start the save loop if it had not been running prior to suspension", ->
        canvases.stateBeforeSuspend = {wasSaving: false}
        spyOn(canvases, 'startSaving')
        canvases.resume()
        expect(canvases.startSaving).not.toHaveBeenCalled()

    describe 'if already resumed', ->
      beforeEach ->
        canvases.stateBeforeSuspend = null

      it "doesn't bomb", ->
        expect(-> canvases.resume()).not.toThrowAnything()

  describe 'when events have been added', ->
    $canvas = o = null
    beforeEach ->
      app.boxes.sizes = {currentSize: 1}
      canvases = DrawingCanvases.init app, {cellSize: 10, widthInCells: 10, heightInCells: 10}
      # this has to be here so that the mouse position is correct
      # as it is subtracted from the canvas offset
      $canvas = canvases.workingCanvas.$element.appendTo('#sandbox')
      o = $canvas.offset()

    it "starts the draw loop", ->
      spyOn(canvases, 'startDrawing')
      canvases.addEvents()
      expect(canvases.startDrawing).toHaveBeenCalled()

    describe 'when the mouse is down over the element', ->
      it "triggers a possible mousedown event on the current tool", ->
        currentTool.mousedown = jasmine.createSpy()
        canvases.addEvents()
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        expect(currentTool.mousedown).toHaveBeenCalled()

    describe 'when the mouse is lifted', ->
      it "triggers a possible mouseup event on the current tool", ->
        currentTool.mouseup = jasmine.createSpy()
        canvases.addEvents()
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate("mouseup")
        expect(currentTool.mouseup).toHaveBeenCalled()

    describe 'when the mouse is moved', ->
      simulateEvent = (dx=1, dy=1) ->
        canvases.addEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + dx, clientY: o.top + dy}

      it "triggers a possible mousemove event on the current tool", ->
        currentTool.mousemove = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mousemove).toHaveBeenCalled()

      it "stores the cell that has focus", ->
        cell = new Cell(canvases, 3, 6)
        canvases.cells[3][6] = cell
        simulateEvent(65, 35)
        expect(canvases.focusedCell).toEqual(cell)

      it "stores the cells that have focus (considering the brush size)", ->
        app.boxes.sizes = {currentSize: 4}

        cells = []
        cells[0] = new Cell(canvases, 2, 5)
        cells[1] = new Cell(canvases, 2, 6)
        cells[2] = new Cell(canvases, 3, 5)
        cells[3] = new Cell(canvases, 3, 6)
        canvases.cells[2][5] = cells[0]
        canvases.cells[2][6] = cells[1]
        canvases.cells[3][5] = cells[2]
        canvases.cells[3][6] = cells[3]

        simulateEvent(65, 35)
        for cell, i in canvases.focusedCells
          expect(cell).toEqualCell(cells[i])

    describe 'when the mouse starts to be dragged while over the element', ->
      cell = null
      beforeEach ->
        cell = new Cell(canvases, 0, 0)
        canvases.cells[0][0] = cell

      simulateEvent = ->
        canvases.addEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + 5, clientY: o.top + 5}

      it "sets startDragAtCell to a clone of the cell that has focus", ->
        simulateEvent()
        expect(canvases.startDragAtCell).toEqualCell(cell)
        expect(canvases.startDragAtCell).not.toBe(cell)

      it "triggers a possible mousedragstart event on the current tool", ->
        currentTool.mousedragstart = jasmine.createSpy()
        canvases.addEvents()
        simulateEvent()
        expect(currentTool.mousedragstart).toHaveBeenCalled()

    describe 'when the mouse is being dragged', ->
      simulateEvent = ->
        canvases.addEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + 5, clientY: o.top + 5}

      it "triggers a possible mousedrag event on the current tool", ->
        currentTool.mousedrag = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mousedrag).toHaveBeenCalled()

    describe 'when the mouse drag ends', ->
      simulateEvent = ->
        canvases.addEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + 5, clientY: o.top + 5}
        $(document).simulate "mouseup", {clientX: o.left + 5, clientY: o.top + 5}

      it "triggers a possible mousedrag event on the current tool", ->
        currentTool.mousedragstop = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mousedragstop).toHaveBeenCalled()

    describe 'when the mouse is moved over the element but not being dragged', ->
      simulateEvent = ->
        canvases.addEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + 5, clientY: o.top + 5}

      it "triggers a possible mousedrag event on the current tool", ->
        currentTool.mouseglide = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mouseglide).toHaveBeenCalled()

    describe 'when the mouse leaves the element', ->
      beforeEach ->
        canvases.focusedCell = "whatever"
        canvases.focusedCells = "blah blah"

      simulateEvent = ->
        canvases.addEvents()
        $canvas.simulate "mouseout", {clientX: o.left - 1, clientY: o.top - 1}

      it "triggers a possible mouseout event on the current tool", ->
        currentTool.mouseout = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mouseout).toHaveBeenCalled()

      it "clears the cell that has focus", ->
        simulateEvent()
        expect(canvases.focusedCell).not.toBe()

      it "clears the cells that have focus (considering the brush size)", ->
        simulateEvent()
        expect(canvases.focusedCells).toEqual([])

      it "redraws the canvas", ->
        spyOn(canvases, 'draw')
        simulateEvent()
        expect(canvases.draw).toHaveBeenCalled()

    describe 'when the window loses focus', ->
      simulateEvent = ->
        canvases.addEvents()
        $(window).simulate "blur"

      it "suspends the draw and auto-save loop", ->
        spyOn(canvases, 'suspend')
        simulateEvent()
        expect(canvases.suspend).toHaveBeenCalled()

    describe 'when the window gains focus again', ->
      simulateEvent = ->
        canvases.addEvents()
        $(window).simulate "focus"

      it "resumes the draw and auto-save loop (if they were running before suspension)", ->
        spyOn(canvases, 'resume')
        simulateEvent()
        expect(canvases.resume).toHaveBeenCalled()

  describe 'when events have been removed', ->
    $canvas = o = null
    beforeEach ->
      app.boxes.sizes = {currentSize: 1}
      canvases = DrawingCanvases.init app, {cellSize: 10, widthInCells: 10, heightInCells: 10}
      # this has to be here so that the mouse position is correct
      # as it is subtracted from the canvas offset
      $canvas = canvases.workingCanvas.$element.appendTo('#sandbox')
      o = $canvas.offset()
      canvases.addEvents()

    it "stops the draw loop", ->
      spyOn(canvases, 'stopDrawing')
      canvases.removeEvents()
      expect(canvases.stopDrawing).toHaveBeenCalled()

    describe 'when the mouse is down over the element', ->
      it "does not trigger a possible mousedown event on the current tool", ->
        currentTool.mousedown = jasmine.createSpy()
        canvases.removeEvents()
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        expect(currentTool.mousedown).not.toHaveBeenCalled()

    describe 'when the mouse is lifted', ->
      it "does not trigger a possible mouseup event on the current tool", ->
        currentTool.mouseup = jasmine.createSpy()
        canvases.removeEvents()
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate("mouseup")
        expect(currentTool.mouseup).not.toHaveBeenCalled()

    describe 'when the mouse is moved', ->
      simulateEvent = (dx=1, dy=1) ->
        canvases.removeEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + dx, clientY: o.top + dy}

      it "does not trigger a possible mousemove event on the current tool", ->
        currentTool.mousemove = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mousemove).not.toHaveBeenCalled()

      it "does not store the cell that has focus", ->
        cell = new Cell(canvases, 3, 6)
        canvases.cells[3][6] = cell
        simulateEvent(65, 35)
        expect(canvases.focusedCell).not.toBe()

      it "does not store the cells that have focus (considering the brush size)", ->
        app.boxes.sizes = {currentSize: 4}

        cells = []
        cells[0] = new Cell(canvases, 2, 5)
        cells[1] = new Cell(canvases, 2, 6)
        cells[2] = new Cell(canvases, 3, 5)
        cells[3] = new Cell(canvases, 3, 6)
        canvases.cells[2][5] = cells[0]
        canvases.cells[2][6] = cells[1]
        canvases.cells[3][5] = cells[2]
        canvases.cells[3][6] = cells[3]

        simulateEvent(65, 35)
        expect(canvases.focusedCells).toEqual([])

    describe 'when the mouse starts to be dragged while over the element', ->
      cell = null
      beforeEach ->
        cell = new Cell(canvases, 0, 0)
        canvases.cells[0][0] = cell

      simulateEvent = ->
        canvases.removeEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + 5, clientY: o.top + 5}

      it "does not set startDragAtCell to a clone of the cell that has focus", ->
        simulateEvent()
        expect(canvases.startDragAtCell).not.toBe()

      it "does not trigger a possible mousedragstart event on the current tool", ->
        currentTool.mousedragstart = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mousedragstart).not.toHaveBeenCalled()

    describe 'when the mouse is being dragged', ->
      simulateEvent = ->
        canvases.removeEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + 5, clientY: o.top + 5}

      it "does not trigger a possible mousedrag event on the current tool", ->
        currentTool.mousedrag = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mousedrag).not.toHaveBeenCalled()

    describe 'when the mouse drag ends', ->
      simulateEvent = ->
        canvases.removeEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $canvas.simulate "mousedown", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + 5, clientY: o.top + 5}
        $(document).simulate "mouseup", {clientX: o.left + 5, clientY: o.top + 5}

      it "does not trigger a possible mousedrag event on the current tool", ->
        currentTool.mousedragstop = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mousedragstop).not.toHaveBeenCalled()

    describe 'when the mouse is moved over the element but not being dragged', ->
      simulateEvent = ->
        canvases.removeEvents()
        $canvas.simulate "mouseover", {clientX: o.left + 1, clientY: o.top + 1}
        $(document).simulate "mousemove", {clientX: o.left + 5, clientY: o.top + 5}

      it "does not trigger a possible mousedrag event on the current tool", ->
        currentTool.mouseglide = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mouseglide).not.toHaveBeenCalled()

    describe 'when the mouse leaves the element', ->
      beforeEach ->
        canvases.focusedCell = "whatever"
        canvases.focusedCells = "blah blah"

      simulateEvent = ->
        canvases.removeEvents()
        $canvas.simulate "mouseout", {clientX: o.left - 1, clientY: o.top - 1}

      it "does not trigger a possible mouseout event on the current tool", ->
        currentTool.mouseout = jasmine.createSpy()
        simulateEvent()
        expect(currentTool.mouseout).not.toHaveBeenCalled()

      it "does not clear the cell that has focus", ->
        simulateEvent()
        expect(canvases.focusedCell).toEqual("whatever")

      it "does not clear the cells that have focus (considering the brush size)", ->
        simulateEvent()
        expect(canvases.focusedCells).toEqual("blah blah")

      it "does not redraw the canvas", ->
        spyOn(canvases, 'draw')
        simulateEvent()
        expect(canvases.draw).not.toHaveBeenCalled()

    describe 'when the window loses focus', ->
      simulateEvent = ->
        canvases.removeEvents()
        $(window).simulate "blur"

      it "does not suspend the draw and auto-save loop", ->
        spyOn(canvases, 'suspend')
        simulateEvent()
        expect(canvases.suspend).not.toHaveBeenCalled()

    describe 'when the window gains focus again', ->
      simulateEvent = ->
        canvases.removeEvents()
        $(window).simulate "focus"

      it "does not resume the draw and auto-save loop", ->
        spyOn(canvases, 'resume')
        simulateEvent()
        expect(canvases.resume).not.toHaveBeenCalled()

  describe '#drawCell', ->
    beforeEach ->
      spyOn(canvases, 'drawWorkingCell')
      spyOn(canvases, 'drawPreviewCell')

    it "draws the cell to the working canvas", ->
      canvases.drawCell("cell", foo: "bar")
      expect(canvases.drawWorkingCell).toHaveBeenCalledWith("cell", foo: "bar")

    it "draws the cell to the preview canvas", ->
      canvases.drawCell("cell", foo: "bar")
      expect(canvases.drawPreviewCell).toHaveBeenCalledWith("cell")

  describe '#drawWorkingCell', ->
    cell = ctx = null
    prepare = ->
      cell = new Cell(
        canvases: canvases,
        loc: new CellLocation(canvases, 5, 3),
        color: new Color(red: 255, green: 0, blue: 0)
      )
      ctx = canvases.workingCanvas.ctx
      spyOn(ctx, 'fillRect')

    beforeEach ->
      canvases = DrawingCanvases.init(app, cellSize: 10)

    describe 'when showGrid is true', ->
      beforeEach ->
        canvases.showGrid = true
        prepare()

      describe 'when just given a cell', ->
        it "fills in a section of the working canvas with the color of the cell", ->
          canvases.drawWorkingCell(cell)
          expect(ctx.fillStyle).toEqual("rgba(255, 0, 0, 1)")

        it "separates each cell with a border", ->
          canvases.drawWorkingCell(cell)
          expect(ctx.fillRect).toHaveBeenCalledWith(31, 51, 9, 9)

      describe 'when given a cell + a color', ->
        it "fills in a section of the working canvas with the given color", ->
          canvases.drawWorkingCell(cell, color: new Color(red: 0, green: 255, blue: 0))
          expect(ctx.fillStyle).toEqual("rgba(0, 255, 0, 1)")

        it "separates each cell with a border", ->
          canvases.drawWorkingCell(cell, color: new Color(red: 0, green: 255, blue: 0))
          expect(ctx.fillRect).toHaveBeenCalledWith(31, 51, 9, 9)

      describe 'when given a cell + a location', ->
        it "fills in a section of the working canvas with the given color", ->
          canvases.drawWorkingCell(cell, loc: new CellLocation(canvases, 10, 2))
          expect(ctx.fillStyle).toEqual("rgba(255, 0, 0, 1)")

        it "separates each cell with a border", ->
          canvases.drawWorkingCell(cell, loc: new CellLocation(canvases, 10, 2))
          expect(ctx.fillRect).toHaveBeenCalledWith(21, 101, 9, 9)

    describe 'when showGrid is false', ->
      beforeEach ->
        canvases.showGrid = false
        prepare()

      describe 'when just given a cell', ->
        it "fills in a section of the working canvas with the color of the cell", ->
          canvases.drawWorkingCell(cell)
          expect(ctx.fillStyle).toEqual("rgba(255, 0, 0, 1)")

        it "separates each cell with a border", ->
          canvases.drawWorkingCell(cell)
          expect(ctx.fillRect).toHaveBeenCalledWith(30, 50, 10, 10)

      describe 'when given a cell + a color', ->
        it "fills in a section of the working canvas with the given color", ->
          canvases.drawWorkingCell(cell, color: new Color(red: 0, green: 255, blue: 0))
          expect(ctx.fillStyle).toEqual("rgba(0, 255, 0, 1)")

        it "separates each cell with a border", ->
          canvases.drawWorkingCell(cell, color: new Color(red: 0, green: 255, blue: 0))
          expect(ctx.fillRect).toHaveBeenCalledWith(30, 50, 10, 10)

      describe 'when given a cell + a location', ->
        it "fills in a section of the working canvas with the given color", ->
          canvases.drawWorkingCell(cell, loc: new CellLocation(canvases, 10, 2))
          expect(ctx.fillStyle).toEqual("rgba(255, 0, 0, 1)")

        it "separates each cell with a border", ->
          canvases.drawWorkingCell(cell, loc: new CellLocation(canvases, 10, 2))
          expect(ctx.fillRect).toHaveBeenCalledWith(20, 100, 10, 10)