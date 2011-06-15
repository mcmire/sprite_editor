((window, document, $, undefined_) ->
  App = {}
  SpriteEditor.DOMEventHelpers.mixin App, "SpriteEditor_App"
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
      foreground: (new SpriteEditor.Color.RGB(172, 85, 255)).toHSL()
      background: (new SpriteEditor.Color.RGB(255, 38, 192)).toHSL()
    
    currentToolName: "pencil"
    currentBrushSize: 1
    init: ->
      self = this
      SpriteEditor.Keyboard.init()
      self.canvases = SpriteEditor.DrawingCanvases.init(self)
      self.tools = SpriteEditor.Tools.init(self, self.canvases)
      self.history = SpriteEditor.EventHistory.init(self)
      self.$container = $("#main")
      self._createMask()
      self._createWrapperDivs()
      self._createImportExportDiv()
      self._addWorkingCanvas()
      self._createToolBox()
      self._createBrushSizesBox()
      self._createColorPickerBox()
      self._createPreviewBox()
      self.addEvents()
      self.canvases.draw()
      self
    
    addEvents: ->
      self = this
      self.canvases.addEvents()
      self._bindEvents document, 
        keydown: (event) ->
          key = event.keyCode
          if key == SpriteEditor.Keyboard.Z_KEY and (event.ctrlKey or event.metaKey)
            if event.shiftKey
              self.history.redo()  if self.history.canRedo()
            else
              self.history.undo()  if self.history.canUndo()
          else if key == SpriteEditor.Keyboard.X_KEY
            self._switchForegroundAndBackgroundColor()
          else self.selectColorType "background"  if key == SpriteEditor.Keyboard.SHIFT_KEY
          self.currentTool().trigger "keydown", event
        
        keyup: (event) ->
          self.selectColorType "foreground"
          self.currentTool().trigger "keyup", event
    
    removeEvents: ->
      self = this
      self.canvases.removeEvents()
      self._unbindEvents document, "keydown", "keyup"
    
    _createWrapperDivs: ->
      self = this
      self.$leftPane = $("<div/>")
      self.$leftPane.attr "id", "left_pane"
      self.$container.append self.$leftPane
      self.$rightPane = $("<div/>")
      self.$rightPane.attr "id", "right_pane"
      self.$container.append self.$rightPane
      self.$centerPane = $("<div/>")
      self.$centerPane.attr "id", "center_pane"
      self.$container.append self.$centerPane
    
    _createImportExportDiv: ->
      self = this
      $importExportDiv = $("<div id=\"import_export\" />")
      $importDiv = $("<div id=\"import\" />")
      $importErrorSpan = $("<span id=\"import_error\" style=\"display: none\" />")
      $importFileInput = $("<input type=\"file\" style=\"position: absolute; top: -10000px; left: -10000px\" />")
      $importFileButton = $("<button>Import PNG</button>")
      $importFileButton.bind "click", ->
        $importFileInput.trigger "click"
      
      $importFileInput.bind "change", (event) ->
        input = $importFileInput[0]
        file = input.files[0]
        error = ""
        unless file
          error = "Please select a file."
        else if not file.type or file.type != "image/png"
          error = "Sorry, you can only import PNGs."
        else error = "Sorry, the image you're trying to import is too big."  if file.size > 1000
        if error
          $importErrorSpan.html(error).show()
        else
          $importErrorSpan.hide()
          reader = new FileReader()
          reader.onload = (event) ->
            img = document.createElement("img")
            img.src = event.target.result
            console.log img.src
            c = SpriteEditor.Canvas.create(img.width, img.height)
            c.ctx.drawImage img, 0, 0
            imageData = c.ctx.getImageData(0, 0, img.width, img.height)
            x = 0
            
            while x < img.width
              y = 0
              
              while y < img.height
                (->
                  rgba = imageData.getPixel(x, y)
                  color = SpriteEditor.Color.RGB(color.red, color.green, color.blue, color.alpha)
                  self.cells[y][x].color = color  unless color.isClear()
                )()
                y++
              x++
            self.draw()
          
          reader.readAsDataURL file
      
      $importDiv.append $importErrorSpan
      $importDiv.append $importFileInput
      $importDiv.append $importFileButton
      $importExportDiv.append $importDiv
      $exportForm = $("<form id=\"export\" action=\"/\" method=\"POST\"><input name=\"data\" type=\"hidden\" /><button type=\"submit\">Export PNG</button></form>")
      $exportForm.bind "submit", ->
        data = self.previewCanvas.element.toDataURL("image/png")
        data = data.replace(/^data:image\/png;base64,/, "")
        $exportForm.find("input").val data
      
      $importExportDiv.append $exportForm
      self.$centerPane.append $importExportDiv
    
    _addWorkingCanvas: ->
      self = this
      self.$centerPane.append self.canvases.workingCanvas.$element
    
    _createColorPickerBox: ->
      self = this
      $boxDiv = $("<div/>").attr("id", "color_box").addClass("box")
      self.$rightPane.append $boxDiv
      $header = $("<h3/>").html("Color")
      $boxDiv.append $header
      self.colorSampleDivs = $.v.reduce([ "foreground", "background" ], (hash, colorType) ->
        $div = $("<div class=\"color_sample\" />")
        $div.bind 
          click: ->
            self.currentColor.beingEdited = colorType
            self.colorPickerBox.open self.currentColor[colorType]
          
          update: ->
            $div.css "background-color", self.currentColor[colorType].toRGB().toString()
        
        $div.trigger "update"
        $boxDiv.append $div
        hash[colorType] = $div
        hash
      , {})
      self.selectColorType self.currentColor.type
      self.colorPickerBox = SpriteEditor.ColorPickerBox.init(
        open: ->
          self.removeEvents()
          self._showMask()
        
        close: ->
          self._hideMask()
          self.addEvents()
          self.currentColor.beingEdited = null
        
        change: (color) ->
          self.colorSampleDivs[self.currentColor.beingEdited].trigger "update"
      )
      $(document.body).append self.colorPickerBox.$container
    
    selectColorType: (colorType) ->
      self = this
      self.colorSampleDivs[self.currentColor.type].removeClass "selected"
      self.currentColor.type = colorType
      self.colorSampleDivs[colorType].addClass "selected"
    
    _switchForegroundAndBackgroundColor: ->
      self = this
      tmp = self.currentColor.foreground
      self.currentColor.foreground = self.currentColor.background
      self.currentColor.background = tmp
      self.colorSampleDivs.foreground.trigger "update"
      self.colorSampleDivs.background.trigger "update"
    
    _createPreviewBox: ->
      self = this
      $boxDiv = $("<div/>").attr("id", "preview_box").addClass("box")
      self.$rightPane.append $boxDiv
      $header = $("<h3/>").html("Preview")
      $boxDiv.append $header
      $boxDiv.append self.canvases.previewCanvas.$element
      $boxDiv.append self.canvases.tiledPreviewCanvas.$element
    
    _createToolBox: ->
      self = this
      $boxDiv = $("<div/>").attr("id", "tool_box").addClass("box")
      self.$leftPane.append $boxDiv
      $header = $("<h3/>").html("Toolbox")
      $boxDiv.append $header
      $ul = $("<ul/>")
      $boxDiv.append $ul
      $imgs = $([])
      $.v.each self.tools.toolNames, (name) ->
        $li = $("<li/>")
        $img = $("<img/>")
        $img.addClass("tool").attr("width", 24).attr("height", 24).attr "src", "images/" + name + ".png"
        $imgs.push $img[0]
        $li.append $img
        $ul.append $li
        $img.bind "click", ->
          self.currentTool().unselect()  if name != self.currentToolName and typeof self.currentTool().unselect != "undefined"
          self.currentToolName = name
          $imgs.removeClass "selected"
          $img.addClass "selected"
          self.tools[name].select()  unless typeof self.tools[name].select == "undefined"
        
        $img.trigger "click"  if self.currentToolName == name
    
    currentTool: ->
      @tools[@currentToolName]
    
    _createBrushSizesBox: ->
      self = this
      $boxDiv = $("<div/>").attr("id", "sizes_box").addClass("box")
      self.$leftPane.append $boxDiv
      $header = $("<h3/>").html("Sizes")
      $boxDiv.append $header
      $grids = $([])
      $.v.each [ 1, 2, 3, 4 ], (brushSize) ->
        grid = self._createGrid(self.canvases.cellSize * brushSize)
        $grids.push grid.element
        $boxDiv.append grid.$element
        grid.$element.bind "click", ->
          self.currentBrushSize = brushSize
          $grids.removeClass "selected"
          grid.$element.addClass "selected"
        
        grid.$element.trigger "click"  if self.currentBrushSize == brushSize
    
    _createGrid: (size) ->
      self = this
      SpriteEditor.Canvas.create size, size, (c) ->
        cellSize = self.canvases.cellSize
        c.ctx.strokeStyle = "#eee"
        c.ctx.beginPath()
        x = 0.5
        
        while x < size
          c.ctx.moveTo x, 0
          c.ctx.lineTo x, size
          x += cellSize
        y = 0.5
        
        while y < size
          c.ctx.moveTo 0, y
          c.ctx.lineTo size, y
          y += cellSize
        c.ctx.stroke()
        c.ctx.closePath()
        fontSize = 11
        c.ctx.font = fontSize + "px Helvetica"
        text = (size / cellSize) + "px"
        metrics = c.ctx.measureText(text)
        c.ctx.fillText text, size / 2 - metrics.width / 2, size / 2 + fontSize / 4
    
    _createMask: ->
      self = this
      self.$maskDiv = $("<div id=\"mask\" />").hide()
      $(document.body).append self.$maskDiv
    
    _showMask: ->
      self = this
      self.$maskDiv.show()
    
    _hideMask: ->
      self = this
      self.$maskDiv.hide()
  
  $.export "SpriteEditor.App", App
) window, window.document, window.ender
