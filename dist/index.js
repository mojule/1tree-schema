'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Tree = require('1tree');

var createsNesting = {
  object: ['properties', 'additionalProperties', 'definitions', 'patternProperties', 'dependencies', 'allOf', 'anyOf', 'oneOf', 'not'],
  array: ['items']
};

createsNesting.any = createsNesting.object.concat(createsNesting.array);
createsNesting.union = createsNesting.any;

var primitiveMapper = function primitiveMapper(schema) {
  var value = Object.assign({}, schema);

  if (typeof schema.type === 'string') {
    value.nodeType = schema.type;
  } else if (Array.isArray(schema.type)) {
    value.nodeType = 'union';
    value.types = schema.type.slice();
  } else {
    value.nodeType = 'any';
  }

  delete value.type;

  return value;
};

var nestingMapper = function nestingMapper(schema) {
  var value = primitiveMapper(schema);

  var createsNestingDef = createsNesting[value.nodeType];

  createsNestingDef.forEach(function (propertyName) {
    delete value[propertyName];
  });

  return value;
};

var nodeValueMappers = {
  string: primitiveMapper,
  number: primitiveMapper,
  integer: primitiveMapper,
  boolean: primitiveMapper,
  null: primitiveMapper,
  object: nestingMapper,
  array: nestingMapper,
  any: nestingMapper
};

var createPropertyNode = function createPropertyNode(schema, node, propertyName) {
  var value = {
    nodeType: 'property',
    name: propertyName
  };

  var propertyNode = node.createNode(value);
  var propertySchema = schema.properties[propertyName];
  var child = toNode(propertySchema, node);

  propertyNode.append(child);

  return propertyNode;
};

var createAdditionalPropertiesNode = function createAdditionalPropertiesNode(schema, node) {
  var value = {
    nodeType: 'additionalProperties'
  };

  var additionalPropertiesNode = node.createNode(value);
  var additionalPropertiesSchema = schema.additionalProperties;
  var child = toNode(additionalPropertiesSchema, additionalPropertiesNode);

  additionalPropertiesNode.append(child);

  return additionalPropertiesNode;
};

var createPatternPropertyNode = function createPatternPropertyNode(schema, node, pattern) {
  var value = {
    nodeType: 'patternProperty',
    pattern: pattern
  };

  var patternPropertyNode = node.createNode(value);
  var patternPropertySchema = schema.patternProperties[pattern];
  var child = toNode(patternPropertySchema, patternPropertyNode);

  patternPropertyNode.append(child);

  return patternPropertyNode;
};

var createCombiningNode = function createCombiningNode(combineSchema, node, combineName) {
  var value = {
    nodeType: combineName
  };

  var combineNode = node.createNode(value);
  var child = toNode(combineSchema, combineNode);

  combineNode.append(child);

  return combineNode;
};

var createItemsNode = function createItemsNode(schema, node) {
  var value = {
    nodeType: 'items'
  };

  var itemsNode = node.createNode(value);
  var itemsSchema = schema.items;
  var child = toNode(itemsSchema, itemsNode);

  itemsNode.append(child);

  return itemsNode;
};

var createItemTupleNode = function createItemTupleNode(tupleSchema, node, index) {
  var value = {
    nodeType: 'itemTuple',
    index: index
  };

  var itemTupleNode = node.createNode(value);
  var child = toNode(tupleSchema, itemTupleNode);

  itemTupleNode.append(child);

  return itemTupleNode;
};

var combineArrayTypes = ['anyOf', 'allOf', 'oneOf'];

var childrenPopulators = {
  object: function object(schema, node) {
    if (schema.properties) {
      var propertyNames = Object.keys(schema.properties);

      propertyNames.forEach(function (propertyName) {
        var propertyNode = createPropertyNode(schema, node, propertyName);
        node.append(propertyNode);
      });
    }

    if (typeof schema.additionalProperties === 'boolean') {
      var value = node.value();

      value.additionalProperties = schema.additionalProperties;

      node.value(value);
    } else if (_typeof(schema.additionalProperties) === 'object') {
      var additionalPropertiesNode = createAdditionalPropertiesNode(schema, node);

      node.append(additionalPropertiesNode);
    }

    if (schema.definitions) throw new Error('definitions not supported');

    if (schema.patternProperties) {
      var patterns = Object.keys(schema.patternProperties);

      patterns.forEach(function (pattern) {
        var patternPropertyNode = createPatternPropertyNode(schema, node, pattern);
        node.append(patternPropertyNode);
      });
    }

    if (schema.dependencies) throw new Error('dependencies not supported');

    combineArrayTypes.forEach(function (combineName) {
      if (schema[combineName]) {
        var combineDef = schema[combineName];

        combineDef.forEach(function (combineSchema) {
          var combineNode = createCombiningNode(combineSchema, node, combineName);

          node.append(combineNode);
        });
      }
    });

    if (schema.not) {
      var combineSchema = schema.not;
      var combineNode = createCombiningNode(combineSchema, node, 'not');

      node.append(combineNode);
    }
  },
  array: function array(schema, node) {
    if (Array.isArray(schema.items)) {
      schema.items.forEach(function (tupleSchema, index) {
        var itemTupleNode = createItemTupleNode(tupleSchema, node, index);

        node.append(itemTupleNode);
      });
    } else if (_typeof(schema.items) === 'object') {
      var itemsNode = createItemsNode(schema, node);

      node.append(itemsNode);
    }
  },
  any: function any(schema, node) {
    childrenPopulators.object(schema, node);
    childrenPopulators.array(schema, node);
  }
};

var containerNodeTypes = Object.keys(childrenPopulators);

var toNode = function toNode(schema, parent) {
  var nodeType = typeof schema.type === 'string' ? schema.type : 'any';

  if (Array.isArray(schema.type)) {
    console.log('fun times!');
  }

  var create = parent ? parent.createNode : Tree.createRoot;

  var valueMapper = nodeValueMappers[nodeType];
  var value = valueMapper(schema);

  if (Array.isArray(schema.type)) {
    value.nodeType = 'union';
    value.types = schema.type.slice();
  }

  var node = create(value);

  if (containerNodeTypes.includes(nodeType)) {
    var childrenPopulator = childrenPopulators[nodeType];

    childrenPopulator(schema, node);
  }

  return node;
};

var toTree = function toTree(schema) {
  return toNode(schema, null);
};

var toJson = function toJson(tree) {
  var value = tree.value();
  var nodeType = value.nodeType;

  throw new Error('Unexpected node');
};

module.exports = { toTree: toTree, toJson: toJson };