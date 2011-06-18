(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.App", function(SpriteEditor) {
    var App, Keyboard;
    Keyboard = SpriteEditor.Keyboard;
    App = {};
    SpriteEditor.DOMEventHelpers.mixin(App, "SpriteEditor_App");
    $.extend(App, {
      $container: null,
      $leftPane: null,
      $centerPane: null,
      $rightPane: null,
      boxes: [],
      colorSampleDivs: {
        foreground: null,
        background: null
      },
      currentColor: {
        type: "foreground",
        foreground: (new SpriteEditor.Color.RGB(172, 85, 255)).toHSL(),
        background: (new SpriteEditor.Color.RGB(255, 38, 192)).toHSL()
      },
      currentBrushSize: 1,
      init: function() {
        Keyboard.init();
        this.canvases = SpriteEditor.DrawingCanvases.init(this);
        this.tools = SpriteEditor.Tools.init(this, this.canvases);
        this.history = SpriteEditor.EventHistory.init(this);
        this.$container = $("#main");
        this._createMask();
        this._createWrapperDivs();
        this._createImportExportDiv();
        this._addWorkingCanvas();
        this._createToolBox();
        this._createBrushSizesBox();
        this._createColorPickerBox();
        this._createPreviewBox();
        this.addEvents();
        this.canvases.draw();
        return this;
      },
      addEvents: function() {
        this.canvases.addEvents();
        this.tools.addEvents();
        return this._bindEvents(document, {
          keydown: __bind(function(event) {
            var key;
            key = event.keyCode;
            if (key === Keyboard.Z_KEY && (event.ctrlKey || event.metaKey)) {
              if (event.shiftKey) {
                if (this.history.canRedo()) {
                  this.history.redo();
                }
              } else {
                if (this.history.canUndo()) {
                  this.history.undo();
                }
              }
            } else if (key === Keyboard.X_KEY) {
              this._switchForegroundAndBackgroundColor();
            } else if (key === Keyboard.SHIFT_KEY) {
              this.selectColorType("background");
            }
            return this.boxes.tools.currentTool().trigger("keydown", event);
          }, this),
          keyup: __bind(function(event) {
            this.selectColorType("foreground");
            return this.boxes.tools.currentTool().trigger("keyup", event);
          }, this)
        });
      },
      removeEvents: function() {
        this.canvases.removeEvents();
        return this._unbindEvents(document, "keydown", "keyup");
      },
      _createWrapperDivs: function() {
        this.$leftPane = $("<div/>");
        this.$leftPane.attr("id", "left_pane");
        this.$container.append(this.$leftPane);
        this.$rightPane = $("<div/>");
        this.$rightPane.attr("id", "right_pane");
        this.$container.append(this.$rightPane);
        this.$centerPane = $("<div/>");
        this.$centerPane.attr("id", "center_pane");
        return this.$container.append(this.$centerPane);
      },
      _createImportExportDiv: function() {
        var $exportForm, $importDiv, $importErrorSpan, $importExportDiv, $importFileButton, $importFileInput;
        $importExportDiv = $("<div id=\"import_export\" />");
        $importDiv = $("<div id=\"import\" />");
        $importErrorSpan = $("<span id=\"import_error\" style=\"display: none\" />");
        $importFileInput = $("<input type=\"file\" style=\"position: absolute; top: -10000px; left: -10000px\" />");
        $importFileButton = $("<button>Import PNG</button>");
        $importFileButton.bind("click", function() {
          return $importFileInput.trigger("click");
        });
        $importFileInput.bind("change", function(event) {
          var error, file, input, reader;
          input = $importFileInput[0];
          file = input.files[0];
          error = "";
          if (!file) {
            error = "Please select a file.";
          } else if (!file.type || file.type !== "image/png") {
            error = "Sorry, you can only import PNGs.";
          } else {
            if (file.size > 1000) {
              error = "Sorry, the image you're trying to import is too big.";
            }
          }
          if (error) {
            return $importErrorSpan.html(error).show();
          } else {
            $importErrorSpan.hide();
            reader = new FileReader();
            reader.onload = __bind(function(event) {
              var c, imageData, img, x, y, _fn, _ref, _ref2;
              img = document.createElement("img");
              img.src = event.target.result;
              console.log(img.src);
              c = SpriteEditor.Canvas.create(img.width, img.height);
              c.ctx.drawImage(img, 0, 0);
              imageData = c.ctx.getImageData(0, 0, img.width, img.height);
              for (x = 0, _ref = img.width; 0 <= _ref ? x < _ref : x > _ref; 0 <= _ref ? x++ : x--) {
                _fn = function() {
                  var color, rgba;
                  rgba = imageData.getPixel(x, y);
                  color = SpriteEditor.Color.RGB(color.red, color.green, color.blue, color.alpha);
                  if (!color.isClear()) {
                    return this.cells[y][x].color = color;
                  }
                };
                for (y = 0, _ref2 = img.height; 0 <= _ref2 ? y < _ref2 : y > _ref2; 0 <= _ref2 ? y++ : y--) {
                  _fn();
                }
              }
              return this.draw();
            }, this);
            return reader.readAsDataURL(file);
          }
        });
        $importDiv.append($importErrorSpan);
        $importDiv.append($importFileInput);
        $importDiv.append($importFileButton);
        $importExportDiv.append($importDiv);
        $exportForm = $('<form id="export" action="" method="POST"><input name="data" type="hidden" /><button type="submit">Export PNG</button></form>');
        $exportForm.bind("submit", __bind(function() {
          var data;
          data = this.previewCanvas.element.toDataURL("image/png");
          data = data.replace(/^data:image\/png;base64,/, "");
          return $exportForm.find("input").val(data);
        }, this));
        $importExportDiv.append($exportForm);
        return this.$centerPane.append($importExportDiv);
      },
      _addWorkingCanvas: function() {
        return this.$centerPane.append(this.canvases.workingCanvas.$element);
      },
      _createColorPickerBox: function() {
        var $boxDiv, $header;
        $boxDiv = $("<div/>").attr("id", "color_box").addClass("box");
        this.$rightPane.append($boxDiv);
        $header = $("<h3/>").html("Color");
        $boxDiv.append($header);
        this.colorSampleDivs = {};
        $.v.each(["foreground", "background"], __bind(function(colorType) {
          var $div;
          $div = $('<div class="color_sample" />');
          $div.bind({
            click: __bind(function() {
              this.currentColor.beingEdited = colorType;
              return this.colorPickerBox.open(this.currentColor[colorType]);
            }, this),
            render: __bind(function() {
              return $div.css("background-color", this.currentColor[colorType].toRGB().toString());
            }, this)
          });
          $div.trigger("render");
          $boxDiv.append($div);
          return this.colorSampleDivs[colorType] = $div;
        }, this));
        this.selectColorType(this.currentColor.type);
        this.colorPickerBox = SpriteEditor.ColorPickerBox.init({
          open: __bind(function() {
            this.removeEvents();
            return this._showMask();
          }, this),
          close: __bind(function() {
            this._hideMask();
            this.addEvents();
            return this.currentColor.beingEdited = null;
          }, this),
          change: __bind(function(color) {
            this.currentColor[this.currentColor.beingEdited] = color;
            return this.colorSampleDivs[this.currentColor.beingEdited].trigger("render");
          }, this)
        });
        return $(document.body).append(this.colorPickerBox.$container);
      },
      selectColorType: function(colorType) {
        this.colorSampleDivs[this.currentColor.type].removeClass("selected");
        this.currentColor.type = colorType;
        return this.colorSampleDivs[colorType].addClass("selected");
      },
      _switchForegroundAndBackgroundColor: function() {
        var tmp;
        tmp = this.currentColor.foreground;
        this.currentColor.foreground = this.currentColor.background;
        this.currentColor.background = tmp;
        this.colorSampleDivs.foreground.trigger("render");
        return this.colorSampleDivs.background.trigger("render");
      },
      _createPreviewBox: function() {
        var $boxDiv, $header;
        $boxDiv = $("<div/>").attr("id", "preview_box").addClass("box");
        this.$rightPane.append($boxDiv);
        $header = $("<h3/>").html("Preview");
        $boxDiv.append($header);
        $boxDiv.append(this.canvases.previewCanvas.$element);
        return $boxDiv.append(this.canvases.tiledPreviewCanvas.$element);
      },
      _createToolBox: function() {
        var box;
        this.boxes.tools = box = SpriteEditor.Box.Tools.init(this);
        return this.$leftPane.append(box.$element);
      },
      _createBrushSizesBox: function() {
        var $boxDiv, $grids, $header, brushSize, self, _results;
        self = this;
        $boxDiv = $("<div/>").attr("id", "sizes_box").addClass("box");
        this.$leftPane.append($boxDiv);
        $header = $("<h3/>").html("Sizes");
        $boxDiv.append($header);
        $grids = $([]);
        _results = [];
        for (brushSize = 1; brushSize <= 4; brushSize++) {
          _results.push((function(brushSize) {
            var grid;
            grid = self._createGrid(self.canvases.cellSize * brushSize);
            $grids.push(grid.element);
            $boxDiv.append(grid.$element);
            grid.$element.bind("click", function() {
              self.currentBrushSize = brushSize;
              $grids.removeClass("selected");
              return grid.$element.addClass("selected");
            });
            if (self.currentBrushSize === brushSize) {
              return grid.$element.trigger("click");
            }
          })(brushSize));
        }
        return _results;
      },
      _createGrid: function(size) {
        return SpriteEditor.Canvas.create(size, size, __bind(function(c) {
          var cellSize, fontSize, metrics, text, x, y, _step, _step2;
          cellSize = this.canvases.cellSize;
          c.ctx.strokeStyle = "#eee";
          c.ctx.beginPath();
          for (x = 0.5, _step = cellSize; 0.5 <= size ? x < size : x > size; x += _step) {
            c.ctx.moveTo(x, 0);
            c.ctx.lineTo(x, size);
          }
          for (y = 0.5, _step2 = cellSize; 0.5 <= size ? y < size : y > size; y += _step2) {
            c.ctx.moveTo(0, y);
            c.ctx.lineTo(size, y);
          }
          c.ctx.stroke();
          c.ctx.closePath();
          fontSize = 11;
          c.ctx.font = "" + fontSize + " px Helvetica";
          text = (size / cellSize) + "px";
          metrics = c.ctx.measureText(text);
          return c.ctx.fillText(text, size / 2 - metrics.width / 2, size / 2 + fontSize / 4);
        }, this));
      },
      _createMask: function() {
        this.$maskDiv = $('<div id="mask" />').hide();
        return $(document.body).append(this.$maskDiv);
      },
      _showMask: function() {
        return this.$maskDiv.show();
      },
      _hideMask: function() {
        return this.$maskDiv.hide();
      }
    });
    return App;
  });
}).call(this);
