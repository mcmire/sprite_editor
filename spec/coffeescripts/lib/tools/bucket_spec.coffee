{Keyboard, Toolset, Tools, Color, Cell} = SpriteEditor

describe 'The bucket tool', ->
  tool = app = null
  beforeEach ->
    Keyboard.init()
    canvases = {}
    app = {canvases: canvases}
    Toolset.init(app, canvases)
    tool = $.extend true, Toolset.tools.bucket
  afterEach ->
    Keyboard.destroy()
    Toolset.destroy()

  describe 'on mouse down', ->
    it "clears like cells if a cell is right-clicked", ->
      event = {rightClick: true}
      spyOn(tool, 'recordEvent')
      tool.mousedown(event)
      expect(tool.recordEvent).toHaveBeenCalledWith('clearFocusedCells')

    it "clears like cells if a cell is Ctrl-clicked", ->
      spyOn(Keyboard, 'isKeyPressed').andReturn(true)
      spyOn(tool, 'recordEvent')
      tool.mousedown({})
      expect(tool.recordEvent).toHaveBeenCalledWith('clearFocusedCells')

    it "fills like cells if a cell is left-clicked", ->
      spyOn(tool, 'recordEvent')
      tool.mousedown({})
      expect(tool.recordEvent).toHaveBeenCalledWith('fillFocusedCells')

  describe 'fillFocusedCells', ->
    action = null
    beforeEach ->
      action = tool.actions.fillFocusedCells

    describe '#do', ->
      color = color2 = color3 = cell1 = cell2 = cell3 = tool = null
      beforeEach ->
        color = new Color(red: 255, blue: 255, green: 0)
        color2 = new Color(red: 0, blue: 127, green: 127)
        color3 = new Color(red: 127, blue: 127, green: 0)
        cell1 = new Cell(app, 1, 2)
        cell1.color = color
        cell2 = new Cell(app, 2, 3)
        cell2.color = color
        cell3 = new Cell(app, 3, 4)
        cell3.color = color2
        tool.app = {boxes: {colors: {currentColor: -> color3}}}
        tool.canvases = {
          focusedCell: cell2,
          cells: [[cell1, cell2, cell3]]
        }

      it "takes the color of the clicked cell and applies it to all cells with the same color", ->
        action.do()
        cells = tool.canvases.cells
        expect(cells[0][0].color).toEqualColor(color3)
        expect(cells[0][1].color).toEqualColor(color3)
        expect(cells[0][2].color).toEqualColor(color2)

      it "returns an event with data to use in undoing and redoing the action", ->
        event = action.do()
        cells = tool.canvases.cells
        changedCells = event.canvases.changedCells
        expect(changedCells[0].before).toBe(cell1)
        expect(changedCells[0].after).toBe(cells[0][0])
        expect(changedCells[1].before).toBe(cell2)
        expect(changedCells[1].after).toBe(cells[0][1])
        expect(changedCells[2]).not.toBe()
        expect(changedCells[2]).not.toBe()

    describe '#undo', ->
      it "loops through the changedCells of the last event and restores the 'before' data", ->
        cell1 = new Cell(app, 0, 0)
        cell2 = new Cell(app, 0, 1)
        cell3 = new Cell(app, 0, 2)
        changedCells = [
          {before: cell1},
          {before: cell2},
          {before: cell3}
        ]
        event = {canvases: {changedCells: changedCells}}
        cells = [[]]
        tool.canvases = { cells: cells }
        action.undo(event)
        expect(cells[0][0]).toBe(cell1)
        expect(cells[0][1]).toBe(cell2)
        expect(cells[0][2]).toBe(cell3)

    describe '#redo', ->
      it "loops through the changedCells of the last event and restores the 'after' data", ->
        cell1 = new Cell(app, 0, 0)
        cell2 = new Cell(app, 0, 1)
        cell3 = new Cell(app, 0, 2)
        changedCells = [
          {after: cell1},
          {after: cell2},
          {after: cell3}
        ]
        event = {canvases: {changedCells: changedCells}}
        cells = [[]]
        tool.canvases = { cells: cells }
        action.redo(event)
        expect(cells[0][0]).toBe(cell1)
        expect(cells[0][1]).toBe(cell2)
        expect(cells[0][2]).toBe(cell3)

  describe 'clearFocusedCells', ->
    action = null
    beforeEach ->
      action = tool.actions.clearFocusedCells

    describe '#do', ->
      color = color2 = color3 = cell1 = cell2 = cell3 = tool = null
      beforeEach ->
        color = new Color(red: 255, blue: 255, green: 0)
        color2 = new Color(red: 0, blue: 127, green: 127)
        color3 = new Color(red: 127, blue: 127, green: 0)
        cell1 = new Cell(app, 1, 2)
        cell1.color = color
        cell2 = new Cell(app, 2, 3)
        cell2.color = color
        cell3 = new Cell(app, 3, 4)
        cell3.color = color2
        tool.app = {boxes: {colors: {currentColor: -> color3}}}
        tool.canvases = {
          focusedCell: cell2,
          cells: [[cell1, cell2, cell3]]
        }

      it "removes the color from all cells with the same color state as the clicked cell", ->
        action.do()
        cells = tool.canvases.cells
        expect(cells[0][0].color.isClear()).toBe(true)
        expect(cells[0][1].color.isClear()).toBe(true)
        expect(cells[0][2].color).toEqualColor(color2)

      it "returns an event with data to use in undoing and redoing the action", ->
        event = action.do()
        cells = tool.canvases.cells
        changedCells = event.canvases.changedCells
        expect(changedCells[0].before).toBe(cell1)
        expect(changedCells[0].after).toBe(cells[0][0])
        expect(changedCells[1].before).toBe(cell2)
        expect(changedCells[1].after).toBe(cells[0][1])
        expect(changedCells[2]).not.toBe()
        expect(changedCells[2]).not.toBe()

    describe '#undo', ->
      it "loops through the changedCells of the last event and restores the 'before' data", ->
        cell1 = new Cell(app, 0, 0)
        cell2 = new Cell(app, 0, 1)
        cell3 = new Cell(app, 0, 2)
        changedCells = [
          {before: cell1},
          {before: cell2},
          {before: cell3}
        ]
        event = {canvases: {changedCells: changedCells}}
        cells = [[]]
        tool.canvases = { cells: cells }
        action.undo(event)
        expect(cells[0][0]).toBe(cell1)
        expect(cells[0][1]).toBe(cell2)
        expect(cells[0][2]).toBe(cell3)

    describe '#redo', ->
      it "loops through the changedCells of the last event and restores the 'after' data", ->
        cell1 = new Cell(app, 0, 0)
        cell2 = new Cell(app, 0, 1)
        cell3 = new Cell(app, 0, 2)
        changedCells = [
          {after: cell1},
          {after: cell2},
          {after: cell3}
        ]
        event = {canvases: {changedCells: changedCells}}
        cells = [[]]
        tool.canvases = { cells: cells }
        action.redo(event)
        expect(cells[0][0]).toBe(cell1)
        expect(cells[0][1]).toBe(cell2)
        expect(cells[0][2]).toBe(cell3)
