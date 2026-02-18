"use client"

import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "dark") {
      document.documentElement.classList.add("dark")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(true)
    }
  }, [])

  function toggleTheme() {
    const html = document.documentElement

    if (dark) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }

    setDark(!dark)
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  )
}
