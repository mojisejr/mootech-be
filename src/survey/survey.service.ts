import { Injectable } from '@nestjs/common';
import { LogSurveyService } from 'src/log-survey/log-survey.service';

type ScoreMap = { [key: string]: number };

interface Result {
  type: string;
  scores: ScoreMap;
  title: string;
  url: string;
  description: string;
  strengths: string[];
  emoji: string;
}

@Injectable()
export class SurveyService {
  constructor(private logSurveyService: LogSurveyService) {}

  private readonly priority = ['T', 'F', 'C', 'R', 'A', 'L'];

  async surveyGet(): Promise<any> {
    const result: any[] = [];
    result.push({
      no: 1,
      topic: 'เวลาเจอปัญหาใหญ่ๆ คุณจะทำยังไง?',
      choice_1: 'นั่งคิดแก้ปัญหาทีละขั้น วิเคราะห์สิ่งที่เกิดขึ้น',
      choice_2: 'โทรหาเพื่อน ปรึกษาเลย อยากให้มีคนรับฟัง',
      choice_3: 'เปิด Google หาข้อมูล เผื่อมีคำตอบ',
      choice_4: 'หาอย่างอื่นทำให้ใจเย็นก่อน แล้วค่อยกลับมาคิด',
    });

    result.push({
      no: 2,
      topic: 'ตอนทำงานกลุ่ม ส่วนใหญ่คุณจะเป็นคนแบบไหน?',
      choice_1: 'เป็นคนวางแผนและแจกงานให้ทุกคน',
      choice_2: 'เป็นคนคิด concept มีไอเดียใหม่ๆ สร้างสรรค์ๆ',
      choice_3: 'เป็นคนรวบรวมงานและทำให้เสร็จ',
      choice_4: 'เป็นคนเป็นกำลังใจให้ทุกคนอยู่ตลอด',
    });

    result.push({
      no: 3,
      topic: 'Social media ไหนที่คุณใช้บ่อยที่สุด?',
      choice_1: 'Instagram - ชอบดูภาพสวยๆ',
      choice_2: 'TikTok - ชอบคอนเทนต์สั้นๆ สนุกๆ',
      choice_3: 'Twitter/X - ชอบอ่านข่าวและแสดงความคิดเห็น',
      choice_4: 'Discord/LINE - ชอบคุยกับเพื่อนๆ',
    });

    result.push({
      no: 4,
      topic: 'เวลาว่างชอบทำอะไรมากที่สุด?',
      choice_1: 'ดูซีรีส์ Netflix ชิล ๆ',
      choice_2: 'เล่นเกม หรือหาอะไรใหม่ๆ ทำ',
      choice_3: 'อ่านหนังสือ บทความ หาความรู้ใหม่ๆ',
      choice_4: 'ออกไปเที่ยวกับเพื่อนๆ',
    });

    result.push({
      no: 5,
      topic: 'ถ้าต้องเลือกงานทำ คุณจะเลือกแบบไหน?',
      choice_1: 'งานที่ได้ใช้ความคิดสร้างสรรค์',
      choice_2: 'งานที่ได้ช่วยเหลือผู้คน เจอผู้คนเยอะๆ',
      choice_3: 'งานที่ท้าทายและได้เรียนรู้',
      choice_4: 'งานที่ที่มีความชัดเจน มั่นคง',
    });

    result.push({
      no: 6,
      topic: 'เวลาตัดสินใจซื้อของ คุณจะพิจารณาอะไร?',
      choice_1: 'ดูรีวิว เปรียบเทียบราคาจนครบ',
      choice_2: 'เลือกของตามฟีลลิ่ง ถ้าชอบก้ซื้อเลย',
      choice_3: 'คิดว่าคุ้มค่ากับการใช้งานไหม',
      choice_4: 'ถามเพื่อนๆ ว่าใช้แล้วเป็นยังไง',
    });

    result.push({
      no: 7,
      topic: 'ในกลุ่มเพื่อน คุณมักจะเป็นคนแบบไหน?',
      choice_1: 'คนที่คิดกิจกรรมสนุกๆ ให้กลุ่ม',
      choice_2: 'คนที่สร้างบรรยากาศดีๆ ให้ทุกคน',
      choice_3: 'คนที่ให้คำแนะนำเวลาเพื่อนมีปัญหา',
      choice_4: 'คนที่ทำตามและสนับสนุนคนอื่น',
    });

    result.push({
      no: 8,
      topic: 'เวลาเครียด คุณจะจัดการยังไง?',
      choice_1: 'หาอะไรทำเพื่อปลดปล่อยความรู้สึก (วาด เต้น ร้องเพลง)',
      choice_2: 'ออกกำลังกายหรือทำกิจกรรมที่ต้องเคลื่อนไหว',
      choice_3: 'เขียน journal หรือนั่งคิดวิเคราะห์ตัวเอง',
      choice_4: 'พูดคุยกับคนใกล้ชิด',
    });

    result.push({
      no: 9,
      topic: 'คุณคิดว่าจุดเด่นของคุณคืออะไร?',
      choice_1: 'มีไอเดียเยอะ คิดนอกกรอบ',
      choice_2: 'ใจดี เข้าใจคนอื่นง่าย',
      choice_3: 'วิเคราะห์เก่ง คิดเป็นเหตุเป็นผล',
      choice_4: 'ทำงานเสร็จตรงเวลา เชื่อถือได้',
    });

    result.push({
      no: 10,
      topic: 'ถ้ามีพลังพิเศษได้ 1 อย่าง คุณอยากได้อะไร?',
      choice_1: 'อ่านใจคนอื่นได้',
      choice_2: 'สร้างสิ่งต่างๆ ขึ้นมาได้ด้วยจินตนาการ',
      choice_3: 'รู้คำตอบของทุกคำถาม',
      choice_4: 'เทเลพอร์ตไปที่ไหนก็ได้',
    });

    return result;
  }

