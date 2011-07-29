{ElementMouseTracker} = SpriteEditor

describe 'ElementMouseTracker', ->
  mouse = null

  afterEach ->
    ElementMouseTracker.destroy()
    mouse = null

  it "responds to _bindEvents and _unbindEvents", ->
    expect(ElementMouseTracker._bindEvents).toBeTypeOf("function")
    expect(ElementMouseTracker._unbindEvents).toBeTypeOf("function")

  describe 'when initialized', ->
    describe 'if not initialized yet', ->
      it "resets key variables", ->
        spyOn(ElementMouseTracker, 'reset').andCallThrough()
        mouse = ElementMouseTracker.init()
        expect(ElementMouseTracker.reset).toHaveBeenCalled()

      it "initializes @_eventsAdded to false", ->
        mouse = ElementMouseTracker.init()
        expect(mouse._eventsAdded).toBeFalsy()

      it "sets @isInitialized to true", ->
        mouse = ElementMouseTracker.init()
        expect(mouse.isInitialized).toBeTruthy()

    describe 'if already initialized', ->
      beforeEach ->
        mouse = ElementMouseTracker.init()

      it "doesn't try to reset variables", ->
        spyOn(ElementMouseTracker, 'reset')
        mouse = ElementMouseTracker.init()
        expect(ElementMouseTracker.reset).not.toHaveBeenCalled()

      it "doesn't set @_eventsAdded", ->
        mouse._eventsAdded = null
        mouse = ElementMouseTracker.init()
        expect(mouse._eventsAdded).toBeNull()

  describe 'when destroyed', ->
    beforeEach ->
      mouse = ElementMouseTracker.init()

    describe 'if not destroyed yet', ->
      it "removes any events that may have been added", ->
        spyOn(mouse, 'removeEvents')
        mouse.destroy()
        expect(mouse.removeEvents).toHaveBeenCalled()

      it "destroys any active instances", ->
        destroy = jasmine.createSpy()
        mouse.instances = [ {destroy: destroy} ]
        mouse.destroy()
        expect(destroy).toHaveBeenCalled()

      it "resets any key variables", ->
        spyOn(mouse, 'reset')
        mouse.destroy()
        expect(mouse.reset).toHaveBeenCalled()

      it "sets @isInitialized to false", ->
        mouse.destroy()
        expect(mouse.isInitialized).toBeFalsy()

    describe 'if already destroyed', ->
      beforeEach ->
        mouse.destroy()

      it "doesn't try to remove events", ->
        spyOn(mouse, 'removeEvents')
        mouse.destroy()
        expect(mouse.removeEvents).not.toHaveBeenCalled()

      it "try to destroy active instances", ->
        destroy = jasmine.createSpy()
        mouse.instances = [ {destroy: destroy} ]
        mouse.destroy()
        expect(destroy).not.toHaveBeenCalled()

      it "doesn't reset anything", ->
        spyOn(mouse, 'reset')
        mouse.destroy()
        expect(mouse.reset).not.toHaveBeenCalled()

  describe 'when reset', ->
    beforeEach ->
      mouse = ElementMouseTracker.init()

    it "clears @instances", ->
      mouse.instances = "whatever"
      mouse.reset()
      expect(mouse.instances).toEqual([])

    it "resets @activeInstance", ->
      mouse.activeInstance = "whatever"
      mouse.reset()
      expect(mouse.activeInstance).toEqual(mouseWithin: null, mouseDownWithin: null)

    it "clears @pos", ->
      mouse.pos = "something"
      mouse.reset()
      expect(mouse.pos).not.toBe()

    it "ensures that the debug div is removed from the document", ->
      $div = mouse.debugDiv()
      mouse.reset()
      expect(document.body).not.toContainElement($div)

    it "clears @$debugDiv", ->
      $div = mouse.debugDiv()
      mouse.reset()
      expect(mouse.$debugDiv).not.toBe()

  describe 'when events have been added', ->
    beforeEach ->
      mouse = ElementMouseTracker.init()
      mouse.addEvents()

    describe 'when the mouse is lifted', ->
      it "calls a possible mouseup event on the active instance", ->
        $element = $('<div />')
        instance = mouse.activeInstance.mouseDownWithin = new ElementMouseTracker.instance($element)
        spyOn(instance, "mouseup")
        $(document).simulate "mouseup"
        expect(instance.mouseup).toHaveBeenCalled()

      it "prevents the event from doing anything"

    describe 'when the mouse is moved', ->
      it "stores the current mouse position (relative to the document)", ->
        $(document).simulate "mousemove", clientX: 90, clientY: 240
        expect(mouse.pos).toEqual(x: 90, y: 240)

      it "calls a possible mousemove event on the active instance", ->
        $element = $('<div />')
        instance = mouse.activeInstance.mouseWithin = new ElementMouseTracker.instance($element)
        spyOn(instance, "mousemove")
        $(document).simulate "mousemove", clientX: 90, clientY: 240
        expect(instance.mousemove).toHaveBeenCalled()

      it "prevents the event from doing anything else"

  describe 'when events have been removed', ->
    beforeEach ->
      mouse = ElementMouseTracker.init()
      mouse.addEvents()
      mouse.removeEvents()

    describe 'when the mouse is lifted', ->
      it "doesn't try to call a mouseup event on the active instance", ->
        $element = $('<div />')
        instance = mouse.activeInstance.mouseDownWithin = new ElementMouseTracker.instance($element)
        spyOn(instance, "mouseup")
        $(document).simulate "mouseup"
        expect(instance.mouseup).not.toHaveBeenCalled()

    describe 'when the mouse is moved', ->
      it "stores the current mouse position (relative to the document)", ->
        $(document).simulate "mousemove", clientX: 90, clientY: 240
        expect(mouse.pos).not.toBe()

      it "calls a possible mousemove event on the active instance", ->
        $element = $('<div />')
        instance = mouse.activeInstance.mouseWithin = new ElementMouseTracker.instance($element)
        spyOn(instance, "mousemove")
        $(document).simulate "mousemove", clientX: 90, clientY: 240
        expect(instance.mousemove).not.toHaveBeenCalled()

  describe '#add', ->
    $element = null

    beforeEach ->
      mouse = ElementMouseTracker.init()
      $element = $('<div />')

    it "automatically calls addEvents() if this is the first instance being added", ->
      mouse.add($element)
      expect(mouse._eventsAdded).toBeTruthy()

    it "adds a new instance to @instances", ->
      mouse.add($element)
      expect(mouse.instances.length).toBe(1)
      expect(mouse.instances[0]).toBeAnInstanceOf(ElementMouseTracker.instance)

    it "adds events to the element associated with the instance", ->
      mouse.add($element)
      expect(mouse.instances[0]._eventsAdded).toBeTruthy()

    it "returns the new instance", ->
      expect(mouse.add($element)).toBe(mouse.instances[0])

  describe '#remove', ->
    $element = instance = null
    beforeEach ->
      mouse = ElementMouseTracker.init()
      $element = $('<div />')
      instance = mouse.activeInstance.mouseWithin = new ElementMouseTracker.instance($element)

    it "destroys the given instance", ->
      spyOn(instance, 'destroy')
      mouse.remove(instance)
      expect(instance.destroy).toHaveBeenCalled()

    it "removes the instance from @instances", ->
      mouse.instances.push(instance)
      mouse.remove(instance)
      expect(mouse.instances.length).toBe(0)

    it "deletes mouseWithin if this is the instance pointed to", ->
      mouse.activeInstance.mouseWithin = instance
      mouse.remove(instance)
      expect(mouse.activeInstance.mouseWithin).not.toBe()

    it "deletes mouseDownWithin if this is the instance pointed to", ->
      mouse.activeInstance.mouseDownWithin = instance
      mouse.remove(instance)
      expect(mouse.activeInstance.mouseDownWithin).not.toBe()

    it "automatically calls removeEvents() if this is the last instance being removed", ->
      spyOn(mouse, 'removeEvents')
      mouse.remove(instance)
      expect(mouse.removeEvents).toHaveBeenCalled()

