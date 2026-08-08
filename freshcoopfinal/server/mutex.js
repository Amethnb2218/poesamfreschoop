export function createMutex() {
  let locked = false;
  const queue = [];

  async function acquire() {
    if (!locked) {
      locked = true;
      return;
    }
    await new Promise((resolve) => queue.push(resolve));
  }

  function release() {
    if (queue.length > 0) {
      const next = queue.shift();
      next();
    } else {
      locked = false;
    }
  }

  async function withLock(fn) {
    await acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  return { acquire, release, withLock };
}
