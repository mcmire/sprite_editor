$.export "SpriteEditor.App", (SpriteEditor) ->

  Keyboard = SpriteEditor.Keyboard

  App = {}
  SpriteEditor.DOMEventHelpers.mixin(App, "SpriteEditor_App")

  $.extend App,
    init: ->
      unless @isInitialized
        @reset()

        Keyboard.init()
        @canvases = SpriteEditor.DrawingCanvases.init(this)
        @toolset = SpriteEditor.Toolset.init(this, @canvases)
        @history = SpriteEditor.EventHistory.init(this)

        @$container = $('<div />');
        @_createMask()
        @_createWrapperDivs()
        @_createImportExportDiv()
        @_addWorkingCanvas()
        @_createToolBox()
        @_createBrushSizesBox()
        @_createColorPicker()
        @_createPreviewBox()

        @isInitialized = true

      return this

    hook: (wrapper) ->
      $(wrapper).append(@$container)
      $(document.body).append(@$maskDiv)
      $(document.body).append(@colorPicker.$container)

    destroy: ->
      if @isInitialized
        @removeEvents()
        Keyboard.destroy()
        @canvases.destroy()
        @toolset.destroy()
        @history.destroy()
        @reset()
        @isInitialized = false
      return this

    reset: ->
      @canvases = null
      @toolset = null
      @history = null
      @boxes = {}
      @$leftPane = null
      @$centerPane = null
      @$rightPane = null
      @$container = null
      @maskDiv?.remove()
      @maskDiv = null
      @colorPicker?.$container.remove()
      @colorPicker = null
      return this

    addEvents: ->
      Keyboard.addEvents()
      @canvases.addEvents()   # will start the draw loop
      @boxes.tools.addEvents()
      @boxes.sizes.addEvents()
      @boxes.colors.addEvents()

      @_bindEvents document,
        keydown: (event) =>
          key = event.keyCode
          if key == Keyboard.Z_KEY and (event.ctrlKey or event.metaKey)
            if event.shiftKey
              # Ctrl-Shift-Z or Command-Shift-Z: Redo last action
              @history.redo() if @history.canRedo()
            else
              # Ctrl-Z or Command-Z: Undo last action
              @history.undo() if @history.canUndo()
          @boxes.tools.currentTool().trigger("keydown", event)

        keyup: (event) =>
          @boxes.tools.currentTool().trigger("keyup", event)

      return this

    removeEvents: ->
      Keyboard.removeEvents()
      @canvases.removeEvents()
      @boxes.tools.removeEvents()
      @boxes.sizes.removeEvents()
      @boxes.colors.removeEvents()
      @_unbindEvents(document, "keydown", "keyup")
      return this

    _createWrapperDivs: ->
      @$leftPane = $('<div id="left_pane" />')
      @$container.append(@$leftPane)

      @$rightPane = $('<div id="right_pane" />')
      @$container.append(@$rightPane)

      @$centerPane = $('<div id="center_pane" />')
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
                  color = new SpriteEditor.Color(color)
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
      $exportForm = $('
        <form id="export" action="" method="POST">
          <input name="data" type="hidden" />
          <button type="submit">Export PNG</button>
        </form>
      '.trim())
      $exportForm.bind "submit", =>
        data = @previewCanvas.element.toDataURL("image/png")
        data = data.replace(/^data:image\/png;base64,/, "")
        $exportForm.find("input").val(data)
      $importExportDiv.append($exportForm)

      @$centerPane.append($importExportDiv)

    _addWorkingCanvas: ->
      @$centerPane.append(@canvases.workingCanvas.$element)

    _createColorPicker: ->
      @boxes.colors = box = SpriteEditor.Box.Colors.init(this)
      @$rightPane.append(box.$element)

      @colorPicker = SpriteEditor.ColorPicker.init(this,
        open: =>
          @removeEvents()
          @_showMask()
        close: =>
          @_hideMask()
          @addEvents()
      )

    _createPreviewBox: ->
      $boxDiv = $("<div/>").attr("id", "preview_box").addClass("box")
      @$rightPane.append($boxDiv)

      $header = $("<h3/>").html("Preview")
      $boxDiv.append($header)

      $boxDiv.append(@canvases.previewCanvas.$element)
      $boxDiv.append(@canvases.tiledPreviewCanvas.$element)

    _createToolBox: ->
      @boxes.tools = box = SpriteEditor.Box.Tools.init(this)
      @$leftPane.append(box.$element)

    # TODO: when the paint bucket tool is selected, hide the brush sizes box
    # and set the brush size to 1
    _createBrushSizesBox: ->
      @boxes.sizes = box = SpriteEditor.Box.Sizes.init(this)
      @$leftPane.append(box.$element)

    _createMask: ->
      @$maskDiv = $('<div id="mask" />').hide()

    _showMask: ->
      @$maskDiv.show()

    _hideMask: ->
      @$maskDiv.hide()

  return App