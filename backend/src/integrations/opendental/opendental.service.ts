import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';
import { OpenDentalAppointmentDto } from './dto/opendental-appointment.dto';
import { OpenDentalEligibilityDto } from './dto/opendental-eligibility.dto';
import { OpenDentalClaimDto } from './dto/opendental-claim.dto';
import { OpenDentalPatientDto } from './dto/opendental-patient.dto';
import { OpenDentalInsurancePlanDto } from './dto/opendental-plan.dto';
import { OpenDentalSubscriberDto } from './dto/opendental-subscriber.dto';
import { OpenDentalBenefitDto } from './dto/opendental-benefit.dto';
import { OpenDentalProcedureLogDto } from './dto/opendental-procedure-log.dto';
import { OpenDentalPaymentDto } from './dto/opendental-payment.dto';

@Injectable()
export class OpenDentalService implements OnModuleInit {
  private readonly logger = new Logger(OpenDentalService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openDental.apiKey');
    this.client = axios.create({
      baseURL: this.configService.get<string>('openDental.baseUrl'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 15000,
    });

    // Log the actual headers being sent
    this.logger.log('📤 Request headers:');
    this.logger.log(`   Content-Type: application/json`);
    this.logger.log(`   Authorization: Bearer ${apiKey ? '********' : '(not set)'}`);
  }

  async onModuleInit() {
    this.logger.log('='.repeat(60));
    this.logger.log('🚀 OpenDental Module Initialized');
    this.logger.log('='.repeat(60));

    // Test connection on startup
    await this.testConnection();

    this.logger.log('='.repeat(60));
  }

  async fetchUpcomingAppointments(clinicExternalId: string): Promise<OpenDentalAppointmentDto[]> {
    this.logger.debug(`Fetching upcoming appointments for clinic ${clinicExternalId}`);
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return this.listAppointments(clinicExternalId, {
      startDate,
      endDate,
      status: 'Scheduled',
    });
  }

  async fetchTodaysAppointments(clinicExternalId: string): Promise<OpenDentalAppointmentDto[]> {
    this.logger.debug(`Fetching today's appointments for clinic ${clinicExternalId}`);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.listAppointments(clinicExternalId, {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  }

  async fetchCompletedAppointments(clinicExternalId: string): Promise<OpenDentalAppointmentDto[]> {
    this.logger.debug(`Fetching completed appointments for clinic ${clinicExternalId}`);
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();
    return this.listAppointments(clinicExternalId, {
      startDate,
      endDate,
      status: 'Complete',
    });
  }

  async listAppointments(
    clinicExternalId: string,
    params: { startDate?: string; endDate?: string; status?: string },
  ): Promise<OpenDentalAppointmentDto[]> {
    return this.safeGet<OpenDentalAppointmentDto[]>(
      '/appointments',
      [],
      {
        params: this.cleanParams({
          ClinicNum: clinicExternalId,
          StartDate: params.startDate,
          EndDate: params.endDate,
          AptStatus: params.status,
        }),
      },
    );
  }

  async getPatientSnapshot(patNum: string): Promise<OpenDentalPatientDto | null> {
    return this.safeGet<OpenDentalPatientDto | null>(
      '/patients/Simple',
      null,
      {
        params: { PatNum: patNum },
      },
    );
  }

  async searchPatients(filters: {
    lastName?: string;
    firstName?: string;
    birthDate?: string;
  }): Promise<OpenDentalPatientDto[]> {
    return this.safeGet<OpenDentalPatientDto[]>(
      '/patients',
      [],
      {
        params: this.cleanParams({
          LName: filters.lastName,
          FName: filters.firstName,
          Birthdate: filters.birthDate,
        }),
      },
    );
  }

  async createPatient(payload: Partial<OpenDentalPatientDto>): Promise<OpenDentalPatientDto> {
    return this.safePost('/patients', payload);
  }

  async updatePatient(patNum: string, payload: Partial<OpenDentalPatientDto>): Promise<OpenDentalPatientDto> {
    return this.safePut(`/patients/${patNum}`, payload);
  }

  async listInsurancePlans(filters: {
    planType?: string;
    carrierNum?: string;
  }): Promise<OpenDentalInsurancePlanDto[]> {
    return this.safeGet<OpenDentalInsurancePlanDto[]>(
      '/insplans',
      [],
      {
        params: this.cleanParams({
          PlanType: filters.planType,
          CarrierNum: filters.carrierNum,
        }),
      },
    );
  }

  async createInsurancePlan(payload: Partial<OpenDentalInsurancePlanDto>): Promise<OpenDentalInsurancePlanDto> {
    return this.safePost('/insplans', payload);
  }

  async listInsuranceSubscribers(planNum: string): Promise<OpenDentalSubscriberDto[]> {
    return this.safeGet<OpenDentalSubscriberDto[]>(
      '/inssubs',
      [],
      {
        params: this.cleanParams({ PlanNum: planNum }),
      },
    );
  }

  async createInsuranceSubscriber(payload: Partial<OpenDentalSubscriberDto>): Promise<OpenDentalSubscriberDto> {
    return this.safePost('/inssubs', payload);
  }

  async attachPatientPlan(payload: Record<string, any>): Promise<Record<string, any>> {
    return this.safePost('/patplans', payload);
  }

  async createBenefit(payload: Partial<OpenDentalBenefitDto>): Promise<OpenDentalBenefitDto> {
    return this.safePost('/benefits', payload);
  }

  async getFamilyInsurance(patNum: string): Promise<Record<string, any>> {
    return this.safeGet<Record<string, any>>(`/familymodules/${patNum}/Insurance`, {});
  }

  async listAppointmentSlots(params: Record<string, any>): Promise<Record<string, any>> {
    return this.safeGet<Record<string, any>>('/appointments/Slots', {}, { params });
  }

  async listWebSchedulerSlots(params: Record<string, any>): Promise<Record<string, any>> {
    return this.safeGet<Record<string, any>>('/appointments/SlotsWebSched', {}, { params });
  }

  async createPlannedAppointment(payload: Record<string, any>): Promise<OpenDentalAppointmentDto> {
    return this.safePost('/appointments/Planned', payload);
  }

  async schedulePlannedAppointment(payload: Record<string, any>): Promise<OpenDentalAppointmentDto> {
    return this.safePost('/appointments/SchedulePlanned', payload);
  }

  async createAppointment(payload: Record<string, any>): Promise<OpenDentalAppointmentDto> {
    return this.safePost('/appointments', payload);
  }

  async updateAppointmentNotes(aptNum: string, payload: Record<string, any>): Promise<OpenDentalAppointmentDto> {
    return this.safePut(`/appointments/${aptNum}/Note`, payload);
  }

  async confirmAppointment(aptNum: string, payload: Record<string, any>): Promise<OpenDentalAppointmentDto> {
    return this.safePut(`/appointments/${aptNum}/Confirm`, payload);
  }

  async breakAppointment(aptNum: string, payload: Record<string, any>): Promise<OpenDentalAppointmentDto> {
    return this.safePut(`/appointments/${aptNum}/Break`, payload);
  }

  async createProcedureCode(payload: Record<string, any>): Promise<Record<string, any>> {
    return this.safePost('/procedurecodes', payload);
  }

  async createProcedureLog(payload: Partial<OpenDentalProcedureLogDto>): Promise<OpenDentalProcedureLogDto> {
    return this.safePost('/procedurelogs', payload);
  }

  async getProcedureInsuranceHistory(params: Record<string, any>): Promise<OpenDentalProcedureLogDto[]> {
    return this.safeGet<OpenDentalProcedureLogDto[]>(
      '/procedurelogs/InsuranceHistory',
      [],
      { params: this.cleanParams(params) },
    );
  }

  async createClaim(payload: Record<string, any>): Promise<OpenDentalClaimDto> {
    return this.safePost('/claims', payload);
  }

  async updateClaim(claimNum: string, payload: Record<string, any>): Promise<OpenDentalClaimDto> {
    return this.safePut(`/claims/${claimNum}`, payload);
  }

  async updateClaimProcs(payload: Record<string, any>): Promise<Record<string, any>> {
    return this.safePut('/claimprocs', payload);
  }

  async fetchClaimStatus(claimId: string): Promise<OpenDentalClaimDto> {
    return this.safeGet<OpenDentalClaimDto>(`/claims/${claimId}`, {
      ClaimNum: claimId,
      AptNum: '',
      Status: 'Unknown',
    });
  }

  async createClaimPayment(payload: Partial<OpenDentalPaymentDto>): Promise<OpenDentalPaymentDto> {
    return this.safePost('/claimpayments', payload);
  }

  async createClaimPaymentBatch(payload: Record<string, any>): Promise<Record<string, any>> {
    return this.safePost('/claimpayments/Batch', payload);
  }

  async updateClaimPayment(paymentNum: string, payload: Record<string, any>): Promise<OpenDentalPaymentDto> {
    return this.safePut(`/claimpayments/${paymentNum}`, payload);
  }

  async deleteClaimPayment(paymentNum: string): Promise<void> {
    await this.safeDelete(`/claimpayments/${paymentNum}`);
  }

  async listEobAttachments(claimPaymentNum: string): Promise<Record<string, any>[]> {
    return this.safeGet<Record<string, any>[]>(
      '/eobattaches',
      [],
      { params: this.cleanParams({ ClaimPaymentNum: claimPaymentNum }) },
    );
  }

  async createPatientPayment(payload: Partial<OpenDentalPaymentDto>): Promise<OpenDentalPaymentDto> {
    return this.safePost('/payments', payload);
  }

  async listPatientSplits(params: Record<string, any>): Promise<Record<string, any>[]> {
    return this.safeGet<Record<string, any>[]>(
      '/paysplits',
      [],
      { params: this.cleanParams(params) },
    );
  }

  async updatePatientSplit(payload: Record<string, any>): Promise<Record<string, any>> {
    return this.safePut('/paysplits', payload);
  }

  async getPatientAging(patNum: string): Promise<Record<string, any>> {
    return this.safeGet(`/accountmodules/${patNum}/Aging`, {});
  }

  async getPatientServiceDateView(patNum: string): Promise<Record<string, any>> {
    return this.safeGet(`/accountmodules/${patNum}/ServiceDateView`, {}, {
      params: this.cleanParams({ isFamily: true }),
    });
  }

  async getStatement(statementNum: string): Promise<Record<string, any>> {
    return this.safeGet(`/statements/${statementNum}`, {});
  }

  async listStatements(patNum: string): Promise<Record<string, any>[]> {
    return this.safeGet<Record<string, any>[]>(
      '/statements',
      [],
      { params: this.cleanParams({ PatNum: patNum }) },
    );
  }

  async createStatement(payload: Record<string, any>): Promise<Record<string, any>> {
    return this.safePost('/statements', payload);
  }

  async executeQuery(payload: Record<string, any>): Promise<Record<string, any>> {
    return this.safePost('/queries', payload);
  }

  async manageSubscription(
    method: 'get' | 'post' | 'put' | 'delete',
    payload?: Record<string, any>,
    subscriptionNum?: string,
  ): Promise<any> {
    switch (method) {
      case 'get':
        return this.safeGet('/subscriptions', []);
      case 'post':
        return this.safePost('/subscriptions', payload ?? {});
      case 'put':
        return this.safePut(`/subscriptions/${subscriptionNum}`, payload ?? {});
      case 'delete':
        await this.safeDelete(`/subscriptions/${subscriptionNum}`);
        return { deleted: true };
      default:
        return null;
    }
  }

  async checkEligibility(appointmentId: string): Promise<OpenDentalEligibilityDto> {
    return this.safeGet<OpenDentalEligibilityDto>(
      `/eligibility/${appointmentId}`,
      { AptNum: appointmentId, Eligible: false },
    );
  }

  async submitClaim(payload: Record<string, any>): Promise<OpenDentalClaimDto> {
    this.logger.debug('Submitting claim payload to OpenDental');
    return this.safePost('/claims', payload);
  }

  async postDummyAiSummary(claimId: string, payload: Record<string, any>): Promise<{ status: string }> {
    this.logger.debug(`Sending claim ${claimId} data to AI summarization placeholder`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { status: 'ACKNOWLEDGED' };
  }

  /**
   * Test OpenDental API connection
   * Returns connection status and details
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    baseUrl: string;
    timestamp: string;
    error?: string;
  }> {
    const baseUrl = this.configService.get<string>('openDental.baseUrl') ?? 'not configured';
    const apiKey = this.configService.get<string>('openDental.apiKey');

    try {
      this.logger.log('🔍 Testing OpenDental API connection...');
      this.logger.log('📋 Configuration loaded from .env:');
      this.logger.log(`   📍 OPEN_DENTAL_BASE_URL: ${baseUrl}`);
      this.logger.log(`   🔑 OPEN_DENTAL_API_KEY: ${apiKey || '(not set)'}`);
      this.logger.log(`   🔑 API Key (masked): ${apiKey?.substring(0, 4)}...${apiKey?.substring(apiKey.length - 4)}`);
      this.logger.log(`   📏 API Key Length: ${apiKey?.length || 0} characters`);

      // Log the actual headers being sent
      this.logger.log('📤 Request headers:');
      this.logger.log(`   Content-Type: application/json`);
      this.logger.log(`   Authorization: Bearer ${apiKey || '(not set)'}`);

      // Try a simple endpoint that should work with valid credentials
      const response = await this.client.get('/patients/Simple', {
        params: { PatNum: '1' },
        validateStatus: (status) => status < 500,
      });

      if (response.status === 401) {
        this.logger.warn('⚠️  OpenDental API connection FAILED - Authentication error (401)');
        this.logger.warn('💡 The API is rejecting the Authorization header');
        this.logger.warn('💡 Please verify your OPEN_DENTAL_API_KEY is correct');
        this.logger.warn(`📄 Response: ${response.data}`);
        return {
          success: false,
          message: 'Authentication failed - Invalid API key or wrong authentication method',
          baseUrl,
          timestamp: new Date().toISOString(),
          error: response.data || 'Unauthorized',
        };
      }

      if (response.status === 404) {
        this.logger.log('✅ OpenDental API connection SUCCESSFUL (authenticated, test resource not found)');
        return {
          success: true,
          message: 'Connected successfully - API is reachable and authenticated',
          baseUrl,
          timestamp: new Date().toISOString(),
        };
      }

      if (response.status >= 200 && response.status < 300) {
        this.logger.log('✅ OpenDental API connection SUCCESSFUL');
        return {
          success: true,
          message: 'Connected successfully',
          baseUrl,
          timestamp: new Date().toISOString(),
        };
      }

      this.logger.warn(`⚠️  OpenDental API returned status ${response.status}`);
      return {
        success: false,
        message: `Unexpected status code: ${response.status}`,
        baseUrl,
        timestamp: new Date().toISOString(),
        error: JSON.stringify(response.data),
      };
    } catch (error: any) {
      this.logger.error('❌ OpenDental API connection FAILED');
      this.logger.error(`Error: ${error.message}`);

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        this.logger.error('🌐 Network error - Cannot reach OpenDental API server');
      }

      return {
        success: false,
        message: 'Connection failed',
        baseUrl,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private async safeGet<T>(url: string, fallback: T, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      this.logger.error(`OpenDental GET ${url} failed`, error?.response?.data ?? error.message);
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        return fallback;
      }
      throw error;
    }
  }

  private async safePost<T>(url: string, payload: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`OpenDental POST ${url} failed`, error?.response?.data ?? error.message);
      throw error;
    }
  }

  private async safePut<T>(url: string, payload: any): Promise<T> {
    try {
      const response = await this.client.put<T>(url, payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`OpenDental PUT ${url} failed`, error?.response?.data ?? error.message);
      throw error;
    }
  }

  private async safeDelete(url: string): Promise<void> {
    try {
      await this.client.delete(url);
    } catch (error: any) {
      this.logger.error(`OpenDental DELETE ${url} failed`, error?.response?.data ?? error.message);
      throw error;
    }
  }

  private cleanParams(params: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
    );
  }
}
