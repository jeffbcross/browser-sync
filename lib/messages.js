"use strict";
var compile = require("cl-strings").compile;

module.exports = {
    /**
     * @param {String} hostIp
     * @param {String|Number} socketIoPort
     * @param {String|Number} scriptPort
     * @returns {String}
     */
    init: function (hostIp, ports) {

        var template = "\n\n{cyan:All Set Up!} Now copy & paste this snippet just before the closing </body> tag in your website.\n\n {: tags :}";
        var params = {
            tags: this.scriptTags(hostIp, ports)
        };

        return compile(template, params);
    },
    server: {
        withProxy: function () {
            var template = "{red:Invalid config. You cannot specify both a server & proxy option.}";
            return compile(template);
        }
    },
    /**
     * @param {String} host
     * @param {String|Number} port
     * @param {String} baseDir
     * @returns {String}
     */
    initServer: function (host, port, baseDir) {

        var template = "\n{green:OK, Server running at} {magenta:{: url :}}";
        template    += "\n{green:Serving files from:} {magenta:{: baseDir :}}";
        template    += "\n\n{green:Load a browser & check back here. If you set up everything correctly, you'll see a} {cyan:'Browser Connected'} {green:message}\n";
        var params = {
            url: this._makeUrl(host, port, "http:"),
            baseDir: baseDir
        };

        return compile(template, params);
    },
    /**
     * @param {String} host
     * @param {String|Number} port
     * @returns {String}
     */
    initProxy: function (host, port) {

        var template = "{green:Proxy running. Use this URL: }{magenta:{: url :}}";

        var params = {
            url: this._makeUrl(host, port, "http:")
        };

        return compile(template, params);
    },
    /**
     * Helper for creating a URL
     * @param {String} host
     * @param {String|Number} port
     * @param {String} [protocol]
     * @returns {String}
     */
    _makeUrl: function (host, port, protocol) {

        var string = "//{: host :}:{: port :}";

        if (protocol) {
            string = protocol + string;
        }

        return compile(string, {host: host, port: port});
    },
    /**
     * @param {String} hostIp
     * @param {Object} ports
     * @returns {String}
     */
    scriptTags: function (hostIp, ports, options, env) {

        var template = "<script src='{: socket :}'></script>\n";
        template    += "<script>{: connector :}</script>\n";
        template    += "<script src='{: custom :}'></script>\n\n";

        var socket = this._makeUrl(hostIp, ports.socket) + this.socketIoScript;
        var custom = this._makeUrl(hostIp, ports.controlPanel) + this.clientScript(options);

        if (env && env === "controlPanel") {
            custom = this._makeUrl(hostIp, ports.controlPanel) + this.controlPanel.jsFile;
        }

        var params = {
            socket: socket,
            custom: custom,
            connector: this.socketConnector(hostIp, ports.socket)
        };

        return compile(template, params);
    },
    /**
     * @returns {String}
     */
    invalidBaseDir: function () {

        var template = "{cyan:Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )}";

        return compile(template, {});
    },
    ports: {
        /**
         * @param {Number} minCount
         * @returns {String}
         */
        invalid: function (minCount) {
            var template = "{red:Invalid port range!} - At least {:minCount:} required!";
            var params   = {
                minCount: minCount
            };

            return compile(template, params);
        }
    },
    config: {
        /**
         * @param {String} path
         * @returns {String}
         */
        confirm: function (path) {
            var template  = "Config file created at {cyan:{:path:}}\n";
            template += "To use it, in the same directory run: {green:browser-sync}";
            var params = {
                path: path
            };

            return compile(template, params);
        }
    },
    files: {
        /**
         * @param {Array} [patterns]
         * @param {Number} [patternLimit] - how many lines of patterns to show
         * @returns {String}
         */
        watching: function (patterns, patternLimit) {

            var string, limit = patternLimit || 10;

            if (Array.isArray(patterns) && patterns.length) {

                string = compile("{green:Watching the following:}\n");

                var slice = patterns.slice(0, limit);

                slice.forEach(function (item) {
                    string += item.replace(" ", "") + "\n";
                });

                if (patterns.length > limit) {
                    string += "Plus more...\n";
                }

            } else {
                string = compile("{red:Not watching any files...}");
            }

            return string;
        },
        /**
         * @param {String} path
         * @returns {String}
         */
        changed: function (path) {
            var string = "{magenta:File Changed: }{green:{: path :}}";
            return compile(string, {path: path});
        }
    },
    browser: {
        /**
         * @returns {String}
         */
        reload: function () {
            var string = "{cyan:Reloading all connected browsers...}";
            return compile(string);
        },
        /**
         * @returns {String}
         */
        inject: function () {
            var string = "{cyan:Injecting file into all connected browsers...}";
            return compile(string);
        },
        /**
         * @param {Object} browser
         * @returns {String}
         */
        connection: function (browser) {

            var template = "{cyan:Browser Connected! ({:name:}, version: {:version:})}";
            var params = {
                name: browser.name,
                version: browser.version
            };

            return compile(template, params);
        }
    },
    /**
     * @param {String} url
     * @returns {*}
     */
    location: function (url) {
        var template = "{yellow:Link clicked! Redirecting all browsers to }{green:{: url :}}";
        var params = {
            url: url
        };
        return compile(template, params);
    },
    /**
     * @param {String} host
     * @param {String|Number} port
     * @returns {String}
     */
    socketConnector: function (host, port) {
        var string = "var ___socket___ = io.connect('{: url :}');";

        var params = {
            url: this._makeUrl(host, port, "http:")
        };

        return compile(string, params);
    },
    /**
     * @param {Object} [options]
     * @returns {String}
     */
    clientScript: function (options) {
        if (options && options.devMode) {
            return "/client/browser-sync-client.js";
        }
        return "/client/browser-sync-client.min.js";
    },
    /**
     *
     */
    controlPanel: {
        jsFile: "/js/app.js"
    },
    socketIoScript: "/socket.io/socket.io.js",
    configFile: "/bs-config.js",
    client: {
        shims: "/client/client-shims.js"
    }
};