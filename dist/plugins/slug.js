'use strict';

var slugPlugin = function slugPlugin(fn) {
  var originalSlug = fn.slug;

  var slug = function slug(fn, root, node) {
    if (root === node) return '';

    var value = fn.value(node);
    var propertyName = value.propertyName;


    return propertyName || originalSlug(fn, root, node);
  };

  slug.def = originalSlug.def;

  return Object.assign(fn, { slug: slug });
};

module.exports = slugPlugin;