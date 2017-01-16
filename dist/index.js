'use strict';

var toTree = require('./toTree');
var toJson = require('./toJson');
var paths = require('./paths');

var pathFromNode = paths.pathFromNode,
    nodeFromPath = paths.nodeFromPath;


module.exports = { toTree: toTree, toJson: toJson, pathFromNode: pathFromNode, nodeFromPath: nodeFromPath };