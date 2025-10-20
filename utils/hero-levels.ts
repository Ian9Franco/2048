export const heroLevels  = [
  { value: 2, title: "Rookie: Spider-Gwen", color: "text-comic-purple" },
  { value: 8, title: "Fighter: Daredevil", color: "text-comic-red" },
  { value: 64, title: "Mighty: She-Hulk", color: "text-comic-green" },
  { value: 512, title: "Dark Avenger: Nightwing", color: "text-comic-blue" },
  { value: 1024, title: "Web-Slinger: Miles Morales", color: "text-comic-orange" },
  { value: 2048, title: "Armored: War Machine", color: "text-comic-gray" },
  { value: 4096, title: "Cosmic Guardian: Silver Surfer", color: "text-comic-sky" },
  { value: 8192, title: "Godlike: Wonder Woman", color: "text-comic-red-500" },
  { value: 16384, title: "Omnipotent: Doctor Fate", color: "text-comic-pink" },
  { value: 32768, title: "Ultimate Hero: Galactus", color: "text-comic-gold" },
]

export function getHeroLevel(maxTileValue: number) {
  for (let i = heroLevels.length - 1; i >= 0; i--) {
    if (maxTileValue >= heroLevels[i].value) {
      return heroLevels[i]
    }
  }
  return heroLevels[0]
}
