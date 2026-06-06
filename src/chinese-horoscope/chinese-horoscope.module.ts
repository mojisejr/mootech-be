import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChineseHoroscopeController } from './chinese-horoscope.controller';
import { ChineseHoroscopeService } from './chinese-horoscope.service';
import { ChineseHoroscope8SquareModule } from 'src/chinese-horoscope-8-square/chinese-horoscope-8-square.module';
import { LogCalculateModule } from 'src/log-calculate/log-calculate.module';
import { AnalyticBaseModule } from 'src/analytic-base/analytic-base.module';
import { AnalyticElementalCharacteristicsModule } from 'src/analytic-elemental-characteristics/analytic-elemental-characteristics.module';
import { AnalyticHabitModule } from 'src/analytic-habit/analytic-habit.module';
import { AnalyticOccupationModule } from 'src/analytic-occupation/analytic-occupation.module';
import { AnalyticColorModule } from 'src/analytic-color/analytic-color.module';
import { AnalyticSacredThingModule } from 'src/analytic-sacred-thing/analytic-sacred-thing.module';
import { AnalyticLoveModule } from 'src/analytic-love/analytic-love.module';
import { MascotModule } from 'src/mascot/mascot.module';
import { ScaredThingModule } from 'src/scared-thing/scared-thing.module';
import { ColorModule } from 'src/color/color.module';
import { AnalyticFeatureModule } from 'src/analytic-feature/analytic-feature.module';
import { AnalyticLifeModule } from 'src/analytic-life/analytic-life.module';
import { AnalyticBeCarefulModule } from 'src/analytic-be-careful/analytic-be-careful.module';
import { CompatibilityLoveModule } from 'src/compatibility-love/compatibility-love.module';
import { CompatibilityWorkModule } from 'src/compatibility-work/compatibility-work.module';
import { PowerKnowledgeModule } from 'src/power-knowledge/power-knowledge.module';
import { PowerFriendlyModule } from 'src/power-friendly/power-friendly.module';
import { PowerCustomerModule } from 'src/power-customer/power-customer.module';
import { PowerEducationModule } from 'src/power-education/power-education.module';
import { PowerFinanceModule } from 'src/power-finance/power-finance.module';
import { UserModule } from 'src/user/user.module';
import { AnalyticCharacterModule } from 'src/analytic-character/analytic-character.module';
import { PredictionWorkModule } from 'src/prediction-work/prodiction-work.module';
import { LogWorkVibeModule } from 'src/log-work-vibe/log-work-vibe.module';
import { LogLoveMateModule } from 'src/log-love-mate/log-love-mate.module';
import { Calendar100YearModule } from 'src/calendar-100-year/calendar-100-year.module';
import { AnalyticCharacterForShareModule } from 'src/analytic-character-for-share/analytic-character-for-share.module';
import { CardModule } from 'src/card/card.module';
import { ObjectStorageModule } from 'src/object-storage/object-storage.module';
import { MomentService } from 'src/utils/MomentService';
import { MemberPaymentCodeModule } from 'src/member-payment-code/member-payment-code.module';
import { ElementCycleModule } from 'src/element-cycle/element-cycle.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    ChineseHoroscope8SquareModule,
    LogCalculateModule,
    AnalyticBaseModule,
    AnalyticElementalCharacteristicsModule,
    AnalyticHabitModule,
    AnalyticFeatureModule,
    AnalyticOccupationModule,
    AnalyticColorModule,
    AnalyticSacredThingModule,
    AnalyticLoveModule,
    MascotModule,
    ScaredThingModule,
    ColorModule,
    AnalyticLifeModule,
    AnalyticBeCarefulModule,
    CompatibilityLoveModule,
    CompatibilityWorkModule,
    PowerKnowledgeModule,
    PowerFriendlyModule,
    PowerCustomerModule,
    PowerEducationModule,
    PowerFinanceModule,
    UserModule,
    AnalyticCharacterModule,
    PredictionWorkModule,
    LogWorkVibeModule,
    LogLoveMateModule,
    AnalyticCharacterForShareModule,
    CardModule,
    ObjectStorageModule,
    MemberPaymentCodeModule,
    ElementCycleModule,
  ],
  controllers: [ChineseHoroscopeController],
  providers: [ChineseHoroscopeService, MomentService],
  exports: [ChineseHoroscopeService],
})
export class ChineseHoroscopeModule {}
