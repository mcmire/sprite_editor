CellLocation = SpriteEditor.CellLocation

describe "CellLocation", ->
  app = {cellSize: 10}

  $.v.each ['plus', 'add'], (meth) ->
    describe ".#{meth}", ->
      it "assumes that both arguments are CellLocations and returns a new CellLocation from adding them together", ->
        loc1 = new CellLocation(app, 8, 7)
        loc2 = new CellLocation(app, 3, 1)
        loc3 = CellLocation[meth](loc1, loc2)
        expect(loc3).toBeAnInstanceOf(CellLocation)
        expect(loc3.i).toEqual(11)
        expect(loc3.j).toEqual(8)
        expect(loc3.x).toEqual(80)
        expect(loc3.y).toEqual(110)
  $.v.each ['minus', 'subtract'], (meth) ->
    describe ".#{meth}", ->
      it "assumes that both arguments are CellLocations and returns a new CellLocation from subtracting them", ->
        loc1 = new CellLocation(app, 8, 7)
        loc2 = new CellLocation(app, 3, 1)
        loc3 = CellLocation[meth](loc1, loc2)
        expect(loc3).toBeAnInstanceOf(CellLocation)
        expect(loc3.i).toEqual(5)
        expect(loc3.j).toEqual(6)
        expect(loc3.x).toEqual(60)
        expect(loc3.y).toEqual(50)

  describe '.new', ->
    describe 'given three arguments', ->
      it "accepts an app instance and the coordinates within the cells array", ->
        loc = new CellLocation(app, 8, 7)
        expect(loc.app).toBe(app)
        expect(loc.i).toEqual(8)
        expect(loc.j).toEqual(7)
      it "converts i to y and j to x based on the app's cell size", ->
        loc = new CellLocation(app, 8, 7)
        expect(loc.x).toEqual(70)
        expect(loc.y).toEqual(80)
    describe 'given a single object', ->
      describe 'given a full object', ->
        it "simply copies the properties over from an existing CellLocation object", ->
          loc = new CellLocation(app, 8, 7)
          loc2 = new CellLocation(loc)
          expect(loc2.app).toBe(app)
          expect(loc2.i).toEqual(8)
          expect(loc2.j).toEqual(7)
        it "simply copies the properties over from a plain object", ->
          loc = new CellLocation(app: app, i: 8, j: 7, x: 10, y: 20)
          expect(loc.i).toEqual(8)
          expect(loc.j).toEqual(7)
          expect(loc.x).toEqual(10)
          expect(loc.y).toEqual(20)
      describe 'given a partial object', ->
        it "uses the app's cell size to calculate x from j and y from i", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          expect(loc.x).toEqual(70)
          expect(loc.y).toEqual(80)
        it "uses the app's cell size to calculate j from x and i from y", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          expect(loc.j).toEqual(7)
          expect(loc.i).toEqual(8)
        it "bails if the coordinates are mixed", ->
          expect(-> new CellLocation(app: app, x: 70, j: 7))
            .toThrow("CellLocation accepts an object containing either i and j or x and y, but not a mixture!")
          expect(-> new CellLocation(app: app, y: 80, i: 8))
            .toThrow("CellLocation accepts an object containing either i and j or x and y, but not a mixture!")
        it "bails if no coordinates are given", ->
          expect(-> new CellLocation(app: app))
            .toThrow("An object passed to CellLocation must contain i and j and/or x and y!")

  describe '#add', ->
    describe 'given an existing CellLocation object', ->
      it "adds all the coordinates within to the current object", ->
        loc = new CellLocation(app: app, i: 8, j: 7)
        loc2 = new CellLocation(app: app, i: 3, j: 1)
        loc.add(loc2)
        expect(loc.i).toEqual(11)
        expect(loc.j).toEqual(8)
        expect(loc.x).toEqual(80)
        expect(loc.y).toEqual(110)
    describe 'given a plain object', ->
      describe 'given i and j coordinates', ->
        it "adds the given coordinates to the current object", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          loc.add(i: 3, j: 1)
          expect(loc.i).toEqual(11)
          expect(loc.j).toEqual(8)
        it "converts i to y and j to x based on the app's cell size", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          loc.add(i: 3, j: 1)
          expect(loc.x).toEqual(80)
          expect(loc.y).toEqual(110)
      describe 'given x and y coordinates', ->
        it "adds the given coordinates to the current object", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          loc.add(x: 10, y: 30)
          expect(loc.x).toEqual(80)
          expect(loc.y).toEqual(110)
        it "converts x to j and y to i based on the app's cell size", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          loc.add(x: 10, y: 30)
          expect(loc.i).toEqual(11)
          expect(loc.j).toEqual(8)
      it "allows mixed coordinates", ->
        loc = new CellLocation(app: app, x: 70, y: 80)
        loc.add(i: 3, x: 10)
        expect(loc.i).toEqual(11)
        expect(loc.j).toEqual(8)
        expect(loc.x).toEqual(80)
        expect(loc.y).toEqual(110)

        loc = new CellLocation(app: app, x: 70, y: 80)
        loc.add(j: 3, y: 10)
        expect(loc.i).toEqual(9)
        expect(loc.j).toEqual(10)
        expect(loc.x).toEqual(100)
        expect(loc.y).toEqual(90)

  describe '#plus', ->
    describe 'given an existing CellLocation object', ->
      it "returns a clone of the current object with all the coordinates in the given object added to it", ->
        loc = new CellLocation(app: app, i: 8, j: 7)
        loc2 = new CellLocation(app: app, i: 3, j: 1)
        loc3 = loc.plus(loc2)
        expect(loc3.i).toEqual(11)
        expect(loc3.j).toEqual(8)
        expect(loc3.x).toEqual(80)
        expect(loc3.y).toEqual(110)
    describe 'given a plain object', ->
      describe 'given i and j coordinates', ->
        it "makes a clone and adds the coordinates to it", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          loc2 = loc.add(i: 3, j: 1)
          expect(loc2.i).toEqual(11)
          expect(loc2.j).toEqual(8)
        it "converts i to y and j to x based on the app's cell size", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          loc2 = loc.add(i: 3, j: 1)
          expect(loc2.x).toEqual(80)
          expect(loc2.y).toEqual(110)
      describe 'given x and y coordinates', ->
        it "makes a clone and adds the given coordinates to it", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          loc2 = loc.add(x: 10, y: 30)
          expect(loc2.x).toEqual(80)
          expect(loc2.y).toEqual(110)
        it "converts x to j and y to i based on the app's cell size", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          loc2 = loc.add(x: 10, y: 30)
          expect(loc2.i).toEqual(11)
          expect(loc2.j).toEqual(8)
      it "allows mixed coordinates", ->
        loc = new CellLocation(app: app, x: 70, y: 80)
        loc2 = loc.add(i: 3, x: 10)
        expect(loc2.i).toEqual(11)
        expect(loc2.j).toEqual(8)
        expect(loc2.x).toEqual(80)
        expect(loc2.y).toEqual(110)

        loc = new CellLocation(app: app, x: 70, y: 80)
        loc2 = loc.add(j: 3, y: 10)
        expect(loc2.i).toEqual(9)
        expect(loc2.j).toEqual(10)
        expect(loc2.x).toEqual(100)
        expect(loc2.y).toEqual(90)

  describe '#subtract', ->
    describe 'given an existing CellLocation object', ->
      it "subtracts all the coordinates within from the current object", ->
        loc = new CellLocation(app: app, i: 8, j: 7)
        loc2 = new CellLocation(app: app, i: 3, j: 1)
        loc.subtract(loc2)
        expect(loc.i).toEqual(5)
        expect(loc.j).toEqual(6)
        expect(loc.x).toEqual(60)
        expect(loc.y).toEqual(50)
    describe 'given a plain object', ->
      describe 'given i and j coordinates', ->
        it "subtracts the given coordinates from the current object", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          loc.subtract(i: 3, j: 1)
          expect(loc.i).toEqual(5)
          expect(loc.j).toEqual(6)
        it "converts i to y and j to x based on the app's cell size", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          loc.subtract(i: 3, j: 1)
          expect(loc.x).toEqual(60)
          expect(loc.y).toEqual(50)
      describe 'given x and y coordinates', ->
        it "subtracts the given coordinates from the current object", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          loc.subtract(x: 10, y: 30)
          expect(loc.x).toEqual(60)
          expect(loc.y).toEqual(50)
        it "converts x to j and y to i based on the app's cell size", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          loc.subtract(x: 10, y: 30)
          expect(loc.i).toEqual(5)
          expect(loc.j).toEqual(6)
      it "allows mixed coordinates", ->
        loc = new CellLocation(app: app, x: 70, y: 80)
        loc.subtract(i: 3, x: 10)
        expect(loc.i).toEqual(5)
        expect(loc.j).toEqual(6)
        expect(loc.x).toEqual(60)
        expect(loc.y).toEqual(50)

        loc = new CellLocation(app: app, x: 70, y: 80)
        loc.subtract(j: 3, y: 10)
        expect(loc.i).toEqual(7)
        expect(loc.j).toEqual(4)
        expect(loc.x).toEqual(40)
        expect(loc.y).toEqual(70)

  describe '#minus', ->
    describe 'given an existing CellLocation object', ->
      it "returns a clone of the current object with all the coordinates in the given object subtracted from it", ->
        loc = new CellLocation(app: app, i: 8, j: 7)
        loc2 = new CellLocation(app: app, i: 3, j: 1)
        loc3 = loc.subtract(loc2)
        expect(loc3.i).toEqual(5)
        expect(loc3.j).toEqual(6)
        expect(loc3.x).toEqual(60)
        expect(loc3.y).toEqual(50)
    describe 'given a plain object', ->
      describe 'given i and j coordinates', ->
        it "makes a clone and subtracts the coordinates from it", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          loc2 = loc.subtract(i: 3, j: 1)
          expect(loc2.i).toEqual(5)
          expect(loc2.j).toEqual(6)
        it "converts i to y and j to x based on the app's cell size", ->
          loc = new CellLocation(app: app, i: 8, j: 7)
          loc2 = loc.subtract(i: 3, j: 1)
          expect(loc2.x).toEqual(60)
          expect(loc2.y).toEqual(50)
      describe 'given x and y coordinates', ->
        it "makes a clone and subtracts the coordinates from it", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          loc2 = loc.subtract(x: 10, y: 30)
          expect(loc2.x).toEqual(60)
          expect(loc2.y).toEqual(50)
        it "converts x to j and y to i based on the app's cell size", ->
          loc = new CellLocation(app: app, x: 70, y: 80)
          loc2 = loc.subtract(x: 10, y: 30)
          expect(loc2.i).toEqual(5)
          expect(loc2.j).toEqual(6)
      it "allows mixed coordinates", ->
        loc = new CellLocation(app: app, x: 70, y: 80)
        loc2 = loc.subtract(i: 3, x: 10)
        expect(loc2.i).toEqual(5)
        expect(loc2.j).toEqual(6)
        expect(loc2.x).toEqual(60)
        expect(loc2.y).toEqual(50)

        loc = new CellLocation(app: app, x: 70, y: 80)
        loc2 = loc.subtract(j: 3, y: 10)
        expect(loc2.i).toEqual(7)
        expect(loc2.j).toEqual(4)
        expect(loc2.x).toEqual(40)
        expect(loc2.y).toEqual(70)

  describe '#gt', ->
    it "returns true if this.i > other.i", ->
      loc = new CellLocation(app: app, i: 20, j: 10)
      loc2 = new CellLocation(app: app, i: 10, j: 10)
      expect(loc.gt(loc2)).toBeTruthy()
    it "returns true if this.j > other.j", ->
      loc = new CellLocation(app: app, i: 10, j: 20)
      loc2 = new CellLocation(app: app, i: 10, j: 10)
      expect(loc.gt(loc2)).toBeTruthy()
    it "returns false if this.i == other.i and this.j == other.j", ->
      loc = new CellLocation(app: app, i: 10, j: 10)
      loc2 = new CellLocation(app: app, i: 10, j: 10)
      expect(loc.gt(loc2)).toBeFalsy()
    it "returns false if this.i < other.i", ->
      loc = new CellLocation(app: app, i: 5, j: 10)
      loc2 = new CellLocation(app: app, i: 10, j: 10)
      expect(loc.gt(loc2)).toBeFalsy()
    it "returns false if this.j < other.j", ->
      loc = new CellLocation(app: app, i: 10, j: 5)
      loc2 = new CellLocation(app: app, i: 10, j: 10)
      expect(loc.gt(loc2)).toBeFalsy()

  describe '#clone', ->
    it "copies the coordinates of the current CellLocation to a new one", ->
      loc = new CellLocation(app: app, i: 20, j: 10)
      loc2 = loc.clone()
      expect(loc).not.toBe(loc2)
      expect(loc2.i).toEqual(loc.i)
      expect(loc2.j).toEqual(loc.j)
      expect(loc2.x).toEqual(loc.x)
      expect(loc2.y).toEqual(loc.y)

  describe '#toJSON', ->
    it "returns a JSON-friendly version of the CellLocation", ->
      loc = new CellLocation(app: app, i: 20, j: 10)
      expect(loc.toJSON()).toEqual('{"x":100,"y":200,"i":20,"j":10}')

  describe '#inspect', ->
    it "returns a debug-friendly version of the CellLocation", ->
      loc = new CellLocation(app: app, i: 20, j: 10)
      expect(loc.inspect()).toEqual("(20, 10)")