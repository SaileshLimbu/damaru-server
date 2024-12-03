import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Emulator } from './entities/emulator.entity';
import { EmulatorService } from './services/emulator.service';
import { EmulatorController } from './controllers/emulator.controller';
import { EmulatorCode } from './entities/emulator-code.entity';
import { EmulatorLinked } from './entities/emulator-linked.entity';
import { ActivityLogModule } from '../activity_logs/activity_log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Emulator, EmulatorCode, EmulatorLinked]), ActivityLogModule],
  providers: [EmulatorService],
  controllers: [EmulatorController]
})
export class EmulatorModule {}
