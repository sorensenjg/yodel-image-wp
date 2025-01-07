import { useState } from "react";

export function useRevisions() {
  const [revisions, setRevisions] = useState<{ [key: string]: any }[]>([]);

  function rollback() {
    setRevisions((prev) => prev.slice(0, -1));
  }

  return { revisions, setRevisions, rollback };
}
