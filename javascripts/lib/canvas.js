(function(window, document, $, undefined) {

  var Canvas = {};
  Canvas.create = function(width, height, callback) {
    var c = {};
    c.$element = $("<canvas/>");
    c.element = c.$element[0];
    c.ctx = c.element.getContext("2d");
    $.extend(c.ctx, Canvas.Context);
    c.width = c.element.width = width;
    c.height = c.element.height = height;
    if (callback) callback(c);
    return c;
  }
  Canvas.Context = {
    getImageData: function(_super, x, y, width, height) {
      var imageData = _super.call(this, x, y, width, height);
      $.extend(imageData, Canvas.ImageData);
      return imageData;
    },
    createImageData: function(_super, width, height) {
      var imageData = _super.call(this, width, height);
      $.extend(imageData, Canvas.ImageData);
      return imageData;
    }
  };
  Canvas.ImageData = {
    // Adapted from:
    // <http://beej.us/blog/2010/02/html5s-canvas-part-ii-pixel-manipulation/>

    getPixel: function(x, y) {
      var index = (x + y * this.width) * 4;
      return {
        red: this.data[index+0],
        green: this.data[index+1],
        blue: this.data[index+2],
        alpha: this.data[index+3]
      }
    },

    setPixel: function(x, y, r, g, b, a) {
      var index = (x + y * this.width) * 4;
      this.data[index+0] = r;
      this.data[index+1] = g;
      this.data[index+2] = b;
      this.data[index+3] = a;
    }
  }
  window.Canvas = Canvas;

})(window, window.document, window.ender);