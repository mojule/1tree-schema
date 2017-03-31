'use strict'

const is = require( '@mojule/is' )

const isValuePlugin = node => {
  const { isValue } = node

  return {
    $isValue: value => isValue( value ) && is.string( value.nodeType )
  }
}

module.exports = isValuePlugin
