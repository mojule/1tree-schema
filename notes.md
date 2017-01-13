# notes

nesting is created when a schema property refers to another schema - the json
schema documentation refers to these as "complex schema" - in this way we see
that a schema is a directed tree* and therefore can be treated like any other
tree, eg queried, traversed, manipulated

all schema for basic types except object and array are empty nodes, they have no
schema properties that can create nesting

schema properties go in 1tree nodes' `value` property unless they create
nesting, in which case they need to go in children so that the graph can be
traversed

*actually I think the way that `dependencies` works may create loops, but we are
ignoring that for now

## properties that create nesting

### on an object:

  - properties
  - additionalProperties
  - definitions
  - patternProperties
  - dependencies
  - allOf
  - anyOf
  - oneOf
  - not

### on an array:

  - items
  - additionalItems

## nesting example for object
each property in properties takes the form following, a property must have
exactly one child:

```javascript
{
  value: {
    nodeType: 'property',
    name: 'foo'
  },
  children: [
    { type: 'string' }
  ]
}
```
