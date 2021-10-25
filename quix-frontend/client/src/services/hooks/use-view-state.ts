import { useState } from 'react';

export interface ViewStateActions<S, D> {
  get(): S;
  set(s: S, d?: Partial<D>): void;
  update(d: Partial<D>): void;
  is(s: S): boolean;
  min(s: S): boolean;
  after(s: S): boolean;
}

export const useViewState = <S extends string, D>(
  states: S[],
  defaultData: D,
) => {
  const [{ state, data }, setState] = useState({
    state: states[0],
    data: defaultData,
  });

  return [
    data,
    {
      get: () => state,
      set: (s: S, d?: Partial<D>) =>
        setState({ state: s, data: { ...data, ...d } }),
      update: (d: Partial<D>) => setState({ state, data: { ...data, ...d } }),
      is: (s: S) => s === state,
      min: (s: S) => states.indexOf(s) <= states.indexOf(state),
      after: (s: S) => states.indexOf(s) < states.indexOf(state),
    },
  ] as const;
};