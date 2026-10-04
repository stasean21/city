// русское склонение по числу: plural(3, ['работа', 'работы', 'работ']) → 'работы'
export function plural(n, [one, few, many]) {
  const d = n % 10
  const dd = n % 100
  if (d === 1 && dd !== 11) return one
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few
  return many
}
