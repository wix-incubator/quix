export default [
  '$sce',
  ($sce) => {
    return (haystack, needle: string | string[]) => {
      if (!haystack || !needle) {
        return haystack;
      }
      const needles: string[] = typeof needle === 'string' ? [needle] : needle;


      // tslint:disable-next-line: restrict-plus-operands
      // return $sce.trustAsHtml(
      //   needles.reduce((previousHaystack, currentNeedle) => {
      //     return previousHaystack.replace(
      //       new RegExp(`(${currentNeedle})(?!.*<mark>|.*</mark>).*$`, "gi"),
      //       "<mark>$1</mark>"
      //     );
      //   }, "" + haystack)
      // );

      // tslint:disable-next-line: restrict-plus-operands
      return $sce.trustAsHtml(('' + haystack).replace(new RegExp(needles.map(n => `(${n})`).join('|'), 'gi'), match => `<mark>${match}</mark>`));
    };
  },
];
