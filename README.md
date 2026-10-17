<p align="center">
  <a href="https://groundmail.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://app.groundmail.dev/images/github/readme-logo-dark.png">
      <img alt="Groundmail" src="https://app.groundmail.dev/images/github/readme-logo-light.png" height="44">
    </picture>
  </a>
</p>

<h1 align="center">Groundmail for NestJS</h1>

<p align="center">
  A <a href="https://nestjs.com">NestJS</a> module for the Groundmail transactional email API.<br>
  Register it once, then inject a ready Groundmail client into any provider.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nestjs-groundmail"><img alt="npm" src="https://img.shields.io/npm/v/nestjs-groundmail?color=a3461f&label=npm"></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-b48f62"></a>
</p>

<p align="center">
  <a href="https://docs.groundmail.dev/frameworks/nestjs">Docs</a> ·
  <a href="https://app.groundmail.dev/signup">Get a free account</a> ·
  <a href="https://groundmail.dev">groundmail.dev</a>
</p>

---

Works with NestJS 10, 11 and 12, in CommonJS and ESM apps.

## Install

```bash
npm install nestjs-groundmail
```

```bash
GROUNDMAIL_API_KEY=gm_your_key_here
```

## Usage

```ts
// app.module.ts
import { Module } from '@nestjs/common'
import { GroundmailModule } from 'nestjs-groundmail'

@Module({
  imports: [GroundmailModule.forRoot({ apiKey: process.env.GROUNDMAIL_API_KEY, isGlobal: true })],
})
export class AppModule {}
```

```ts
// receipts.service.ts
import { Injectable } from '@nestjs/common'
import { InjectGroundmail, type Groundmail } from 'nestjs-groundmail'

@Injectable()
export class ReceiptsService {
  constructor(@InjectGroundmail() private readonly groundmail: Groundmail) {}

  sendReceipt(to: string) {
    return this.groundmail.emails.send({
      from: 'Acme <receipts@yourdomain.com>',
      to,
      subject: 'Your receipt',
      html: '<p>Thanks for your purchase.</p>',
    })
  }
}
```

The injected client is the full [`groundmail`](https://www.npmjs.com/package/groundmail) SDK: emails, templates, domains, webhooks and suppressions.

### Config from `ConfigService`

```ts
GroundmailModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({ apiKey: config.getOrThrow('GROUNDMAIL_API_KEY') }),
  isGlobal: true,
})
```

## Options

| Option | Purpose |
|--------|---------|
| `apiKey` | Groundmail API key. Falls back to `GROUNDMAIL_API_KEY` |
| `baseUrl` | Override the API base URL |
| `isGlobal` | Make the client injectable in every module |
| `client` | Use an existing `Groundmail` instance (tests) |

Inject by token with `@Inject(GROUNDMAIL_CLIENT)` if you prefer it to the decorator.

## Contributing

Found a bug or want something added? [Open an issue](https://github.com/Groundmail/nestjs-groundmail/issues). This code is published here on each release, so we port fixes rather than merging pull requests directly. The HTTP client itself is the [`groundmail`](https://www.npmjs.com/package/groundmail) package.

## Why Groundmail

- **Our own mail servers and IP space.** Your password resets and receipts don't share a pool with bulk marketing senders.
- **Transactional email only.** No newsletters or cold outreach on the platform, which keeps the sending reputation clean.
- **Start free.** 3,000 emails a month on the Free plan; Pro is 50,000 emails for $20/month. Dedicated IPs on Scale.
- **Built for code and for agents.** REST API, SMTP, SDKs for Node, Python, Go, PHP and Ruby, a CLI, and an MCP server for Claude, ChatGPT and Cursor.

## All Groundmail libraries

| Use | Package |
|-----|---------|
| Node.js / TypeScript | [`groundmail`](https://www.npmjs.com/package/groundmail) on npm |
| Python (Django), Go, Ruby (Rails Action Mailer) | [Groundmail/groundmail-sdks](https://github.com/Groundmail/groundmail-sdks) |
| PHP | [Groundmail/groundmail-php](https://github.com/Groundmail/groundmail-php) |
| Laravel | [Groundmail/groundmail-laravel](https://github.com/Groundmail/groundmail-laravel) |
| Symfony Mailer | [Groundmail/groundmail-symfony-mailer](https://github.com/Groundmail/groundmail-symfony-mailer) |
| Nodemailer | [Groundmail/groundmail-nodemailer](https://github.com/Groundmail/groundmail-nodemailer) |
| NestJS | [Groundmail/nestjs-groundmail](https://github.com/Groundmail/nestjs-groundmail) |
| Strapi | [Groundmail/strapi-provider-email-groundmail](https://github.com/Groundmail/strapi-provider-email-groundmail) |
| Medusa | [Groundmail/medusa-notification-groundmail](https://github.com/Groundmail/medusa-notification-groundmail) |
| AdonisJS | [Groundmail/adonisjs-groundmail](https://github.com/Groundmail/adonisjs-groundmail) |
| Phoenix (Swoosh) | [Groundmail/swoosh_groundmail](https://github.com/Groundmail/swoosh_groundmail) |
| CLI | [`groundmail-cli`](https://www.npmjs.com/package/groundmail-cli) on npm |
| MCP server (Claude, ChatGPT, Cursor) | [Groundmail/groundmail-mcp](https://github.com/Groundmail/groundmail-mcp) |
| Agent skills and Claude Code plugin | [Groundmail/groundmail-skills](https://github.com/Groundmail/groundmail-skills) |
| Email templates (React Email, MJML, HTML) | [Groundmail/email-templates](https://github.com/Groundmail/email-templates) |

[Website](https://groundmail.dev) · [Docs](https://docs.groundmail.dev) · [Pricing](https://groundmail.dev/pricing) · [Sign up free](https://app.groundmail.dev/signup)
