"use client"

import { motion } from "framer-motion"

export default function ComicFX({ type }: { type: "merge" | "slide" }) {
  const colors = {
    merge: "bg-comic-yellow",
    slide: "bg-comic-blue",
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1.5, opacity: [0, 0.6, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`absolute inset-0 ${colors[type]} rounded-lg pointer-events-none`}
    />
  )
}
