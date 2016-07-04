# flow-router
Router module for flow based on ruut.js.

## Docs
* * *

### route(options, data, next) 

Check if url path exist and emit flow event configured

**Parameters**

**options**: `Object`, Object containig route options (can also be added in the data object)

 - `url` (String):  The url that will be checked (required).
 - `router` (String):  The name of the configured router that will be used to check the url. Default value can be configured (optional).
 - `notDefined` (String):  What event to emit if route is not configured. Default value can be configured. (optional).
 - `end` (Boolean):  End stream after event is emited (optional).

**data**: `Object`, Object containig the route data

**next**: `function`, The next function.

### Config example

```JSON
{
    "notDefined": "__404",
    "defaultRouter": "main",
    "routers": {
        "main": {
            ...
        },
        "second": {
            ...
        }
    }
}
```

### Call example

```JSON
{
    "flow": {
        "event": {
            "d": [
                ...
                [":flow_router/route", {
                    "url": "/some/path",
                    "router": "someConfiguredRouter",
                    "end": true,
                    "notDefined": "someEvent"
                }]
                ...
            ]
        }
    }
}
```

Data handler `options` can also be added to the data