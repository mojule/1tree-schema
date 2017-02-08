'use strict';

var treeTypePlugin = function treeTypePlugin(fn) {
  var treeType = function treeType() {
    return 'schema';
  };

  treeType.def = {
    argType: [],
    returnType: 'string',
    requires: [],
    categories: ['meta', 'plugin']
  };

  return Object.assign(fn, { treeType: treeType });
};

module.exports = treeTypePlugin;