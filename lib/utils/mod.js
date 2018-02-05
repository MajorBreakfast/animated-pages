/**
 * Calculates the modulo. The result is always `>= 0` and `< m`.
 * @param {number} n Dividend
 * @param {number} m Divisor
 */
export default function mod (n, m) {
  return ((n % m) + m) % m;
}
