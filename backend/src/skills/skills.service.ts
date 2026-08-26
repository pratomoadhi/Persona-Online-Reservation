import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.skill.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { personas: true } } },
    });
  }

  async create(dto: CreateSkillDto) {
    const existing = await this.prisma.skill.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A skill with this name already exists');
    }

    return this.prisma.skill.create({
      data: { name: dto.name, category: dto.category },
    });
  }

  async update(id: string, dto: UpdateSkillDto) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (dto.name && dto.name !== skill.name) {
      const existing = await this.prisma.skill.findUnique({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('A skill with this name already exists');
      }
    }

    return this.prisma.skill.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category }),
      },
      include: { _count: { select: { personas: true } } },
    });
  }

  async remove(id: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Remove the skill's links to personas before deleting
    await this.prisma.personaSkill.deleteMany({ where: { skillId: id } });

    await this.prisma.skill.delete({ where: { id } });

    return { message: 'Skill deleted' };
  }
}