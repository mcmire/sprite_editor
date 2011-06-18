$.export "SpriteEditor.App", (SpriteEditor) ->

  App = {}
  SpriteEditor.DOMEventHelpers.mixin(App, "SpriteEditor_App")

  $.extend App,
    $container: null
    $leftPane: null
    $centerPane: null
    $rightPane: null
    colorSampleDivs:
      foreground: null
      background: null
    currentColor:
      type: "foreground"
      # These are always stored in HSL!
      foreground: (new SpriteEditor.Color.RGB(172, 85, 255)).toHSL()
      background: (new SpriteEditor.Color.RGB(255, 38, 192)).toHSL()
    currentToolName: "pencil"
    currentBrushSize: 1

    init: ->
      SpriteEditor.Keyboard.init()

      @canvases = SpriteEditor.DrawingCanvases.init(this)
      @tools = SpriteEditor.Tools.init(this, @canvases)
      @history = SpriteEditor.EventHistory.init(this)

      @$container = $("#main")
      @_createMask()
      @_createWrapperDivs()
      @_createImportExportDiv()
      @_addWorkingCanvas()
      @_createToolBox()
      @_createBrushSizesBox()
      @_createColorPickerBox()
      @_createPreviewBox()

      @addEvents()

      @canvases.draw()

      return this

    addEvents: ->
      @canvases.addEvents()
      @_bindEvents document,
        keydown: (event) =>
          key = event.keyCode
          if key == SpriteEditor.Keyboard.Z_KEY and (event.ctrlKey or event.metaKey)
            if event.shiftKey
              # Ctrl-Shift-Z or Command-Shift-Z: Redo last action
              @history.redo() if @history.canRedo()
            else
              # Ctrl-Z or Command-Z: Undo last action
              @history.undo() if @history.canUndo()
          else if key == SpriteEditor.Keyboard.X_KEY
            @_switchForegroundAndBackgroundColor()
          else if key == SpriteEditor.Keyboard.SHIFT_KEY
            @selectColorType("background")
          @currentTool().trigger("keydown", event)
        keyup: (event) =>
          @selectColorType("foreground")
          @currentTool().trigger("keyup", event)

    removeEvents: ->
      @canvases.removeEvents()
      @_unbindEvents(document, "keydown", "keyup")

    _createWrapperDivs: ->
      @$leftPane = $("<div/>")
      @$leftPane.attr("id", "left_pane")
      @$container.append(@$leftPane)

      @$rightPane = $("<div/>")
      @$rightPane.attr("id", "right_pane")
      @$container.append(@$rightPane)

      @$centerPane = $("<div/>")
      @$centerPane.attr("id", "center_pane")
      @$container.append(@$centerPane)

    _createImportExportDiv: ->
      $importExportDiv = $("<div id=\"import_export\" />")

      $importDiv = $("<div id=\"import\" />")
      $importErrorSpan = $("<span id=\"import_error\" style=\"display: none\" />")
      $importFileInput = $("<input type=\"file\" style=\"position: absolute; top: -10000px; left: -10000px\" />")
      $importFileButton = $("<button>Import PNG</button>")

      $importFileButton.bind "click", ->
        # Make the file chooser pop up
        $importFileInput.trigger "click"

      $importFileInput.bind "change", (event) ->
        # We'd like to handle the uploaded file asynchronously. Conventionally
        # we'd use Ajax and an iframe to do this, but this is always been sort
        # of a hack in my opinion. Fortunately, this is 2011 and we now have
        # support for the W3C File API in at least two of the major browsers
        # (Firefox 3.6 and Chrome 6 -- not sure about the others).
        #
        # As you can see the following solution is unbelievably clean. The
        # first thing is that file inputs now have a #files method which is an
        # array of File objects corresponding to the files that the user
        # uploaded (it's an array in case the file input had a "multiple"
        # property). Each File object has properties like `type`, `size`, etc.
        # We use these to make sure the user is uploading small PNGs.
        #
        # The second thing is the FileReader class which can be used to read
        # data from File objects. One of its methods is #readAsDataURL, which
        # returns a data: URI that corresponds to the image data. How does that
        # help? Well, remember that the `src` attribute of an <img> accepts a
        # URL (it doesn't matter what format). So we simply make a new <img>
        # tag and feed it the data: URI.
        #
        # So that's great, but we need to get that image and map it onto the
        # pixel editor, so how do we do that? Well, remember that Canvas
        # lets us draw an image element using the #drawImage method. So
        # first we make a new Canvas (with the same width and height as the
        # image) and call this method. That gets us an actual size version of
        # the image in canvas form, but we need to update the enlarged version
        # (the canvas that the user will actually interact with, with the
        # pixels). So the final step in the importing process is to read the
        # pixel data from this temporary canvas (using #createImageData and
        # #getPixelData) and fill in the cells in the enlarged canvas manually.
        #
        # If you want more info about the HTML File API, see:
        #
        # * <http://demos.hacks.mozilla.org/openweb/uploadingFiles/>
        # * <http://www.html5rocks.com/tutorials/file/dndfiles/>
        # * <http://dev.w3.org/2006/webapi/FileAPI/>
        #
        input = $importFileInput[0]
        file = input.files[0]
        error = ""
        unless file
          error = "Please select a file."
        else if !file.type or file.type isnt "image/png"
          # file.type will be empty if the type couldn't be detected
          error = "Sorry, you can only import PNGs."
        else error = "Sorry, the image you're trying to import is too big." if file.size > 1000
        if error
          $importErrorSpan.html(error).show()
        else
          $importErrorSpan.hide()
          reader = new FileReader()
          reader.onload = (event) =>
            img = document.createElement("img")
            img.src = event.target.result
            console.log(img.src)
            # We *could* update the preview canvas here, but it already gets
            # updated automatically when draw() is called
            c = SpriteEditor.Canvas.create(img.width, img.height)
            c.ctx.drawImage(img, 0, 0)
            imageData = c.ctx.getImageData(0, 0, img.width, img.height)
            for x in [0...img.width]
              for y in [0...img.height]
                do ->
                  rgba = imageData.getPixel(x, y)
                  color = SpriteEditor.Color.RGB(color.red, color.green, color.blue, color.alpha)
                  @cells[y][x].color = color unless color.isClear()
            @draw()
          reader.readAsDataURL(file)

      $importDiv.append($importErrorSpan)
      $importDiv.append($importFileInput)
      $importDiv.append($importFileButton)
      $importExportDiv.append($importDiv)

      # XXX: Getting an error in the Chrome console when the form is submitted:
      #
      #   POST http://localhost:5005/ undefined (undefined)
      #
      # I'm not sure what this means??
      #
      $exportForm = $('<form id="export" action="" method="POST"><input name="data" type="hidden" /><button type="submit">Export PNG</button></form>')
      $exportForm.bind "submit", =>
        data = @previewCanvas.element.toDataURL("image/png")
        data = data.replace(/^data:image\/png;base64,/, "")
        $exportForm.find("input").val(data)
      $importExportDiv.append($exportForm)

      @$centerPane.append($importExportDiv)

    _addWorkingCanvas: ->
      @$centerPane.append(@canvases.workingCanvas.$element)

    _createColorPickerBox: ->
      $boxDiv = $("<div/>").attr("id", "color_box").addClass("box")
      @$rightPane.append($boxDiv)

      $header = $("<h3/>").html("Color")
      $boxDiv.append($header)

      @colorSampleDivs = {}
      $.v.each ["foreground", "background"], (colorType) =>
        $div = $('<div class="color_sample" />')
        $div.bind
          click: =>
            @currentColor.beingEdited = colorType
            @colorPickerBox.open @currentColor[colorType]
          update: =>
            $div.css "background-color", @currentColor[colorType].toRGB().toString()
        $div.trigger("update")
        $boxDiv.append($div)
        @colorSampleDivs[colorType] = $div

      @selectColorType(@currentColor.type)

      @colorPickerBox = SpriteEditor.ColorPickerBox.init
        open: =>
          @removeEvents()
          @_showMask()
        close: =>
          @_hideMask()
          @addEvents()
          @currentColor.beingEdited = null
        change: (color) =>
          @colorSampleDivs[@currentColor.beingEdited].trigger("update")

      $(document.body).append(@colorPickerBox.$container)

    selectColorType: (colorType) ->
      @colorSampleDivs[@currentColor.type].removeClass("selected")
      @currentColor.type = colorType
      @colorSampleDivs[colorType].addClass("selected")

    _switchForegroundAndBackgroundColor: ->
      tmp = @currentColor.foreground
      @currentColor.foreground = @currentColor.background
      @currentColor.background = tmp
      @colorSampleDivs.foreground.trigger("update")
      @colorSampleDivs.background.trigger("update")

    _createPreviewBox: ->
      $boxDiv = $("<div/>").attr("id", "preview_box").addClass("box")
      @$rightPane.append($boxDiv)

      $header = $("<h3/>").html("Preview")
      $boxDiv.append($header)

      $boxDiv.append(@canvases.previewCanvas.$element)
      $boxDiv.append(@canvases.tiledPreviewCanvas.$element)

    _createToolBox: ->
      self = this

      $boxDiv = $("<div/>").attr("id", "tool_box").addClass("box")
      @$leftPane.append($boxDiv)

      $header = $("<h3/>").html("Toolbox")
      $boxDiv.append($header)

      $ul = $("<ul/>")
      $boxDiv.append($ul)

      $imgs = $([])
      for name in @tools.toolNames
        do (name) ->
          $li = $("<li/>")
          $img = $("<img/>")
          $img.addClass("tool")
            .attr("width", 24)
            .attr("height", 24)
            .attr("src", "images/"+name+".png")
          $imgs.push($img[0])
          $li.append($img)
          $ul.append($li)
          $img.bind "click", ->
            self.currentTool().unselect?() if name isnt self.currentToolName
            self.currentToolName = name
            $imgs.removeClass("selected")
            $img.addClass("selected")
            self.tools[name].select?()
          $img.trigger("click") if self.currentToolName == name

    currentTool: -> @tools[@currentToolName]

    # TODO: when the paint bucket tool is selected, hide the brush sizes box
    # and set the brush size to 1
    _createBrushSizesBox: ->
      self = this

      $boxDiv = $("<div/>").attr("id", "sizes_box").addClass("box")
      @$leftPane.append($boxDiv)

      $header = $("<h3/>").html("Sizes")
      $boxDiv.append($header)

      $grids = $([])
      for brushSize in [1..4]
        do (brushSize) ->
          grid = self._createGrid(self.canvases.cellSize * brushSize)
          $grids.push(grid.element)
          $boxDiv.append(grid.$element)
          grid.$element.bind "click", ->
            self.currentBrushSize = brushSize
            $grids.removeClass("selected")
            grid.$element.addClass("selected")
          grid.$element.trigger("click") if self.currentBrushSize == brushSize

    _createGrid: (size) ->
      SpriteEditor.Canvas.create size, size, (c) =>
        cellSize = @canvases.cellSize

        c.ctx.strokeStyle = "#eee"
        c.ctx.beginPath()
        # Draw vertical lines
        # We start at 0.5 because this is the midpoint of the path we want to stroke
        # See: <http://diveintohtml5.org/canvas.html#pixel-madness>
        for x in [0.5...size] by cellSize
          c.ctx.moveTo(x, 0)
          c.ctx.lineTo(x, size)
        # Draw horizontal lines
        for y in [0.5...size] by cellSize
          c.ctx.moveTo(0, y)
          c.ctx.lineTo(size, y)
        c.ctx.stroke()
        c.ctx.closePath()

        fontSize = 11
        c.ctx.font = "#{fontSize} px Helvetica"
        text = (size / cellSize) + "px"
        # Place the text that indicates the brush size in the center of the canvas
        # I don't know why I have to put "/4" here, but I do...
        metrics = c.ctx.measureText(text)
        c.ctx.fillText(text, size/2 - metrics.width/2, size/2 + fontSize/4)

    _createMask: ->
      @$maskDiv = $('<div id="mask" />').hide()
      $(document.body).append(@$maskDiv)

    _showMask: ->
      @$maskDiv.show()

    _hideMask: ->
      @$maskDiv.hide()

  return App