/* Alfath Ad System
 * Put your video file at: public/iklan.mp4
 * Premium contact is handled through WhatsApp only.
 */
(function () {
    'use strict';

    window.ALFATH_PREMIUM_WA = '6289673955168';
    window.ALFATH_AD_VIDEO = '/iklan.mp4';
    window.ALFATH_AD_EVERY = 3;

    var trackCount = Number(localStorage.getItem('alfath_ad_track_count') || 0);
    var adShowing = false;

    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
        });
    }

    function ensureStyles() {
        if (document.getElementById('alfath-ad-style')) return;
        var st = document.createElement('style');
        st.id = 'alfath-ad-style';
        st.textContent = `
            #alfath-ad-overlay {
                position: fixed; inset: 0; z-index: 99999;
                display: none; align-items: center; justify-content: center;
                background: rgba(0,0,0,.92); backdrop-filter: blur(10px);
                padding: 18px;
            }
            #alfath-ad-box {
                width: min(720px, 100%); max-height: 92dvh;
                background: #101116; border: 1px solid rgba(255,255,255,.12);
                border-radius: 18px; overflow: hidden;
                box-shadow: 0 20px 80px rgba(0,0,0,.65);
            }
            #alfath-ad-head {
                display:flex; align-items:center; justify-content:space-between;
                gap:12px; padding:12px 14px; color:#fff;
                font:700 13px/1.2 Arial,sans-serif;
            }
            #alfath-ad-video {
                display:block; width:100%; max-height:70dvh; background:#000;
            }
            #alfath-ad-foot {
                padding:12px 14px 14px; color:#a9adb7;
                font:500 12px/1.45 Arial,sans-serif;
            }
            #alfath-premium-btn {
                margin-top:10px; width:100%; border:0; border-radius:12px;
                padding:11px 14px; background:#fff; color:#111;
                font:800 13px Arial,sans-serif; cursor:pointer;
            }
            #alfath-ad-skip {
                display:none; border:0; border-radius:10px; padding:7px 10px;
                background:#272a33; color:#fff; font:700 11px Arial,sans-serif;
            }
        `;
        document.head.appendChild(st);
    }

    function ensureOverlay() {
        if (document.getElementById('alfath-ad-overlay')) return;
        ensureStyles();

        var wrap = document.createElement('div');
        wrap.id = 'alfath-ad-overlay';
        wrap.innerHTML = `
            <div id="alfath-ad-box">
                <div id="alfath-ad-head">
                    <span>Alfath • Iklan</span>
                    <button id="alfath-ad-skip" type="button">Lanjut</button>
                </div>
                <video id="alfath-ad-video" playsinline preload="auto"></video>
                <div id="alfath-ad-foot">
                    Iklan selesai diputar, musik akan dilanjutkan otomatis.
                    <button id="alfath-premium-btn" type="button">Ingin tanpa iklan? Hubungi Admin via WhatsApp</button>
                </div>
            </div>
        `;
        document.body.appendChild(wrap);

        var btn = document.getElementById('alfath-premium-btn');
        btn.addEventListener('click', function () {
            var number = String(window.ALFATH_PREMIUM_WA || '').replace(/\D/g, '');
            if (!number || number === '628xxxxxxxxxx') {
                alert('Nomor WhatsApp admin belum diisi.');
                return;
            }
            var text = encodeURIComponent('Halo Admin Alfath, saya ingin berlangganan Premium tanpa iklan.');
            window.open('https://wa.me/' + number + '?text=' + text, '_blank', 'noopener,noreferrer');
        });
    }

    function closeAd(callback) {
        var overlay = document.getElementById('alfath-ad-overlay');
        var video = document.getElementById('alfath-ad-video');
        adShowing = false;
        if (video) {
            try { video.pause(); } catch (e) {}
            video.removeAttribute('src');
            video.load();
        }
        if (overlay) overlay.style.display = 'none';
        if (typeof callback === 'function') callback();
    }

    window.playAdBeforeNext = function (nextCallback) {
        if (adShowing) return;
        ensureOverlay();

        var overlay = document.getElementById('alfath-ad-overlay');
        var video = document.getElementById('alfath-ad-video');
        var skip = document.getElementById('alfath-ad-skip');

        if (!video) {
            if (typeof nextCallback === 'function') nextCallback();
            return;
        }

        adShowing = true;
        overlay.style.display = 'flex';
        skip.style.display = 'none';

        video.src = window.ALFATH_AD_VIDEO;

        var done = false;
        function finish() {
            if (done) return;
            done = true;
            video.removeEventListener('ended', finish);
            closeAd(nextCallback);
        }

        video.addEventListener('ended', finish, { once: true });
        video.addEventListener('error', finish, { once: true });

        var p = video.play();
        if (p && typeof p.catch === 'function') {
            p.catch(function () {
                // Browser autoplay restrictions: show a manual continue button.
                skip.style.display = 'inline-block';
                skip.onclick = finish;
            });
        }
    };

    window.shouldShowAlfathAd = function () {
        return trackCount >= window.ALFATH_AD_EVERY;
    };

    window.markAlfathTrackEnded = function () {
        trackCount++;
        localStorage.setItem('alfath_ad_track_count', String(trackCount));
    };

    window.resetAlfathAdCounter = function () {
        trackCount = 0;
        localStorage.setItem('alfath_ad_track_count', '0');
    };
})();
