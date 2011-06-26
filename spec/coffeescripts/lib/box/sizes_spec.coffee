Sizes    = SpriteEditor.Box.Sizes
Keyboard = SpriteEditor.Keyboard

describe 'Box.Sizes', ->
  app = sizes = null

  beforeEach ->
    app = {canvases: {cellSize: 30}}
  afterEach ->
    Sizes.destroy()
    sizes = null

  it "responds to _bindEvents and _unbindEvents", ->
    expect(Sizes._bindEvents).toBeTypeOf("function")
    expect(Sizes._unbindEvents).toBeTypeOf("function")

  describe 'when initialized', ->
    it "sets @app to the given App instance", ->
      sizes = Sizes.init(app)
      expect(sizes.app).toBe(app)

    it "creates a container element for the box, with an h3 inside", ->
      sizes = Sizes.init(app)
      $e = sizes.$element
      $h = sizes.$element.find("h3")

      expect($e[0].nodeName).toEqual("DIV")
      expect($e[0].id).toEqual("se-box-sizes")
      expect($e[0].className).toMatch(/\bse-box\b/)

      expect($h[0].nodeName).toEqual("H3")
      expect($h.html()).toEqual("Sizes")

    it "adds a canvas element to the container for size 1 and stores it in @sizeGrids", ->
      sizes = Sizes.init(app)
      $e = sizes.$element.find('canvas:nth-of-type(1)')
      $e2 = sizes.sizeGrids[1]
      expect($e[0]).toBe($e2[0])

    it "adds a canvas element to the container for size 2 and stores it in @sizeGrids", ->
      sizes = Sizes.init(app)
      $e = sizes.$element.find('canvas:nth-of-type(2)')
      $e2 = sizes.sizeGrids[2]
      expect($e[0]).toBe($e2[0])

    it "adds a canvas element to the container for size 3 and stores it in @sizeGrids", ->
      sizes = Sizes.init(app)
      $e = sizes.$element.find('canvas:nth-of-type(3)')
      $e2 = sizes.sizeGrids[3]
      expect($e[0]).toBe($e2[0])

    it "adds a canvas element to the container for size 4 and stores it in @sizeGrids", ->
      sizes = Sizes.init(app)
      $e = sizes.$element.find('canvas:nth-of-type(4)')
      $e2 = sizes.sizeGrids[4]
      expect($e[0]).toBe($e2[0])

    it "resets the UI elements", ->
      spyOn(Sizes, 'reset')
      sizes = Sizes.init(app)
      expect(Sizes.reset).toHaveBeenCalled()

  describe 'when destroyed', ->
    beforeEach ->
      sizes = Sizes.init(app)

    it "clears the container element variable", ->
      sizes.destroy()
      expect(sizes.element).toBeUndefined()

    it "clears the current size", ->
      sizes.destroy()
      expect(sizes.currentSize).toBeNull()

    it "removes any events that may have been added", ->
      spyOn(sizes, 'removeEvents')
      sizes.destroy()
      expect(sizes.removeEvents).toHaveBeenCalled()

  describe 'when reset', ->
    beforeEach ->
      sizes = Sizes.init(app)

    it "selects the first size", ->
      spyOn(sizes, 'select')
      sizes.reset()
      expect(sizes.select).toHaveBeenCalledWith(1)

  describe 'when events have been added', ->
    beforeEach ->
      sizes = Sizes.init(app)
      sizes.addEvents()
      spyOn(sizes, 'select')

    for size in Sizes.sizes
      it "if the #{size} key is pressed, marks the element corresponding to the size as selected", ->
        specHelpers.fireNativeEvent document, "keydown", (evt) -> evt.keyCode = Keyboard["KEY_#{size}"]
        expect(sizes.select).toHaveBeenCalledWith(size)

  describe 'when events have been removed', ->
    beforeEach ->
      sizes = Sizes.init(app)
      sizes.addEvents()
      sizes.removeEvents()
      spyOn(sizes, 'select')

    for size in Sizes.sizes
      it "if the #{size} key is pressed, does nothing", ->
        specHelpers.fireNativeEvent document, "keydown", (evt) -> evt.keyCode = Keyboard["KEY_#{size}"]
        expect(sizes.select).not.toHaveBeenCalled()

  describe 'on select', ->
    beforeEach ->
      sizes = Sizes.init(app)
      sizes.currentSize = 3
      $grid.removeClass("selected") for size, $grid of sizes.sizeGrids

    it "marks the element corresponding to the given size as selected", ->
      sizes.select(1)
      expect(sizes.currentSize).toBe(1)
      for size, $grid in sizes.sizeGrids
        if size == 1
          expect($grid).toHaveClass("selected")
        else
          expect($grid).not.toHaveClass("selected")

    it "does nothing if the given size is already selected", ->
      sizes.select(3)
      for size, $grid in sizes.sizeGrids
        expect($grid).not.toHaveClass("selected")









