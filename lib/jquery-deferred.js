var jQuery = require( "./jquery" );

var slice = Array.prototype.slice;

/**
 * @module DeferredModule
 */



/** @namespace Deferred.when */
/** @namespace Deferred.promise */
/** @namespace Deferred.resolve */
/** @namespace Deferred.reject */
/** @namespace Deferred.notify */



/** @namespace Promise.then */
/** @namespace Promise.done */
/** @namespace Promise.fail */
/** @namespace Promise.progress */


var Deferred = module.exports = function( func ) {


	var tuples = [
			// action, add listener, listener list, final state
			["resolve", "done", Deferred.Callbacks("once memory"), "resolved"],
			["reject", "fail", Deferred.Callbacks("once memory"), "rejected"],
			["notify", "progress", Deferred.Callbacks("memory")]
		],
		state = "pending",


		/**
		 * @class Promise
		 */
		promise = {
			/**
			 * Add handlers to be called when the Deferred object is rejected.
			 * The deferred.fail() method accepts one or more arguments, all of which can be either a single function
			 *  or an array of functions. When the Deferred is rejected, the failCallbacks are called.
			 * @method fail
			 * @param {Function|Function[]}failCallbacks
			 * @return {Deferred}
			 */
			fail: undefined,


			/**
			 *  Determine the current state of a Deferred object.
			 * @method state
			 * @returns 'pending'|'resolved'|'rejected'
			 *
			 */
			state: function () {
				return state;
			},

			/**
			 * Add handlers to be called when the Deferred object is resolved.
			 * The deferred.done() method accepts one or more arguments, all of which can be either a single function or an
			 *  array of functions. When the Deferred is resolved, the doneCallbacks are called.
			 *  Callbacks are executed in the order they were added.
			 * @method done
			 * @param {Function|Function[]} doneCallbacks
			 * @return {Deferred}
			 */
			done:undefined,



			/**
			 * Add handlers to be called when the Deferred object generates progress notifications.
			 * @method progress
			 * @param {Function|Function[]}  progressCallbacks
			 *   A function, or array of functions, to be called when the Deferred.notify() is called.
			 * @return {*}
			 */
			 progress:undefined,


			/**
			 * Add handlers to be called when the Deferred object is either resolved or rejected.
			 * The deferred.always() method receives the arguments that were used to .resolve() or .reject() the Deferred object,
			 *  which are often very different.
			 * @method always
			 * @param {Function|Function[]}   alwaysCallbacks
			 *   A function, or array of functions, that is called when the Deferred is resolved or rejected.
			 * @return {*}
			 */
			always: function () {
				deferred.done(arguments).fail(arguments);
				return this;
			},


			/**
			 * @method then
			 * @param {Function|null} doneFilter A function that is called when the Deferred is resolved.
			 * @param {Function|null} [failFilter]  An optional function that is called when the Deferred is rejected.
			 * @param {Function|null} [progressFilter] An optional function that is called when progress notifications are sent.
			 * @return {*}
			 */
			then: function (/* fnDone, fnFail, fnProgress */) {
				var fns = arguments;
				return Deferred(function (newDefer) {
					jQuery.each(tuples, function (i, tuple) {
						var fn = "function" === jQuery.type(fns[i]) && fns[i];
						// deferred[ done | fail | progress ] for forwarding actions to newDefer
						deferred[tuple[1]](function () {
							var returned = fn && fn.apply(this, arguments);
							if (returned && "function" === jQuery.type(returned.promise)) {
								returned.promise()
									.done(newDefer.resolve)
									.fail(newDefer.reject)
									.progress(newDefer.notify);
							} else {
								newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
							}
						});
					});
					fns = null;
				}).promise();
			},
			// Get a promise for this deferred
			// If obj is provided, the promise aspect is added to the object
			promise: function (obj) {
				return obj != null ? jQuery.extend(obj, promise) : promise;
			}
		},


		/**
		 * @class Deferred
		 * The Deferred object is chainable, similar to the way a jQuery object is chainable, but it has its own methods.
		 * After creating a Deferred object, you can use any of the methods below by either chaining directly from the object
		 * creation or saving the object in a variable and invoking one or more methods on that variable.
		 */

		deferred = {

			/**
			 * Reject a Deferred object and call any failCallbacks with the given args.
			 * @method reject
			 * @param {object} args Optional arguments that are passed to the failCallbacks.
			 * @return {*}
			 */
			reject: undefined,


			/**
			 * Return a Deferred's Promise object.
			 * @method promise
			 * @return {Promise}
			 */
			promise: undefined,


			/**
			 * Call the progressCallbacks on a Deferred object with the given args.
			 * @method notify
			 * @param {Object}  args Optional arguments that are passed to the progressCallbacks.
			 * @return {*}
			 */

			notify: undefined,


			/**
			 * Resolve a Deferred object and call any doneCallbacks with the given args.
			 * @method resolve
			 * @param {object} args
			 * @return {*}
			 */
			resolve: undefined
		};

	// Keep pipe for back-compat
	promise.pipe = promise.then;

	// Add list-specific methods
	jQuery.each(tuples, function (i, tuple) {
		var list = tuple[2],
			stateString = tuple[3];

		// promise[ done | fail | progress ] = list.add
		promise[tuple[1]] = list.add;

		// Handle state
		if (stateString) {
			list.add(function () {
				// state = [ resolved | rejected ]
				state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
			}, tuples[i ^ 1][2].disable, tuples[2][2].lock);
		}

		// deferred[ resolve | reject | notify ]
		deferred[tuple[0]] = function () {
			deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
			return this;
		};
		deferred[tuple[0] + "With"] = list.fireWith;
	});

	// Make the deferred a promise
	promise.promise(deferred);

	// Call given func if any
	if (func) {
		func.call(deferred, deferred);
	}

	// All done!
	return deferred;
};













