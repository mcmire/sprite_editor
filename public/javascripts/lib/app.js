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
        this._createColorPicker();
        this._createPreviewBox();
        this.addEvents();
        this.canvases.draw();
        return this;
      },
      addEvents: function() {
        this.canvases.addEvents();
        this.boxes.tools.addEvents();
        this.boxes.sizes.addEvents();
        this.boxes.colors.addEvents();
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
            }
            return this.boxes.tools.currentTool().trigger("keydown", event);
          }, this),
          keyup: __bind(function(event) {
            return this.boxes.tools.currentTool().trigger("keyup", event);
          }, this)
        });
      },
      removeEvents: function() {
        this.canvases.removeEvents();
        this.boxes.tools.removeEvents();
        this.boxes.sizes.removeEvents();
        this.boxes.colors.removeEvents();
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
      ');
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
        this.colorPicker = SpriteEditor.ColorPicker.init(this, {
          open: __bind(function() {
            this.removeEvents();
            return this._showMask();
          }, this),
          close: __bind(function() {
            this._hideMask();
            return this.addEvents();
          }, this)
        });
        return $(document.body).append(this.colorPicker.$container);
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
