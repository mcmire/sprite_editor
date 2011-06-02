(function(window, document, $, undefined) {

/*!
 * CellHistory is responsible for storing the version history of cells in
 * the working canvas, and for providing the undo/redo functionality by
 * reversing and restoring different versions of the canvas.
 *
 * The different versions of the canvas in time are kept in an array, where
 * each element in the array corresponds to a cell on the canvas. When a cell
 * is changed, an object is created that contains a copy of the cell before it
 * was changed ("old") and after it was changed ("new").
 *
 * In order to undo and redo history, it's helpful to keep track of where in
 * the "timeline" (which index of the versions array) the current state of the
 * pixel editor points to. Undoing history is a matter of looking at the
 * current version in the history array, applying the "old" copies of the
 * changed cells therein, and moving back the pointer. Redoing history is then
 * achieved by looking at the next version after the pointer, applying the
 * "new" copies of the changed cells therein, and moving forward the pointer.
 * (Technically, for slightly cleaner code, the pointer points to the next
 * version after the current one, but the idea is the same.)
 */
var CellHistory = {
  fixedSize: 100, // # of actions

  versions: [],
  workingVersion: {},
  numWorkingCells: 0,
  nextIndex: 0,

  init: function(canvases) {
    var self = this;
    self.canvases = canvases;
    return self;
  },
  open: function() {
    var self = this;
    self.workingVersion = {};
    self.numWorkingCells = 0;
  },
  close: function() {
    var self = this;
    if (self.numWorkingCells > 0) {
      // Limit history to a fixed size
      if (self.versions.length == self.fixedSize) self.versions.shift();
      // If the user just performed an undo, all future history which was
      // saved is now gone - POOF!
      self.versions.length = self.nextIndex;
      self.versions[self.nextIndex] = self.workingVersion;
      self.nextIndex++;
    }
    self.workingVersion = {};
    self.numWorkingCells = 0;
  },
  save: function(callback) {
    var self = this;
    self.open();
    callback();
    self.close();
  },
  add: function(cell, callback) {
    var self = this;
    if (cell.loc.toJSON() in self.workingVersion) return;
    var change = {};
    change['old'] = cell.clone();
    callback();
    change['new'] = cell.clone();
    self.workingVersion[cell.loc.toJSON()] = change;
    self.numWorkingCells++;
  },
  undo: function() {
    var self = this;

    var version = self.versions[self.nextIndex-1];
    $.v.each(version, function(key, change) {
      var loc = JSON.parse(key);
      self.canvases.cells[loc.i][loc.j] = change['old'].clone();
    })
    self.canvases.draw();

    self.nextIndex--;
  },
  canUndo: function() {
    var self = this;
    return (self.nextIndex >= 1);
  },
  redo: function() {
    var self = this;

    var version = self.versions[self.nextIndex];
    $.v.each(version, function(key, change) {
      var loc = JSON.parse(key);
      self.canvases.cells[loc.i][loc.j] = change['new'].clone();
    })
    self.canvases.draw();

    self.nextIndex++;
  },
  canRedo: function() {
    var self = this;
    return (self.nextIndex <= self.versions.length-1);
  },
};
$.export('SpriteEditor.CellHistory', CellHistory);

})(window, window.document, window.ender);