(function () {
  const stateMap = new WeakMap();

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getState(audioEl) {
    if (!stateMap.has(audioEl)) {
      stateMap.set(audioEl, {
        baseVolume: typeof audioEl.volume === "number" ? audioEl.volume : 1,
        fadeInMs: 450,
        fadeOutMs: 650,
        endFadeMs: 700,
        rafId: 0,
        isEnding: false,
        isBound: false,
      });
    }
    return stateMap.get(audioEl);
  }

  function cancelAnimation(state) {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
  }

  function animateVolume(audioEl, from, to, duration, onDone) {
    const state = getState(audioEl);
    cancelAnimation(state);
    if (!duration || duration <= 0) {
      audioEl.volume = clamp(to, 0, 1);
      if (onDone) {
        onDone();
      }
      return;
    }

    const start = performance.now();
    const safeFrom = clamp(from, 0, 1);
    const safeTo = clamp(to, 0, 1);

    function step(now) {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      audioEl.volume = safeFrom + (safeTo - safeFrom) * eased;
      if (progress < 1) {
        state.rafId = requestAnimationFrame(step);
        return;
      }
      state.rafId = 0;
      if (onDone) {
        onDone();
      }
    }

    audioEl.volume = safeFrom;
    state.rafId = requestAnimationFrame(step);
  }

  function bindAutoFade(audioEl) {
    const state = getState(audioEl);
    if (state.isBound) {
      return;
    }

    audioEl.addEventListener("play", () => {
      state.isEnding = false;
    });

    audioEl.addEventListener("timeupdate", () => {
      if (state.isEnding || !Number.isFinite(audioEl.duration) || audioEl.duration <= 0) {
        return;
      }
      const remainingMs = (audioEl.duration - audioEl.currentTime) * 1000;
      if (remainingMs > state.endFadeMs + 40) {
        return;
      }
      state.isEnding = true;
      animateVolume(
        audioEl,
        audioEl.volume,
        0,
        Math.max(140, Math.min(state.fadeOutMs, remainingMs)),
        () => {
          if (!audioEl.paused) {
            audioEl.pause();
          }
          audioEl.currentTime = 0;
          audioEl.volume = state.baseVolume;
          state.isEnding = false;
        }
      );
    });

    audioEl.addEventListener("ended", () => {
      cancelAnimation(state);
      audioEl.currentTime = 0;
      audioEl.volume = state.baseVolume;
      state.isEnding = false;
    });

    state.isBound = true;
  }

  function register(audioEl, config) {
    if (!audioEl) {
      return;
    }
    const state = getState(audioEl);
    const nextConfig = config || {};
    state.baseVolume = clamp(
      typeof nextConfig.volume === "number" ? nextConfig.volume : state.baseVolume,
      0,
      1
    );
    state.fadeInMs = nextConfig.fadeInMs || state.fadeInMs;
    state.fadeOutMs = nextConfig.fadeOutMs || state.fadeOutMs;
    state.endFadeMs = nextConfig.endFadeMs || state.endFadeMs || state.fadeOutMs;
    audioEl.volume = state.baseVolume;
    bindAutoFade(audioEl);
  }

  function prime(audioEl) {
    if (!audioEl) {
      return;
    }
    const state = getState(audioEl);
    audioEl.load();
    const originalVolume = state.baseVolume;
    audioEl.volume = 0;
    audioEl.currentTime = 0;
    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          audioEl.pause();
          audioEl.currentTime = 0;
          audioEl.volume = originalVolume;
        })
        .catch(() => {
          audioEl.volume = originalVolume;
        });
      return;
    }
    audioEl.pause();
    audioEl.currentTime = 0;
    audioEl.volume = originalVolume;
  }

  function play(audioEl, options) {
    if (!audioEl) {
      return Promise.resolve(false);
    }
    const state = getState(audioEl);
    const nextOptions = options || {};
    register(audioEl, nextOptions);
    cancelAnimation(state);
    state.isEnding = false;

    const shouldRestart = nextOptions.restart !== false;
    if (!shouldRestart && !audioEl.paused) {
      animateVolume(audioEl, audioEl.volume, state.baseVolume, nextOptions.fadeInMs || state.fadeInMs);
      return Promise.resolve(true);
    }

    if (shouldRestart) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }

    audioEl.volume = 0;
    const playPromise = audioEl.play();
    const fadeInMs = nextOptions.fadeInMs || state.fadeInMs;
    const onPlay = () => {
      animateVolume(audioEl, 0, state.baseVolume, fadeInMs);
      return true;
    };

    if (playPromise && typeof playPromise.then === "function") {
      return playPromise.then(onPlay).catch(() => false);
    }

    return Promise.resolve(onPlay());
  }

  function stop(audioEl, options) {
    if (!audioEl) {
      return Promise.resolve(false);
    }
    const state = getState(audioEl);
    const nextOptions = options || {};
    const fadeOutMs = nextOptions.fadeOutMs || state.fadeOutMs;
    return new Promise((resolve) => {
      if (audioEl.paused) {
        audioEl.currentTime = nextOptions.resetTime === false ? audioEl.currentTime : 0;
        audioEl.volume = state.baseVolume;
        resolve(true);
        return;
      }
      animateVolume(audioEl, audioEl.volume, 0, fadeOutMs, () => {
        audioEl.pause();
        if (nextOptions.resetTime !== false) {
          audioEl.currentTime = 0;
        }
        audioEl.volume = state.baseVolume;
        state.isEnding = false;
        resolve(true);
      });
    });
  }

  window.CinematicAudio = {
    register,
    play,
    stop,
    prime,
  };
})();
