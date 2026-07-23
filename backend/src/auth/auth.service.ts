import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import type { AuthenticatedUser } from './types';

const SALT_ROUNDS = 10;

function toStaffSummary(user: User) {
  return {
    userId: user.userId,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone ?? null,
    employeeNumber: user.employeeNumber ?? null,
    facilityName: user.facility?.name ?? null,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.users.findOne({
      where: { username, isActive: true },
      relations: ['facility'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      sub: user.userId,
      role: user.role,
      facilityId: user.facility?.facilityId,
    };

    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        role: user.role,
        facilityId: user.facility?.facilityId,
      },
    };
  }

  /** Settings page: staff roster for the administrator's own facility. */
  async listStaff(admin: AuthenticatedUser) {
    if (!admin.facilityId) {
      throw new ForbiddenException('Your account is not linked to a facility');
    }

    const staff = await this.users.find({
      where: { facility: { facilityId: admin.facilityId } },
      relations: ['facility'],
      order: { fullName: 'ASC' },
    });

    return staff.map(toStaffSummary);
  }

  /** Settings page: create a front-line staff account at the admin's facility. */
  async createStaff(dto: CreateStaffDto, admin: AuthenticatedUser) {
    if (!admin.facilityId) {
      throw new ForbiddenException('Your account is not linked to a facility');
    }

    const existing = await this.users.findOne({ where: { username: dto.username } });
    if (existing) throw new ConflictException('That username is already taken');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const staff = this.users.create({
      username: dto.username,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
      phone: dto.phone,
      employeeNumber: dto.employeeNumber,
      facility: { facilityId: admin.facilityId } as any,
      isActive: true,
    });

    const saved = await this.users.save(staff);
    const withFacility = await this.users.findOne({ where: { userId: saved.userId }, relations: ['facility'] });
    return toStaffSummary(withFacility ?? saved);
  }

  /** Settings page: activate/deactivate a staff account at the admin's facility. */
  async setStaffActive(userId: string, dto: UpdateStaffDto, admin: AuthenticatedUser) {
    if (userId === admin.userId) {
      throw new ForbiddenException('You cannot change your own account status here');
    }

    const staff = await this.users.findOne({ where: { userId }, relations: ['facility'] });
    if (!staff) throw new NotFoundException('No staff account found for that ID');
    if (staff.facility?.facilityId !== admin.facilityId) {
      throw new ForbiddenException('That account belongs to a different facility');
    }

    staff.isActive = dto.isActive;
    const saved = await this.users.save(staff);
    return toStaffSummary(saved);
  }
}
