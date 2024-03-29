/* */ 
"use strict";
exports.__esModule = true;
var _symbol = require('babel-runtime/core-js/symbol');
var _symbol2 = _interopRequireDefault(_symbol);
var _plugin = require('../plugin');
var _plugin2 = _interopRequireDefault(_plugin);
var _babelTypes = require('babel-types');
var t = _interopRequireWildcard(_babelTypes);
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          newObj[key] = obj[key];
      }
    }
    newObj.default = obj;
    return newObj;
  }
}
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var SUPER_THIS_BOUND = (0, _symbol2.default)("super this bound");
var superVisitor = {CallExpression: function CallExpression(path) {
    if (!path.get("callee").isSuper())
      return;
    var node = path.node;
    if (node[SUPER_THIS_BOUND])
      return;
    node[SUPER_THIS_BOUND] = true;
    path.replaceWith(t.assignmentExpression("=", this.id, node));
  }};
exports.default = new _plugin2.default({visitor: {
    ThisExpression: function ThisExpression(path) {
      remap(path, "this");
    },
    ReferencedIdentifier: function ReferencedIdentifier(path) {
      if (path.node.name === "arguments") {
        remap(path, "arguments");
      }
    }
  }});
function shouldShadow(path, shadowPath) {
  if (path.is("_forceShadow")) {
    return true;
  } else {
    return shadowPath;
  }
}
function remap(path, key) {
  var shadowPath = path.inShadow(key);
  if (!shouldShadow(path, shadowPath))
    return;
  var shadowFunction = path.node._shadowedFunctionLiteral;
  var currentFunction = void 0;
  var passedShadowFunction = false;
  var fnPath = path.findParent(function(path) {
    if (path.isProgram() || path.isFunction()) {
      currentFunction = currentFunction || path;
    }
    if (path.isProgram()) {
      passedShadowFunction = true;
      return true;
    } else if (path.isFunction() && !path.isArrowFunctionExpression()) {
      if (shadowFunction) {
        if (path === shadowFunction || path.node === shadowFunction.node)
          return true;
      } else {
        if (!path.is("shadow"))
          return true;
      }
      passedShadowFunction = true;
      return false;
    }
    return false;
  });
  if (shadowFunction && fnPath.isProgram() && !shadowFunction.isProgram()) {
    fnPath = path.findParent(function(p) {
      return p.isProgram() || p.isFunction();
    });
  }
  if (fnPath === currentFunction)
    return;
  if (!passedShadowFunction)
    return;
  var cached = fnPath.getData(key);
  if (cached)
    return path.replaceWith(cached);
  var id = path.scope.generateUidIdentifier(key);
  fnPath.setData(key, id);
  if (key === "this" && fnPath.isMethod({kind: "constructor"})) {
    fnPath.scope.push({id: id});
    fnPath.traverse(superVisitor, {id: id});
  } else {
    var init = key === "this" ? t.thisExpression() : t.identifier(key);
    fnPath.scope.push({
      id: id,
      init: init
    });
  }
  return path.replaceWith(id);
}
module.exports = exports["default"];
