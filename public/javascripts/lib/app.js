(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.App", function(SpriteEditor) {
    var App, Keyboard;
    Keyboard = SpriteEditor.Keyboard;
    App = {};
    SpriteEditor.DOMEventHelpers.mixin(App, "SpriteEditor_App");
    $.extend(App, {
      init: function() {
        if (!this.isInitialized) {
          this.reset();
          Keyboard.init();
          this.canvases = SpriteEditor.DrawingCanvases.init(this);
          this.toolset = SpriteEditor.Toolset.init(this, this.canvases);
          this.history = SpriteEditor.EventHistory.init(this);
          this.$container = $('<div />');
          this._createMask();
          this._createWrapperDivs();
          this._createImportExportDiv();
          this._addWorkingCanvas();
          this._createToolBox();
          this._createBrushSizesBox();
          this._createColorPicker();
          this._createPreviewBox();
          this.isInitialized = true;
        }
        return this;
      },
      hook: function(wrapper) {
        $(wrapper).append(this.$container);
        $(document.body).append(this.$maskDiv);
        return $(document.body).append(this.colorPicker.$container);
      },
      destroy: function() {
        var _ref, _ref2, _ref3;
        if (this.isInitialized) {
          this.removeEvents();
          Keyboard.destroy();
          if ((_ref = this.canvases) != null) {
            _ref.destroy();
          }
          if ((_ref2 = this.toolset) != null) {
            _ref2.destroy();
          }
          if ((_ref3 = this.history) != null) {
            _ref3.destroy();
          }
          this.reset();
          this.isInitialized = false;
        }
        return this;
      },
      reset: function() {
        var _ref, _ref2, _ref3;
        this.canvases = null;
        this.toolset = null;
        this.history = null;
        this.boxes = {};
        if ((_ref = this.$container) != null) {
          _ref.remove();
        }
        this.$container = null;
        this.$leftPane = null;
        this.$centerPane = null;
        this.$rightPane = null;
        if ((_ref2 = this.$maskDiv) != null) {
          _ref2.remove();
        }
        this.$maskDiv = null;
        if ((_ref3 = this.colorPicker) != null) {
          _ref3.$container.remove();
        }
        this.colorPicker = null;
        return this;
      },
      addEvents: function() {
        Keyboard.addEvents();
        this.canvases.addEvents();
        this.boxes.tools.addEvents();
        this.boxes.sizes.addEvents();
        this.boxes.colors.addEvents();
        this._bindEvents(document, {
          keydown: __bind(function(event) {
            var key;
            key = event.keyCode;
            if (key === Keyboard.Z_KEY && (event.ctrlKey || event.metaKey)) {
              if (event.shiftKey) {
                this.history.redo();
              } else {
                this.history.undo();
              }
            }
            return this.boxes.tools.currentTool().trigger("keydown", event);
          }, this),
          keyup: __bind(function(event) {
            return this.boxes.tools.currentTool().trigger("keyup", event);
          }, this)
        });
        return this;
      },
      removeEvents: function() {
        var _ref, _ref2, _ref3, _ref4;
        Keyboard.removeEvents();
        if ((_ref = this.canvases) != null) {
          _ref.removeEvents();
        }
        if ((_ref2 = this.boxes.tools) != null) {
          _ref2.removeEvents();
        }
        if ((_ref3 = this.boxes.sizes) != null) {
          _ref3.removeEvents();
        }
        if ((_ref4 = this.boxes.colors) != null) {
          _ref4.removeEvents();
        }
        this._unbindEvents(document, "keydown", "keyup");
        return this;
      },
      _createWrapperDivs: function() {
        this.$leftPane = $('<div id="left_pane" />');
        this.$container.append(this.$leftPane);
        this.$rightPane = $('<div id="right_pane" />');
        this.$container.append(this.$rightPane);
        this.$centerPane = $('<div id="center_pane" />');
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
                  color = new SpriteEditor.Color(color);
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
        $exportForm = $('\
        <form id="export" action="" method="POST">\
          <input name="data" type="hidden" />\
          <button type="submit">Export PNG</button>\
        </form>\
      '.trim());
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
      _createColorPicker: function() {
        var box;
        this.boxes.colors = box = SpriteEditor.Box.Colors.init(this);
        this.$rightPane.append(box.$element);
        return this.colorPicker = SpriteEditor.ColorPicker.init(this, {
          open: __bind(function() {
            this.removeEvents();
            return this._showMask();
          }, this),
          close: __bind(function() {
            this._hideMask();
            return this.addEvents();
          }, this)
        });
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
        var box;
        this.boxes.sizes = box = SpriteEditor.Box.Sizes.init(this);
        return this.$leftPane.append(box.$element);
      },
      _createMask: function() {
        return this.$maskDiv = $('<div id="mask" />').hide();
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
