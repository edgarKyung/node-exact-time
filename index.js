const standardTime = new Date().getTime() * 0.001;
const standardTick = process.hrtime();
const getNanoTime = () => {
  const currentTick = process.hrtime(standardTick);
  const currentTime = standardTime + currentTick[0] + currentTick[1] * 0.000000001;
  const secs = Math.floor(currentTime);
  const nsecs = Math.floor((currentTime - secs) * 1000000000);
  return { secs, nsecs }
};


const nextTick = () => new Promise((resolve) => process.nextTick(resolve));

const immediate = () => new Promise((resolve) => setImmediate(resolve));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkFineRate = async (fineRate) => {
  let maxTime = 0;
  for (let i = 0; i < 50; i += 1) {
    const startTime = process.hrtime();
    await sleep(0);
    const endTime = process.hrtime();
    const duration = (endTime[0] - startTime[0]) * 1000 + (endTime[1] - startTime[1]) * 0.000001;
    maxTime = duration > maxTime ? duration : maxTime;
  }
  return Math.ceil(maxTime * fineRate);
}

const _wait = async (targetTick, offset) => {
  while (true) {
    const nanoTime = getNanoTime();
    const now = Math.floor(nanoTime.secs * 1000 + nanoTime.nsecs * 0.000001);
    if (now >= targetTick) {
      return nanoTime;
    }
    if (targetTick - now <= offset) {
      await immediate();
      continue;
    }
    await sleep(targetTick - now - offset);
  }
};

const timer = ({ name, delay, fineRate = 0 }) => {
  console.log(`Add Timer: ${`   ${delay}`.slice(-4)}ms / ${name}`);
  let offset = fineRate === 0 ? 0 : null;
  (async () => offset = await checkFineRate(fineRate))();
  let gNextTarget = 0;
  return {
    wait: async () => {
      while (offset === null) {
        await sleep(50);
      }
      if (gNextTarget === 0) {
        const now = new Date().getTime();
        gNextTarget = now + delay - now % delay;
      }
      const targetTime = await _wait(gNextTarget, offset);
      gNextTarget += delay;
      return targetTime;
    }
  };
};

const benchmark = async ({ count = 30, time = 20, offset = 1 }) => {
  const bench = { total: 0, count, mean: 0, min: 999999999, max: 0 };
  for (let i = 0; i < count; i += 1) {
    let loopCount = 0;
    let nextTarget = 0;
    while (true) {
      bench.total += 1;
      loopCount += 1;
      const now = new Date().getTime();
      if (nextTarget === 0) {
        nextTarget = now + time - now % time;
      }
      if (now >= nextTarget) {
        nextTarget += time;
        break;
      }
      if (nextTarget - now <= offset) {
        await immediate();
        continue;
      }
      await sleep(nextTarget - now - offset);
    }
    bench.max = loopCount > bench.max ? loopCount : bench.max;
    bench.min = loopCount > bench.min ? bench.max : loopCount;
  }
  bench.mean = bench.total / count;
  return bench;
};

module.exports = {
  getNanoTime,
  nextTick,
  immediate,
  sleep,
  timer,
  benchmark,
};
