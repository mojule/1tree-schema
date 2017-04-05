'use strict';

var is = require('@mojule/is');

var nodeTypeModule = function nodeTypeModule(node) {
  return {
    nodeType: function nodeType() {
      return node.getValue('type');
    }
  };
};

module.exports = nodeTypeModule;