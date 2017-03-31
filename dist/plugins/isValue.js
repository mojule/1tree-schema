'use strict';

var is = require('@mojule/is');

var isValuePlugin = function isValuePlugin(node) {
  var isValue = node.isValue;


  return {
    $isValue: function $isValue(value) {
      return isValue(value) && is.string(value.nodeType);
    }
  };
};

module.exports = isValuePlugin;