/**
 * lib/types/fkJoin.js - the FK join type
 *
 * Copyright 2011, Stuart Hudson <goulash1971@yahoo.com>
 * Released under the terms of the MIT License.
 * 
 * Version 0.0.2
 */
var mongoose = require("mongoose");
var Promise = mongoose.Promise;

var JoinType = require("../jointype");

var JoinError = JoinType.JoinError;
var FollowerError = JoinType.FollowerError;
var ConstraintErrpr = JoinType.ConstraintError;


/**
 * Utility that builds the follower function for a given join definition where
 * the join is defined such that the relationship is defined by the target
 * model i.e. the FK is stored in the target model
 *
 * @param {Object} the {@link JoinType} representing the join
 * @result {Function} a join follower
 * @throws FollowerError if the target schema is missing
 * @throws ConstraintError if the join is not nullable and no/empty result found
 * @api private
 */
var buildMappedToFollower = function (join) {
	var mapping = join.mappedBy;
	return function (model, callback) {
		var query = {};
		query[mapping.to] = model._id;
		var target = model.db.model(join.targetSchema);
		if (!callback) callback = function (err, val) { if (err) throw err; return val; };
		if ((target == undefined) || (target == null)) {
			return callback(new FollowerError(join.path, "target schema missing"));
		} else if (this.resultSet) {
			var promise = new Promise();
			if (join.nullOk) {
				promise.addBack(callback);
			} else {
				promise.addBack(function (err, val) {
					if (err) return callback (err);
					else if ((val == undefined) || (val == null))
						return callback (new ConstraintError(join.path, "is null"), val);
					else if (val[0] == undefined)
						return callback (new ConstraintError(join.path, "is null"), val);
					else return callback (null, val);
				});
			}
			return target.find(query, promise.resolve.bind(promise));
		} else {
			var promise = new Promise();
			if (this.nullOk) {
				promise.addBack(callback);
			} else {
				promise.addBack(function (err, val) {
					if (err) return callback(err);
					else if ((val == undefined) || (val == null))
						return callback (new ConstraintError(join.path, "is null"), val);
					else return callback(err, val);
				});
			}
			return target.findOne(query, promise.resolve.bind(promise));
		}
	}
}


/**
 * Utility that builds the follower function for a given join definition where
 * the join is defined such that the relationship is defined by the source
 * model i.e. teh FK is stored in the source model
 *
 * @param {Object} the {@link JoinType} representing the join
 * @result {Function} a join follower
 * @throws FollowerError if the target schema is missing
 * @throws FollowerError if a result set is required (not possible in this join)
 * @throws ConstraintError if the join is not nullable and no result found
 * @api private
 */
var buildMappedFromFollower = function (join) {
	var mapping = join.mappedBy;
	return function (model, callback) {
		var fk = model[mapping.from];
		if ((fk == undefined) || (fk == null)) {
			if (join.nullOk) return callback(null, null);
			else return callback (null, new ConstraintError(join.path, "is null"));
		} else {
			var query = {_id: fk};
			var target = model.db.model(join.targetSchema);
			if ((target == undefined) || (target == null)) {
				return callback(new FollowerError(join.path, "target schema missing"));
			} else if (this.resultSet) {
				return callback(new FollowerError(join.path, "result set impossible"));
			} else {
				var promise = new Promise();
				if (this.nullOk) {
					promise.addBack(callback);
				} else {
					promise.addBack(function (err, val) {
						if (err) return callback(err);
						else if ((val == undefined) || (val == null))
							return callback (new ConstraintError(join.path, "is null"), val);
						else return callback(err, val);
					});
				}
				return target.findOne(query, promise.resolve.bind(promise));
			}
		}
	}
}


/**
 * Utility that builds the follower function for a given join definition
 *
 * @param {Object} the {@link JoinType} representing the join
 * @result {Function} a join follower
 * @api private
 */
var buildFollower = function (join) {
	var mapping = join.mappedBy;
	if ((mapping.to != undefined) && (mapping.to != null))
		return buildMappedToFollower(join);
	return buildMappedFromFollower(join);
}

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
	function FkJoin (path, options) {
		JoinType.call(this, path, options);
		this._follower = null;
	};

	// Direct inheritence from join type
	FkJoin.prototype.__proto__ = JoinType.prototype;

	// Initialise and validate the mapping definition
	FkJoin.prototype.initMapping = function (val) {
		this._follower = null;
		if (typeof val === 'string')
			return {to: val};
		if ((val.to == undefined) || (val.to == null)) {
			if ((val.from == undefined) || (val.from == null))
				throw new JoinError(this.path, "no 'to' or 'from' field defined");
		} else if ((val.from != undefined) && (val.from != null)) {
			throw new JoinError(this.path, "only 'to' or 'from' field allowed");
		}
		return val;
	};

	// The join follower performs query by dbref
	FkJoin.prototype.follow = function (model, callback) {
		if (this._follower === null)
			this._follower = buildFollower (this);
		return this._follower(model, callback);
	};
	
	// Perform the installation
	mongoose.JoinTypes.FkJoin = FkJoin;
	mongoose.Schema.JoinTypes.FkJoin = FkJoin;

	// Return the type loaded
	return FkJoin;
}
