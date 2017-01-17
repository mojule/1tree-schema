'use strict'

const slugFromNode = node => {
  const parent = node.getParent()

  if( !parent )
    return '$'

  const value = node.value()

  if( typeof value.propertyName === 'string' )
    return value.propertyName

  if( typeof value.arrayIndex === 'number' )
    return value.arrayIndex + ''
}

const pathFromNode = node => {
  const parentWithSlug = node.closest( n => !!slugFromNode( n ) && n.get() !== node.get() )

  if( !parentWithSlug )
    return '$'

  let nodePath = pathFromNode( parentWithSlug )
  const slug = slugFromNode( node )

  if( slug )
    nodePath += '/' + slug

  return nodePath
}

// this is easy but inefficent, it's very simple to use the path segments to
// traverse the tree, replace!
const nodeFromPath = ( schemaTree, path ) =>
  schemaTree.find( node => path === pathFromNode( node ) )

module.exports = { pathFromNode, nodeFromPath }
