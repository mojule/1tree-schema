'use strict'

const { toTree, toJson } = require( '1tree-json' )

const mapper = ( model, mapping ) => {
  const clone = Object.assign( {}, model )

  const mappingKeys = Object.keys( mapping )

  mappingKeys.forEach( key => {
    const replacement = mapping[ key ]

    const repTree = toTree( replacement )

    const nameValueNodes = repTree.findAll( n => {
      const value = n.value()

      return value.nodeType === 'nameValue' && value.nodeValue === '$value'
    })

    nameValueNodes.forEach( nvNode => {
      const parentNode = nvNode.getParent()
      const parentParentNode = parentNode.getParent()

      const sourcePropertyNode = nvNode.firstChild()
      const sourcePropertyNodeValue = sourcePropertyNode.value()
      const sourcePropertyName = sourcePropertyNodeValue.nodeValue

      const newNodeTree = toTree( model[ sourcePropertyName ] )

      parentParentNode.replaceChild( newNodeTree, parentNode )
    })

    console.log( JSON.stringify( repTree.serialize(), null, 2 ) )

    const replacementObj = toJson( repTree )

    clone[ key ] = replacementObj
  })

  return clone
}

module.exports = mapper
