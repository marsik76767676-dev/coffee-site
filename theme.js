// theme.js

const toggleBtn = document.getElementById("themeToggle");

function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    if (toggleBtn) toggleBtn.textContent = "☀";
  } else {
    document.body.classList.remove("dark");
    if (toggleBtn) toggleBtn.textContent = "🌙";
  }

  localStorage.setItem("theme", theme);
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) return savedTheme;

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

document.addEventListener("DOMContentLoaded", () => {
  const theme = getPreferredTheme();
  setTheme(theme);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.body.classList.contains("dark")
        ? "dark"
        : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
});