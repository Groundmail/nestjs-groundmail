import { Inject, Module, type DynamicModule, type ModuleMetadata, type Provider } from '@nestjs/common'
import { createGroundmailClient, type Groundmail, type GroundmailClientOptions } from './groundmail'

/** Injection token for the Groundmail client. */
export const GROUNDMAIL_CLIENT = 'GROUNDMAIL_CLIENT'
/** Injection token for the options passed to `forRoot` / `forRootAsync`. */
export const GROUNDMAIL_MODULE_OPTIONS = 'GROUNDMAIL_MODULE_OPTIONS'

export type GroundmailModuleOptions = GroundmailClientOptions & {
  /** Use this client instead of building one (tests, shared clients). */
  client?: Groundmail
}

export type GroundmailModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
  /** Providers to inject into `useFactory`, e.g. `ConfigService`. */
  inject?: Array<string | symbol | (abstract new (...args: never[]) => unknown) | (new (...args: never[]) => unknown)>
  useFactory: (...args: any[]) => GroundmailModuleOptions | Promise<GroundmailModuleOptions>
  /** Register the module globally so every module can inject the client. */
  isGlobal?: boolean
}

/** Parameter decorator that injects the Groundmail client. */
export const InjectGroundmail = (): PropertyDecorator & ParameterDecorator => Inject(GROUNDMAIL_CLIENT)

const clientProvider: Provider = {
  provide: GROUNDMAIL_CLIENT,
  inject: [GROUNDMAIL_MODULE_OPTIONS],
  useFactory: (options: GroundmailModuleOptions) => options.client ?? createGroundmailClient(options),
}

/**
 * Registers a Groundmail client for dependency injection.
 *
 * ```ts
 * @Module({ imports: [GroundmailModule.forRoot({ apiKey: process.env.GROUNDMAIL_API_KEY })] })
 * export class AppModule {}
 * ```
 */
@Module({})
export class GroundmailModule {
  static forRoot(options: GroundmailModuleOptions & { isGlobal?: boolean } = {}): DynamicModule {
    const { isGlobal, ...clientOptions } = options
    return {
      module: GroundmailModule,
      global: isGlobal ?? false,
      providers: [{ provide: GROUNDMAIL_MODULE_OPTIONS, useValue: clientOptions }, clientProvider],
      exports: [GROUNDMAIL_CLIENT],
    }
  }

  static forRootAsync(options: GroundmailModuleAsyncOptions): DynamicModule {
    return {
      module: GroundmailModule,
      global: options.isGlobal ?? false,
      imports: options.imports ?? [],
      providers: [
        {
          provide: GROUNDMAIL_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        clientProvider,
      ],
      exports: [GROUNDMAIL_CLIENT],
    }
  }
}
