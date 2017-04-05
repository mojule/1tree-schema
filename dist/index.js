'use strict';

var is = require('@mojule/is');
var TreeFactory = require('@mojule/tree').Factory;
var defaultPlugins = require('./plugins');

var parseState = function parseState(Tree, value) {
  if (Tree.isValue(value) || Tree.isNode(value) || Tree.isState(value)) return;

  if (!is.undefined(value)) {
    var node = Tree.fromSchema(value);
    var rawNode = node.get();

    return { node: rawNode, parent: null, root: rawNode };
  }
};

var defaultStateParsers = [parseState];

var Factory = function Factory() {
  for (var _len = arguments.length, plugins = Array(_len), _key = 0; _key < _len; _key++) {
    plugins[_key] = arguments[_key];
  }

  var options = {};

  if (plugins.length > 0 && is.object(plugins[plugins.length - 1])) options = plugins.pop();

  if (plugins.length === 1 && is.array(plugins[0])) plugins = plugins[0];

  plugins = defaultPlugins.concat(plugins);

  if (is.array(options.stateParsers)) {
    options.stateParsers = options.stateParsers.concat(defaultStateParsers);
  } else {
    options.stateParsers = defaultStateParsers;
  }

  return TreeFactory(plugins, options);
};

var SchemaTree = Factory();

Object.assign(SchemaTree, { Factory: Factory });

module.exports = SchemaTree;