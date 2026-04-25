import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { sendBulkEmailTask, SendBulkEmailPayload } from "@/trigger/send-bulk-email";
import {
  getOrganizationByAccessCode,
  getEmailInfoByOrgId,
  updateEmailsSent,
} from "@/lib/supabase";

interface Contact {
  name: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const accessCode = request.cookies.get("access-code");

    if (!accessCode) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const organization = await getOrganizationByAccessCode(accessCode.value);

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const emailInfo = await getEmailInfoByOrgId(organization.id);

    if (!emailInfo) {
      return NextResponse.json(
        { success: false, message: "Email configuration not found" },
        { status: 404 },
      );
    }

    // Reset daily counter if we've crossed midnight since last send
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastEmailDate = organization.last_email_sent
      ? new Date(organization.last_email_sent + "T00:00:00")
      : null;
    if (lastEmailDate && lastEmailDate.getTime() < today.getTime()) {
      await updateEmailsSent(organization.id, 0);
      organization.emails_sent = 0;
    }

    const {
      contacts,
      message,
      subject,
      htmlContent,
      isHtmlEmail = false,
    } = (await request.json()) as {
      contacts: Contact[];
      message: string;
      subject: string;
      htmlContent?: string;
      isHtmlEmail?: boolean;
    };

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid contacts provided" },
        { status: 400 },
      );
    }

    const validContacts = contacts.filter(
      (c) =>
        c.email &&
        typeof c.email === "string" &&
        c.email.includes("@") &&
        c.email.includes("."),
    );

    if (validContacts.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid email addresses found" },
        { status: 400 },
      );
    }

    const emailsSent = organization.emails_sent || 0;
    const dailyLimit = organization.email_remaining || 500;
    if (emailsSent + validContacts.length > dailyLimit) {
      return NextResponse.json(
        {
          success: false,
          message: `Daily email limit would be exceeded. Remaining: ${dailyLimit - emailsSent}`,
        },
        { status: 429 },
      );
    }

    const payload: SendBulkEmailPayload = {
      orgId: organization.id,
      contacts: validContacts,
      subject,
      message,
      htmlContent,
      isHtmlEmail,
      smtpUser: emailInfo.email_user_name,
      smtpPass: emailInfo.email_passcode,
      baselineEmailsSent: emailsSent,
    };

    const handle = await tasks.trigger<typeof sendBulkEmailTask>(
      "send-bulk-email",
      payload,
    );

    return NextResponse.json({
      success: true,
      runId: handle.id,
      publicAccessToken: handle.publicAccessToken,
      total: validContacts.length,
    });
  } catch (error) {
    console.error("Error triggering bulk email task:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to start email send",
      },
      { status: 500 },
    );
  }
}
