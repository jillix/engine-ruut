var Ruut = require("./lib/ruut");


exports.init = function () {

    var self = this;
    var config = this._config;

    config.autocheck = config.autocheck === undefined ? true : config.autocheck;
    config.routes = config.routes || [];

    var streams = this._streams = {};

    function handler(obj, key) {
        var res = obj[key];
        if (typeof res === "string") {
            obj[key] = function (params) {
                var str = self._streams[res] || (self._streams[res] = self.flow(res));
                setTimeout(function() {
                    str.write(null, {
                        params: params
                    });
                }, 0);
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

    this.router = Ruut(config.routes);

    if (config.autocheck) {
        this.check();
    }

    global.addEventListener("popstate", self.check.bind(self, null));
};

exports.check = function (str) {
    this.router(str || location.pathname);
};

exports.route = function (str) {
    var self = this;
    str.data(function (err, data) {
        global.history.pushState(0, 0, data.url);
        self.check();
    });
};
