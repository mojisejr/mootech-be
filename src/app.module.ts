import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbConfigModule, DbConfigService } from './config/database';
import { AppConfigModule } from './config/app';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChineseHoroscopeModule } from './chinese-horoscope/chinese-horoscope.module';
import { ChineseHoroscope8SquareModule } from './chinese-horoscope-8-square/chinese-horoscope-8-square.module';
import { UserModule } from './user/user.module';
import { SmsSenderModule } from './sms-sender/sms-sender.module';
import { OTPModule } from './otp/otp.module';
import { LogCalculateModule } from './log-calculate/log-calculate.module';
import { AnalyticBaseModule } from './analytic-base/analytic-base.module';
import { AnalyticElementalCharacteristicsModule } from './analytic-elemental-characteristics/analytic-elemental-characteristics.module';
import { AnalyticHabitModule } from './analytic-habit/analytic-habit.module';
import { AnalyticOccupationModule } from './analytic-occupation/analytic-occupation.module';
import { AnalyticColorModule } from './analytic-color/analytic-color.module';
import { AnalyticSacredThingModule } from './analytic-sacred-thing/analytic-sacred-thing.module';
import { AnalyticLoveModule } from './analytic-love/analytic-love.module';
import { MascotModule } from './mascot/mascot.module';
import { ScaredThingModule } from './scared-thing/scared-thing.module';
import { ColorModule } from './color/color.module';
import { AnalyticFeatureModule } from './analytic-feature/analytic-feature.module';
import { AnalyticLifeModule } from './analytic-life/analytic-life.module';
import { PowerKnowledgeModule } from './power-knowledge/power-knowledge.module';
import { PowerCustomerModule } from './power-customer/power-customer.module';
import { PowerFriendlyModule } from './power-friendly/power-friendly.module';
import { PowerEducationModule } from './power-education/power-education.module';
import { PowerFinanceModule } from './power-finance/power-finance.module';
import { CallBackModule } from './callback/callback.module';
import { SurveyModule } from './survey/survey.module';
import { LogSurveyModule } from './log-survey/log-survey.module';
import { ProductModule } from './product/product.module';
import { AnalyticCharacterModule } from './analytic-character/analytic-character.module';
import { LogWorkVibeModule } from './log-work-vibe/log-work-vibe.module';
import { LogActivityModule } from './log-activity/log-activity.module';
import { ObjectStorageModule } from './object-storage/object-storage.module';
import { CardModule } from './card/card.module';
import { LogSaveImageModule } from './log-save-image/log-save-image.module';
import { UserProviderModule } from './user-provider/user-provider.module';
import { FortuneStickModule } from './fortune-stick/fortune-stick.module';
import { OmiseModule } from './omise/omise.module';
import { HeavenlySpiritCardModule } from './heavenly-spirit-card/heavenly-spirit-card.module';
import { PaymentModule } from './payment/payment.module';
import { SendGridModule } from './send-grid/send-grid.module';
import { EmployeeModule } from './employee/employee.module';
import { PaymentPlanModule } from './payment-plan/payment-plan.module';
import { PaymentPackageModule } from './payment-package/payment-package.module';
import { MemberPaymentModule } from './member-payment/member-payment.module';
import { PaymentCodeModule } from './payment-code/payment-code.module';
import { MemberPaymentCodeModule } from './member-payment-code/member-payment-code.module';
import { AIModule } from './ai/ai.module';
import { MemberWithFriendModule } from './member-with-friend/member-with-friend.module';
import { MatchingModule } from './matching/matching.module';
import { MigrationModule } from './migration/migration.module';
import { ChineseCalendarModule } from './chineses-calendar/entity/chinese-calendar.module';
import { DirectionModule } from './direction/direction.module';
import { HolidayModule } from './holiday/holiday.module';
import { LineMessageModule } from './line-message/line.message.module';
import { CronjobModule } from './cronjob/cronjob.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ElementCycleModule } from './element-cycle/element-cycle.module';
import { FortuneTellingModule } from './fortune-telling/fortune-telling.module';
import { OmiseConfigModule } from './config/omise';
import { MemberPayAsUseModule } from './member-pay-as-use/member-pay-as-use.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DbConfigModule],
      useFactory: (dbConfigService: DbConfigService) => ({
        type: 'postgres',
        host: dbConfigService.host,
        port: dbConfigService.port,
        username: dbConfigService.username,
        password: dbConfigService.password,
        database: dbConfigService.database,
        // NEVER hardcode true on serverless/Supabase — read from DB_SYNCHRONIZE (must be false)
        synchronize: dbConfigService.synchronize,
        ssl: { rejectUnauthorized: false }, // Supabase requires SSL (self-signed chain)
        logging: dbConfigService.logging,
        autoLoadEntities: true,
        // Bug typeorm synchronize resolve path with Typescript
        // ref1: https://github.com/typeorm/typeorm/issues/420
        // ref2: https://stackoverflow.com/questions/59435293/typeorm-entity-in-nestjs-cannot-use-import-statement-outside-a-module
        entities: ['dist/**/*.model.js'],
      }),
      inject: [DbConfigService],
    }),
    ScheduleModule.forRoot(),
    CallBackModule,
    AppConfigModule,
    ChineseHoroscopeModule,
    ChineseHoroscope8SquareModule,
    UserModule,
    SmsSenderModule,
    OTPModule,
    LogCalculateModule,
    AnalyticBaseModule,
    AnalyticElementalCharacteristicsModule,
    AnalyticHabitModule,
    AnalyticFeatureModule,
    AnalyticOccupationModule,
    AnalyticColorModule,
    AnalyticSacredThingModule,
    AnalyticLoveModule,
    AnalyticLifeModule,
    MascotModule,
    ScaredThingModule,
    ColorModule,
    PowerKnowledgeModule,
    PowerFriendlyModule,
    PowerCustomerModule,
    PowerEducationModule,
    PowerFinanceModule,
    SurveyModule,
    LogSurveyModule,
    ProductModule,
    AnalyticCharacterModule,
    LogWorkVibeModule,
    LogActivityModule,
    ObjectStorageModule,
    CardModule,
    LogSaveImageModule,
    UserProviderModule,
    FortuneStickModule,
    OmiseModule,
    HeavenlySpiritCardModule,
    PaymentModule,
    SendGridModule,
    EmployeeModule,
    PaymentPlanModule,
    PaymentPackageModule,
    MemberPaymentModule,
    PaymentCodeModule,
    MemberPaymentCodeModule,
    AIModule,
    MemberWithFriendModule,
    MatchingModule,
    MigrationModule,
    ChineseCalendarModule,
    DirectionModule,
    HolidayModule,
    LineMessageModule,
    CronjobModule,
    ElementCycleModule,
    FortuneTellingModule,
    OmiseConfigModule,
    MemberPayAsUseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
