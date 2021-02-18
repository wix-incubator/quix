export const sanitizeTableToken = (token: string, quoteChar: string) => {
  if (token.includes('.') || token.includes('-')) {
    return `${quoteChar}${token}${quoteChar}`;
  }

  return token;
}
