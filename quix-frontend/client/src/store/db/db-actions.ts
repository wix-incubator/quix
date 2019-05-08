export const setDb = (db: any[], origin: 'user' | 'machine' = 'machine') => ({
  type: 'db.set',
  db,
  origin
});

export const setError = (error: any, origin: 'user' | 'machine' = 'machine') => ({
  type: 'db.setError',
  error,
  origin
});

export const addColumns = (id, columns: any[], origin: 'user' | 'machine' = 'machine') => ({
  type: 'db.addColumns',
  id,
  columns,
  origin
});

