import { readFile } from 'fs/promises'

const main = async () => {
  const raw = await readFile(process.argv[2], 'utf-8')

  const codes: { type: 'pulse' | 'space'; length: number }[] = raw
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => {
      const [T, L] = line.split(' ')
      if (T === 'pulse') return { type: T, length: Number.parseInt(L, 10) }
      else if (T === 'space') return { type: T, length: Number.parseInt(L, 10) }
      else if (T === 'timeout')
        return { type: 'space', length: Number.parseInt(L, 10) }
      else throw new Error(`Undefined type: ${T}`)
    })

  const pulses = codes
    .filter((code) => code.type === 'pulse')
    .map((code) => code.length)
  const spaces = codes
    .filter((code) => code.type === 'space')
    .map((code) => code.length)

  const averagePulse = Math.round(
    pulses.slice(1).reduce((p, c) => p + c, 0) / pulses.length,
  )

  const averageSpace = Math.round(
    spaces.slice(1).reduce((p, c) => p + c, 0) / spaces.length,
  )

  const leaderPulse = pulses.shift()!

  const leaderSpace = averageSpace < spaces[0] ? spaces.shift()! : null

  const expectLeader = leaderSpace
    ? leaderPulse / averagePulse > 12
      ? 16
      : 8
    : 4

  const T = Math.round((leaderPulse - averagePulse) / (expectLeader - 1))

  const signals = leaderSpace ? spaces : pulses

  const correctedT =
    Math.abs(Math.round(Math.min(...signals) / 10) - Math.round(T / 10)) <= 15
      ? T
      : Math.min(...signals)

  console.log(
    'average',
    averagePulse,
    averageSpace,
    'leader',
    leaderPulse,
    leaderSpace,
    'expected',
    expectLeader,
    'calculated T',
    T,
    'corrected T',
    correctedT,
  )

  const decoded = signals.map((signal) =>
    Math.round(signal / correctedT) === 1 ? 0 : 1,
  )

  const C =
    expectLeader > 4
      ? Number.parseInt(decoded.splice(0, 16).join(''), 2).toString(16)
      : null
  const P =
    expectLeader === 8
      ? Number.parseInt(decoded.splice(0, 8).join(''), 2).toString(16)
      : null
  const D = Number.parseInt(decoded.join(''), 2).toString(16)

  console.log(C, P, D)
}
main().catch((e) => console.error(e))
