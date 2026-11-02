
/* =========================================
   SENTINEL S5 — MAIN JS
   完整替换版本 · Layered Glass Reveal
   ========================================= */

"use strict";

/* =========================================
   01 — 产品功能数据
   ========================================= */

const DATA = {
  aov: {
    number: "01 / AOV MONITORING",
    title: "Monitoring beyond ignition-off.",
    desc: "Sentinel S5 uses low-power AOV monitoring to maintain visibility around parked trucks after the engine is switched off.",
    bullets: [
      "Built for vehicle downtime.",
      "Powered by the vehicle."
    ],
    outro: "Discover how AOV works at the launch.",
    label: "DAY / NIGHT · CONCEPT PREVIEW",
    image: "assets/images/image-05.webp"
  },

  behaviour: {
    number: "02 / BEHAVIOUR DETECTION",
    title: "Focus on activity that matters.",
    desc: "Behaviour-based detection helps distinguish routine movement from activity near the fuel tank.",
    bullets: [
      "Beyond motion alone.",
      "Video context for event review."
    ],
    outro: "See the difference in our launch demonstration.",
    label: "ROUTINE MOVEMENT / ACTIVITY NEAR FUEL TANK",
    image: "assets/images/image-06.webp"
  },

  night: {
    number: "03 / BLACK LIGHT ULTRA",
    title: "Visibility after dark.",
    desc: "Black Light Ultra supports human detection in low-light conditions, helping fleet teams review activity around parked vehicles at night.",
    bullets: [
      "Low-light human detection.",
      "Video context after dark."
    ],
    outro: "Watch the night-time demonstration at launch.",
    label: "LOW-LIGHT MONITORING · CONCEPT PREVIEW",
    image: "assets/images/image-07.webp"
  }
};


/* =========================================
   02 — 产品功能切换
   ========================================= */

function choose(key) {
  const data = DATA[key];

  if (!data) return;

  document.querySelectorAll("[data-tab]").forEach(tab => {
    const active = tab.dataset.tab === key;

    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  }

  setText("detail-number", data.number);
  setText("detail-title", data.title);
  setText("detail-desc", data.desc);
  setText("detail-outro", data.outro);
  setText("visual-label", data.label);

  const bullets = document.getElementById("detail-bullets");

  if (bullets) {
    bullets.replaceChildren(
      ...data.bullets.map(value => {
        const span = document.createElement("span");
        span.textContent = value;
        return span;
      })
    );
  }

  const image = document.getElementById("feature-image");

  if (image) {
    image.src = data.image;
  }

  const aovControl = document.getElementById("aov-control");

  if (aovControl) {
    aovControl.hidden = key !== "aov";
  }

  const nightTint = document.getElementById("night-tint");

  if (nightTint) {
    nightTint.style.opacity = "0";
  }

  const dayRange = document.getElementById("day-range");

  if (dayRange) {
    dayRange.value = "50";
  }
}

document.querySelectorAll("[data-tab]").forEach(tab => {
  tab.addEventListener("click", () => {
    choose(tab.dataset.tab);
  });
});

document.querySelectorAll("[data-feature-link]").forEach(link => {
  link.addEventListener("click", () => {
    choose(link.dataset.featureLink);
  });
});


/* =========================================
   03 — 日夜模式滑块
   ========================================= */

const dayRange = document.getElementById("day-range");
const nightTint = document.getElementById("night-tint");

if (dayRange && nightTint) {
  dayRange.addEventListener("input", event => {
    const value = Number(event.target.value);

    nightTint.style.opacity = String(value / 100 * 0.7);
  });
}


/* =========================================
   04 — 注册表单
   ========================================= */

const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!registerForm.reportValidity()) return;

    const feedback = document.getElementById("feedback");

    if (feedback) {
      feedback.textContent =
        "Prototype preview — the form is valid, but no registration was submitted.";
    }
  });
}


/* =========================================
   05 — 页面渐显动画
   ========================================= */

const appearElements = document.querySelectorAll(".appear");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.09
    }
  );

  appearElements.forEach(element => {
    observer.observe(element);
  });

} else {
  appearElements.forEach(element => {
    element.classList.add("in");
  });
}


/* =========================================
   06 — 双层磨砂玻璃错位揭幕动画
   ========================================= */

