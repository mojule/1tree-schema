'use strict'

const is = require( '@mojule/is' )

const nodeTypeModule = node => {
  return {
    nodeType: () => node.getValue( 'type' )
  }
}

module.exports = nodeTypeModule
