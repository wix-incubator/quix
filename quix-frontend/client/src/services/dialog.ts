import { isArray } from 'lodash';
import { confirm } from '../lib/ui';
import { utils } from '../lib/core';

function contextText(context: any, type: string) {
  console.log(context);
  return isArray(context)
    ? `the <b>(${context.length})</b> selected ${utils.dom.escape(type)}s`
    : `the ${utils.dom.escape(type)} <b>"${utils.dom.escape(
        context.name
      )}</b>"`;
}

function confirmActionTitle(action: string, type: string): string {
  switch (action) {
    case 'delete':
      return `${action} ${type}`;
    case 'trash':
      return `Move ${type} to Trash Bin`;
    default:
      return `Operation failed`;
  }
}

function actionText(action: string) {
  switch (action) {
    case 'trash':
      return 'move';
    case 'delete':
      return 'delete';
    default:
      return '';
  }
}

function confirmHtml(
  action: string,
  context: any,
  type: string,
  customText: string
): string {
  const custom = customText ? `(${utils.dom.escape(customText)})` : '';
  const areYouSure =
    'Are you sure you want to ' +
    `${actionText(action)} ${contextText(context, type)}`;

  switch (action) {
    case 'delete':
      return `
      <div>
        ${areYouSure}
        ${custom} ?
      </div>`;
    case 'trash':
      return `
      <div>
        ${areYouSure} to Trash Bin
        ${custom} ?
      </div>`;
    default:
      return `${customText}`;
  }
}

export const confirmAction = (
  action: 'delete' | 'trash' | 'retry',
  type: 'notebook' | 'note' | 'folder' | 'item',
  context: any,
  customText = '',
  onConfirm: (scope: any) => any = () => {}
) => {
  return confirm({
    title: confirmActionTitle(action, type),
    actionType: { delete: 'destroy' }[action] || 'neutral',
    icon: { delete: 'delete_forever', retry: 'report' }[action] || null,
    yes: action === 'trash' ? 'move to trash bin' : action,

    onConfirm,
    html: confirmHtml(action, context, type, customText),
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
