'use strict';

var slugFromNode = function slugFromNode(node) {
  var parent = node.getParent();

  if (!parent) return '$';

  var value = node.value();

  if (typeof value.propertyName === 'string') return value.propertyName;

  if (typeof value.arrayIndex === 'number') return value.arrayIndex + '';
};

var pathFromNode = function pathFromNode(node) {
  var parentWithSlug = node.closest(function (n) {
    return !!slugFromNode(n) && n.get() !== node.get();
  });

  if (!parentWithSlug) return '$';

  var nodePath = pathFromNode(parentWithSlug);
  var slug = slugFromNode(node);

  if (slug) nodePath += '/' + slug;

  return nodePath;
};

// this is easy but inefficent, it's very simple to use the path segments to
// traverse the tree, replace!
var nodeFromPath = function nodeFromPath(schemaTree, path) {
  return schemaTree.find(function (node) {
    return path === pathFromNode(node);
  });
};

module.exports = { pathFromNode: pathFromNode, nodeFromPath: nodeFromPath };