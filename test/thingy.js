'use strict'

const { toTree, toJson } = require( '../src' )

const tv4 = require( 'tv4' )
const fs = require( 'fs' )
const document = require( './fixtures/document.schema.json' )
const htmlResource = require( './fixtures/htmlResource.schema.json' )
const htmlResourceSrc = require( './fixtures/htmlResourceSrc.schema.json' )
const htmlResourceText = require( './fixtures/htmlResourceText.schema.json' )
const nonEmptyString = require( './fixtures/nonEmptyString.schema.json' )
const script = require( './fixtures/script.schema.json' )
const style = require( './fixtures/style.schema.json' )

const scriptTransform = require( './fixtures/script.transform.json' )
const styleTransform = require( './fixtures/style.transform.json' )

const modelMapper = require( './modelMapper' )

const model = require( './fixtures/model.json' )

const schemas = {
  document, htmlResource, htmlResourceSrc, htmlResourceText, nonEmptyString,
  script, style
}

const schemaTrees = Object.keys( schemas ).reduce( ( trees, key ) => {
  const schema = schemas[ key ]
  trees[ key ] = toTree( schema )

  return trees
}, {} )

const transforms = {
  script: scriptTransform,
  style: styleTransform
}

const componentNames = [ 'document', 'style', 'script' ]

const normalize = ( schemaTrees, name ) => {
  const schemaTree = schemaTrees[ name ].clone()

  schemaTree.walk( n => {
    const value = n.value()

    if( value.$ref ){
      const refName = value.$ref
      const normalized = normalize( schemaTrees, refName )
      const refValue = normalized.value()
      const newValue = Object.assign( {}, value, refValue )

      const refChildren = normalized.getChildren()

      refChildren.forEach( child => n.append( child ) )

      n.value( newValue )
    }
  })

  return schemaTree
}

const pathFromNode = node => {
  const parent = node.getParent()

  if( !parent ) return '/'

  const siblings = parent.getChildren().map( n => n.get() )
  const index = siblings.indexOf( node.get() )

  return pathFromNode( parent ) + index + '/'
}

const nodeFromPath = ( root, path ) => {
  const segments = path
    .split( '/' )
    .filter( i => i !== '' )
    .map( i => Number( i ) )

  let current = root

  segments.forEach( index => {
    const currentChildren = current.getChildren()
    current = currentChildren[ index ]
  })

  return current
}



// what properties in the model schema come from other components?
// these need to be transformed on the model
const transformComponentModel = ( schemaTrees, transforms, componentNames, rootName, model ) => {
  const rootComponentTree = schemaTrees[ rootName ]

  const nestedComponentPaths = {}

  const refs = rootComponentTree.findAll( n => '$ref' in n.value() )

  refs.forEach( refNode => {
    const value = refNode.value()
    const refName = value.$ref

    if( componentNames.includes( refName )){
      const propertyAncestor = refNode.closest( n =>
        n.value().nodeType === 'property'
      )
      const propertyName = propertyAncestor.value().name

      const componentContextNode = propertyAncestor.firstChild()
      const componentContextValue = componentContextNode.value()

      if( componentContextValue.type === 'array' ){
        // we know that propertyName is an array of this component

        // find propertyName in model
      } else if( componentContextValue.type === 'object' ){
        throw new Error( 'Object not supported yet' )
      } else {
        throw new Error( 'Unexpected component context found' )
      }

      const pathToComponentNode = pathFromNode( propertyAncestor )
      const modelPath = objectPathFromSchemaNode( refNode )

      nestedComponentPaths[ propertyName ] = pathToComponentNode
    }
  })

  console.log( nestedComponentPaths )

  const nodesFromPaths = Object.keys( nestedComponentPaths )
    .reduce( ( nodes, key ) => {
      const currentPath = nestedComponentPaths[ key ]
      const node = nodeFromPath( rootComponentTree, currentPath )

      nodes[ key ] = node.get()

      return nodes
    }, {})

  console.log( nodesFromPaths )

  return null
}