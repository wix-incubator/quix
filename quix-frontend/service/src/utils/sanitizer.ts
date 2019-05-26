export const sanitizeUserEmail = (email: string) => {
  const [user, domain] = (email || 'dummy@dummy.com').split('@');

  return ['***', domain].join('@');
};

export const sanitizeUserName = (name: string) => {
  const [first, last] = (name || 'Dummy Dummy').split(' ');

  return [`${first[0]}***`, `${last[0]}***`].join(' ');
};
