(function () {
  if (window.top !== window.self) {
    try {
      document.documentElement.style.visibility = 'hidden';
      window.top.location = window.location.href;
    } catch {
      document.documentElement.style.visibility = 'hidden';
    }
  }
})();
