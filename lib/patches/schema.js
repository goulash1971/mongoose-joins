/**
 * lib/patches/schema.js - monkey patches to Schema type
 *
 * Copyright 2011, Stuart Hudson <goulash1971@yahoo.com>
 * Released under the terms of the MIT License.
 * 
 * Version 0.0.2
 */
var mongoose = require("mongoose");
var JoinType = require("../jointype");

var JoinError = JoinType.JoinError;

/**
 * Utility that constructs a new {@link JoinType} instance for the 
 * given {@link Schema} instance with the given values
 *
 * @param {Object} the {@link Schema} instance 
 * @param {String} path to the follower of the join
 * @param {Object} the type of the join
 * @param {Object} the target svhema of the join
 * @param {Object} the options for the join
 * @return {Object} the constructed {@link JoinType}
 * @throws {JoinError} if there type cannot be resolved
 * @api private
 */
var buildJoin = function (schema, path, type, target, options) {
	if (!('JoinTypes' in schema.constructor))
		throw new JoinError (path, "no such join type registered");
	var actual = schema.constructor.JoinTypes[type.name];
	if (actual == undefined)
		throw new JoinError (path, "no such join type registered");
	if (options == null) options = {};
	options.target = target;
	return new actual(path, options);
};

/**
 * Function that will either return a named join (if arity 1) or install
 * a new join with a given definition.
 *
 * @param {String} the path that the join is installed on
 * @param {Object} the definition of the join
 * @return {Object} the join
 * @throws {JoinError} if there is an error installing a join
 * @api public
 */
var join = function (path, type, target, options) {
	if (type == undefined) {
		if (!('joins' in this)) return null;
		return this.joins[path];
	} else {
		if (!('joins' in this)) this.joins = {};
		var join = buildJoin (this, path, type, target, options);
		// Install the join in a virtual path 
		this.virtual(path).get(function () {return join.bind(this);});
		return (this.joins[path] = join);
	}
};


/**
 * Installer that installs a plugin into the mongoose infrastructure
 *
 * @param {Mongoose} the active Mongoose instance for installation
 * @api public
*/
exports.install = function (mongoose) {
	mongoose.Schema.prototype.join = join;
}