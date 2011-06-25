mongoose-joins - Plugin support for basic joins in Mongoose 
==============

### Overview

Mongoose-Joins is an extension for Mongoose that provides basic join support for the Mongoose ORM that 
can be extended with different join styles and provides some utilities, plugins and patches that allow 
joins to be manipulated / followed.

#### Terminology

- *join* : a mapping between two *parties* - a *source party* and a *target party*
- *party* : a model that has been installed in a Mongoose instance
- *source party* : the party on which the join is installed
- *target party* : the party which is the type of model(s) returned when following the join
- *join binding* : a lightweight object that represents the join for a given *source party* instance

#### Extension contents 

The extension provides the following join types:

- `DBRefJoin` : a join where one *party* holds a `DBRef` to another *party*
- `FkJoin` : a join where one *party* holds a *foreign key* of another *party*
- `MappedJoin` : a join where one *party* holds field values that can be mapped to those in another *party*
- `QueryJoin` : a join where the mapping between *parties* is defined by a query generated from a `function`

The extension provides the following monkey-patches:

- `schema.join` : used to define a join on a `Schema` instance (representing the *source party*)


### Installation
	npm install mongoose-joins

### Setup
To install all of the types, plugins, patches and utilities provided by the extension into a Mongoose 
instance:

	var mongoose = require("mongoose");
	   
	// Create a connection to your database
	var db = mongoose.createConnection("mongodb://localhost/sampledb");
	
	// Access the mongoose-joins module and install everything
	var joins = require("mongoose-joins");
	var utils = joins.utils
	
	// Install the types, plugins and monkey patches
	var loaded = joins.install(mongoose);

The `loaded` value returned contains 2 properties:

- `loaded.types` : the join types that were loaded
- `loaded.plugins` : the extension plugins that were loaded

If you want to control what is installed, you can either install types/plugins/patches separately (see below)
or pass in a second argument to the `install` function.

If this second argument is a `Function` then it will be used as a filter when installing the types, plugins and
patches.  If it is an `Object` then the `types` property (either a filter `Function` or list of type names) is used
when loading the types, the `plugins` property (either a filter `Function` or list of plugin names) is used when
installing the plugins and the `patches` property (either a filter `Function` or list of patch names) is used when
installing the patches.

#### Loading Types Only

To just install the types provided by the extension:

	var mongoose = require("mongoose");
   
	// Create a connection to your database
	var db = mongoose.createConnection("mongodb://localhost/sampledb");

	// Access the mongoose-joins module
	var joins = require("mongoose-joins");
	var utils = joins.utils
	
	// Install the plugins
	var loaded = joins.loadTypes(mongoose);

The `loaded` value returned contains the types that were loaded, keyed by the name of each type 
loaded.

If you just want to load a specific list of types, or want to filter the types loaded then use one
of the following signatures with the `loadTypes()` function:

   - `loadTypes(mongoose, 'dbrefJoin')` : just loads the `dbrefJoin` type
   - `loadTypes(mongoose, function(type) { return type.slice(1,2) === 'db'; })` : loads types starting with `db`

#### Installing Plugins Only

To just install the plugins provided by the extension:

	var mongoose = require("mongoose");
	   
	// Create a connection to your database
	var db = mongoose.createConnection("mongodb://localhost/sampledb");
	
	// Access the mongoose-joins module
	var joins = require("mongoose-joins");
	var utils = joins.utils
	
	// Install the plugins
	var loaded = joins.installPlugins(mongoose);

The `loaded` value returned contains the plugins that were loaded, keyed by the name of each plugin 
loaded.

If you just want to install a specific list of plugins, or want to filter the plugins loaded then use one
of the following signatures with the `installPlugins()` function:

   - `installPlugins(mongoose, 'validateJoins')` : just install the `validateJoins` plugin
   - `installPlugins(mongoose, function(plugin) { return plugin.slice(1,2) === 'db'; })` : installs plugins starting with `db`

#### Installing Patches Only

To just install the patches provided by the extension (all patches, named named patches or filtered patches):

	var mongoose = require("mongoose");
	   
	// Create a connection to your database
	var db = mongoose.createConnection("mongodb://localhost/sampledb");
	
	// Access the mongoose-joins module and the utilities
	var joins = require("mongoose-joins");
	var utils = joins.utils;
	
	// Install the monkey patches
	joins.installPatches(mongoose);

If you just want to install a specific list of patches, or want to filter the patches loaded then use one
of the following signatures with the `installPatches()` function:

   - `installPatches(mongoose, 'schema')` : just install the `schema` patch
   - `installPatches(mongoose, function(patch) { return patch.slice(1,2) === 'db'; })` : installs patch starting with `db`

### How Joins are Modelled
Each join is defined as an instance of a concrete `JoinType` subclass, where the concrete subclass provides behaviour
for following the join and (optionall) manipulating the parties at either end of the relationship.  All joins have
the following properties.

- `path` : the virtual path that the join is installed on within the *source party*
- `options` : a map of option values set when the join was created
- `resultSet` : a `Boolean` which indicates whether the result of the join is 1 (`false`) or many (`true`)
- `nullOk` : a `Boolean` which indicates whether he result of the join can be `null` or empty
- `targetSchema` : the name of the `Schema` representing the *target party*
- `mappedBy` : the mapping definition (specific to the concrete `JoinType` subclass)

When a join is installed on a `Schema` (this is what the `schema.join` monkey patch does) then a `virtual` is created
on the `Schema` under the associated `path` that will yeild a *join binding* for an instance of the model created
from the `Schema`.

All *join bindings* supply the following functions:

- `follow` - follows the join for the model instance and invokes the `callback` supplied with `(err, result)`

The behavour that is executed for these functions is dependent upon the concrete `JoinType` subclass and the `options`
(including `target` and `mapping`) supplied when creating the join for the `Schema`.

### Using the join types

#### Join Type: `DBRefJoin`
The `DBRefJoin` join type can be used where the relationship between the two parties is controlled through a `DBRef` on
one of the parties.

#### Join Type: `FkJoin`
The `FkJoin` join type can be used where the relationship between the two parties is controlled through a *foreign key* on
one of the parties.

#### Join Type: `MappedJoin`
The `MappedJoin` join type can be used where the relationship between the two parties is controlled a field mapping for
the two parties.

#### Join Type: `QueryJoin`
The `QueryJoin` join type can be used where the relationship between the two parties is controlled through a *query* that
can be executed against the *target party* using properties of the *source party* instance.

### Using the patches
Once you have installed the patches, or installed the whole extension, you can begin to use them.

#### Patch: `schema.join`
This `join` monkey patch to the `Schema` class can be used to define and install a join on the `Schema` representing the
*source party* of the join.

### Contributors
- [Stuart Hudson](https://github.com/goulash1971)

### License
MIT License

### Acknowledgements
- [Brian Noguchi](https://github.com/bnoguchi) for the 'mongoose-types' extension that was used as a template for this extension

---
### Author
Stuart Hudson		 
