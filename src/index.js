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

const primitiveMapper = schema => {
  const value = Object.assign( {}, schema )

  if( typeof schema.type === 'string' ){
    value.nodeType = schema.type
  } else if( Array.isArray( schema.type ) ){
    value.nodeType = 'union'
    value.types = schema.type.slice()
  } else {
    value.nodeType = 'any'
  }

  delete value.type

  return value
}

const nestingMapper = schema => {
  const value = primitiveMapper( schema )

  const createsNestingDef = createsNesting[ value.nodeType ]

  createsNestingDef.forEach( propertyName => {
    delete value[ propertyName ]
  })

  return value
}

const nodeValueMappers = {
  string: primitiveMapper,
  number: primitiveMapper,
  integer: primitiveMapper,
  boolean: primitiveMapper,
  null: primitiveMapper,
  object: nestingMapper,
  array: nestingMapper,
  any: nestingMapper
}

const createPropertyNode = ( schema, node, propertyName ) => {
  const value = {
    nodeType: 'property',
    name: propertyName
  }

  const propertyNode = node.createNode( value )
  const propertySchema = schema.properties[ propertyName ]
  const child = toNode( propertySchema, node )

  propertyNode.append( child )

  return propertyNode
}

const createAdditionalPropertiesNode = ( schema, node ) => {
  const value = {
    nodeType: 'additionalProperties'
  }

  const additionalPropertiesNode = node.createNode( value )
  const additionalPropertiesSchema = schema.additionalProperties
  const child = toNode( additionalPropertiesSchema, additionalPropertiesNode )

  additionalPropertiesNode.append( child )

  return additionalPropertiesNode
}

const createPatternPropertyNode = ( schema, node, pattern ) => {
  const value = {
    nodeType: 'patternProperty',
    pattern
  }

  const patternPropertyNode = node.createNode( value )
  const patternPropertySchema = schema.patternProperties[ pattern ]
  const child = toNode( patternPropertySchema, patternPropertyNode )

  patternPropertyNode.append( child )

  return patternPropertyNode
}

const createCombiningNode = ( combineSchema, node, combineName ) => {
  const value = {
    nodeType: combineName
  }

  const combineNode = node.createNode( value )
  const child = toNode( combineSchema, combineNode )

  combineNode.append( child )

  return combineNode
}

const createItemsNode = ( schema, node ) => {
  const value = {
    nodeType: 'items'
  }

  const itemsNode = node.createNode( value )
  const itemsSchema = schema.items
  const child = toNode( itemsSchema, itemsNode )

  itemsNode.append( child )

  return itemsNode
}

const createItemTupleNode = ( tupleSchema, node, index ) => {
  const value = {
    nodeType: 'itemTuple',
    index
  }

  const itemTupleNode = node.createNode( value )
  const child = toNode( tupleSchema, itemTupleNode )

  itemTupleNode.append( child )

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
  const nodeType = typeof schema.type === 'string' ? schema.type : 'any'

  if( Array.isArray( schema.type )){
    console.log( 'fun times!' )
  }

  const create = parent ? parent.createNode : Tree.createRoot

  const valueMapper = nodeValueMappers[ nodeType ]
  const value = valueMapper( schema )

  if( Array.isArray( schema.type )){
    value.nodeType = 'union'
    value.types = schema.type.slice()
  }

  const node = create( value )

  if( containerNodeTypes.includes( nodeType ) ){
    const childrenPopulator = childrenPopulators[ nodeType ]

    childrenPopulator( schema, node )
  }

  return node
}

const toTree = schema => toNode( schema, null )

const toJson = tree => {
  const value = tree.value()
  const nodeType = value.nodeType

  throw new Error( 'Unexpected node' )
}

module.exports = { toTree, toJson }
