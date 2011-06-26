$.export "SpriteEditor.Box",

  init: (@app) ->
    @$element = $("<div/>").attr("id", "se-box-#{@name.toLowerCase()}").addClass("se-box")
    $header = $("<h3/>").text(@header)
    @$element.append($header)
    return this

  destroy: ->
    @$element = null
    return this