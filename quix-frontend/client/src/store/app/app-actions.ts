import * as Runners from '../../services/runners';

export const search = (searchText: string, origin: 'user' | 'machine' = 'machine') => ({
  type: 'app.setSearchText',
  searchText,
  origin
});

export const addRunner = (id: string, runner: string, origin: 'user' | 'machine' = 'machine') => {
  Runners.addRunner(id, runner);

  return {
    type: 'app.addRunner',
    id,
    origin
  };
};

export const removeRunner = (id: string, origin: 'user' | 'machine' = 'machine') => ({
  type: 'app.removeRunner',
  id,
  origin
});
