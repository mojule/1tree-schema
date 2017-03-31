'use strict';

var is = require('@mojule/is');
var TreeFactory = require('@mojule/tree').Factory;
var plugins = require('./plugins');

var Tree = TreeFactory(plugins);

var SchemaTree = function SchemaTree(value) {
  if (is.undefined(value)) throw new Error('SchemaTree requires a raw node, value, or valid JSON object');

  if (Tree.isValue(value) || Tree.isNode(value)) return Tree(value);

  return Tree.fromSchema(value);
};

Object.assign(SchemaTree, Tree);

module.exports = SchemaTree;