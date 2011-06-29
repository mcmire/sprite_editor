$.ender {
  simulate: (type, options) ->
    @each ->
      opt = $.extend {}, $.simulate.defaults, options || {}
      new $.simulate(this, type, opt)
}, true

class $.simulate
  constructor: (el, type, options) ->
    @target = el
    @options = options
    if /^drag$/.test(type)
      this[type].apply(this, [@target, options])
    else
      @simulateEvent(el, type, options)

  simulateEvent: (el, type, options) ->
    evt = @createEvent(type, options)
    @dispatchEvent(el, type, evt, options)
    return evt

  createEvent: (type, options) ->
    if /^mouse(over|out|down|up|move)|(dbl)?click$/.test(type)
      @mouseEvent(type, options)
    else if /^key(up|down|press)$/.test(type)
      @keyboardEvent(type, options)

  mouseEvent: (type, options) ->
    e = $.extend {
      bubbles: true
      cancelable: (type != "mousemove")
      view: window
      detail: 0
      screenX: 0
      screenY: 0
      clientX: 0
      clientY: 0
      ctrlKey: false
      altKey: false
      shiftKey: false
      metaKey: false
      button: 0
      relatedTarget: undefined
    }, options

    relatedTarget = $(e.relatedTarget)[0]

    if $.isFunction(document.createEvent)
      evt = document.createEvent("MouseEvents")
      evt.initMouseEvent(
        type, e.bubbles, e.cancelable, e.view, e.detail, e.screenX, e.screenY,
        e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
        e.button, (e.relatedTarget || document.body.parentNode)
      )
    else if document.createEventObject
      evt = document.createEventObject()
      $.extend evt, e
      evt.button = {0: 1, 1: 4, 2: 2}[evt.button] || evt.button
    return evt

  keyboardEvent: (type, options) ->
    e = $.extend {
      bubbles: true
      cancelable: true
      view: window
      ctrlKey: false
      altKey: false
      shiftKey: false
      metaKey: false
      keyCode: 0
      charCode: 0
    }, options

    if $.isFunction(document.createEvent)
      try
        evt = document.createEvent("KeyEvents")
        evt.initKeyEvent(
          type, e.bubbles, e.cancelable, e.view, e.ctrlKey, e.altKey,
          e.shiftKey, e.metaKey, e.keyCode, e.charCode
        )
      catch err
        evt = document.createEvent("Events")
        evt.initEvent(type, e.bubbles, e.cancelable)
        $.extend evt, {
          view: e.view
          ctrlKey: e.ctrlKey
          altKey: e.altKey
          shiftKey: e.shiftKey
          metaKey: e.metaKey
          keyCode: e.keyCode
          charCode: e.charCode
        }
    else if document.createEventObject
      evt = document.createEventObject()
      $.extend evt, e
    if $.browser.msie or $.browser.opera
      evt.keyCode = (if e.charCode > 0 then e.charCode else e.keyCode)
      evt.charCode = undefined
    return evt

  dispatchEvent: (el, type, evt) ->
    if el.dispatchEvent
      el.dispatchEvent(evt)
    else if el.fireEvent
      el.fireEvent("on" + type, evt)
    return evt

  drag: (el) ->
    self = this
    center = @findCenter(@target)
    options = @options
    x = Math.floor(center.x)
    y = Math.floor(center.y)
    dx = options.dx or 0
    dy = options.dy or 0
    target = @target
    coord = {clientX: x, clientY: y}

    @simulateEvent(target, "mousedown", coord)
    coord = {clientX: x + 1, clientY: y + 1}

    @simulateEvent(document, "mousemove", coord)
    coord = {clientX: x + dx, clientY: y + dy}

    @simulateEvent(document, "mousemove", coord)
    @simulateEvent(document, "mousemove", coord)
    @simulateEvent(target, "mouseup", coord)

  findCenter: (el) ->
    el = $(@target)
    o = el.offset()
    x: o.left + el.outerWidth() / 2
    y: o.top + el.outerHeight() / 2

$.extend $.simulate,
  defaults: {speed: "sync"}
  VK_TAB: 9
  VK_ENTER: 13
  VK_ESC: 27
  VK_PGUP: 33
  VK_PGDN: 34
  VK_END: 35
  VK_HOME: 36
  VK_LEFT: 37
  VK_UP: 38
  VK_RIGHT: 39
  VK_DOWN: 40