describe 'ElementMouseTracker.instance', ->
  mouse = $element = null

  newMouse = (args...) ->
    props = $.v.find(args, (a) -> $.v.is.obj(a)) || {}
    fn    = $.v.find(args, (a) -> $.v.is.fun(a))

    $element = $('<div />')
    fn?($element)
    new ElementMouseTracker.instance($element, props)

  afterEach ->
    mouse?.destroy()

  it "responds to _bindEvents and _unbindEvents", ->
    expect(ElementMouseTracker.instance.prototype._bindEvents).toBeTypeOf("function")
    expect(ElementMouseTracker.instance.prototype._unbindEvents).toBeTypeOf("function")

  describe 'when initialized', ->
    it "stores the given @$element", ->
      mouse = newMouse()
      expect(mouse.$element).toBeElementOf("div")

    it "stores options that refer to mouse events in @customEvents", ->
      mouse = newMouse(
        foo: "bar"
        baz: "quux"
        mousedrag: "zing"
        mouseover: "zang"
      )
      expect(mouse.customEvents.mousedrag).toEqual("zing")
      expect(mouse.customEvents.mouseover).toEqual("zang")

    it "stores the rest of the options in @options", ->
      mouse = newMouse(
        foo: "bar"
        baz: "quux"
        draggingDistance: 10
        mousedrag: "zing"
        mouseover: "zang"
      )
      expect(mouse.options.foo).toEqual("bar")
      expect(mouse.options.baz).toEqual("quux")
      expect(mouse.options.draggingDistance).toBe(10)

    it "sets the draggingDistance to 1 by default", ->
      mouse = newMouse()
      expect(mouse.options.draggingDistance).toBe(1)

    it "initializes @pos", ->
      mouse = newMouse()
      expect(mouse.pos.abs).not.toBe()
      expect(mouse.pos.rel).not.toBe()

    it "initializes @isDown", ->
      mouse = newMouse()
      expect(mouse.isDown).toBe(false)

    it "initializes @downAt", ->
      mouse = newMouse()
      expect(mouse.downAt.abs).not.toBe()
      expect(mouse.downAt.rel).not.toBe()

    it "initializes @isDragging", ->
      mouse = newMouse()
      expect(mouse.isDragging).toBe(false)

    it "caches the element's offset in @elementOffset", ->
      mouse = newMouse ($element) -> $('#sandbox').append($element)
      expect(mouse.elementOffset.top).toBe(8)
      expect(mouse.elementOffset.left).toBe(8)

    it "caches the element size in @elementSize", ->
      mouse = newMouse ($element) ->
        $element.html("<p>Foo bar</p><p>Baz quux</p>")
        $('#sandbox').append($element)
      expect(mouse.elementSize.width).toBe(1008)
      expect(mouse.elementSize.height).toBe(52)

  describe 'when destroyed', ->
    beforeEach ->
      mouse = newMouse()

    it "removes any events which may have been added", ->
      spyOn(mouse, 'removeEvents')
      mouse.destroy()
      expect(mouse.removeEvents).toHaveBeenCalled()

  describe 'when events have been added', ->
    topOffset = leftOffset = 10

    newMouseWithEvents = (args...) ->
      props = $.v.find(args, (a) -> $.v.is.obj(a)) || {}
      fn    = $.v.find(args, (a) -> $.v.is.fun(a))

      $element = $('<div />')
      $element.css(
        position: 'absolute',
        top: 0,
        left: 0,
        "margin-left": leftOffset,
        "margin-top": topOffset,
        width: '500px',
        height: '500px'
      )
      $('#sandbox').append($element)
      fn?($element)

      mouse = new ElementMouseTracker.instance($element, props)
      mouse.addEvents()
      mouse

    beforeEach ->
      ElementMouseTracker.init().addEvents()

    describe 'when the mouse enters the element', ->
      it "triggers a possible custom mouseover callback", ->
        mouse = newMouseWithEvents()
        mouse.customEvents.mouseover = jasmine.createSpy()
        $element.simulate "mouseover"
        expect(mouse.customEvents.mouseover).toHaveBeenCalled()

      it "sets mouseWithin to point to this instance", ->
        mouse = newMouseWithEvents()
        $element.simulate "mouseover"
        expect(ElementMouseTracker.activeInstance.mouseWithin).toBe(mouse)

      it "triggers a possible custom mouseenter callback", ->
        mouse = newMouseWithEvents()
        mouse.customEvents.mouseenter = jasmine.createSpy()
        $element.simulate "mouseover"
        expect(mouse.customEvents.mouseenter).toHaveBeenCalled()

    describe 'when the mouse leaves the element', ->
      it "triggers a possible custom mouseout callback", ->
        mouse = newMouseWithEvents()
        mouse.customEvents.mouseout = jasmine.createSpy()
        $element.simulate "mouseout"
        expect(mouse.customEvents.mouseout).toHaveBeenCalled()

      it "removes the mouseWithin reference", ->
        mouse = newMouseWithEvents()
        $element.simulate "mouseout"
        expect(ElementMouseTracker.activeInstance.mouseWithin).not.toBe()

      it "triggers a possible custom mouseleave callback", ->
        mouse = newMouseWithEvents()
        mouse.customEvents.mouseleave = jasmine.createSpy()
        $element.simulate "mouseout"
        expect(mouse.customEvents.mouseleave).toHaveBeenCalled()

    describe 'when the mouse is pressed down within the element', ->
      it "sets mouseDownWithin to point to this instance", ->
        mouse = newMouseWithEvents()
        $element.simulate "mousedown"
        expect(ElementMouseTracker.activeInstance.mouseDownWithin).toBe(mouse)

      it "sets @isDown to true", ->
        mouse = newMouseWithEvents()
        $element.simulate "mousedown"
        expect(mouse.isDown).toBe(true)

      it "stores the position of the mouse", ->
        mouse = newMouseWithEvents()
        $(document).simulate "mousemove", clientX: 39, clientY: 102
        $element.simulate "mousedown", clientX: 39, clientY: 102
        expect(mouse.pos.abs.x).toBe(39)
        expect(mouse.pos.abs.y).toBe(102)
        expect(mouse.pos.rel.x).toBe(39 - leftOffset)
        expect(mouse.pos.rel.y).toBe(102 - topOffset)

      it "sets @downAt to the current mouse position", ->
        mouse = newMouseWithEvents()
        $(document).simulate "mousemove", clientX: 39, clientY: 102
        $element.simulate "mousedown", clientX: 39, clientY: 102
        expect(mouse.downAt.abs.x).toBe(39)
        expect(mouse.downAt.abs.y).toBe(102)
        expect(mouse.downAt.rel.x).toBe(39 - leftOffset)
        expect(mouse.downAt.rel.y).toBe(102 - topOffset)

      it "makes the debug div visible if this instance was initialized with the debug option", ->
        mouse = newMouseWithEvents(debug: true)
        $element.simulate "mousedown"
        expect(ElementMouseTracker.debugDiv()).not.toHaveCss(display: "none")

      it "triggers a possible custom mousedown callback", ->
        mouse = newMouseWithEvents()
        mouse.customEvents.mousedown = jasmine.createSpy()
        $element.simulate "mousedown"
        expect(mouse.customEvents.mousedown).toHaveBeenCalled()

      it "prevents the event from doing anything else"

    describe 'when the mouse is lifted', ->
      _newMouse = (args...) ->
        mouse = newMouseWithEvents(args...)
        $element.simulate "mouseover", {clientX: leftOffset + 1, clientY: topOffset + 1}
        $element.simulate "mousedown", {clientX: leftOffset + 1, clientY: topOffset + 1}
        mouse

      it "sets @isDown to false", ->
        mouse = _newMouse()
        $(document).simulate "mouseup"
        expect(mouse.isDown).toBe(false)

      it "removes the mouseDownWithin reference", ->
        mouse = _newMouse()
        $(document).simulate "mouseup"
        expect(mouse.mouseDownWithin).not.toBe()

      describe 'when the mouse had been dragged before mouseup', ->
        beforeEach ->
          mouse = _newMouse()
          $(document).simulate "mousemove", {clientX: leftOffset + 5, clientY: topOffset: 5}

        it "sets @isDragging to false", ->
          $(document).simulate "mouseup"
          expect(mouse.isDragging).toBe(false)

        it "triggers a possible custom mousedragstop callback", ->
          mouse.mousedragstop = jasmine.createSpy()
          $(document).simulate "mouseup"
          expect(mouse.mousedragstop).toHaveBeenCalled()

      it "triggers a possible custom mouseup callback", ->
        mouse = _newMouse()
        mouse.mouseup = jasmine.createSpy()
        $(document).simulate "mouseup"
        expect(mouse.mouseup).toHaveBeenCalled()

      it "hides the debug div if this instance was initialized with the debug option", ->
        mouse = _newMouse(debug: true)
        $(document).simulate "mouseup"
        expect(ElementMouseTracker.debugDiv()).toHaveCss(display: "none")

    describe 'when the mouse is clicked within the element', ->
      it "triggers possible mouseclick handlers", ->
      it "prevents the event from doing anything else"

    describe 'when the mouse is right-clicked within the element', ->
      it "triggers possible contextmenu handlers"
      it "prevents the event from doing anything else"

    describe 'when the mouse is moved across the element', ->
      it "stores the position of the mouse"
      it "triggers a possible custom mousemove callback"
      it "sets @isDragging if the mouse is down and keeps it there as long as the mouse is moving"
      it "does not set @isDragging to true if the mouse has not been dragged enough to meet the draggingDistance requirement"
      it "triggers a possible custom mousedragstart callback if the dragging has just started to be dragged"
      it "triggers a possible custom mousedrag callback if the mouse is being dragged"
      it "triggers a possible custom mouseglide callback if the mouse is not being dragged"

  describe 'when events have been removed', ->
    describe 'when the mouse is moved over the element', ->
      it "does not trigger a possible custom mouseover callback"

    describe 'when the mouse is moved out of the element', ->
      it "does not trigger a possible custom mouseout callback"

    describe 'when the mouse enters the element', ->
      it "does not set mouseWithin to point to this instance"
      it "does not trigger a possible custom mouseenter callback"

    describe 'when the mouse leaves the element', ->
      it "does not remove the mouseWithin reference"
      it "does not trigger a possible custom mouseleave callback"

    describe 'when the mouse is pressed down within the element', ->
      it "does not set mouseDownWithin to point to this instance"
      it "does not set @isDown to true"
      it "does not stores the position of the mouse"
      it "does not set @downAt to the current mouse position"
      it "does not make the debug div visible if this instance was initialized with the debug option"
      it "does not trigger a possible custom mousedown callback"
      it "does not prevent the event from doing anything else"

    describe 'when the mouse is lifted', ->
      it "does not set @isDown to false"
      it "does not remove the mouseDownWithin reference"
      describe 'when the mouse had been dragged before mouseup', ->
        it "does not set @isDragging to false"
        it "does not trigger a possible custom mousedragstop callback"
      it "does not trigger a possible custom mouseup callback"
      it "does not hide the debug div if this instance was initialized with the debug option"

    describe 'when the mouse is clicked within the element', ->
      it "does not trigger possible mouseclick handlers"
      it "does not prevent the event from doing anything else"

    describe 'when the mouse is right-clicked within the element', ->
      it "does not trigger possible contextmenu handlers"
      it "does not prevent the event from doing anything else"

    describe 'when the mouse is moved across the element', ->
      it "does not store the position of the mouse"
      it "does not trigger a possible custom mousemove callback"
      it "does not set @isDragging if the mouse is down"
      it "does not set @isDragging to true even if the mouse is dragged enough to meet the draggingDistance requirement"
      it "does not trigger a possible custom mousedragstart callback if the dragging has just started to be dragged"
      it "does not trigger a possible custom mousedrag callback if the mouse is being dragged"
      it "does not trigger a possible custom mouseglide callback if the mouse is not being dragged"

  describe '#triggerHandler', ->
    beforeEach ->
      mouse = new ElementMouseTracker.instance($element)

    it "looks up a method by the given name and calls it with the given args, if it exists", ->
      spyOn(mouse, 'mousemove')
      mouse.triggerHandler('mousemove')
      expect(mouse.mousemove).toHaveBeenCalled()

    it "looks up a function property in @customEvents and calls it with the given args, if it exists", ->
      mouse.customEvents.mouseover = jasmine.createSpy()
      mouse.triggerHandler('mouseover')
      expect(mouse.customEvents.mouseover).toHaveBeenCalled()

describe '$.mouseTracker', ->
  it "returns the mouse tracker instance if no args given"
  it "creates a mouse tracker instance and ties it to the element if given an object"
  it "calls the given method on the mouse tracker instance tied to the element"
  it "returns the given property on the mouse tracker instance tied to the element"
  it "returns the mouse tracker instance itself"
  it "destroys the mouse tracker instance"
