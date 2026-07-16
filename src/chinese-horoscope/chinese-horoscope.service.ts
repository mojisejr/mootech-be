import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChineseHoroscopeAnalyticInput } from './dto/chinese-horoscope-analytic.input';
import {
  CalculateDateEngToDAteChinese,
  CalculateYearToYearThai,
} from 'src/utils/calculate-year';
import { ChineseHoroscope8SquareService } from 'src/chinese-horoscope-8-square/chinese-horoscope-8-square.service';
import { ChineseHoroscopeResponse } from './model/chinese-horoscope-response.model';
import { ChineseHoroscope8SquareInput } from 'src/chinese-horoscope-8-square/dto/chinese-horoscope-8-square.input';
import { ChineseHoroscope8SquareCheckMonthChineseInput } from 'src/chinese-horoscope-8-square/dto/chinese-horoscope-8-square-check-month-chinese.input';
import { ChineseHoroscope8SquareCheckMonthHongHouTungInput } from 'src/chinese-horoscope-8-square/dto/chinese-horoscope-8-square-check-month-hong-hou-tung.input';
import { ChineseHoroscope8SquareGet9FebInput } from 'src/chinese-horoscope-8-square/dto/chinese-horoscope-8-square-get-9-feb.input';
import { LogCalculateService } from 'src/log-calculate/log-calculate.service';
import { LogCalculateInsertInput } from 'src/log-calculate/dto/log-calculate-insert.input';
import { formatDateThai } from 'src/utils/thai-date-time-format';
import { AnalyticBaseService } from 'src/analytic-base/analytic-base.service';
import { AnalyticBaseInput } from 'src/analytic-base/dto/analytic-base.input';
import { AnalyticElementalCharacteristicsService } from 'src/analytic-elemental-characteristics/analytic-elemental-characteristics.service';
import { AnalyticElementalCharacteristicsInput } from 'src/analytic-elemental-characteristics/dto/analytic-elemental-characteristics.input';
import { AnalyticHabitService } from 'src/analytic-habit/analytic-habit.service';
import { AnalyticHabitInput } from 'src/analytic-habit/dto/analytic-habit.input';
import { AnalyticLoveService } from 'src/analytic-love/analytic-love.service';
import { AnalyticLoveInput } from 'src/analytic-love/dto/analytic-love.input';
import { MascotService } from 'src/mascot/mascot.service';
import { ScaredThingService } from 'src/scared-thing/scared-thing.service';
import { ColorService } from 'src/color/color.service';
import { AnalyticFeatureService } from 'src/analytic-feature/analytic-feature.service';
import { AnalyticFeatureInput } from 'src/analytic-feature/dto/analytic-feature.input';
import { AnalyticElementalCharacteristicsGetElementsInput } from 'src/analytic-elemental-characteristics/dto/analytic-elemental-characteristics.input-get-elements';
import { AnalyticLifeService } from 'src/analytic-life/analytic-life.service';
import { AnalyticLifeInput } from 'src/analytic-life/dto/analytic-life.input';
import { AnalyticBeCarefulService } from 'src/analytic-be-careful/analytic-be-careful.service';
import { AnalyticBeCarefulInput } from 'src/analytic-be-careful/dto/analytic-be-careful.input';
import { CompatibilityLoveAnalyticInput } from './dto/compatibility-love-analytic.input';
import { CompatibilityLoveService } from 'src/compatibility-love/compatibility-love.service';
import { CompatibilityWorkService } from 'src/compatibility-work/compatibility-work.service';
import { CompatibilityLoveInput } from 'src/compatibility-love/dto/compatibility-love.input';
// #mootech-matching-bazi-swap: bazi pair engine (env-gated, reversible) + pure mapper.
import {
  fetchBaziPair,
  isBaziMatchingEnabled,
} from 'src/matching/bazi/bazi-pair.adapter';
import {
  mapBaziPairToComputeResult,
  toBaziPairRequest,
} from 'src/matching/bazi/bazi-pair.mapper';
import {
  MatchingComputeResult,
  MatchingType,
} from 'src/matching/bazi/bazi-pair.types';
import { PowerKnowledgeService } from 'src/power-knowledge/power-knowledge.service';
import { PowerKnowledgeInput } from 'src/power-knowledge/dto/power-knowledge.input';
import { PowerFriendlyService } from 'src/power-friendly/power-friendly.service';
import { PowerFriendlyInput } from 'src/power-friendly/dto/power-friendly.input';
import { PowerCustomerService } from 'src/power-customer/power-customer.service';
import { PowerCustomerInput } from 'src/power-customer/dto/power-customer.input';
import { PowerEducationService } from 'src/power-education/power-education.service';
import { PowerEducationInput } from 'src/power-education/dto/power-education.input';
import { PowerFinanceService } from 'src/power-finance/power-finance.service';
import { PowerFinanceInput } from 'src/power-finance/dto/power-finance.input';
import { CompatibilityWorkInput } from 'src/compatibility-work/dto/compatibility-work.input';
import { ChineseHoroscopeAnalyticGetInput } from './dto/chinese-horoscope-analytic-get.input';
import { UserService } from 'src/user/user.service';
import { UserUpdateInfoInput } from 'src/user/dto/user-update-info';
import { AnalyticCharacterService } from 'src/analytic-character/analytic-character.service';
import { AnalyticOccupationService } from 'src/analytic-occupation/analytic-occupation.service';
import { AnalyticOccupationInput } from 'src/analytic-occupation/dto/analytic-occupation.input';
import { AnalyticCharacterInput } from 'src/analytic-character/dto/analytic-charactor.input';
import { PredictionWorkService } from 'src/prediction-work/prediction-work.service';
import { LogWorkVibeService } from 'src/log-work-vibe/log-work-vibe.service';
import { LogWorkVibeInsertInput } from 'src/log-work-vibe/dto/log-work-vibe-insert.input';
import { LogWoLoveMateService } from 'src/log-love-mate/log-love-mate.service';
import { LogLoveMateInsertInput } from 'src/log-love-mate/dto/log-love-mate-insert.input';
import { Calendar100YearService } from 'src/calendar-100-year/calendar-100-year.service';
import { MascotGetV60Input } from 'src/mascot/dto/mascot-get-v-60.input';
import { AnalyticCharacterForShareService } from 'src/analytic-character-for-share/analytic-character-for-share.service';
import { AnalyticCharacterForShareInput } from 'src/analytic-character-for-share/dto/analytic-charactor-for-share.input';
import { CardService } from 'src/card/card.service';
import { ObjectStorageService } from 'src/object-storage/object-storage.service';
import { MomentService } from 'src/utils/MomentService';
import { MemberPaymentCodeService } from 'src/member-payment-code/member-payment-code.service';
import { MemberPaymentCodeAppendInput } from 'src/member-payment-code/dto/member-payment-code-append.input';
import { ElementCycleService } from 'src/element-cycle/element-cycle.service';

