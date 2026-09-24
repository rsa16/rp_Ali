(function () {
  "use strict";

  var root = document.documentElement;
  var splash = document.querySelector(".splash");
  var NAV_KEY = "rp-nav";

  function failSafe() {
    root.classList.remove("js");
    root.classList.remove("is-navigating");
    if (splash && splash.parentNode) {
      splash.parentNode.removeChild(splash);
    }
  }

  if (!window.gsap) {
    failSafe();
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    failSafe();
    return;
  }

  var header = document.querySelector("header");
  var hero = document.querySelector("[data-hero]");

  function splitWords(el) {
    var textNodes = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var node;

    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim()) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(function (textNode) {
      var frag = document.createDocumentFragment();
      var parts = textNode.nodeValue.split(/(\s+)/);

      parts.forEach(function (part) {
        if (!part) {
          return;
        }
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var word = document.createElement("span");
        var inner = document.createElement("span");
        word.className = "word";
        inner.className = "word-inner";
        inner.textContent = part;
        word.appendChild(inner);
        frag.appendChild(word);
      });

      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  function splitHeadings() {
    gsap.utils.toArray("[data-split]").forEach(splitWords);
  }

  function prepare() {
    splitHeadings();

    gsap.set(gsap.utils.toArray("[data-reveal]"), { y: 24, opacity: 0 });

    gsap.utils.toArray("[data-split]").forEach(function (el) {
      gsap.set(el, { opacity: 1 });
      gsap.set(el.querySelectorAll(".word-inner"), { yPercent: 110 });
    });

    if (header) {
      gsap.set(header, { y: -16, opacity: 0 });
    }

    if (hero) {
      gsap.set(hero.querySelectorAll("[data-hero-item]"), { y: 26, opacity: 0 });
    }
  }

  function playIntro() {
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    if (header) {
      tl.to(header, { y: 0, opacity: 1, duration: 0.6 });
    }

    if (!hero) {
      return;
    }

    var words = hero.querySelectorAll("[data-split] .word-inner");
    var items = hero.querySelectorAll("[data-hero-item]");

    if (words.length) {
      tl.to(words, { yPercent: 0, duration: 1, stagger: 0.045 }, "-=0.3");
    }

    if (items.length) {
      tl.to(
        items,
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
        "-=0.65"
      );
    }
  }

  function startScroll() {
    var items = gsap.utils.toArray("[data-reveal]");

    if (items.length) {
      if (ScrollTrigger) {
        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "expo.out",
              stagger: 0.1,
              overwrite: true
            });
          }
        });
      } else {
        gsap.to(items, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.05
        });
      }
    }

    var headings = gsap.utils.toArray("[data-split]").filter(function (el) {
      return !el.closest("[data-hero]");
    });

    headings.forEach(function (el) {
      var words = el.querySelectorAll(".word-inner");
      if (!words.length) {
        return;
      }

      if (ScrollTrigger) {
        gsap.to(words, {
          yPercent: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.045,
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        });
      } else {
        gsap.to(words, {
          yPercent: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.045
        });
      }
    });
  }

  function readNavFlag() {
    try {
      if (sessionStorage.getItem(NAV_KEY) === "1") {
        sessionStorage.removeItem(NAV_KEY);
        return true;
      }
    } catch (error) {
      /* ignore */
    }
    return false;
  }

  function playSplash(done) {
    if (!splash) {
      done();
      return;
    }

    var inner = splash.querySelector(".splash-inner");
    var mark = splash.querySelector(".splash-mark");
    var sub = splash.querySelector(".splash-sub");
    var fill = splash.querySelector(".splash-bar-fill");

    gsap.killTweensOf(splash);
    gsap.set(splash, { yPercent: 0 });

    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    if (readNavFlag()) {
      if (inner) {
        gsap.set(inner, { autoAlpha: 0 });
      }
      tl.to(splash, {
        yPercent: -100,
        duration: 0.55,
        ease: "expo.inOut",
        onStart: done
      });
      return;
    }

    if (mark) {
      tl.from(mark, { yPercent: 40, opacity: 0, duration: 0.8 });
    }
    if (sub) {
      tl.from(sub, { opacity: 0, duration: 0.6 }, "-=0.35");
    }
    if (fill) {
      tl.to(fill, { scaleX: 1, duration: 0.9, ease: "expo.inOut" }, "-=0.4");
    }
    tl.to(splash, {
      yPercent: -100,
      duration: 0.75,
      ease: "expo.inOut",
      delay: 0.2,
      onStart: done
    });
  }

  function isTransitionable(anchor) {
    if (!anchor || !anchor.getAttribute) {
      return false;
    }
    if (anchor.target && anchor.target !== "_self") {
      return false;
    }
    if (anchor.hasAttribute("download")) {
      return false;
    }
    var href = anchor.getAttribute("href");
    if (!href || href.charAt(0) === "#") {
      return false;
    }
    if (/^(mailto:|tel:|javascript:)/i.test(href)) {
      return false;
    }
    return new URL(anchor.href, window.location.href).origin === window.location.origin;
  }

  function setupTransitions() {
    if (!splash) {
      return;
    }

    var navigating = false;

    document.addEventListener("click", function (event) {
      if (
        navigating ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      var anchor = event.target.closest ? event.target.closest("a") : null;
      if (!isTransitionable(anchor)) {
        return;
      }

      var url = new URL(anchor.href, window.location.href);
      var here = new URL(window.location.href);
      if (url.pathname === here.pathname && url.search === here.search) {
        return;
      }

      event.preventDefault();
      navigating = true;

      try {
        sessionStorage.setItem(NAV_KEY, "1");
      } catch (error) {
        /* ignore */
      }

      gsap.killTweensOf(splash);
      gsap.set(splash, { yPercent: 100 });
      gsap.set(splash.querySelector(".splash-inner"), { autoAlpha: 0 });

      gsap.to(splash, {
        yPercent: 0,
        duration: 0.55,
        ease: "expo.inOut",
        onComplete: function () {
          window.location.href = url.href;
        }
      });
    });
  }

  prepare();
  playSplash(function () {
    playIntro();
    startScroll();
  });
  setupTransitions();
})();
