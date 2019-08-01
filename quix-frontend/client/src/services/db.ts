import {utils} from '../lib/core';

export const convert = (nodes: any[], {hideRoot}, path = [], res = []) => {
  nodes.forEach(node => {
    const id = utils.uuid();

    if (!node.children) {
      res.push({id, name: node.name, path, type: 'column', nodeType: node.dataType});
    } else if (!node.children.length && node.type === 'table') {
      res.push({id, name: node.name, path, type: 'folder', nodeType: node.type, lazy: true});
    } else {
      if (!hideRoot) {
        res.push({id, name: node.name, path, type: 'folder', nodeType: node.type});
      }

      convert(node.children, {hideRoot: false}, hideRoot ? path : [...path, {id, name: node.name}], res);
    }
  });

  return res;
}

export const sanitizeTableToken = (token: string, quoteChar: string) => {
  if (token.includes('.') || token.includes('-')) {
    return `${quoteChar}${token}${quoteChar}`;
  }

  return token;
}
