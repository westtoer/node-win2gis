/*jslint node: true*/

"use strict";
var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    http = require('http'),
    moment = require('moment'),
    jst = require('JSONStream'),
    es = require('event-stream'),
    csvout = require('csv-stringify');

module.exports.convert = function (inf, outf) {
    var _skip = {del: 0, loc: 0, addr: 0, geo: 0}, _ok = 0;
    function skip(code) {
        _skip[code] += 1;
        return;
    }
    fs.createReadStream(inf)
        .pipe(jst.parse('*'))
        .on('end', function() {
            console.log("done %s ==> skipped = %j, ok = %d", inf, _skip, _ok);
        })
        .pipe(es.mapSync(function (data) {
            if (data.metadata.deleted) {
                return skip('del'); // skip this
            }  //else
            if (data.location_info === undefined) {
                return skip('loc'); // skip
            } // else
            if (data.location_info.address === undefined) {
                return skip('addr'); // skip
            } // else
            if (data.location_info.address.geolocation === undefined) {
                return skip('geo'); // skip
            } // else
            var line = [
                data.metadata.id,
                data.metadata.name,
                data.metadata.root_product_type.code,
                data.metadata.touristic_product_type.code,
                (data.license_info === undefined ?  undefined : data.license_info.total_units),
                data.location_info.address.geolocation.lat,
                data.location_info.address.geolocation.lon,
                data.location_info.address.municipality
            ];
            _ok += 1;
            return line;
        }))
        .pipe(csvout({
            delimitor: ',',
            header: true,
            columns: ['id', 'name', 'cat', 'type', 'size', 'lat', 'lon', 'city']
        }))
        .pipe(fs.createWriteStream(outf));
};
