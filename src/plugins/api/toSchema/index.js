'use strict'

const utils = require( '@mojule/utils' )

const { clone } = utils

const valueMapper = node => {
  const schema = clone( node.value )

  if( schema.type === 'union' ){
    schema.type = schema.typesUnion

    delete schema.typesUnion
  } else if( schema.type === 'any' ){
    delete schema.type
  }

  return schema
}

const removeProperty = ( node, propertyName ) => {
  const value = node.value[ propertyName ]

  delete node.value[ propertyName ]

  return value
}

const propertyPopulators = {
  propertyName: ( node, schema ) => {
    if( typeof schema.properties !== 'object' )
      schema.properties = {}

    const propertyName = removeProperty( node, 'propertyName' )

    schema.properties[ propertyName ] = toSchema( node )
  },
  propertyPattern: ( node, schema ) => {
    if( typeof schema.patternProperties !== 'object' )
      schema.patternProperties = {}

    const pattern = removeProperty( node, 'propertyPattern' )

    schema.patternProperties[ pattern ] = toSchema( node )
  },
  additionalPropertiesSchema: ( node, schema ) => {
    removeProperty( node, 'additionalPropertiesSchema' )

    schema.additionalProperties = toSchema( node )
  },
  arrayItem: ( node, schema ) => {
    removeProperty( node, 'arrayItem' )

    schema.items = toSchema( node )
  },
  arrayIndex: ( node, schema ) => {
    if( !Array.isArray( schema.items ))
      schema.items = []

    const arrayIndex = removeProperty( node, 'arrayIndex' )

    schema.items[ arrayIndex ] = toSchema( node )
  },
  anyOf: ( node, schema ) => {
    if( !Array.isArray( schema.anyOf ))
      schema.anyOf = []

    removeProperty( node, 'anyOf' )

    const childSchema = toSchema( node )

    schema.anyOf.push( childSchema )
  },
  allOf: ( node, schema ) => {
    if( !Array.isArray( schema.allOf ))
      schema.allOf = []

    removeProperty( node, 'allOf' )

    const childSchema = toSchema( node )

    schema.allOf.push( childSchema )
  },
  oneOf: ( node, schema ) => {
    if( !Array.isArray( schema.oneOf ))
      schema.oneOf = []

    removeProperty( node, 'oneOf' )

    const childSchema = toSchema( node )

    schema.oneOf.push( childSchema )
  },
  not: ( node, schema ) => {
    removeProperty( node, 'not' )

    schema.not = toSchema( node )
  }
}

const populatorProperties = Object.keys( propertyPopulators )

const nestingMapper = node => {
  const schema = valueMapper( node )

  node.childNodes.forEach( childNode => {
    const { value } = childNode
    const populateFor = populatorProperties.filter( propertyName => propertyName in value )

    populateFor.forEach( propertyName => {
      const populator = propertyPopulators[ propertyName ]

      populator( childNode, schema )
    })
  })

  return schema
}

const valueMappers = {
  object: nestingMapper,
  array: nestingMapper,
  any: nestingMapper,
  union: nestingMapper,
  string: valueMapper,
  number: valueMapper,
  boolean: valueMapper,
  integer: valueMapper,
  null: valueMapper
}

const toSchema = node => {
  node = node.clone()

  const { value } = node

  delete value.nodeType

  const schemaType = value.type
  const mapper = valueMappers[ schemaType ]

  return mapper( node )
}

const toSchemaPlugin = ({ api, state, core }) => {
  api.toSchema = () => toSchema( api )
}

module.exports = toSchemaPlugin
