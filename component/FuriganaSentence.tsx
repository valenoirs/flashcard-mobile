import React from "react"
import { View, Text, StyleSheet } from "react-native"

type FuriganaSentenceProps = {
  htmlString: string
}

// 1. Discriminated Union so TypeScript knows exactly what properties exist
type FuriganaItem =
  | { type: "text"; char: string; isBold: boolean; id: string }
  | { type: "ruby"; kanji: string; kana: string; id: string }

export default function FuriganaSentence({
  htmlString,
}: FuriganaSentenceProps) {
  if (!htmlString) return <Text style={styles.loadingText}>Loading...</Text>

  // Clean out any <p> wrappers if they exist
  const cleanString = htmlString.replace(/<\/?p[^>]*>/g, "")

  const regex =
    /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>|<strong>(.*?)<\/strong>|(<\/?\w+[^>]*>)|([^<]+)/g

  const parsed: FuriganaItem[] = []
  let match
  let blockIndex = 0

  // 3. Sweep through the string and categorize each chunk
  while ((match = regex.exec(cleanString)) !== null) {
    if (match[1] !== undefined) {
      // Catch <ruby>
      parsed.push({
        type: "ruby",
        kanji: match[1],
        kana: match[2],
        id: `ruby-${blockIndex++}`,
      })
    } else if (match[3] !== undefined) {
      // Catch <strong> and split into individual bold characters
      match[3].split("").forEach((char, i) => {
        parsed.push({
          type: "text",
          char: char,
          isBold: true,
          id: `strong-${blockIndex}-${i}`,
        })
      })
      blockIndex++
    } else if (match[5] !== undefined) {
      // Catch normal plain text and split into individual characters
      match[5].split("").forEach((char, i) => {
        parsed.push({
          type: "text",
          char: char,
          isBold: false,
          id: `text-${blockIndex}-${i}`,
        })
      })
      blockIndex++
    }
    // match[4] silently swallows any other stray HTML tags so they don't print on screen
  }

  return (
    <View style={styles.sentenceWrapper}>
      {parsed.map((item) => (
        <View key={item.id} style={styles.charColumn}>
          {/* Furigana Slot: Renders kana, or an empty space for normal chars to lock the baseline */}
          <Text style={styles.furiganaText}>
            {item.type === "ruby" ? item.kana : " "}
          </Text>

          {/* Base Slot: Renders kanji, or the normal character */}
          <Text
            style={[
              styles.baseText,
              item.type === "text" && item.isBold && styles.boldText,
            ]}
          >
            {item.type === "ruby" ? item.kanji : item.char}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  loadingText: {
    fontSize: 26,
    textAlign: "center",
  },
  sentenceWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Change to "flex-start" if you want left-aligned text
    paddingHorizontal: 10,
    marginVertical: 15,
  },
  charColumn: {
    alignItems: "center",
    justifyContent: "flex-end", // Pushes all base characters securely to the bottom line
    marginHorizontal: 1, // Tiny breather room between characters
  },
  furiganaText: {
    fontSize: 14,
    minHeight: 16, // Forces empty spaces to take up the exact height of kana to prevent baseline jumping
    marginBottom: 2,
    color: "#555", // Slightly dims the furigana for better readability
  },
  baseText: {
    fontSize: 25, // Your preferred cardText size
    lineHeight: 36,
    color: "#000",
  },
  boldText: {
    fontWeight: "bold",
    color: "red",
  },
})
