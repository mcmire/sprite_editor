describe "ender class methods", ->
  describe '$.extend', ->
    it "copies the properties of the objects after the first object, to the first object", ->
      obj = {foo: "bar", baz: "quux"}
      obj2 = {fizz: "buzz", boom: "shakala"}
      obj3 = {spin: "the", wheel: "of", carpet: "samples"}
      $.extend(obj, obj2, obj3)
      expect(obj).toEqual(foo: "bar", baz: "quux", fizz: "buzz", boom: "shakala", spin: "the", wheel: "of", carpet: "samples")

    it "overwrites any conflicting properties", ->
      obj = {foo: "bar", baz: "quux"}
      obj2 = {fizz: "buzz", boom: "shakala"}
      obj3 = {spin: "the", baz: "of", foo: "samples"}
      $.extend(obj, obj2, obj3)
      expect(obj).toEqual(foo: "samples", baz: "of", fizz: "buzz", boom: "shakala", spin: "the")

    it "when overwriting a property that's a function, stores a reference to the original function in the new function", ->
      origFoo = -> "bar"
      newFoo = -> @_super
      obj = { foo: origFoo }
      obj2 = { foo: newFoo }
      $.extend(obj, obj2)
      expect(obj.foo()).toBe(origFoo)

    it "copies values which are objects by reference, not by value", ->
      subobj = {bar: "baz"}
      obj = {}
      obj2 = { foo: subobj }
      $.extend(obj, obj2)
      expect(obj.foo).toBe(subobj)
      obj.foo.bar = "buzz"
      expect(subobj.bar).toEqual("buzz")
      expect(obj2.foo.bar).toEqual("buzz")

    it "copies values which are objects by value if given true as the first argument", ->
      subobj = {bar: "baz"}
      obj = {}
      obj2 = { foo: subobj }
      $.extend(true, obj, obj2)
      expect(obj.foo).not.toBe(subobj)
      obj.foo.bar = "buzz"
      expect(subobj.bar).toEqual("baz")
      expect(obj2.foo.bar).toEqual("baz")

    it "also clones recursively if given true as the first argument", ->
      obj3 = {baz: "quux"}
      obj2 = {bar: obj3}
      obj = {foo: obj2}
      target = {}
      $.extend(true, target, obj)
      expect(target).not.toBe(obj)
      expect(target.foo).not.toBe(obj2)
      expect(target.foo.bar).not.toBe(obj3)

  describe '$.clone', ->
    it "makes a shallow clone of the given object", ->
      subobj = {bar: "baz"}
      obj = { foo: subobj }
      obj2 = $.clone(obj)
      expect(obj2.foo).toBe(subobj)
      obj2.foo.bar = "buzz"
      expect(subobj.bar).toEqual("buzz")
      expect(obj.foo.bar).toEqual("buzz")

  describe '$.export', ->
    afterEach ->
      window._$_export_test = null
    it "auto-creates the given objects up to the last one if they don't exist (with window as the root context)", ->
      $.export '_$_export_test.foo.bar.baz', 'blargh'
      expect(window._$_export_test).toEqual(foo: {bar: {baz: 'blargh'}})
      expect(window._$_export_test.foo).toEqual(bar: {baz: 'blargh'})
      expect(window._$_export_test.foo.bar).toEqual(baz: 'blargh')

    it "doesn't create objects in the chain that already exist", ->
      bar = {}
      foo = {bar: bar}
      root = {foo: foo}
      window._$_export_test = root
      $.export '_$_export_test.foo.bar.baz', 'blargh'
      expect(window._$_export_test).toBe(root)
      expect(window._$_export_test.foo).toBe(foo)
      expect(window._$_export_test.foo.bar).toBe(bar)
      expect(window._$_export_test.foo.bar.baz).toBe('blargh')

    it "adds the given object to the end of the chain", ->
      $.export '_$_export_test.foo.bar.baz', 'blargh'
      expect(window._$_export_test.foo.bar.baz).toEqual('blargh')

    it "also accepts a function as the second argument which must return the object to store", ->
      $.export '_$_export_test.foo.bar.baz', -> 'blargh'
      expect(window._$_export_test.foo.bar.baz).toEqual('blargh')

    it "passes the items in the current chain to the function before adding the new object", ->
      foo = {}
      root = {foo: foo}
      window._$_export_test = root
      $.export '_$_export_test.foo.bar', (root, foo) -> [root, foo]
      newObj = window._$_export_test.foo.bar
      expect(newObj[0]).toBe(root)
      expect(newObj[1]).toBe(foo)

  describe '$.tap', ->
    it "calls the given function with the given object and then returns the object", ->
      obj = $.tap {foo: "bar"}, (obj) -> obj.baz = "quux"
      expect(obj).toEqual(foo: "bar", baz: "quux")