@Injectable()
export class ChineseHoroscopeService {
  constructor(
    private chineseHoroscope8SquareService: ChineseHoroscope8SquareService,
    private logCalculateService: LogCalculateService,
    private analyticBaseService: AnalyticBaseService,
    private analyticElementalCharacteristicsService: AnalyticElementalCharacteristicsService,
    private analyticHabitService: AnalyticHabitService,
    private analyticFeatureService: AnalyticFeatureService,
    private analyticLoveService: AnalyticLoveService,
    private mascotService: MascotService,
    private scaredThingService: ScaredThingService,
    private colorService: ColorService,
    private analyticLifeService: AnalyticLifeService,
    private analyticBeCarefulService: AnalyticBeCarefulService,
    private compatibilityLoveService: CompatibilityLoveService,
    private compatibilityWorkService: CompatibilityWorkService,
    private powerKnowledgeService: PowerKnowledgeService,
    private powerFriendlyService: PowerFriendlyService,
    private powerCustomerService: PowerCustomerService,
    private powerEducationService: PowerEducationService,
    private powerFinanceService: PowerFinanceService,
    private userService: UserService,
    private analyticCharacterService: AnalyticCharacterService,
    private analyticOccupationService: AnalyticOccupationService,
    private predictionWorkService: PredictionWorkService,
    private logWorkVibeService: LogWorkVibeService,
    private logWoLoveMateService: LogWoLoveMateService,
    private analyticCharacterForShareService: AnalyticCharacterForShareService,
    private cardService: CardService,
    private objectStorageService: ObjectStorageService,
    private memberPaymentCodeService: MemberPaymentCodeService,
    private elementCycleService: ElementCycleService,
    private momentWrapper: MomentService,
  ) {}
  /*
    โป๊ยยี่สี่แถว
    
    [ยาม][วัน][เดือน][ปี]
    [ยาม][วัน][เดือน][ปี]
  */
  async chineseHoroscope4Rows(
    input: ChineseHoroscopeAnalyticInput | any,
    is_full_info = true,
  ): Promise<any> {
    const dob = input.dob;
    const time = input.time;

    // FAMILY CODE
    const familyCode = input.family_code;

    if (familyCode && familyCode != '') {
      await this.memberPaymentCodeService.appendMemberPaymentCode({
        user_id: input.user_id,
        code: familyCode,
      } as MemberPaymentCodeAppendInput);
    }

    if (!dob || dob.split('-').length != 3) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'please input dob format YYYY-MM-DD.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (time && time.split(':').length != 2) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'please input time format hh:ss.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const dobCH = CalculateDateEngToDAteChinese(dob);
    const dobArray = dobCH.split('-');
    const dobReal = dob.split('-');
    const yearReal = dobReal[0];
    const yearThai = CalculateYearToYearThai(parseInt(dobArray[0]));
    const year = parseInt(dobArray[0]);
    const month = parseInt(dobArray[1]);
    const date = parseInt(dobArray[2]);
    const monthTxt = dobArray[1];
    const dateTxt = dobArray[2];

    if (time) {
      const timeArray = time.split(':');
      const hour = parseInt(timeArray[0]);
      const minute = parseInt(timeArray[1]);
    }

    const resultYearAbove = await this.chineseHoroscope4RowsYearAbove(yearThai);
    const resultYearBelow = await this.chineseHoroscope4RowsYearBelow(yearThai);

    const resultMonthBelow = await this.chineseHoroscope4RowsMonthBelow(
      month,
      date,
    );
    let resultMonthAbove = null;
    if (resultMonthBelow) {
      resultMonthAbove = await this.chineseHoroscope4RowsMonthAbove(
        resultYearAbove,
        resultMonthBelow.month_chinese_id,
      );
    }

    const startDayTo9Feb =
      await this.chineseHoroscope8SquareService.get9FebruaryOfYear({
        yearTh: yearThai,
      } as ChineseHoroscope8SquareGet9FebInput);
    const feb9 = `${year}-02-09`;
    let _dob = dob;
    // < 9 FEB
    if (month <= 2) {
      if (date < 9) {
        _dob = `${year + 1}-${monthTxt}-${dateTxt}`;
      }
    }
    const day9FebToBirthday =
      await this.chineseHoroscope8SquareService.get9FebruaryOfYearToBirthday(
        year,
        feb9,
        _dob,
      );
    const dayTotal = startDayTo9Feb.last2Character + day9FebToBirthday;
    let dayAbove = dayTotal % 10;
    dayAbove = dayAbove == 0 ? 10 : dayAbove;
    let dayBelow = dayTotal % 12;
    dayBelow = dayBelow == 0 ? 12 : dayBelow;
    const chineseYearAbove =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8SquareAbove(
        {
          id: resultYearAbove,
        } as ChineseHoroscope8SquareInput,
      );

    const chineseYearBelow =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8SquareBelow(
        {
          id: resultYearBelow,
        } as ChineseHoroscope8SquareInput,
      );

    const chineseMonthAbove =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8SquareAbove(
        {
          id: resultMonthAbove,
        } as ChineseHoroscope8SquareInput,
      );
    let chineseMonthBelow = null;
    if (resultMonthBelow) {
      chineseMonthBelow =
        await this.chineseHoroscope8SquareService.getChineseHoroscope8SquareBelow(
          {
            id: resultMonthBelow.chinese_horoscope_8_square_below_id,
          } as ChineseHoroscope8SquareInput,
        );
    }

    let chineseDayAbove = null;
    if (!Number.isNaN(dayAbove)) {
      chineseDayAbove =
        await this.chineseHoroscope8SquareService.getChineseHoroscope8SquareAbove(
          {
            id: dayAbove,
          } as ChineseHoroscope8SquareInput,
        );
    }
    let chineseDayBelow = null;
    if (!Number.isNaN(dayBelow)) {
      chineseDayBelow =
        await this.chineseHoroscope8SquareService.getChineseHoroscope8SquareBelow(
          {
            id: dayBelow,
          } as ChineseHoroscope8SquareInput,
        );
    }

    let chineseTimeAbove = null;
    let chineseTimeBelow = null;
    if (time) {
      const resultTime =
        await this.chineseHoroscope8SquareService.getChineseHoroscope8TimeHongHouTung(
          time,
          dayAbove,
        );
      if (resultTime) {
        chineseTimeAbove =
          await this.chineseHoroscope8SquareService.getChineseHoroscope8SquareAbove(
            {
              id: resultTime.time_above_id,
            } as ChineseHoroscope8SquareInput,
          );

        chineseTimeBelow =
          await this.chineseHoroscope8SquareService.getChineseHoroscope8SquareBelow(
            {
              id: resultTime.time_below_id,
            } as ChineseHoroscope8SquareInput,
          );
      }
    }

    // ลัคนา
    const chineseAscendant =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8AscendantAndDOB(
        chineseYearAbove,
        chineseMonthBelow,
        chineseTimeBelow,
        year,
        month,
        date,
        time,
        yearReal,
      );
    console.log(chineseAscendant);

    // นับอิม
    const elementYear =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8CountingIm(
        chineseYearAbove?.id,
        chineseYearBelow?.id,
      );
    const elementMonth =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8CountingIm(
        chineseMonthAbove?.id,
        chineseMonthBelow?.id,
      );
    const elementDay =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8CountingIm(
        chineseDayAbove?.id,
        chineseDayBelow?.id,
      );
    const elementTime =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8CountingIm(
        chineseTimeAbove?.id,
        chineseTimeBelow?.id,
      );
    const elementAscendant =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8CountingIm(
        chineseAscendant?.ascendantAbove?.id,
        chineseAscendant?.ascendantBelow?.id,
      );

    // ราศีแผง
    const hiddenZodiacYear =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8HiddenZodiac(
        chineseYearBelow?.id,
      );
    const hiddenZodiacMonth =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8HiddenZodiac(
        chineseMonthBelow?.id,
      );
    const hiddenZodiacDay =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8HiddenZodiac(
        chineseDayBelow?.id,
      );
    const hiddenZodiacTime =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8HiddenZodiac(
        chineseTimeBelow?.id,
      );
    const hiddenZodiacAscendant =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8HiddenZodiac(
        chineseAscendant?.ascendantBelow?.id,
      );

    const yearInfo = {
      above: chineseYearAbove ? chineseYearAbove.chinese_symbol : '',
      below: chineseYearBelow ? chineseYearBelow.chinese_symbol : '',
      element: elementYear?.element,
      belowHiddenZodiac: hiddenZodiacYear?.hidden_zodiac,
    };

    const monthInfo = {
      above: chineseMonthAbove ? chineseMonthAbove.chinese_symbol : '',
      below: chineseMonthBelow ? chineseMonthBelow.chinese_symbol : '',
      element: elementMonth?.element,
      belowHiddenZodiac: hiddenZodiacMonth?.hidden_zodiac,
    };

    const dayInfo = {
      above: chineseDayAbove ? chineseDayAbove.chinese_symbol : '',
      below: chineseDayBelow ? chineseDayBelow.chinese_symbol : '',
      element: elementDay?.element,
      belowHiddenZodiac: hiddenZodiacDay?.hidden_zodiac,
    };

    const timeInfo = {
      above: chineseTimeAbove ? chineseTimeAbove.chinese_symbol : '',
      below: chineseTimeBelow ? chineseTimeBelow.chinese_symbol : '',
      element: elementTime?.element,
      belowHiddenZodiac: hiddenZodiacTime?.hidden_zodiac,
    };

    const ascendantInfo = {
      above: chineseAscendant
        ? chineseAscendant?.ascendantAbove?.chinese_symbol
        : '',
      below: chineseAscendant
        ? chineseAscendant?.ascendantBelow?.chinese_symbol
        : '',
      element: elementAscendant?.element,
      belowHiddenZodiac: hiddenZodiacAscendant?.hidden_zodiac,
    };

    const yearOfZodiac =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8YearOfZodiac();

    // information
    let analyticsBase = null;
    let analyticHabit = null;
    let analyticElements = [];
    const analyticFeatures = [];
    const analyticColors = [];
    const analyticSacredThings = [];
    const analyticBehaviors = [];
    const analyticBehaviorsForShare = [];
    const analyticOccupations = [];
    let analyticLove = null;
    let analyticElementalCharacteristics = null;
    const analyticLifes = [];
    let analyticsBeCareful = null;
    let mascotInfo = null;
    let chineseCycle = null;
    let chineseYearCycle = null;

    let powerKnowledge = null;
    let powerFriendly = null;
    let powerCustomer = null;
    let powerEducation = null;
    let powerFinance = null;

    let predictionWork = null;

    let displayMascot = '';
    let displayDescription = '';
    let displayTitle = '';

    let elementCycle = null;

    if (is_full_info) {
      // วัยจร
      chineseCycle =
        await this.chineseHoroscope8SquareService.getChineseHoroscope8Cycle(
          chineseYearAbove,
          chineseMonthAbove,
          chineseMonthBelow,
          input.gender,
          month,
          date,
          time,
          parseInt(yearReal),
        );

      // ปีจร
      chineseYearCycle =
        await this.chineseHoroscope8SquareService.getChineseHoroscope8YearCycle(
          chineseYearAbove,
          chineseYearBelow,
          month,
        );

      let POWER = '';
      let ELEMENT = '';
      if (chineseDayAbove) {
        POWER = chineseDayAbove.power;
        ELEMENT = chineseDayAbove.element;
      } else {
      }

      // พื้่นฐานนิสัยธาตุ : วันบน + YANG YIN
      if (chineseDayAbove) {
        const resultAnalyticBase =
          await this.analyticBaseService.getAnalyticBaseService({
            day_above_element: ELEMENT,
            power: POWER,
          } as AnalyticBaseInput);

        if (resultAnalyticBase) {
          analyticsBase = {
            element: resultAnalyticBase.element,
            description: resultAnalyticBase.note,
          };
        }
      }

      // พึงระวัง
      if (chineseDayAbove) {
        const resultAnalyticBeCareful =
          await this.analyticBeCarefulService.getAnalytic({
            day_above_element: ELEMENT,
            power: POWER,
          } as AnalyticBeCarefulInput);

        if (resultAnalyticBeCareful) {
          analyticsBeCareful = {
            element: resultAnalyticBeCareful.element,
            description: resultAnalyticBeCareful.note,
          };
        }
      }

      // คำนวณธาตุแข็ง หรือ อ่อน : วันบน + YANG YIN
      if (
        chineseDayAbove &&
        chineseDayBelow &&
        chineseMonthAbove &&
        chineseMonthBelow &&
        chineseYearAbove &&
        chineseYearBelow
      ) {
        const resultAnalyticElementalCharacteristicsService =
          await this.analyticElementalCharacteristicsService.calculateAnalyticElementalCharacteristics(
            {
              day_above_element: ELEMENT,
              day_below_element: chineseDayBelow.element,
              month_above_element: chineseMonthAbove.element,
              month_below_element: chineseMonthBelow.element,
              year_above_element: chineseYearAbove.element,
              year_below_element: chineseYearBelow.element,
            } as AnalyticElementalCharacteristicsInput,
          );

        if (resultAnalyticElementalCharacteristicsService) {
          analyticElementalCharacteristics = {
            element:
              resultAnalyticElementalCharacteristicsService.day_above_element,
            level: resultAnalyticElementalCharacteristicsService.level,
            remark: resultAnalyticElementalCharacteristicsService.remark,
          };
        }
      }

      if (analyticElementalCharacteristics && chineseDayAbove) {
        const analytic = await this.analyticHabitService.getAnalytic({
          day_above_element: analyticElementalCharacteristics.element,
          power: POWER,
          level: analyticElementalCharacteristics.level,
        } as AnalyticHabitInput);

        if (analytic) {
          analyticHabit = analytic;
        }
      }

      if (analyticElementalCharacteristics && chineseDayAbove) {
        const analytics =
          await this.analyticElementalCharacteristicsService.getAnalytic({
            day_above_element: analyticElementalCharacteristics.element,
            level: analyticElementalCharacteristics.level,
          } as AnalyticElementalCharacteristicsGetElementsInput);

        if (analytics) {
          analyticElements = analytics;
        }
      }

      if (analyticElementalCharacteristics && chineseDayAbove) {
        for (let e = 0; e < analyticElements.length; e++) {
          const element = analyticElements[e].element;
          const sequence = analyticElements[e].sequence;
          const analytic = await this.analyticFeatureService.getAnalytic({
            element: element,
          } as AnalyticFeatureInput);

          // Occupations
          if (analyticElementalCharacteristics && chineseDayAbove) {
            const resultOccupations =
              await this.analyticOccupationService.getAnalytic({
                day_above_element: element,
              } as AnalyticOccupationInput);

            for (let i = 0; i < resultOccupations.length; i++) {
              const sequence = resultOccupations[i].sequence;
              const topic = resultOccupations[i].topic;
              const note = resultOccupations[i].note;
              analyticOccupations.push({
                sequence: sequence,
                topic: topic,
                occupations: note,
              });
            }
          }

          if (analytic) {
            analyticFeatures.push(analytic);

            // COLORS
            const colorsCodes = JSON.parse(analytic.colors);
            const resultColors = await this.colorService.getColor({
              code: colorsCodes,
            });
            analyticColors.push({
              element: element,
              sequence: sequence,
              colors: resultColors,
            });

            // SACRED THINGS
            const sacredThingsCodes = JSON.parse(analytic.sacred_things);
            const resultSacredThings =
              await this.scaredThingService.getScaredThing({
                code: sacredThingsCodes,
              });
            analyticSacredThings.push({
              element: element,
              sequence: sequence,
              sacred_things: resultSacredThings,
            });
          }
        }
      }

      // BEHAVIORS
      if (chineseDayAbove && chineseDayBelow) {
        const resultBehaviour = await this.analyticCharacterService.getAnalytic(
          {
            day_above_id: chineseDayAbove.id,
            day_below_id: chineseDayBelow.id,
          } as AnalyticCharacterInput,
        );
        if (resultBehaviour) {
          analyticBehaviors.push({
            element: analyticElementalCharacteristics.element,
            behavior: resultBehaviour.note,
          });
        }
      }

      // FOR SHARE
      if (chineseDayAbove && chineseDayBelow) {
        const resultBehaviourForShare =
          await this.analyticCharacterForShareService.getAnalytic({
            day_above_id: chineseDayAbove.id,
            day_below_id: chineseDayBelow.id,
          } as AnalyticCharacterForShareInput);
        if (resultBehaviourForShare) {
          analyticBehaviorsForShare.push({
            element: analyticElementalCharacteristics.element,
            behavior: resultBehaviourForShare.note,
          });

          displayDescription = resultBehaviourForShare.note;
        }
      }

      // คำนวณกราฟชีวิต
      if (chineseCycle && chineseDayAbove && chineseCycle.life) {
        for (let m = 0; m < chineseCycle.life.length; m++) {
          const chinessAboveId = chineseDayAbove.id;
          const month_chinese_id = chineseCycle.life[m].month_chinese_id;
          const is_above = chineseCycle.life[m].is_above;
          const ageChinese = chineseCycle.life[m].ageChinese;
          const ageStart = chineseCycle.life[m].ageStart;
          const ageEnd = chineseCycle.life[m].ageEnd;

          const resultLifes = await this.analyticLifeService.getAnalytic({
            day_above_id: chinessAboveId,
            month_id: month_chinese_id,
            is_above: is_above,
          } as AnalyticLifeInput);

          let resultLife = null;
          let resultLifeInfo = null;
          if (resultLifes) {
            const box = m + 1;
            resultLifeInfo = resultLifes;
            if (box >= 1 && box <= 2) {
              // CHILD
              resultLife = resultLifes.child;
            } else if (box >= 3 && box <= 4) {
              // TEEN
              resultLife = resultLifes.teen;
            } else if (box >= 5 && box <= 12) {
              // ADULT
              resultLife = resultLifes.adult;
            } else if (box >= 13 && box <= 18) {
              // ELDER
              resultLife = resultLifes.elder;
            }
          }
          if (resultLife) {
            analyticLifes.push({
              ageChinese: ageChinese,
              ageStart: ageStart,
              ageEnd: ageEnd,
              score: resultLifeInfo.score,
              description: resultLifeInfo.description,
              note: resultLife,
            });
          }
        }
      }

      if (chineseDayAbove && chineseDayBelow) {
        const analytic = await this.analyticLoveService.getAnalytic({
          day_above_id: chineseDayAbove.id,
          day_below_id: chineseDayBelow.id,
        } as AnalyticLoveInput);

        if (analytic) {
          analyticLove = analytic;
        }
      }

      // พลัง
      if (
        chineseDayAbove &&
        chineseDayBelow &&
        chineseTimeAbove &&
        chineseTimeBelow
      ) {
        const power = await this.powerKnowledgeService.getAnalytic({
          day_above_id: chineseDayAbove.id,
          day_below_id: chineseDayBelow.id,
          time_above_id: chineseTimeAbove.id,
          time_below_id: chineseTimeBelow.id,
        } as PowerKnowledgeInput);

        if (power) {
          powerKnowledge = power;
        }
      }
      if (chineseDayAbove && chineseDayBelow) {
        const power = await this.powerFriendlyService.getAnalytic({
          day_above_id: chineseDayAbove.id,
          day_below_id: chineseDayBelow.id,
        } as PowerFriendlyInput);

        if (power) {
          powerFriendly = power;
        }
      }
      if (
        chineseDayAbove &&
        chineseDayBelow &&
        chineseYearAbove &&
        chineseYearBelow
      ) {
        const power = await this.powerCustomerService.getAnalytic({
          day_above_id: chineseDayAbove.id,
          day_below_id: chineseDayBelow.id,
          year_above_id: chineseYearAbove.id,
          year_below_id: chineseYearBelow.id,
        } as PowerCustomerInput);

        if (power) {
          powerCustomer = power;
        }
      }
      if (
        chineseDayAbove &&
        chineseDayBelow &&
        chineseMonthAbove &&
        chineseMonthBelow
      ) {
        const power = await this.powerEducationService.getAnalytic({
          day_above_id: chineseDayAbove.id,
          day_below_id: chineseDayBelow.id,
          month_above_id: chineseMonthAbove.id,
          month_below_id: chineseMonthBelow.id,
        } as PowerEducationInput);

        if (power) {
          powerEducation = power;
        }
      }
      if (chineseDayAbove && chineseDayBelow) {
        const power = await this.powerFinanceService.getAnalytic({
          time_above_id: chineseTimeAbove?.id,
          time_below_id: chineseTimeBelow?.id,
          day_above_id: chineseDayAbove?.id,
          day_below_id: chineseDayBelow?.id,
          month_above_id: chineseMonthAbove?.id,
          month_below_id: chineseMonthBelow?.id,
          year_above_id: chineseYearAbove?.id,
          year_below_id: chineseYearBelow?.id,
        } as PowerFinanceInput);

        // const power = await this.powerFinanceService.getAnalytic({
        //   time_above_id: 6,
        //   time_below_id: 6,
        //   day_above_id: 1,
        //   day_below_id: 7,
        //   month_above_id: 8,
        //   month_below_id: 4,
        //   year_above_id: 8,
        //   year_below_id: 10,
        // } as PowerFinanceInput)
        /*

      6	1	8	8
      6	7	4	10

      */

        if (power) {
          powerFinance = power;
        }
      }

      if (
        chineseDayAbove &&
        chineseDayBelow &&
        chineseMonthAbove &&
        chineseMonthBelow
      ) {
        const power = await this.predictionWorkService.getAnalytic({
          day_above_id: chineseDayAbove?.id,
          day_below_id: chineseDayBelow?.id,
          month_above_id: chineseMonthAbove?.id,
          month_below_id: chineseMonthBelow?.id,
        } as PowerFinanceInput);

        if (power) {
          predictionWork = power;
        }
      }

      // MASCOT
      if (
        chineseDayAbove &&
        chineseDayAbove.element &&
        chineseDayAbove.power &&
        input.gender
      ) {
        // V1 : 12 Character
        // const mascotResult = await this.mascotService.getMascot({
        //   day_above_element: chineseDayAbove.element,
        //   gender: input.gender,
        //   power: chineseDayAbove.power
        // } as MascotGetInput)

        // if (mascotResult) {
        //   mascotInfo = {
        //     url: mascotResult.url,
        //     name: mascotResult.description,
        //   }
        // }

        // V2 : 60 Character
        const mascotResult = await this.mascotService.getMascotV2({
          power: chineseDayAbove.power,
          day_below_id: chineseDayBelow.id,
          element: chineseDayAbove.element,
        } as MascotGetV60Input);
        console.log(mascotResult);
        if (mascotResult) {
          mascotInfo = {
            url: mascotResult.url,
            name: mascotResult.description,
          };
          displayMascot = mascotResult.url;
          displayTitle = mascotResult.description;
        }
      }

      if (chineseDayAbove && input.gender) {
        // อธิบายวงจรธาตุ
        elementCycle = await this.elementCycleService.getElementCycle(
          chineseDayAbove ? chineseDayAbove.element : '',
          chineseDayAbove ? chineseDayAbove.power : '',
          input.gender,
        );
      }
    }

    const resultChinese = {
      dob: dob,
      time: time,
      name: input.name,
      gender: input.gender,
      dobThai: formatDateThai(dob),
      yearOfZodiac: yearOfZodiac,
      summary: {
        element: chineseDayAbove ? chineseDayAbove.element : '',
        power: chineseDayAbove ? chineseDayAbove.power : '',
        year: yearInfo,
        month: monthInfo,
        day: dayInfo,
        time: timeInfo,
        ascendant: ascendantInfo,
        yearAbove: chineseYearAbove ? chineseYearAbove.chinese_symbol : '',
        yearBelow: chineseYearBelow ? chineseYearBelow.chinese_symbol : '',
        monthAbove: chineseMonthAbove ? chineseMonthAbove.chinese_symbol : '',
        monthBelow: chineseMonthBelow ? chineseMonthBelow.chinese_symbol : '',
        dayAbove: chineseDayAbove ? chineseDayAbove.chinese_symbol : '',
        dayBelow: chineseDayBelow ? chineseDayBelow.chinese_symbol : '',
        timeAbove: chineseTimeAbove ? chineseTimeAbove.chinese_symbol : '',
        timeBelow: chineseTimeBelow ? chineseTimeBelow.chinese_symbol : '',
        mascot: mascotInfo,
      },
      cycleLife: chineseCycle,
      cycleYearLife: chineseYearCycle,
      detail: {
        yearAbove: chineseYearAbove,
        yearBelow: chineseYearBelow,
        monthAbove: chineseMonthAbove,
        monthBelow: chineseMonthBelow,
        dayAbove: chineseDayAbove,
        dayBelow: chineseDayBelow,
        timeAbove: chineseTimeAbove,
        timeBelow: chineseTimeBelow,
        ascendantAbove: chineseAscendant?.ascendantAbove,
        ascendantBelow: chineseAscendant?.ascendantBelow,
      },
      analytic: {
        base: analyticsBase,
        elemental_characteristics: analyticElementalCharacteristics,
        habit: analyticHabit,
        behaviors: analyticBehaviors,
        behaviors_for_share: analyticBehaviorsForShare,
        be_careful: analyticsBeCareful,
        occupations: analyticOccupations,
        lucky_colors: analyticColors,
        sacred_things: analyticSacredThings,
        love: analyticLove,
        life: analyticLifes,
        prediction_work: predictionWork,
      },
      power: {
        knowledge: powerKnowledge,
        friendly: powerFriendly,
        customer: powerCustomer,
        education: powerEducation,
        finance: powerFinance,
      },
      elementCycle: elementCycle,
    } as ChineseHoroscopeResponse;

    // LOG
    resultChinese.code = '';
    resultChinese.share_profile_url = '';

    console.log(resultChinese);
    if (input.user_id && input.user_id != '') {
      // UPLOAD SHARE TO S3
      const bufferShare = await this.cardService.generateImage(
        displayMascot,
        displayDescription,
        displayTitle,
      );
      console.log('bufferShare');
      console.log(bufferShare);
      if (bufferShare) {
        const createAt = this.momentWrapper.moment().format('YYYYMMDD_HHmmss');
        const result = await this.objectStorageService.putObject({
          s3Key: `share_profile_${createAt}` + '.jpg',
          body: bufferShare,
          mimetype: 'image/jpeg',
        });
        if (result && result.Location) {
          console.log(result);
          resultChinese.share_profile_url = result.Location;
          await this.userService.updateShareUrlProfile({
            user_id: input.user_id,
            url: result.Location,
          });
        }
      }

      const resultLog = await this.logCalculateService.insertLogCalculate({
        user_id: input.user_id,
        name: '',
        dob: input.dob,
        time: input.time,
        gender: input.gender,
        is_remember_time: input.time == '' ? false : true,
        place_name: input.place_name,
        result: resultChinese,
      } as LogCalculateInsertInput);

      console.log('resultLog:');
      console.log(resultLog);

      resultChinese.code = resultLog.code;

      await this.userService.updateInfo({
        user_id: input.user_id,
        place_name: input.place_name,
        dob: dob,
        time: time,
        gender: input.gender,
        is_remember_time: time != '',
        result_code: resultLog.code,
        account_name: input.account_name,
        name: input.name,
        surname: input.surname,
        picture_url: input.picture_url,
      } as UserUpdateInfoInput);
    }

    return resultChinese;
  }

