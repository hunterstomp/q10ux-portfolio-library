document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("loader-animation");
  if (el && typeof lottie !== "undefined") {
    try {
      lottie.loadAnimation({
        container: el,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "lottie/loader.json"
      });
    } catch (e) {
      console.warn("Lottie failed to load:", e);
    }
  }
});
