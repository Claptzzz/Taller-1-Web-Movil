import { Module } from '@nestjs/common';
import { SuenoController } from './sueno.controller';
import { SuenoService } from './sueno.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SuenoController],
  providers: [SuenoService, PrismaService],
})
export class SuenoModule {}
