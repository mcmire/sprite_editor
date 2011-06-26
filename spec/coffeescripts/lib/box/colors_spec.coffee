Colors   = SpriteEditor.Box.Colors
Keyboard = SpriteEditor.Keyboard
Color    = SpriteEditor.Color

describe 'Box.Colors', ->
  app = colors = null
  beforeEach ->
    app = {colorPicker: {}}
    colors = Colors.init(app)

  it "responds to _bindEvents and _unbindEvents", ->
    expect(Colors._bindEvents).toBeTypeOf("function")
    expect(Colors._unbindEvents).toBeTypeOf("function")

  describe 'when initialized', ->
    it "sets @app to the given App instance", ->
      expect(colors.app).toBe(app)

    it "creates a container element for the box, with an h3 inside", ->
      $e = colors.$element
      $h = colors.$element.find("h3")

      expect($e[0].nodeName).toEqual("DIV")
      expect($e[0].id).toEqual("se-box-colors")
      expect($e[0].className).toMatch(/\bse-box\b/)

      expect($h[0].nodeName).toEqual("H3")
      expect($h.html()).toEqual("Colors")

    it "adds a div to the container for the foreground color sample, and stores it in colorSampleDivs", ->
      $e = colors.$element.find('div.color_sample:nth-of-type(1)')
      $e2 = colors.colorSampleDivs.foreground
      expect($e[0]).toBe($e2[0])

    it "initializes the color of the foreground color sample to the foreground color", ->
      $e = colors.colorSampleDivs.foreground
      expect($e).toHaveCss("background-color", "rgb(172, 85, 255)")

    it "adds a div to the container for the background color sample, and stores it in colorSampleDivs", ->
      $e = colors.$element.find('div.color_sample:nth-of-type(2)')
      $e2 = colors.colorSampleDivs.background
      expect($e[0]).toBe($e2[0])

    it "initializes the color of the background color sample to the background color", ->
      $e = colors.colorSampleDivs.background
      expect($e).toHaveCss("background-color", "rgb(255, 38, 192)")

    it "marks the foreground color sample as selected", ->
      expect(colors.currentColorType).toEqual("foreground")

      $fg = colors.colorSampleDivs.foreground
      expect($fg).toHaveClass("selected")

      $bg = colors.colorSampleDivs.background
      expect($bg).not.toHaveClass("selected")

  describe 'when events have been added', ->
    beforeEach -> colors.addEvents()

    describe 'if X is pressed', ->
      beforeEach ->
        specHelpers.fireNativeEvent document, "keydown", (evt) ->
          evt.keyCode = Keyboard.X_KEY

      it "switches the foreground and background colors", ->
        expect(colors.currentColors.foreground).toEqualColor(new Color(red: 255, green: 38, blue: 192))
        expect(colors.currentColors.background).toEqualColor(new Color(red: 172, green: 85, blue: 255))

      it "redraws the foreground color sample with the new foreground color", ->
        $fg = colors.colorSampleDivs.foreground
        expect($fg).toHaveCss("background-color", "rgb(255, 38, 192)")

      it "redraws the background color sample with the new background color", ->
        $bg = colors.colorSampleDivs.background
        expect($bg).toHaveCss("background-color", "rgb(172, 85, 255)")

    describe 'if shift is pressed', ->
      beforeEach ->
        specHelpers.fireNativeEvent document, "keydown", (evt) ->
          evt.keyCode = Keyboard.SHIFT_KEY

      it "marks the background color sample as selected", ->
        expect(colors.currentColorType).toEqual("background")

        $fg = colors.colorSampleDivs.foreground
        expect($fg).not.toHaveClass("selected")

        $bg = colors.colorSampleDivs.background
        expect($bg).toHaveClass("selected")

    describe 'if a key is lifted', ->
      beforeEach ->
        specHelpers.fireNativeEvent document, "keyup"

      it "marks the foreground color sample as selected", ->
        expect(colors.currentColorType).toEqual("foreground")

        $fg = colors.colorSampleDivs.foreground
        expect($fg).toHaveClass("selected")

        $bg = colors.colorSampleDivs.background
        expect($bg).not.toHaveClass("selected")

  describe 'when events have been removed', ->
    beforeEach ->
      colors.addEvents()
      colors.removeEvents()

    describe 'if X is pressed', ->
      beforeEach ->
        specHelpers.fireNativeEvent document, "keydown", (evt) ->
          evt.keyCode = Keyboard.X_KEY

      it "doesn't switch the foreground and background colors", ->
        expect(colors.currentColors.foreground).toEqualColor(new Color(red: 172, green: 85, blue: 255))
        expect(colors.currentColors.background).toEqualColor(new Color(red: 255, green: 38, blue: 192))

      it "keeps the foreground color sample the same", ->
        $fg = colors.colorSampleDivs.foreground
        expect($fg).toHaveCss("background-color", "rgb(172, 85, 255)")

      it "keeps the background color sample the same", ->
        $bg = colors.colorSampleDivs.background
        expect($bg).toHaveCss("background-color", "rgb(255, 38, 192)")

    describe 'if shift is pressed', ->
      beforeEach ->
        specHelpers.fireNativeEvent document, "keydown", (evt) ->
          evt.keyCode = Keyboard.SHIFT_KEY

      it "doesn't mark the background color sample as selected", ->
        expect(colors.currentColorType).toEqual("foreground")

        $fg = colors.colorSampleDivs.foreground
        expect($fg).toHaveClass("selected")

        $bg = colors.colorSampleDivs.background
        expect($bg).not.toHaveClass("selected")

    describe 'if a key is lifted', ->
      beforeEach ->
        specHelpers.fireNativeEvent document, "keyup"

      it "keeps the selected color sample as the foreground color sample", ->
        expect(colors.currentColorType).toEqual("foreground")

        $fg = colors.colorSampleDivs.foreground
        expect($fg).toHaveClass("selected")

        $bg = colors.colorSampleDivs.background
        expect($bg).not.toHaveClass("selected")

  describe 'the foreground color sample', ->
    color = null
    beforeEach ->
      color = colors.currentColors.foreground = new Color(red: 255, green: 0, blue: 0)
    describe 'on click', ->
      it "opens the color picker set to the current foreground color", ->
        app.colorPicker.open = jasmine.createSpy()
        $fg = colors.colorSampleDivs.foreground
        specHelpers.fireNativeEvent($fg[0], 'click')
        expect(app.colorPicker.open).toHaveBeenCalledWith(color, "foreground")
    describe 'on render', ->
      it "draws the foreground color sample with the current foreground color", ->
        $fg = colors.colorSampleDivs.foreground
        specHelpers.fireCustomEvent($fg[0], 'render')
        expect($fg).toHaveCss("background-color", "rgb(255, 0, 0)")

  describe 'the background color sample', ->
    color = null
    beforeEach ->
      color = colors.currentColors.background = new Color(red: 255, green: 0, blue: 0)
    describe 'on click', ->
      it "opens the color picker set to the current background color", ->
        app.colorPicker.open = jasmine.createSpy()
        $bg = colors.colorSampleDivs.background
        specHelpers.fireNativeEvent($bg[0], 'click')
        expect(app.colorPicker.open).toHaveBeenCalledWith(color, "background")
    describe 'on render', ->
      it "draws the background color sample with the current background color", ->
        $bg = colors.colorSampleDivs.background
        specHelpers.fireCustomEvent($bg[0], 'render')
        expect($bg).toHaveCss("background-color", "rgb(255, 0, 0)")

  describe 'on update', ->
    describe 'when the foreground color is selected', ->
      beforeEach ->
        colors.currentColorType = "foreground"
        colors.update(new Color(red: 255, green: 0, blue: 0))

      it "sets the foreground color to the given color", ->
        expect(colors.currentColors.foreground).toEqualColor(new Color(red: 255, green: 0, blue: 0))

      it "redraws the foreground color sample with the new color", ->
        $fg = colors.colorSampleDivs.foreground
        expect($fg).toHaveCss("background-color", "rgb(255, 0, 0)")

    describe 'when the background color is selected', ->
      beforeEach ->
        colors.currentColorType = "background"
        colors.update(new Color(red: 255, green: 0, blue: 0))

      it "sets the background color to the given color", ->
        expect(colors.currentColors.background).toEqualColor(new Color(red: 255, green: 0, blue: 0))

      it "redraws the background color sample with the new color", ->
        $bg = colors.colorSampleDivs.background
        expect($bg).toHaveCss("background-color", "rgb(255, 0, 0)")

  describe '.currentColor', ->
    it "returns the foreground color when the foreground color is selected", ->
      colors.currentColorType = "foreground"
      colors.currentColors.foreground = new Color(red: 255, green: 0, blue: 0)
      expect(colors.currentColor()).toEqualColor(new Color(red: 255, green: 0, blue: 0))

    it "returns the background color when the background color is selected", ->
      colors.currentColorType = "background"
      colors.currentColors.background = new Color(red: 255, green: 0, blue: 0)
      expect(colors.currentColor()).toEqualColor(new Color(red: 255, green: 0, blue: 0))