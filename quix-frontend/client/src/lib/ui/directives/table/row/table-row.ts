import {assign} from 'lodash';
import angular from 'angular';
import {inject} from '../../../../core';

export default () => {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#x2F;'
    };

    const htmlEscape = function (string) {
      if (typeof string === 'undefined') {
        return '';
      }

      // tslint:disable-next-line: restrict-plus-operands
      return ('' + string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
      });
    };

    const getColumnsHtml = function (row, fields, index, formatter) {
      const res = [];

      fields.forEach(function (field) {
        const data = typeof row.data === 'object' ? row.data : row;
        const name = field.name || field;
        let content;

        const contentElement = angular.element('<td class="' + htmlEscape(name) + '-column"><div class="bi-table-row-value"></div></td>');
        const $compile: angular.ICompileService = inject('$compile');

        if (field.filter) {
          content = field.filter(data[name], row, index, (html, locals, scope) => $compile(html)(assign(scope.$new(), locals))
            .on('$destroy', e => {
              const elementScope = angular.element(e.target).scope();

              if (elementScope) {
                elementScope.$destroy();
              }
            }));
        } else if (formatter) {
          content = formatter(name, data[name], row, index, (html, locals, scope) => $compile(html)(assign(scope.$new(), locals)));
        } else {
          content = htmlEscape(data[name]);
        }

        if (typeof content === 'object') {
          contentElement.html(content);
        } else {
          contentElement.html(content === '' ? '&nbsp;' : content);
        }

        res.push(contentElement);
      });

      return res;
    };

    return {
      restrict: 'A',
      scope: {
        fields: '=',
        row: '=',
        index: '<',
        formatter: '&',
        biTableRowOptions: '='
      },

      link: {
        pre(scope, element) {
          if (scope.biTableRowOptions.dynamicFields) {
            scope.$watch('fields', fields => {
              element.html(getColumnsHtml(scope.row, scope.fields, scope.index, scope.formatter()));
            });
          } else {
            element.html(getColumnsHtml(scope.row, scope.fields, scope.index, scope.formatter()));
          }
        }
      }
    };
  };
