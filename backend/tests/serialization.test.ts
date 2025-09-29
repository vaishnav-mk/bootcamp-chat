import { serializeBigInt } from '../src/utils/serialization';

describe('serializeBigInt', () => {
  it('should convert BigInt to string', () => {
    const input = BigInt(123456789);
    const result = serializeBigInt(input);
    expect(result).toBe('123456789');
  });

  it('should handle objects with BigInt properties', () => {
    const input = {
      id: BigInt(123),
      name: 'test',
      nested: {
        bigintValue: BigInt(456),
        normalValue: 'normal'
      }
    };
    
    const result = serializeBigInt(input);
    
    expect(result.id).toBe('123');
    expect(result.name).toBe('test');
    expect(result.nested.bigintValue).toBe('456');
    expect(result.nested.normalValue).toBe('normal');
  });

  it('should handle arrays with BigInt values', () => {
    const input = [BigInt(123), 'string', { id: BigInt(456) }];
    const result = serializeBigInt(input);
    
    expect(result[0]).toBe('123');
    expect(result[1]).toBe('string');
    expect(result[2].id).toBe('456');
  });

  it('should handle Date objects', () => {
    const date = new Date('2023-01-01T00:00:00.000Z');
    const input = { createdAt: date };
    const result = serializeBigInt(input);
    
    expect(result.createdAt).toBe('2023-01-01T00:00:00.000Z');
  });

  it('should handle null and undefined values', () => {
    const input = {
      nullValue: null,
      undefinedValue: undefined,
      bigintValue: BigInt(123)
    };
    
    const result = serializeBigInt(input);
    
    expect(result.nullValue).toBe(null);
    expect(result.undefinedValue).toBe(undefined);
    expect(result.bigintValue).toBe('123');
  });

  it('should handle primitive values', () => {
    expect(serializeBigInt('string')).toBe('string');
    expect(serializeBigInt(123)).toBe(123);
    expect(serializeBigInt(true)).toBe(true);
    expect(serializeBigInt(null)).toBe(null);
    expect(serializeBigInt(undefined)).toBe(undefined);
  });
});