/* tslint:disable */

export const setupPrestoMode = (ace) => {
  ace.define("ace/mode/presto_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var SqlHighlightRules = function () {

      var keywords = (
        "select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|" +
        "when|else|end|type|left|right|join|on|outer|desc|asc|union|create|table|primary|key|if|" +
        "foreign|not|references|default|null|inner|cross|natural|database|drop|grant"
      );

      var prestoKeywords = (
        "|ALL|ALL PRIVILEGES|ALTER TABLE|ADD COLUMN|RENAME COLUMN TO|RENAME TO|AS|ASC|CALL|COMMIT|CREATE|CREATE TABLE" +
        "|CROSS JOIN|CUBE|DATA|DELETE FROM|DESC|DESCRIBE|DISTINCT|DISTRIBUTED|DROP TABLE|DROP VIEW|EXPLAIN" +
        "|EXPLAIN ANALYZE|FORMAT|FROM|FULL|GRANT|GRANT OPTION FOR|GRAPHVIZ|GROUP BY|GROUPING SETS|HAVING|IF EXISTS" +
        "|IF NOT EXISTS|INNER|INSERT INTO|ISOLATION LEVEL|JOIN|LEFT|LIKE|LIMIT|LOGICAL|NO|ON|ONLY|OR REPLACE|ORDER BY" +
        "|OUTER|PUBLIC|READ|READ COMMITTED|READ UNCOMMITTED|REPEATABLE READ|RESET SESSION|REVOKE|RIGHT|ROLLBACK|ROLLUP" +
        "|SELECT|SERIALIZABLE|SET SESSION|SHOW CATALOGS|SHOW COLUMNS FROM|SHOW CREATE TABLE|SHOW CREATE VIEW" +
        "|SHOW FUNCTIONS|SHOW PARTITIONS FROM|SHOW SCHEMAS|SHOW SESSION|SHOW TABLES|START TRANSACTION|TABLE" +
        "|TEXT|TO|TYPE|UNION|USE|USING|VALUES|VIEW AS|WHERE|WITH|WITH GRANT OPTION|WORK|WRITE"
      );

      var builtinConstants = (
        "true|false"
      );

      var builtinFunctions = (
        "avg|count|first|last|max|min|sum|ucase|lcase|mid|len|round|rank|now|format|" +
        "coalesce|ifnull|isnull|nvl"
      );

      var prestoFunctions = (
        "|abs|acos|approx_distinct|approx_percentile|arbitrary|array_agg|array_distinct|array_intersect|array_join|" +
        "array_max|array_min|array_position|array_remove|array_sort|asin|atan|atan2|avg|bar|bit_count|bitwise_and|" +
        "bitwise_not|bitwise_or|bitwise_xor|bool_and|bool_or|cardinality|cardinality|cast|cbrt|ceil|ceiling|" +
        "char2hexint|checksum|chr|color|concat|concat|contains|corr|cos|cosh|cosine_similarity|count|count_if|" +
        "covar_pop|covar_samp|cume_dist|current_timezone|date_add|date_diff|date_format|date_parse|date_trunc|day|" +
        "day_of_month|day_of_week|day_of_year|degrees|dense_rank|dow|doy|e|element_at|element_at|every|exp|extract|" +
        "first_value|flatten|floor|format_datetime|from_base|from_base64|from_base64url|from_hex|from_iso8601_date|" +
        "from_iso8601_timestamp|from_unixtime|from_utf8|geometric_mean|greatest|histogram|hour|index|infinity|is_finite|" +
        "is_infinite|is_nan|json_array_contains|json_array_get|json_array_length|json_extract|json_extract_scalar|" +
        "json_format|json_parse|json_size|lag|last_value|lead|least|length|length|ln|log|log10|log2|lower|lpad|ltrim|" +
        "map|map_agg|map_concat|map_keys|map_union|map_values|max|max_by|md5|min|min_by|minute|mod|month|multimap_agg|" +
        "nan|normalize|now|nth_value|ntile|numeric_histogram|parse_datetime|percent_rank|pi|position|pow|power|quarter|" +
        "radians|rand|random|rank|regexp_extract|regexp_extract_all|regexp_like|regexp_replace|regexp_split|" +
        "regr_intercept|regr_slope|render|replace|reverse|rgb|round|row_number|rpad|rtrim|second|sequence|" +
        "sha1|sha256|sha512|sign|sin|slice|split|split_part|split_to_map|sqrt|stddev|stddev_pop|stddev_samp|strpos|" +
        "substr|substring|sum|tan|tanh|timezone_hour|timezone_minute|to_base|to_base64|to_base64url|to_char|to_date|" +
        "to_hex|to_iso8601|to_timestamp|to_unixtime|to_utf8|trim|truncate|try_cast|upper|url_decode|url_encode|" +
        "url_extract_fragment|url_extract_host|url_extract_parameter|url_extract_path|url_extract_port|" +
        "url_extract_protocol|url_extract_query|var_pop|var_samp|variance|week|week_of_year|width_bucket|" +
        "year|year_of_week|yow|zip"
      );

      var dataTypes = (
        "int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|" +
        "money|real|number|integer"
      );

      var prestoDataTypes = "|varbinary|json|time|interval|array|map";

      var keywordMapper = this.createKeywordMapper({
        "support.function": builtinFunctions + prestoFunctions,
        "keyword": keywords + prestoKeywords,
        "constant.language": builtinConstants,
        "storage.type": dataTypes + prestoDataTypes
      }, "identifier", true);

      this.$rules = {
        "start": [{
          token: "comment",
          regex: "--.*$"
        }, {
          token: "comment",
          start: "/\\*",
          end: "\\*/"
        }, {
          token: "string",           // " string
          start: '"',
          end: '"'
        }, {
          token: "string",           // ' string
          start: "'",
          end:   "'"
        }, {
          token: "constant.numeric", // float
          regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
          token: keywordMapper,
          regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
          token: "keyword.operator",
          regex: "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
        }, {
          token: "paren.lparen",
          regex: "[\\(]"
        }, {
          token: "paren.rparen",
          regex: "[\\)]"
        }, {
          token: "text",
          regex: "\\s+"
        }, {
          token: "custom-keyword--reference",
          regex: "@[^\\s@]+"
        }]
      };
      this.normalizeRules();
    };

    oop.inherits(SqlHighlightRules, TextHighlightRules);

    exports.SqlHighlightRules = SqlHighlightRules;
  });


  ace.define("ace/mode/folding/presto", ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode", "ace/range"],
    function (require, exports, module) {
      "use strict";

      // function escapeRegExp(str) {
      //   return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      // }

      var oop = require("../../lib/oop");
      var Range = require("../../range").Range;
      var BaseFoldMode = require("./fold_mode").FoldMode;
      var TokenIterator = require("../../token_iterator").TokenIterator;

      var FoldMode = exports.FoldMode = function () {};
      oop.inherits(FoldMode, BaseFoldMode);

      (function () {
        this.foldingStartMarker = /(\()[^)]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^(]*(\))|^.*(\*\/)/;
        this.singleLineBlockCommentRe = /^.*(\/\*).*\*\/.*$/;
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
        this.startRegionRe = /^\s*--#?region\b/;
        this.sqlCommentRe = /^--.*/;
        this._getFoldWidgetBase = this.getFoldWidget;

        this.getFoldWidget = function (session, foldStyle, row) {
          var line = session.getLine(row);

          // if (this.sqlCommentRe.test(line)) {
          //   return this.sqlCommentFoldWidget(session, foldStyle, row);
          // }

          if (this.singleLineBlockCommentRe.test(line)) {
            if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
              return "";
          }

          var fw = this._getFoldWidgetBase(session, foldStyle, row);

          if (!fw && this.startRegionRe.test(line))
            return "start"; // lineCommentRegionStart

          if (!fw && this.isStartIndentationBlock(session, line, row)) {
            return "start";
          }

          return fw;
        };

        this.getFoldWidgetRange = function (session, foldStyle, row, forceMultiline) {
          var line = session.getLine(row);

          if (this.startRegionRe.test(line))
            return this.getCommentRegionBlock(session, line, row);

          // if (this.sqlCommentRe.test(line)) {
          //   var type = this.sqlCommentFoldWidget(session, foldStyle, row);
          //   if (type === "start") {
          //     return  this.getCommentFoldRange(session, row, 0, 1);
          //   } else if (type === "end") {
          //     return  this.getCommentFoldRange(session, row, line.length - 1, -1);
          //   } else {
          //     return;
          //   }
          // }

          var match = line.match(this.foldingStartMarker);
          if (match) {
            var i = match.index;

            if (match[1])
              return this.openingBracketBlock(session, match[1], row, i);

            var range = this.getCommentFoldRange(session, row, i + match[0].length, 1);

            if (range && !range.isMultiLine()) {
              if (forceMultiline) {
                range = this.getSectionRange(session, row);
              } else if (foldStyle != "all")
                range = null;
            }

            return range;
          }

          if (foldStyle === "markbegin")
            return;

          var match = line.match(this.foldingStopMarker);
          if (match) {
            var i = match.index + match[0].length;

            if (match[1])
              return this.closingBracketBlock(session, match[1], row, i);

            return this.getCommentFoldRange(session, row, i, -1);
          }

          if (this.isStartIndentationBlock(session, line, row)) {
            return this.indentationBlock(session, row);
          }

        };

        this.isStartIndentationBlock = function (session, line, row) {
          if (session.getLength() - 1 === row) {
            return;
          }
          var re = /\S/;
          var nextLineRow = row + 1;
          var firstCharPosNextLine;
          var firstCharPos = line.search(re);
          if (firstCharPos !== -1) {
            do {
              firstCharPosNextLine = session.getLine(nextLineRow).search(re);
            } while (firstCharPosNextLine === -1 && session.getLength() > ++nextLineRow);
            if (firstCharPosNextLine !== -1 && firstCharPos < firstCharPosNextLine) {
              return 'start';
            }
          }
        };

        // this.sqlCommentFoldWidget = function (session, foldStyle, row) {
        //   var nextLine = session.getLine(row + 1);
        //   var prevLine = session.getLine(row - 1);
        //   var nextLineIsComment = this.sqlCommentRe.test(nextLine);
        //   var prevLineIsComment = this.sqlCommentRe.test(prevLine);
        //   if (nextLineIsComment && !prevLineIsComment) {
        //     return 'start';
        //   } else if (foldStyle === 'markbeginend' && !nextLineIsComment && prevLineIsComment) {
        //     return 'end';
        //   } else {
        //     return '';
        //   }
        // };

        this.getCommentFoldRange = function (session, row, column, dir) {
          var iterator = new TokenIterator(session, row, column);
          var token = iterator.getCurrentToken();
          if (token && /^comment|string/.test(token.type)) {
            var range = new Range();
            var re = new RegExp(token.type.replace(/\..*/, ""));
            if (dir != 1) {
              do {
                token = iterator.stepBackward();
              } while (token && re.test(token.type));
              iterator.stepForward();
            }

            range.start.row = iterator.getCurrentTokenRow();
            // range.start.row = iterator.getCurrentTokenRow() + 1;
            // range.start.column = iterator.getCurrentTokenColumn() + 2;
            range.start.column = session.getLine(iterator.getCurrentTokenRow()).length;


            iterator = new TokenIterator(session, row, column);

            if (dir != -1) {
              do {
                token = iterator.stepForward();
              } while (token && re.test(token.type));
              token = iterator.stepBackward();
            } else
              token = iterator.getCurrentToken();

            range.end.row = iterator.getCurrentTokenRow();
            range.end.column = iterator.getCurrentTokenColumn() + token.value.length - 2;
            return range;
          }
        };

        this.getSectionRange = function (session, row) {
          var line = session.getLine(row);
          var startIndent = line.search(/\S/);
          var startRow = row;
          var startColumn = line.length;
          row = row + 1;
          var endRow = row;
          var maxRow = session.getLength();
          while (++row < maxRow) {
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1)
              continue;
            if (startIndent > indent)
              break;
            var subRange = this.getFoldWidgetRange(session, "all", row);

            if (subRange) {
              if (subRange.start.row <= startRow) {
                break;
              } else if (subRange.isMultiLine()) {
                row = subRange.end.row;
              } else if (startIndent == indent) {
                break;
              }
            }
            endRow = row;
          }

          return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
        };
        this.getCommentRegionBlock = function (session, line, row) {
          var startColumn = line.search(/\s*$/);
          var maxRow = session.getLength();
          var startRow = row;

          var re = /^\s*--#?(end)?region\b/;
          var depth = 1;
          while (++row < maxRow) {
            line = session.getLine(row);
            var m = re.exec(line);
            if (!m) continue;
            if (m[1]) depth--;
            else depth++;

            if (!depth) break;
          }

          var endRow = row;
          if (endRow > startRow) {
            return new Range(startRow, startColumn, endRow, line.length);
          }
        };

      }).call(FoldMode.prototype);

    });

  ace.define("ace/mode/presto", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/presto_highlight_rules", "ace/range"], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var SqlHighlightRules = require("./presto_highlight_rules").SqlHighlightRules;
    // var Range = require("../range").Range;
    var SqlFoldMode = require("./folding/presto").FoldMode;

    var Mode = function () {
      this.HighlightRules = SqlHighlightRules;
      this.foldingRules = new SqlFoldMode();

    };
    oop.inherits(Mode, TextMode);

    (function () {
      this.lineCommentStart = "--";
      this.$id = "ace/mode/presto";

      // syntax validation worker
      // var WorkerClient = require("ace/worker/worker_client").WorkerClient;
      // this.createWorker = function(session) {
      //   var document = session.getDocument();

      //   this.$worker = new WorkerClient(["ace"], "ace/worker/sql-worker", "SqlWorker", "3rd-party/ace/modes/sql-worker.js");
      //   this.$worker.attachToDocument(document);

      //   this.$worker.on('annotate', function(e) {
      //     session.setAnnotations(e.data);
      //   });

      //   this.$worker.on('terminate', function() {
      //     session.clearAnnotations();
      //   });

      //   return this.$worker;
      // };
    }).call(Mode.prototype);

    exports.Mode = Mode;

  });
}