(() => {

  const hero = document.querySelector(".s5-center-hero");
  const titleGlass = document.querySelector(".s5-glass-title");
  const infoGlass = document.querySelector(".s5-glass-info");

  if (!hero || !titleGlass || !infoGlass) return;

  const heroSection =
    hero.closest(".section.hero") || hero;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const clamp = (value, min = 0, max = 1) => {
    return Math.max(min, Math.min(max, value));
  };

  // 平滑过渡曲线
  function smoothstep(value) {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  }

  // 每个动作独立设置开始和结束时间
  function phase(progress, start, end) {
    return smoothstep(
      (progress - start) / (end - start)
    );
  }

  let ticking = false;

  /* 还原玻璃初始状态 */

  function resetGlass() {

    hero.style.setProperty("--s5-title-y", "0px");
    hero.style.setProperty("--s5-info-y", "0px");

    hero.style.setProperty("--s5-title-scale", "1");
    hero.style.setProperty("--s5-info-scale", "1");

    hero.style.setProperty("--s5-title-opacity", "1");
    hero.style.setProperty("--s5-info-opacity", "1");

    hero.style.setProperty("--s5-title-blur", "0px");
    hero.style.setProperty("--s5-info-blur", "0px");

    hero.style.setProperty("--s5-glass-opacity", "1");
  }

  /* 根据滚动计算动画进度 */

  function getProgress() {

    const rect = heroSection.getBoundingClientRect();

    // 以整个首页进入浏览器顶部为起点
    const scrollPosition = Math.max(0, -rect.top);

    // 避免首页高度接近一屏时，除数只有 1px
    const duration = Math.max(
      window.innerHeight * 0.95,
      500
    );

    return clamp(scrollPosition / duration);
  }

  /* 核心动画 */

  function updateGlass() {

    ticking = false;

    if (reducedMotion.matches) {
      resetGlass();
      return;
    }

    const progress = getProgress();

    /*
      阶段 A：0%—28%
      两块玻璃开始靠拢
    */

    const merge = phase(progress, 0.02, 0.28);

    /*
      阶段 B：18%—57%
      第一层先离开
    */

    const titleExit = phase(progress, 0.18, 0.57);

    /*
      阶段 C：34%—82%
      第二层延迟离开
    */

    const infoExit = phase(progress, 0.34, 0.82);

    /*
      第一层玻璃的位移
    */

    const titleY =
      -25 * merge -
      310 * titleExit;

    /*
      第二层玻璃移动得更晚
      先靠近上层，再向上离开
    */

    const infoY =
      -85 * merge -
      380 * infoExit;

    /*
      两块玻璃不同的缩放
    */

    const titleScale =
      1 - 0.035 * titleExit;

    const infoScale =
      1 - 0.055 * infoExit;

    /*
      透明度错开

      上层：36%—60% 消失
      下层：58%—84% 消失
    */

    const titleOpacity =
      1 - phase(progress, 0.36, 0.60);

    const infoOpacity =
      1 - phase(progress, 0.58, 0.84);

    /*
      上层先产生弥散模糊
      下层稍后再模糊
    */

    const titleBlur =
      14 * phase(progress, 0.25, 0.58);

    const infoBlur =
      20 * phase(progress, 0.51, 0.82);

    /*
      将数值传给 CSS
    */

    hero.style.setProperty(
      "--s5-title-y",
      `${titleY.toFixed(2)}px`
    );

    hero.style.setProperty(
      "--s5-info-y",
      `${infoY.toFixed(2)}px`
    );

    hero.style.setProperty(
      "--s5-title-scale",
      String(titleScale)
    );

    hero.style.setProperty(
      "--s5-info-scale",
      String(infoScale)
    );

    hero.style.setProperty(
      "--s5-title-opacity",
      String(titleOpacity)
    );

    hero.style.setProperty(
      "--s5-info-opacity",
      String(infoOpacity)
    );

    hero.style.setProperty(
      "--s5-title-blur",
      `${titleBlur.toFixed(2)}px`
    );

    hero.style.setProperty(
      "--s5-info-blur",
      `${infoBlur.toFixed(2)}px`
    );

  }

  /* 避免滚动事件过度执行 */

  function requestUpdate() {

    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(updateGlass);
  }

  window.addEventListener(
    "scroll",
    requestUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestUpdate
  );

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener(
      "change",
      requestUpdate
    );
  }

  // 首次加载时执行
  updateGlass();

})();


/* =========================================
   07 — THE CHALLENGE
   Scroll Text Reveal & Fade Out
   ========================================= */

(() => {
  const section = document.querySelector(".section.risk");

  if (!section) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const clamp = (value, min = 0, max = 1) =>
    Math.max(min, Math.min(max, value));

  const smooth = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  const candidates = [
    ".risk h1, .risk h2",
    ".risk .stats",
    ".risk .stat",
    ".risk .risk-question"
  ];

  let elements = [];

  candidates.forEach(selector => {
    section.querySelectorAll(selector).forEach(element => {
      if (!elements.includes(element)) {
        elements.push(element);
      }
    });
  });

  // 如果已有精确类名，优先按原本布局分组
  if (!elements.length) {
    const inner = section.querySelector(".section-inner");

    if (inner) {
      elements = Array.from(inner.children).filter(
        element => !element.classList.contains("risk-background")
      );
    }
  }

  if (!elements.length) return;

  elements.forEach((element, index) => {
    element.classList.add("risk-motion-item");

    if (index === 0) {
      element.classList.add("risk-motion-title");
    }
  });

  let ticking = false;

  function updateRisk() {
    ticking = false;

    if (prefersReducedMotion.matches) {
      elements.forEach(element => {
        element.style.setProperty("--risk-enter", "1");
        element.style.setProperty("--risk-exit", "0");
      });
      return;
    }

    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight;

    // 整个第二屏从下方进入到上方离开
    const progress = clamp(
      (viewport - rect.top) / (viewport + rect.height)
    );

    elements.forEach((element, index) => {
      // 标题最先，数字稍后，问题最后
      const delay = Math.min(index * 0.065, 0.25);

      const enter = smooth(
        (progress - 0.08 - delay) / 0.18
      );

      const exit = smooth(
        (progress - 0.70 - delay * 0.15) / 0.19
      );

      element.style.setProperty("--risk-enter", enter);
      element.style.setProperty("--risk-exit", exit);
    });
  }

  function requestRiskUpdate() {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(updateRisk);
  }

  window.addEventListener("scroll", requestRiskUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestRiskUpdate);

  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener(
      "change",
      requestRiskUpdate
    );
  }

  updateRisk();
})();


/* =========================================
   SECTION 03 — THREE WAYS REVEAL
   ========================================= */

(() => {
  const section = document.querySelector(".three-ways");
  if (!section) return;

  const cards = section.querySelectorAll(".way-card");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (reducedMotion.matches) {
    section.classList.add("in");
    return;
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.add("in");
          observer.unobserve(section);
        }
      });
    }, {
      threshold: 0.18
    });

    observer.observe(section);
  } else {
    section.classList.add("in");
  }
})();
