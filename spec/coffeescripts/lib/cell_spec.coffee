Cell = SpriteEditor.Cell
Color = SpriteEditor.Color

describe 'Cell', ->
  describe '.new', ->
    describe 'with three arguments', ->
      cell = null
      beforeEach ->
        cell = new Cell("app", 2, 5)
      it "accepts the SpriteEditor.App object", ->
        expect(cell.app).toEqual("app")
      it "accepts coordinates which are dumped into a CellLocation", ->
        expect(cell.loc).toContainObject(i: 2, j: 5)
      it "initializes the color attribute", ->
        expect(cell.color).toBeAnInstanceOf(Color)
        expect(cell.color.isClear()).toBeTruthy()

    describe 'with a single argument, an existing Cell object', ->
      existingCell = cell = null
      beforeEach ->
        existingCell = new Cell("app", 2, 5)
        existingCell.color = new Color(red: 255, green: 128, blue: 0)
        cell = new Cell(existingCell)
      it "uses its app property", ->
        expect(cell.app).toEqual("app")
      it "clones the loc property", ->
        expect(cell.loc).not.toBe(existingCell.loc)
        expect(cell.loc.i).toEqual(2)
        expect(cell.loc.j).toEqual(5)
      it "clones the color property", ->
        expect(cell.color).not.toBe(existingCell.color)
        expect(cell.color.red).toEqual(255)
        expect(cell.color.green).toEqual(128)
        expect(cell.color.blue).toEqual(0)

  describe '#isClear', ->
    cell = null

    beforeEach ->
      cell = new Cell("app", 2, 5)

    it "returns true if the cell is clear", ->
      cell.clear()
      expect(cell.isClear()).toBeTruthy()

    it "returns false if the cell is not clear", ->
      cell.color = new Color(red: 255, green: 0, blue: 0)
      expect(cell.isClear()).toBeFalsy()

  describe '#clear', ->
    cell = null
    beforeEach ->
      cell = new Cell("app", 2, 5)
      cell.color = new Color(red: 255, green: 128, blue: 0)
    it "resets the color property to a clear color", ->
      cell.clear()
      expect(cell.color.isClear()).toBeTruthy()
    it "returns the Cell object", ->
      expect(cell.clear()).toBe(cell)

  describe '#asClear', ->
    cell = null
    beforeEach ->
      cell = new Cell("app", 2, 5)
      cell.color = new Color(red: 255, green: 128, blue: 0)
    it "makes a clone of the current Cell with its color property reset", ->
      cell2 = cell.asClear()
      expect(cell2.color.isClear()).toBeTruthy()
    it "returns the clone", ->
      cell2 = cell.asClear()
      expect(cell2).not.toBe(cell)

  describe '#withColor', ->
    cell = color = null
    beforeEach ->
      cell = new Cell("app", 2, 5)
      color = new Color(red: 255, green: 128, blue: 0)
    it "makes a clone of the current Cell with its color property set to a copy of the given Color", ->
      cell2 = cell.withColor(color)
      expect(cell2.color).toContainObject(color)
      expect(cell2.color).not.toBe(color)
    it "returns the clone", ->
      cell2 = cell.withColor(color)
      expect(cell2).not.toBe(cell)

  describe '#coords', ->
    it "returns a string representation of the cell coordinates", ->
      cell = new Cell("app", 2, 5)
      expect(cell.coords()).toEqual("5,2")

  describe '#clone', ->
    cell = null
    beforeEach ->
      cell = new Cell("app", 2, 5)
      cell.color = new Color(red: 255, green: 128, blue: 0)
    it "returns a clone of this Cell", ->
      cell2 = cell.clone()
      expect(cell.clone()).not.toBe(cell2)
    it "also clones the CellLocation", ->
      cell2 = cell.clone()
      expect(cell2.loc).not.toBe(cell.loc)
    it "also clones the Color", ->
      cell2 = cell.clone()
      expect(cell2.color).not.toBe(cell.color)

  describe '#inspect', ->
    it "returns a debug-friendly representation of the Cell", ->
      cell = new Cell("app", 2, 5)
      cell.color = new Color(red: 255, green: 128, blue: 0)
      expect(cell.inspect()).toEqual('{loc: (2, 5), color: {rgba: rgba(255, 128, 0, 1), hsla: hsla(30, 100, 50, 1)}}')





