import { z } from "zod";
import { handler, HttpError, ok, parseBody } from "@/lib/api";
import { issueOtp, OtpError } from "@/lib/otp";

const schema = z.discriminatedUnion("channel", [
  z.object({ channel: z.literal("phone"), target: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number") }),
  z.object({ channel: z.literal("email"), target: z.string().trim().toLowerCase().email("Enter a valid email address") }),
]);

export const POST = handler(async (req: Request) => {
  const { channel, target } = await parseBody(req, schema);
  try {
    const devCode = await issueOtp(target, channel);
    return ok({ sent: true, devCode });
  } catch (e) {
    if (e instanceof OtpError) throw new HttpError(429, e.message);
    throw e;
  }
});
