import {setupLanguageTools} from './language-tools';
import {setupPrestoMode} from './presto.mode';
import {setupSnippets} from './presto-snippets';
import {setupSearchbox} from './searchbox';
import 'brace/mode/json';
import 'brace/mode/python';

export const setupAce = (ace) => {
  setupLanguageTools(ace);
  setupPrestoMode(ace);
  setupSnippets(ace);
  setupSearchbox(ace);
};
