(function() {
  var CellLocation;

  CellLocation = SpriteEditor.CellLocation;

  describe("CellLocation", function() {
    var canvases;
    canvases = {
      cellSize: 10
    };
    $.v.each(['plus', 'add'], function(meth) {
      return describe("." + meth, function() {
        return it("assumes that both arguments are CellLocations and returns a new CellLocation from adding them together", function() {
          var loc1, loc2, loc3;
          loc1 = new CellLocation(canvases, 8, 7);
          loc2 = new CellLocation(canvases, 3, 1);
          loc3 = CellLocation[meth](loc1, loc2);
          expect(loc3).toBeAnInstanceOf(CellLocation);
          expect(loc3.i).toEqual(11);
          expect(loc3.j).toEqual(8);
          expect(loc3.x).toEqual(80);
          return expect(loc3.y).toEqual(110);
        });
      });
    });
    $.v.each(['minus', 'subtract'], function(meth) {
      return describe("." + meth, function() {
        return it("assumes that both arguments are CellLocations and returns a new CellLocation from subtracting them", function() {
          var loc1, loc2, loc3;
          loc1 = new CellLocation(canvases, 8, 7);
          loc2 = new CellLocation(canvases, 3, 1);
          loc3 = CellLocation[meth](loc1, loc2);
          expect(loc3).toBeAnInstanceOf(CellLocation);
          expect(loc3.i).toEqual(5);
          expect(loc3.j).toEqual(6);
          expect(loc3.x).toEqual(60);
          return expect(loc3.y).toEqual(50);
        });
      });
    });
    describe('.new', function() {
      describe('given three arguments', function() {
        it("accepts an canvases instance and the coordinates within the cells array", function() {
          var loc;
          loc = new CellLocation(canvases, 8, 7);
          expect(loc.canvases).toBe(canvases);
          expect(loc.i).toEqual(8);
          return expect(loc.j).toEqual(7);
        });
        return it("converts i to y and j to x based on the canvases's cell size", function() {
          var loc;
          loc = new CellLocation(canvases, 8, 7);
          expect(loc.x).toEqual(70);
          return expect(loc.y).toEqual(80);
        });
      });
      return describe('given a single object', function() {
        describe('given a full object', function() {
          it("simply copies the properties over from an existing CellLocation object", function() {
            var loc, loc2;
            loc = new CellLocation(canvases, 8, 7);
            loc2 = new CellLocation(loc);
            expect(loc2.canvases).toBe(canvases);
            expect(loc2.i).toEqual(8);
            return expect(loc2.j).toEqual(7);
          });
          return it("simply copies the properties over from a plain object", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7,
              x: 10,
              y: 20
            });
            expect(loc.i).toEqual(8);
            expect(loc.j).toEqual(7);
            expect(loc.x).toEqual(10);
            return expect(loc.y).toEqual(20);
          });
        });
        return describe('given a partial object', function() {
          it("uses the canvases's cell size to calculate x from j and y from i", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            expect(loc.x).toEqual(70);
            return expect(loc.y).toEqual(80);
          });
          it("uses the canvases's cell size to calculate j from x and i from y", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            expect(loc.j).toEqual(7);
            return expect(loc.i).toEqual(8);
          });
          it("bails if the coordinates are mixed", function() {
            expect(function() {
              return new CellLocation({
                canvases: canvases,
                x: 70,
                j: 7
              });
            }).toThrow("CellLocation accepts an object containing either i and j or x and y, but not a mixture!");
            return expect(function() {
              return new CellLocation({
                canvases: canvases,
                y: 80,
                i: 8
              });
            }).toThrow("CellLocation accepts an object containing either i and j or x and y, but not a mixture!");
          });
          return it("bails if no coordinates are given", function() {
            return expect(function() {
              return new CellLocation({
                canvases: canvases
              });
            }).toThrow("An object passed to CellLocation must contain i and j and/or x and y!");
          });
        });
      });
    });
    describe('#add', function() {
      describe('given an existing CellLocation object', function() {
        return it("adds all the coordinates within to the current object", function() {
          var loc, loc2;
          loc = new CellLocation({
            canvases: canvases,
            i: 8,
            j: 7
          });
          loc2 = new CellLocation({
            canvases: canvases,
            i: 3,
            j: 1
          });
          loc.add(loc2);
          expect(loc.i).toEqual(11);
          expect(loc.j).toEqual(8);
          expect(loc.x).toEqual(80);
          return expect(loc.y).toEqual(110);
        });
      });
      return describe('given a plain object', function() {
        describe('given i and j coordinates', function() {
          it("adds the given coordinates to the current object", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            loc.add({
              i: 3,
              j: 1
            });
            expect(loc.i).toEqual(11);
            return expect(loc.j).toEqual(8);
          });
          return it("converts i to y and j to x based on the canvases's cell size", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            loc.add({
              i: 3,
              j: 1
            });
            expect(loc.x).toEqual(80);
            return expect(loc.y).toEqual(110);
          });
        });
        describe('given x and y coordinates', function() {
          it("adds the given coordinates to the current object", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            loc.add({
              x: 10,
              y: 30
            });
            expect(loc.x).toEqual(80);
            return expect(loc.y).toEqual(110);
          });
          return it("converts x to j and y to i based on the canvases's cell size", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            loc.add({
              x: 10,
              y: 30
            });
            expect(loc.i).toEqual(11);
            return expect(loc.j).toEqual(8);
          });
        });
        return it("allows mixed coordinates", function() {
          var loc;
          loc = new CellLocation({
            canvases: canvases,
            x: 70,
            y: 80
          });
          loc.add({
            i: 3,
            x: 10
          });
          expect(loc.i).toEqual(11);
          expect(loc.j).toEqual(8);
          expect(loc.x).toEqual(80);
          expect(loc.y).toEqual(110);
          loc = new CellLocation({
            canvases: canvases,
            x: 70,
            y: 80
          });
          loc.add({
            j: 3,
            y: 10
          });
          expect(loc.i).toEqual(9);
          expect(loc.j).toEqual(10);
          expect(loc.x).toEqual(100);
          return expect(loc.y).toEqual(90);
        });
      });
    });
    describe('#plus', function() {
      describe('given an existing CellLocation object', function() {
        return it("returns a clone of the current object with all the coordinates in the given object added to it", function() {
          var loc, loc2, loc3;
          loc = new CellLocation({
            canvases: canvases,
            i: 8,
            j: 7
          });
          loc2 = new CellLocation({
            canvases: canvases,
            i: 3,
            j: 1
          });
          loc3 = loc.plus(loc2);
          expect(loc3.i).toEqual(11);
          expect(loc3.j).toEqual(8);
          expect(loc3.x).toEqual(80);
          return expect(loc3.y).toEqual(110);
        });
      });
      return describe('given a plain object', function() {
        describe('given i and j coordinates', function() {
          it("makes a clone and adds the coordinates to it", function() {
            var loc, loc2;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            loc2 = loc.add({
              i: 3,
              j: 1
            });
            expect(loc2.i).toEqual(11);
            return expect(loc2.j).toEqual(8);
          });
          return it("converts i to y and j to x based on the canvases's cell size", function() {
            var loc, loc2;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            loc2 = loc.add({
              i: 3,
              j: 1
            });
            expect(loc2.x).toEqual(80);
            return expect(loc2.y).toEqual(110);
          });
        });
        describe('given x and y coordinates', function() {
          it("makes a clone and adds the given coordinates to it", function() {
            var loc, loc2;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            loc2 = loc.add({
              x: 10,
              y: 30
            });
            expect(loc2.x).toEqual(80);
            return expect(loc2.y).toEqual(110);
          });
          return it("converts x to j and y to i based on the canvases's cell size", function() {
            var loc, loc2;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            loc2 = loc.add({
              x: 10,
              y: 30
            });
            expect(loc2.i).toEqual(11);
            return expect(loc2.j).toEqual(8);
          });
        });
        return it("allows mixed coordinates", function() {
          var loc, loc2;
          loc = new CellLocation({
            canvases: canvases,
            x: 70,
            y: 80
          });
          loc2 = loc.add({
            i: 3,
            x: 10
          });
          expect(loc2.i).toEqual(11);
          expect(loc2.j).toEqual(8);
          expect(loc2.x).toEqual(80);
          expect(loc2.y).toEqual(110);
          loc = new CellLocation({
            canvases: canvases,
            x: 70,
            y: 80
          });
          loc2 = loc.add({
            j: 3,
            y: 10
          });
          expect(loc2.i).toEqual(9);
          expect(loc2.j).toEqual(10);
          expect(loc2.x).toEqual(100);
          return expect(loc2.y).toEqual(90);
        });
      });
    });
    describe('#subtract', function() {
      describe('given an existing CellLocation object', function() {
        return it("subtracts all the coordinates within from the current object", function() {
          var loc, loc2;
          loc = new CellLocation({
            canvases: canvases,
            i: 8,
            j: 7
          });
          loc2 = new CellLocation({
            canvases: canvases,
            i: 3,
            j: 1
          });
          loc.subtract(loc2);
          expect(loc.i).toEqual(5);
          expect(loc.j).toEqual(6);
          expect(loc.x).toEqual(60);
          return expect(loc.y).toEqual(50);
        });
      });
      return describe('given a plain object', function() {
        describe('given i and j coordinates', function() {
          it("subtracts the given coordinates from the current object", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            loc.subtract({
              i: 3,
              j: 1
            });
            expect(loc.i).toEqual(5);
            return expect(loc.j).toEqual(6);
          });
          return it("converts i to y and j to x based on the canvases's cell size", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            loc.subtract({
              i: 3,
              j: 1
            });
            expect(loc.x).toEqual(60);
            return expect(loc.y).toEqual(50);
          });
        });
        describe('given x and y coordinates', function() {
          it("subtracts the given coordinates from the current object", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            loc.subtract({
              x: 10,
              y: 30
            });
            expect(loc.x).toEqual(60);
            return expect(loc.y).toEqual(50);
          });
          return it("converts x to j and y to i based on the canvases's cell size", function() {
            var loc;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            loc.subtract({
              x: 10,
              y: 30
            });
            expect(loc.i).toEqual(5);
            return expect(loc.j).toEqual(6);
          });
        });
        return it("allows mixed coordinates", function() {
          var loc;
          loc = new CellLocation({
            canvases: canvases,
            x: 70,
            y: 80
          });
          loc.subtract({
            i: 3,
            x: 10
          });
          expect(loc.i).toEqual(5);
          expect(loc.j).toEqual(6);
          expect(loc.x).toEqual(60);
          expect(loc.y).toEqual(50);
          loc = new CellLocation({
            canvases: canvases,
            x: 70,
            y: 80
          });
          loc.subtract({
            j: 3,
            y: 10
          });
          expect(loc.i).toEqual(7);
          expect(loc.j).toEqual(4);
          expect(loc.x).toEqual(40);
          return expect(loc.y).toEqual(70);
        });
      });
    });
    describe('#minus', function() {
      describe('given an existing CellLocation object', function() {
        return it("returns a clone of the current object with all the coordinates in the given object subtracted from it", function() {
          var loc, loc2, loc3;
          loc = new CellLocation({
            canvases: canvases,
            i: 8,
            j: 7
          });
          loc2 = new CellLocation({
            canvases: canvases,
            i: 3,
            j: 1
          });
          loc3 = loc.subtract(loc2);
          expect(loc3.i).toEqual(5);
          expect(loc3.j).toEqual(6);
          expect(loc3.x).toEqual(60);
          return expect(loc3.y).toEqual(50);
        });
      });
      return describe('given a plain object', function() {
        describe('given i and j coordinates', function() {
          it("makes a clone and subtracts the coordinates from it", function() {
            var loc, loc2;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            loc2 = loc.subtract({
              i: 3,
              j: 1
            });
            expect(loc2.i).toEqual(5);
            return expect(loc2.j).toEqual(6);
          });
          return it("converts i to y and j to x based on the canvases's cell size", function() {
            var loc, loc2;
            loc = new CellLocation({
              canvases: canvases,
              i: 8,
              j: 7
            });
            loc2 = loc.subtract({
              i: 3,
              j: 1
            });
            expect(loc2.x).toEqual(60);
            return expect(loc2.y).toEqual(50);
          });
        });
        describe('given x and y coordinates', function() {
          it("makes a clone and subtracts the coordinates from it", function() {
            var loc, loc2;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            loc2 = loc.subtract({
              x: 10,
              y: 30
            });
            expect(loc2.x).toEqual(60);
            return expect(loc2.y).toEqual(50);
          });
          return it("converts x to j and y to i based on the canvases's cell size", function() {
            var loc, loc2;
            loc = new CellLocation({
              canvases: canvases,
              x: 70,
              y: 80
            });
            loc2 = loc.subtract({
              x: 10,
              y: 30
            });
            expect(loc2.i).toEqual(5);
            return expect(loc2.j).toEqual(6);
          });
        });
        return it("allows mixed coordinates", function() {
          var loc, loc2;
          loc = new CellLocation({
            canvases: canvases,
            x: 70,
            y: 80
          });
          loc2 = loc.subtract({
            i: 3,
            x: 10
          });
          expect(loc2.i).toEqual(5);
          expect(loc2.j).toEqual(6);
          expect(loc2.x).toEqual(60);
          expect(loc2.y).toEqual(50);
          loc = new CellLocation({
            canvases: canvases,
            x: 70,
            y: 80
          });
          loc2 = loc.subtract({
            j: 3,
            y: 10
          });
          expect(loc2.i).toEqual(7);
          expect(loc2.j).toEqual(4);
          expect(loc2.x).toEqual(40);
          return expect(loc2.y).toEqual(70);
        });
      });
    });
    describe('#gt', function() {
      it("returns true if this.i > other.i", function() {
        var loc, loc2;
        loc = new CellLocation({
          canvases: canvases,
          i: 20,
          j: 10
        });
        loc2 = new CellLocation({
          canvases: canvases,
          i: 10,
          j: 10
        });
        return expect(loc.gt(loc2)).toBeTruthy();
      });
      it("returns true if this.j > other.j", function() {
        var loc, loc2;
        loc = new CellLocation({
          canvases: canvases,
          i: 10,
          j: 20
        });
        loc2 = new CellLocation({
          canvases: canvases,
          i: 10,
          j: 10
        });
        return expect(loc.gt(loc2)).toBeTruthy();
      });
      it("returns false if this.i == other.i and this.j == other.j", function() {
        var loc, loc2;
        loc = new CellLocation({
          canvases: canvases,
          i: 10,
          j: 10
        });
        loc2 = new CellLocation({
          canvases: canvases,
          i: 10,
          j: 10
        });
        return expect(loc.gt(loc2)).toBeFalsy();
      });
      it("returns false if this.i < other.i", function() {
        var loc, loc2;
        loc = new CellLocation({
          canvases: canvases,
          i: 5,
          j: 10
        });
        loc2 = new CellLocation({
          canvases: canvases,
          i: 10,
          j: 10
        });
        return expect(loc.gt(loc2)).toBeFalsy();
      });
      return it("returns false if this.j < other.j", function() {
        var loc, loc2;
        loc = new CellLocation({
          canvases: canvases,
          i: 10,
          j: 5
        });
        loc2 = new CellLocation({
          canvases: canvases,
          i: 10,
          j: 10
        });
        return expect(loc.gt(loc2)).toBeFalsy();
      });
    });
    describe('#clone', function() {
      return it("copies the coordinates of the current CellLocation to a new one", function() {
        var loc, loc2;
        loc = new CellLocation({
          canvases: canvases,
          i: 20,
          j: 10
        });
        loc2 = loc.clone();
        expect(loc).not.toBe(loc2);
        expect(loc2.i).toEqual(loc.i);
        expect(loc2.j).toEqual(loc.j);
        expect(loc2.x).toEqual(loc.x);
        return expect(loc2.y).toEqual(loc.y);
      });
    });
    describe('#toJSON', function() {
      return it("returns a JSON-friendly version of the CellLocation", function() {
        var loc;
        loc = new CellLocation({
          canvases: canvases,
          i: 20,
          j: 10
        });
        return expect(loc.toJSON()).toEqual('{"x":100,"y":200,"i":20,"j":10}');
      });
    });
    return describe('#inspect', function() {
      return it("returns a debug-friendly version of the CellLocation", function() {
        var loc;
        loc = new CellLocation({
          canvases: canvases,
          i: 20,
          j: 10
        });
        return expect(loc.inspect()).toEqual("(20, 10)");
      });
    });
  });

}).call(this);
