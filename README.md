jQuery Deferreds for nodejs
===========================
jQuery Deferreds source and unit tests ported verbatim to nodejs using minimal, automated, code transformation.

### Rationale

This is the exact same code, running the exact same unit tests. Why use a bad copy when you can use the original?

### Installation

* use npm: `npm install git://github.com/gaelazzo/jsDeferred`
* or put JQDeferred as a dependency in `package.json`.

### Using

`var Deferred = require( "jsDeferred" );`

### Correspondences

| jQuery        | jsDeferred           |
| -------------:|:--------------------:|
| `$.Deferred`  | `Deferred`           |
| `$.when`      | `Deferred.when`      |
| `$.Callbacks` | `Deferred.Callbacks` |

`_Deferred` only available prior to 1.7.0

`Callbacks` only available as of 1.7.0.

### Documentation

Just head to the [jQuery API site](http://api.jquery.com/):
* [`Deferred`](http://api.jquery.com/category/deferred-object/)
* [`Callbacks`](http://api.jquery.com/category/callbacks-object/)

