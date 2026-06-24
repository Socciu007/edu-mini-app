import type { Question, QuestionProvider, SubjectId, Difficulty } from './types';

export class LocalBankProvider implements QuestionProvider {
  readonly name = 'local' as const;

  // Per-instance shuffled index for non-repetition
  private queue: Map<SubjectId, string[]>;

  constructor(private readonly all: Question[]) {
    this.queue = new Map();
  }

  private shuffledIdsFor(subject: SubjectId): string[] {
    const ids = this.all.filter((q) => q.subject === subject).map((q) => q.id);
    // Fisher-Yates with Math.random — non-deterministic; that's fine for UX
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }

  private refillQueue(subject: SubjectId) {
    this.queue.set(subject, this.shuffledIdsFor(subject));
  }

  async getQuestion(ctx: { subject: SubjectId; difficulty?: Difficulty; excludeIds?: string[] }): Promise<Question> {
    let queue = this.queue.get(ctx.subject);
    if (!queue || queue.length === 0) {
      this.refillQueue(ctx.subject);
      queue = this.queue.get(ctx.subject)!;
    }

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (ctx.excludeIds?.includes(id)) continue;
      const q = this.all.find((x) => x.id === id);
      if (q) return q;
    }
    throw new Error(`No questions available for subject: ${ctx.subject}`);
  }
}