import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ChildrenModule } from './children/children.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';
import { GrowthModule } from './growth/growth.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('PGHOST', 'localhost'),
        port: config.get<number>('PGPORT', 5432),
        username: config.get<string>('PGUSER', 'mtotocare'),
        password: config.get<string>('PGPASSWORD', 'mtotocare'),
        database: config.get<string>('PGDATABASE', 'mtotocare'),
        autoLoadEntities: true,
        // Schema is owned by migrations/*.sql, not TypeORM sync.
        synchronize: false,
      }),
    }),
    RedisModule,
    AuthModule,
    ChildrenModule,
    VaccinationsModule,
    GrowthModule,
    DashboardModule,
  ],
})
export class AppModule {}
