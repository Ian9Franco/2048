"use client"

import type React from "react"
import ComicPhrase from "@/components/ComicPhrase"
import { comicPhrases } from "@/utils/phrases"
import { getHeroLevel } from "@/utils/hero-levels"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

const GRID_SIZE = 4
const CELL_GAP = 0.4 // in rem

type Tile = {
  value: number
  id: string
  mergedFrom?: Tile[]
  justMerged?: boolean
  isNew?: boolean
  row: number
  col: number
}

export default function Game2048() {
  const [cellSize, setCellSize] = useState(4.5)
  const [board, setBoard] = useState<Tile[]>([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState("")
  const [maxTileValue, setMaxTileValue] = useState(2)
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const lastPhraseScoreRef = useRef(0)

  // --- Responsive cell size ---
  useEffect(() => {
    const updateCellSize = () => {
      setCellSize(window.innerWidth < 640 ? 3.8 : 4.5)
    }
    updateCellSize()
    window.addEventListener("resize", updateCellSize)
    return () => window.removeEventListener("resize", updateCellSize)
  }, [])

  // --- Play sounds ---
  const playSound = (type: "move" | "merge" | "gameover") => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      switch (type) {
        case "move":
          oscillator.frequency.value = 200
          gainNode.gain.value = 0.1
          break
        case "merge":
          oscillator.frequency.value = 220
          gainNode.gain.value = 0.12
          break
        case "gameover":
          oscillator.frequency.value = 100
          gainNode.gain.value = 0.2
          break
      }

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch {}
  }

  // --- Game initialization ---
  useEffect(() => {
    initializeGame()
    const storedBestScore = localStorage.getItem("bestScore")
    if (storedBestScore) setBestScore(Number.parseInt(storedBestScore))
    if (gameContainerRef.current) gameContainerRef.current.focus()
  }, [])

  // --- Comic phrases ---
  useEffect(() => {
    const eligiblePhrases = comicPhrases.filter(
      (p) => score >= p.score && p.score > lastPhraseScoreRef.current
    )
    const phrase = eligiblePhrases[eligiblePhrases.length - 1]
    if (phrase) {
      setCurrentPhrase(phrase.text)
      lastPhraseScoreRef.current = phrase.score
      setTimeout(() => setCurrentPhrase(""), 2500)
    }
  }, [score, bestScore])

  // --- Max tile tracking ---
  useEffect(() => {
    const maxValue = Math.max(...board.map((tile) => tile.value), 2)
    if (maxValue > maxTileValue) setMaxTileValue(maxValue)
  }, [board, maxTileValue])

  const initializeGame = () => {
    const newBoard: Tile[] = []
    addNewTile(newBoard)
    addNewTile(newBoard)
    setBoard(newBoard)
    setScore(0)
    setIsGameOver(false)
    setCurrentPhrase("")
    setMaxTileValue(2)
    lastPhraseScoreRef.current = 0
  }

  const addNewTile = (board: Tile[]) => {
    const emptyTiles = []
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!board.some((tile) => tile.row === row && tile.col === col)) {
          emptyTiles.push({ row, col })
        }
      }
    }
    if (emptyTiles.length > 0) {
      const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
      board.push({
        value: Math.random() < 0.9 ? 2 : 4,
        id: `${row}-${col}-${Date.now()}`,
        row,
        col,
        isNew: true,
      })
    }
  }

  const move = (direction: "up" | "down" | "left" | "right") => {
    if (isGameOver) return

    let newBoard = board.map((tile) => ({ ...tile, justMerged: false, isNew: false }))
    let changed = false
    let newScore = score
    let hasMerged = false

    const sortedTiles = [...newBoard].sort((a, b) => {
      if (direction === "up" || direction === "down") {
        return direction === "up" ? a.row - b.row : b.row - a.row
      } else {
        return direction === "left" ? a.col - b.col : b.col - a.col
      }
    })

    for (const tile of sortedTiles) {
      const { row, col } = tile
      let newRow = row
      let newCol = col

      while (true) {
        newRow += direction === "up" ? -1 : direction === "down" ? 1 : 0
        newCol += direction === "left" ? -1 : direction === "right" ? 1 : 0

        if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
          newRow -= direction === "up" ? -1 : direction === "down" ? 1 : 0
          newCol -= direction === "left" ? -1 : direction === "right" ? 1 : 0
          break
        }

        const targetTile = newBoard.find((t) => t.row === newRow && t.col === newCol)
        if (targetTile) {
          if (targetTile.value === tile.value && !targetTile.justMerged) {
            newBoard = newBoard.filter((t) => t !== targetTile && t !== tile)
            newBoard.push({
              value: tile.value * 2,
              id: tile.id,
              row: newRow,
              col: newCol,
              justMerged: true,
              isNew: false,
            })
            newScore += tile.value * 2
            changed = true
            hasMerged = true
          } else {
            newRow -= direction === "up" ? -1 : direction === "down" ? 1 : 0
            newCol -= direction === "left" ? -1 : direction === "right" ? 1 : 0
          }
          break
        }
      }

      if (newRow !== row || newCol !== col) {
        changed = true
        tile.row = newRow
        tile.col = newCol
      }
    }

    if (changed) {
      if (hasMerged) playSound("merge")
      else playSound("move")

      addNewTile(newBoard)
      setBoard(newBoard)
      setScore(newScore)
      if (isGameOverState(newBoard)) {
        setIsGameOver(true)
        playSound("gameover")
      }
    } else if (isGameOverState(newBoard)) {
      setIsGameOver(true)
      playSound("gameover")
    }
  }

  const isGameOverState = (board: Tile[]) => {
    if (board.length < GRID_SIZE * GRID_SIZE) return false
    for (const tile of board) {
      const { row, col, value } = tile
      if (
        (row > 0 && board.some((t) => t.row === row - 1 && t.col === col && t.value === value)) ||
        (row < GRID_SIZE - 1 && board.some((t) => t.row === row + 1 && t.col === col && t.value === value)) ||
        (col > 0 && board.some((t) => t.row === row && t.col === col - 1 && t.value === value)) ||
        (col < GRID_SIZE - 1 && board.some((t) => t.row === row && t.col === col + 1 && t.value === value))
      )
        return false
    }
    return true
  }

  // --- Keyboard ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowUp":
        move("up")
        break
      case "ArrowDown":
        move("down")
        break
      case "ArrowLeft":
        move("left")
        break
      case "ArrowRight":
        move("right")
        break
    }
  }

  // --- Touch controls with scroll fix ---
  useEffect(() => {
    const boardElement = document.getElementById("game-board")
    if (!boardElement) return

    let startX = 0
    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (!boardElement.contains(e.target as Node)) return
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!boardElement.contains(e.target as Node)) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (Math.max(absDx, absDy) > 30) {
        if (absDx > absDy) dx > 0 ? move("right") : move("left")
        else dy > 0 ? move("down") : move("up")
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [move])

  const cellColor = (value: number) => {
    switch (value) {
      case 2:
        return "bg-[#ffea00] text-white"
      case 4:
        return "bg-[#ffd700] text-white"
      case 8:
        return "bg-[#ff8c00] text-white"
      case 16:
        return "bg-[#ff1744] text-white"
      case 32:
        return "bg-[#2979ff] text-white"
      case 64:
        return "bg-[#00e676] text-white"
      case 128:
        return "bg-[#d500f9] text-white"
      case 256:
        return "bg-[#ff6090] text-white"
      case 512:
        return "bg-[#00bcd4] text-white"
      case 1024:
        return "bg-[#7c4dff] text-white"
      case 2048:
        return "bg-gradient-to-br from-[#ff1744] to-[#d500f9] text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  const tileVariants: Variants = {
    initial: { scale: 0, rotate: 0 },
    enter: {
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    merged: {
      scale: [1, 1.3, 1],
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  }

  const heroLevel = getHeroLevel(maxTileValue)

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-comic-bg halftone-bg text-white select-none"
      ref={gameContainerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="2048 Comic Edition Game Board"
    >
      {/* --- HEADER --- */}
      <div className="w-full max-w-md p-4 flex flex-col items-center">
        {/* --- Title + Scores --- */}
        <div className="flex justify-between items-center mb-6 w-full">
          <h1 className="text-5xl sm:text-7xl font-comic text-[#ffea00] comic-text-shadow transform -rotate-1 sm:-rotate-2">
            COMIC 2048
          </h1>
          <div className="flex gap-3">
            <div className="bg-[#ff1744] p-3 h-20 w-20 rounded-lg text-white flex flex-col items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform rotate-2">
              <div className="text-xs font-comic">SCORE</div>
              <div className="font-comic text-2xl">{score}</div>
            </div>
            <div className="bg-[#2979ff] h-20 w-20 rounded-lg p-3 text-white flex flex-col items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
              <div className="text-xs font-comic">BEST</div>
              <div className="font-comic text-2xl">{bestScore}</div>
            </div>
          </div>
        </div>

        {/* --- HERO LEVEL --- */}
        <div className="mb-4 bg-comic-panel border-4 border-black rounded-lg p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full text-center">
          <div className="text-sm font-comic text-gray-400">HERO STATUS</div>
          <div className={`text-2xl font-comic ${heroLevel.color} comic-text-shadow`}>
            {heroLevel.title}
          </div>
        </div>

        {/* --- GAME GRID --- */}
        <div className="relative mx-auto flex justify-center items-center">
          <AnimatePresence>
            {currentPhrase && <ComicPhrase text={currentPhrase} />}
          </AnimatePresence>

          <div className="bg-comic-panel p-3 rounded-xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            <div
              id="game-board"
              className="relative"
              style={{
                width: `${cellSize * GRID_SIZE + CELL_GAP * (GRID_SIZE - 1)}rem`,
                height: `${cellSize * GRID_SIZE + CELL_GAP * (GRID_SIZE - 1)}rem`,
              }}
            >
              {/* Background cells */}
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                <div
                  key={`cell-${i}`}
                  className="absolute bg-gray-800 rounded-lg border-2 border-gray-700"
                  style={{
                    width: `${cellSize}rem`,
                    height: `${cellSize}rem`,
                    left: `${(i % GRID_SIZE) * (cellSize + CELL_GAP)}rem`,
                    top: `${Math.floor(i / GRID_SIZE) * (cellSize + CELL_GAP)}rem`,
                  }}
                />
              ))}

              {/* Active tiles */}
              <AnimatePresence>
                {board.map((tile) => (
                  <motion.div
                    key={tile.id}
                    initial={
                      tile.isNew
                        ? {
                            scale: 0,
                            x: tile.col * (cellSize + CELL_GAP) + "rem",
                            y: tile.row * (cellSize + CELL_GAP) + "rem",
                          }
                        : { scale: 0 }
                    }
                    animate={{
                      scale: 1,
                      x: tile.col * (cellSize + CELL_GAP) + "rem",
                      y: tile.row * (cellSize + CELL_GAP) + "rem",
                    }}
                    exit={{ scale: 0 }}
                    transition={
                      tile.isNew
                        ? { duration: 0.2 }
                        : { x: { duration: 0.15 }, y: { duration: 0.15 } }
                    }
                    className={`absolute rounded-lg flex items-center justify-center text-3xl font-comic ${cellColor(
                      tile.value
                    )} border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
                    style={{
                      width: `${cellSize}rem`,
                      height: `${cellSize}rem`,
                      transform: "perspective(1000px) rotateX(8deg) rotateY(-2deg)",
                    }}
                  >
                    <motion.div
                      variants={tileVariants}
                      animate={tile.justMerged ? "merged" : "enter"}
                      className="w-full h-full flex items-center justify-center comic-text-shadow"
                    >
                      {tile.value}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* --- Instructions --- */}
        <div className="mt-6 text-sm bg-[#ffea00] text-gray-900 p-4 rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <p className="font-comic text-base">
            <strong>HOW TO PLAY:</strong> Use your <strong>ARROW KEYS</strong> or swipe inside the
            board. When two tiles with the same number touch, they <strong>MERGE!</strong>
          </p>
        </div>

        {/* --- New Game Button --- */}
        <div className="mt-6">
          <Button
            onClick={initializeGame}
            className="bg-[#00e676] text-gray-900 hover:bg-[#00c853] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-comic text-lg sm:text-xl px-6 sm:px-8 py-5 sm:py-6 transform sm:rotate-1"
          >
            NEW GAME
          </Button>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-8 mb-4 bg-comic-panel border-4 border-black rounded-lg p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col items-center gap-2">
          <a
            href="https://ian-pontorno-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-block"
          >
            <span className="text-lg font-comic text-gray-400 group-hover:opacity-0 transition-opacity duration-300">
              © 2025 Ian Pontorno
            </span>
            <span className="absolute inset-0 text-lg font-comic text-[#ffea00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 comic-text-shadow">
              Portfolio →
            </span>
          </a>
          <p className="text-xs font-comic text-gray-500">2048 Comic Edition</p>
        </div>
      </footer>

      {/* --- GAME OVER MODAL --- */}
      <Dialog open={isGameOver} onOpenChange={setIsGameOver}>
        <DialogContent className="border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-comic-panel">
          <DialogHeader>
            <DialogTitle className="text-4xl font-comic text-[#ff1744] comic-text-shadow">
              GAME OVER!
            </DialogTitle>
            <DialogDescription className="text-xl font-comic text-white">
              Your score: <strong className="text-[#ffea00]">{score}</strong>
              {score === bestScore && score > 0 && (
                <span className="text-[#00e676]"> (NEW BEST!)</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={initializeGame}
              className="bg-[#00e676] text-gray-900 hover:bg-[#00c853] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-comic text-lg"
            >
              PLAY AGAIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
