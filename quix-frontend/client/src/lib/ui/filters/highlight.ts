export default ['$sce', $sce => {
  return (haystack, needle) => {
    if (!haystack || !needle) {
      return haystack;
    }
      // tslint:disable-next-line: restrict-plus-operands
      return $sce.trustAsHtml(('' + haystack).replace(new RegExp(`(${needle})`, 'gi'), '<mark>$1</mark>'));

  };
}];
