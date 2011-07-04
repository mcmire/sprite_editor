$.export "SpriteEditor.Box",

  init: (@app) ->
    @containerId = "se-box-#{@name.toLowerCase()}"
    @$element = $("<div/>").attr("id", @containerId).addClass("se-box")
    $header = $("<h3/>").text(@header)
    @$element.append($header)
    return this

  destroy: ->
    @$element = null
    return this