import { Injectable } from '@nestjs/common';

const PROMPTS = [
  'What story changed the way you see something?',
  'Which character do you think about long after the credits?',
  'If you could step into any world you visited this week — which one?',
  'What did you watch that made you feel less alone?',
  'Describe a scene that made you pause and rewind.',
  'Which story surprised you — and why?',
  "What are you putting off watching because you're not ready for it to end?",
  "What's the most beautiful frame you saw this week?",
  'Which story would you recommend to your past self?',
  'What did you finish that stayed with you through the whole day?',
  'Describe the soundtrack to your life this week — using only titles.',
  "What's a line of dialogue you can't stop thinking about?",
  'Which story made you cry, laugh, or both this month?',
  'What movie should everyone watch at least once — and why?',
  'What are you watching that nobody you know is watching?',
  "What story did you love that you didn't expect to?",
  'Which character would you want as a friend — and which would terrify you?',
  "What's a book you wish you could read again for the first time?",
  "What game world do you miss when you're not playing?",
  'What album do you return to when nothing else fits?',
];

@Injectable()
export class PromptService {
  getDailyPrompt(userId: string, dateStr?: string): { prompt: string; index: number } {
    const date = dateStr ?? new Date().toISOString().slice(0, 10);
    let hash = 0;
    const key = `${userId}-${date}`;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % PROMPTS.length;
    return { prompt: PROMPTS[idx], index: idx };
  }

  getPromptByIndex(index: number): { prompt: string; index: number } {
    return { prompt: PROMPTS[index % PROMPTS.length], index: index % PROMPTS.length };
  }

  getAllPrompts(): string[] {
    return PROMPTS;
  }
}
