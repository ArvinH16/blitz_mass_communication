import { logger, metadata, task, wait } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

interface Contact {
  name: string;
  email: string;
}

export interface SendBulkEmailPayload {
  orgId: number;
  contacts: Contact[];
  subject: string;
  message: string;
  htmlContent?: string;
  isHtmlEmail: boolean;
  smtpUser: string;
  smtpPass: string;
  baselineEmailsSent: number;
}

export interface BulkEmailProgress {
  current: number;
  total: number;
  sent: number;
  failed: number;
  currentEmail: string;
  currentBatch: number;
  totalBatches: number;
  batchPauseRemaining?: number;
  status: "sending" | "paused" | "completed" | "error";
  message?: string;
}

const PER_EMAIL_MIN_MS = 3000;
const PER_EMAIL_MAX_MS = 7000;
const BATCH_SIZE = 50;
const BATCH_PAUSE_MIN_S = 120;
const BATCH_PAUSE_MAX_S = 300;

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setProgress(progress: BulkEmailProgress) {
  metadata.set("progress", { ...progress });
}

export const sendBulkEmailTask = task({
  id: "send-bulk-email",
  maxDuration: 60 * 60 * 6,
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: SendBulkEmailPayload) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase env vars missing in Trigger task");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const validContacts = payload.contacts.filter(
      (c) =>
        c.email &&
        typeof c.email === "string" &&
        c.email.includes("@") &&
        c.email.includes("."),
    );

    if (validContacts.length === 0) {
      throw new Error("No valid email addresses to send");
    }

    const totalBatches = Math.ceil(validContacts.length / BATCH_SIZE);
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    setProgress({
      current: 0,
      total: validContacts.length,
      sent: 0,
      failed: 0,
      currentEmail: "",
      currentBatch: 0,
      totalBatches,
      status: "sending",
      message: "Connecting to email server...",
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: payload.smtpUser, pass: payload.smtpPass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 75000,
    });

    try {
      await transporter.verify();
      logger.log("SMTP connection verified");
    } catch (err) {
      transporter.close();
      const msg = err instanceof Error ? err.message : "unknown";
      throw new Error(`Email server connection failed: ${msg}`);
    }

    try {
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, validContacts.length);
        const batchContacts = validContacts.slice(batchStart, batchEnd);

        for (let i = 0; i < batchContacts.length; i++) {
          const contact = batchContacts[i];
          const globalIndex = batchStart + i;

          setProgress({
            current: globalIndex + 1,
            total: validContacts.length,
            sent,
            failed,
            currentEmail: contact.email,
            currentBatch: batchIndex + 1,
            totalBatches,
            status: "sending",
            message: `Sending email ${globalIndex + 1} of ${validContacts.length} to ${contact.email}`,
          });

          const personalizedMessage = payload.message.replace(
            /{name}/gi,
            contact.name || "",
          );
          const personalizedSubject = payload.subject.replace(
            /{name}/gi,
            contact.name || "",
          );
          const personalizedHtml =
            payload.isHtmlEmail && payload.htmlContent
              ? payload.htmlContent.replace(/{name}/gi, contact.name || "")
              : undefined;

          const emailOptions: {
            from: string;
            to: string;
            subject: string;
            html?: string;
            text?: string;
          } = {
            from: payload.smtpUser,
            to: contact.email,
            subject: personalizedSubject,
          };

          if (personalizedHtml) {
            emailOptions.html = personalizedHtml;
            emailOptions.text = personalizedMessage;
          } else {
            emailOptions.text = personalizedMessage;
          }

          try {
            await transporter.sendMail(emailOptions);

            try {
              await supabaseAdmin.from("emails_sent").insert({
                content: personalizedHtml ?? personalizedMessage,
                subject: personalizedSubject,
                org_id: payload.orgId,
                receiver: contact.email,
              });
            } catch (dbError) {
              logger.error("Failed to record email in database", {
                receiver: contact.email,
                dbError,
              });
            }

            sent++;
            logger.log(`Sent email to ${contact.email}`);
          } catch (error) {
            failed++;
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            logger.error(`Failed to send email to ${contact.email}`, {
              errorMessage,
            });
            errors.push(
              `Failed to send email to ${contact.email}: ${errorMessage}`,
            );
          }

          if (i < batchContacts.length - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, randomBetween(PER_EMAIL_MIN_MS, PER_EMAIL_MAX_MS)),
            );
          }
        }

        if (batchIndex < totalBatches - 1) {
          const pauseSeconds = randomBetween(BATCH_PAUSE_MIN_S, BATCH_PAUSE_MAX_S);

          setProgress({
            current: batchEnd,
            total: validContacts.length,
            sent,
            failed,
            currentEmail: "",
            currentBatch: batchIndex + 1,
            totalBatches,
            batchPauseRemaining: pauseSeconds,
            status: "paused",
            message: `Batch ${batchIndex + 1} complete. Pausing for ${Math.ceil(pauseSeconds / 60)} minutes before next batch...`,
          });

          await wait.for({ seconds: pauseSeconds });
        }
      }
    } finally {
      transporter.close();
    }

    if (sent > 0) {
      const today = new Date().toISOString().split("T")[0];
      const { error: updateError } = await supabaseAdmin
        .from("organizations")
        .update({
          emails_sent: payload.baselineEmailsSent + sent,
          last_email_sent: today,
        })
        .eq("id", payload.orgId);

      if (updateError) {
        logger.error("Failed to update emails_sent count", {
          error: updateError.message,
        });
      }
    }

    setProgress({
      current: validContacts.length,
      total: validContacts.length,
      sent,
      failed,
      currentEmail: "",
      currentBatch: totalBatches,
      totalBatches,
      status: "completed",
      message: `Email sending completed! Sent: ${sent}, Failed: ${failed}`,
    });

    return { sent, failed, errors };
  },
});
