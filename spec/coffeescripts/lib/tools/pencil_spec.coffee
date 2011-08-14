{Keyboard, Toolset, Cell, Color} = SpriteEditor

describe 'The pencil tool', ->
  canvases = app = tool = null

  beforeEach ->
    Keyboard.init()
    canvases = {}
    app = {canvases: canvases}
    tool = Toolset.tools.pencil.init(app, canvases)

  afterEach ->
    Keyboard.destroy()
    Toolset.destroy()
    tool.destroy()

  describe 'on mouse down', ->
    beforeEach ->
      spyOn(tool, 'reset')
      spyOn(tool, 'mousedrag')

    it "resets the tool", ->
      tool.mousedown({})
      expect(tool.reset).toHaveBeenCalled()

    it "calls the mousedrag callback with the event", ->
      tool.mousedown(foo: 'bar')
      expect(tool.mousedrag).toHaveBeenCalledWith(foo: 'bar')

  describe 'on mouse drag', ->
    it "erases cells that have focus if a cell is right-clicked", ->
      event = {rightClick: true}
      canvases.focusedCells =
        "0,1": new Cell(canvases, 0, 1)
        "0,2": new Cell(canvases, 0, 2)
        "0,3": new Cell(canvases, 0, 3)
      tool.mousedrag(event)
      expect(tool.upcomingCells["0,1"].color.isClear()).toBe(true)
      expect(tool.upcomingCells["0,2"].color.isClear()).toBe(true)
      expect(tool.upcomingCells["0,3"].color.isClear()).toBe(true)

    it "erases cells that have focus if a cell is Ctrl-clicked", ->
      spyOn(Keyboard, 'isKeyPressed').andReturn(true)
      canvases.focusedCells =
        "0,1": new Cell(canvases, 0, 1)
        "0,2": new Cell(canvases, 0, 2)
        "0,3": new Cell(canvases, 0, 3)
      tool.mousedrag({})
      expect(tool.upcomingCells["0,1"]).toHaveNoColor()
      expect(tool.upcomingCells["0,2"]).toHaveNoColor()
      expect(tool.upcomingCells["0,3"]).toHaveNoColor()

    it "fills cells that have focus with the current color if a cell is left-clicked", ->
      currentColor = new Color(red: 255, green: 255, blue: 0)
      app.boxes = {colors: {currentColor: -> currentColor}}
      canvases.focusedCells =
        "0,1": new Cell(canvases, 0, 1)
        "0,2": new Cell(canvases, 0, 2)
        "0,3": new Cell(canvases, 0, 3)
      tool.mousedrag({})
      expect(tool.upcomingCells["0,1"]).toHaveColor(currentColor)
      expect(tool.upcomingCells["0,2"]).toHaveColor(currentColor)
      expect(tool.upcomingCells["0,3"]).toHaveColor(currentColor)

  describe 'on mouse up', ->
    beforeEach ->
      spyOn(tool, 'recordEvent')
      spyOn(tool, 'reset')

    it "draws the cells with their updated colors", ->
      tool.mouseup({})
      expect(tool.recordEvent).toHaveBeenCalledWith('updateCells')

    it "resets the tool", ->
      tool.mouseup({})
      expect(tool.reset).toHaveBeenCalled()

  describe '#cellOptions', ->
    it "returns a hash with the color of the given cell if it is one of the cells over which the user has dragged", ->
      cell = new Cell(canvases, 0, 1)
      color = cell.color = new Color(red: 255, green: 255, blue: 0)
      tool.upcomingCells["0,1"] = cell
      opts = tool.cellOptions(cell)
      expect(opts.color).toEqualColor(color)

    it "returns a hash with a lightened version of the current color if the given cell has focus", ->
      cell = new Cell(canvases, 0, 1)
      color = new Color(red: 255, green: 255, blue: 0)
      app.boxes = {colors: currentColor: -> color}
      canvases.focusedCells = {"0,1": cell}
      opts = tool.cellOptions(cell)
      expect(opts.color).toEqualColor(red: 255, green: 255, blue: 0, alpha: 0.5)

    it "returns an even lighter version of the current color if the given cell has focus and Ctrl is being pressed", ->
      cell = new Cell(canvases, 0, 1)
      color = cell.color = new Color(red: 255, green: 255, blue: 0)
      app.boxes = {colors: currentColor: -> color}
      canvases.focusedCells = {"0,1": cell}
      spyOn(Keyboard, 'isKeyPressed').andReturn(true)
      opts = tool.cellOptions(cell)
      expect(opts.color).toEqualColor(red: 255, green: 255, blue: 0, alpha: 0.2)

    it "returns an empty hash otherwise", ->
      cell = new Cell(canvases, 0, 1)
      opts = tool.cellOptions(cell)
      expect(opts).toEqual({})

  describe 'the updateCells event', ->
    action = null
    beforeEach ->
      action = tool.actions.updateCells

    describe '#do', ->
      upcomingCells = oldCanvasCells = null
      beforeEach ->
        tool.upcomingCells =
          "0,1": new Cell(canvases, 0, 0)
          "0,2": new Cell(canvases, 0, 1)
          "0,3": new Cell(canvases, 0, 2)

        oldCanvasCells = [
          new Cell(canvases, 0, 0)
          new Cell(canvases, 0, 1)
          new Cell(canvases, 0, 2)
        ]
        canvases.cells = [[
          oldCanvasCells[0],
          oldCanvasCells[1],
          oldCanvasCells[2]
        ]]

      it "takes the @upcomingCells and applies them to the canvas", ->
        action.do()
        expect(canvases.cells[0][0]).toBe(tool.upcomingCells["0,1"])
        expect(canvases.cells[0][1]).toBe(tool.upcomingCells["0,2"])
        expect(canvases.cells[0][2]).toBe(tool.upcomingCells["0,3"])

      it "returns an event with data to use for undoing and redoing the action", ->
        event = action.do()
        changedCells = event.canvases.changedCells
        expect(changedCells[0].before).toBe(oldCanvasCells[0])
        expect(changedCells[0].after ).toBe(tool.upcomingCells["0,1"])
        expect(changedCells[1].before).toBe(oldCanvasCells[1])
        expect(changedCells[1].after ).toBe(tool.upcomingCells["0,2"])
        expect(changedCells[2].before).toBe(oldCanvasCells[2])
        expect(changedCells[2].after ).toBe(tool.upcomingCells["0,3"])

    describe '#undo', ->
      it "loops through the changedCells of the last event and restores the 'before' data", ->
        changedCells = [
          new Cell(canvases, 0, 0)
          new Cell(canvases, 0, 1)
          new Cell(canvases, 0, 2)
        ]
        event =
          canvases:
            changedCells: [
              {before: changedCells[0]},
              {before: changedCells[1]},
              {before: changedCells[2]}
            ]
        canvases.cells = [[]]
        action.undo(event)
        expect(canvases.cells[0][0]).toEqualCell(changedCells[0])
        expect(canvases.cells[0][1]).toEqualCell(changedCells[1])
        expect(canvases.cells[0][2]).toEqualCell(changedCells[2])

    describe '#redo', ->
      it "loops through the changedCells of the last event and restores the 'after' data", ->
        changedCells = [
          new Cell(canvases, 0, 0)
          new Cell(canvases, 0, 1)
          new Cell(canvases, 0, 2)
        ]
        event =
          canvases:
            changedCells: [
              {after: changedCells[0]},
              {after: changedCells[1]},
              {after: changedCells[2]}
            ]
        canvases.cells = [[]]
        action.redo(event)
        expect(canvases.cells[0][0]).toEqualCell(changedCells[0])
        expect(canvases.cells[0][1]).toEqualCell(changedCells[1])
        expect(canvases.cells[0][2]).toEqualCell(changedCells[2])
