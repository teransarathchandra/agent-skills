export type Git = { branch: string; dirty: number; pr: string | null }
export type Meter = { contextPercent: number | null; turnUsd: number | null; sessionUsd: number | null }

declare module 'claude-code' {
  interface PluginState {
    workbench: {
      git: Git | null
      meter: Meter | null
      touched: string[]
      isBandHidden: boolean
    }
  }
}
