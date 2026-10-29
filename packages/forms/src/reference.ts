const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I

/** Short reference shown to the guest and put in both email subjects, e.g. "CV-7K3P". */
export function makeReference(
  prefix: "CV" | "AL" | "MS",
  random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n)),
): string {
  const bytes = random(4);
  let code = "";
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${code}`;
}
