(function() {
  var ElementMouseTracker;
  var __slice = Array.prototype.slice;
  ElementMouseTracker = SpriteEditor.ElementMouseTracker;
  describe('ElementMouseTracker', function() {
    var mouse;
    mouse = null;
    afterEach(function() {
      ElementMouseTracker.destroy();
      return mouse = null;
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(ElementMouseTracker._bindEvents).toBeTypeOf("function");
      return expect(ElementMouseTracker._unbindEvents).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      describe('if not initialized yet', function() {
        it("resets key variables", function() {
          spyOn(ElementMouseTracker, 'reset').andCallThrough();
          mouse = ElementMouseTracker.init();
          return expect(ElementMouseTracker.reset).toHaveBeenCalled();
        });
        it("initializes @_eventsAdded to false", function() {
          mouse = ElementMouseTracker.init();
          return expect(mouse._eventsAdded).toBeFalsy();
        });
        return it("sets @isInitialized to true", function() {
          mouse = ElementMouseTracker.init();
          return expect(mouse.isInitialized).toBeTruthy();
        });
      });
      return describe('if already initialized', function() {
        beforeEach(function() {
          return mouse = ElementMouseTracker.init();
        });
        it("doesn't try to reset variables", function() {
          spyOn(ElementMouseTracker, 'reset');
          mouse = ElementMouseTracker.init();
          return expect(ElementMouseTracker.reset).not.toHaveBeenCalled();
        });
        return it("doesn't set @_eventsAdded", function() {
          mouse._eventsAdded = null;
          mouse = ElementMouseTracker.init();
          return expect(mouse._eventsAdded).toBeNull();
        });
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return mouse = ElementMouseTracker.init();
      });
      describe('if not destroyed yet', function() {
        it("removes any events that may have been added", function() {
          spyOn(mouse, 'removeEvents');
          mouse.destroy();
          return expect(mouse.removeEvents).toHaveBeenCalled();
        });
        it("destroys any active instances", function() {
          var destroy;
          destroy = jasmine.createSpy();
          mouse.instances = [
            {
              destroy: destroy
            }
          ];
          mouse.destroy();
          return expect(destroy).toHaveBeenCalled();
        });
        it("resets any key variables", function() {
          spyOn(mouse, 'reset');
          mouse.destroy();
          return expect(mouse.reset).toHaveBeenCalled();
        });
        return it("sets @isInitialized to false", function() {
          mouse.destroy();
          return expect(mouse.isInitialized).toBeFalsy();
        });
      });
      return describe('if already destroyed', function() {
        beforeEach(function() {
          return mouse.destroy();
        });
        it("doesn't try to remove events", function() {
          spyOn(mouse, 'removeEvents');
          mouse.destroy();
          return expect(mouse.removeEvents).not.toHaveBeenCalled();
        });
        it("try to destroy active instances", function() {
          var destroy;
          destroy = jasmine.createSpy();
          mouse.instances = [
            {
              destroy: destroy
            }
          ];
          mouse.destroy();
          return expect(destroy).not.toHaveBeenCalled();
        });
        return it("doesn't reset anything", function() {
          spyOn(mouse, 'reset');
          mouse.destroy();
          return expect(mouse.reset).not.toHaveBeenCalled();
        });
      });
    });
    describe('when reset', function() {
      beforeEach(function() {
        return mouse = ElementMouseTracker.init();
      });
      it("clears @instances", function() {
        mouse.instances = "whatever";
        mouse.reset();
        return expect(mouse.instances).toEqual([]);
      });
      it("resets @activeInstance", function() {
        mouse.activeInstance = "whatever";
        mouse.reset();
        return expect(mouse.activeInstance).toEqual({
          mouseWithin: null,
          mouseDownWithin: null
        });
      });
      it("clears @pos", function() {
        mouse.pos = "something";
        mouse.reset();
        return expect(mouse.pos).not.toBe();
      });
      it("ensures that the debug div is removed from the document", function() {
        var $div;
        $div = mouse.debugDiv();
        mouse.reset();
        return expect(document.body).not.toContainElement($div);
      });
      return it("clears @$debugDiv", function() {
        var $div;
        $div = mouse.debugDiv();
        mouse.reset();
        return expect(mouse.$debugDiv).not.toBe();
      });
    });
    describe('when events have been added', function() {
      beforeEach(function() {
        mouse = ElementMouseTracker.init();
        return mouse.addEvents();
      });
      describe('when the mouse is lifted', function() {
        it("calls a possible mouseup event on the active instance", function() {
          var $element, instance;
          $element = $('<div />');
          instance = mouse.activeInstance.mouseDownWithin = new ElementMouseTracker.instance($element);
          spyOn(instance, "mouseup");
          $(document).simulate("mouseup");
          return expect(instance.mouseup).toHaveBeenCalled();
        });
        return it("prevents the event from doing anything");
      });
      return describe('when the mouse is moved', function() {
        it("stores the current mouse position (relative to the document)", function() {
          $(document).simulate("mousemove", {
            clientX: 90,
            clientY: 240
          });
          return expect(mouse.pos).toEqual({
            x: 90,
            y: 240
          });
        });
        it("calls a possible mousemove event on the active instance", function() {
          var $element, instance;
          $element = $('<div />');
          instance = mouse.activeInstance.mouseWithin = new ElementMouseTracker.instance($element);
          spyOn(instance, "mousemove");
          $(document).simulate("mousemove", {
            clientX: 90,
            clientY: 240
          });
          return expect(instance.mousemove).toHaveBeenCalled();
        });
        return it("prevents the event from doing anything else");
      });
    });
    describe('when events have been removed', function() {
      beforeEach(function() {
        mouse = ElementMouseTracker.init();
        mouse.addEvents();
        return mouse.removeEvents();
      });
      describe('when the mouse is lifted', function() {
        return it("doesn't try to call a mouseup event on the active instance", function() {
          var $element, instance;
          $element = $('<div />');
          instance = mouse.activeInstance.mouseDownWithin = new ElementMouseTracker.instance($element);
          spyOn(instance, "mouseup");
          $(document).simulate("mouseup");
          return expect(instance.mouseup).not.toHaveBeenCalled();
        });
      });
      return describe('when the mouse is moved', function() {
        it("stores the current mouse position (relative to the document)", function() {
          $(document).simulate("mousemove", {
            clientX: 90,
            clientY: 240
          });
          return expect(mouse.pos).not.toBe();
        });
        return it("calls a possible mousemove event on the active instance", function() {
          var $element, instance;
          $element = $('<div />');
          instance = mouse.activeInstance.mouseWithin = new ElementMouseTracker.instance($element);
          spyOn(instance, "mousemove");
          $(document).simulate("mousemove", {
            clientX: 90,
            clientY: 240
          });
          return expect(instance.mousemove).not.toHaveBeenCalled();
        });
      });
    });
    describe('#add', function() {
      var $element;
      $element = null;
      beforeEach(function() {
        mouse = ElementMouseTracker.init();
        return $element = $('<div />');
      });
      it("automatically calls addEvents() if this is the first instance being added", function() {
        mouse.add($element);
        return expect(mouse._eventsAdded).toBeTruthy();
      });
      it("adds a new instance to @instances", function() {
        mouse.add($element);
        expect(mouse.instances.length).toBe(1);
        return expect(mouse.instances[0]).toBeAnInstanceOf(ElementMouseTracker.instance);
      });
      it("adds events to the element associated with the instance", function() {
        mouse.add($element);
        return expect(mouse.instances[0]._eventsAdded).toBeTruthy();
      });
      return it("returns the new instance", function() {
        return expect(mouse.add($element)).toBe(mouse.instances[0]);
      });
    });
    return describe('#remove', function() {
      var $element, instance;
      $element = instance = null;
      beforeEach(function() {
        mouse = ElementMouseTracker.init();
        $element = $('<div />');
        return instance = mouse.activeInstance.mouseWithin = new ElementMouseTracker.instance($element);
      });
      it("destroys the given instance", function() {
        spyOn(instance, 'destroy');
        mouse.remove(instance);
        return expect(instance.destroy).toHaveBeenCalled();
      });
      it("removes the instance from @instances", function() {
        mouse.instances.push(instance);
        mouse.remove(instance);
        return expect(mouse.instances.length).toBe(0);
      });
      it("deletes mouseWithin if this is the instance pointed to", function() {
        mouse.activeInstance.mouseWithin = instance;
        mouse.remove(instance);
        return expect(mouse.activeInstance.mouseWithin).not.toBe();
      });
      it("deletes mouseDownWithin if this is the instance pointed to", function() {
        mouse.activeInstance.mouseDownWithin = instance;
        mouse.remove(instance);
        return expect(mouse.activeInstance.mouseDownWithin).not.toBe();
      });
      return it("automatically calls removeEvents() if this is the last instance being removed", function() {
        spyOn(mouse, 'removeEvents');
        mouse.remove(instance);
        return expect(mouse.removeEvents).toHaveBeenCalled();
      });
    });
  });
  describe('ElementMouseTracker.instance', function() {
    var $element, mouse, newMouse;
    mouse = $element = null;
    newMouse = function() {
      var args, fn, props;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      props = $.v.find(args, function(a) {
        return $.v.is.obj(a);
      }) || {};
      fn = $.v.find(args, function(a) {
        return $.v.is.fun(a);
      });
      $element = $('<div />');
      if (typeof fn === "function") {
        fn($element);
      }
      return new ElementMouseTracker.instance($element, props);
    };
    afterEach(function() {
      return mouse != null ? mouse.destroy() : void 0;
    });
    it("responds to _bindEvents and _unbindEvents", function() {
      expect(ElementMouseTracker.instance.prototype._bindEvents).toBeTypeOf("function");
      return expect(ElementMouseTracker.instance.prototype._unbindEvents).toBeTypeOf("function");
    });
    describe('when initialized', function() {
      it("stores the given @$element", function() {
        mouse = newMouse();
        return expect(mouse.$element).toBeElementOf("div");
      });
      it("stores options that refer to mouse events in @customEvents", function() {
        mouse = newMouse({
          foo: "bar",
          baz: "quux",
          mousedrag: "zing",
          mouseover: "zang"
        });
        expect(mouse.customEvents.mousedrag).toEqual("zing");
        return expect(mouse.customEvents.mouseover).toEqual("zang");
      });
      it("stores the rest of the options in @options", function() {
        mouse = newMouse({
          foo: "bar",
          baz: "quux",
          draggingDistance: 10,
          mousedrag: "zing",
          mouseover: "zang"
        });
        expect(mouse.options.foo).toEqual("bar");
        expect(mouse.options.baz).toEqual("quux");
        return expect(mouse.options.draggingDistance).toBe(10);
      });
      it("sets the draggingDistance to 1 by default", function() {
        mouse = newMouse();
        return expect(mouse.options.draggingDistance).toBe(1);
      });
      it("initializes @pos", function() {
        mouse = newMouse();
        expect(mouse.pos.abs).not.toBe();
        return expect(mouse.pos.rel).not.toBe();
      });
      it("initializes @isDown", function() {
        mouse = newMouse();
        return expect(mouse.isDown).toBe(false);
      });
      it("initializes @downAt", function() {
        mouse = newMouse();
        expect(mouse.downAt.abs).not.toBe();
        return expect(mouse.downAt.rel).not.toBe();
      });
      it("initializes @isDragging", function() {
        mouse = newMouse();
        return expect(mouse.isDragging).toBe(false);
      });
      it("caches the element's offset in @elementOffset", function() {
        mouse = newMouse(function($element) {
          return $('#sandbox').append($element);
        });
        expect(mouse.elementOffset.top).toBe(8);
        return expect(mouse.elementOffset.left).toBe(8);
      });
      return it("caches the element size in @elementSize", function() {
        mouse = newMouse(function($element) {
          $element.html("<p>Foo bar</p><p>Baz quux</p>");
          return $('#sandbox').append($element);
        });
        expect(mouse.elementSize.width).toBe(1008);
        return expect(mouse.elementSize.height).toBe(52);
      });
    });
    describe('when destroyed', function() {
      beforeEach(function() {
        return mouse = newMouse();
      });
      return it("removes any events which may have been added", function() {
        spyOn(mouse, 'removeEvents');
        mouse.destroy();
        return expect(mouse.removeEvents).toHaveBeenCalled();
      });
    });
    describe('when events have been added', function() {
      var leftOffset, newMouseWithEvents, topOffset;
      topOffset = leftOffset = 10;
      newMouseWithEvents = function() {
        var args, fn, props;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        props = $.v.find(args, function(a) {
          return $.v.is.obj(a);
        }) || {};
        fn = $.v.find(args, function(a) {
          return $.v.is.fun(a);
        });
        $element = $('<div />');
        $element.css({
          position: 'absolute',
          top: 0,
          left: 0,
          "margin-left": leftOffset,
          "margin-top": topOffset,
          width: '500px',
          height: '500px'
        });
        $('#sandbox').append($element);
        if (typeof fn === "function") {
          fn($element);
        }
        mouse = new ElementMouseTracker.instance($element, props);
        mouse.addEvents();
        return mouse;
      };
      beforeEach(function() {
        return ElementMouseTracker.init().addEvents();
      });
      describe('when the mouse enters the element', function() {
        it("triggers a possible custom mouseover callback", function() {
          mouse = newMouseWithEvents();
          mouse.customEvents.mouseover = jasmine.createSpy();
          $element.simulate("mouseover");
          return expect(mouse.customEvents.mouseover).toHaveBeenCalled();
        });
        it("sets mouseWithin to point to this instance", function() {
          mouse = newMouseWithEvents();
          $element.simulate("mouseover");
          return expect(ElementMouseTracker.activeInstance.mouseWithin).toBe(mouse);
        });
        return it("triggers a possible custom mouseenter callback", function() {
          mouse = newMouseWithEvents();
          mouse.customEvents.mouseenter = jasmine.createSpy();
          $element.simulate("mouseover");
          return expect(mouse.customEvents.mouseenter).toHaveBeenCalled();
        });
      });
      describe('when the mouse leaves the element', function() {
        it("triggers a possible custom mouseout callback", function() {
          mouse = newMouseWithEvents();
          mouse.customEvents.mouseout = jasmine.createSpy();
          $element.simulate("mouseout");
          return expect(mouse.customEvents.mouseout).toHaveBeenCalled();
        });
        it("removes the mouseWithin reference", function() {
          mouse = newMouseWithEvents();
          $element.simulate("mouseout");
          return expect(ElementMouseTracker.activeInstance.mouseWithin).not.toBe();
        });
        return it("triggers a possible custom mouseleave callback", function() {
          mouse = newMouseWithEvents();
          mouse.customEvents.mouseleave = jasmine.createSpy();
          $element.simulate("mouseout");
          return expect(mouse.customEvents.mouseleave).toHaveBeenCalled();
        });
      });
      describe('when the mouse is pressed down within the element', function() {
        it("sets mouseDownWithin to point to this instance", function() {
          mouse = newMouseWithEvents();
          $element.simulate("mousedown");
          return expect(ElementMouseTracker.activeInstance.mouseDownWithin).toBe(mouse);
        });
        it("sets @isDown to true", function() {
          mouse = newMouseWithEvents();
          $element.simulate("mousedown");
          return expect(mouse.isDown).toBe(true);
        });
        it("stores the position of the mouse", function() {
          mouse = newMouseWithEvents();
          $(document).simulate("mousemove", {
            clientX: 39,
            clientY: 102
          });
          $element.simulate("mousedown", {
            clientX: 39,
            clientY: 102
          });
          expect(mouse.pos.abs.x).toBe(39);
          expect(mouse.pos.abs.y).toBe(102);
          expect(mouse.pos.rel.x).toBe(39 - leftOffset);
          return expect(mouse.pos.rel.y).toBe(102 - topOffset);
        });
        it("sets @downAt to the current mouse position", function() {
          mouse = newMouseWithEvents();
          $(document).simulate("mousemove", {
            clientX: 39,
            clientY: 102
          });
          $element.simulate("mousedown", {
            clientX: 39,
            clientY: 102
          });
          expect(mouse.downAt.abs.x).toBe(39);
          expect(mouse.downAt.abs.y).toBe(102);
          expect(mouse.downAt.rel.x).toBe(39 - leftOffset);
          return expect(mouse.downAt.rel.y).toBe(102 - topOffset);
        });
        it("makes the debug div visible if this instance was initialized with the debug option", function() {
          mouse = newMouseWithEvents({
            debug: true
          });
          $element.simulate("mousedown");
          return expect(ElementMouseTracker.debugDiv()).not.toHaveCss({
            display: "none"
          });
        });
        it("triggers a possible custom mousedown callback", function() {
          mouse = newMouseWithEvents();
          mouse.customEvents.mousedown = jasmine.createSpy();
          $element.simulate("mousedown");
          return expect(mouse.customEvents.mousedown).toHaveBeenCalled();
        });
        return it("prevents the event from doing anything else");
      });
      describe('when the mouse is lifted', function() {
        var _newMouse;
        _newMouse = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          mouse = newMouseWithEvents.apply(null, args);
          $element.simulate("mouseover", {
            clientX: leftOffset + 1,
            clientY: topOffset + 1
          });
          $element.simulate("mousedown", {
            clientX: leftOffset + 1,
            clientY: topOffset + 1
          });
          return mouse;
        };
        it("sets @isDown to false", function() {
          mouse = _newMouse();
          $(document).simulate("mouseup");
          return expect(mouse.isDown).toBe(false);
        });
        it("removes the mouseDownWithin reference", function() {
          mouse = _newMouse();
          $(document).simulate("mouseup");
          return expect(mouse.mouseDownWithin).not.toBe();
        });
        describe('when the mouse had been dragged before mouseup', function() {
          beforeEach(function() {
            mouse = _newMouse();
            return $(document).simulate("mousemove", {
              clientX: leftOffset + 5,
              clientY: {
                topOffset: 5
              }
            });
          });
          it("sets @isDragging to false", function() {
            $(document).simulate("mouseup");
            return expect(mouse.isDragging).toBe(false);
          });
          return it("triggers a possible custom mousedragstop callback", function() {
            mouse.mousedragstop = jasmine.createSpy();
            $(document).simulate("mouseup");
            return expect(mouse.mousedragstop).toHaveBeenCalled();
          });
        });
        it("triggers a possible custom mouseup callback", function() {
          mouse = _newMouse();
          mouse.mouseup = jasmine.createSpy();
          $(document).simulate("mouseup");
          return expect(mouse.mouseup).toHaveBeenCalled();
        });
        return it("hides the debug div if this instance was initialized with the debug option", function() {
          mouse = _newMouse({
            debug: true
          });
          $(document).simulate("mouseup");
          return expect(ElementMouseTracker.debugDiv()).toHaveCss({
            display: "none"
          });
        });
      });
      describe('when the mouse is clicked within the element', function() {
        it("triggers possible mouseclick handlers", function() {});
        return it("prevents the event from doing anything else");
      });
      describe('when the mouse is right-clicked within the element', function() {
        it("triggers possible contextmenu handlers");
        return it("prevents the event from doing anything else");
      });
      return describe('when the mouse is moved across the element', function() {
        it("stores the position of the mouse");
        it("triggers a possible custom mousemove callback");
        it("sets @isDragging if the mouse is down and keeps it there as long as the mouse is moving");
        it("does not set @isDragging to true if the mouse has not been dragged enough to meet the draggingDistance requirement");
        it("triggers a possible custom mousedragstart callback if the dragging has just started to be dragged");
        it("triggers a possible custom mousedrag callback if the mouse is being dragged");
        return it("triggers a possible custom mouseglide callback if the mouse is not being dragged");
      });
    });
    describe('when events have been removed', function() {
      describe('when the mouse is moved over the element', function() {
        return it("does not trigger a possible custom mouseover callback");
      });
      describe('when the mouse is moved out of the element', function() {
        return it("does not trigger a possible custom mouseout callback");
      });
      describe('when the mouse enters the element', function() {
        it("does not set mouseWithin to point to this instance");
        return it("does not trigger a possible custom mouseenter callback");
      });
      describe('when the mouse leaves the element', function() {
        it("does not remove the mouseWithin reference");
        return it("does not trigger a possible custom mouseleave callback");
      });
      describe('when the mouse is pressed down within the element', function() {
        it("does not set mouseDownWithin to point to this instance");
        it("does not set @isDown to true");
        it("does not stores the position of the mouse");
        it("does not set @downAt to the current mouse position");
        it("does not make the debug div visible if this instance was initialized with the debug option");
        it("does not trigger a possible custom mousedown callback");
        return it("does not prevent the event from doing anything else");
      });
      describe('when the mouse is lifted', function() {
        it("does not set @isDown to false");
        it("does not remove the mouseDownWithin reference");
        describe('when the mouse had been dragged before mouseup', function() {
          it("does not set @isDragging to false");
          return it("does not trigger a possible custom mousedragstop callback");
        });
        it("does not trigger a possible custom mouseup callback");
        return it("does not hide the debug div if this instance was initialized with the debug option");
      });
      describe('when the mouse is clicked within the element', function() {
        it("does not trigger possible mouseclick handlers");
        return it("does not prevent the event from doing anything else");
      });
      describe('when the mouse is right-clicked within the element', function() {
        it("does not trigger possible contextmenu handlers");
        return it("does not prevent the event from doing anything else");
      });
      return describe('when the mouse is moved across the element', function() {
        it("does not store the position of the mouse");
        it("does not trigger a possible custom mousemove callback");
        it("does not set @isDragging if the mouse is down");
        it("does not set @isDragging to true even if the mouse is dragged enough to meet the draggingDistance requirement");
        it("does not trigger a possible custom mousedragstart callback if the dragging has just started to be dragged");
        it("does not trigger a possible custom mousedrag callback if the mouse is being dragged");
        return it("does not trigger a possible custom mouseglide callback if the mouse is not being dragged");
      });
    });
    return describe('#triggerHandler', function() {
      beforeEach(function() {
        return mouse = new ElementMouseTracker.instance($element);
      });
      it("looks up a method by the given name and calls it with the given args, if it exists", function() {
        spyOn(mouse, 'mousemove');
        mouse.triggerHandler('mousemove');
        return expect(mouse.mousemove).toHaveBeenCalled();
      });
      return it("looks up a function property in @customEvents and calls it with the given args, if it exists", function() {
        mouse.customEvents.mouseover = jasmine.createSpy();
        mouse.triggerHandler('mouseover');
        return expect(mouse.customEvents.mouseover).toHaveBeenCalled();
      });
    });
  });
  describe('$.mouseTracker', function() {
    it("returns the mouse tracker instance if no args given");
    it("creates a mouse tracker instance and ties it to the element if given an object");
    it("calls the given method on the mouse tracker instance tied to the element");
    it("returns the given property on the mouse tracker instance tied to the element");
    it("returns the mouse tracker instance itself");
    return it("destroys the mouse tracker instance");
  });
}).call(this);
