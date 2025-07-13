const parseDate = input => {
  if (!input) return new Date(0)

  if (Array.isArray(input)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = input
    return new Date(y, m - 1, d, hh, mm, ss)
  }

  if (typeof input === 'string') {
    if (input.includes('/') && !input.includes('T')) {
      const [dStr, mStr, yStr] = input.split('/')
      const d = Number(dStr)
      const m = Number(mStr)
      const y = Number(yStr)
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m - 1, d)
      }
    }
    return new Date(input)
  }

  return new Date(input)
}

const formatDate = input => {
  if (!input) return ''

  let date
  if (Array.isArray(input)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = input
    date = new Date(y, m - 1, d, hh, mm, ss)
  } else {
    date = new Date(input)
  }

  return date.toLocaleDateString('vi-VN')
}

const formatDateTime = input => {
  if (!input) return ''

  let date
  if (Array.isArray(input)) {
    const [y, m, d, hh = 0, mm = 0, ss = 0] = input
    date = new Date(y, m - 1, d, hh, mm, ss)
  } else if (typeof input === 'string') {
    let safeString = input
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+$/.test(input)) {
      safeString += 'Z'
    }
    date = new Date(safeString)
  } else {
    date = new Date(input)
  }

  if (isNaN(date)) return ''

  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

export { parseDate, formatDate, formatDateTime }
