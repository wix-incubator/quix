// Generated from ./lang/presto/SqlBase.g4 by ANTLR 4.7
// jshint ignore: start
var antlr4 = require('antlr4');

// This class defines a complete listener for a parse tree produced by SqlBaseParser.
function SqlBaseListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

SqlBaseListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
SqlBaseListener.prototype.constructor = SqlBaseListener;

// Enter a parse tree produced by SqlBaseParser#multiStatement.
SqlBaseListener.prototype.enterMultiStatement = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#multiStatement.
SqlBaseListener.prototype.exitMultiStatement = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#singleStatement.
SqlBaseListener.prototype.enterSingleStatement = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#singleStatement.
SqlBaseListener.prototype.exitSingleStatement = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#singleExpression.
SqlBaseListener.prototype.enterSingleExpression = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#singleExpression.
SqlBaseListener.prototype.exitSingleExpression = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#statementDefault.
SqlBaseListener.prototype.enterStatementDefault = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#statementDefault.
SqlBaseListener.prototype.exitStatementDefault = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#use.
SqlBaseListener.prototype.enterUse = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#use.
SqlBaseListener.prototype.exitUse = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#createSchema.
SqlBaseListener.prototype.enterCreateSchema = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#createSchema.
SqlBaseListener.prototype.exitCreateSchema = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#dropSchema.
SqlBaseListener.prototype.enterDropSchema = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#dropSchema.
SqlBaseListener.prototype.exitDropSchema = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#renameSchema.
SqlBaseListener.prototype.enterRenameSchema = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#renameSchema.
SqlBaseListener.prototype.exitRenameSchema = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#createTableAsSelect.
SqlBaseListener.prototype.enterCreateTableAsSelect = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#createTableAsSelect.
SqlBaseListener.prototype.exitCreateTableAsSelect = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#createTable.
SqlBaseListener.prototype.enterCreateTable = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#createTable.
SqlBaseListener.prototype.exitCreateTable = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#dropTable.
SqlBaseListener.prototype.enterDropTable = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#dropTable.
SqlBaseListener.prototype.exitDropTable = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#insertInto.
SqlBaseListener.prototype.enterInsertInto = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#insertInto.
SqlBaseListener.prototype.exitInsertInto = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#delete.
SqlBaseListener.prototype.enterDelete = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#delete.
SqlBaseListener.prototype.exitDelete = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#renameTable.
SqlBaseListener.prototype.enterRenameTable = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#renameTable.
SqlBaseListener.prototype.exitRenameTable = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#renameColumn.
SqlBaseListener.prototype.enterRenameColumn = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#renameColumn.
SqlBaseListener.prototype.exitRenameColumn = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#addColumn.
SqlBaseListener.prototype.enterAddColumn = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#addColumn.
SqlBaseListener.prototype.exitAddColumn = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#createView.
SqlBaseListener.prototype.enterCreateView = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#createView.
SqlBaseListener.prototype.exitCreateView = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#dropView.
SqlBaseListener.prototype.enterDropView = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#dropView.
SqlBaseListener.prototype.exitDropView = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#call.
SqlBaseListener.prototype.enterCall = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#call.
SqlBaseListener.prototype.exitCall = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#grant.
SqlBaseListener.prototype.enterGrant = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#grant.
SqlBaseListener.prototype.exitGrant = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#revoke.
SqlBaseListener.prototype.enterRevoke = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#revoke.
SqlBaseListener.prototype.exitRevoke = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#explain.
SqlBaseListener.prototype.enterExplain = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#explain.
SqlBaseListener.prototype.exitExplain = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showCreateTable.
SqlBaseListener.prototype.enterShowCreateTable = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showCreateTable.
SqlBaseListener.prototype.exitShowCreateTable = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showCreateView.
SqlBaseListener.prototype.enterShowCreateView = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showCreateView.
SqlBaseListener.prototype.exitShowCreateView = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showTables.
SqlBaseListener.prototype.enterShowTables = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showTables.
SqlBaseListener.prototype.exitShowTables = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showSchemas.
SqlBaseListener.prototype.enterShowSchemas = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showSchemas.
SqlBaseListener.prototype.exitShowSchemas = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showCatalogs.
SqlBaseListener.prototype.enterShowCatalogs = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showCatalogs.
SqlBaseListener.prototype.exitShowCatalogs = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showColumns.
SqlBaseListener.prototype.enterShowColumns = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showColumns.
SqlBaseListener.prototype.exitShowColumns = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showFunctions.
SqlBaseListener.prototype.enterShowFunctions = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showFunctions.
SqlBaseListener.prototype.exitShowFunctions = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showSession.
SqlBaseListener.prototype.enterShowSession = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showSession.
SqlBaseListener.prototype.exitShowSession = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#setSession.
SqlBaseListener.prototype.enterSetSession = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#setSession.
SqlBaseListener.prototype.exitSetSession = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#resetSession.
SqlBaseListener.prototype.enterResetSession = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#resetSession.
SqlBaseListener.prototype.exitResetSession = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#startTransaction.
SqlBaseListener.prototype.enterStartTransaction = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#startTransaction.
SqlBaseListener.prototype.exitStartTransaction = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#commit.
SqlBaseListener.prototype.enterCommit = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#commit.
SqlBaseListener.prototype.exitCommit = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#rollback.
SqlBaseListener.prototype.enterRollback = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#rollback.
SqlBaseListener.prototype.exitRollback = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#showPartitions.
SqlBaseListener.prototype.enterShowPartitions = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#showPartitions.
SqlBaseListener.prototype.exitShowPartitions = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#prepare.
SqlBaseListener.prototype.enterPrepare = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#prepare.
SqlBaseListener.prototype.exitPrepare = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#deallocate.
SqlBaseListener.prototype.enterDeallocate = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#deallocate.
SqlBaseListener.prototype.exitDeallocate = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#execute.
SqlBaseListener.prototype.enterExecute = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#execute.
SqlBaseListener.prototype.exitExecute = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#describeInput.
SqlBaseListener.prototype.enterDescribeInput = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#describeInput.
SqlBaseListener.prototype.exitDescribeInput = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#describeOutput.
SqlBaseListener.prototype.enterDescribeOutput = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#describeOutput.
SqlBaseListener.prototype.exitDescribeOutput = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#query.
SqlBaseListener.prototype.enterQuery = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#query.
SqlBaseListener.prototype.exitQuery = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#presto_with.
SqlBaseListener.prototype.enterPresto_with = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#presto_with.
SqlBaseListener.prototype.exitPresto_with = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#tableElement.
SqlBaseListener.prototype.enterTableElement = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#tableElement.
SqlBaseListener.prototype.exitTableElement = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#columnDefinition.
SqlBaseListener.prototype.enterColumnDefinition = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#columnDefinition.
SqlBaseListener.prototype.exitColumnDefinition = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#likeClause.
SqlBaseListener.prototype.enterLikeClause = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#likeClause.
SqlBaseListener.prototype.exitLikeClause = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#tableProperties.
SqlBaseListener.prototype.enterTableProperties = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#tableProperties.
SqlBaseListener.prototype.exitTableProperties = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#tableProperty.
SqlBaseListener.prototype.enterTableProperty = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#tableProperty.
SqlBaseListener.prototype.exitTableProperty = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#queryNoWith.
SqlBaseListener.prototype.enterQueryNoWith = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#queryNoWith.
SqlBaseListener.prototype.exitQueryNoWith = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#queryTermDefault.
SqlBaseListener.prototype.enterQueryTermDefault = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#queryTermDefault.
SqlBaseListener.prototype.exitQueryTermDefault = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#setOperation.
SqlBaseListener.prototype.enterSetOperation = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#setOperation.
SqlBaseListener.prototype.exitSetOperation = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#queryPrimaryDefault.
SqlBaseListener.prototype.enterQueryPrimaryDefault = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#queryPrimaryDefault.
SqlBaseListener.prototype.exitQueryPrimaryDefault = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#table.
SqlBaseListener.prototype.enterTable = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#table.
SqlBaseListener.prototype.exitTable = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#inlineTable.
SqlBaseListener.prototype.enterInlineTable = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#inlineTable.
SqlBaseListener.prototype.exitInlineTable = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#subquery.
SqlBaseListener.prototype.enterSubquery = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#subquery.
SqlBaseListener.prototype.exitSubquery = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#sortItem.
SqlBaseListener.prototype.enterSortItem = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#sortItem.
SqlBaseListener.prototype.exitSortItem = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#querySpecification.
SqlBaseListener.prototype.enterQuerySpecification = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#querySpecification.
SqlBaseListener.prototype.exitQuerySpecification = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#groupBy.
SqlBaseListener.prototype.enterGroupBy = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#groupBy.
SqlBaseListener.prototype.exitGroupBy = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#singleGroupingSet.
SqlBaseListener.prototype.enterSingleGroupingSet = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#singleGroupingSet.
SqlBaseListener.prototype.exitSingleGroupingSet = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#rollup.
SqlBaseListener.prototype.enterRollup = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#rollup.
SqlBaseListener.prototype.exitRollup = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#cube.
SqlBaseListener.prototype.enterCube = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#cube.
SqlBaseListener.prototype.exitCube = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#multipleGroupingSets.
SqlBaseListener.prototype.enterMultipleGroupingSets = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#multipleGroupingSets.
SqlBaseListener.prototype.exitMultipleGroupingSets = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#groupingExpressions.
SqlBaseListener.prototype.enterGroupingExpressions = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#groupingExpressions.
SqlBaseListener.prototype.exitGroupingExpressions = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#groupingSet.
SqlBaseListener.prototype.enterGroupingSet = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#groupingSet.
SqlBaseListener.prototype.exitGroupingSet = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#namedQuery.
SqlBaseListener.prototype.enterNamedQuery = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#namedQuery.
SqlBaseListener.prototype.exitNamedQuery = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#setQuantifier.
SqlBaseListener.prototype.enterSetQuantifier = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#setQuantifier.
SqlBaseListener.prototype.exitSetQuantifier = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#selectSingle.
SqlBaseListener.prototype.enterSelectSingle = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#selectSingle.
SqlBaseListener.prototype.exitSelectSingle = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#selectAll.
SqlBaseListener.prototype.enterSelectAll = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#selectAll.
SqlBaseListener.prototype.exitSelectAll = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#relationDefault.
SqlBaseListener.prototype.enterRelationDefault = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#relationDefault.
SqlBaseListener.prototype.exitRelationDefault = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#joinRelation.
SqlBaseListener.prototype.enterJoinRelation = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#joinRelation.
SqlBaseListener.prototype.exitJoinRelation = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#joinType.
SqlBaseListener.prototype.enterJoinType = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#joinType.
SqlBaseListener.prototype.exitJoinType = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#joinCriteria.
SqlBaseListener.prototype.enterJoinCriteria = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#joinCriteria.
SqlBaseListener.prototype.exitJoinCriteria = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#sampledRelation.
SqlBaseListener.prototype.enterSampledRelation = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#sampledRelation.
SqlBaseListener.prototype.exitSampledRelation = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#sampleType.
SqlBaseListener.prototype.enterSampleType = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#sampleType.
SqlBaseListener.prototype.exitSampleType = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#aliasedRelation.
SqlBaseListener.prototype.enterAliasedRelation = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#aliasedRelation.
SqlBaseListener.prototype.exitAliasedRelation = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#columnAliases.
SqlBaseListener.prototype.enterColumnAliases = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#columnAliases.
SqlBaseListener.prototype.exitColumnAliases = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#tableName.
SqlBaseListener.prototype.enterTableName = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#tableName.
SqlBaseListener.prototype.exitTableName = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#subqueryRelation.
SqlBaseListener.prototype.enterSubqueryRelation = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#subqueryRelation.
SqlBaseListener.prototype.exitSubqueryRelation = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#unnest.
SqlBaseListener.prototype.enterUnnest = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#unnest.
SqlBaseListener.prototype.exitUnnest = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#parenthesizedRelation.
SqlBaseListener.prototype.enterParenthesizedRelation = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#parenthesizedRelation.
SqlBaseListener.prototype.exitParenthesizedRelation = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#expression.
SqlBaseListener.prototype.enterExpression = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#expression.
SqlBaseListener.prototype.exitExpression = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#logicalNot.
SqlBaseListener.prototype.enterLogicalNot = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#logicalNot.
SqlBaseListener.prototype.exitLogicalNot = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#booleanDefault.
SqlBaseListener.prototype.enterBooleanDefault = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#booleanDefault.
SqlBaseListener.prototype.exitBooleanDefault = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#logicalBinary.
SqlBaseListener.prototype.enterLogicalBinary = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#logicalBinary.
SqlBaseListener.prototype.exitLogicalBinary = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#predicated.
SqlBaseListener.prototype.enterPredicated = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#predicated.
SqlBaseListener.prototype.exitPredicated = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#comparison.
SqlBaseListener.prototype.enterComparison = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#comparison.
SqlBaseListener.prototype.exitComparison = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#quantifiedComparison.
SqlBaseListener.prototype.enterQuantifiedComparison = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#quantifiedComparison.
SqlBaseListener.prototype.exitQuantifiedComparison = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#between.
SqlBaseListener.prototype.enterBetween = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#between.
SqlBaseListener.prototype.exitBetween = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#inList.
SqlBaseListener.prototype.enterInList = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#inList.
SqlBaseListener.prototype.exitInList = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#inSubquery.
SqlBaseListener.prototype.enterInSubquery = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#inSubquery.
SqlBaseListener.prototype.exitInSubquery = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#like.
SqlBaseListener.prototype.enterLike = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#like.
SqlBaseListener.prototype.exitLike = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#nullPredicate.
SqlBaseListener.prototype.enterNullPredicate = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#nullPredicate.
SqlBaseListener.prototype.exitNullPredicate = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#distinctFrom.
SqlBaseListener.prototype.enterDistinctFrom = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#distinctFrom.
SqlBaseListener.prototype.exitDistinctFrom = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#valueExpressionDefault.
SqlBaseListener.prototype.enterValueExpressionDefault = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#valueExpressionDefault.
SqlBaseListener.prototype.exitValueExpressionDefault = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#concatenation.
SqlBaseListener.prototype.enterConcatenation = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#concatenation.
SqlBaseListener.prototype.exitConcatenation = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#arithmeticBinary.
SqlBaseListener.prototype.enterArithmeticBinary = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#arithmeticBinary.
SqlBaseListener.prototype.exitArithmeticBinary = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#arithmeticUnary.
SqlBaseListener.prototype.enterArithmeticUnary = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#arithmeticUnary.
SqlBaseListener.prototype.exitArithmeticUnary = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#atTimeZone.
SqlBaseListener.prototype.enterAtTimeZone = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#atTimeZone.
SqlBaseListener.prototype.exitAtTimeZone = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#dereference.
SqlBaseListener.prototype.enterDereference = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#dereference.
SqlBaseListener.prototype.exitDereference = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#typeConstructor.
SqlBaseListener.prototype.enterTypeConstructor = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#typeConstructor.
SqlBaseListener.prototype.exitTypeConstructor = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#specialDateTimeFunction.
SqlBaseListener.prototype.enterSpecialDateTimeFunction = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#specialDateTimeFunction.
SqlBaseListener.prototype.exitSpecialDateTimeFunction = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#substring.
SqlBaseListener.prototype.enterSubstring = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#substring.
SqlBaseListener.prototype.exitSubstring = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#cast.
SqlBaseListener.prototype.enterCast = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#cast.
SqlBaseListener.prototype.exitCast = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#lambda.
SqlBaseListener.prototype.enterLambda = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#lambda.
SqlBaseListener.prototype.exitLambda = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#parameter.
SqlBaseListener.prototype.enterParameter = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#parameter.
SqlBaseListener.prototype.exitParameter = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#normalize.
SqlBaseListener.prototype.enterNormalize = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#normalize.
SqlBaseListener.prototype.exitNormalize = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#intervalLiteral.
SqlBaseListener.prototype.enterIntervalLiteral = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#intervalLiteral.
SqlBaseListener.prototype.exitIntervalLiteral = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#numericLiteral.
SqlBaseListener.prototype.enterNumericLiteral = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#numericLiteral.
SqlBaseListener.prototype.exitNumericLiteral = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#booleanLiteral.
SqlBaseListener.prototype.enterBooleanLiteral = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#booleanLiteral.
SqlBaseListener.prototype.exitBooleanLiteral = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#implicitRowConstructor.
SqlBaseListener.prototype.enterImplicitRowConstructor = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#implicitRowConstructor.
SqlBaseListener.prototype.exitImplicitRowConstructor = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#simpleCase.
SqlBaseListener.prototype.enterSimpleCase = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#simpleCase.
SqlBaseListener.prototype.exitSimpleCase = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#columnReference.
SqlBaseListener.prototype.enterColumnReference = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#columnReference.
SqlBaseListener.prototype.exitColumnReference = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#nullLiteral.
SqlBaseListener.prototype.enterNullLiteral = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#nullLiteral.
SqlBaseListener.prototype.exitNullLiteral = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#rowConstructor.
SqlBaseListener.prototype.enterRowConstructor = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#rowConstructor.
SqlBaseListener.prototype.exitRowConstructor = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#subscript.
SqlBaseListener.prototype.enterSubscript = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#subscript.
SqlBaseListener.prototype.exitSubscript = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#subqueryExpression.
SqlBaseListener.prototype.enterSubqueryExpression = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#subqueryExpression.
SqlBaseListener.prototype.exitSubqueryExpression = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#binaryLiteral.
SqlBaseListener.prototype.enterBinaryLiteral = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#binaryLiteral.
SqlBaseListener.prototype.exitBinaryLiteral = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#extract.
SqlBaseListener.prototype.enterExtract = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#extract.
SqlBaseListener.prototype.exitExtract = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#stringLiteral.
SqlBaseListener.prototype.enterStringLiteral = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#stringLiteral.
SqlBaseListener.prototype.exitStringLiteral = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#arrayConstructor.
SqlBaseListener.prototype.enterArrayConstructor = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#arrayConstructor.
SqlBaseListener.prototype.exitArrayConstructor = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#functionCall.
SqlBaseListener.prototype.enterFunctionCall = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#functionCall.
SqlBaseListener.prototype.exitFunctionCall = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#exists.
SqlBaseListener.prototype.enterExists = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#exists.
SqlBaseListener.prototype.exitExists = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#position.
SqlBaseListener.prototype.enterPosition = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#position.
SqlBaseListener.prototype.exitPosition = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#searchedCase.
SqlBaseListener.prototype.enterSearchedCase = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#searchedCase.
SqlBaseListener.prototype.exitSearchedCase = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#timeZoneInterval.
SqlBaseListener.prototype.enterTimeZoneInterval = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#timeZoneInterval.
SqlBaseListener.prototype.exitTimeZoneInterval = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#timeZoneString.
SqlBaseListener.prototype.enterTimeZoneString = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#timeZoneString.
SqlBaseListener.prototype.exitTimeZoneString = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#comparisonOperator.
SqlBaseListener.prototype.enterComparisonOperator = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#comparisonOperator.
SqlBaseListener.prototype.exitComparisonOperator = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#comparisonQuantifier.
SqlBaseListener.prototype.enterComparisonQuantifier = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#comparisonQuantifier.
SqlBaseListener.prototype.exitComparisonQuantifier = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#booleanValue.
SqlBaseListener.prototype.enterBooleanValue = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#booleanValue.
SqlBaseListener.prototype.exitBooleanValue = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#interval.
SqlBaseListener.prototype.enterInterval = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#interval.
SqlBaseListener.prototype.exitInterval = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#intervalField.
SqlBaseListener.prototype.enterIntervalField = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#intervalField.
SqlBaseListener.prototype.exitIntervalField = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#type.
SqlBaseListener.prototype.enterType = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#type.
SqlBaseListener.prototype.exitType = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#typeParameter.
SqlBaseListener.prototype.enterTypeParameter = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#typeParameter.
SqlBaseListener.prototype.exitTypeParameter = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#baseType.
SqlBaseListener.prototype.enterBaseType = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#baseType.
SqlBaseListener.prototype.exitBaseType = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#whenClause.
SqlBaseListener.prototype.enterWhenClause = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#whenClause.
SqlBaseListener.prototype.exitWhenClause = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#filter.
SqlBaseListener.prototype.enterFilter = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#filter.
SqlBaseListener.prototype.exitFilter = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#over.
SqlBaseListener.prototype.enterOver = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#over.
SqlBaseListener.prototype.exitOver = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#windowFrame.
SqlBaseListener.prototype.enterWindowFrame = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#windowFrame.
SqlBaseListener.prototype.exitWindowFrame = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#unboundedFrame.
SqlBaseListener.prototype.enterUnboundedFrame = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#unboundedFrame.
SqlBaseListener.prototype.exitUnboundedFrame = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#currentRowBound.
SqlBaseListener.prototype.enterCurrentRowBound = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#currentRowBound.
SqlBaseListener.prototype.exitCurrentRowBound = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#boundedFrame.
SqlBaseListener.prototype.enterBoundedFrame = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#boundedFrame.
SqlBaseListener.prototype.exitBoundedFrame = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#explainFormat.
SqlBaseListener.prototype.enterExplainFormat = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#explainFormat.
SqlBaseListener.prototype.exitExplainFormat = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#explainType.
SqlBaseListener.prototype.enterExplainType = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#explainType.
SqlBaseListener.prototype.exitExplainType = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#isolationLevel.
SqlBaseListener.prototype.enterIsolationLevel = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#isolationLevel.
SqlBaseListener.prototype.exitIsolationLevel = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#transactionAccessMode.
SqlBaseListener.prototype.enterTransactionAccessMode = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#transactionAccessMode.
SqlBaseListener.prototype.exitTransactionAccessMode = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#readUncommitted.
SqlBaseListener.prototype.enterReadUncommitted = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#readUncommitted.
SqlBaseListener.prototype.exitReadUncommitted = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#readCommitted.
SqlBaseListener.prototype.enterReadCommitted = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#readCommitted.
SqlBaseListener.prototype.exitReadCommitted = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#repeatableRead.
SqlBaseListener.prototype.enterRepeatableRead = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#repeatableRead.
SqlBaseListener.prototype.exitRepeatableRead = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#serializable.
SqlBaseListener.prototype.enterSerializable = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#serializable.
SqlBaseListener.prototype.exitSerializable = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#positionalArgument.
SqlBaseListener.prototype.enterPositionalArgument = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#positionalArgument.
SqlBaseListener.prototype.exitPositionalArgument = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#namedArgument.
SqlBaseListener.prototype.enterNamedArgument = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#namedArgument.
SqlBaseListener.prototype.exitNamedArgument = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#privilege.
SqlBaseListener.prototype.enterPrivilege = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#privilege.
SqlBaseListener.prototype.exitPrivilege = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#qualifiedName.
SqlBaseListener.prototype.enterQualifiedName = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#qualifiedName.
SqlBaseListener.prototype.exitQualifiedName = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#unquotedIdentifier.
SqlBaseListener.prototype.enterUnquotedIdentifier = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#unquotedIdentifier.
SqlBaseListener.prototype.exitUnquotedIdentifier = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#quotedIdentifierAlternative.
SqlBaseListener.prototype.enterQuotedIdentifierAlternative = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#quotedIdentifierAlternative.
SqlBaseListener.prototype.exitQuotedIdentifierAlternative = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#backQuotedIdentifier.
SqlBaseListener.prototype.enterBackQuotedIdentifier = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#backQuotedIdentifier.
SqlBaseListener.prototype.exitBackQuotedIdentifier = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#digitIdentifier.
SqlBaseListener.prototype.enterDigitIdentifier = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#digitIdentifier.
SqlBaseListener.prototype.exitDigitIdentifier = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#quotedIdentifier.
SqlBaseListener.prototype.enterQuotedIdentifier = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#quotedIdentifier.
SqlBaseListener.prototype.exitQuotedIdentifier = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#decimalLiteral.
SqlBaseListener.prototype.enterDecimalLiteral = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#decimalLiteral.
SqlBaseListener.prototype.exitDecimalLiteral = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#integerLiteral.
SqlBaseListener.prototype.enterIntegerLiteral = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#integerLiteral.
SqlBaseListener.prototype.exitIntegerLiteral = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#nonReserved.
SqlBaseListener.prototype.enterNonReserved = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#nonReserved.
SqlBaseListener.prototype.exitNonReserved = function(ctx) {
};


// Enter a parse tree produced by SqlBaseParser#normalForm.
SqlBaseListener.prototype.enterNormalForm = function(ctx) {
};

// Exit a parse tree produced by SqlBaseParser#normalForm.
SqlBaseListener.prototype.exitNormalForm = function(ctx) {
};



exports.SqlBaseListener = SqlBaseListener;