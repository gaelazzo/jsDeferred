var Deferred = require( "../lib/jquery-deferred" ),
	jQuery = require( "../lib/jquery" );

jQuery.each( [ "", " - new operator" ], function( _, withNew ) {

	function createDeferred( fn ) {
		return withNew ? new Deferred( fn ) : Deferred( fn );
	}

	exports[ "Deferred" + withNew ] = (function( ______ ) {

		______.expect( 23 );

		var defer = createDeferred();

		______.strictEqual( defer.pipe, defer.then, "pipe is an alias of then" );

		createDeferred().resolve().done(function() {
			______.ok( true, "Success on resolve" );
			______.strictEqual( this.state(), "resolved", "Deferred is resolved (state)" );
		}).fail(function() {
			______.ok( false, "Error on resolve" );
		}).always(function() {
			______.ok( true, "Always callback on resolve" );
		});

		createDeferred().reject().done(function() {
			______.ok( false, "Success on reject" );
		}).fail(function() {
			______.ok( true, "Error on reject" );
			______.strictEqual( this.state(), "rejected", "Deferred is rejected (state)" );
		}).always(function() {
			______.ok( true, "Always callback on reject" );
		});

		createDeferred(function( defer ) {
			______.ok( this === defer, "Defer passed as this & first argument" );
			this.resolve("done");
		}).done(function( value ) {
			______.strictEqual( value, "done", "Passed function executed" );
		});

		createDeferred(function( defer ) {
			var promise = defer.promise(),
				func = function() {},
				funcPromise = defer.promise( func );
			______.strictEqual( defer.promise(), promise, "promise is always the same" );
			______.strictEqual( funcPromise, func, "non objects get extended" );
			jQuery.each( promise, function( key ) {
				if ( !"function" === jQuery.type( promise[ key ] ) ) {
					______.ok( false, key + " is a function (" + jQuery.type( promise[ key ] ) + ")" );
				}
				if ( promise[ key ] !== func[ key ] ) {
					______.strictEqual( func[ key ], promise[ key ], key + " is the same" );
				}
			});
		});

		jQuery.expandedEach = jQuery.each;
		jQuery.expandedEach( "resolve reject".split(" "), function( _, change ) {
			createDeferred(function( defer ) {
				______.strictEqual( defer.state(), "pending", "pending after creation" );
				var checked = 0;
				defer.progress(function( value ) {
					______.strictEqual( value, checked, "Progress: right value (" + value + ") received" );
				});
				for ( checked = 0; checked < 3; checked++ ) {
					defer.notify( checked );
				}
				______.strictEqual( defer.state(), "pending", "pending after notification" );
				defer[ change ]();
				______.notStrictEqual( defer.state(), "pending", "not pending after " + change );
				defer.notify();
			});
		});

		______.done();
	});
});


exports[ "Deferred - chainability" ] = (function( ______ ) {

	var defer = Deferred();

	______.expect( 10 );

	jQuery.expandedEach = jQuery.each;
	jQuery.expandedEach( "resolve reject notify resolveWith rejectWith notifyWith done fail progress always".split(" "), function( _, method ) {
		var object = {
			m: defer[ method ]
		};
		______.strictEqual( object.m(), object, method + " is chainable" );
	});

	______.done();
});

