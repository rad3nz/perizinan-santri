import { expect, test } from "bun:test";
import { wsRegistry } from "./ws-registry";

function fakeSocket() {
  const sent: string[] = [];
  return { sent, send: (data: string) => sent.push(data) };
}

test("broadcast delivers the payload to every connected socket once", () => {
  const a = fakeSocket();
  const b = fakeSocket();
  wsRegistry.add(1, a);
  wsRegistry.add(2, b);

  wsRegistry.broadcast({ type: "perizinan_changed" });

  const expected = JSON.stringify({ type: "perizinan_changed" });
  expect(a.sent).toEqual([expected]);
  expect(b.sent).toEqual([expected]);

  wsRegistry.remove(1, a);
  wsRegistry.remove(2, b);
});
