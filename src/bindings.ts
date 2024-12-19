export type Bindings = {
  DB: D1Database;
};

declare global {
  function getMiniflareBindings(): Bindings;
}
