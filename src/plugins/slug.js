'use strict'

const slugPlugin = node => {
  const { slug } = node

  return {
    slug: () => {
      if( node === node.getRoot() ) return slug()

      const parent = node.getParent()
      const nodeType = parent.nodeType()

      if( nodeType === 'object' ){
        return node.getValue( 'propertyName' )
      }

      return slug()
    }
  }
}

module.exports = slugPlugin
