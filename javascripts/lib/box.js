(function() {
  $["export"]("SpriteEditor.Box", {
    init: function(app) {
      var $header;
      this.app = app;
      this.$element = $("<div/>").attr("id", "se-box-" + (this.name.toLowerCase())).addClass("se-box");
      $header = $("<h3/>").html(this.header);
      this.$element.append($header);
      return this;
    }
  });
}).call(this);
