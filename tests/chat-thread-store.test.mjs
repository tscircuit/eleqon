// Run with Node.js 24.22.1:
// node --experimental-transform-types --test tests/chat-thread-store.test.mjs
// These are Storage-interface unit tests, not browser/localStorage integration tests.
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const sourceUrl = new URL("../lib/chat-thread-store.ts", import.meta.url).href;
const resolution = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === sourceUrl && specifier === "./chat-thread") {
      return nextResolve("./chat-thread.ts", context);
    }
    return nextResolve(specifier, context);
  },
});
let ChatThreadStore;
try {
  ({ ChatThreadStore } = await import(sourceUrl));
} finally {
  resolution.deregister();
}

const key = "tscircuit.chat-threads.v1";
const older = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Older",
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
};
const newer = {
  id: "00000000-0000-4000-8000-000000000002",
  title: "Newer",
  createdAt: "2026-11-02T00:00:00.000Z",
  updatedAt: "2026-11-02T00:00:00.000Z",
};

// The adapter implements only the storage interface consumed by the real class.
function memoryStorage(initialValue) {
  let value = initialValue;
  const writes = [];
  return {
    writes,
    getItem(storageKey) {
      assert.equal(storageKey, key);
      return value;
    },
    setItem(storageKey, nextValue) {
      assert.equal(storageKey, key);
      writes.push(nextValue);
      value = nextValue;
    },
  };
}

function read(raw) {
  const storage = memoryStorage(raw);
  const result = new ChatThreadStore(storage).read();
  assert.deepEqual(storage.writes, [], "read must not rewrite persisted history");
  return result;
}

test("read orders valid records by updatedAt, newest first", () => {
  assert.deepEqual(read(JSON.stringify([older, newer])), [newer, older]);
});

test("read preserves an already newest-first history", () => {
  assert.deepEqual(read(JSON.stringify([newer, older])), [newer, older]);
});

test("updatedAt, rather than createdAt, determines recency", () => {
  const recentlyUpdated = {
    ...older,
    updatedAt: "2026-11-03T00:00:00.000Z",
  };
  assert.deepEqual(
    read(JSON.stringify([newer, recentlyUpdated])),
    [recentlyUpdated, newer],
  );
});

test("timestamp offsets are compared as instants, not strings", () => {
  const laterInstant = { ...older, updatedAt: "2026-11-01T23:30:00-02:00" };
  const earlierInstant = { ...newer, updatedAt: "2026-11-02T01:00:00Z" };
  assert.deepEqual(
    read(JSON.stringify([earlierInstant, laterInstant])),
    [laterInstant, earlierInstant],
  );
});

test("equal instants retain their persisted relative order", () => {
  const first = { ...older, updatedAt: "2026-11-02T01:00:00+01:00" };
  const second = { ...newer, updatedAt: "2026-11-02T00:00:00Z" };
  assert.deepEqual(read(JSON.stringify([first, second])), [first, second]);
  assert.deepEqual(read(JSON.stringify([second, first])), [second, first]);
});

test("timestamps before the Unix epoch remain valid and sort correctly", () => {
  const past = {
    ...older,
    createdAt: "1969-12-31T23:59:59.000Z",
    updatedAt: "1969-12-31T23:59:59.000Z",
  };
  const epoch = {
    ...newer,
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
  };
  assert.deepEqual(read(JSON.stringify([past, epoch])), [epoch, past]);
});

test("nine shuffled records expose the eight newest without truncating history", () => {
  const records = Array.from({ length: 9 }, (_, index) => ({
    id: `00000000-0000-4000-8000-00000000000${index + 1}`,
    title: `Thread ${index + 1}`,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: `2026-11-0${index + 1}T00:00:00.000Z`,
  }));
  const result = read(JSON.stringify([
    records[0], records[6], records[2], records[8], records[4],
    records[1], records[7], records[3], records[5],
  ]));
  assert.equal(result.length, 9);
  assert.deepEqual(result.slice(0, 8).map(({ title }) => title), [
    "Thread 9", "Thread 8", "Thread 7", "Thread 6",
    "Thread 5", "Thread 4", "Thread 3", "Thread 2",
  ]);
  assert.deepEqual(result[8], records[0]);
});

test("malformed records are filtered before valid records are ordered", () => {
  assert.deepEqual(read(JSON.stringify([
    older,
    null,
    1,
    [],
    { ...older, id: "not-a-uuid" },
    { ...older, title: "   " },
    { ...older, createdAt: "not-a-date" },
    { ...older, updatedAt: "not-a-date" },
    { ...older, updatedAt: 123 },
    newer,
  ])), [newer, older]);
});

test("sorting retains all domain fields and existing title normalization", () => {
  const spaced = {
    ...newer,
    title: "  New title  ",
    createdAt: "2026-10-30T02:00:00+02:00",
    updatedAt: "2026-11-02T01:00:00+01:00",
  };
  assert.deepEqual(
    read(JSON.stringify([older, spaced])),
    [{ ...spaced, title: "New title" }, older],
  );
});

test("missing storage returns an empty history without writing", () => {
  assert.deepEqual(read(null), []);
});

test("malformed JSON returns an empty history without writing", () => {
  assert.deepEqual(read("{"), []);
});

test("non-array JSON returns an empty history without writing", () => {
  for (const raw of ["null", "{}", "1", '"text"']) {
    assert.deepEqual(read(raw), []);
  }
});

test("an empty persisted array returns an empty history without writing", () => {
  assert.deepEqual(read("[]"), []);
});

test("repeated reads do not write back or lose record fields", () => {
  const raw = JSON.stringify([older, newer]);
  const storage = memoryStorage(raw);
  const store = new ChatThreadStore(storage);
  assert.deepEqual(store.read(), [newer, older]);
  assert.deepEqual(store.read(), [newer, older]);
  assert.equal(storage.getItem(key), raw);
  assert.deepEqual(storage.writes, []);
});

test("save still prepends and replaces the same id; subsequent read orders by time", () => {
  const storage = memoryStorage(JSON.stringify([newer, older]));
  const store = new ChatThreadStore(storage);
  const backdated = {
    ...older,
    title: "Backdated replacement",
    updatedAt: "2026-10-31T00:00:00.000Z",
  };
  assert.deepEqual(store.save(backdated), [backdated, newer]);
  assert.equal(storage.writes.length, 1);
  assert.deepEqual(JSON.parse(storage.writes[0]), [backdated, newer]);
  assert.deepEqual(store.read(), [newer, backdated]);
  assert.equal(storage.writes.length, 1);
});
