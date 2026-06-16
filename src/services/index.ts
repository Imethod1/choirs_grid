/**
 * Service Barrel Exports
 * 
 * Each service returns either mock or real Supabase implementation
 * based on VITE_USE_MOCK_SERVICES environment variable.
 * 
 * To switch: change VITE_USE_MOCK_SERVICES in .env — no code changes needed.
 */
import { getService } from '@/lib/service-factory';

import * as authReal from './auth.service';
import * as authMock from './mock/auth.mock';

import * as membersReal from './members.service';
import * as membersMock from './mock/members.mock';

import * as attendanceReal from './attendance.service';
import * as attendanceMock from './mock/attendance.mock';

import * as financeReal from './finance.service';
import * as financeMock from './mock/finance.mock';

import * as communicationReal from './communication.service';
import * as communicationMock from './mock/communication.mock';

import * as musicReal from './music.service';
import * as musicMock from './mock/music.mock';

import * as governanceReal from './governance.service';
import * as governanceMock from './mock/governance.mock';

import * as auditReal from './audit.service';
import * as auditMock from './mock/audit.mock';

export const authService = getService(authReal, authMock);
export const membersService = getService(membersReal, membersMock);
export const attendanceService = getService(attendanceReal, attendanceMock);
export const financeService = getService(financeReal, financeMock);
export const communicationService = getService(communicationReal, communicationMock);
export const musicService = getService(musicReal, musicMock);
export const governanceService = getService(governanceReal, governanceMock);
export const auditService = getService(auditReal, auditMock);
