import { z } from "zod";

/**
 * Zod schema for POST /v1/verify
 * Accepts standard { task, worker: { output } } as well as legacy/compat { taskSpec, workerOutput }.
 */
export const VerificationRequestSchema = z
  .object({
    task: z.string().min(1, "Task description cannot be empty").optional(),
    taskSpec: z
      .union([
        z.string().min(1),
        z.object({
          description: z.string().optional(),
          title: z.string().optional(),
        }),
      ])
      .optional(),
    worker: z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
        output: z.string().min(1, "Worker output cannot be empty").optional(),
        workerId: z.string().optional(),
      })
      .optional(),
    workerId: z.string().optional(),
    workerName: z.string().optional(),
    workerOutput: z
      .union([
        z.string().min(1),
        z.object({
          rawOutput: z.string().optional(),
          workerId: z.string().optional(),
        }),
      ])
      .optional(),
    telegramUserId: z.union([z.number(), z.string()]).optional(),
    telegramChatId: z.union([z.number(), z.string()]).optional(),
    options: z
      .object({
        evidenceSources: z.array(z.string()).optional(),
        maxAttempts: z.number().int().positive().optional(),
        webhookUrl: z.string().url("Invalid webhook URL").optional(),
        deterministicOverride: z
          .object({
            actualPaymentAmount: z.number().optional(),
            actualPaymentToken: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const task =
      data.task ||
      (typeof data.taskSpec === "string"
        ? data.taskSpec
        : data.taskSpec?.description || data.taskSpec?.title);

    if (!task || !task.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["task"],
        message: "Field 'task' (or 'taskSpec.description') is required and cannot be blank.",
      });
    }

    const workerOutput =
      data.worker?.output ||
      (typeof data.workerOutput === "string"
        ? data.workerOutput
        : data.workerOutput?.rawOutput);

    if (!workerOutput || !workerOutput.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["worker", "output"],
        message: "Field 'worker.output' (or 'workerOutput.rawOutput') is required and cannot be blank.",
      });
    }
  });

export type VerificationRequestInput = z.infer<typeof VerificationRequestSchema>;

/**
 * Normalized helper function to extract clean { task, worker: { output } } from validated input.
 */
export function normalizeVerificationRequest(data: VerificationRequestInput) {
  const task =
    data.task ||
    (typeof data.taskSpec === "string"
      ? data.taskSpec
      : data.taskSpec?.description || data.taskSpec?.title || "");

  const output =
    data.worker?.output ||
    (typeof data.workerOutput === "string"
      ? data.workerOutput
      : data.workerOutput?.rawOutput || "");

  const workerId =
    data.worker?.workerId ||
    data.worker?.id ||
    data.workerId ||
    (typeof data.workerOutput === "object" ? data.workerOutput?.workerId : undefined) ||
    "worker-agent";

  const workerName =
    data.worker?.name ||
    data.workerName ||
    "Agent Worker";

  return {
    task: task.trim(),
    worker: {
      id: workerId,
      name: workerName,
      output: output.trim(),
    },
    telegramUserId: data.telegramUserId,
    telegramChatId: data.telegramChatId,
    options: data.options,
  };
}

/**
 * Zod schema for POST /v1/verify/:id/correct
 */
export const CorrectRequestSchema = z.object({
  instruction: z.string().optional(),
  note: z.string().optional(),
  telegramUserId: z.union([z.number(), z.string()]).optional(),
});

export type CorrectRequestInput = z.infer<typeof CorrectRequestSchema>;

/**
 * Zod schema for POST /v1/verify/:id/resubmit
 */
export const ResubmitRequestSchema = z.object({
  correctedWorkerOutput: z.string().optional(),
  workerOutput: z.string().optional(),
  supplementalTxHash: z.string().optional(),
  txHash: z.string().optional(),
  telegramUserId: z.union([z.number(), z.string()]).optional(),
});

export type ResubmitRequestInput = z.infer<typeof ResubmitRequestSchema>;

/**
 * Zod schema for Telegram Update ingress
 */
export const TelegramUserSchema = z.object({
  id: z.number(),
  is_bot: z.boolean().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
});

export const TelegramChatSchema = z.object({
  id: z.number(),
  type: z.string(),
  title: z.string().optional(),
  username: z.string().optional(),
});

export const TelegramMessageSchema = z.object({
  message_id: z.number(),
  from: TelegramUserSchema.optional(),
  chat: TelegramChatSchema,
  date: z.number(),
  text: z.string().optional(),
});

export const TelegramCallbackQuerySchema = z.object({
  id: z.string(),
  from: TelegramUserSchema,
  message: TelegramMessageSchema.optional(),
  data: z.string().optional(),
});

export const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: TelegramMessageSchema.optional(),
  callback_query: TelegramCallbackQuerySchema.optional(),
});

export type TelegramUpdateInput = z.infer<typeof TelegramUpdateSchema>;
