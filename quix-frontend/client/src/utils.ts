export const singletone = () => {
  let state: any[] = null;
  
  const instance = (getter?: (...args: any) => any, ...args) => {
    if (typeof getter === 'undefined') {
      return state;
    }

    if (typeof getter !== 'function') {
      state = getter ? [getter, ...args] : null;
      return instance;
    }

    if (state) {
      const res = getter(...state);

      if (res === null) {
        state = null;
      }

      return res;
    }

    return instance;
  }

  return instance;
}