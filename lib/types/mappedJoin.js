/**
 * lib/types/fkJoin.js - the FK join type
 *
 * Copyright 2011, Stuart Hudson <goulash1971@yahoo.com>
 * Released under the terms of the MIT License.
 * 
 * Version 0.0.1
 */
var mongoose = require("mongoose");
var JoinType = require("../jointype");


var JoinError = JoinType.JoinError;
var FollowerError = JoinType.FollowerError;
var ConstraintErrpr = JoinType.ConstraintError;


/**
 * Utility that builds the follower function for a given join definition
 *
 * @param {Object} the {@link JoinType} representing the join
 * @result {Function} a join follower
 * @throws FollowerError if the target schema is missing
 * @throws ConstraintError if the join is not nullable and no/empty result found
 * @api private
 */
var buildFollower = function (join) {
	var mapping = join.mappedBy;
	return function (model, callback) {
		var query = {};
		for (var i in mapping.to)
			query[mapping.to[i]] = model[mapping.from[i]];
		var target = model.db.model(join.targetSchema);
		if ((target == undefined) || (target == null)) {
			callback(new FollowerError(join.path, "target schema missing"));
		} else {
			if (this.resultSet) {
				if (join.nullOk) {
					target.find(query, callback);
				} else {
					target.find(query,  function (err, val) {
						if (err) callback(err);
						else if ((val == undefined) || (val == null))
							callback (new ConstraintError(join.path, "is null"));
						else if (val[0] == undefined)
							callback (new ConstraintError(join.path, "is null"), val);
						else callback(err, val);
					});
				}
			} else {
				if (this.nullOk) {
					target.findOne(query, callback);
				} else {
					target.findOne(query, function (err, val) {
						if (err) callback(err);
						else if ((val == undefined) || (val == null))
							callback (new ConstraintError(join.path, "is null"), val);
						else callback(err, val);
					});
				}
			}
		}
	}
}

/**
 * Utility function that will identify if the object is an array or not
 *
 * @param {Object} object to be tested
 * @result {Boolean} either true (array) or false (not array)
 * @api private
 */
var isArray = Array.isArray || function(obj) {
	return toString.call(obj) === '[object Array]';
};

/**
 * Loader that loads the join type into the mongoose infrastructure
 *
 * @param {Mongoose} the active Mongoose instance for installation
 * @result {Object} the join type that is loaded
 * @api public
 */
exports.loadType = function (mongoose) {
	// Ensure that there are join types
	if (!('JoinTypes' in mongoose))
		mongoose.JoinTypes = {};
	if (!('JoinTypes' in mongoose.Schema))
		mongoose.Schema.JoinTypes = {};

	// Constructor for join type
	function MappedJoin (path, options) {
		JoinType.call(this, path, options);
		this._follower = null;
	};

	// Direct inheritence from join type
	MappedJoin.prototype.__proto__ = JoinType.prototype;

	// Initialise and validate the mapping definition
	MappedJoin.prototype.initMapping = function (val) {
		this._follower = null;
		if (typeof val === 'string')
			return {to: [val], from: [val]};
		var to = val.to;
		if ((to == undefined) || (to == null))
			throw new JoinError(this.path, "no 'to' field defined");
		if (!isArray(to)) to = [to];
		var from = val.from;
		if ((from == undefined) || (from == null))
			throw new JoinError(this.path, "no 'from' field defined");
		if (!isArray(from)) from = [from];
		if (to.length !== from.length)
			throw new JoinError(this.path, "'to' & 'from' mismatch");
		return {to: to, from: from};
	};

	// The join follower performs query by dbref
	MappedJoin.prototype.follow = function (model, callback) {
		if (this._follower === null)
			this._follower = buildFollower (this);
		return this._follower(model, callback);
	};
	
	// Perform the installation
	mongoose.JoinTypes.MappedJoin = MappedJoin;
	mongoose.Schema.JoinTypes.MappedJoin = MappedJoin;

	// Return the type loaded
	return MappedJoin;
}
