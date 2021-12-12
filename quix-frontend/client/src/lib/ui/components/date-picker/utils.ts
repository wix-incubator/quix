export const getKeyByValue = (object: Record<string, any>, value: string) => {
  return Object.keys(object).find((key) => object[key] === value);
};

const numbersRegex = /\d+/;
export const getAmountAndUnitFromString = (str: string) => {
  const amount = str.match(numbersRegex);
  const unit = str.split(amount![0]).pop();
  return [amount as any, unit];
};
