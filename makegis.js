/*jslint node: true */
/*jslint es5: true */
/*jslint nomen: true */
/*global setImmediate */

"use strict";

var w2g = require('./lib/win2gis'),
    rwcsv = require('./lib/rwcsv'),
    fs = require('graceful-fs'),
    path = require('path'),
    argv = require('yargs'),
    moment = require('moment'),
    settings;

settings = argv
    .usage('Converteert de win2 dump bestanden in json naar gis-csv.\nUsage: $0')
    .example('$0 file.json [morefiles.json ...]',
             'Maakt per json bestand een matchend .csv bestande met de essentiele csv data.')

    .demand(1)

    .argv;


function doConvert() {
    console.log("hoera %j", settings);
    // TODO loop through all inputs
    settings._.forEach(function (fpath) {
        if (!fs.existsSync(fpath)) {
            console.log("skipp not existing path %s", fpath);
            return;
        } //else
        var dir = path.dirname(fpath), name = path.basename(fpath, path.extname(fpath)),
            out = path.join(dir, name + ".csv");
        w2g.convert(fpath, out);
    });
}

doConvert();
