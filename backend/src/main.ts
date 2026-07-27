import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// CORS was previously a single origin defaulting to localhost:3000 — if the
// FRONTEND_ORIGIN env var wasn't set on the deployed backend service, every
// cross-origin request from the real production frontend (a different
// Railway subdomain) would be silently blocked by the browser: login would
// fail, and unhandled fetches like the public facilities list would just
// hang forever with no error surfaced. Building an explicit allow-list with
// a hardcoded production fallback means it works even if the env var is
// missing or wrong, instead of failing closed with no visible cause.
const KNOWN_FRONTEND_ORIGINS = [
  'http://localhost:3000',
  'https://charming-contentment-production-147e.up.railway.app',
];

function buildAllowedOrigins(): string[] {
  const fromEnv = process.env.FRONTEND_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? [];
  return [...new Set([...KNOWN_FRONTEND_ORIGINS, ...fromEnv])];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const allowedOrigins = buildAllowedOrigins();
  logger.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: allowedOrigins });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`MtotoCare API listening on :${port}`);
}

bootstrap();
