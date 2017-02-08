'use strict'

const isRawTree = obj =>
  obj !== null &&
  obj !== undefined &&
  typeof obj === 'object' &&
  typeof obj.value === 'object' &&
  Array.isArray( obj.children )

const createTreePlugin = fn => {
  const originalCreateTree = fn.createTree

  const createTree = ( rootValue, asRaw = false ) => {
    if( !asRaw && !isRawTree( rootValue ) )
      rootValue = fn.fromSchema( fn, rootValue )

    return originalCreateTree( rootValue )
  }

  createTree.def = originalCreateTree.def

  return Object.assign( fn, { createTree } )
}

module.exports = createTreePlugin
