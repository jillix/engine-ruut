var Ruut = require("./lib/ruut");
var Routes = require("./lib/routes");

// default init options
var defaultOptions = {
    routes: {},
    autocheck: true,
    customData: {}
};

function routeDefOptions (options, data) {
    var routeOptions = {
        url: null,
        noEmit: false
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

exports.init = function (config, ready) {
    var self = this;

    // init streams
    self._streams = {};

    // define the config
    Object.keys(defaultOptions).forEach(function (key) {
        self._config[key] = self._config[key] || defaultOptions[key];
    });

    // initialize the routes
    Routes.init.call(self);

    // initialize the router
    self.router = Ruut(self._config.routes);

    global.addEventListener("popstate", Routes.check.bind(self, null));

    // everything has been initialized
    ready();

    if (self._config.autocheck) {
        Routes.check.call(self, null);
    }
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

    Routes.check.call(self);
    next(null, data);
};
