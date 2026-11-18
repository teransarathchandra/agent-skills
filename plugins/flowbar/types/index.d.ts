export type Verify = { ok: boolean; at: number; cmd: string }
export type Spec = { done: number; total: number }

declare module 'claude-code' {
  interface PluginState {
    flowbar: {
      verify: Verify | null
      spec: Spec | null
      agents: string[]
      isHidden: boolean
    }
  }
}
