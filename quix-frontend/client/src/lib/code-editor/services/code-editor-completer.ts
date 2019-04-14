import {find, isFunction, escapeRegExp} from 'lodash';
import {IEditSession} from 'brace';

export type ICompleterFn = (prefix: string, session?: IEditSession) => ng.IPromise<ICompleterItem[]> | ICompleterItem[];
const isPromise = <T>(maybePromise: T | ng.IPromise<T>): maybePromise is ng.IPromise<T> =>
  (maybePromise as any).then && isFunction(((maybePromise as any).then));

export interface ICompleterItem {
  value: string;
  meta: string;
  caption?: string;
  matchMask?: number[];
}
export interface IAceCompleter {
  identifierRegexps: RegExp[];
  getCompletions(editor, session: IEditSession, pos, prefix: string, callback): void;
  linePredicate?(line: string): boolean; /* do another check on the line that isn't (necessarily) regex based */
  acceptEmptyString?: boolean;
  prefix?: string; /* for live completion */
}

function createCompleter(fn: ICompleterFn, prefixRegex: RegExp,
  options: {prefix?: string; acceptEmptyString?: boolean; linePredicate?: any } = {}): IAceCompleter {

  return {
    identifierRegexps: [prefixRegex],
    getCompletions(editor, session: IEditSession, pos, prefix: string, callback) {
      const completions = fn(prefix, session);

      if (!completions) {
        return;
      }

      if (isPromise(completions)) {
        completions.then(c => callback(null, c));
      } else {
        callback(null, completions);
      }
    },
    ...options
  };
}

function createLiveCompleter(prefix: string, fn: ICompleterFn) {
  const regex = new RegExp(escapeRegExp(prefix));
  const completer = createCompleter(_prefix => _prefix === prefix && fn(prefix), regex, {prefix});

  return completer;
}

export default class CodeEditorCompleter {
  private readonly completers = [];

  constructor(ace) {
    ace.setOptions({
      enableBasicAutocompletion: this.completers,
      enableSnippets: false,
      enableLiveAutocompletion: false
    });

    ace.getSession().on('change', e => {
      if (e.action === 'insert' && find(this.completers, {prefix: e.lines[0]})) {
        setTimeout(() => ace.commands.byName.startAutocomplete.exec(ace), 0);
      }
    });
  }

  addLiveCompleter(prefix: string, fn: ICompleterFn) {
    this.completers.push(createLiveCompleter(prefix, fn));
  }

  addOnDemandCompleter(identifierRegex: RegExp, fn: ICompleterFn, options?) {
    this.completers.push(createCompleter(fn, identifierRegex, options));
  }
}
