import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string, category?: string) {
    return this.prisma.skill.create({
      data: { name, category },
    });
  }
}