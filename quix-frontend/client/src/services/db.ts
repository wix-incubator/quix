export const convert = (nodes: any[], path = [], res = []) => {
  nodes.forEach(node => {
    if (!node.children) {
      res.push({id: node.name, name: node.name, path, type: 'column', lazy: true});
    } else if (!node.children.length) {
      res.push({id: node.name, name: node.name, path, type: 'folder', lazy: true});
    } else {
      res.push({id: node.name, name: node.name, path, type: 'folder'});
      convert(node.children, [...path, {id: node.name, name: node.name}], res);
    }
  });

  return res;
}
