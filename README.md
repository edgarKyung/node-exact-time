# node-exact-time

```
const nodeExactTime = require('node-exact-time');
nodeExactTime.getNanoTime();
await nodeExactTime.nextTick();
await nodeExactTime.immediate();
await nodeExactTime.sleep(ms);

const timer = nodeExactTime.timer({name:'Sample Timer', delay:10, fineRate:1});
while(true){
  const nanoTime = await timer.wait();
  console.log(new Date().getTime(), nanoTime);
}

const benchmark = nodeExactTime.benchmark();
```
