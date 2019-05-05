import {IFile} from '../../../shared';
import {utils} from '../lib/core';

export const convert = (nodes: any[], path = [], res = []) => {
  nodes.forEach(node => {
    const id = utils.uuid();

    if (!node.children) {
      res.push({id, name: node.name, path, type: 'column', nodeType: node.dataType});
    } else if (!node.children.length && node.type === 'table') {
      res.push({id, name: node.name, path, type: 'folder', nodeType: node.type, lazy: true});
    } else {
      res.push({id, name: node.name, path, type: 'folder', nodeType: node.type});

      convert(node.children, [...path, {id, name: node.name}], res);
    }
  });

  return res;
}

export const getFullTableName = (table: IFile) => {
  return [...table.path, table].map(({name}) => name).join('.');
}

export const getTableQuery = (table: IFile) => `SELECT *
FROM ${getFullTableName(table)}
LIMIT 1000
`;
