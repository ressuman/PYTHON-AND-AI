import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getSession } from "@/lib/auth/session"

const f = createUploadthing()

export const ourFileRouter = {
  legalDocumentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession()
      if (!session) throw new UploadThingError("Unauthorized")
      return { userId: session.userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        userId: metadata.userId,
        fileUrl: file.url,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
