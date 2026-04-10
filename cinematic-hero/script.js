gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d");

const frameCount = 160;
// We load from relative path matching the folder structure
const currentFrame = index => (
  `../ezgif-3294e58f5132a39b-jpg/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const state = {
  frame: 0
};

// Canvas sizing and drawing
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render();
}

window.addEventListener("resize", resizeCanvas);

function render() {
  if (images[state.frame]) {
    const img = images[state.frame];
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    // Equivalent to CSS object-fit: cover
    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      drawHeight = canvas.height;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Draw with slight smoothing applied
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }
}

// Preload Images
let loadedImages = 0;
const loader = document.getElementById("loader");
const progressText = document.getElementById("progress");

for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  img.onload = () => {
    images[i] = img;
    loadedImages++;
    const progress = Math.floor((loadedImages / frameCount) * 100);
    progressText.innerText = progress;
    
    if (loadedImages === 1) { // When first frame loads
      resizeCanvas();
    }
    
    // When all frames are loaded
    if (loadedImages === frameCount) {
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
          onComplete: () => {
            loader.style.display = "none";
            initAnimations();
          }
        });
      }, 500); // short delay to ensure rendering
    }
  };
  
  img.onerror = () => {
    console.error("Failed to load frame:", i);
    // Even if one fails, we should still increment to avoid infinite load
    loadedImages++;
    if (loadedImages === frameCount) {
      loader.style.display = "none";
      initAnimations();
    }
  }
}

function initAnimations() {
  // 1. Scroll control for Canvas sequence
  // We attach a ScrollTrigger to body since canvas is fixed
  gsap.to(state, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom", 
      scrub: 1.5, // 1.5 sec smoothing
      onUpdate: () => {
         requestAnimationFrame(render);
      }
    }
  });

  // 2. Animate What We Do section
  gsap.fromTo(".wwd-title", 
    { opacity: 0, y: 50 },
    {
      opacity: 1, 
      y: 0, 
      duration: 1.2, 
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".wwd-content",
        start: "top 80%"
      }
    }
  );

  gsap.fromTo(".wwd-text", 
    { opacity: 0, y: 60 },
    {
      opacity: 1, 
      y: 0, 
      duration: 1.5, 
      delay: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".wwd-content",
        start: "top 80%"
      }
    }
  );

  // 3. Animate Infographic Blocks
  const infoBlocks = document.querySelectorAll(".info-block");
  infoBlocks.forEach(block => {
    gsap.to(block, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: block,
        start: "top 85%",
        toggleActions: "play reverse play reverse"
      }
    });
  });
}

// Reusable function to initialize additional canvas sequences
function setupSequence(canvasId, triggerId, folderName, frameCount) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const context = canvas.getContext("2d");
  
  const currentFrame = index => `../${folderName}/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;
  const seqImages = [];
  const state = { frame: 0 };
  
  function render() {
    if (seqImages[state.frame]) {
      const img = seqImages[state.frame];
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
  }
  window.addEventListener("resize", resizeCanvas);
  
  // Quick Preload for these sections 
  // (We don't block the main loader for these, they load in background to save time)
  let loadedCount = 0;
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
      seqImages[i] = img;
      loadedCount++;
      if (loadedCount === 1) resizeCanvas();
      if (loadedCount === frameCount) initScroll();
    };
    img.onerror = () => { 
      loadedCount++; 
      if(loadedCount === frameCount) initScroll(); 
    };
  }

  function initScroll() {
    // Pin and Scrub for the specific device section
    gsap.to(state, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: document.getElementById(triggerId),
        start: "top top",
        end: "+=300%", // 3 screens height scrub distance
        scrub: 1.5,
        pin: document.querySelector(`#${triggerId} .canvas-pin-container`),
        onUpdate: () => requestAnimationFrame(render)
      }
    });

    // Fade in info panels with elegant slide
    const info = document.querySelector(`#${triggerId} .device-info`);
    if (info) {
      const isCenter = info.classList.contains("center-top");
      
      // Set initial state based on position alignment
      if (isCenter) {
        gsap.set(info, { xPercent: -50, y: 50, opacity: 0 });
      } else {
        gsap.set(info, { yPercent: -50, y: 50, opacity: 0 });
      }

      gsap.to(info, {
        scrollTrigger: {
          trigger: document.getElementById(triggerId),
          start: "top 30%", 
          end: "+=350%",
          toggleActions: "play reverse play reverse",
        },
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out"
      });
    }
  }
}

// Initialize the 3 new device showcases
setupSequence("canvas-device-1", "device-1", "ezgif-39f6f3df531d3bb1-jpg", 120);
setupSequence("canvas-device-2", "device-2", "ezgif-3d1b694aeb5bf73f-jpg", 120);
setupSequence("canvas-device-3", "device-3", "ezgif-2d61662465888109-jpg", 120);