  /*
    [ ][ ][x][ ]
    [ ][ ][ ][ ]
  */
  async chineseHoroscope4RowsMonthAbove(
    year_above_id: number,
    month_chinese_index: number,
  ): Promise<any> {
    const result =
      await this.chineseHoroscope8SquareService.getChineseHoroscope8MonthHongHouTung(
        {
          year_above_id: year_above_id,
          month_chinese_index: month_chinese_index,
        } as ChineseHoroscope8SquareCheckMonthHongHouTungInput,
      );
    if (result) {
      // check month table
      return result.month_above_id;
    }
    return null;
  }

  /*
    [ ][ ][ ][ ]
    [ ][ ][x][ ]
  */
  async chineseHoroscope4RowsMonthBelow(
    month: number,
    date: number,
  ): Promise<any> {
    // 1. คศ + 1
    // 2. check ช่วงวันว่าอยู่ในเดือนนั้นจริงไหม จากตาราง ตัดเดือน
    if (month && date) {
      const monthAddOne = month + 1;
      const resultCheckMonth =
        await this.chineseHoroscope8SquareService.getChineseHoroscope8MonthChinese(
          {
            date: date,
            month: month,
          } as ChineseHoroscope8SquareCheckMonthChineseInput,
        );
      if (resultCheckMonth) {
        return {
          month_chinese_id: resultCheckMonth.month_chinese_id,
          chinese_horoscope_8_square_below_id:
            resultCheckMonth.chinese_horoscope_8_square_below_id,
        };
      }
    }
    return null;
  }

