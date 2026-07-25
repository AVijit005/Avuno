import { ConfigService } from '@nestjs/config';
import { createApp } from './app.bootstrap';
async function bootstrap(): Promise<void> {

  const app = await createApp();
  const config = app.get(ConfigService);

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application listening on port ${port}`);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
