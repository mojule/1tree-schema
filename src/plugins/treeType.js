'use strict'

const treeTypePlugin = fn => {
  const treeType = () => 'schema'

  treeType.def = {
    argType: [],
    returnType: 'string',
    requires: [],
    categories: [ 'meta', 'plugin' ]
  }

  return Object.assign( fn, { treeType } )
}

module.exports = treeTypePlugin
