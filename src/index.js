'use strict'

const toTree = require( './toTree' )
const toJson = require( './toJson' )
const paths = require( './paths' )

const { pathFromNode, nodeFromPath } = paths

module.exports = { toTree, toJson, pathFromNode, nodeFromPath }
