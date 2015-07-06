var Ruut = require("./lib/ruut");

exports.init = function () {
    var config = this._config;
    config.routes = config.routes || [];
    var stream = this.flow("route");

    function handler(obj, key) {
        var res = obj[key];
        if (typeof res === "string") {
            key[obj] = function (params) {
                console.log(">>> ", res, params);
                //stream.write(null, {
                //    params: params
                //});
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
                    return normalize(route[key], route, key);
                }
                handler(route, key);
            });
        }
    }

    normalize(config, "routes");

    this.router = Ruut(config.routes);
};

exports.check = function (str) {
    str.data(function (err, data) {

    });
}
