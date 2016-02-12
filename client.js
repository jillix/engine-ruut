var Ruut = require("ruut");

exports.init = function (config, ready) {

    // initialize the router
    this.router = Ruut(config.home, config.routes);

    global.addEventListener("popstate", checkRoute.bind(self, null));

    // everything has been initialized
    ready();
};

/**
 * Emit a new route
 *
 * @public
 * @param {object} The _options object.
 * @param {object} The data function.
 * @param {function} The next function.
*/
exports.route = function (options, data, next) {

    if (!options.url) {
        return next(null, data);
    }

    global.history.pushState(0, 0, options.url);
    this.route(options.url);

    next(null, data);
};
