'use strict'

const Tree = require( '1tree' )

const createsNesting = {
  object: [
    'properties', 'additionalProperties', 'definitions', 'patternProperties',
    'dependencies', 'allOf', 'anyOf', 'oneOf', 'not'
  ],
  array: [
    'items'
  ]
}

createsNesting.any = createsNesting.object.concat( createsNesting.array )
createsNesting.union = createsNesting.any

const valueMapper = schema => {
  const value = Object.assign( {}, schema )

  if( Array.isArray( schema.type )){
    value.type = 'union'
    value.typesUnion = schema.type.slice()
  } else if( typeof schema.type !== 'string' ){
    value.type = 'any'
  }

  return value
}

const nestingMapper = schema => {
  const value = valueMapper( schema )

  const createsNestingDef = createsNesting[ value.type ]

  createsNestingDef.forEach( propertyName => {
    delete value[ propertyName ]
  })

  return value
}

const nodeValueMappers = {
  string: valueMapper,
  number: valueMapper,
  integer: valueMapper,
  boolean: valueMapper,
  null: valueMapper,
  object: nestingMapper,
  array: nestingMapper,
  any: nestingMapper
}

const extendValue = ( node, value ) =>
  node.value( Object.assign( {}, node.value(), value ) )

const createPropertyNode = ( schema, node, propertyName ) => {
  const propertySchema = schema.properties[ propertyName ]
  const propertyNode = toNode( propertySchema, node )

  extendValue( propertyNode, { propertyName } )

  return propertyNode
}

const createAdditionalPropertiesNode = ( schema, node ) => {
  const additionalPropertiesSchema = schema.additionalProperties
  const additionalPropertiesNode = toNode( additionalPropertiesSchema, node )

  extendValue( additionalPropertiesNode, { additionalPropertiesSchema: true } )

  return additionalPropertiesNode
}

const createPatternPropertyNode = ( schema, node, pattern ) => {
  const patternPropertySchema = schema.patternProperties[ pattern ]
  const patternPropertyNode = toNode( patternPropertySchema, node )

  extendValue( patternPropertyNode, { propertyPattern: pattern } )

  return patternPropertyNode
}

const createCombiningNode = ( combineSchema, node, combineName ) => {
  const combineNode = toNode( combineSchema, node )

  extendValue( combineNode, { [ combineName ]: true } )

  return combineNode
}

const createItemsNode = ( schema, node ) => {
  const itemsSchema = schema.items
  const itemsNode = toNode( itemsSchema, node )

  extendValue( itemsNode, { arrayItem: true } )

  return itemsNode
}

const createItemTupleNode = ( tupleSchema, node, index ) => {
  const itemTupleNode = toNode( tupleSchema, node )

  extendValue( itemTupleNode, { arrayIndex: index } )

  return itemTupleNode
}

const combineArrayTypes = [ 'anyOf', 'allOf', 'oneOf' ]

const childrenPopulators = {
  object: ( schema, node ) => {
    if( schema.properties ){
      const propertyNames = Object.keys( schema.properties )

      propertyNames.forEach( propertyName => {
        const propertyNode = createPropertyNode( schema, node, propertyName )
        node.append( propertyNode )
      })
    }

    if( typeof schema.additionalProperties === 'boolean' ){
      const value = node.value()

      value.additionalProperties = schema.additionalProperties

      node.value( value )
    } else if( typeof schema.additionalProperties === 'object' ){
      const additionalPropertiesNode = createAdditionalPropertiesNode( schema, node )

      node.append( additionalPropertiesNode )
    }

    if( schema.definitions )
      throw new Error( 'definitions not supported' )

    if( schema.patternProperties ){
      const patterns = Object.keys( schema.patternProperties )

      patterns.forEach( pattern => {
        const patternPropertyNode = createPatternPropertyNode( schema, node, pattern )
        node.append( patternPropertyNode )
      })
    }

    if( schema.dependencies )
      throw new Error( 'dependencies not supported' )

    combineArrayTypes.forEach( combineName => {
      if( schema[ combineName ] ){
        const combineDef = schema[ combineName ]

        combineDef.forEach( combineSchema => {
          const combineNode = createCombiningNode( combineSchema, node, combineName )

          node.append( combineNode )
        })
      }
    })

    if( schema.not ){
      const combineSchema = schema.not
      const combineNode = createCombiningNode( combineSchema, node, 'not' )

      node.append( combineNode )
    }
  },
  array: ( schema, node ) => {
    if( Array.isArray( schema.items ) ){
      schema.items.forEach( ( tupleSchema, index ) => {
        const itemTupleNode = createItemTupleNode( tupleSchema, node, index )

        node.append( itemTupleNode)
      })
    } else if( typeof schema.items === 'object' ){
      const itemsNode = createItemsNode( schema, node )

      node.append( itemsNode )
    }
  },
  any: ( schema, node ) => {
    childrenPopulators.object( schema, node )
    childrenPopulators.array( schema, node )
  }
}

const containerNodeTypes = Object.keys( childrenPopulators )

const toNode = ( schema, parent ) => {
  const create = parent ? parent.createNode : Tree.createRoot

  const schemaType = typeof schema.type === 'string' ? schema.type : 'any'
  const valueMapper = nodeValueMappers[ schemaType ]
  const value = valueMapper( schema )
  const node = create( value )

  if( containerNodeTypes.includes( schemaType ) ){
    const childrenPopulator = childrenPopulators[ schemaType ]

    childrenPopulator( schema, node )
  }

  return node
}

const toTree = schema => toNode( schema, null )

module.exports = toTree
