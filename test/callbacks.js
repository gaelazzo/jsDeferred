var Deferred = require( "../lib/jquery-deferred" ),
	jQuery = require( "../lib/jquery" );

(function() {

var output,
	addToOutput = function( string ) {
		return function() {
			output += string;
		};
	},
	outputA = addToOutput("A"),
	outputB = addToOutput("B"),
	outputC = addToOutput("C"),
	tests = {
		"":                   "XABC   X     XABCABCC  X  XBB X   XABA  X   XX",
		"once":               "XABC   X     X         X  X   X   XABA  X   XX",
		"memory":             "XABC   XABC  XABCABCCC XA XBB XB  XABA  XC  XX",
		"unique":             "XABC   X     XABCA     X  XBB X   XAB   X   X",
		"stopOnFalse":        "XABC   X     XABCABCC  X  XBB X   XA    X   XX",
		"once memory":        "XABC   XABC  X         XA X   XA  XABA  XC  XX",
		"once unique":        "XABC   X     X         X  X   X   XAB   X   X",
		"once stopOnFalse":   "XABC   X     X         X  X   X   XA    X   XX",
		"memory unique":      "XABC   XA    XABCA     XA XBB XB  XAB   XC  X",
		"memory stopOnFalse": "XABC   XABC  XABCABCCC XA XBB XB  XA    X   XX",
		"unique stopOnFalse": "XABC   X     XABCA     X  XBB X   XA    X   X"
	},
	filters = {
		"no filter": undefined,
		"filter": function( fn ) {
			return function() {
				return fn.apply( this, arguments );
			};
		}
	};

	function showFlags( flags ) {
		if ( typeof flags === "string" ) {
			return "'" + flags + "'";
		}
		var output = [], key;
		for ( key in flags ) {
			output.push( "'" + key + "': " + flags[ key ] );
		}
		return "{ " + output.join( ", " ) + " }";
	}

jQuery.each( tests, function( strFlags, resultString ) {

		var objectFlags = {};

		jQuery.each( strFlags.split( " " ), function() {
			if ( this.length ) {
				objectFlags[ this ] = true;
			}
		});

		jQuery.each( filters, function( filterLabel ) {

			jQuery.each({
				"string": strFlags,
				"object": objectFlags
			}, function( flagsTypes, flags ) {

				exports[ "Deferred.Callbacks( " + showFlags( flags ) + " ) - " + filterLabel ] = (function( ______ ) {

					______.expect( 21 );

					// Give qunit a little breathing room
					setTimeout( ______.done, 0 );

					var cblist,
						results = resultString.split( /\s+/ );

					// Basic binding and firing
					output = "X";
					cblist = Deferred.Callbacks( flags );
					cblist.add(function( str ) {
						output += str;
					});
					cblist.fire("A");
					______.strictEqual( output, "XA", "Basic binding and firing" );
					______.strictEqual( cblist.fired(), true, ".fired() detects firing" );
					output = "X";
					cblist.disable();
					cblist.add(function( str ) {
						output += str;
					});
					______.strictEqual( output, "X", "Adding a callback after disabling" );
					cblist.fire("A");
					______.strictEqual( output, "X", "Firing after disabling" );

					// #13517 - Emptying while firing
					cblist = Deferred.Callbacks( flags );
					cblist.add( cblist.empty );
					cblist.add( function() {
						______.ok( false, "not emptied" );
					} );
					cblist.fire();

					// Disabling while firing
					cblist = Deferred.Callbacks( flags );
					cblist.add( cblist.disable );
					cblist.add( function() {
						______.ok( false, "not disabled" );
					} );
					cblist.fire();

					// Basic binding and firing (context, arguments)
					output = "X";
					cblist = Deferred.Callbacks( flags );
					cblist.add(function() {
						______.equal( this, global, "Basic binding and firing (context)" );
						output += Array.prototype.join.call( arguments, "" );
					});
					cblist.fireWith( global, [ "A", "B" ] );
					______.strictEqual( output, "XAB", "Basic binding and firing (arguments)" );

					// fireWith with no arguments
					output = "";
					cblist = Deferred.Callbacks( flags );
					cblist.add(function() {
						______.equal( this, global, "fireWith with no arguments (context is global)" );
						______.strictEqual( arguments.length, 0, "fireWith with no arguments (no arguments)" );
					});
					cblist.fireWith();

					// Basic binding, removing and firing
					output = "X";
					cblist = Deferred.Callbacks( flags );
					cblist.add( outputA, outputB, outputC );
					cblist.remove( outputB, outputC );
					cblist.fire();
					______.strictEqual( output, "XA", "Basic binding, removing and firing" );

					// Empty
					output = "X";
					cblist = Deferred.Callbacks( flags );
					cblist.add( outputA );
					cblist.add( outputB );
					cblist.add( outputC );
					cblist.empty();
					cblist.fire();
					______.strictEqual( output, "X", "Empty" );

					// Locking
					output = "X";
					cblist = Deferred.Callbacks( flags );
					cblist.add(function( str ) {
						output += str;
					});
					cblist.lock();
					cblist.add(function( str ) {
						output += str;
					});
					cblist.fire("A");
					cblist.add(function( str ) {
						output += str;
					});
					______.strictEqual( output, "X", "Lock early" );

					// Ordering
					output = "X";
					cblist = Deferred.Callbacks( flags );
					cblist.add(function() {
						cblist.add( outputC );
						outputA();
					}, outputB );
					cblist.fire();
					______.strictEqual( output, results.shift(), "Proper ordering" );

					// Add and fire again
					output = "X";
					cblist.add(function() {
						cblist.add( outputC );
						outputA();
					}, outputB );
					______.strictEqual( output, results.shift(), "Add after fire" );

					output = "X";
					cblist.fire();
					______.strictEqual( output, results.shift(), "Fire again" );

					// Multiple fire
					output = "X";
					cblist = Deferred.Callbacks( flags );
					cblist.add(function( str ) {
						output += str;
					});
					cblist.fire("A");
					______.strictEqual( output, "XA", "Multiple fire (first fire)" );
					output = "X";
					cblist.add(function( str ) {
						output += str;
					});
					______.strictEqual( output, results.shift(), "Multiple fire (first new callback)" );
					output = "X";
					cblist.fire("B");
					______.strictEqual( output, results.shift(), "Multiple fire (second fire)" );
					output = "X";
					cblist.add(function( str ) {
						output += str;
					});
					______.strictEqual( output, results.shift(), "Multiple fire (second new callback)" );

					// Return false
					output = "X";
					cblist = Deferred.Callbacks( flags );
					cblist.add( outputA, function() { return false; }, outputB );
					cblist.add( outputA );
					cblist.fire();
					______.strictEqual( output, results.shift(), "Callback returning false" );

					// Add another callback (to control lists with memory do not fire anymore)
					output = "X";
					cblist.add( outputC );
					______.strictEqual( output, results.shift(), "Adding a callback after one returned false" );

					// Callbacks are not iterated
					output = "";
					function handler() {
						output += "X";
					}
					handler.method = function() {
						output += "!";
					};
					cblist = Deferred.Callbacks( flags );
					cblist.add( handler );
					cblist.add( handler );
					cblist.fire();
					______.strictEqual( output, results.shift(), "No callback iteration" );
				});
			});
		});
});

})();

