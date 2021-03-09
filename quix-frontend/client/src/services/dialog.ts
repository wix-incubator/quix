import {isArray} from 'lodash';
import {confirm} from '../lib/ui';
import {utils} from '../lib/core';

export const confirmAction = (
    action: 'delete',
    type: 'notebook' | 'note' | 'folder',
    context: any,
    customText = ''
  ) => {
  return confirm({
    title: `${action} ${type}`,
    actionType: action === 'delete' ? 'destroy' : 'neutral',
    icon: action === 'delete' ? 'report' : null,
    yes: action,
    html: `
      <div>
        Are you sure you want to delete ${isArray(context) ? 
          `the <b>(${context.length})</b> selected ${utils.dom.escape(type)}s` 
          : `the ${utils.dom.escape(type)} <b>"${utils.dom.escape(context.name)}</b>"`}

        ${customText ? `(${utils.dom.escape(customText)})` : ''} ?
      </div>  
    `
  });
}

export const prompt = ({
  title,
  subTitle,
  yes,
  content,
  onConfirm
}: {
  title: string;
  subTitle?: string;
  yes: string;
  content: string;
  onConfirm?(scope: any): any;
}, scope?, locals?) => {
  return confirm({
    title,
    subTitle,
    actionType: 'neutral',
    yes,
    html: `<form name="form">${content}</form>`,
    onConfirm
  }, scope, locals);
}