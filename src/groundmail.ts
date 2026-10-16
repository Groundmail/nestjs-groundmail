/**
 * The `groundmail` SDK ships ES modules only. Types are imported in import
 * mode and the client is loaded with `import()`, so this module works from
 * both CommonJS and ESM Nest apps.
 */
export type Groundmail = import('groundmail', { with: { 'resolution-mode': 'import' } }).Groundmail
export type SendEmailParams = import('groundmail', {
  with: { 'resolution-mode': 'import' }
}).SendEmailParams
export type SendEmailResult = import('groundmail', {
  with: { 'resolution-mode': 'import' }
}).SendEmailResult

export type GroundmailClientOptions = {
  /** Groundmail API key (`gm_…`). Falls back to `GROUNDMAIL_API_KEY`. */
  apiKey?: string
  /** Override the API base URL. */
  baseUrl?: string
  /** Custom fetch implementation (tests, proxies). */
  fetch?: typeof fetch
}

export async function createGroundmailClient(options: GroundmailClientOptions = {}): Promise<Groundmail> {
  const apiKey = options.apiKey || process.env.GROUNDMAIL_API_KEY
  if (!apiKey) {
    throw new Error('Groundmail API key is missing. Pass apiKey or set GROUNDMAIL_API_KEY.')
  }
  const { Groundmail } = await import('groundmail')
  return new Groundmail(apiKey, { baseUrl: options.baseUrl, fetch: options.fetch })
}