exports[ "Deferred.Callbacks( options ) - options are copied" ] = (function( ______ ) {

	______.expect( 1 );

	var options = {
			"unique": true
		},
		cb = Deferred.Callbacks( options ),
		count = 0,
		fn = function() {
			______.ok( !( count++ ), "called once" );
		};
	options["unique"] = false;
	cb.add( fn, fn );
	cb.fire();

	______.done();
});

exports[ "Deferred.Callbacks.fireWith - arguments are copied" ] = (function( ______ ) {

	______.expect( 1 );

	var cb = Deferred.Callbacks("memory"),
		args = ["hello"];

	cb.fireWith( null, args );
	args[ 0 ] = "world";

	cb.add(function( hello ) {
		______.strictEqual( hello, "hello", "arguments are copied internally" );
	});

	______.done();
});

exports[ "Deferred.Callbacks.remove - should remove all instances" ] = (function( ______ ) {

	______.expect( 1 );

	var cb = Deferred.Callbacks();

	function fn() {
		______.ok( false, "function wasn't removed" );
	}

	cb.add( fn, fn, function() {
		______.ok( true, "end of test" );
	}).remove( fn ).fire();

	______.done();
});

exports[ "Deferred.Callbacks.has" ] = (function( ______ ) {

	______.expect( 13 );

	var cb = Deferred.Callbacks();
	function getA() {
		return "A";
	}
	function getB() {
		return "B";
	}
	function getC() {
		return "C";
	}
	cb.add(getA, getB, getC);
	______.strictEqual( cb.has(), true, "No arguments to .has() returns whether callback function(s) are attached or not" );
	______.strictEqual( cb.has(getA), true, "Check if a specific callback function is in the Callbacks list" );

	cb.remove(getB);
	______.strictEqual( cb.has(getB), false, "Remove a specific callback function and make sure its no longer there" );
	______.strictEqual( cb.has(getA), true, "Remove a specific callback function and make sure other callback function is still there" );

	cb.empty();
	______.strictEqual( cb.has(), false, "Empty list and make sure there are no callback function(s)" );
	______.strictEqual( cb.has(getA), false, "Check for a specific function in an empty() list" );

	cb.add(getA, getB, function(){
		______.strictEqual( cb.has(), true, "Check if list has callback function(s) from within a callback function" );
		______.strictEqual( cb.has(getA), true, "Check if list has a specific callback from within a callback function" );
	}).fire();

	______.strictEqual( cb.has(), true, "Callbacks list has callback function(s) after firing" );

	cb.disable();
	______.strictEqual( cb.has(), false, "disabled() list has no callback functions (returns false)" );
	______.strictEqual( cb.has(getA), false, "Check for a specific function in a disabled() list" );

	cb = Deferred.Callbacks("unique");
	cb.add(getA);
	cb.add(getA);
	______.strictEqual( cb.has(), true, "Check if unique list has callback function(s) attached" );
	cb.lock();
	______.strictEqual( cb.has(), false, "locked() list is empty and returns false" );



	______.done();
});

exports[ "Deferred.Callbacks() - adding a string doesn't cause a stack overflow" ] = (function( ______ ) {

	______.expect( 1 );

	Deferred.Callbacks().add( "hello world" );

	______.ok( true, "no stack overflow" );

	______.done();
});
