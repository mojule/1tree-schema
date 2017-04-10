'use strict';

var is = require('@mojule/is');

var createStatePlugin = function createStatePlugin(api) {
  var createState = api.createState;


  return {
    $createState: function $createState(value) {
      if (api.isValue(value) || api.isNode(value) || api.isState(value)) return createState(value);

      if (!is.undefined(value)) {
        var node = api.fromSchema(value);
        var rawNode = node.get();

        return { node: rawNode, parent: null, root: rawNode };
      }
    }
  };
};

module.exports = createStatePlugin;