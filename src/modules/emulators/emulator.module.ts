import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Emulator } from './entities/emulator.entity';
import { EmulatorService } from './services/emulator.service';
import { EmulatorController } from './controllers/emulator.controller';
import { EmulatorCode } from './entities/emulator-code.entity';
import { EmulatorLinked } from './entities/emulator-linked.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Emulator, EmulatorCode, EmulatorLinked])],
  providers: [EmulatorService],
  controllers: [EmulatorController]
})
export class EmulatorModule {}