/**
 * Provides a way to execute callback functions based on one or more objects, usually Deferred objects that represent
 *  asynchronous events.
 * @method when
 * @param {Deferred[]} deferreds One or more Deferred objects, or plain JavaScript objects. Plain objects are treated
 *  as resolved Deferred and any doneCallbacks attached will be executed immediately
 * @return {Deferred} A Deferred composed of all arguments given
 */
// Deferred helper
Deferred.when = function( subordinate /* , ..., subordinateN */ ) {
	var i = 0,
		resolveValues = slice.call( arguments ),
		length = resolveValues.length,

		// the count of uncompleted subordinates
		remaining = length !== 1 || ( subordinate && "function" === jQuery.type( subordinate.promise ) ) ? length : 0,

		// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
		deferred = remaining === 1 ? subordinate : Deferred(),

		// Update function for both resolve and progress values
		updateFunc = function( i, contexts, values ) {
			return function( value ) {
				contexts[ i ] = this;
				values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
				if ( values === progressValues ) {
					deferred.notifyWith( contexts, values );
				} else if ( !( --remaining ) ) {
					deferred.resolveWith( contexts, values );
				}
			};
		},

		progressValues, progressContexts, resolveContexts;

	// add listeners to Deferred subordinates; treat others as resolved
	if ( length > 1 ) {
		progressValues = new Array( length );
		progressContexts = new Array( length );
		resolveContexts = new Array( length );
		for ( ; i < length; i++ ) {
			if ( resolveValues[ i ] && "function" === jQuery.type( resolveValues[ i ].promise ) ) {
				resolveValues[ i ].promise()
					.done( updateFunc( i, resolveContexts, resolveValues ) )
					.fail( deferred.reject )
					.progress( updateFunc( i, progressContexts, progressValues ) );
			} else {
				--remaining;
			}
		}
	}

	// if we're not waiting on anything, resolve the master
	if ( !remaining ) {
		deferred.resolveWith( resolveContexts, resolveValues );
	}

	return deferred.promise();
};

var rnotwhite = /\S+/g;

// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
Deferred.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( list, arg, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( list, fn ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