describe 'ender instance methods', ->
  describe '$::center', ->
    it "sets the top and left coordinates of the element so it is in the center of the window", ->
      window.innerHeight = 200
      window.innerWidth = 200
      $div = $('<div/>').css(width: 50, height: 50)
      $div.center()
      expect($div.css('top')).toEqual('75px')
      expect($div.css('left')).toEqual('75px')

  describe '$::position', ->
    describe 'for a child element of a global element', ->
      it "is (0, 0) by default", ->
        $div1 = $('<div/>').appendTo('#sandbox')
        $div2 = $('<div/>').appendTo($div1)
        expect($div2.position()).toEqual(top: 0, left: 0)

      it "returns the coordinates that represent the offset from the parent element, not the document", ->
        $div1 = $('<div/>').appendTo('#sandbox').css(padding: '20px')
        $div2 = $('<div/>').appendTo($div1)
        expect($div2.position()).toEqual(top: 20, left: 20)

      it "also works with margin", ->
        $div1 = $('<div/>').appendTo('#sandbox').css(overflow: 'auto')
        $div2 = $('<div/>').appendTo($div1).css(margin: '20px')
        expect($div2.position()).toEqual(top: 20, left: 20)

      it "returns the same information as offset() if the element is absolutely positioned via top: and left:", ->
        $div1 = $('<div/>').css(
          position: 'absolute'
          top: '200px'
          left: '200px'
        ).appendTo('#sandbox')
        $div2 = $('<div/>').css(
          position: 'absolute'
          top: '50px'
          left: '50px'
        ).appendTo($div1)
        expect($div2.position()).toEqual(top: 50, left: 50)

    describe 'for a global element', ->
      $div = null

      beforeEach ->
        $div = $('<div/>')
        $(document.body).css(margin: "inherit", padding: "inherit").append($div)

      afterEach ->
        $div.remove()

      it "is (0, 0) by default", ->
        $(document.body).css(margin: 0, padding: 0)
        expect($div.position()).toEqual(top: 0, left: 0)

      it "returns the coordinates that represent the offset from the document", ->
        $(document.body).css(padding: '20px')
        expect($div.position()).toEqual(top: 20, left: 20)

      it "also works with margin", ->
        $div.css(margin: '20px')
        expect($div.position()).toEqual(top: 20, left: 20)

      it "returns the same information as offset() if the element is absolutely positioned via top: and left:", ->
        $div.css(position: 'absolute', top: '50px', left: '50px')
        expect($div.position()).toEqual(top: 50, left: 50)

    describe 'for the body', ->
      beforeEach ->
        $(document.body).css(margin: "inherit", padding: "inherit")

      it "is (0, 0)", ->
        expect($(document.body).position()).toEqual(top: 0, left: 0)

      it "is (0, 0) even with margin", ->
        $body = $(document.body).css(margin: '20px')
        expect($body.position()).toEqual(top: 0, left: 0)

  describe '$::parent', ->
    it "returns the parentNode wrapped in an Ender chain if the element has a parentNode", ->
      expect($('#sandbox').parent()[0]).toEqual(document.body)
      expect($(document.body).parent()[0]).toEqual(document.documentElement)
    it "returns nothing if the element doesn't have a parentNode", ->
      expect($(document.documentElement).parent[0]).toBeUndefined()

  describe '$::computedStyle', ->
    it "returns the computedStyle object of the first element", ->
      expect($('#sandbox').computedStyle()).toBeAnInstanceOf(CSSStyleDeclaration)
    it "returns value of the given style property", ->
      $sandbox = $('#sandbox').html("<p>This is a sentence</p><p>And this is another</p>")
      expect($sandbox.computedStyle('height')).toEqual('52px')













