# @dwidge/transcribe

## Audio Transcription and Notes CLI

This script automates the process of transcribing audio files and generating meeting notes using either OpenAI's Whisper API or Groq's transcription API. It takes `.ogg` audio files from an input directory, transcribes them, and then uses OpenAI's GPT-4o-mini model to generate structured meeting notes, decisions, and GitHub issues based on the transcription.

## Features

- **Transcription:** Supports audio transcription using:
  - OpenAI's Whisper API (`whisper-1` model)
  - Groq's transcription API (`distil-whisper-large-v3-en` model)
- **Notes Generation:** Generates structured meeting notes in Markdown format, including:
  - Summary
  - Minutes (detailed points and subpoints)
  - Decisions (detailed points and subpoints)
  - GitHub Issues (title, description, assignees, labels)
- **Date Handling:** Attempts to parse dates from filenames to include in the notes.
- **File Management:** Organizes output files into directories based on the base filename.
- **Command-line Arguments:** Configurable provider (OpenAI or Groq) and API keys via command-line arguments.

## Prerequisites

Before running this script, you need to have the following:

1.  **Node.js and npm:** Ensure you have Node.js and npm (Node Package Manager) installed on your system. You can download them from [nodejs.org](https://nodejs.org/).

2.  **API Keys:**

    - **OpenAI API Key:** You need an API key from OpenAI to use either the Whisper API for transcription or the GPT-4o-mini model for notes generation. You can obtain an API key from [platform.openai.com](https://platform.openai.com/).
    - **Groq API Key:** If you want to use Groq for transcription, you need an API key from Groq. You can obtain an API key from [console.groq.com](https://console.groq.com/).

3.  **ffmpeg (optional but recommended for audio conversion):** If your audio files are not already in `.ogg` format, you might need to convert them. `ffmpeg` is a powerful tool for audio and video conversion. You can install it using your system's package manager (e.g., `apt-get install ffmpeg` on Debian/Ubuntu, `brew install ffmpeg` on macOS).

## Configuration

### API Keys

You can configure API keys in two ways:

1.  **Environment Variables:** Set `OPENAI_API_KEY` and `GROQ_API_KEY` environment variables with your respective API keys. This is generally the recommended and more secure method.

    ```bash
    export OPENAI_API_KEY="your_openai_api_key"
    export GROQ_API_KEY="your_groq_api_key"
    ```

2.  **Command-line Arguments:** You can pass API keys directly as command-line arguments. This will override environment variables if both are set.

### Provider Selection

You can choose between `openai` and `groq` as the transcription provider using the `--provider` command-line argument. The default provider is `groq`.

## Usage

1.  **Prepare Audio Files:** Place your `.ogg` audio files in the `./tmp` directory. If the `./tmp` directory doesn't exist, create it.

2.  **Run the script:** Execute the script from your terminal using Node.js.

    ```bash
    node index.js [options]
    ```

    **Options:**

    - `--openai-api-key <key>`: Set OpenAI API key. Overrides `OPENAI_API_KEY` environment variable.
    - `--groq-api-key <key>`: Set Groq API key. Overrides `GROQ_API_KEY` environment variable.
    - `--provider <openai|groq>`: Specify the transcription provider. Defaults to `groq`.
    - `--help`: Show help message.

    **Examples:**

    - **Using Groq provider (default) with API key from environment variable:**

      ```bash
      node index.js
      ```

    - **Using OpenAI provider with API key passed as command-line argument:**

      ```bash
      node index.js --provider openai --openai-api-key your_openai_api_key
      ```

    - **Using Groq provider with API key passed as command-line argument:**

      ```bash
      node index.js --provider groq --groq-api-key your_groq_api_key
      ```

    - **Showing help message:**
      ```bash
      node index.js --help
      ```

3.  **Output:** The script will process each `.ogg` file in the `./tmp` directory. For each file (e.g., `audio_recording.ogg`), it will:
    - Create a directory `./data/audio_recording` if it doesn't exist.
    - Create a transcript file `./data/audio_recording/transcript.txt` containing the transcription.
    - Create notes in Markdown format in `./data/audio_recording/notes.md` based on the transcription.

## Structure

The script uses the following directory structure:

```
.
├── data/                  # Output directory for transcripts and notes
│   ├── <baseName>/       # Directory for each processed audio file (e.g., meeting_2024-07-26)
│   │   ├── transcript.txt # Transcription of the audio
│   │   └── notes.md       # Meeting notes in Markdown format
├── tmp/                   # Input directory for .ogg audio files
│   ├── <baseName>.ogg    # Audio files to be processed (e.g., meeting_2024-07-26.ogg)
├── README.md              # This README file
└── package.json           # npm package configuration
```

## Debug

The script includes a `debug` variable (set to `0` by default). Setting `debug` to `1` will enable console logging of intermediate steps in the `processAudioFile` function, which can be helpful for debugging. You can modify this variable directly in the `index.js` file:

```javascript
const debug = 1; // Enable debug logging
// const debug = 0; // Disable debug logging
```

## License

Copyright DWJ 2025.  
Distributed under the Boost Software License, Version 1.0.  
https://www.boost.org/LICENSE_1_0.txt
