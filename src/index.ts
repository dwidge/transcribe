import * as fs from "fs";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { parseDateStringSafe } from "./parseDateString.js";

const debug = 0;

const fsp = fs.promises;
const fileExists = (p: string) =>
  fsp
    .access(p)
    .then((r) => true)
    .catch((e) => false);

async function transcribeAudio(
  provider: "openai" | "groq",
  apiKey: string | undefined,
  fileName: string
): Promise<string | null> {
  if (!apiKey)
    throw new Error(`API key for provider '${provider}' is missing.`);

  if (provider === "openai") {
    const openai = new OpenAI({ apiKey });
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(fileName),
      model: "whisper-1",
    });
    return transcription.text || null;
  } else if (provider === "groq") {
    const groq = new Groq({ apiKey });
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(fileName),
      model: "distil-whisper-large-v3-en",
    });
    return transcription.text || null;
  } else throw new Error(`Unsupported provider: ${provider}`);
}

async function processAudioFile(
  baseName: string,
  provider: "openai" | "groq",
  apiKey: string | undefined
) {
  const baseDir = `./data/${baseName}`;
  const fileName = `./tmp/${baseName}.ogg`;
  const transcriptFilePath = `${baseDir}/transcript.txt`;
  const notesFilePath = `${baseDir}/notes.md`;

  const fileStats = (await fileExists(fileName))
    ? await fsp.stat(fileName)
    : null;
  const fileModifiedDate = fileStats?.mtime;

  let transcript = (await fileExists(transcriptFilePath))
    ? await fsp.readFile(transcriptFilePath, "utf-8")
    : null;
  const transcriptStats = (await fileExists(transcriptFilePath))
    ? await fsp.stat(transcriptFilePath)
    : null;
  const transcriptModifiedDate = transcriptStats?.mtime;
  const baseNameDate = parseDateStringSafe(baseName);

  let notes = (await fileExists(notesFilePath))
    ? await fsp.readFile(notesFilePath, "utf-8")
    : null;

  if (debug)
    console.log("processAudioFile1", {
      fileName,
      fileStats,
      transcript: !!transcript,
      notes: !!notes,
    });

  if (fileStats && !transcript) {
    await fsp.mkdir(baseDir, { recursive: true });
    console.log(`Creating transcription using ${provider}: ${baseName}`);

    transcript = await transcribeAudio(provider, apiKey, fileName);

    if (!transcript) throw new Error("processAudioFileE1: Transcript failed");
    await fsp.writeFile(transcriptFilePath, transcript);
  }

  if (transcript && !notes) {
    await fsp.mkdir(baseDir, { recursive: true });
    console.log("Creating notes: " + baseName);
    const openaiForNotes = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const cleanedNotes = await openaiForNotes.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: notesPrompt(
            (
              fileModifiedDate ??
              baseNameDate ??
              transcriptModifiedDate
            )?.toISOString() ?? "unknown"
          ),
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    });

    notes = cleanedNotes.choices[0].message.content?.toString() || null;
    if (!notes) throw new Error("processAudioFileE2: Notes failed");
    await fsp.writeFile(notesFilePath, notes);
  }

  return { transcript, notes };
}

async function main() {
  const inputDir = "./tmp";
  const outputDir = "./data";

  // Parse command line arguments
  const args = process.argv.slice(2);
  let openaiApiKey: string | undefined = process.env.OPENAI_API_KEY;
  let groqApiKey: string | undefined = process.env.GROQ_API_KEY;
  let provider: "openai" | "groq" = "groq"; // Default to groq

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--openai-api-key") {
      openaiApiKey = args[i + 1];
      i++;
    } else if (arg === "--groq-api-key") {
      groqApiKey = args[i + 1];
      i++;
    } else if (arg === "--provider") {
      const providerArg = args[i + 1]?.toLowerCase();
      if (providerArg === "openai" || providerArg === "groq") {
        provider = providerArg;
      } else {
        console.warn(`Unknown provider: ${providerArg}. Defaulting to groq.`);
      }
      i++;
    } else if (arg === "--help") {
      console.log(`
Usage: node script.js [options]

Options:
  --openai-api-key <key>   Set OpenAI API key. Overrides OPENAI_API_KEY env variable.
  --groq-api-key <key>      Set Groq API key. Overrides GROQ_API_KEY env variable.
  --provider <openai|groq>  Specify the transcription provider (default: groq).
  --help                    Show this help message.
`);
      return;
    }
  }

  if (provider === "openai" && !openaiApiKey) {
    console.error(
      "Error: OpenAI provider selected but OpenAI API key is missing."
    );
    return;
  }
  if (provider === "groq" && !groqApiKey) {
    console.error("Error: Groq provider selected but Groq API key is missing.");
    return;
  }

  const apiKeyToUse = provider === "openai" ? openaiApiKey : groqApiKey;

  // Read all .ogg files from the input directory
  const files = await fsp.readdir(inputDir);
  const oggFiles = files.filter((file) => file.endsWith(".ogg"));

  // Collect names from the tmp directory
  const inputNames = oggFiles.map((file) => file.split(".")[0]);

  // Collect names from the output directory
  const outputDirs = await fsp.readdir(outputDir);
  const outputNames = outputDirs.filter((dir) =>
    fs.statSync(`${outputDir}/${dir}`).isDirectory()
  );

  // Combine names from both directories
  const allNames = [...inputNames, ...outputNames];

  // Process each audio file
  for (const name of allNames) {
    await processAudioFile(name, provider, apiKeyToUse);
  }
}

main();

const notesPrompt = (date: string) => `
meeting date: ${date}

give a very detailed report with minutes, decisions, and also write any github issues to be created. use this format and do not add extra fields to the github issues, use this exact format:

# Summary

[summary]

- Date: [yyyy/mm/dd hh:mm]
- Team: Name1, Name2, ... [or None]
- Visitors: Name1, Name2, ... [or None]

# Minutes

## [point 1]

[description]

- [subpoint]
- [subpoint]

## [point 2]

[description]

- [subpoint]
- [subpoint]
- [subpoint]

## [point 3...]

# Decisions

## [point 1]

[description]

- [subpoint]
- [subpoint]

## [point 2]

[description]

- [subpoint]
- [subpoint]
- [subpoint]

## [point 3...]

# GitHub Issues

## [title]

[description and detailed explanation]

- Assignees: Name1, Name2, ... [or None]
- Labels: label1, label2, ...

## [title]

[description and detailed explanation]

- Assignees: Name1, Name2, ... [or None]
- Labels: label1, label2, ...

## [title...]
`;
