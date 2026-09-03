#!/usr/bin/env node
/**
 * Live smoke test for the account-owned JobPick CV service.
 *
 * Usage:
 *   JOBPICK_SESSION_TOKEN='...' node tests/cv-service-smoke-test.mjs
 *
 * The token is the session handoff stored in sessionStorage after Google OAuth.
 * No real CV data is used; the fixture below is intentionally synthetic.
 */

const API_BASE = (process.env.JOBPICK_CV_API_BASE || "https://jobpickcv-rej9ajct.manus.space").replace(/\/$/, "");
const token = process.env.JOBPICK_SESSION_TOKEN;
if (!token) {
  console.error("Missing JOBPICK_SESSION_TOKEN. Complete Google sign-in in the browser and copy the session handoff for this test.");
  process.exit(2);
}

const fixture = [
  "Alex Morgan",
  "alex.morgan@example.test | +971 50 000 0000 | Dubai, UAE",
  "",
  "PROFESSIONAL SUMMARY",
  "Operations coordinator with experience supporting schedules, vendor communication, and process documentation.",
  "",
  "WORK EXPERIENCE",
  "Operations Coordinator — Example Services — 2022–2024",
  "- Coordinated weekly schedules for a small service team.",
  "- Maintained process documentation and tracked open actions.",
  "",
  "SKILLS",
  "Scheduling, documentation, vendor communication, Microsoft Excel",
  "",
  "EDUCATION",
  "BA Business Administration — Example University — 2021",
].join("\n");

async function trpc(path, input, method = "POST") {
  const response = await fetch(`${API_BASE}/api/trpc/cv.${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-jobpick-session": token,
      origin: "https://jobpick20.com",
    },
    body: method === "GET" ? undefined : JSON.stringify({ json: input }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} failed (${response.status}): ${payload?.error?.json?.message || payload?.error?.message || JSON.stringify(payload)}`);
  }
  return payload?.result?.data?.json ?? payload?.result?.data;
}

let documentId;
try {
  const upload = await trpc("upload", {
    fileName: "synthetic-alex-morgan.txt",
    mimeType: "text/plain",
    contentBase64: Buffer.from(fixture, "utf8").toString("base64"),
  });
  documentId = upload.id;
  if (!Number.isInteger(documentId)) throw new Error("Upload returned no document id");
  console.log(`PASS upload: document ${documentId} (${upload.status})`);

  const listed = await trpc("list", {}, "GET");
  if (!listed.some((row) => row.id === documentId)) throw new Error("Uploaded document was not returned by the private list endpoint");
  console.log("PASS list: uploaded document is visible to the authenticated owner");

  const processed = await trpc("process", {
    documentId,
    targetRole: "Operations Coordinator",
    employerName: "Example Services",
    jobDescription: "Coordinate schedules, maintain documentation, communicate with vendors, and support accurate weekly reporting.",
    instructions: "Preserve every fact from the source. Do not invent metrics, employers, dates, qualifications, or achievements. Return an application-ready CV and keep uncertain details out.",
    template: "modern",
  });
  if (!processed.generatedText || !processed.generatedText.includes("Alex Morgan")) throw new Error("Processing returned no truthful candidate identity");
  console.log(`PASS process: generated text returned; readyToApply=${processed.readyToApply}`);

  const download = await trpc("download", { documentId, format: "pdf", template: "modern" });
  if (!download.url || !download.fileName) throw new Error("Download endpoint returned no signed URL");
  const pdf = await fetch(download.url);
  const pdfBytes = Buffer.from(await pdf.arrayBuffer());
  if (!pdf.ok || pdfBytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error(`Signed download was not a PDF (${pdf.status})`);
  console.log(`PASS download: ${download.fileName}; ${pdfBytes.length} bytes; PDF signature verified`);
} finally {
  if (documentId) {
    try {
      await trpc("remove", { documentId });
      console.log("PASS cleanup: synthetic document removed");
    } catch (error) {
      console.error(`WARN cleanup failed for document ${documentId}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

console.log(`Smoke test complete against ${API_BASE}`);
