$.export "SpriteEditor.Box",

  init: (@app) ->
    @$element = $("<div/>").attr("id", "se-box-#{@name.toLowerCase()}").addClass("se-box")

    $header = $("<h3/>").html(@header)
    @$element.append($header)

    return this