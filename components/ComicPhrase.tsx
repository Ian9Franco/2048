"use client"

import { motion } from "framer-motion"

export default function ComicPhrase({ text }: { text: string }) {
  return (
    <motion.div
      key={text}
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="absolute top-[-80px] left-1/2 -translate-x-1/2 z-50
                 text-4xl md:text-5xl text-white font-comic
                 bg-comic-red px-6 py-3 rounded-xl 
                 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                 whitespace-nowrap"
      style={{
        textShadow: "4px 4px 0px rgba(0,0,0,1)",
      }}
    >
      {text}
    </motion.div>
  )
}
