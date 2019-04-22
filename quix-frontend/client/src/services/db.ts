export const convert = (nodes: any[], path = [], res = []) => {
  nodes.forEach(node => {
    if (!node.children) {
      res.push({id: node.name, name: node.name, path, type: 'column'});
    } else if (!node.children.length && node.type === 'table') {
      res.push({id: node.name, name: node.name, path, type: 'folder', lazy: true});
    } else {
      res.push({id: node.name, name: node.name, path, type: 'folder'});
      convert(node.children, [...path, {id: node.name, name: node.name}], res);
    }
  });

  return res;
}