  /*
    [ ][ ][ ][x]
    [ ][ ][ ][ ]
  */
  async chineseHoroscope4RowsYearAbove(yearThai: number): Promise<any> {
    const result = yearThai + 4;
    if (result.toString().length > 0) {
      const lastCharacter = result
        .toString()
        .charAt(result.toString().length - 1);
      if (lastCharacter == '0') {
        return 10;
      }
      return lastCharacter;
    }
    return null;
  }

  /*
    [ ][ ][ ][ ]
    [ ][ ][ ][x]
  */
  async chineseHoroscope4RowsYearBelow(yearThai: number): Promise<any> {
    const result = yearThai - 6;
    if (result > 0) {
      let divisionResult = result % 12;
      divisionResult = divisionResult == 0 ? 12 : divisionResult;
      return divisionResult;
    }
  }

  // #mootech-matching-bazi-swap: compute compatibility via the bazi pair engine.
  // Returns null (so the caller falls back to the legacy table compute) when the
  // engine is disabled, the input is not usable (e.g. missing birth time), or the
  // bazi call fails/times out. Read-only against bazi; no engine mutation.
  async computeBaziPair(
    _input: CompatibilityLoveAnalyticInput,
    type: MatchingType,
  ): Promise<MatchingComputeResult | null> {
    if (!isBaziMatchingEnabled()) {
      return null;
    }
    const req = toBaziPairRequest(_input.me, _input.you, type);
    if (!req) {
      return null;
    }
    try {
      const resp = await fetchBaziPair(req);
      const mapped = mapBaziPairToComputeResult(resp, type);
      if (!mapped.result || mapped.result.score == null) {
        return null;
      }
      return mapped;
    } catch (e) {
      console.error(
        '[matching][bazi] pair failed, falling back to legacy:',
        e?.message ?? e,
      );
      return null;
    }
  }

