import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { AdminsService } from '../admins/admins.service';
import { AdminRole } from '../admins/enums/admin-role.enum';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ManageSubscriptionDto } from './dto/manage-subscription.dto';
import { OpenDentalService } from '../integrations/opendental/opendental.service';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly repository: Repository<Clinic>,
    private readonly adminsService: AdminsService,
    private readonly openDentalService: OpenDentalService,
  ) {}

  private isSuperAdmin(user?: AuthenticatedUser): boolean {
    return user?.role === AdminRole.SUPER_ADMIN;
  }

  async create(adminId: string, dto: CreateClinicDto): Promise<Clinic> {
    const admin = await this.adminsService.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    const clinic = this.repository.create({
      ...dto,
      admin,
    });
    return this.repository.save(clinic);
  }

  async findAll(): Promise<Clinic[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async findAllForUser(user: AuthenticatedUser): Promise<Clinic[]> {
    if (this.isSuperAdmin(user)) {
      return this.findAll();
    }
    return this.repository.find({
      where: { admin: { id: user.userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.repository.findOne({ where: { id } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    return clinic;
  }

  async findOneForUser(id: string, user: AuthenticatedUser): Promise<Clinic> {
    const clinic = await this.findOne(id);
    if (!this.isSuperAdmin(user) && clinic.admin.id !== user.userId) {
      throw new ForbiddenException('Access to clinic denied');
    }
    return clinic;
  }

  async update(id: string, dto: UpdateClinicDto): Promise<Clinic> {
    const clinic = await this.findOne(id);
    Object.assign(clinic, dto);
    return this.repository.save(clinic);
  }

  async updateForUser(id: string, dto: UpdateClinicDto, user: AuthenticatedUser): Promise<Clinic> {
    await this.assertClinicAccess(id, user);
    return this.update(id, dto);
  }

  async getAccessibleClinicIds(user?: AuthenticatedUser, requestedClinicId?: string): Promise<string[]> {
    if (!user || this.isSuperAdmin(user)) {
      if (requestedClinicId) {
        const clinic = await this.repository.findOne({ where: { id: requestedClinicId } });
        return clinic ? [requestedClinicId] : [];
      }
      const clinics = await this.findAll();
      return clinics.map((c) => c.id);
    }

    const clinics = await this.repository.find({ where: { admin: { id: user.userId } } });
    if (requestedClinicId) {
      const allowed = clinics.some((clinic) => clinic.id === requestedClinicId);
      if (!allowed) {
        throw new ForbiddenException('Access to clinic denied');
      }
      return [requestedClinicId];
    }
    return clinics.map((clinic) => clinic.id);
  }

  async assertClinicAccess(clinicId: string, user?: AuthenticatedUser): Promise<Clinic> {
    const clinic = await this.findOne(clinicId);
    if (user && !this.isSuperAdmin(user) && clinic.admin.id !== user.userId) {
      throw new ForbiddenException('Access to clinic denied');
    }
    return clinic;
  }

  async revokeSubscription(
    clinicId: string,
    dto: ManageSubscriptionDto,
    user: AuthenticatedUser,
  ): Promise<any> {
    await this.assertClinicAccess(clinicId, user);
    return this.openDentalService.manageSubscription('delete', undefined, dto.subscriptionNum);
  }

  async restartSubscription(
    clinicId: string,
    dto: ManageSubscriptionDto,
    user: AuthenticatedUser,
  ): Promise<any> {
    await this.assertClinicAccess(clinicId, user);
    return this.openDentalService.manageSubscription('put', dto.payload ?? {}, dto.subscriptionNum);
  }
}
