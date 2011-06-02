(function(window, document, $, undefined) {

var App = {
  $container: null,
  $leftPane: null,
  $centerPane: null,
  $rightPane: null,
  colorSampleDivs: {
    foreground: null,
    background: null,
  },
  currentColor: {
    type: "foreground",
    foreground: SpriteEditor.Color.fromRGB(172, 85, 255),
    background: SpriteEditor.Color.fromRGB(255, 38, 192)
  },
  currentToolName: "select",
  currentBrushSize: 1,

  init: function() {
    var self = this;

    SpriteEditor.Keyboard.init();

    self.canvases = SpriteEditor.DrawingCanvases.init(self);
    self.tools = SpriteEditor.Tools.init(self, self.canvases);

    self.$container = $('#main');
    self._createMask();
    self._createWrapperDivs();
    self._createImportExportDiv();
    self._addWorkingCanvas();
    self._createToolBox();
    self._createBrushSizesBox();
    self._createColorPickerBox();
    self._createPreviewBox();

    self.addEvents();

    self.canvases.draw();

    return self;
  },

  addEvents: function() {
    var self = this;
    self.canvases.addEvents();
    $(document).bind({
      "keydown.colorBox": function(event) {
        var key = event.keyCode;
        if (key == SpriteEditor.Keyboard.X_KEY) {
          self._switchForegroundAndBackgroundColor();
        }
      }
    })
  },

  removeEvents: function() {
    var self = this;
    self.canvases.removeEvents();
    $(document).unbind("keydown.colorBox");
  },

  _createWrapperDivs: function() {
    var self = this;

    self.$leftPane = $("<div/>");
    self.$leftPane.attr("id", "left_pane");
    self.$container.append(self.$leftPane);

    self.$rightPane = $("<div/>");
    self.$rightPane.attr("id", "right_pane");
    self.$container.append(self.$rightPane);

    self.$centerPane = $("<div/>");
    self.$centerPane.attr("id", "center_pane");
    self.$container.append(self.$centerPane);
  },

  _createImportExportDiv: function() {
    var self = this;
    var $importExportDiv = $('<div id="import_export" />');

    var $importDiv = $('<div id="import" />');
    var $importErrorSpan = $('<span id="import_error" style="display: none" />');
    var $importFileInput = $('<input type="file" style="position: absolute; top: -10000px; left: -10000px" />');
    var $importFileButton = $('<button>Import PNG</button>');
    $importFileButton.bind('click', function() {
      // Make the file chooser pop up
      $importFileInput.trigger('click');
    })
    $importFileInput.bind('change', function(event)
    {
      // We'd like to handle the uploaded file asynchronously. Conventionally
      // we'd use Ajax and an iframe to do this, but this is always been sort
      // of a hack in my opinion. Fortunately, this is 2011 and we now have
      // support for the W3C File API in at least two of the major browsers
      // (Firefox 3.6 and Chrome 6 -- not sure about the others).
      //
      // As you can see the following solution is unbelievably clean. The
      // first thing is that file inputs now have a #files method which is an
      // array of File objects corresponding to the files that the user
      // uploaded (it's an array in case the file input had a "multiple"
      // property). Each File object has properties like `type`, `size`, etc.
      // We use these to make sure the user is uploading small PNGs.
      //
      // The second thing is the FileReader class which can be used to read
      // data from File objects. One of its methods is #readAsDataURL, which
      // returns a data: URI that corresponds to the image data. How does that
      // help? Well, remember that the `src` attribute of an <img> accepts a
      // URL (it doesn't matter what format). So we simply make a new <img>
      // tag and feed it the data: URI.
      //
      // So that's great, but we need to get that image and map it onto the
      // pixel editor, so how do we do that? Well, remember that Canvas
      // lets us draw an image element using the #drawImage method. So
      // first we make a new Canvas (with the same width and height as the
      // image) and call this method. That gets us an actual size version of
      // the image in canvas form, but we need to update the enlarged version
      // (the canvas that the user will actually interact with, with the
      // pixels). So the final step in the importing process is to read the
      // pixel data from this temporary canvas (using #createImageData and
      // #getPixelData) and fill in the cells in the enlarged canvas manually.
      //
      // If you want more info about the HTML File API, see:
      //
      // * <http://demos.hacks.mozilla.org/openweb/uploadingFiles/>
      // * <http://www.html5rocks.com/tutorials/file/dndfiles/>
      // * <http://dev.w3.org/2006/webapi/FileAPI/>
      //
      var input = $importFileInput[0];
      var file = input.files[0];
      var error = "";
      if (!file) {
        error = "Please select a file."
      } else if (!file.type || file.type != "image/png") {
        // file.type will be empty if the type couldn't be detected
        error = "Sorry, you can only import PNGs."
      } else if (file.size > 1000) {
        error = "Sorry, the image you're trying to import is too big."
      }
      if (error) {
        $importErrorSpan.html(error).show();
      } else {
        $importErrorSpan.hide();
        var reader = new FileReader();
        reader.onload = function(event) {
          var img = document.createElement("img");
          img.src = event.target.result;
          console.log(img.src);
          // We *could* update the preview canvas here, but it already gets
          // updated automatically when draw() is called
          var c = SpriteEditor.Canvas.create(img.width, img.height);
          c.ctx.drawImage(img, 0, 0);
          var imageData = c.ctx.getImageData(0, 0, img.width, img.height);
          for (var x=0; x<img.width; x++) {
            for (var y=0; y<img.height; y++) {
              var color = imageData.getPixel(x, y);
              // Transparent black means the pixel wasn't set
              if (color.red != 0 && color.green != 0 && color.blue != 0 && color.alpha != 0) {
                self.cells[y][x].color = SpriteEditor.Color.fromRGB(color.red, color.green, color.blue);
              }
            }
          }
          self.draw();
        }
        reader.readAsDataURL(file);
      }
    })
    $importDiv.append($importErrorSpan);
    $importDiv.append($importFileInput);
    $importDiv.append($importFileButton);
    $importExportDiv.append($importDiv);

    // XXX: Getting an error in the Chrome console when the form is submitted:
    //
    //   POST http://localhost:5005/ undefined (undefined)
    //
    // I'm not sure what this means??
    //
    var $exportForm = $('<form id="export" action="/" method="POST"><input name="data" type="hidden" /><button type="submit">Export PNG</button></form>');
    $exportForm.bind('submit', function() {
      var data = self.previewCanvas.element.toDataURL("image/png");
      data = data.replace(/^data:image\/png;base64,/, "");
      $exportForm.find('input').val(data);
    })
    $importExportDiv.append($exportForm);

    self.$centerPane.append($importExportDiv);
  },

  _addWorkingCanvas: function() {
    var self = this;
    self.$centerPane.append(self.canvases.workingCanvas.$element);
  },

  _createColorPickerBox: function() {
    var self = this;

    var $boxDiv = $("<div/>").attr("id", "color_box").addClass("box");
    self.$rightPane.append($boxDiv);

    var $header = $("<h3/>").html("Color");
    $boxDiv.append($header);

    self.colorSampleDivs = $.v.reduce(["foreground", "background"], function(hash, colorType) {
      var $div = $('<div class="color_sample" />');
      $div.bind({
        click: function() {
          self.currentColor.beingEdited = colorType;
          self.colorPickerBox.open(self.currentColor[colorType]);
        },
        update: function() {
          $div.css("background-color", self.currentColor[colorType].toRGBAString())
        }
      })
      $div.trigger('update');
      $boxDiv.append($div);
      hash[colorType] = $div;
      return hash;
    }, {});

    self.selectColorType(self.currentColor.type);

    self.colorPickerBox = SpriteEditor.ColorPickerBox.init({
      open: function() {
        self.removeEvents();
        self._showMask();
      },
      close: function() {
        self._hideMask();
        self.addEvents();
        self.currentColor.beingEdited = null;
      },
      change: function(color) {
        self.colorSampleDivs[self.currentColor.beingEdited].trigger('update');
      }
    });
    $(document.body).append(self.colorPickerBox.$container);
  },
  selectColorType: function(colorType) {
    var self = this;
    self.colorSampleDivs[self.currentColor.type].removeClass('selected');
    self.currentColor.type = colorType;
    self.colorSampleDivs[colorType].addClass('selected');
  },
  _switchForegroundAndBackgroundColor: function() {
    var self = this;
    var tmp = self.currentColor.foreground;
    self.currentColor.foreground = self.currentColor.background;
    self.currentColor.background = tmp;
    self.colorSampleDivs.foreground.trigger('update');
    self.colorSampleDivs.background.trigger('update');
  },

  _createPreviewBox: function() {
    var self = this;

    var $boxDiv = $("<div/>").attr("id", "preview_box").addClass("box");
    self.$rightPane.append($boxDiv);

    var $header = $("<h3/>").html("Preview");
    $boxDiv.append($header);

    $boxDiv.append(self.canvases.previewCanvas.$element);
    $boxDiv.append(self.canvases.tiledPreviewCanvas.$element);
  },

  _createToolBox: function() {
    var self = this;

    var $boxDiv = $("<div/>").attr("id", "tool_box").addClass("box");
    self.$leftPane.append($boxDiv);

    var $header = $("<h3/>").html("Toolbox");
    $boxDiv.append($header);

    var $ul = $("<ul/>");
    $boxDiv.append($ul);

    var $imgs = $([]);
    $.v.each(self.tools.toolNames, function(name) {
      var $li = $("<li/>");

      var $img = $("<img/>");
      $img.addClass("tool")
          .attr("width", 24)
          .attr("height", 24)
          .attr("src", "images/"+name+".png");
      $imgs.push($img[0]);
      $li.append($img);
      $ul.append($li);

      $img.bind('click', function() {
        if (name != self.currentToolName && typeof self.currentTool().unselect != "undefined") {
          self.currentTool().unselect();
        }
        self.currentToolName = name;
        $imgs.removeClass("selected");
        $img.addClass("selected");
        if (typeof self.tools[name].select != "undefined") {
          self.tools[name].select();
        }
      })
      if (self.currentToolName == name) $img.trigger('click');
    })
  },
  currentTool: function() {
    return this.tools[this.currentToolName];
  },

  // TODO: when the paint bucket tool is selected, hide the brush sizes box
  // and set the brush size to 1
  _createBrushSizesBox: function() {
    var self = this;

    var $boxDiv = $("<div/>").attr("id", "sizes_box").addClass("box");
    self.$leftPane.append($boxDiv);

    var $header = $("<h3/>").html("Sizes");
    $boxDiv.append($header);

    var $grids = $([]);
    $.v.each([1, 2, 3, 4], function(brushSize) {
      var grid = self._createGrid(self.canvases.cellSize * brushSize);
      $grids.push(grid.element);
      $boxDiv.append(grid.$element);
      grid.$element.bind('click', function() {
        self.currentBrushSize = brushSize;
        $grids.removeClass("selected");
        grid.$element.addClass("selected");
      })
      if (self.currentBrushSize == brushSize) {
        grid.$element.trigger('click');
      }
    })
  },
  _createGrid: function(size) {
    var self = this;
    return SpriteEditor.Canvas.create(size, size, function(c) {
      var cellSize = self.canvases.cellSize;

      c.ctx.strokeStyle = "#eee";
      c.ctx.beginPath();
        // Draw vertical lines
        // We start at 0.5 because this is the midpoint of the path we want to stroke
        // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
        for (var x = 0.5; x < size; x += cellSize) {
          c.ctx.moveTo(x, 0);
          c.ctx.lineTo(x, size);
        }
        // Draw horizontal lines
        for (var y = 0.5; y < size; y += cellSize) {
          c.ctx.moveTo(0, y);
          c.ctx.lineTo(size, y);
        }
        c.ctx.stroke();
      c.ctx.closePath();

      var fontSize = 11;
      c.ctx.font = fontSize+"px Helvetica";
      var text = (size / cellSize) + "px";
      // Place the text that indicates the brush size in the center of the canvas
      // I don't know why it's /4 here, but it is...
      var metrics = c.ctx.measureText(text);
      c.ctx.fillText(text, size/2-metrics.width/2, size/2+fontSize/4);
    });
  },

  _createMask: function() {
    var self = this;
    self.$maskDiv = $('<div id="mask" />').hide();
    $(document.body).append(self.$maskDiv);
  },
  _showMask: function() {
    var self = this;
    self.$maskDiv.show();
  },
  _hideMask: function() {
    var self = this;
    self.$maskDiv.hide();
  }
};
$.export('SpriteEditor.App', App);

})(window, window.document, window.ender);