exports[ "Deferred.then - filtering (done)" ] = (function( ______ ) {

	______.expect( 4 );

	var value1, value2, value3,
		defer = Deferred(),
		piped = defer.then(function( a, b ) {
			return a * b;
		});

	piped.done(function( result ) {
		value3 = result;
	});

	defer.done(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.resolve( 2, 3 );

	______.strictEqual( value1, 2, "first resolve value ok" );
	______.strictEqual( value2, 3, "second resolve value ok" );
	______.strictEqual( value3, 6, "result of filter ok" );

	Deferred().reject().then(function() {
		______.ok( false, "then should not be called on reject" );
	});

	Deferred().resolve().then( jQuery.noop ).done(function( value ) {
		______.strictEqual( value, undefined, "then done callback can return undefined/null" );
	});

	______.done();
});

exports[ "Deferred.then - filtering (fail)" ] = (function( ______ ) {

	______.expect( 4 );

	var value1, value2, value3,
		defer = Deferred(),
		piped = defer.then( null, function( a, b ) {
			return a * b;
		});

	piped.fail(function( result ) {
		value3 = result;
	});

	defer.fail(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.reject( 2, 3 );

	______.strictEqual( value1, 2, "first reject value ok" );
	______.strictEqual( value2, 3, "second reject value ok" );
	______.strictEqual( value3, 6, "result of filter ok" );

	Deferred().resolve().then( null, function() {
		______.ok( false, "then should not be called on resolve" );
	});

	Deferred().reject().then( null, jQuery.noop ).fail(function( value ) {
		______.strictEqual( value, undefined, "then fail callback can return undefined/null" );
	});

	______.done();
});

exports[ "Deferred.then - filtering (progress)" ] = (function( ______ ) {

	______.expect( 3 );

	var value1, value2, value3,
		defer = Deferred(),
		piped = defer.then( null, null, function( a, b ) {
			return a * b;
		});

	piped.progress(function( result ) {
		value3 = result;
	});

	defer.progress(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.notify( 2, 3 );

	______.strictEqual( value1, 2, "first progress value ok" );
	______.strictEqual( value2, 3, "second progress value ok" );
	______.strictEqual( value3, 6, "result of filter ok" );

	______.done();
});

exports[ "Deferred.then - deferred (done)" ] = (function( ______ ) {

	______.expect( 3 );

	var value1, value2, value3,
		defer = Deferred(),
		piped = defer.then(function( a, b ) {
			return Deferred(function( defer ) {
				defer.reject( a * b );
			});
		});

	piped.fail(function( result ) {
		value3 = result;
	});

	defer.done(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.resolve( 2, 3 );

	______.strictEqual( value1, 2, "first resolve value ok" );
	______.strictEqual( value2, 3, "second resolve value ok" );
	______.strictEqual( value3, 6, "result of filter ok" );

	______.done();
});

exports[ "Deferred.then - deferred (fail)" ] = (function( ______ ) {

	______.expect( 3 );

	var value1, value2, value3,
		defer = Deferred(),
		piped = defer.then( null, function( a, b ) {
			return Deferred(function( defer ) {
				defer.resolve( a * b );
			});
		});

	piped.done(function( result ) {
		value3 = result;
	});

	defer.fail(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.reject( 2, 3 );

	______.strictEqual( value1, 2, "first reject value ok" );
	______.strictEqual( value2, 3, "second reject value ok" );
	______.strictEqual( value3, 6, "result of filter ok" );

	______.done();
});

exports[ "Deferred.then - deferred (progress)" ] = (function( ______ ) {

	______.expect( 3 );

	var value1, value2, value3,
		defer = Deferred(),
		piped = defer.then( null, null, function( a, b ) {
			return Deferred(function( defer ) {
				defer.resolve( a * b );
			});
		});

	piped.done(function( result ) {
		value3 = result;
	});

	defer.progress(function( a, b ) {
		value1 = a;
		value2 = b;
	});

	defer.notify( 2, 3 );

	______.strictEqual( value1, 2, "first progress value ok" );
	______.strictEqual( value2, 3, "second progress value ok" );
	______.strictEqual( value3, 6, "result of filter ok" );

	______.done();
});

exports[ "Deferred.then - context" ] = (function( ______ ) {

	______.expect( 7 );

	var defer, piped, defer2, piped2,
		context = {};

	Deferred().resolveWith( context, [ 2 ] ).then(function( value ) {
		return value * 3;
	}).done(function( value ) {
		______.strictEqual( this, context, "custom context correctly propagated" );
		______.strictEqual( value, 6, "proper value received" );
	});

	Deferred().resolve().then(function() {
		return Deferred().resolveWith(context);
	}).done(function() {
		______.strictEqual( this, context, "custom context of returned deferred correctly propagated" );
	});

	defer = Deferred();
	piped = defer.then(function( value ) {
		return value * 3;
	});

	defer.resolve( 2 );

	piped.done(function( value ) {
		______.strictEqual( this, piped, "default context gets updated to latest promise in the chain" );
		______.strictEqual( value, 6, "proper value received" );
	});

	defer2 = Deferred();
	piped2 = defer2.then();

	defer2.resolve( 2 );

	piped2.done(function( value ) {
		______.strictEqual( this, piped2, "default context gets updated to latest promise in the chain (without passing function)" );
		______.strictEqual( value, 2, "proper value received (without passing function)" );
	});

	______.done();
});

exports[ "Deferred.when" ] = (function( ______ ) {

	______.expect( 37 );

	// Some other objects
	jQuery.each({
		"an empty string": "",
		"a non-empty string": "some string",
		"zero": 0,
		"a number other than zero": 1,
		"true": true,
		"false": false,
		"null": null,
		"undefined": undefined,
		"a plain object": {},
		"an array": [ 1, 2, 3 ]

	}, function( message, value ) {
		______.ok(
			"function" === jQuery.type(
				Deferred.when( value ).done(function( resolveValue ) {
					______.strictEqual( this, global, "Context is the global object with " + message );
					______.strictEqual( resolveValue, value, "Test the promise was resolved with " + message );
				}).promise
			),
			"Test " + message + " triggers the creation of a new Promise"
		);
	});

	______.ok(
		"function" === jQuery.type(
			Deferred.when().done(function( resolveValue ) {
				______.strictEqual( this, global, "Test the promise was resolved with global as its context" );
				______.strictEqual( resolveValue, undefined, "Test the promise was resolved with no parameter" );
			}).promise
		),
		"Test calling when with no parameter triggers the creation of a new Promise"
	);

	var cache,
		context = {};

	Deferred.when( Deferred().resolveWith( context ) ).done(function() {
		______.strictEqual( this, context, "when( promise ) propagates context" );
	});

	jQuery.each([ 1, 2, 3 ], function( k, i ) {

		Deferred.when( cache || Deferred(function() {
				this.resolve( i );
			})
		).done(function( value ) {

			______.strictEqual( value, 1, "Function executed" + ( i > 1 ? " only once" : "" ) );
			cache = value;
		});

	});

	______.done();
});

exports[ "Deferred.when - joined" ] = (function( ______ ) {

	______.expect( 119 );

	var deferreds = {
			value: 1,
			success: Deferred().resolve( 1 ),
			error: Deferred().reject( 0 ),
			futureSuccess: Deferred().notify( true ),
			futureError: Deferred().notify( true ),
			notify: Deferred().notify( true )
		},
		willSucceed = {
			value: true,
			success: true,
			futureSuccess: true
		},
		willError = {
			error: true,
			futureError: true
		},
		willNotify = {
			futureSuccess: true,
			futureError: true,
			notify: true
		};

	jQuery.each( deferreds, function( id1, defer1 ) {
		jQuery.each( deferreds, function( id2, defer2 ) {
			var shouldResolve = willSucceed[ id1 ] && willSucceed[ id2 ],
				shouldError = willError[ id1 ] || willError[ id2 ],
				shouldNotify = willNotify[ id1 ] || willNotify[ id2 ],
				expected = shouldResolve ? [ 1, 1 ] : [ 0, undefined ],
				expectedNotify = shouldNotify && [ willNotify[ id1 ], willNotify[ id2 ] ],
				code = id1 + "/" + id2,
				context1 = defer1 && "function" === jQuery.type( defer1.promise ) ? defer1.promise() : undefined,
				context2 = defer2 && "function" === jQuery.type( defer2.promise ) ? defer2.promise() : undefined;

			Deferred.when( defer1, defer2 ).done(function( a, b ) {
				if ( shouldResolve ) {
					______.deepEqual( [ a, b ], expected, code + " => resolve" );
					______.strictEqual( this[ 0 ], context1, code + " => first context OK" );
					______.strictEqual( this[ 1 ], context2, code + " => second context OK" );
				} else {
					______.ok( false,  code + " => resolve" );
				}
			}).fail(function( a, b ) {
				if ( shouldError ) {
					______.deepEqual( [ a, b ], expected, code + " => reject" );
				} else {
					______.ok( false, code + " => reject" );
				}
			}).progress(function( a, b ) {
				______.deepEqual( [ a, b ], expectedNotify, code + " => progress" );
				______.strictEqual( this[ 0 ], expectedNotify[ 0 ] ? context1 : undefined, code + " => first context OK" );
				______.strictEqual( this[ 1 ], expectedNotify[ 1 ] ? context2 : undefined, code + " => second context OK" );
			});
		});
	});
	deferreds.futureSuccess.resolve( 1 );
	deferreds.futureError.reject( 0 );

	______.done();
});
