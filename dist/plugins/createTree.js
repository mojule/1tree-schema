'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isRawTree = function isRawTree(obj) {
  return obj !== null && obj !== undefined && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && _typeof(obj.value) === 'object' && Array.isArray(obj.children);
};

var createTreePlugin = function createTreePlugin(fn) {
  var originalCreateTree = fn.createTree;

  var createTree = function createTree(rootValue) {
    var asRaw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!asRaw && !isRawTree(rootValue)) rootValue = fn.fromSchema(fn, rootValue);

    return originalCreateTree(rootValue);
  };

  createTree.def = originalCreateTree.def;

  return Object.assign(fn, { createTree: createTree });
};

module.exports = createTreePlugin;