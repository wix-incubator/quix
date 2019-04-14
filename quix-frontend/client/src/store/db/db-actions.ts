export const setDb = (db: any, origin: 'user' | 'machine' = 'machine') => ({
  type: 'db.set',
  db,
  origin
});
