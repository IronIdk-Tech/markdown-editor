// Get elements
const editor = document.getElementById("editor")
const preview = document.getElementById("preview")
const charCount = document.getElementById("char-count")
const wordCount = document.getElementById("word-count")

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
})

// Update preview in real-time
function updatePreview() {
  const markdown = editor.value
  preview.innerHTML = marked.parse(markdown)

  // Highlight code blocks
  document.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block)
  })

  // Update character and word count
  charCount.textContent = `${markdown.length} characters`
  const words = markdown
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  wordCount.textContent = `${words.length} words`
}

editor.addEventListener("input", updatePreview)

// Initialize with sample text
const sampleText = `# Welcome to the Markdown Editor

## Getting Started

This is a **minimalist** markdown editor with *real-time* preview.

### Features:

- Clean, distraction-free interface
- Real-time preview
- Syntax highlighting
- Dark mode support
- Local storage for drafts

## Code Example

\`\`\`javascript
// A simple function
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Markdown"));
\`\`\`

> Markdown is a lightweight markup language with plain-text formatting syntax.

![Markdown Logo](https://markdown-here.com/img/icon256.png)

Enjoy writing!
`

editor.value = localStorage.getItem("markdown-draft") || sampleText
updatePreview()

// Save content on input
editor.addEventListener("input", () => {
  localStorage.setItem("markdown-draft", editor.value)
})

// Save to file
function saveToFile() {
  const text = editor.value
  const blob = new Blob([text], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "document.md"
  a.click()

  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

// Load from file
function loadFromFile(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    editor.value = e.target.result
    updatePreview()
    localStorage.setItem("markdown-draft", editor.value)
  }
  reader.readAsText(file)
}

// Insert text at cursor position
function insertText(text) {
  const start = editor.selectionStart
  const end = editor.selectionEnd
  const value = editor.value

  // If text is selected and we're inserting formatting markers
  if (start !== end && (text === "**" || text === "*" || text === "`" || text === "~~")) {
    editor.value = value.substring(0, start) + text + value.substring(start, end) + text + value.substring(end)
    editor.selectionStart = start + text.length
    editor.selectionEnd = end + text.length
  }
  // If we're inserting a code block and text is selected
  else if (start !== end && text === "```\n\n```") {
    editor.value = value.substring(0, start) + "```\n" + value.substring(start, end) + "\n```" + value.substring(end)
    editor.selectionStart = start + 4
    editor.selectionEnd = end + 4
  }
  // Default insertion
  else {
    editor.value = value.substring(0, start) + text + value.substring(end)
    editor.selectionStart = editor.selectionEnd = start + text.length
  }

  editor.focus()
  // Trigger input event to update preview
  const event = new Event("input", { bubbles: true })
  editor.dispatchEvent(event)
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode")
  localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode"))
}

// Load dark mode preference
window.addEventListener("load", () => {
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark-mode")
  }
})

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Only process if Ctrl/Cmd key is pressed
  if (!(e.ctrlKey || e.metaKey)) return

  switch (e.key.toLowerCase()) {
    case "b": // Bold
      e.preventDefault()
      insertText("**")
      break
    case "i": // Italic
      e.preventDefault()
      insertText("*")
      break
    case "`": // Code
      e.preventDefault()
      insertText("`")
      break
    case "s": // Save
      e.preventDefault()
      saveToFile()
      break
  }
})

