'use strict'

const valueMapper = node => {
  const value = node.value()

  if( value.nodeType !== 'schema' )
    throw new Error( 'Expected a schema node but found ' + value.nodeType )

  const schema = Object.assign( {}, value )

  delete schema.nodeType

  if( value.type === 'union' ){
    schema.type = value.typesUnion

    delete schema.typesUnion
  } else if( value.type === 'any' ){
    delete schema.type
  }

  return schema
}

const propertyPopulators = {
  property: ( node, schema ) => {
    if( typeof schema.properties !== 'object' )
      schema.properties = {}

    const value = node.value()
    const propertyName = value.name
    const child = node.firstChild()

    schema.properties[ propertyName ] = toJson( child )
  },
  patternProperty: ( node, schema ) => {
    if( typeof schema.patternProperties !== 'object' )
      schema.patternProperties = {}

    const value = node.value()
    const pattern = value.pattern
    const child = node.firstChild()

    schema.patternProperties[ pattern ] = toJson( child )
  },
  additionalProperties: ( node, schema ) => {
    const child = node.firstChild()

    schema.additionalProperties = toJson( child )
  },
  items: ( node, schema ) => {
    const child = node.firstChild()

    schema.items = toJson( child )
  },
  itemTuple: ( node, schema ) => {
    if( !Array.isArray( schema.items ))
      schema.items = []

    const value = node.value()
    const index = value.index
    const child = node.firstChild()

    schema.items[ index ] = toJson( child )
  },
  anyOf: ( node, schema ) => {
    if( !Array.isArray( schema.anyOf ))
      schema.anyOf = []

    const child = node.firstChild()
    const childSchema = toJson( child )

    schema.anyOf.push( childSchema )
  },
  allOf: ( node, schema ) => {
    if( !Array.isArray( schema.allOf ))
      schema.allOf = []

    const child = node.firstChild()
    const childSchema = toJson( child )

    schema.allOf.push( childSchema )
  },
  oneOf: ( node, schema ) => {
    if( !Array.isArray( schema.oneOf ))
      schema.oneOf = []

    const child = node.firstChild()
    const childSchema = toJson( child )

    schema.oneOf.push( childSchema )
  },
  not: ( node, schema ) => {
    const child = node.firstChild()

    schema.not = toJson( child )
  }
}

const nestingMapper = node => {
  const schema = valueMapper( node )

  const children = node.getChildren()

  children.forEach( childNode => {
    const value = childNode.value()
    const nodeType = value.nodeType
    const populator = propertyPopulators[ nodeType ]

    populator( childNode, schema )
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

const toJson = node => {
  const value = node.value()
  const schemaType = value.type
  const mapper = valueMappers[ schemaType ]

  return mapper( node )
}

module.exports = toJson
