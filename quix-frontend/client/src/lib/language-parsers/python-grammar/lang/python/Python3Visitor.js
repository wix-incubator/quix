// Generated from ./lang/python/Python3.g4 by ANTLR 4.7
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by Python3Parser.

function Python3Visitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

Python3Visitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
Python3Visitor.prototype.constructor = Python3Visitor;

// Visit a parse tree produced by Python3Parser#single_input.
Python3Visitor.prototype.visitSingle_input = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#file_input.
Python3Visitor.prototype.visitFile_input = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#eval_input.
Python3Visitor.prototype.visitEval_input = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#decorator.
Python3Visitor.prototype.visitDecorator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#decorators.
Python3Visitor.prototype.visitDecorators = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#decorated.
Python3Visitor.prototype.visitDecorated = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#funcdef.
Python3Visitor.prototype.visitFuncdef = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#parameters.
Python3Visitor.prototype.visitParameters = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#typedargslist.
Python3Visitor.prototype.visitTypedargslist = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#tfpdef.
Python3Visitor.prototype.visitTfpdef = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#varargslist.
Python3Visitor.prototype.visitVarargslist = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#vfpdef.
Python3Visitor.prototype.visitVfpdef = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#stmt.
Python3Visitor.prototype.visitStmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#simple_stmt.
Python3Visitor.prototype.visitSimple_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#small_stmt.
Python3Visitor.prototype.visitSmall_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#expr_stmt.
Python3Visitor.prototype.visitExpr_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#testlist_star_expr.
Python3Visitor.prototype.visitTestlist_star_expr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#augassign.
Python3Visitor.prototype.visitAugassign = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#del_stmt.
Python3Visitor.prototype.visitDel_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#pass_stmt.
Python3Visitor.prototype.visitPass_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#flow_stmt.
Python3Visitor.prototype.visitFlow_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#break_stmt.
Python3Visitor.prototype.visitBreak_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#continue_stmt.
Python3Visitor.prototype.visitContinue_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#return_stmt.
Python3Visitor.prototype.visitReturn_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#yield_stmt.
Python3Visitor.prototype.visitYield_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#raise_stmt.
Python3Visitor.prototype.visitRaise_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#import_stmt.
Python3Visitor.prototype.visitImport_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#import_name.
Python3Visitor.prototype.visitImport_name = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#import_from.
Python3Visitor.prototype.visitImport_from = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#import_as_name.
Python3Visitor.prototype.visitImport_as_name = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#dotted_as_name.
Python3Visitor.prototype.visitDotted_as_name = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#import_as_names.
Python3Visitor.prototype.visitImport_as_names = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#dotted_as_names.
Python3Visitor.prototype.visitDotted_as_names = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#dotted_name.
Python3Visitor.prototype.visitDotted_name = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#global_stmt.
Python3Visitor.prototype.visitGlobal_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#nonlocal_stmt.
Python3Visitor.prototype.visitNonlocal_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#assert_stmt.
Python3Visitor.prototype.visitAssert_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#compound_stmt.
Python3Visitor.prototype.visitCompound_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#if_stmt.
Python3Visitor.prototype.visitIf_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#while_stmt.
Python3Visitor.prototype.visitWhile_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#for_stmt.
Python3Visitor.prototype.visitFor_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#try_stmt.
Python3Visitor.prototype.visitTry_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#with_stmt.
Python3Visitor.prototype.visitWith_stmt = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#with_item.
Python3Visitor.prototype.visitWith_item = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#except_clause.
Python3Visitor.prototype.visitExcept_clause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#suite.
Python3Visitor.prototype.visitSuite = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#test.
Python3Visitor.prototype.visitTest = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#test_nocond.
Python3Visitor.prototype.visitTest_nocond = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#lambdef.
Python3Visitor.prototype.visitLambdef = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#lambdef_nocond.
Python3Visitor.prototype.visitLambdef_nocond = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#or_test.
Python3Visitor.prototype.visitOr_test = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#and_test.
Python3Visitor.prototype.visitAnd_test = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#not_test.
Python3Visitor.prototype.visitNot_test = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#comparison.
Python3Visitor.prototype.visitComparison = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#comp_op.
Python3Visitor.prototype.visitComp_op = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#star_expr.
Python3Visitor.prototype.visitStar_expr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#expr.
Python3Visitor.prototype.visitExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#xor_expr.
Python3Visitor.prototype.visitXor_expr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#and_expr.
Python3Visitor.prototype.visitAnd_expr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#shift_expr.
Python3Visitor.prototype.visitShift_expr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#arith_expr.
Python3Visitor.prototype.visitArith_expr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#term.
Python3Visitor.prototype.visitTerm = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#factor.
Python3Visitor.prototype.visitFactor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#power.
Python3Visitor.prototype.visitPower = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#atom.
Python3Visitor.prototype.visitAtom = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#testlist_comp.
Python3Visitor.prototype.visitTestlist_comp = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#trailer.
Python3Visitor.prototype.visitTrailer = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#subscriptlist.
Python3Visitor.prototype.visitSubscriptlist = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#subscript.
Python3Visitor.prototype.visitSubscript = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#sliceop.
Python3Visitor.prototype.visitSliceop = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#exprlist.
Python3Visitor.prototype.visitExprlist = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#testlist.
Python3Visitor.prototype.visitTestlist = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#dictorsetmaker.
Python3Visitor.prototype.visitDictorsetmaker = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#classdef.
Python3Visitor.prototype.visitClassdef = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#arglist.
Python3Visitor.prototype.visitArglist = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#argument.
Python3Visitor.prototype.visitArgument = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#comp_iter.
Python3Visitor.prototype.visitComp_iter = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#comp_for.
Python3Visitor.prototype.visitComp_for = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#comp_if.
Python3Visitor.prototype.visitComp_if = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#yield_expr.
Python3Visitor.prototype.visitYield_expr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#yield_arg.
Python3Visitor.prototype.visitYield_arg = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#str.
Python3Visitor.prototype.visitStr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#number.
Python3Visitor.prototype.visitNumber = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by Python3Parser#integer.
Python3Visitor.prototype.visitInteger = function(ctx) {
  return this.visitChildren(ctx);
};



exports.Python3Visitor = Python3Visitor;