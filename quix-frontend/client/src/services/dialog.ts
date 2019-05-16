import {confirm as confirmDialog} from '../lib/ui';

export const confirmAction = (action: 'delete', context: 'notebook' | 'note' | 'folder', list = false) => {
  return confirmDialog({
    title: `${action} ${context}`,
    actionType: action === 'delete' ? 'destroy' : 'neutral',
    icon: action === 'delete' ? 'report' : null,
    yes: action,
    html: `Are you sure you want to delete ${list ? 'the selected' : 'this'} ${context}?`
  });
}

export const prompt = ({
  title,
  subTitle,
  yes,
  content
}: {
  title: string;
  subTitle?: string;
  yes: string;
  content: string;
}, scope?, locals?) => {
  return confirmDialog({
    title,
    subTitle,
    actionType: 'neutral',
    yes,
    html: `<form name="form">${content}</form>`
  }, scope, locals);
}