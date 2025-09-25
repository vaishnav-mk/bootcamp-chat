let sequence = 0;
let lastTimestamp = 0n;

export const generateSnowflake = (): bigint => {
  let now = BigInt(Date.now());

  if (now === lastTimestamp) {
    sequence++;
    if (sequence > 4095) {
      while (now <= lastTimestamp) {
        now = BigInt(Date.now());
      }
      sequence = 0;
    }
  } else {
    sequence = 0;
  }

  lastTimestamp = now;

  const timestampPart = now << 12n;
  const sequencePart = BigInt(sequence);

  return timestampPart | sequencePart;
};
