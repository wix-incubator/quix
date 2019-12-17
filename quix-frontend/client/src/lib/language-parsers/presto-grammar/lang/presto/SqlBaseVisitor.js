// Generated from ./lang/presto/SqlBase.g4 by ANTLR 4.7
// jshint ignore: start
var antlr4 = require('antlr4');

// This class defines a complete generic visitor for a parse tree produced by SqlBaseParser.

function SqlBaseVisitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

SqlBaseVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
SqlBaseVisitor.prototype.constructor = SqlBaseVisitor;

// Visit a parse tree produced by SqlBaseParser#multiStatement.
SqlBaseVisitor.prototype.visitMultiStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#singleStatement.
SqlBaseVisitor.prototype.visitSingleStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#singleExpression.
SqlBaseVisitor.prototype.visitSingleExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#statementDefault.
SqlBaseVisitor.prototype.visitStatementDefault = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#use.
SqlBaseVisitor.prototype.visitUse = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#createSchema.
SqlBaseVisitor.prototype.visitCreateSchema = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#dropSchema.
SqlBaseVisitor.prototype.visitDropSchema = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#renameSchema.
SqlBaseVisitor.prototype.visitRenameSchema = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#createTableAsSelect.
SqlBaseVisitor.prototype.visitCreateTableAsSelect = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#createTable.
SqlBaseVisitor.prototype.visitCreateTable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#dropTable.
SqlBaseVisitor.prototype.visitDropTable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#insertInto.
SqlBaseVisitor.prototype.visitInsertInto = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#delete.
SqlBaseVisitor.prototype.visitDelete = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#renameTable.
SqlBaseVisitor.prototype.visitRenameTable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#renameColumn.
SqlBaseVisitor.prototype.visitRenameColumn = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#addColumn.
SqlBaseVisitor.prototype.visitAddColumn = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#createView.
SqlBaseVisitor.prototype.visitCreateView = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#dropView.
SqlBaseVisitor.prototype.visitDropView = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#call.
SqlBaseVisitor.prototype.visitCall = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#grant.
SqlBaseVisitor.prototype.visitGrant = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#revoke.
SqlBaseVisitor.prototype.visitRevoke = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#explain.
SqlBaseVisitor.prototype.visitExplain = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showCreateTable.
SqlBaseVisitor.prototype.visitShowCreateTable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showCreateView.
SqlBaseVisitor.prototype.visitShowCreateView = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showTables.
SqlBaseVisitor.prototype.visitShowTables = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showSchemas.
SqlBaseVisitor.prototype.visitShowSchemas = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showCatalogs.
SqlBaseVisitor.prototype.visitShowCatalogs = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showColumns.
SqlBaseVisitor.prototype.visitShowColumns = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showFunctions.
SqlBaseVisitor.prototype.visitShowFunctions = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showSession.
SqlBaseVisitor.prototype.visitShowSession = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#setSession.
SqlBaseVisitor.prototype.visitSetSession = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#resetSession.
SqlBaseVisitor.prototype.visitResetSession = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#startTransaction.
SqlBaseVisitor.prototype.visitStartTransaction = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#commit.
SqlBaseVisitor.prototype.visitCommit = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#rollback.
SqlBaseVisitor.prototype.visitRollback = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#showPartitions.
SqlBaseVisitor.prototype.visitShowPartitions = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#prepare.
SqlBaseVisitor.prototype.visitPrepare = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#deallocate.
SqlBaseVisitor.prototype.visitDeallocate = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#execute.
SqlBaseVisitor.prototype.visitExecute = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#describeInput.
SqlBaseVisitor.prototype.visitDescribeInput = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#describeOutput.
SqlBaseVisitor.prototype.visitDescribeOutput = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#query.
SqlBaseVisitor.prototype.visitQuery = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#presto_with.
SqlBaseVisitor.prototype.visitPresto_with = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#tableElement.
SqlBaseVisitor.prototype.visitTableElement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#columnDefinition.
SqlBaseVisitor.prototype.visitColumnDefinition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#likeClause.
SqlBaseVisitor.prototype.visitLikeClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#tableProperties.
SqlBaseVisitor.prototype.visitTableProperties = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#tableProperty.
SqlBaseVisitor.prototype.visitTableProperty = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#queryNoWith.
SqlBaseVisitor.prototype.visitQueryNoWith = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#queryTermDefault.
SqlBaseVisitor.prototype.visitQueryTermDefault = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#setOperation.
SqlBaseVisitor.prototype.visitSetOperation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#queryPrimaryDefault.
SqlBaseVisitor.prototype.visitQueryPrimaryDefault = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#table.
SqlBaseVisitor.prototype.visitTable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#inlineTable.
SqlBaseVisitor.prototype.visitInlineTable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#subquery.
SqlBaseVisitor.prototype.visitSubquery = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#sortItem.
SqlBaseVisitor.prototype.visitSortItem = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#querySpecification.
SqlBaseVisitor.prototype.visitQuerySpecification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#groupBy.
SqlBaseVisitor.prototype.visitGroupBy = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#singleGroupingSet.
SqlBaseVisitor.prototype.visitSingleGroupingSet = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#rollup.
SqlBaseVisitor.prototype.visitRollup = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#cube.
SqlBaseVisitor.prototype.visitCube = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#multipleGroupingSets.
SqlBaseVisitor.prototype.visitMultipleGroupingSets = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#groupingExpressions.
SqlBaseVisitor.prototype.visitGroupingExpressions = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#groupingSet.
SqlBaseVisitor.prototype.visitGroupingSet = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#namedQuery.
SqlBaseVisitor.prototype.visitNamedQuery = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#setQuantifier.
SqlBaseVisitor.prototype.visitSetQuantifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#selectSingle.
SqlBaseVisitor.prototype.visitSelectSingle = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#selectAll.
SqlBaseVisitor.prototype.visitSelectAll = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#relationDefault.
SqlBaseVisitor.prototype.visitRelationDefault = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#joinRelation.
SqlBaseVisitor.prototype.visitJoinRelation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#joinType.
SqlBaseVisitor.prototype.visitJoinType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#joinCriteria.
SqlBaseVisitor.prototype.visitJoinCriteria = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#sampledRelation.
SqlBaseVisitor.prototype.visitSampledRelation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#sampleType.
SqlBaseVisitor.prototype.visitSampleType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#aliasedRelation.
SqlBaseVisitor.prototype.visitAliasedRelation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#columnAliases.
SqlBaseVisitor.prototype.visitColumnAliases = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#tableName.
SqlBaseVisitor.prototype.visitTableName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#subqueryRelation.
SqlBaseVisitor.prototype.visitSubqueryRelation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#unnest.
SqlBaseVisitor.prototype.visitUnnest = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#parenthesizedRelation.
SqlBaseVisitor.prototype.visitParenthesizedRelation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#expression.
SqlBaseVisitor.prototype.visitExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#logicalNot.
SqlBaseVisitor.prototype.visitLogicalNot = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#booleanDefault.
SqlBaseVisitor.prototype.visitBooleanDefault = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#logicalBinary.
SqlBaseVisitor.prototype.visitLogicalBinary = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#predicated.
SqlBaseVisitor.prototype.visitPredicated = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#comparison.
SqlBaseVisitor.prototype.visitComparison = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#quantifiedComparison.
SqlBaseVisitor.prototype.visitQuantifiedComparison = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#between.
SqlBaseVisitor.prototype.visitBetween = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#inList.
SqlBaseVisitor.prototype.visitInList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#inSubquery.
SqlBaseVisitor.prototype.visitInSubquery = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#like.
SqlBaseVisitor.prototype.visitLike = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#nullPredicate.
SqlBaseVisitor.prototype.visitNullPredicate = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#distinctFrom.
SqlBaseVisitor.prototype.visitDistinctFrom = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#valueExpressionDefault.
SqlBaseVisitor.prototype.visitValueExpressionDefault = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#concatenation.
SqlBaseVisitor.prototype.visitConcatenation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#arithmeticBinary.
SqlBaseVisitor.prototype.visitArithmeticBinary = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#arithmeticUnary.
SqlBaseVisitor.prototype.visitArithmeticUnary = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#atTimeZone.
SqlBaseVisitor.prototype.visitAtTimeZone = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#dereference.
SqlBaseVisitor.prototype.visitDereference = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#typeConstructor.
SqlBaseVisitor.prototype.visitTypeConstructor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#specialDateTimeFunction.
SqlBaseVisitor.prototype.visitSpecialDateTimeFunction = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#substring.
SqlBaseVisitor.prototype.visitSubstring = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#cast.
SqlBaseVisitor.prototype.visitCast = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#lambda.
SqlBaseVisitor.prototype.visitLambda = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#parameter.
SqlBaseVisitor.prototype.visitParameter = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#normalize.
SqlBaseVisitor.prototype.visitNormalize = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#intervalLiteral.
SqlBaseVisitor.prototype.visitIntervalLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#numericLiteral.
SqlBaseVisitor.prototype.visitNumericLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#booleanLiteral.
SqlBaseVisitor.prototype.visitBooleanLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#implicitRowConstructor.
SqlBaseVisitor.prototype.visitImplicitRowConstructor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#simpleCase.
SqlBaseVisitor.prototype.visitSimpleCase = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#columnReference.
SqlBaseVisitor.prototype.visitColumnReference = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#nullLiteral.
SqlBaseVisitor.prototype.visitNullLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#rowConstructor.
SqlBaseVisitor.prototype.visitRowConstructor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#subscript.
SqlBaseVisitor.prototype.visitSubscript = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#subqueryExpression.
SqlBaseVisitor.prototype.visitSubqueryExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#binaryLiteral.
SqlBaseVisitor.prototype.visitBinaryLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#extract.
SqlBaseVisitor.prototype.visitExtract = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#stringLiteral.
SqlBaseVisitor.prototype.visitStringLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#arrayConstructor.
SqlBaseVisitor.prototype.visitArrayConstructor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#functionCall.
SqlBaseVisitor.prototype.visitFunctionCall = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#exists.
SqlBaseVisitor.prototype.visitExists = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#position.
SqlBaseVisitor.prototype.visitPosition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#searchedCase.
SqlBaseVisitor.prototype.visitSearchedCase = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#timeZoneInterval.
SqlBaseVisitor.prototype.visitTimeZoneInterval = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#timeZoneString.
SqlBaseVisitor.prototype.visitTimeZoneString = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#comparisonOperator.
SqlBaseVisitor.prototype.visitComparisonOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#comparisonQuantifier.
SqlBaseVisitor.prototype.visitComparisonQuantifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#booleanValue.
SqlBaseVisitor.prototype.visitBooleanValue = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#interval.
SqlBaseVisitor.prototype.visitInterval = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#intervalField.
SqlBaseVisitor.prototype.visitIntervalField = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#type.
SqlBaseVisitor.prototype.visitType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#typeParameter.
SqlBaseVisitor.prototype.visitTypeParameter = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#baseType.
SqlBaseVisitor.prototype.visitBaseType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#whenClause.
SqlBaseVisitor.prototype.visitWhenClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#filter.
SqlBaseVisitor.prototype.visitFilter = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#over.
SqlBaseVisitor.prototype.visitOver = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#windowFrame.
SqlBaseVisitor.prototype.visitWindowFrame = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#unboundedFrame.
SqlBaseVisitor.prototype.visitUnboundedFrame = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#currentRowBound.
SqlBaseVisitor.prototype.visitCurrentRowBound = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#boundedFrame.
SqlBaseVisitor.prototype.visitBoundedFrame = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#explainFormat.
SqlBaseVisitor.prototype.visitExplainFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#explainType.
SqlBaseVisitor.prototype.visitExplainType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#isolationLevel.
SqlBaseVisitor.prototype.visitIsolationLevel = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#transactionAccessMode.
SqlBaseVisitor.prototype.visitTransactionAccessMode = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#readUncommitted.
SqlBaseVisitor.prototype.visitReadUncommitted = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#readCommitted.
SqlBaseVisitor.prototype.visitReadCommitted = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#repeatableRead.
SqlBaseVisitor.prototype.visitRepeatableRead = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#serializable.
SqlBaseVisitor.prototype.visitSerializable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#positionalArgument.
SqlBaseVisitor.prototype.visitPositionalArgument = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#namedArgument.
SqlBaseVisitor.prototype.visitNamedArgument = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#privilege.
SqlBaseVisitor.prototype.visitPrivilege = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#qualifiedName.
SqlBaseVisitor.prototype.visitQualifiedName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#unquotedIdentifier.
SqlBaseVisitor.prototype.visitUnquotedIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#quotedIdentifierAlternative.
SqlBaseVisitor.prototype.visitQuotedIdentifierAlternative = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#backQuotedIdentifier.
SqlBaseVisitor.prototype.visitBackQuotedIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#digitIdentifier.
SqlBaseVisitor.prototype.visitDigitIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#quotedIdentifier.
SqlBaseVisitor.prototype.visitQuotedIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#decimalLiteral.
SqlBaseVisitor.prototype.visitDecimalLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#integerLiteral.
SqlBaseVisitor.prototype.visitIntegerLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#nonReserved.
SqlBaseVisitor.prototype.visitNonReserved = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by SqlBaseParser#normalForm.
SqlBaseVisitor.prototype.visitNormalForm = function(ctx) {
  return this.visitChildren(ctx);
};



exports.SqlBaseVisitor = SqlBaseVisitor;