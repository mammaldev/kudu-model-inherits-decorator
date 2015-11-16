// Decorate a Kudu model constructor with a static "inherits" method. The
// method merges the "properties" of the two schemas with the subclass taking
// precedence in the case where both schemas define a property with the same
// name. The method also merges any "hooks" defined on the schemas. If hook
// functions for the same event are defined on both schemas the functions are
// pushed into an array with those defined on the superclass taking precedence.
//
// Usage:
//
//   ```
//   @inherits
//   class Model {
//     constructor() {}
//   }
//
//   class Base {
//     constructor() {}
//   }
//
//   Model.inherits(Base);
//   ```
//
export default function inherits( Model ) {

  if ( !Model ) {
    throw new Error('Expected a model constructor to decorate.');
  }

  Model.inherits = function inherits( ctor ) {

    if ( typeof ctor !== 'function' ) {
      throw new Error('Expected a model constructor to inherit from.');
    }

    Model.schema.properties = Object.assign(
      {},
      ctor.schema.properties,
      Model.schema.properties
    );

    // Subclass model constructors also inherit hook functions. In cases where
    // both sub and super constructor provide a function for the same event
    // they are run consecutively, starting with those defined by the super
    // constructor.
    if ( ctor.schema.hooks ) {

      // If the subclass constructor doesn't have any hooks defined we can just
      // use the superclass hooks as-is. Otherwise we have to merge the two
      // sets.
      const hooks = Model.schema.hooks;

      if ( !hooks ) {
        Model.schema.hooks = ctor.schema.hooks;
      } else {

        Object.keys(ctor.schema.hooks).forEach(( hook ) => {

          // Ensure both the sub/super constructor hooks are arrays. This makes
          // it easier to combine them with simple concatenation.
          let subHooks = ctor.schema.hooks[ hook ];
          if ( !Array.isArray(subHooks) ) {
            subHooks = [ subHooks ];
          }

          if ( !Array.isArray(hooks[ hook ]) ) {
            hooks[ hook ] = [ hooks[ hook ] ];
          }

          hooks[ hook ] = hooks[ hook ].concat(subHooks);
        });
      }
    }
  };
}
