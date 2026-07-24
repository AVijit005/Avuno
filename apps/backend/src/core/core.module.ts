import { Global, Module } from '@nestjs/common';
import { SystemClock } from './clock';
import { UuidService } from './uuid';
import { NodeCryptoHashingService } from './hash';
import { RequestContextService } from './context';
import { LocalStorageService, S3StorageService } from './storage';
import { InMemoryEventPublisher } from './events';
import { ConfigService } from '@nestjs/config';

export const STORAGE_SERVICE = 'StorageService';
export const EVENT_PUBLISHER = 'EventPublisher';

@Global()
@Module({
  providers: [
    SystemClock,
    UuidService,
    NodeCryptoHashingService,
    RequestContextService,
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const driver = config.get<string>('storage.driver');
        return driver === 's3' ? new S3StorageService(config) : new LocalStorageService(config);
      }
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: InMemoryEventPublisher,
    },
  ],
  exports: [
    SystemClock,
    UuidService,
    NodeCryptoHashingService,
    RequestContextService,
    STORAGE_SERVICE,
    EVENT_PUBLISHER,
  ],
})
export class CoreModule {}
