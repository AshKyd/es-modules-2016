/* */ 
"use strict";
exports.__esModule = true;
exports.LogicalExpression = exports.BinaryExpression = exports.AwaitExpression = exports.YieldExpression = undefined;
exports.UnaryExpression = UnaryExpression;
exports.DoExpression = DoExpression;
exports.ParenthesizedExpression = ParenthesizedExpression;
exports.UpdateExpression = UpdateExpression;
exports.ConditionalExpression = ConditionalExpression;
exports.NewExpression = NewExpression;
exports.SequenceExpression = SequenceExpression;
exports.ThisExpression = ThisExpression;
exports.Super = Super;
exports.Decorator = Decorator;
exports.CallExpression = CallExpression;
exports.EmptyStatement = EmptyStatement;
exports.ExpressionStatement = ExpressionStatement;
exports.AssignmentPattern = AssignmentPattern;
exports.AssignmentExpression = AssignmentExpression;
exports.BindExpression = BindExpression;
exports.MemberExpression = MemberExpression;
exports.MetaProperty = MetaProperty;
var _isInteger = require('is-integer');
var _isInteger2 = _interopRequireDefault(_isInteger);
var _isNumber = require('lodash/lang/isNumber');
var _isNumber2 = _interopRequireDefault(_isNumber);
var _babelTypes = require('babel-types');
var t = _interopRequireWildcard(_babelTypes);
var _node = require('../node/index');
var n = _interopRequireWildcard(_node);
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
var SCIENTIFIC_NOTATION = /e/i;
var ZERO_DECIMAL_INTEGER = /\.0+$/;
var NON_DECIMAL_LITERAL = /^0[box]/;
function UnaryExpression(node) {
  var needsSpace = /[a-z]$/.test(node.operator);
  var arg = node.argument;
  if (t.isUpdateExpression(arg) || t.isUnaryExpression(arg)) {
    needsSpace = true;
  }
  if (t.isUnaryExpression(arg) && arg.operator === "!") {
    needsSpace = false;
  }
  this.push(node.operator);
  if (needsSpace)
    this.push(" ");
  this.print(node.argument, node);
}
function DoExpression(node) {
  this.push("do");
  this.space();
  this.print(node.body, node);
}
function ParenthesizedExpression(node) {
  this.push("(");
  this.print(node.expression, node);
  this.push(")");
}
function UpdateExpression(node) {
  if (node.prefix) {
    this.push(node.operator);
    this.print(node.argument, node);
  } else {
    this.print(node.argument, node);
    this.push(node.operator);
  }
}
function ConditionalExpression(node) {
  this.print(node.test, node);
  this.space();
  this.push("?");
  this.space();
  this.print(node.consequent, node);
  this.space();
  this.push(":");
  this.space();
  this.print(node.alternate, node);
}
function NewExpression(node, parent) {
  this.push("new ");
  this.print(node.callee, node);
  if (node.arguments.length === 0 && this.format.minified && !t.isCallExpression(parent, {callee: node}) && !t.isMemberExpression(parent) && !t.isNewExpression(parent))
    return;
  this.push("(");
  this.printList(node.arguments, node);
  this.push(")");
}
function SequenceExpression(node) {
  this.printList(node.expressions, node);
}
function ThisExpression() {
  this.push("this");
}
function Super() {
  this.push("super");
}
function Decorator(node) {
  this.push("@");
  this.print(node.expression, node);
  this.newline();
}
function CallExpression(node) {
  this.print(node.callee, node);
  if (node.loc)
    this.printAuxAfterComment();
  this.push("(");
  var isPrettyCall = node._prettyCall && !this.format.retainLines && !this.format.compact;
  var separator = void 0;
  if (isPrettyCall) {
    separator = ",\n";
    this.newline();
    this.indent();
  }
  this.printList(node.arguments, node, {separator: separator});
  if (isPrettyCall) {
    this.newline();
    this.dedent();
  }
  this.push(")");
}
function buildYieldAwait(keyword) {
  return function(node) {
    this.push(keyword);
    if (node.delegate) {
      this.push("*");
    }
    if (node.argument) {
      this.push(" ");
      var terminatorState = this.startTerminatorless();
      this.print(node.argument, node);
      this.endTerminatorless(terminatorState);
    }
  };
}
var YieldExpression = exports.YieldExpression = buildYieldAwait("yield");
var AwaitExpression = exports.AwaitExpression = buildYieldAwait("await");
function EmptyStatement() {
  this._lastPrintedIsEmptyStatement = true;
  this.semicolon();
}
function ExpressionStatement(node) {
  this.print(node.expression, node);
  this.semicolon();
}
function AssignmentPattern(node) {
  this.print(node.left, node);
  this.space();
  this.push("=");
  this.space();
  this.print(node.right, node);
}
function AssignmentExpression(node, parent) {
  var parens = this._inForStatementInitCounter && node.operator === "in" && !n.needsParens(node, parent);
  if (parens) {
    this.push("(");
  }
  this.print(node.left, node);
  var spaces = !this.format.compact || node.operator === "in" || node.operator === "instanceof";
  if (spaces)
    this.push(" ");
  this.push(node.operator);
  if (!spaces) {
    spaces = node.operator === "<" && t.isUnaryExpression(node.right, {
      prefix: true,
      operator: "!"
    }) && t.isUnaryExpression(node.right.argument, {
      prefix: true,
      operator: "--"
    });
    if (!spaces) {
      var right = getLeftMost(node.right);
      spaces = t.isUnaryExpression(right, {
        prefix: true,
        operator: node.operator
      }) || t.isUpdateExpression(right, {
        prefix: true,
        operator: node.operator + node.operator
      });
    }
  }
  if (spaces)
    this.push(" ");
  this.print(node.right, node);
  if (parens) {
    this.push(")");
  }
}
function BindExpression(node) {
  this.print(node.object, node);
  this.push("::");
  this.print(node.callee, node);
}
exports.BinaryExpression = AssignmentExpression;
exports.LogicalExpression = AssignmentExpression;
function MemberExpression(node) {
  this.print(node.object, node);
  if (!node.computed && t.isMemberExpression(node.property)) {
    throw new TypeError("Got a MemberExpression for MemberExpression property");
  }
  var computed = node.computed;
  if (t.isLiteral(node.property) && (0, _isNumber2.default)(node.property.value)) {
    computed = true;
  }
  if (computed) {
    this.push("[");
    this.print(node.property, node);
    this.push("]");
  } else {
    if (t.isNumericLiteral(node.object)) {
      var val = this.getPossibleRaw(node.object) || node.object.value;
      if ((0, _isInteger2.default)(+val) && !NON_DECIMAL_LITERAL.test(val) && !SCIENTIFIC_NOTATION.test(val) && !ZERO_DECIMAL_INTEGER.test(val) && !this.endsWith(".")) {
        this.push(".");
      }
    }
    this.push(".");
    this.print(node.property, node);
  }
}
function MetaProperty(node) {
  this.print(node.meta, node);
  this.push(".");
  this.print(node.property, node);
}
function getLeftMost(binaryExpr) {
  if (!t.isBinaryExpression(binaryExpr)) {
    return binaryExpr;
  }
  return getLeftMost(binaryExpr.left);
}
