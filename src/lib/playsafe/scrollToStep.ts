export function scrollToStep(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
