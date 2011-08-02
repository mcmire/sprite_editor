{Color, Cell, Toolset} = SpriteEditor

describe 'The dropper tool', ->
  canvases = app = tool = null
  beforeEach ->
    canvases = {}
    app = {canvases: canvases}
    Toolset.init(app, canvases)
    tool = $.extend true, Toolset.tools.dropper
  afterEach ->
    Toolset.destroy()

  describe 'when selected', ->
    it "adds the dropper class to the working canvas", ->
      $div = $('<div />')
      canvases.workingCanvas = {$element: $div}
      tool.select()
      expect($div).toHaveClass("dropper")

  describe 'when deselected', ->
    it "removes the dropper class from the working canvas", ->
      $div = $('<div />').addClass("dropper")
      canvases.workingCanvas = {$element: $div}
      tool.unselect()
      expect($div).not.toHaveClass("dropper")

  describe '#mousedown', ->
    newColor = null
    currentColor = new Color(hue: 100, sat: 50, lum: 30)
    beforeEach ->
      app.boxes = {
        colors: {
          update: (color) -> newColor = color
        }
      }
      spyOn(app.boxes.colors, 'update').andCallThrough()
      canvases.focusedCell = new Cell(app, 1, 2)
      canvases.focusedCell.color = currentColor

    it "handles updating the current editor color with a the color of the clicked cell", ->
      tool.mousedown()
      expect(app.boxes.colors.update).toHaveBeenCalledWith(new Color(hue: 100, sat: 50, lum: 30))

    it "sends a copy of the color", ->
      tool.mousedown()
      newColor.sat = 89
      expect(currentColor.sat).toBe(50)

