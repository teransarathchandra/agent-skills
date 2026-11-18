import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Spec, Verify } from '../types'

const verifyAtom = atom({ plugin: 'flowbar', key: 'verify' } as const, null)
const specAtom = atom({ plugin: 'flowbar', key: 'spec' } as const, null)
const agentsAtom = atom({ plugin: 'flowbar', key: 'agents' } as const, [])
const isHidden = atom({ plugin: 'flowbar', key: 'isHidden' } as const, false)

// Commands that count as "the project's check".
const VERIFY = /(scripts\/verify\.sh|pnpm (run )?(check|verify)\b|npm run (check|verify)\b)/

function countSpec(text: string): Spec | null {
  const done = (text.match(/^\s*[-*] \[[xX]\]/gm) ?? []).length
  const open = (text.match(/^\s*[-*] \[ \]/gm) ?? []).length
  return done + open > 0 ? { done, total: done + open } : null
}

function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  return `${Math.round(s / 3600)}h ago`
}

// Where a marketplace lives on disk: known_marketplaces.json records each one's installLocation.
async function marketplaceDir($: EngineInterface, name: string): Promise<string | null> {
  const home = await $.env.get('HOME')
  const configDir = (await $.env.get('CLAUDE_CONFIG_DIR')) ?? `${home}/.claude`
  try {
    const known = JSON.parse(await $.fs.read(`${configDir}/plugins/known_marketplaces.json`)) as Record<
      string,
      { installLocation?: string }
    >
    return known[name]?.installLocation ?? null
  } catch {
    return null
  }
}

async function refreshSpec($: EngineInterface): Promise<void> {
  let spec: Spec | null = null
  try {
    spec = countSpec(await $.fs.read('SPEC.md'))
  } catch {
    spec = null
  }
  await update($, specAtom, () => spec)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'kit',
      description: 'Show the kit, plugins, check command and /goal line for this project',
    })
    await refreshSpec($)
    $.clock.every(3000, async () => {
      try {
        const running = (await $.agent.list())
          .filter(a => a.status === 'running')
          .map(a => a.type)
        const prev = await read($, agentsAtom)
        if (prev.join('|') !== running.join('|')) {
          await update($, agentsAtom, () => running)
        }
      } catch {
        // agent list unavailable on this surface; keep the last value
      }
    })
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await refreshSpec($)
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (VERIFY.test(e.command) && ran.deny === undefined) {
      const result: Verify = {
        ok: ran.isError !== true,
        at: await $.clock.now(),
        cmd: e.command.slice(0, 60),
      }
      await update($, verifyAtom, () => result)
      if (!result.ok) $.ui.toast('verify failed')
    }
    return ran
  })

  on('command.run', { command: 'kit' }, async $ => {
    let enabled: string[] = []
    try {
      const settings = JSON.parse(await $.fs.read('.claude/settings.json')) as {
        enabledPlugins?: Record<string, boolean>
      }
      enabled = Object.entries(settings.enabledPlugins ?? {})
        .filter(([, isOn]) => isOn)
        .map(([name]) => name)
    } catch {
      return { text: 'No project .claude/settings.json here. Start a project with /kickoff <idea>.' }
    }
    const kits = enabled.filter(n => /-kit@[\w.-]+$/.test(n))
    const lines = [`Project plugins: ${enabled.length ? enabled.join(', ') : 'none'}`]
    for (const entry of kits) {
      const [kit = '', market = ''] = entry.split('@')
      const dir = await marketplaceDir($, market)
      try {
        if (dir === null) throw new Error('marketplace not found')
        const k = JSON.parse(await $.fs.read(`${dir}/plugins/${kit}/kit.json`)) as { goal?: string; stack?: string }
        if (k.stack) lines.push(`${kit} stack: ${k.stack}`)
        if (k.goal) lines.push(`${kit} goal: ${k.goal}`)
      } catch {
        lines.push(`${kit}: kit.json not found`)
      }
    }
    lines.push('Check: bash scripts/verify.sh')
    return { text: lines.join('\n') }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const [spec, verify, agents, hidden] = await Promise.all([
      read($, specAtom),
      read($, verifyAtom),
      read($, agentsAtom),
      read($, isHidden),
    ])
    if (e.props.hasSurvey || hidden || (!spec && !verify && agents.length === 0)) {
      return next(e)
    }
    const now = await $.clock.now()
    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box>
        {spec ? (
          <Text color={spec.done === spec.total ? 'green' : undefined}>
            SPEC {spec.done}/{spec.total}{'  '}
          </Text>
        ) : null}
        {verify ? (
          <Text color={verify.ok ? 'green' : 'red'}>
            verify {verify.ok ? 'passed' : 'failed'} {ago(now - verify.at)}{'  '}
          </Text>
        ) : null}
        {agents.length ? <Text dimColor>running: {agents.join(', ')}{'  '}</Text> : null}
        <Button key="hide" label="Hide" onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}
