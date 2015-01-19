Weppy
=====

Weppy is a client-side library for reporting performance data. It can automatically collect page load data
using window.performance API and allows any other metric to be reported as well.

Weppy is heavily inspired by [BuckyClient](https://github.com/HubSpot/BuckyClient). However it puts more focus into
structure of the reported data, allows custom attributes to be reported with the measurement itself and supports
sending the page context with all the measurements done on a page. See (comparison with Bucky)[#Comparison with Bucky]
for more details.

Example code
------------

You can get the following data reported to the server:
```json
{
	"context": {
		"url": "http://my.domain.com/article/Some_great_article",
		"skin": "modern"
		"user-agent": "Whatever User Agent the visitor has"
	},
	"data": {
		"Lightbox.open": [
			[ 0.24, { "image-count": 12 } ],
			[ 0.12, { "image-count": 3 } ]
		],
		"pageview.fromuser.Testuser": {
			[ 1 ]
		}
	}
}
```

by using code like this:
```html
<script src="weppy.js"></script>
<script type="text/javascript">
	Weppy.setOptions({
		context: {
			url: window.location.href.split('#')[0],
			skin: window.myApp.skinName,
			'user-agent': window.navigator.userAgent
		}
	});

	// report page view from logger in user
	Weppy.count('pageview.fromuser.'+window.myApp.userName);

	// handle Lightbox metrics
	var lightboxMetrics = Weppy('Lightbox');

	var openTimer = lightboxMetrics.timer.start('open');
	// do some ajax call
	ajax_call(function(response){
		openTimer.stop({
			'image-count': response.imagesCount
		});
	});
	// ... and then user opens two lightboxes during session: first with 12 images and second with 3 images
</script>
```

API
---

Weppy API can be accessed using a global variable named `Weppy` or `window.Weppy` and has the following methods:

### .setOptions( options )
Update global configuration. See (options)[#Options reference]

### .into( path )
Create and return a new Weppy object bound to a prefix with appended `path` at the end. 

### .namespace( namespace, path )
Create and return a new Weppy object bound to a different `namespace` and with specified prefix `path`. Both
arguments can be an empty string meaning either selecting a default namespace or empty prefix.

### .count( name, value = 1, annotations = null )
Add a new measurement `name` (type: "counter") with `value` and optional `annotations`.

### .store( name, value = 1, annotations = null )
Add a new measurement `name` (type: "gauge") with `value` and optional `annotations`.

### .sendPagePerformance()
Instruct Weppy to report all metrics available in window.performance API as soon as DOMContentLoaded event is fired.

### .timer.start( name, annotations = null )
Start a new timer `name` with optional `annotations`. Return `Timer` object for convenience.

### .timer.stop( name, annotations = null )
Stop a timer `name` and add a new measurement `name` (type: "timer"). Extend previously defined annotations 
with `annotations`.

### .timer.send( name, duration, annotations = null )
Add a new measurement `name` (type: "timer") with `duration` and optional `annotations`.

### .timer.annotate( name, annotations )
Update annotations of currently running timer `name` with `annotations`.

### .timer.mark( name, annotations = null )
Add a new measurement `name` (type: "timer") with the time passed after `window.performance.navigationStart` with
optional `annotations`.

### .timer.time( name, action, scope, args, annotations = null )
Call a function `action` with `scope` and arguments `args` prepended by a callback that should be called when the
asynchronous operation finishes. The callback takes one optional parameter `annotations` that are appended if specified.
When a callback gets called add a new measurement `name` with the time of the operation and optional `annotations`.

### .timer.timeSync( name, action, scope, args, annotations = null )
Call a function `action` with `scope` and `args`. Then add a new measurement `name` (type: "timer") with the time taken 
to execute the function and optional `annotations`.

### .timer.wrap( name, action, scope, annotations = null )
Create and return a wrapper function that calls the function `action` with optional scope override with `scope`. 
Arguments and return value are passed without change.
Each time the function gets called add a new measurement `name` (type: "timer") with the time taken to execute
the function and optional `annotations`.

### <Timer>.annotate( annotations )
Update annotations of given `Timer` with `annotations`.

### <Timer>.stop( annotations = null )
Stop the timer and optionally update `annotations`. Then add a new measurement with previously specified name 
(type: "timer").

Option reference
----------------

### host
Type: string (default: "/weppy")

Absolute or relative base path for reporting data. Some automatic suffix is added, currently "/v3/store".

### transport
Type: "url" | "post" | callback (default: "url")

Transport that should be used to report collected measurements. 
See (Transport options explanation)[#Transport options] for more information.

### active
Type: boolean (default: true)

Disables Weppy completely if `active` is set to *false*.

### sample
Type: number (default: 1)

Sampling rate in the range between 0 and 1. 0 is 0%, 0.1 is 10% and 1 is 100%.

### aggregationInterval
Type: number (default: 1000)

When no new measurement is added within `aggregationInterval` ms all the previously collected data is sent to the server. 

### maxInterval
Type: number (default: 5000)

Maximum age that the measurement could have before getting reported to the server.

### decimalPrecision
Type: number (default: 3)

Time ang gauge measurements decimal precision.

### page
Type: string (default: 'index')

Page name used to report page load performance data by `sendPagePerformance()`.

### context
Type: object (default: {})

Page context that is reported along with any measurement.


Transport options
-----------------

Weppy uses "host" option (default: "/weppy") to find the base path on the server to report collected data to. Then
it adds suffix "/vX/send" where X is replaced by protocol version. It always does a POST request.

Next you need to choose a method for encoding the data using the "transport" option. You have two options right now:
- "url" (default one) - puts the entire JSON data into a single URL parameter "p", example:
  /weppy/v3/send?p=ENCODED_JSON_DATA
- "post" - does a POST request and puts the JSON data into POST data.

To be correctly precise you have the third option for processing collected metrics. If you pass a function
as a "transport" option you can take over the entire data reporting process. The normal request is not made in such
case and your function will be called every time Weppy would send a request. The single parameter will be passed
to this function containing the collected data as a plain Javascript object (exactly as in the [example](#Example)).

Comparison with Bucky
---------------------

Weppy is definitely a browser-only library while Bucky can also run in node.js environment.

Page load data are reported using different namespacing.

Binding measurements to a specific prefix is done using `Bucky('Lightbox')` in BuckyClient while you need to call
`Weppy.into('Lightbox')` in Weppy. There is also support for namespaces in Weppy using
`Weppy.namespace('MyNamespace','myprefix')` that ends up reporting `MyNamespace::myprefix.measurementname'`.

Features not present in Bucky:
- global context
- measurement annotations

Features not supported by Weppy:
- requests
- timer.stopwatch()