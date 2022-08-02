// https://github.com/manuelbieh/geolib MIT License Copyright (c) 2018 Manuel Bieh
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=void 0;var _getLatitude=_interopRequireDefault(require("./getLatitude"));var _getLongitude=_interopRequireDefault(require("./getLongitude"));var _toRad=_interopRequireDefault(require("./toRad"));var _robustAcos=_interopRequireDefault(require("./robustAcos"));var _constants=require("./constants");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var getDistance=function getDistance(from,to){var accuracy=arguments.length>2&&arguments[2]!==undefined?arguments[2]:1;accuracy=typeof accuracy!=="undefined"&&!isNaN(accuracy)?accuracy:1;var fromLat=(0,_getLatitude.default)(from);var fromLon=(0,_getLongitude.default)(from);var toLat=(0,_getLatitude.default)(to);var toLon=(0,_getLongitude.default)(to);var distance=Math.acos((0,_robustAcos.default)(Math.sin((0,_toRad.default)(toLat))*Math.sin((0,_toRad.default)(fromLat))+Math.cos((0,_toRad.default)(toLat))*Math.cos((0,_toRad.default)(fromLat))*Math.cos((0,_toRad.default)(fromLon)-(0,_toRad.default)(toLon))))*_constants.earthRadius;return Math.round(distance/accuracy)*accuracy};var _default=getDistance;exports.default=_default;
