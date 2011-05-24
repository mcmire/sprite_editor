(function(window, document, $, undefined) {

  var SpriteEditor = {};

  var Grid = {};
  Grid.create = function(editor, width, height) {
    return Canvas.create(width, height, function(c) {
      c.ctx.strokeStyle = "#eee";
      c.ctx.beginPath();
        // Draw vertical lines
        // We start at 0.5 because this is the midpoint of the path we want to stroke
        // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
        for (var x = 0.5; x < width; x += editor.cellSize) {
          c.ctx.moveTo(x, 0);
          c.ctx.lineTo(x, height);
        }
        // Draw horizontal lines
        for (var y = 0.5; y < height; y += editor.cellSize) {
          c.ctx.moveTo(0, y);
          c.ctx.lineTo(width, y);
        }
        c.ctx.stroke();
      c.ctx.closePath();

      var fontSize = 11;
      c.ctx.font = fontSize+"px Helvetica";
      var text = (width / editor.cellSize) + "px";
      var metrics = c.ctx.measureText(text);
      // I don't know why it's /4 here, but it is...
      c.ctx.fillText(text, width/2-metrics.width/2, height/2+fontSize/4);
    });
  }

  var Cell = function() {
    Cell.prototype.init.apply(this, arguments);
  }
  $.extend(Cell.prototype, {
    init: function(editor, x, y) {
      var self = this;
      self.editor = editor;
      self.x = x;
      self.y = y;
      self.actual = {x: x, y: y};
      self.enlarged = {x: x*editor.cellSize, y: y*editor.cellSize};
    },
    coords: function() {
      var self = this;
      return [self.actual.x, self.actual.y].join(",")
    },
    clone: function() {
      var self = this;
      var cell = new Cell(self.editor, self.actual.x, self.actual.y);
      if (self.color) cell.color = self.color.clone();
      return cell;
    }
  })

 /*!
  * CellHistory is responsible for storing the version history of cells in
  * the pixel grid, and for providing the undo/redo functionality by
  * applying different versions of the history to the pixel grid.
  *
  * The different versions of the grid in time is kept in an array, where each
  * element in the array is a Cell object. Reversing and restoring history is
  * actually a little complicated. To achieve this, there are two pointers into
  * the history array we keep track of: currIndex and nextIndex.
  * Here we show how they're used by giving a example workflow a user might have.
  *
  *   initial {
  *     # The initial state of the grid, where all cells are transparent,
  *     # is represented by an empty array. nextIndex is 0 and currIndex is nil.
  *     [ (nil) ]
  *         ^.. nextIndex
  *   <-- currIndex
  *   }
  *
  *   new version {
  *     # Let's say the user changes some of the cells to blue. The cells that
  *     # have been changed are saved as version 1 -- we'll call it "blue" for
  *     # short. currIndex points to this version, and nextIndex points to
  *     # the next one.
  *     [ blue, (null) ]
  *               ^.. nextIndex
  *         ^.. currIndex
  *   }
  *
  *   undo {
  *     # The user undoes the changes, reverting the grid back to all transparent.
  *     # Note that the "blue" version remains in the history. currIndex is set
  *     # back to nil, and nextIndex points to the "blue" version.
  *     [ blue, (null) ]
  *        ^.. nextIndex
  *     <-- currIndex
  *   }
  *
  *   new version {
  *     # Let's say the user fills in some different cells with green. The
  *     # "blue" version will be overwritten since nextIndex points to it.
  *     # currIndex is again set to 0 and nextIndex points to the next one.
  *     [ green, (nil) ]
  *                ^.. nextIndex
  *         ^.. currIndex
  *   }
  *
  *   new version {
  *     # The user fills in some different cells with red. This version is saved
  *     # as version 2 ("red") and both currIndex and nextIndex are incremented.
  *     [ green, red, (nil) ]
  *                      ^.. nextIndex
  *               ^.. currIndex
  *   }
  *
  *   undo {
  *     # currIndex and nextIndex are decremented, and since currIndex points
  *     # to the "green" version, that one is loaded.
  *     [ green, red ]
  *               ^.. nextIndex
  *         ^.. currIndex
  *   }
  *
  *   undo {
  *     # nextIndex is decremented, and since currIndex is 0, it's set to nil.
  #     # And since it's nil, the grid is cleared, and we can't undo anymore.
  *     [ green, red ]
  *         ^.. nextIndex
  *     <-- currIndex
  *   }
  *
  *   redo {
  *     # Let's say the user decides they want to restore history now.
  *     # nextIndex is incremented, and since currIndex is nil, it's set to 0.
  *     # It's now pointing to the "green" version, so that's loaded.
  *     [ green, red ]
  *               ^.. nextIndex
  *         ^.. currIndex
  *   }
  *
  *   redo {
  *     # currIndex and nextIndex are both incremented, and the "red" version
  *     # is loaded. Also, note we can't redo anymore since nextIndex points
  *     # to the last element in the array.
  *     [ green, red, (nil) ]
  *                     ^.. nextIndex
  *               ^.. currIndex
  *   }
  *
  *   new version {
  *     # Finally, the user fills in some cells with blue again. This gets added
  *     # to the history, and currIndex and nextIndex are incremented.
  *     [ green, red, blue, (nil) ]
  *                           ^.. nextIndex
  *                    ^.. currIndex
  *   }
  *
  */
  var CellHistory = {
    fixedSize: 100, // # of actions
    init: function(editor) {
      var self = this;
      self.editor = editor;

      self.versions = [];
      self.workingVersion = { hash: null, array: null };
      self.nextIndex = 0;
      self.currentIndex = null;

      return self;
    },
    open: function() {
      var self = this;
      self.workingVersion.array = [];
      self.workingVersion.hash = {};
    },
    close: function() {
      var self = this;
      if (self.workingVersion.array && self.workingVersion.array.length > 0) {
        // Limit history to a fixed size
        if (self.versions.length == self.fixedSize) self.versions.shift();
        // If the version of the grid was changed following an undo, all history after now is overwritten
        if (self.currentIndex && self.currentIndex != self.nextIndex) {
          self.versions.length = self.nextIndex;
        } else {
          self.versions[self.nextIndex] = self.workingVersion.array;
          self.nextIndex++;
        }
        self.currentIndex = self.nextIndex;
      }
      self.workingVersion.array = null;
      self.workingVersion.hash = null;
    },
    add: function(cell) {
      var self = this;
      cell = cell.clone();
      // Prevent duplicate entries
      if (!(cell.coords() in self.workingVersion.hash)) {
        self.workingVersion.hash[cell.coords()] = cell;
        self.workingVersion.array.push(cell);
      }
    },
    undo: function() {
      var self = this;

      if (self.currentIndex == self.nextIndex) {
        // Copy current version of the pixel grid in case user wants to redo
        var version = [];
        $.v.each(self.editor.cells, function(i, row) {
          $.v.each(row, function(j, cell) {
            version.push(cell.clone());
          })
        })
        self.versions[self.nextIndex] = version;
      }

      var cells = self.versions[self.nextIndex-1];
      $.v.each(cells, function(cell) {
        self.editor.cells[cell.y][cell.x] = cell;
      })
      self.editor.redraw();

      self.currentIndex--;
      self.nextIndex = self.currentIndex + 1;
    },
    canUndo: function() {
      var self = this;
      return (typeof self.versions[self.nextIndex-1] != "undefined");
    },
    redo: function() {
      var self = this;

      var cells = self.versions[self.nextIndex];
      $.v.each(cells, function(cell) {
        self.editor.cells[cell.y][cell.x] = cell;
      })
      self.editor.redraw();

      self.currentIndex++;
      self.nextIndex++;
    },
    canRedo: function() {
      var self = this;
      return (typeof self.versions[self.nextIndex] != "undefined");
    },
  };

  $.extend(SpriteEditor, {
    $container: null,
    $leftPane: null,
    $centerPane: null,
    $rightPane: null,

    timer: null,
    width: null,
    height: null,
    pixelEditorCanvas: null,
    pixelGridCanvas: null,
    previewCanvas: null,
    colorSampleDivs: {
      foreground: null,
      background: null,
    },
    currentCell: null,
    cells: [],
    currentColor: {
      type: 'foreground',
      foreground: Color.fromRGB(172, 85, 255),
      background: Color.fromRGB(255, 38, 192)
    },
    currentTool: "pencil",
    currentBrushSize: 1,
    cellHistory: null,

    tickInterval: 30, // ms/frame
    widthInCells: 16, // cells
    heightInCells: 16, // cells
    cellSize: 30, // pixels

    init: function() {
      var self = this;

      self.cellHistory = CellHistory.init(self);
      self.$container = $('#main');

      self._createMask();
      self._initCells();
      self._createWrapperDivs();
      self._createImportExportDiv();
      self._createPixelGridCanvas();
      self._createPixelEditorCanvas();
      self._createToolBox();
      self._createBrushSizesBox();
      self._createColorPickerBox();
      self._createPreviewBox();
      self._addEvents();
      //self.redraw();

      return self;
    },

    start: function() {
      var self = this;
      self.timer = setInterval(function() { self.redraw() }, self.tickInterval);
      return self;
    },

    redraw: function() {
      var self = this;
      self._clearPixelEditorCanvas();
      self._clearPreviewCanvas();
      self._clearTiledPreviewCanvas();
      self._highlightCurrentCells();
      self._fillCells();
      self._updateTiledPreviewCanvas();
    },

    stop: function() {
      var self = this;
      clearInterval(self.timer);
      return self;
    },

    _addEvents: function() {
      var self = this;
      Keyboard.init();
      self._addPixelEditorCanvasEvents();

      $(document).bind({
        "keydown.colorBox": function(event) {
          var key = event.keyCode;
          if (key == Keyboard.X_KEY) {
            self._switchForegroundAndBackgroundColor();
          }
        }
      })
    },

    _removeEvents: function() {
      var self = this;
      self._removePixelEditorCanvasEvents();
      $(document).unbind("keydown.colorBox");
    },

    _addPixelEditorCanvasEvents: function() {
      var self = this;
      $(document).bind({
        "keydown.pixelEditor": function(event) {
          var key = event.keyCode;
          if (key == Keyboard.Z_KEY && (event.ctrlKey || event.metaKey)) {
            if (event.shiftKey) {
              // Ctrl-Shift-Z or Command-Shift-Z: Redo last action
              if (self.cellHistory.canRedo()) self.cellHistory.redo()
            } else {
              // Ctrl-Z or Command-Z: Undo last action
              if (self.cellHistory.canUndo()) self.cellHistory.undo();
            }
          } else if (key == Keyboard.SHIFT_KEY) {
            self._selectColorType('background');
          }
        },
        "keyup.pixelEditor": function() {
          self._selectColorType('foreground');
        }
      })
      self.pixelEditorCanvas.$element.mouseTracker({
        "mouseover": function(event) {
          self.start();
        },
        "mouseout": function(event) {
          self._unsetCurrentCells();
          self.stop();
          self.redraw();
        },
        "mousedown": function(event) {
          self.cellHistory.open();
          event.preventDefault();
        },
        "mouseup": function(event) {
          switch (self.currentTool) {
            case "pencil":
              if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
                self._setCurrentCellsToUnfilled();
              } else {
                self._setCurrentCellsToFilled();
              }
              break;
            case "bucket":
              if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
                self._setCellsLikeCurrentToUnfilled();
              } else {
                self._setCellsLikeCurrentToFilled();
              }
              break;
          }
          self.cellHistory.close();
          event.preventDefault();
        },
        "mousemove": function(event) {
          var mouse = self.pixelEditorCanvas.$element.mouseTracker('pos');
          self._setCurrentCells(mouse);
        },
        "mousedragstart": function(event) {
          self.selectedCells = [];
        },
        "mousedrag": function(event) {
          if (self.currentTool == "pencil") {
            // FIXME: If you drag too fast it will skip some cells!
            // Use the current mouse position and the last mouse position and
            //  fill in or erase cells in between.
            if (event.rightClick || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) {
              self._setCurrentCellsToUnfilled();
            } else {
              self._setCurrentCellsToFilled();
            }
          }
        }//,
        //debug: true
      })
      $(window).bind({
        "blur.pixelEditor": function() {
          self.stop();
        }
      })
    },

    _removePixelEditorCanvasEvents: function() {
      var self = this;
      $(document).unbind([
        'keydown.pixelEditor',
        'keyup.pixelEditor'
      ].join(" "));
      self.pixelEditorCanvas.$element.mouseTracker('destroy');
      $(window).unbind('blur.pixelEditor');
    },

    _initCells: function() {
      var self = this;
      for (var i=0; i<self.heightInCells; i++) {
        var row = self.cells[i] = [];
        for (var j=0; j<self.widthInCells; j++) {
          row[j] = new Cell(self, j, i);
        }
      }
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

    _createPixelGridCanvas: function() {
      var self = this;
      self.pixelGridCanvas = Canvas.create(self.cellSize, self.cellSize, function(c) {
        c.ctx.strokeStyle = "#eee";
        c.ctx.beginPath();
          // Draw a vertical line on the left
          // We use 0.5 instead of 0 because this is the midpoint of the path we want to stroke
          // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
          c.ctx.moveTo(0.5, 0);
          c.ctx.lineTo(0.5, c.element.height);
          // Draw a horizontal line on top
          c.ctx.moveTo(0, 0.5);
          c.ctx.lineTo(c.element.width, 0.5);
        c.ctx.stroke();
        c.ctx.closePath();
      });
    },

    _createPixelEditorCanvas: function() {
      var self = this;
      self.width = self.widthInCells * self.cellSize;
      self.height = self.heightInCells * self.cellSize;
      self.pixelEditorCanvas = Canvas.create(self.width, self.height);
      self.pixelEditorCanvas.$element
        .attr("id", "pixel_editor_canvas")
        .css("background-image", 'url('+self.pixelGridCanvas.element.toDataURL("image/png")+')');
      self.$centerPane.append(self.pixelEditorCanvas.$element);
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
            $div.css("background-color", "rgb("+self.currentColor[colorType].toRGBString()+")")
          }
        })
        $div.trigger('update');
        $boxDiv.append($div);
        hash[colorType] = $div;
        return hash;
      }, {});

      self._selectColorType(self.currentColor.type);

      self.colorPickerBox = SpriteEditor.ColorPickerBox.init({
        open: function() {
          self._removeEvents();
          self._showMask();
        },
        close: function() {
          self._hideMask();
          self._addEvents();
          self.currentColor.beingEdited = null;
        },
        change: function(color) {
          self.colorSampleDivs[self.currentColor.beingEdited].trigger('update');
        }
      });
      $(document.body).append(self.colorPickerBox.$container);
    },

    _selectColorType: function(colorType) {
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

      self.previewCanvas = Canvas.create(self.widthInCells, self.heightInCells);
      self.previewCanvas.element.id = "preview_canvas";
      $boxDiv.append(self.previewCanvas.$element);

      self.tiledPreviewCanvas = Canvas.create(self.widthInCells * 9, self.heightInCells * 9);
      self.tiledPreviewCanvas.element.id = "tiled_preview_canvas";
      $boxDiv.append(self.tiledPreviewCanvas.$element);
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
      $.v.each(["pencil", "bucket"], function(tool) {
        var $li = $("<li/>");

        var $img = $("<img/>");
        $img.addClass("tool")
            .attr("width", 24)
            .attr("height", 24)
            .attr("src", "images/"+tool+".png");
        $imgs.push($img[0]);
        $li.append($img);
        $ul.append($li);

        $img.bind('click', function() {
          self.currentTool = tool;
          $imgs.removeClass("selected");
          $img.addClass("selected");
        })
        if (self.currentTool == tool) $img.trigger('click');
      })
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
        var grid = Grid.create(self, self.cellSize*brushSize, self.cellSize*brushSize);
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
          error = "Sorry, the image you're trying to export is too big."
        }
        if (error) {
          $importErrorSpan.html(error).show();
        } else {
          $importErrorSpan.hide();
          var reader = new FileReader();
          reader.onload = function(event) {
            var img = document.createElement("img");
            img.src = event.target.result;

            // We *could* update the preview canvas here, but it already gets
            // updated automatically when redraw() is called
            var c = Canvas.create(img.width, img.height);
            c.ctx.drawImage(img, 0, 0);
            var imageData = c.ctx.getImageData(0, 0, img.width, img.height);
            for (var x=0; x<img.width; x++) {
              for (var y=0; y<img.height; y++) {
                var color = imageData.getPixel(x, y);
                // Transparent black means the pixel wasn't set
                if (color.red != 0 && color.green != 0 && color.blue != 0 && color.alpha != 0) {
                  self.cells[y][x].color = Color.fromRGB(color.red, color.green, color.blue);
                }
              }
            }
            self.redraw();
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

    _setCurrentCells: function(mouse) {
      var self = this;

      var bs = (self.currentBrushSize-1) * self.cellSize;
      var x = mouse.rel.x;
      var y = mouse.rel.y;

      var currentCells = [];
      // Make a bounding box of pixels within the enlarged canvas based on
      // the brush size
      var x1 = x - (bs / 2),
          x2 = x + (bs / 2),
          y1 = y - (bs / 2),
          y2 = y + (bs / 2);
      // Scale each enlarged coord down to the actual pixel value
      // on the sprite
      var j1 = Math.floor(x1 / self.cellSize),
          j2 = Math.floor(x2 / self.cellSize),
          i1 = Math.floor(y1 / self.cellSize),
          i2 = Math.floor(y2 / self.cellSize);
      // Now that we have a bounding box of pixels, enumerate through all
      // pixels in this bounding box and add them to the set of current cells
      for (var i=i1; i<=i2; i++) {
        for (var j=j1; j<=j2; j++) {
          var row = self.cells[i];
          if (row && row[j]) {
            currentCells.push(row[j]);
          }
        }
      }
      self.currentCells = currentCells;
    },

    _unsetCurrentCells: function() {
      var self = this;
      self.currentCells = null;
    },

    _setCurrentCellsToFilled: function() {
      var self = this;
      if (self.currentCells) {
        $.v.each(self.currentCells, function(cell) {
          self.cellHistory.add(cell);
          // Make a copy of the current color object so that if the current
          // color changes it doesn't change all cells that have that color
          cell.color = self.currentColor[self.currentColor.type].clone();
        })
      }
    },

    _setCurrentCellsToUnfilled: function() {
      var self = this;
      if (self.currentCells) {
        $.v.each(self.currentCells, function(cell) {
          self.cellHistory.add(cell);
          cell.color = null;
        })
      }
    },

    _setCellsLikeCurrentToFilled: function() {
      var self = this;
      // Copy this as the color of the current cell will change during this loop
      var currentCellColor = self.currentCells[0].color;
      if (currentCellColor) currentCellColor = currentCellColor.clone();
      // Look for all cells with the color (or non-color) of the current cell
      // and mark them as filled with the current color
      $.v.each(self.cells, function(row, i) {
        $.v.each(row, function(cell, j) {
          if ((!currentCellColor && !cell.color) || (cell.color && cell.color.isEqual(currentCellColor))) {
            self.cellHistory.add(cell);
            cell.color = self.currentColor[self.currentColor.type].clone();
          }
        })
      })
    },

    _setCellsLikeCurrentToUnfilled: function() {
      var self = this;
      // Copy this as the color of the current cell will change during this loop
      var currentCellColor = self.currentCells[0].color;
      if (currentCellColor) currentCellColor = currentCellColor.clone();
      // Look for all cells with the color of the current cell
      // and mark them as unfilled
      $.v.each(self.cells, function(row, i) {
        $.v.each(row, function(cell, j) {
          if (cell.color && cell.color.isEqual(currentCellColor)) {
            self.cellHistory.add(cell);
            cell.color = null;
          }
        })
      })
    },

    _clearPixelEditorCanvas: function() {
      var self = this;
      var c = self.pixelEditorCanvas;
      c.ctx.clearRect(0, 0, c.width, c.height);
    },

    _clearPreviewCanvas: function() {
      var self = this;
      var pc = self.previewCanvas;
      // clearRect() won't clear image data set using createImageData(),
      // so this is another way to clear the canvas that works
      pc.element.width = pc.width;
      pc.imageData = pc.ctx.createImageData(self.widthInCells, self.heightInCells);
    },

    _clearTiledPreviewCanvas: function() {
      var self = this;
      var ptc = self.tiledPreviewCanvas;
      ptc.ctx.clearRect(0, 0, ptc.width, ptc.height);
    },

    _highlightCurrentCells: function() {
      var self = this;
      var ctx = self.pixelEditorCanvas.ctx;
      var isDragging = self.pixelEditorCanvas.$element.mouseTracker('isDragging');
      if (self.currentCells && !(isDragging || Keyboard.pressedKeys[Keyboard.CTRL_KEY]) && self.currentTool == "pencil") {
        ctx.save();
          ctx.fillStyle = 'rgba('+self.currentColor[self.currentColor.type].toRGBString()+',0.5)';
          $.v.each(self.currentCells, function(cell) {
            ctx.fillRect(cell.enlarged.x+1, cell.enlarged.y+1, self.cellSize-1, self.cellSize-1);
          })
        ctx.restore();
      }
    },

    _fillCells: function() {
      var self = this;
      var c = self.pixelEditorCanvas;
      var pc = self.previewCanvas;
      c.ctx.save();
        $.v.each(self.cells, function(row, i) {
          $.v.each(row, function(cell, j) {
            if (cell.color) {
              c.ctx.fillStyle = 'rgb('+cell.color.toRGBString()+')';
              c.ctx.fillRect(cell.enlarged.x+1, cell.enlarged.y+1, self.cellSize-1, self.cellSize-1);
              pc.imageData.setPixel(cell.actual.x, cell.actual.y, cell.color.red, cell.color.green, cell.color.blue, 255);
            }
          })
        })
      c.ctx.restore();
      pc.ctx.putImageData(pc.imageData, 0, 0);
    },

    _updateTiledPreviewCanvas: function() {
      var self = this;
      var tpc = self.tiledPreviewCanvas;
      var pattern = tpc.ctx.createPattern(self.previewCanvas.element, 'repeat');
      tpc.ctx.save();
        tpc.ctx.fillStyle = pattern;
        tpc.ctx.fillRect(0, 0, tpc.width, tpc.height);
      tpc.ctx.restore();
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
  });
  window.SpriteEditor = SpriteEditor;

})(window, window.document, window.ender);