  // สมพงษ์ รัก
  async compatibilityLove(
    _input: CompatibilityLoveAnalyticInput,
  ): Promise<any> {
    // CHECK
    const checkResult = await this.isCheckCompatibilityLove(_input);
    // if (checkResult.status == 400) {
    //   return { status: 400 }
    // }

    // bazi engine first (env-gated, reversible); preserve the same side effects.
    const baziLove = await this.computeBaziPair(_input, 'LOVE');
    if (baziLove) {
      await this.logWoLoveMateService.insertLogLoveMate({
        user_id: _input.user_id,
        name: _input.me.name,
        dob: _input.me.dob,
        time: _input.me.time,
        gender: _input.me.gender,
        your_name: _input.you.name,
        your_dob: _input.you.dob,
        your_time: _input.you.time,
        your_gender: _input.you.gender,
        result: baziLove.result,
      } as LogLoveMateInsertInput);
      await this.userService.updateLoveMate(_input.user_id);
      return baziLove;
    }

    const meResult = await this.chineseHoroscope4Rows(_input.me, false);
    const youResult = await this.chineseHoroscope4Rows(_input.you, false);

    if (meResult && youResult) {
      const day_above_id = meResult.detail.dayAbove.id;
      const day_below_id = meResult.detail.dayBelow.id;

      const year_above_id = youResult.detail.yearAbove.id;
      const year_below_id = youResult.detail.yearBelow.id;

      const resultLove = await this.compatibilityLoveService.getAnalytic({
        day_above_id: day_above_id,
        day_below_id: day_below_id,
        year_above_id: year_above_id,
        year_below_id: year_below_id,
      } as CompatibilityLoveInput);
      if (resultLove) {
        // LOG
        await this.logWoLoveMateService.insertLogLoveMate({
          user_id: _input.user_id,
          name: _input.me.name,
          dob: _input.me.dob,
          time: _input.me.time,
          gender: _input.me.gender,
          your_name: _input.you.name,
          your_dob: _input.you.dob,
          your_time: _input.you.time,
          your_gender: _input.you.gender,
          result: resultLove,
        } as LogLoveMateInsertInput);

        // UPDATE
        await this.userService.updateLoveMate(_input.user_id);

        return {
          me: meResult,
          you: youResult,
          result: resultLove,
        };
      }
    }

    return {};
  }

