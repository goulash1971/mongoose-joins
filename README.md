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

To just install the types provided by the extension (either all types or a list of named types):

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

To just install the plugins provided by the extension (either all plugins or list of named plugins):

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

To just install the patches provided by the extension (either all patches or list of named patches):

	var mongoose = require("mongoose");
	   
	// Create a connection to your database
	var db = mongoose.createConnection("mongodb://localhost/sampledb");
	
	// Access the mongoose-joins module and the utilities
	var joins = require("mongoose-joins");
	var utils = joins.utils;
	
	// Install the monkey patches
	joins.installPatches(mongoose);

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
