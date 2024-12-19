import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { Emulator } from "./entities/emulator.entity";
import { EmulatorService } from "./services/emulator.service";
import { EmulatorController } from "./controllers/emulator.controller";
import { UserEmulators } from "./entities/user-emulators";
import { UserEmulatorConnections } from "./entities/user-emulator-connections";
import { ActivityLogModule } from "../activity_logs/activity_log.module";

@Module({
  imports: [TypeOrmModule.forFeature([Emulator, UserEmulators, UserEmulatorConnections]), ActivityLogModule],
  providers: [EmulatorService],
  controllers: [EmulatorController],
  exports: [EmulatorService]
})
export class EmulatorModule {}