  // สมพงษ์ งาน
  async compatibilityWork(
    _input: CompatibilityLoveAnalyticInput,
  ): Promise<any> {
    // CHECK
    const checkResult = await this.isCheckCompatibilityWork(_input);
    // if (checkResult.status == 400) {
    //   return { status: 400 }
    // }

    // bazi engine first (env-gated, reversible); preserve the same side effects.
    const baziWork = await this.computeBaziPair(
      _input,
      (_input.type as MatchingType) ?? 'FRIEND',
    );
    if (baziWork) {
      await this.logWorkVibeService.insertLogWorkVibe({
        user_id: _input.user_id,
        type: _input.type,
        name: _input.me.name,
        dob: _input.me.dob,
        time: _input.me.time,
        gender: _input.me.gender,
        your_name: _input.you.name,
        your_dob: _input.you.dob,
        your_time: _input.you.time,
        your_gender: _input.you.gender,
        result: baziWork.result,
      } as LogWorkVibeInsertInput);
      await this.userService.updateWorkVibes(_input.user_id);
      return baziWork;
    }

    const meResult = await this.chineseHoroscope4Rows(_input.me, false);
    const youResult = await this.chineseHoroscope4Rows(_input.you, false);

    if (meResult && youResult) {
      let day_above_id = meResult.detail.dayAbove.id;
      let day_below_id = meResult.detail.dayBelow.id;

      let year_above_id = youResult.detail.dayAbove.id;
      let year_below_id = youResult.detail.dayBelow.id;

      if (_input.type == 'BOSS') {
        day_above_id = meResult.detail.dayAbove.id;
        day_below_id = meResult.detail.dayBelow.id;

        year_above_id = youResult.detail.monthAbove.id;
        year_below_id = youResult.detail.monthBelow.id;
      } else if (_input.type == 'EMPLOYEE') {
        if (!meResult.detail.timeAbove) {
          return null;
        }
        day_above_id = meResult.detail.timeAbove.id;
        day_below_id = meResult.detail.timeBelow.id;

        year_above_id = youResult.detail.dayAbove.id;
        year_below_id = youResult.detail.dayBelow.id;
      } else if (_input.type == 'FRIEND') {
        day_above_id = meResult.detail.dayAbove.id;
        day_below_id = meResult.detail.dayBelow.id;

        year_above_id = youResult.detail.dayAbove.id;
        year_below_id = youResult.detail.dayBelow.id;
      }

      /*
          EMPLOYEE:
            boss_time x employee_day
          
          FRIEND:
            me_day x friend_day

          BOSS:
            employee_day x boss_month

        */

      const resultLove = await this.compatibilityWorkService.getAnalytic({
        person_1_above_id: day_above_id,
        person_1_below_id: day_below_id,
        person_2_above_id: year_above_id,
        person_2_below_id: year_below_id,
        type: _input.type,
      } as CompatibilityWorkInput);

      if (resultLove) {
        // LOG
        await this.logWorkVibeService.insertLogWorkVibe({
          user_id: _input.user_id,
          type: _input.type,
          name: _input.me.name,
          dob: _input.me.dob,
          time: _input.me.time,
          gender: _input.me.gender,
          your_name: _input.you.name,
          your_dob: _input.you.dob,
          your_time: _input.you.time,
          your_gender: _input.you.gender,
          result: resultLove,
        } as LogWorkVibeInsertInput);

        // UPDATE
        await this.userService.updateWorkVibes(_input.user_id);

        return {
          me: meResult,
          you: youResult,
          result: resultLove,
        };
      }
    }

    return {};
  }

