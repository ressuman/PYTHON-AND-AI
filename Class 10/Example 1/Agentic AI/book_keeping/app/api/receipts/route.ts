import { NextRequest } from "next/server";
import { Prisma } from "@/lib/generated";
import { prisma } from "@/lib/db";
import { ok, created, badRequest, serverError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { parseReceipt } from "@/lib/agent";

export async function GET() {
  try {
    const receipts = await prisma.receipt.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { expenses: true } } },
    });
    return ok(receipts);
  } catch (err) {
    console.error("GET /api/receipts failed:", err);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return badRequest("Too many requests", undefined);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return badRequest("No file provided");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
      return badRequest(`File type not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(", ")}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      return badRequest(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit`);
    }

    if (file.size === 0) {
      return badRequest("File is empty");
    }

    // Save receipt record
    const receipt = await prisma.receipt.create({
      data: {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        storagePath: `uploads/${Date.now()}-${file.name}`,
        status: "PENDING",
      },
    });

    // Attempt OCR / agent parsing in background
    const buffer = Buffer.from(await file.arrayBuffer());

    const ocrText = `Receipt: ${file.name}
Size: ${file.size} bytes
Content: [binary data — OCR not available in current env]
Filename hints: ${file.name}`;

    parseReceipt(ocrText)
      .then(async (parsed) => {
        await prisma.receipt.update({
          where: { id: receipt.id },
          data: {
            status: "PARSED",
            parsedData: parsed as Prisma.InputJsonValue,
          },
        });
      })
      .catch(async (err) => {
        console.error("Receipt parse failed for", receipt.id, err);
        await prisma.receipt.update({
          where: { id: receipt.id },
          data: { status: "FAILED", errorMsg: err instanceof Error ? err.message : "Parse failed" },
        });
      });

    return created({ id: receipt.id, status: "PENDING" });
  } catch (err) {
    console.error("POST /api/receipts failed:", err);
    return serverError();
  }
}
