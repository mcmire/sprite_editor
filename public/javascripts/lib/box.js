(function() {

  $["export"]("SpriteEditor.Box", {
    init: function(app) {
      var $header;
      this.app = app;
      this.containerId = "se-box-" + (this.name.toLowerCase());
      this.$element = $("<div/>").attr("id", this.containerId).addClass("se-box");
      $header = $("<h3/>").text(this.header);
      this.$element.append($header);
      return this;
    },
    destroy: function() {
      this.$element = null;
      return this;
    }
  });

}).call(this);
