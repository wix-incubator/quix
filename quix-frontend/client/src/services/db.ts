import {IFile} from '../../../shared';

export const convert = (nodes: any[], path = [], res = []) => {
  nodes.forEach(node => {
    if (!node.children) {
      res.push({id: node.name, name: node.name, path, type: 'column', nodeType: node.dataType});
    } else if (!node.children.length && node.type === 'table') {
      res.push({id: node.name, name: node.name, path, type: 'folder', nodeType: node.type, lazy: true});
    } else {
      res.push({id: node.name, name: node.name, path, type: 'folder', nodeType: node.type});

      convert(node.children, [...path, {id: node.name, name: node.name}], res);
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
