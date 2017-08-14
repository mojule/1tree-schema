'use strict'

const is = require( '@mojule/is' )

const nodeType = ({ core }) => {
  core.registerNodeType({
    nodeType: 30,
    name: 'string',
    isEmpty: () => true,
    create: propertyName => ({ propertyName })
  })

  core.registerNodeType({
    nodeType: 31,
    name: 'number',
    isEmpty: () => true,
    create: propertyName => ({ propertyName })
  })

  core.registerNodeType({
    nodeType: 32,
    name: 'boolean',
    isEmpty: () => true,
    create: propertyName => ({ propertyName })
  })

  core.registerNodeType({
    nodeType: 33,
    name: 'null',
    isEmpty: () => true,
    create: propertyName => ({ propertyName })
  })

  core.registerNodeType({
    nodeType: 34,
    name: 'object',
    create: propertyName => ({ propertyName })
  })

  core.registerNodeType({
    nodeType: 35,
    name: 'array',
    create: propertyName => ({ propertyName })
  })

  core.registerNodeType({
    nodeType: 36,
    name: 'integer',
    create: propertyName => ({ propertyName })
  })

  core.registerNodeType({
    nodeType: 37,
    name: 'any',
    create: propertyName => ({ propertyName })
  })

  core.registerNodeType({
    nodeType: 38,
    name: 'union',
    create: propertyName => ({ propertyName })
  })
}

module.exports = nodeType
