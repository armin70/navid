/* No backend needed: the RSVP is a playful, local interaction. */
(() => {
  'use strict';

  // Best-effort autoplay with sound. Most mobile browsers permit audible
  // playback only after a user gesture; the first tap anywhere unlocks it.
  const music = document.getElementById('background-music');
  const musicButton = document.getElementById('music-button');
  const musicStatus = document.getElementById('music-status');
  let manuallyPaused = false;
  let playRequestPending = false;

  function refreshMusicButton() {
    const playing = !music.paused && !music.ended;
    musicButton.classList.toggle('is-playing', playing);
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    musicStatus.textContent = playing ? 'ON' : manuallyPaused ? 'OFF' : 'PLAY';
  }

  function removeUnlockListeners() {
    document.removeEventListener('pointerdown', unlockAudio, true);
    document.removeEventListener('touchstart', unlockAudio, true);
    document.removeEventListener('keydown', unlockAudio, true);
  }

  function tryPlayMusic() {
    if (manuallyPaused || playRequestPending || !music.paused) return;
    playRequestPending = true;
    // IMPORTANT: play() is called synchronously within the gesture handler
    // before awaiting its promise, which is required for mobile autoplay.
    const attempt = music.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(() => {
        removeUnlockListeners();
        refreshMusicButton();
      }).catch(() => {
        // Autoplay was blocked. The music button remains available, and
        // another interaction can unlock playback.
        refreshMusicButton();
      }).finally(() => { playRequestPending = false; });
    } else {
      playRequestPending = false;
      refreshMusicButton();
    }
  }

  function unlockAudio(event) {
    // Clicking the explicit music toggle must not first trigger automatic
    // play, otherwise the click would immediately pause it again.
    if (event.target instanceof Element && event.target.closest('#music-button')) return;
    if (!manuallyPaused) tryPlayMusic();
  }

  music.addEventListener('playing', () => {
    removeUnlockListeners();
    refreshMusicButton();
  });
  music.addEventListener('pause', refreshMusicButton);
  music.addEventListener('ended', refreshMusicButton);
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

  // Touch/pointer/keyboard support; listeners are removed after playback starts.
  document.addEventListener('pointerdown', unlockAudio, {capture:true, passive:true});
  document.addEventListener('touchstart', unlockAudio, {capture:true, passive:true});
  document.addEventListener('keydown', unlockAudio, true);
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
  const yes = document.getElementById('yes-button');
  const no = document.getElementById('no-button');
  const message = document.getElementById('rsvp-message');
  const subtitle = document.getElementById('rsvp-subtitle');
  const NO_LIMIT = 4;
  let noAttempts = 0;
  let lastDodge = 0;
  let finished = false;
  let lastTouchAt = -Infinity;

  function dodgeNo() {
    if (finished) return;
    const now = performance.now();
    if (now - lastDodge < 180) return;
    lastDodge = now;
    noAttempts += 1;

    if (noAttempts >= NO_LIMIT) {
      finished = true;
      rsvp.classList.add('is-final');
      message.textContent = "NOPE! 😂 You're coming. No excuses!";
      no.textContent = 'GOTCHA! 😈';
      // Snap back to the RSVP row without interpolating from its previous fixed coordinates.
      no.style.transition = 'none';
      no.classList.remove('is-escaping', 'is-teasing');
      no.style.left = '';
      no.style.top = '';
      void no.offsetWidth;
      requestAnimationFrame(() => { no.style.transition = ''; });
      return;
    }

    // A real runaway button: it jumps around the visible screen, never offscreen.
    // Works on mobile touch and desktop mouse without causing extra page scrolling.
    const spots = [
      {x: .66, y: .23}, // near the photos
      {x: .07, y: .53}, // opposite side of the screen
      {x: .58, y: .72}  // one last escape
    ];
    const spot = spots[(noAttempts - 1) % spots.length];
    no.classList.add('is-escaping', 'is-teasing');
    const margin = 12;
    const maxLeft = Math.max(margin, innerWidth - no.offsetWidth - margin);
    const maxTop = Math.max(margin, innerHeight - no.offsetHeight - margin);
    no.style.left = `${Math.min(maxLeft, Math.max(margin, innerWidth * spot.x))}px`;
    no.style.top = `${Math.min(maxTop, Math.max(margin, innerHeight * spot.y))}px`;
    const teasing = [
      'Nice try! 😏',
      'Still trying to say no? 😂',
      'The YES button is right there! 😎'
    ];
    message.textContent = teasing[noAttempts - 1];
  }

  // Mouse/trackpad: dodge when approached; touch: dodge on finger-down.
  no.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') dodgeNo(); });
  no.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && !finished) { lastTouchAt = performance.now(); e.preventDefault(); dodgeNo(); }
  });
  no.addEventListener('click', e => {
    if (performance.now() - lastTouchAt < 450) { e.preventDefault(); return; }
    if (finished) {
      message.textContent = 'Appeal denied! 😂 See you there! 🎉';
    } else {
      e.preventDefault(); dodgeNo(); // keyboard and fallback click
    }
  });

  yes.addEventListener('click', () => {
    finished = true;
    rsvp.classList.add('is-accepted');
    rsvp.classList.remove('is-final');
    yes.innerHTML = "YOU'RE IN! 🎉 WELCOME!";
    subtitle.textContent = "That's the spirit! ✳";
    message.textContent = 'See you November 29! 🥳';
    yes.style.animation = 'bounceYes .55s ease';
  });
})();
