var Ruut = require("./lib/ruut");

function emitRoute(route, data) {
    var self = this;

    var str = self._streams[route] || (self._streams[route] = self.flow(route));
    data = Object(data);
    Object.keys(self._config.customData).forEach(function (c) {
        data[c] = data[c] || self._config.customData[c];
    });
    str.write(null, data);
}

function check (str) {
    var self = this;

    if (!self.router(str || location.pathname)) {
        emitRoute.call(self, self._config.notFound || "__404", {});
    }
};

function routeDefOptions (options, data) {
    var routeOptions = {
        url: null;
        noEmit: false;
    };

    if (typeof data === "string") {
        data.url = data;
    }
    if (typeof options === "string") {
        options.url = options;
    }

    for (var option in routeOptions) {
        var optionValue = options[option] || data[option];
        routeOptions[option] = optionValue || routeOptions[option];
    }

    return routeOptions;
}

exports.init = function () {

    var self = this;
    var config = self._config;
    var streams = self._streams = {};

    self._originalRoutes = JSON.parse(JSON.stringify(config.routes));
    self._originalRouter = Ruut(self._originalRoutes);

    function handler(obj, key) {
        var res = obj[key];
        if (typeof res === "string") {
            obj[key] = function (params) {
                emitRoute.call(self, res, {
                    params: params
                });
                return true;
            };
        }
    }

    // Normalize the routes
    function normalize(parentObj, parentKey) {
        var route = parentObj[parentKey];
        if (route === null) { return; }

        if (Array.isArray(route)) {
            handler(route, 0);
            normalize(route, 1);
            handler(route, 2);
        } else {
            Object.keys(route).forEach(function (key) {
                if (typeof route[key] === "object") {
                    return normalize(route, key);
                }
                handler(route, key);
            });
        }
    }

    normalize(config, "routes");

    self.router = Ruut(config.routes);

    if (config.autocheck) {
        check.call(self);
    }

    global.addEventListener("popstate", self.check.bind(self, null));
};

exports.route = function (_options, data, next) {
    var self = this;

    // get the route options
    var options = routeDefOptions(_options, data);

    if (!options.url) {
        return next(null, data);
    }

    global.history.pushState(0, 0, options.url);

    // do not emit the new route if noEmit option provided
    if (options.noEmit) {
        return next(null, data);
    }

    check.call(self);
    next(null, data);
};
