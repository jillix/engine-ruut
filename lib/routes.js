function emitRoute (route, data) {
    var self = this;

    // create event stream
    if (!self._streams[route]) {
        var eventStream = self.flow(route);

        var handler = function (err) {
            eventStream.i.end();
            delete self._streams[route];
        };

        // cache stream
        self._streams[route] = eventStream;

        eventStream.o.on('error', handler);
        eventStream.o.on('end', handler);
        eventStream.o.on('data', function nirvana () {});
    }

    data = Object(data);
    Object.keys(self._config.customData).forEach(function (c) {
        data[c] = data[c] || self._config.customData[c];
    });

    // emit event
    self._streams[route].i.write(data);
}

function handler (obj, key) {
    var self = this;
    var res = obj[key];

    if (typeof res == "string") {
        obj[key] = function (params) {
            emitRoute.call(self, res, params);
        }
    }
}

/**
 * Check if the route is valid
 *
 * @private
 * @param {string} The str string.
*/
exports.check = function (str) {
    var self = this;

    if (!self.router(str || location.pathname)) {
        emitRoute.call(self, self._config.notFound || "__404", {});
    }
}

/**
 * Initialize the routes
 *
 * @private
*/
exports.init = function () {
    var self = this;

    function normalize(parentObj, parentKey) {
        var route = parentObj[parentKey];
        if (route === null) { return; }

        if (Array.isArray(route)) {
            handler.call(self, route, 0);
            normalize(route, 1);
            handler.call(self, route, 2);
        } else {
            Object.keys(route).forEach(function (key) {
                if (typeof route[key] === "object") {
                    return normalize(route, key);
                }
                handler.call(self, route, key);
            });
        }
    }

    // Normalize the routes
    normalize(self._config, "routes");
};
