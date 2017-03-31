'use strict';

var slugPlugin = function slugPlugin(node) {
  var _slug = node.slug;


  return {
    slug: function slug() {
      if (node === node.getRoot()) return _slug();

      var parent = node.getParent();
      var nodeType = parent.nodeType();

      if (nodeType === 'object') {
        return node.getValue('propertyName');
      }

      return _slug();
    }
  };
};

module.exports = slugPlugin;