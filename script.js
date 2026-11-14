/* No backend needed: the RSVP is a playful, local interaction. */
(() => {
  'use strict';

  // Audible autoplay is restricted on most mobile browsers. Try immediately,
  // then offer a clear one-tap entrance that starts the looping music.
  const music = document.getElementById('background-music');
  music.volume = 0.25;
  const musicButton = document.getElementById('music-button');
  const musicStatus = document.getElementById('music-status');
  const soundGate = document.getElementById('sound-gate');
  const enterWithSound = document.getElementById('enter-with-sound');
  const enterWithoutSound = document.getElementById('enter-without-sound');
  let manuallyPaused = false;
  let gateDismissed = false;

  function refreshMusicButton() {
    const playing = !music.paused && !music.ended;
    musicButton.classList.toggle('is-playing', playing);
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    musicStatus.textContent = playing ? 'ON' : manuallyPaused ? 'OFF' : 'PLAY';
  }

  function hideSoundGate() {
    gateDismissed = true;
    soundGate.hidden = true;
    document.body.classList.remove('sound-gate-open');
  }

  function showSoundGate() {
    if (gateDismissed || manuallyPaused || !music.paused || !window.matchMedia('(pointer: coarse)').matches) return;
    soundGate.hidden = false;
    document.body.classList.add('sound-gate-open');
  }

  function tryPlayMusic() {
    if (manuallyPaused || !music.paused) return;
    // play() MUST be invoked synchronously during a real click/touch for iOS.
    // Do not block a user's gesture while the initial autoplay promise is pending.
    let request;
    try {
      request = music.play();
    } catch (_) {
      showSoundGate();
      refreshMusicButton();
      return;
    }
    if (request && typeof request.then === 'function') {
      request.then(() => {
        hideSoundGate();
        refreshMusicButton();
      }).catch(() => {
        // Silent autoplay is possible, but audible autoplay cannot be forced.
        showSoundGate();
        refreshMusicButton();
      });
    } else {
      if (!music.paused) hideSoundGate();
      refreshMusicButton();
    }
  }

  music.addEventListener('playing', () => {
    hideSoundGate();
    refreshMusicButton();
  });
  music.addEventListener('pause', refreshMusicButton);
  music.addEventListener('ended', refreshMusicButton);

  enterWithSound.addEventListener('click', () => {
    manuallyPaused = false;
    hideSoundGate();
    tryPlayMusic();
  });
  enterWithoutSound.addEventListener('click', () => {
    manuallyPaused = true;
    music.pause();
    hideSoundGate();
    refreshMusicButton();
  });

  musicButton.addEventListener('click', () => {
    if (!music.paused) {
      manuallyPaused = true;
      music.pause();
    } else {
      manuallyPaused = false;
      tryPlayMusic();
    }
    refreshMusicButton();
  });

  // Desktop fallback: any normal interaction can start playback when allowed.
  // Mobile visitors see the explicit "ENTER WITH SOUND" control if blocked.
  document.addEventListener('click', (event) => {
    if (manuallyPaused || !music.paused || !soundGate.hidden) return;
    if (event.target.closest('#music-button, #enter-with-sound, #enter-without-sound')) return;
    tryPlayMusic();
  }, true);

  music.loop = true;
  refreshMusicButton();
  tryPlayMusic();

  const eventStart = new Date('2026-11-29T18:00:00-08:00');
  const eventEnd = new Date('2026-11-29T20:00:00-08:00');
  const countdown = document.getElementById('countdown');
  function updateCountdown() {
    const now = Date.now();
    const days = Math.ceil((eventStart.getTime() - now) / 86400000);
    if (now >= eventEnd.getTime()) countdown.textContent = '✳ WHAT A NIGHT!';
    else if (now >= eventStart.getTime()) countdown.textContent = '✳ PARTY TIME!';
    else countdown.textContent = `✳ ${days} DAY${days !== 1 ? 'S' : ''} TO GO`;
  }
  updateCountdown();
  setInterval(updateCountdown, 60000);

  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2700);
  }

  document.getElementById('share-button').addEventListener('click', async () => {
    const shareText = "You're invited to Navid's 18th birthday! 🎉 Sunday, November 29, 2026 • 6–8 PM • Amato Pizza, 6081 Meridian Ave, Ste 60, San Jose, CA 95120.";
    const url = location.href.split('#')[0];
    if (navigator.share) {
      try { await navigator.share({title:"Navid's 18th", text:shareText, url}); return; }
      catch(e) { if (e.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      showToast('INVITE LINK COPIED ✳');
    } catch {
      const field = document.createElement('textarea');
      field.value = `${shareText}\n${url}`;
      field.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
      document.body.appendChild(field); field.select();
      const success = document.execCommand('copy'); field.remove();
      showToast(success ? 'INVITE LINK COPIED ✳' : 'SHARE THIS PAGE WITH FRIENDS ✳');
    }
  });

  document.getElementById('calendar-button').addEventListener('click', () => {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Navid Birthday//Invitation//EN',
      'CALSCALE:GREGORIAN','BEGIN:VEVENT',
      'UID:navid-18-20261129@birthday-invitation',
      'DTSTAMP:20261115T000000Z',
      'DTSTART:20261130T020000Z', 'DTEND:20261130T040000Z',
      "SUMMARY:Navid's 18th Birthday Party",
      'LOCATION:Amato Pizza\, 6081 Meridian Ave Ste 60\, San Jose\, CA 95120',
      'DESCRIPTION:Come celebrate Navid turning 18! Nov 29 at 6–8 PM PST.',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const objectUrl = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'], {type:'text/calendar;charset=utf-8'}));
    const link = document.createElement('a'); link.href = objectUrl; link.download = 'navid-18th.ics';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    showToast('CALENDAR EVENT DOWNLOADED ✳');
  });

  const rsvp = document.querySelector('.rsvp');
  const playground = document.getElementById('rsvp-buttons');
  const escapeLayer = document.getElementById('escape-layer');
  const yes = document.getElementById('yes-button');
  const no = document.getElementById('no-button');
  const message = document.getElementById('rsvp-message');
  const subtitle = document.getElementById('rsvp-subtitle');
  const NO_LIMIT = 4;
  let noAttempts = 0;
  let lastDodge = -Infinity;
  let finished = false;
  let lastTouchAt = -Infinity;

  function returnNoToRow() {
    // Reparent back after escaping. This also restores the original mobile layout.
    no.style.transition = 'none';
    no.classList.remove('is-escaping', 'is-teasing');
    no.style.left = '';
    no.style.top = '';
    playground.appendChild(no);
    void no.offsetWidth;
    requestAnimationFrame(() => { no.style.transition = ''; });
  }

  function dodgeNo() {
    if (finished) return;
    const now = performance.now();
    if (now - lastDodge < 180) return; // ignore duplicate touch/pointer events
    lastDodge = now;
    noAttempts++;

    if (noAttempts >= NO_LIMIT) {
      finished = true;
      rsvp.classList.add('is-final');
      message.textContent = "NOPE! 😂 You're coming. No excuses!";
      no.textContent = 'GOTCHA! 😈';
      returnNoToRow();
      showToast("NOPE! 😂 YOU CAN'T NOT COME!");
      return;
    }

    // Move to a top-level overlay: the old button was trapped behind the photo
    // and event panels after its first escape due to CSS stacking contexts.
    if (no.parentElement !== escapeLayer) {
      const rect = no.getBoundingClientRect();
      escapeLayer.appendChild(no);
      no.classList.add('is-escaping');
      no.style.left = `${rect.left}px`;
      no.style.top = `${rect.top}px`;
      void no.offsetWidth;
    }
    no.classList.add('is-escaping', 'is-teasing');

    // Positions are chosen inside the visual viewport, including short phones.
    const visual = window.visualViewport;
    const width = visual ? visual.width : window.innerWidth;
    const height = visual ? visual.height : window.innerHeight;
    const offsetX = visual ? visual.offsetLeft : 0;
    const offsetY = visual ? visual.offsetTop : 0;
    const margin = 14;
    const buttonWidth = no.offsetWidth;
    const buttonHeight = no.offsetHeight;
    const spots = [
      { x: 0.75, y: 0.29 },
      { x: 0.09, y: 0.53 },
      { x: 0.61, y: 0.75 }
    ];
    const spot = spots[(noAttempts - 1) % spots.length];
    const maxX = Math.max(margin, width - buttonWidth - margin);
    const maxY = Math.max(60, height - buttonHeight - margin);
    const x = offsetX + Math.min(maxX, Math.max(margin, width * spot.x));
    const y = offsetY + Math.min(maxY, Math.max(60, height * spot.y));
    // One animation frame keeps a readable darting motion without scroll jumps.
    requestAnimationFrame(() => {
      no.style.left = `${x}px`;
      no.style.top = `${y}px`;
    });
    message.textContent = [
      'Nice try! 😏',
      'Still trying to say no? 😂',
      'The YES button is right there! 😎'
    ][noAttempts - 1];
  }

  no.addEventListener('pointerenter', (event) => {
    if ((event.pointerType === 'mouse' || event.pointerType === 'pen') && !finished) dodgeNo();
  });
  no.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' && !finished) {
      lastTouchAt = performance.now();
      event.preventDefault();
      dodgeNo();
    }
  });
  // Compatibility for iOS Safari versions with different pointer handling.
  no.addEventListener('touchstart', (event) => {
    if (!finished) {
      lastTouchAt = performance.now();
      event.preventDefault();
      dodgeNo();
    }
  }, {passive: false});
  no.addEventListener('click', (event) => {
    if (performance.now() - lastTouchAt < 650) {
      event.preventDefault();
      return;
    }
    if (finished) {
      message.textContent = 'Appeal denied! 😂 See you there! 🎉';
    } else {
      event.preventDefault();
      dodgeNo();
    }
  });

  yes.addEventListener('click', () => {
    finished = true;
    if (no.parentElement === escapeLayer) returnNoToRow();
    rsvp.classList.add('is-accepted');
    rsvp.classList.remove('is-final');
    yes.innerHTML = "YOU'RE IN! 🎉 WELCOME!";
    subtitle.textContent = "That's the spirit! ✳";
    message.textContent = 'See you November 29! 🥳';
    yes.style.animation = 'bounceYes .55s ease';
  });
})();
