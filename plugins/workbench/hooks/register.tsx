import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Git, Meter } from '../types'

const PANE = 'workbench'
const gitAtom = atom({ plugin: 'workbench', key: 'git' } as const, null)
const meterAtom = atom({ plugin: 'workbench', key: 'meter' } as const, null)
const touchedAtom = atom({ plugin: 'workbench', key: 'touched' } as const, [])
const isBandHidden = atom({ plugin: 'workbench', key: 'isBandHidden' } as const, false)

async function refreshGit($: EngineInterface): Promise<void> {
  let git: Git | null = null
  try {
    const branch = await $.process.run(['git', 'branch', '--show-current'])
    if (branch.exitCode === 0) {
      const status = await $.process.run(['git', 'status', '--porcelain'])
      const dirty = status.stdout.split('\n').filter(line => line.trim() !== '').length
      let pr: string | null = null
      try {
        const view = await $.process.run([
          'gh', 'pr', 'view', '--json', 'number,state,reviewDecision,statusCheckRollup',
          '--jq', '"#\\(.number) \\(.state | ascii_downcase) review:\\(.reviewDecision // "none" | ascii_downcase) checks:\\([.statusCheckRollup[]?.conclusion // "pending"] | unique | join(","))"',
        ])
        if (view.exitCode === 0) pr = view.stdout.trim().replace(/^"|"$/g, '') || null
      } catch {
        pr = null
      }
      git = { branch: branch.stdout.trim() || '(detached)', dirty, pr }
    }
  } catch {
    git = null
  }
  await update($, gitAtom, () => git)
}

async function sessionUsd($: EngineInterface): Promise<number | null> {
  try {
    const usage = await $.session.usage()
    return usage.cost?.usd ?? null
  } catch {
    return null
  }
}

function usd(n: number | null): string {
  return n === null ? '-' : `$${n.toFixed(n < 1 ? 3 : 2)}`
}

export const register: Register = on => {
  let costAtStart: number | null = null

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'workbench',
      description: 'Open the workbench pane: git branch, changes, PR status, files touched',
    })
    await refreshGit($)
    return next(e)
  })

  on('command.run', { command: 'workbench' }, async $ => {
    await refreshGit($)
    await $.ui.open({ id: PANE, title: 'Workbench' })
    return { text: 'Workbench pane opened.' }
  })

  on('prompt.submit', async ($, e, next) => {
    costAtStart = await sessionUsd($)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    try {
      const usage = await $.session.usage()
      const total = usage.cost?.usd ?? null
      const meter: Meter = {
        contextPercent: usage.context.percent ?? null,
        turnUsd: total !== null && costAtStart !== null ? Math.max(0, total - costAtStart) : null,
        sessionUsd: total,
      }
      await update($, meterAtom, () => meter)
      if ((meter.contextPercent ?? 0) >= 80) $.ui.toast('Context is over 80% full: consider /clear or /compact')
    } catch {
      // usage unavailable on this surface
    }
    await refreshGit($)
    return next(e)
  })

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      await update($, touchedAtom, list => (list.includes(e.file_path) ? list : [...list, e.file_path].slice(-100)))
    }
    return ran
  })

  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      await update($, touchedAtom, list => (list.includes(e.file_path) ? list : [...list, e.file_path].slice(-100)))
    }
    return ran
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const [meter, hidden] = await Promise.all([read($, meterAtom), read($, isBandHidden)])
    if (e.props.hasSurvey || hidden || meter === null) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const pct = meter.contextPercent
    const color = pct === null ? undefined : pct >= 80 ? 'red' : pct >= 60 ? 'yellow' : undefined
    return (
      <Box>
        <Text color={color}>context {pct === null ? '-' : `${Math.round(pct)}%`}{'  '}</Text>
        <Text dimColor>
          last turn {usd(meter.turnUsd)} · session {usd(meter.sessionUsd)}{'  '}
        </Text>
        <Button key="hide" label="Hide" onPress={() => update($, isBandHidden, () => true)} />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const [git, touched] = await Promise.all([read($, gitAtom), read($, touchedAtom)])
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 8)
    return (
      <Box flexDirection="column">
        {git === null ? (
          <Text dimColor>Not a git repository.</Text>
        ) : (
          <Box flexDirection="column">
            <Text bold>{git.branch}</Text>
            <Text color={git.dirty > 0 ? 'yellow' : 'green'}>
              {git.dirty > 0 ? `${git.dirty} uncommitted change${git.dirty === 1 ? '' : 's'}` : 'clean'}
            </Text>
            <Text dimColor>{git.pr ? `PR ${git.pr}` : 'No pull request for this branch'}</Text>
          </Box>
        )}
        <Text> </Text>
        <Text bold>Files touched this session ({touched.length})</Text>
        {touched.length === 0 && <Text dimColor>None yet.</Text>}
        {touched.slice(-room).map(file => (
          <Text dimColor>{file}</Text>
        ))}
      </Box>
    )
  })
}
