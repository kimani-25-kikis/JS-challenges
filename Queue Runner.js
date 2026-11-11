const output = document.getElementById("output");

function log(label, value) {
  const line = document.createElement("p");
  line.textContent = `${label}: ${JSON.stringify(value)}`;
  output.appendChild(line);
  console.log(label, value);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class TaskQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
    this.results = [];
    this.done = null;
  }

  add(task, { priority = 0, retries = 0, name = "task" } = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        priority,
        retries,
        name,
        resolve,
        reject,
      });
      this.queue.sort((a, b) => b.priority - a.priority);
      this.pump();
    });
  }

  pump() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      this.running++;
      this.execute(job).finally(() => {
        this.running--;
        this.pump();
        this.checkDone();
      });
    }
    this.checkDone();
  }

  async execute(job) {
    let attempt = 0;
    while (attempt <= job.retries) {
      try {
        const value = await job.task();
        const record = { name: job.name, status: "fulfilled", value, attempt };
        this.results.push(record);
        job.resolve(record);
        return;
      } catch (err) {
        attempt++;
        if (attempt > job.retries) {
          const record = { name: job.name, status: "rejected", reason: err.message, attempt: attempt - 1 };
          this.results.push(record);
          job.reject(record);
          return;
        }
        await delay(50);
      }
    }
  }

  checkDone() {
    if (this.running === 0 && this.queue.length === 0 && this.done) {
      this.done(this.results);
      this.done = null;
    }
  }

  onIdle() {
    return new Promise((resolve) => {
      this.done = resolve;
      this.checkDone();
    });
  }
}

function makeTask(name, ms, shouldFail = false) {
  return async () => {
    await delay(ms);
    if (shouldFail) throw new Error(`${name} failed`);
    return `${name} completed in ${ms}ms`;
  };
}

async function run() {
  log("--- Run 1: basic queue with concurrency 2 ---", null);
  const q1 = new TaskQueue(2);
  q1.add(makeTask("A", 300, true), { name: "A", retries: 2 });
  q1.add(makeTask("B", 100), { name: "B", priority: 1 });
  q1.add(makeTask("C", 200), { name: "C" });
  q1.add(makeTask("D", 150, true), { name: "D", retries: 0 });
  q1.add(makeTask("E", 50), { name: "E", priority: 5 });
  log("Run 1 results", await q1.onIdle());

  log("--- Run 2: all succeed, priority ordering ---", null);
  const q2 = new TaskQueue(3);
  const order = [];
  const tagged = (label, ms) => async () => {
    await delay(ms);
    order.push(label);
    return label;
  };
  q2.add(tagged("low", 100), { priority: 1, name: "low" });
  q2.add(tagged("high", 100), { priority: 10, name: "high" });
  q2.add(tagged("mid", 100), { priority: 5, name: "mid" });
  q2.add(tagged("urgent", 100), { priority: 20, name: "urgent" });
  await q2.onIdle();
  log("Execution order", order);

  log("--- Run 3: concurrency 1, strict sequential ---", null);
  const q3 = new TaskQueue(1);
  const seq = [];
  for (let i = 1; i <= 4; i++) {
    q3.add(async () => {
      await delay(80);
      seq.push(i);
      return i;
    }, { name: `seq${i}` });
  }
  await q3.onIdle();
  log("Sequential order", seq);
}

run();