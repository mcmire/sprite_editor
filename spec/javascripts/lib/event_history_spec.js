(function() {
  var EventHistory;
  EventHistory = SpriteEditor.EventHistory;
  describe("EventHistory", function() {
    var app, history;
    app = history = null;
    beforeEach(function() {
      return app = "app";
    });
    afterEach(function() {
      EventHistory.destroy();
      return history = null;
    });
    describe('when initialized', function() {
      it("stores the given App instance", function() {
        history = EventHistory.init(app);
        return expect(history.app).toEqual(app);
      });
      return it("resets key variables", function() {
        spyOn(EventHistory, "reset");
        history = EventHistory.init(app);
        return expect(history.reset).toHaveBeenCalled();
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return history = EventHistory.init(app);
      });
      return it("resets key variables", function() {
        spyOn(EventHistory, "reset");
        history.destroy();
        return expect(history.reset).toHaveBeenCalled();
      });
    });
    describe('when reset', function() {
      beforeEach(function() {
        return history = EventHistory.init(app);
      });
      it("initializes events", function() {
        history.reset();
        return expect(history.events).toEqual([]);
      });
      return it("initializes currentIndex", function() {
        history.reset();
        return expect(history.currentIndex).toBe(-1);
      });
    });
    describe('.recordEvent', function() {
      var action, addEvent, data, obj;
      data = action = obj = null;
      beforeEach(function() {
        return history = EventHistory.init(app);
      });
      addEvent = function() {
        data = {
          zing: "zang"
        };
        action = {
          "do": function() {
            return data;
          }
        };
        obj = {
          actions: {
            foo: action
          }
        };
        return history.recordEvent(obj, "foo");
      };
      it("looks up the given action, executes its 'do' subroutine to get event data, and uses it to add a new event to @events", function() {
        var event;
        addEvent();
        event = history.events[0];
        expect(event.object).toBe(obj);
        expect(event.method).toEqual("foo");
        expect(event.action).toBe(action);
        return expect(event.data).toBe(data);
      });
      it("increments currentIndex", function() {
        addEvent();
        return expect(history.currentIndex).toBe(0);
      });
      it("forces the new event to be the last one in @events", function() {
        history.events = ["an event", "another event", "yet another event"];
        history.currentIndex = 0;
        addEvent();
        return expect(history.events).toEqual([
          "an event", {
            object: obj,
            method: "foo",
            action: action,
            data: data
          }
        ]);
      });
      return it("limits the @events to 100 items by popping off the first event before adding a new one", function() {
        history.events = new Array(100);
        history.currentIndex = 99;
        history.events[0] = "some event";
        addEvent();
        expect(history.events.length).toBe(100);
        return expect(history.events[0]).not.toEqual("some event");
      });
    });
    describe('.undo', function() {
      var action;
      action = null;
      beforeEach(function() {
        history = EventHistory.init(app);
        action = {};
        action.undo = jasmine.createSpy();
        history.events = [
          {
            action: action,
            data: "some data"
          }
        ];
        return history.currentIndex = 0;
      });
      it("gets the current event and calls the 'undo' subroutine of the event action", function() {
        history.undo();
        return expect(action.undo).toHaveBeenCalledWith("some data");
      });
      it("decrements the currentIndex", function() {
        history.undo();
        return expect(history.currentIndex).toBe(-1);
      });
      return it("does nothing if currentIndex is -1", function() {
        history.currentIndex = -1;
        history.undo();
        expect(action.undo).not.toHaveBeenCalled();
        return expect(history.currentIndex).toBe(-1);
      });
    });
    return describe('.redo', function() {
      var action;
      action = null;
      beforeEach(function() {
        history = EventHistory.init(app);
        action = {};
        action.redo = jasmine.createSpy();
        history.events = [
          null, null, {
            action: action,
            data: "some data"
          }
        ];
        return history.currentIndex = 1;
      });
      it("gets the next event and calls the 'redo' subroutine of the event action", function() {
        history.redo();
        return expect(action.redo).toHaveBeenCalledWith("some data");
      });
      it("increments the currentIndex", function() {
        history.redo();
        return expect(history.currentIndex).toBe(2);
      });
      return it("does nothing if currentIndex is at the end of the @events array", function() {
        history.currentIndex = 2;
        history.redo();
        expect(action.redo).not.toHaveBeenCalled();
        return expect(history.currentIndex).toBe(2);
      });
    });
  });
}).call(this);
