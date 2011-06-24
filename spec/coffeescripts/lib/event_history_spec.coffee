EH = SpriteEditor.EventHistory

describe "EventHistory", ->
  history = null
  beforeEach -> history = EH.init("app")

  describe '.init', ->
    it "stores the given App instance", ->
      expect(history.app).toEqual("app")
    it "initializes events", ->
      expect(history.events).toEqual([])
    it "initializes currentIndex", ->
      expect(history.currentIndex).toBe(-1)
    it "returns the EventHistory object", ->
      expect(history).toBe(EH)

  describe '.recordEvent', ->
    data = action = obj = null
    addEvent = ->
      data = {zing: "zang"}
      action = {do: -> data}
      obj = {actions: {foo: action}}
      history.recordEvent(obj, "foo")
    it "looks up the given action, executes its 'do' subroutine to get event data, and uses it to add a new event to @events", ->
      addEvent()
      event = history.events[0]
      expect(event.object).toBe(obj)
      expect(event.method).toEqual("foo")
      expect(event.action).toBe(action)
      expect(event.data).toBe(data)
    it "increments currentIndex", ->
      addEvent()
      expect(history.currentIndex).toBe(0)
    it "forces the new event to be the last one in @events", ->
      history.events = [
        "an event",
        "another event",
        "yet another event"
      ]
      history.currentIndex = 0
      addEvent()
      expect(history.events).toEqual([
        "an event",
        {object: obj, method: "foo", action: action, data: data}
      ])
    it "limits the @events to 100 items by popping off the first event before adding a new one", ->
      history.events = new Array(100)
      history.currentIndex = 99
      history.events[0] = "some event"
      addEvent()
      expect(history.events.length).toBe(100)
      expect(history.events[0]).not.toEqual("some event")

  describe '.undo', ->
    action = null
    beforeEach ->
      action = {}
      action.undo = jasmine.createSpy()
      history.events = [ {action: action, data: "some data"} ]
      history.currentIndex = 0
    it "gets the current event and calls the 'undo' subroutine of the event action", ->
      history.undo()
      expect(action.undo).toHaveBeenCalledWith("some data")
    it "decrements the currentIndex", ->
      history.undo()
      expect(history.currentIndex).toBe(-1)
    it "does nothing if currentIndex is -1", ->
      history.currentIndex = -1
      history.undo()
      expect(action.undo).not.toHaveBeenCalled()
      expect(history.currentIndex).toBe(-1)

  describe '.redo', ->
    action = null
    beforeEach ->
      action = {}
      action.redo = jasmine.createSpy()
      history.events = [ null, null, {action: action, data: "some data"} ]
      history.currentIndex = 1
    it "gets the next event and calls the 'redo' subroutine of the event action", ->
      history.redo()
      expect(action.redo).toHaveBeenCalledWith("some data")
    it "increments the currentIndex", ->
      history.redo()
      expect(history.currentIndex).toBe(2)
    it "does nothing if currentIndex is at the end of the @events array", ->
      history.currentIndex = 2
      history.redo()
      expect(action.redo).not.toHaveBeenCalled()
      expect(history.currentIndex).toBe(2)