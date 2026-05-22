export type YahooMergeDeps = {
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
  envNumber: (name: string, fallback: number) => number
  parseList: (raw?: string | null) => string[]
  fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
  fetchJsonPostWithTimeout: <T>(
    url: string,
    timeoutMs: number,
    body: unknown,
    headers?: Record<string, string>,
  ) => Promise<T>
}