  private readonly typeDescriptions: Record<string, Omit<Result, 'scores'>> = {
    T: {
      type: 'T',
      emoji: '🧠',
      title: 'The Thinker (นักคิดวิเคราะห์)',
      url: 'https://cdn.phoenix-stark.com/mootech/personality/thinker.png',
      description:
        'คุณเป็นคนที่ชอบใช้เหตุผลและวิเคราะห์ทุกสิ่ง มองปัญหาอย่างลึกซึ้งและหาทางแก้ไขอย่างเป็นระบบ',
      strengths: [
        'วิเคราะห์เก่ง',
        'คิดอย่างมีเหตุผล',
        'แก้ปัญหาได้ดี',
        'มีความเป็นผู้นำทางความคิด',
      ],
    },
    F: {
      type: 'F',
      emoji: '💝',
      title: 'The Feeler (นักรู้ใจ)',
      url: 'https://cdn.phoenix-stark.com/mootech/personality/feeler.png',
      description:
        'คุณเป็นคนที่เข้าใจความรู้สึกคนอื่นได้ดี มีจิตใจที่อบอุ่นและชอบช่วยเหลือคนรอบข้าง',
      strengths: [
        'EQ สูง',
        'เป็นที่ปรึกษาที่ดี',
        'สร้างความสัมพันธ์ดี',
        'มีเมตตาจิต',
      ],
    },
    C: {
      type: 'C',
      emoji: '🎨',
      title: 'The Creator (นักสร้างสรรค์)',
      url: 'https://cdn.phoenix-stark.com/mootech/personality/creator.png',
      description:
        'คุณเป็นคนที่เต็มไปด้วยจินตนาการและความคิดสร้างสรรค์ ชอบทำสิ่งใหม่ๆ และแตกต่าง',
      strengths: [
        'คิดนอกกรอบ',
        'สร้างสรรค์',
        'มีไอเดียเยอะ',
        'เป็นแรงบันดาลใจให้คนอื่นได้',
      ],
    },
    R: {
      type: 'R',
      emoji: '⚡',
      title: 'The Reliable (คนที่เชื่อถือได้)',
      url: 'https://cdn.phoenix-stark.com/mootech/personality/reliable.png',
      description:
        'คุณเป็นคนที่พึ่งพาได้ ทำงานเสร็จตรงเวลา และเป็นหลักเป็นฐานให้คนรอบข้าง',
      strengths: [
        'เชื่อถือได้',
        'มีระเบียบ',
        'ปฏิบัติงานดี',
        'มั่นคง และ สม่ำเสมอ',
      ],
    },
    A: {
      type: 'A',
      emoji: '🚀',
      title: 'The Adventurer (นักผจญภัย)',
      url: 'https://cdn.phoenix-stark.com/mootech/personality/adventurer.png',
      description:
        'คุณเป็นคนที่ชอบความท้าทายและการผจญภัย ไม่กลัวที่จะลองสิ่งใหม่ๆ และปรับตัวได้เร็ว',
      strengths: ['กล้าเสี่ยง', 'ปรับตัวเร็ว', 'มีพลังบวก', 'ชอบความท้าทาย'],
    },
    L: {
      type: 'L',
      emoji: '👑',
      title: 'The Leader (ผู้นำโดยธรรมชาติ)',
      url: 'https://cdn.phoenix-stark.com/mootech/personality/leader.png',
      description:
        'คุณมีความเป็นผู้นำโดยธรรมชาติ ชอบวางแผนและจัดการทุกอย่างให้เป็นระเบียบ',
      strengths: ['ภาวะผู้นำ', 'วางแผนเก่ง', 'จัดการได้ดี', 'มีวิสัยทัศน์'],
    },
  };

