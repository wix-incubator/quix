import { isArray } from 'lodash';
import { confirm } from '../lib/ui';
import { utils } from '../lib/core';

export const confirmAction = (
  action: 'delete' | 'retry',
  type: 'notebook' | 'note' | 'folder',
  context: any,
  customText = '',
  onConfirm: (scope: any) => any = () => {}
) => {
  return confirm({
    title: action === 'delete' ? `${action} ${type}` : `Operation failed`,
    actionType: { delete: 'destroy' }[action] || 'neutral',
    icon: { delete: 'delete_forever', retry: 'report' }[action] || null,
    yes: action,

    onConfirm,
    html:
      action === 'delete'
        ? `
      <div>
        Are you sure you want to delete ${
          isArray(context)
            ? `the <b>(${context.length})</b> selected ${utils.dom.escape(
                type
              )}s`
            : `the ${utils.dom.escape(type)} <b>"${utils.dom.escape(
                context.name
              )}</b>"`
        }

        ${customText ? `(${utils.dom.escape(customText)})` : ''} ?
      </div>  
    `
        : `${customText}`,
  });
};

export const prompt = (
  {
    title,
    subTitle,
    yes,
    content,
    onConfirm,
  }: {
    title: string;
    subTitle?: string;
    yes: string;
    content: string;
    onConfirm?(scope: any): any;
  },
  scope?,
  locals?
) => {
  return confirm(
    {
      title,
      subTitle,
      actionType: 'neutral',
      yes,
      html: `<form name="form">${content}</form>`,
      onConfirm,
    },
    scope,
    locals
  );
};
