(function() {
  describe("ender class methods", function() {
    describe('$.extend', function() {
      it("copies the properties of the objects after the first object, to the first object", function() {
        var obj, obj2, obj3;
        obj = {
          foo: "bar",
          baz: "quux"
        };
        obj2 = {
          fizz: "buzz",
          boom: "shakala"
        };
        obj3 = {
          spin: "the",
          wheel: "of",
          carpet: "samples"
        };
        $.extend(obj, obj2, obj3);
        return expect(obj).toEqual({
          foo: "bar",
          baz: "quux",
          fizz: "buzz",
          boom: "shakala",
          spin: "the",
          wheel: "of",
          carpet: "samples"
        });
      });
      it("overwrites any conflicting properties", function() {
        var obj, obj2, obj3;
        obj = {
          foo: "bar",
          baz: "quux"
        };
        obj2 = {
          fizz: "buzz",
          boom: "shakala"
        };
        obj3 = {
          spin: "the",
          baz: "of",
          foo: "samples"
        };
        $.extend(obj, obj2, obj3);
        return expect(obj).toEqual({
          foo: "samples",
          baz: "of",
          fizz: "buzz",
          boom: "shakala",
          spin: "the"
        });
      });
      it("when overwriting a property that's a function, stores a reference to the original function in the new function", function() {
        var newFoo, obj, obj2, origFoo;
        origFoo = function() {
          return "bar";
        };
        newFoo = function() {
          return this._super;
        };
        obj = {
          foo: origFoo
        };
        obj2 = {
          foo: newFoo
        };
        $.extend(obj, obj2);
        return expect(obj.foo()).toBe(origFoo);
      });
      it("copies values which are objects by reference, not by value", function() {
        var obj, obj2, subobj;
        subobj = {
          bar: "baz"
        };
        obj = {};
        obj2 = {
          foo: subobj
        };
        $.extend(obj, obj2);
        expect(obj.foo).toBe(subobj);
        obj.foo.bar = "buzz";
        expect(subobj.bar).toEqual("buzz");
        return expect(obj2.foo.bar).toEqual("buzz");
      });
      it("copies values which are objects by value if given true as the first argument", function() {
        var obj, obj2, subobj;
        subobj = {
          bar: "baz"
        };
        obj = {};
        obj2 = {
          foo: subobj
        };
        $.extend(true, obj, obj2);
        expect(obj.foo).not.toBe(subobj);
        obj.foo.bar = "buzz";
        expect(subobj.bar).toEqual("baz");
        return expect(obj2.foo.bar).toEqual("baz");
      });
      return it("also clones recursively if given true as the first argument", function() {
        var obj, obj2, obj3, target;
        obj3 = {
          baz: "quux"
        };
        obj2 = {
          bar: obj3
        };
        obj = {
          foo: obj2
        };
        target = {};
        $.extend(true, target, obj);
        expect(target).not.toBe(obj);
        expect(target.foo).not.toBe(obj2);
        return expect(target.foo.bar).not.toBe(obj3);
      });
    });
    describe('$.clone', function() {
      return it("makes a shallow clone of the given object", function() {
        var obj, obj2, subobj;
        subobj = {
          bar: "baz"
        };
        obj = {
          foo: subobj
        };
        obj2 = $.clone(obj);
        expect(obj2.foo).toBe(subobj);
        obj2.foo.bar = "buzz";
        expect(subobj.bar).toEqual("buzz");
        return expect(obj.foo.bar).toEqual("buzz");
      });
    });
    describe('$.export', function() {
      afterEach(function() {
        return window._$_export_test = null;
      });
      it("auto-creates the given objects up to the last one if they don't exist (with window as the root context)", function() {
        $["export"]('_$_export_test.foo.bar.baz', 'blargh');
        expect(window._$_export_test).toEqual({
          foo: {
            bar: {
              baz: 'blargh'
            }
          }
        });
        expect(window._$_export_test.foo).toEqual({
          bar: {
            baz: 'blargh'
          }
        });
        return expect(window._$_export_test.foo.bar).toEqual({
          baz: 'blargh'
        });
      });
      it("doesn't create objects in the chain that already exist", function() {
        var bar, foo, root;
        bar = {};
        foo = {
          bar: bar
        };
        root = {
          foo: foo
        };
        window._$_export_test = root;
        $["export"]('_$_export_test.foo.bar.baz', 'blargh');
        expect(window._$_export_test).toBe(root);
        expect(window._$_export_test.foo).toBe(foo);
        expect(window._$_export_test.foo.bar).toBe(bar);
        return expect(window._$_export_test.foo.bar.baz).toBe('blargh');
      });
      it("adds the given object to the end of the chain", function() {
        $["export"]('_$_export_test.foo.bar.baz', 'blargh');
        return expect(window._$_export_test.foo.bar.baz).toEqual('blargh');
      });
      it("also accepts a function as the second argument which must return the object to store", function() {
        $["export"]('_$_export_test.foo.bar.baz', function() {
          return 'blargh';
        });
        return expect(window._$_export_test.foo.bar.baz).toEqual('blargh');
      });
      return it("passes the items in the current chain to the function before adding the new object", function() {
        var foo, newObj, root;
        foo = {};
        root = {
          foo: foo
        };
        window._$_export_test = root;
        $["export"]('_$_export_test.foo.bar', function(root, foo) {
          return [root, foo];
        });
        newObj = window._$_export_test.foo.bar;
        expect(newObj[0]).toBe(root);
        return expect(newObj[1]).toBe(foo);
      });
    });
    return describe('$.tap', function() {
      return it("calls the given function with the given object and then returns the object", function() {
        var obj;
        obj = $.tap({
          foo: "bar"
        }, function(obj) {
          return obj.baz = "quux";
        });
        return expect(obj).toEqual({
          foo: "bar",
          baz: "quux"
        });
      });
    });
  });
  describe('ender instance methods', function() {
    describe('$::center', function() {
      return it("sets the top and left coordinates of the element so it is in the center of the window", function() {
        var $div;
        window.innerHeight = 200;
        window.innerWidth = 200;
        $div = $('<div/>').css({
          width: 50,
          height: 50
        });
        $div.center();
        expect($div.css('top')).toEqual('75px');
        return expect($div.css('left')).toEqual('75px');
      });
    });
    describe('$::position', function() {
      describe('for a child element of a global element', function() {
        it("is (0, 0) by default", function() {
          var $div1, $div2;
          $div1 = $('<div/>').appendTo('#sandbox');
          $div2 = $('<div/>').appendTo($div1);
          return expect($div2.position()).toEqual({
            top: 0,
            left: 0
          });
        });
        it("returns the coordinates that represent the offset from the parent element, not the document", function() {
          var $div1, $div2;
          $div1 = $('<div/>').appendTo('#sandbox').css({
            padding: '20px'
          });
          $div2 = $('<div/>').appendTo($div1);
          return expect($div2.position()).toEqual({
            top: 20,
            left: 20
          });
        });
        it("also works with margin", function() {
          var $div1, $div2;
          $div1 = $('<div/>').appendTo('#sandbox').css({
            overflow: 'auto'
          });
          $div2 = $('<div/>').appendTo($div1).css({
            margin: '20px'
          });
          return expect($div2.position()).toEqual({
            top: 20,
            left: 20
          });
        });
        return it("returns the same information as offset() if the element is absolutely positioned via top: and left:", function() {
          var $div1, $div2;
          $div1 = $('<div/>').css({
            position: 'absolute',
            top: '200px',
            left: '200px'
          }).appendTo('#sandbox');
          $div2 = $('<div/>').css({
            position: 'absolute',
            top: '50px',
            left: '50px'
          }).appendTo($div1);
          return expect($div2.position()).toEqual({
            top: 50,
            left: 50
          });
        });
      });
      describe('for a global element', function() {
        var $div;
        $div = null;
        beforeEach(function() {
          $div = $('<div/>');
          return $(document.body).css({
            margin: "inherit",
            padding: "inherit"
          }).append($div);
        });
        afterEach(function() {
          return $div.remove();
        });
        it("is (0, 0) by default", function() {
          $(document.body).css({
            margin: 0,
            padding: 0
          });
          return expect($div.position()).toEqual({
            top: 0,
            left: 0
          });
        });
        it("returns the coordinates that represent the offset from the document", function() {
          $(document.body).css({
            padding: '20px'
          });
          return expect($div.position()).toEqual({
            top: 20,
            left: 20
          });
        });
        it("also works with margin", function() {
          $div.css({
            margin: '20px'
          });
          return expect($div.position()).toEqual({
            top: 20,
            left: 20
          });
        });
        return it("returns the same information as offset() if the element is absolutely positioned via top: and left:", function() {
          $div.css({
            position: 'absolute',
            top: '50px',
            left: '50px'
          });
          return expect($div.position()).toEqual({
            top: 50,
            left: 50
          });
        });
      });
      return describe('for the body', function() {
        beforeEach(function() {
          return $(document.body).css({
            margin: "inherit",
            padding: "inherit"
          });
        });
        it("is (0, 0)", function() {
          return expect($(document.body).position()).toEqual({
            top: 0,
            left: 0
          });
        });
        return it("is (0, 0) even with margin", function() {
          var $body;
          $body = $(document.body).css({
            margin: '20px'
          });
          return expect($body.position()).toEqual({
            top: 0,
            left: 0
          });
        });
      });
    });
    describe('$::parent', function() {
      it("returns the parentNode wrapped in an Ender chain if the element has a parentNode", function() {
        expect($('#sandbox').parent()[0]).toEqual(document.body);
        return expect($(document.body).parent()[0]).toEqual(document.documentElement);
      });
      return it("returns nothing if the element doesn't have a parentNode", function() {
        return expect($(document.documentElement).parent[0]).toBeUndefined();
      });
    });
    return describe('$::computedStyle', function() {
      it("returns the computedStyle object of the first element", function() {
        return expect($('#sandbox').computedStyle()).toBeAnInstanceOf(CSSStyleDeclaration);
      });
      return it("returns value of the given style property", function() {
        var $sandbox;
        $sandbox = $('#sandbox').html("<p>This is a sentence</p><p>And this is another</p>");
        return expect($sandbox.computedStyle('height')).toEqual('52px');
      });
    });
  });
}).call(this);
