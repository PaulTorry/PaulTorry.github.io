const arrayFuncs = {
  pack2: (ac, cv, ix, arr) => ix % 2 ? ac.concat([[arr[ix - 1], arr[ix]]]) : ac,
  // zip: rows => rows[0].map((_, i) => rows.map(row => row[i]))
}
