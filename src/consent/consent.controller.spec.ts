import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';
import { Consent } from './entity/consent-entity.model';
import { User } from 'src/user/entity/user-entity.model';
import { MomentService } from 'src/utils/MomentService';

// #16 — POST /consent writes a PDPA legal-consent record. These tests hit the real
// controller call-site (through HTTP), NOT the service in isolation, so that removing
// the @Headers('x-consent-secret') binding or the service guards makes them go red.
// The repositories are mocked; a rejected request must never call repo.save().
const SECRET = 'test-consent-secret';

const makeApp = async (opts: { userExists?: boolean } = {}) => {
  const consentSave = jest.fn().mockResolvedValue({});
  const userSave = jest.fn().mockResolvedValue({});
  const consentRepo = { save: consentSave };
  const userRepo = {
    findOne: jest
      .fn()
      .mockResolvedValue(opts.userExists === false ? null : { user_id: 'u1' }),
    save: userSave,
  };
  const moment = {
    moment: () => ({ format: () => '2026-08-10 10:00:00' }),
  };

  const moduleRef = await Test.createTestingModule({
    controllers: [ConsentController],
    providers: [
      ConsentService,
      { provide: getRepositoryToken(Consent), useValue: consentRepo },
      { provide: getRepositoryToken(User), useValue: userRepo },
      { provide: MomentService, useValue: moment },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return { app, consentSave, userSave };
};

const validBody = { user_id: 'u1', goal: 'finance', policy_version: 'v1' };

describe('POST /consent — auth + validation guard (#16)', () => {
  const PREV = process.env.CONSENT_SECRET;
  let app: INestApplication;
  let consentSave: jest.Mock;
  let userSave: jest.Mock;

  beforeEach(async () => {
    process.env.CONSENT_SECRET = SECRET;
    ({ app, consentSave, userSave } = await makeApp());
  });

  afterEach(async () => {
    if (PREV === undefined) delete process.env.CONSENT_SECRET;
    else process.env.CONSENT_SECRET = PREV;
    await app.close();
  });

  it('no secret header → 401, nothing written', async () => {
    await request(app.getHttpServer())
      .post('/consent')
      .send(validBody)
      .expect(401);
    expect(consentSave).not.toHaveBeenCalled();
    expect(userSave).not.toHaveBeenCalled();
  });

  it('wrong secret → 401, nothing written', async () => {
    await request(app.getHttpServer())
      .post('/consent')
      .set('x-consent-secret', 'wrong')
      .send(validBody)
      .expect(401);
    expect(consentSave).not.toHaveBeenCalled();
    expect(userSave).not.toHaveBeenCalled();
  });

  it('fail-closed: server secret unset → 401 even with a header', async () => {
    delete process.env.CONSENT_SECRET;
    await request(app.getHttpServer())
      .post('/consent')
      .set('x-consent-secret', 'anything')
      .send(validBody)
      .expect(401);
    expect(consentSave).not.toHaveBeenCalled();
    expect(userSave).not.toHaveBeenCalled();
  });

  it('invalid goal → 400, nothing written', async () => {
    await request(app.getHttpServer())
      .post('/consent')
      .set('x-consent-secret', SECRET)
      .send({ ...validBody, goal: 'wealth-and-glory' })
      .expect(400);
    expect(consentSave).not.toHaveBeenCalled();
    expect(userSave).not.toHaveBeenCalled();
  });

  it('invalid policy_version → 400, nothing written', async () => {
    await request(app.getHttpServer())
      .post('/consent')
      .set('x-consent-secret', SECRET)
      .send({ ...validBody, policy_version: 'v99' })
      .expect(400);
    expect(consentSave).not.toHaveBeenCalled();
    expect(userSave).not.toHaveBeenCalled();
  });

  it('valid secret + goal + policy + existing user → 200, both rows written', async () => {
    const res = await request(app.getHttpServer())
      .post('/consent')
      .set('x-consent-secret', SECRET)
      .send(validBody)
      .expect(200);
    expect(res.body).toMatchObject({ ok: true, onboarding_goal: 'finance' });
    expect(res.body.onboarded_at).toBeTruthy();
    expect(consentSave).toHaveBeenCalledTimes(1);
    expect(userSave).toHaveBeenCalledTimes(1);
  });

  it('authorized + valid but user not found → 400, no consent row written', async () => {
    const bad = await makeApp({ userExists: false });
    await request(bad.app.getHttpServer())
      .post('/consent')
      .set('x-consent-secret', SECRET)
      .send(validBody)
      .expect(400);
    expect(bad.consentSave).not.toHaveBeenCalled();
    expect(bad.userSave).not.toHaveBeenCalled();
    await bad.app.close();
  });
});
