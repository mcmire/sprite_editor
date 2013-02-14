(function() {
  var Cell, Color;

  Cell = SpriteEditor.Cell;

  Color = SpriteEditor.Color;

  describe('Cell', function() {
    describe('.new', function() {
      describe('with three arguments', function() {
        var cell;
        cell = null;
        beforeEach(function() {
          return cell = new Cell("canvases", 2, 5);
        });
        it("accepts the SpriteEditor.App object", function() {
          return expect(cell.canvases).toEqual("canvases");
        });
        it("accepts coordinates which are dumped into a CellLocation", function() {
          return expect(cell.loc).toContainObject({
            i: 2,
            j: 5
          });
        });
        return it("initializes the color attribute", function() {
          expect(cell.color).toBeAnInstanceOf(Color);
          return expect(cell.color.isClear()).toBeTruthy();
        });
      });
      return describe('with a single argument, an existing Cell object', function() {
        var cell, existingCell;
        existingCell = cell = null;
        beforeEach(function() {
          existingCell = new Cell("canvases", 2, 5);
          existingCell.color = new Color({
            red: 255,
            green: 128,
            blue: 0
          });
          return cell = new Cell(existingCell);
        });
        it("uses its canvases property", function() {
          return expect(cell.canvases).toEqual("canvases");
        });
        it("clones the loc property", function() {
          expect(cell.loc).not.toBe(existingCell.loc);
          expect(cell.loc.i).toEqual(2);
          return expect(cell.loc.j).toEqual(5);
        });
        return it("clones the color property", function() {
          expect(cell.color).not.toBe(existingCell.color);
          expect(cell.color.red).toEqual(255);
          expect(cell.color.green).toEqual(128);
          return expect(cell.color.blue).toEqual(0);
        });
      });
    });
    describe('#isClear', function() {
      var cell;
      cell = null;
      beforeEach(function() {
        return cell = new Cell("canvases", 2, 5);
      });
      it("returns true if the cell is clear", function() {
        cell.clear();
        return expect(cell.isClear()).toBeTruthy();
      });
      return it("returns false if the cell is not clear", function() {
        cell.color = new Color({
          red: 255,
          green: 0,
          blue: 0
        });
        return expect(cell.isClear()).toBeFalsy();
      });
    });
    describe('#clear', function() {
      var cell;
      cell = null;
      beforeEach(function() {
        cell = new Cell("canvases", 2, 5);
        return cell.color = new Color({
          red: 255,
          green: 128,
          blue: 0
        });
      });
      it("resets the color property to a clear color", function() {
        cell.clear();
        return expect(cell.color.isClear()).toBeTruthy();
      });
      return it("returns the Cell object", function() {
        return expect(cell.clear()).toBe(cell);
      });
    });
    describe('#asClear', function() {
      var cell;
      cell = null;
      beforeEach(function() {
        cell = new Cell("canvases", 2, 5);
        return cell.color = new Color({
          red: 255,
          green: 128,
          blue: 0
        });
      });
      it("makes a clone of the current Cell with its color property reset", function() {
        var cell2;
        cell2 = cell.asClear();
        return expect(cell2.color.isClear()).toBeTruthy();
      });
      return it("returns the clone", function() {
        var cell2;
        cell2 = cell.asClear();
        return expect(cell2).not.toBe(cell);
      });
    });
    describe('#withColor', function() {
      var cell, color;
      cell = color = null;
      beforeEach(function() {
        cell = new Cell("canvases", 2, 5);
        return color = new Color({
          red: 255,
          green: 128,
          blue: 0
        });
      });
      it("makes a clone of the current Cell with its color property set to a copy of the given Color", function() {
        var cell2;
        cell2 = cell.withColor(color);
        expect(cell2.color).toContainObject(color);
        return expect(cell2.color).not.toBe(color);
      });
      return it("returns the clone", function() {
        var cell2;
        cell2 = cell.withColor(color);
        return expect(cell2).not.toBe(cell);
      });
    });
    describe('#coords', function() {
      return it("returns a string representation of the cell coordinates", function() {
        var cell;
        cell = new Cell("canvases", 2, 5);
        return expect(cell.coords()).toEqual("2,5");
      });
    });
    describe('#clone', function() {
      var cell;
      cell = null;
      beforeEach(function() {
        cell = new Cell("canvases", 2, 5);
        return cell.color = new Color({
          red: 255,
          green: 128,
          blue: 0
        });
      });
      it("returns a clone of this Cell", function() {
        var cell2;
        cell2 = cell.clone();
        return expect(cell.clone()).not.toBe(cell2);
      });
      it("also clones the CellLocation", function() {
        var cell2;
        cell2 = cell.clone();
        return expect(cell2.loc).not.toBe(cell.loc);
      });
      return it("also clones the Color", function() {
        var cell2;
        cell2 = cell.clone();
        return expect(cell2.color).not.toBe(cell.color);
      });
    });
    return describe('#inspect', function() {
      return it("returns a debug-friendly representation of the Cell", function() {
        var cell;
        cell = new Cell("canvases", 2, 5);
        cell.color = new Color({
          red: 255,
          green: 128,
          blue: 0
        });
        return expect(cell.inspect()).toEqual('{loc: (2, 5), color: {rgba: rgba(255, 128, 0, 1), hsla: hsla(30, 100, 50, 1)}}');
      });
    });
  });

}).call(this);
