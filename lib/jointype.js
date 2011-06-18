/**
 * lib/jointype.js - class for defining join types
 *
 * Copyright 2011, Stuart Hudson <goulash1971@yahoo.com>
 * Released under the terms of the MIT License.
 * 
 * Version 0.0.1
 */
var mongoose = require('mongoose');
var MongooseError = mongoose.Error;


/**
 * JoinType constructor where join is attached to the given path with the
 * supplied options - key is used as setter for values.
 *
 * @param {String} path that the join is attached to
 * @param {Object} options for the JoinType
 * @api public
 */
function JoinType (path, options) {
	this.path = path;
	this.options = options;
	this.resultSet = false;
	this.nullOk = true;
	for (var i in options)
		if (this[i] && 'function' == typeof this[i]) {
			var opts = Array.isArray(options[i]) ? options[i] : [options[i]];
			this[i].apply(this, opts);
		}
};


/**
 * Option setter that defines the {@link #targetSchema} property for this 
 * {@link JoinType}
 *
 * @param {Object} the target schema for the join
 * @api public
 */
JoinType.prototype.target = function (val) {
	this.targetSchema = this.initSchema(val);
	return this.targetSchema;
};


/**
 * Option setter that defines the {@link #resultSet} property for this 
 * {@link JoinType}
 *
 * @param {Bolean} identifies if the join yeilds a result set
 * @api public
 */
JoinType.prototype.multiple = function (bool) {
	this.resultSet = (bool === true);
	return this;
};


/**
 * Option setter that defines the {@link #nullOk} property for this 
 * {@link JoinType}
 *
 * @param {Boolean} identifies if the join can be null or not
 * @api public
 */
JoinType.prototype.nullable = function (bool) {
	this.nullOk = (bool !== false);
	return this;
};


/**
 * Option setter that defines the {@link #mappedBy} property for this 
 * {@link JoinType} - the definition for the mapping is dependent upon
 * the join type
 *
 * @param {Object} the mapping definition to be applied to this join
 * @api public
 */
JoinType.prototype.mapping = function (val) {
	this.mappedBy = this.initMapping(val);
	return this.mappedBy;
};



/**
 * Method creates a lightweight binding from a {@link JoinType} to an
 * active model instance - exposes methods for the join.
 *
 * @param {Object} the model to bind the join to
 * @return {Object} the join binding
 * @api public
 */
JoinType.prototype.bind = function (model) {
	var join = this;
	return {
		follow : function (callback) {
			join.follow(model, callback);
		}
	};
}

/**
 * Backstop implementation of the following method for a {@link JoinType}
 * which will invoke a callback when following a join for a model.
 *
 * @param {Object} the model instance that the join starts at
 * @param {Function} callback to be invoked
 * @return {Object} the join result
 * @throws {FollowerError} if there is an error follwing the join
 * @api private
 */
JoinType.prototype.follow = function (model, callback) {
	callback(new FollowerError(this, this.path, "NOT YET IMPLEMENTED"));
}

/**
 * Worker method that will convert a value to a {@link Schema} instance
 * appropriately as the {@link #targetSchema} property for this join type.
 *
 * @param {Object} value to be converted to schema
 * @return {Object} the converted value
 * @throws {JoinError} if there is an error converting the value
 * @api private
 */
JoinType.prototype.initSchema = function (val) {
	return val;
};

/**
 * Worker method that will convert a value to an appropriate mapping
 * definition as the {@link #mappedBy} property for this join type
 *
 * @param {Object} value to be converted to a mapping definition
 * @return {Object} the converted value
 * @throws {JoinError} if there is an error converting the value
 * @api private
 */
JoinType.prototype.initMapping = function (val) {
	return val;
};


/**
 * JoinError constructor that will be used for errors thrown when a join
 * is being created
 *
 * @param {String} the path the join is being created on
 * @param {Object} details appropriate to the error
 * @api private
 */
function JoinError (path, detail) {
	MongooseError(this, 'Join ' + path + ' failed :' + detail);
	Error.captureStackTrace(this, arguments.callee);
	this.name = 'JoinError';
	this.path = path;
	this.detail = detail;
};

/**
 * Inherits from {@link MongooseError}
 */
JoinError.prototype.__proto__ = MongooseError.prototype;

/**
 * FollowerError constructor that will be used for errors thrown when a 
 * join is being followed
 *
 * @param {String} the path the join is being followed for
 * @param {Object} details appropriate to the error
 * @api private
 */
function FollowerError (path, detail) {
	MongooseError(this, 'Follower ' + path + 'error :' + detail);
	Error.captureStackTrace(this, arguments.callee);
	this.name = 'FollowerError';
	this.path = path;
	this.detail = detail;
};

/**
 * Inherits from {@link MongooseError}
 */
FollowerError.prototype.__proto__ = MongooseError.prototype;

/**
 * ConstraintError constructor that will be used for errors thrown when a 
 * join constraint has been violated
 *
 * @param {String} the path the join where the constraintis violated
 * @param {Object} details appropriate to the error
 * @api private
 */
function ConstraintError (path, detail) {
	MongooseError(this, 'Constraint ' + path + 'error :' + detail);
	Error.captureStackTrace(this, arguments.callee);
	this.name = 'ConstraintError';
	this.path = path;
	this.detail = detail;
};

/**
 * Inherits from {@link MongooseError}
 */
ConstraintError.prototype.__proto__ = MongooseError.prototype;

/**
 * CascadeError constructor that will be used for errors thrown when a 
 * join is cascading an operation
 *
 * @param {String} the path the join is cascading
 * @param {Object} details appropriate to the error
 * @api private
 */
function CascadeError (path, detail) {
	MongooseError(this, 'Cascade ' + path + 'error :' + detail);
	Error.captureStackTrace(this, arguments.callee);
	this.name = 'CascadeError';
	this.path = path;
	this.detail = detail;
};

/**
 * Inherits from {@link MongooseError}
 */
CascadeError.prototype.__proto__ = MongooseError.prototype;

/**
 * Expose the JoinType and associated error types
 */
module.exports = exports = JoinType;

exports.JoinError = JoinError;
exports.FollowerError = FollowerError;
exports.ConstraintError = ConstraintError;
exports.CascadeError = CascadeError;