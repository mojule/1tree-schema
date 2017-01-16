'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Tree = require('1tree');

var createsNesting = {
  object: ['properties', 'additionalProperties', 'definitions', 'patternProperties', 'dependencies', 'allOf', 'anyOf', 'oneOf', 'not'],
  array: ['items']
};

createsNesting.any = createsNesting.object.concat(createsNesting.array);
createsNesting.union = createsNesting.any;

var valueMapper = function valueMapper(schema) {
  var value = Object.assign({}, schema);

  if (Array.isArray(schema.type)) {
    value.type = 'union';
    value.typesUnion = schema.type.slice();
  } else if (typeof schema.type !== 'string') {
    value.type = 'any';
  }

  return value;
};

var nestingMapper = function nestingMapper(schema) {
  var value = valueMapper(schema);

  var createsNestingDef = createsNesting[value.type];

  createsNestingDef.forEach(function (propertyName) {
    delete value[propertyName];
  });

  return value;
};

var nodeValueMappers = {
  string: valueMapper,
  number: valueMapper,
  integer: valueMapper,
  boolean: valueMapper,
  null: valueMapper,
  object: nestingMapper,
  array: nestingMapper,
  any: nestingMapper
};

var extendValue = function extendValue(node, value) {
  return node.value(Object.assign({}, node.value(), value));
};

var createPropertyNode = function createPropertyNode(schema, node, propertyName) {
  var propertySchema = schema.properties[propertyName];
  var propertyNode = toNode(propertySchema, node);

  extendValue(propertyNode, { propertyName: propertyName });

  return propertyNode;
};

var createAdditionalPropertiesNode = function createAdditionalPropertiesNode(schema, node) {
  var additionalPropertiesSchema = schema.additionalProperties;
  var additionalPropertiesNode = toNode(additionalPropertiesSchema, node);

  extendValue(additionalPropertiesNode, { additionalPropertiesSchema: true });

  return additionalPropertiesNode;
};

var createPatternPropertyNode = function createPatternPropertyNode(schema, node, pattern) {
  var patternPropertySchema = schema.patternProperties[pattern];
  var patternPropertyNode = toNode(patternPropertySchema, node);

  extendValue(patternPropertyNode, { propertyPattern: pattern });

  return patternPropertyNode;
};

var createCombiningNode = function createCombiningNode(combineSchema, node, combineName) {
  var combineNode = toNode(combineSchema, node);

  extendValue(combineNode, _defineProperty({}, combineName, true));

  return combineNode;
};

var createItemsNode = function createItemsNode(schema, node) {
  var itemsSchema = schema.items;
  var itemsNode = toNode(itemsSchema, node);

  extendValue(itemsNode, { arrayItem: true });

  return itemsNode;
};

var createItemTupleNode = function createItemTupleNode(tupleSchema, node, index) {
  var itemTupleNode = toNode(tupleSchema, node);

  extendValue(itemTupleNode, { arrayIndex: index });

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
  var create = parent ? parent.createNode : Tree.createRoot;

  var schemaType = typeof schema.type === 'string' ? schema.type : 'any';
  var valueMapper = nodeValueMappers[schemaType];
  var value = valueMapper(schema);
  var node = create(value);

  if (containerNodeTypes.includes(schemaType)) {
    var childrenPopulator = childrenPopulators[schemaType];

    childrenPopulator(schema, node);
  }

  return node;
};

var toTree = function toTree(schema) {
  return toNode(schema, null);
};

module.exports = toTree;