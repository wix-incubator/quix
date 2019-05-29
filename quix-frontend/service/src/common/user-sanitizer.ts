export const sanitizeUserEmail = (email: string) => {
  const [user, domain] = (email || 'dummy@dummy.com').split('@');

  return ['***', domain].join('@');
};

export const sanitizeUserName = (name: string) => {
  return 'Quix User';
};