  async isCheckCompatibilityWork(_input: any): Promise<any> {
    const userResult = await this.userService.getUserById({
      user_id: _input.user_id,
    });

    if (!userResult) {
      return { status: 400 };
    }

    const num = userResult.used_point;
    const max = userResult.total_point;

    if (num >= max) {
      return { status: 400 };
    }

    const total = await this.logWorkVibeService.getLogWorkVibes({
      user_id: _input.user_id,
    });

    if (total >= max) {
      return { status: 400 };
    }

    return { status: 200 };
  }

  async isCheckCompatibilityLove(_input: any): Promise<any> {
    const userResult = await this.userService.getUserById({
      user_id: _input.user_id,
    });

    if (!userResult) {
      return { status: 400 };
    }

    const num = userResult.used_point;
    const max = userResult.total_point;

    if (num >= max) {
      return { status: 400 };
    }

    const total = await this.logWoLoveMateService.getLogLoveMate({
      user_id: _input.user_id,
    });

    if (total >= max) {
      return { status: 400 };
    }

    return { status: 200 };
  }

  async getResult(input: ChineseHoroscopeAnalyticGetInput): Promise<any> {
    const result = await this.logCalculateService.getLogCalculate(
      input.code,
      input.userId,
    );
    return { data: JSON.parse(result.result) };
  }

  async getShare(input: ChineseHoroscopeAnalyticGetInput): Promise<any> {
    const result = await this.logCalculateService.getLogCalculateNoUser(
      input.code,
    );
    if (result) {
      const raw = JSON.parse(result.result);
      let data = '';
      if (raw && raw.analytic && raw.analytic.behaviors) {
        const behaviors = raw.analytic.behaviors_for_share;

        if (behaviors.length > 0) {
          data = behaviors[0].behavior;
        }
      }

      return {
        data: {
          mascot: raw.summary.mascot,
          analytic: {
            base: data,
          },
        },
      };
    }

    return null;
  }
}
