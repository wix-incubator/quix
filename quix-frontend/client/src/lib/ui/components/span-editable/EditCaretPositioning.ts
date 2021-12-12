/* tslint:disable:no-conditional-assignment */
// Allows save cursor position after rerendering
// https://stackoverflow.com/a/55887417/8557614

const EditCaretPositioning = {} as any;

export default EditCaretPositioning;

if (window.getSelection && document.createRange) {
  // saves caret position(s)
  EditCaretPositioning.saveSelection = function (containerEl: any) {
    const range = (window as any).getSelection().getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    return {
      start,
      end: start + range.toString().length,
    };
  };
  // restores caret position(s)
  EditCaretPositioning.restoreSelection = function (
    containerEl: any,
    savedSel: any,
  ) {
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    const nodeStack = [containerEl];
    let node;
    let foundStart = false;
    let stop = false;

    // eslint-disable-next-line no-cond-assign
    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === 3) {
        const nextCharIndex = charIndex + node.length;
        if (
          !foundStart &&
          savedSel.start >= charIndex &&
          savedSel.start <= nextCharIndex
        ) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (
          foundStart &&
          savedSel.end >= charIndex &&
          savedSel.end <= nextCharIndex
        ) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    const sel = window.getSelection() as any;
    sel.removeAllRanges();
    sel.addRange(range);
  };
} else if (
  (document as any).selection &&
  (document.body as any).createTextRange
) {
  // saves caret position(s)
  EditCaretPositioning.saveSelection = function (containerEl: any) {
    const selectedTextRange = (document as any).selection.createRange();
    const preSelectionTextRange = (document as any).body.createTextRange();
    preSelectionTextRange.moveToElementText(containerEl);
    preSelectionTextRange.setEndPoint('EndToStart', selectedTextRange);
    const start = preSelectionTextRange.text.length;

    return {
      start,
      end: start + selectedTextRange.text.length,
    };
  };
  // restores caret position(s)
  EditCaretPositioning.restoreSelection = function (
    containerEl: any,
    savedSel: any,
  ) {
    const textRange = (document as any).body.createTextRange();
    textRange.moveToElementText(containerEl);
    textRange.collapse(true);
    textRange.moveEnd('character', savedSel.end);
    textRange.moveStart('character', savedSel.start);
    textRange.select();
  };
}
