var Ruut = require('ruut');
var libob = require('libobject');

/**
 *  Initilizes module
 *
 *  @name init
 *  @private
 */
exports.init = function (scope, state, args, data, stream, next) {

    if (!args.routers || !libob.isObject(args.routers) || !Object.keys(args.routers).length) {
        return next(new Error('Flow-router.init: No routes in config.'));
    }

    // init the routers
    state._config = args;
    state._routers = {};
    Object.keys(args.routers).forEach(router => state._routers[router] = Ruut(args.routers[router]));

    next(null, data);
};

/**
 * Check if url path exist and emit flow event configured
 *
 * @name route
 * @function
 * @param {Object} options Object containig route options (can also be added in the data object)
 *
 *  - `url` (String):  The url that will be checked (required).
 *  - `router` (String):  The name of the configured router that will be used to check the url. Default value can be configured (optional).
 *  - `notDefined` (String):  What event to emit if route is not configured. Default value can be configured. (optional).
 *  - `end` (Boolean):  End stream after event is emited (optional).
 * @param {Object} data Object containig the route data
 * @param {Function} next The next function.
 */
exports.route = function (scope, state, args, data, stream, next) {

    // define options
    let options = {
        url: data.url || args.url || (data.req ? data.req.url : '/'),
        router: data.router || args.router || state._config.defaultRouter || 'main',
        notDefined: data.notDefined || args.notDefined || state._config.notDefined || 'notFound',
        end: data.end || args.end || false
    };

    options.router = state._routers[options.router] ? options.router : (data.req ? data.req.method : 'main');

    // remove querystring from url
    options.url = options.url.split(/[?#]/)[0];

    // specified router must exist;
    if (!state._routers[options.router]) {
        return next(new Error('Flow-router.route: Router "' + options.router + '" does not exist.'));
    }

    var route = state._routers[options.router](typeof options.url === 'string' ? options.url : '/');

    // 404
    if (route === null) {
        route = { data: options.notDefined };
    }

    if (!route.data) {
        return next(new Error('Engine-ruut.route: No event found.'));
    }

    if (typeof data !== 'object') {
        data = {};
    }
    data.params = route.params || {};

    // call flow sequence
    stream = stream.pipe(scope.flow(route.data, data, !!stream));
    stream.done = next;
    if (stream.writeable) {
        if (options.end) {
            stream.end(data);
        } else {
            stream.write(data);
        }
    }
};