  async calculate(
    user_id: string,
    choices: { no: number; answer: number }[],
  ): Promise<any> {
    const totalScores: ScoreMap = {
      T: 0,
      F: 0,
      R: 0,
      A: 0,
      L: 0,
      C: 0,
    };

    for (const choice of choices) {
      const score = this.getScore(choice.no, choice.answer);
      for (const key in score) {
        totalScores[key] += score[key];
      }
    }

    const maxScore = Math.max(...Object.values(totalScores));
    const topTypes = Object.entries(totalScores)
      .filter(([_, val]) => val === maxScore)
      .map(([type]) => type);

    for (const p of this.priority) {
      if (topTypes.includes(p)) {
        const desc = this.typeDescriptions[p];

        const resultInfo = {
          ...desc,
          scores: totalScores,
        };

        const resultLog = await this.logSurveyService.insertLogSurvey({
          user_id: user_id,
          result: resultInfo,
        });
        return {
          ...desc,
          scores: totalScores,
          code: resultLog.code,
        };
      }
    }

    return {
      type: '',
      title: '',
      description: '',
      strengths: [],
      emoji: '',
      scores: totalScores,
    };
  }

  private getScore(no: number, choice_no: number): ScoreMap {
    const score: ScoreMap = { T: 0, F: 0, R: 0, A: 0, L: 0, C: 0 };

    if (no === 1) {
      if (choice_no === 1) score.T++;
      else if (choice_no === 2) score.F++;
      else if (choice_no === 3) score.R++;
      else if (choice_no === 4) score.A++;
    } else if (no === 2) {
      if (choice_no === 1) score.L++;
      else if (choice_no === 2) score.C++;
      else if (choice_no === 3) score.R++;
      else if (choice_no === 4) score.F++;
    } else if (no === 3) {
      if (choice_no === 1) score.C++;
      else if (choice_no === 2) score.A++;
      else if (choice_no === 3) score.T++;
      else if (choice_no === 4) score.F++;
    } else if (no === 4) {
      if (choice_no === 1) score.R++;
      else if (choice_no === 2) score.A++;
      else if (choice_no === 3) score.T++;
      else if (choice_no === 4) score.F++;
    } else if (no === 5) {
      if (choice_no === 1) score.C++;
      else if (choice_no === 2) score.F++;
      else if (choice_no === 3) score.T++;
      else if (choice_no === 4) score.R++;
    } else if (no === 6) {
      if (choice_no === 1) score.R++;
      else if (choice_no === 2) score.A++;
      else if (choice_no === 3) score.T++;
      else if (choice_no === 4) score.F++;
    } else if (no === 7) {
      if (choice_no === 1) score.L++;
      else if (choice_no === 2) score.F++;
      else if (choice_no === 3) score.T++;
      else if (choice_no === 4) score.R++;
    } else if (no === 8) {
      if (choice_no === 1) score.C++;
      else if (choice_no === 2) score.A++;
      else if (choice_no === 3) score.T++;
      else if (choice_no === 4) score.F++;
    } else if (no === 9) {
      if (choice_no === 1) score.C++;
      else if (choice_no === 2) score.F++;
      else if (choice_no === 3) score.T++;
      else if (choice_no === 4) score.R++;
    } else if (no === 10) {
      if (choice_no === 1 || choice_no === 2) score.C++;
      else if (choice_no === 3) score.T++;
      else if (choice_no === 4) score.A++;
    }

    return score;
  }

  async getResult(input: any): Promise<any> {
    const result = await this.logSurveyService.getLogSurvey(input.code);
    return { data: JSON.parse(result.result) };
  }
}
