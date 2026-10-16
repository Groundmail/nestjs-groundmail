import 'reflect-metadata'
import { Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { describe, expect, it, vi } from 'vitest'
import { GROUNDMAIL_CLIENT, GroundmailModule, InjectGroundmail, type Groundmail } from './index'

function fakeFetch() {
  return vi.fn(async () =>
    new Response(JSON.stringify({ id: 'em_123', status: 'queued' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  )
}

@Injectable()
class ReceiptService {
  constructor(@InjectGroundmail() readonly groundmail: Groundmail) {}

  send(to: string) {
    return this.groundmail.emails.send({
      from: 'Acme <receipts@acme.test>',
      to,
      subject: 'Your receipt',
      html: '<p>Thanks</p>',
    })
  }
}

describe('GroundmailModule', () => {
  it('forRoot builds a client that sends through the API', async () => {
    const fetch = fakeFetch()
    const moduleRef = await Test.createTestingModule({
      imports: [GroundmailModule.forRoot({ apiKey: 'gm_test_key', baseUrl: 'https://api.test', fetch })],
      providers: [ReceiptService],
    }).compile()

    const result = await moduleRef.get(ReceiptService).send('user@example.com')
    expect(result).toEqual({ id: 'em_123', status: 'queued' })

    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.test/emails')
    expect(init.method).toBe('POST')
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer gm_test_key')
    expect(JSON.parse(String(init.body))).toMatchObject({
      from: 'Acme <receipts@acme.test>',
      to: 'user@example.com',
      subject: 'Your receipt',
    })
  })

  it('forRootAsync resolves options from injected providers', async () => {
    const fetch = fakeFetch()
    @Module({ providers: [{ provide: 'CONFIG', useValue: { key: 'gm_from_config' } }], exports: ['CONFIG'] })
    class ConfigModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [
        GroundmailModule.forRootAsync({
          imports: [ConfigModule],
          inject: ['CONFIG'],
          useFactory: async (config: { key: string }) => ({ apiKey: config.key, fetch }),
        }),
      ],
    }).compile()

    const client = moduleRef.get<Groundmail>(GROUNDMAIL_CLIENT)
    await client.emails.send({ from: 'a@acme.test', to: 'b@example.com', subject: 'Hi', text: 'Hi' })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.groundmail.dev/emails')
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer gm_from_config')
  })

  it('isGlobal exposes the client to modules that do not import it', async () => {
    @Module({ providers: [ReceiptService], exports: [ReceiptService] })
    class FeatureModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [GroundmailModule.forRoot({ apiKey: 'gm_test_key', isGlobal: true, fetch: fakeFetch() }), FeatureModule],
    }).compile()

    expect(moduleRef.get(ReceiptService).groundmail.emails).toBeDefined()
  })

  it('uses a client passed in directly', async () => {
    const client = { emails: { send: vi.fn() } } as unknown as Groundmail
    const moduleRef = await Test.createTestingModule({
      imports: [GroundmailModule.forRoot({ client })],
    }).compile()
    expect(moduleRef.get(GROUNDMAIL_CLIENT)).toBe(client)
  })

  it('fails clearly without an API key', async () => {
    const saved = process.env.GROUNDMAIL_API_KEY
    delete process.env.GROUNDMAIL_API_KEY
    try {
      await expect(
        Test.createTestingModule({ imports: [GroundmailModule.forRoot()] }).compile(),
      ).rejects.toThrow(/GROUNDMAIL_API_KEY/)
    } finally {
      if (saved !== undefined) process.env.GROUNDMAIL_API_KEY = saved
    }
  })
})
