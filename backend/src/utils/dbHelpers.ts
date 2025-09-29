export const toBigInt = (value: string | number | bigint): bigint => {
  return typeof value === 'bigint' ? value : BigInt(value);
};

export const toBigIntArray = (values: (string | number | bigint)[]): bigint[] => {
  return values.map(toBigInt);
};

export const toString = (value: bigint | string | number): string => {
  return value.toString();
};