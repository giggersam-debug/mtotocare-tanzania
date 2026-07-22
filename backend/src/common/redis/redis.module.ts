import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

// @Global so every feature module (children, vaccinations, growth, …)
// can inject RedisService without re-importing it.
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
