document.addEventListener("DOMContentLoaded", () => {
    
    const slides = document.querySelectorAll('.slide');
    const swipeIndicator = document.getElementById("swipe-indicator");
    const bgMusic = document.getElementById("bg-music");
    const sfx = document.getElementById("transition-sfx");
    const musicControl = document.getElementById("music-control");
    
    let currentSlideIndex = 0;
    const totalSlides = slides.length;
    let isMusicPlaying = false;
    let petalsStarted = false;

    // ==========================================
    // Slide Navigation Logic
    // ==========================================
    window.nextSlide = function(isGlobal = false) {
        if (currentSlideIndex >= totalSlides - 1) return;

        // Play subtle swoosh effect
        sfx.volume = 0.2;
        sfx.currentTime = 0;
        sfx.play().catch(e => console.log("SFX play prevented", e));

        // Start music on first interaction if not playing
        if (currentSlideIndex === 0 && !isMusicPlaying) {
            bgMusic.volume = 0.4;
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                updateMusicIcon();
            }).catch(e => console.log("Autoplay prevented", e));
        }
        
        // Start petals
        if (!petalsStarted) {
             startPetals();
             petalsStarted = true;
        }

        // Transition classes
        slides[currentSlideIndex].classList.remove('active');
        slides[currentSlideIndex].classList.add('passed');
        
        currentSlideIndex++;
        
        slides[currentSlideIndex].classList.add('active');

        // Manage UI elements based on slide
        if (currentSlideIndex > 0) {
            musicControl.classList.remove('hidden');
        }

        if (currentSlideIndex > 0 && currentSlideIndex < totalSlides - 1) {
            // Delay showing global swipe indicator to allow scene animation
            swipeIndicator.classList.add('hidden');
            setTimeout(() => {
                swipeIndicator.classList.remove('hidden');
            }, 2000); 
        } else {
            swipeIndicator.classList.add('hidden'); // hide on last vidai screen
        }
    }

    window.prevSlide = function() {
        if (currentSlideIndex <= 0) return;

        // Play subtle swoosh effect
        sfx.volume = 0.2;
        sfx.currentTime = 0;
        sfx.play().catch(e => console.log("SFX play prevented", e));

        slides[currentSlideIndex].classList.remove('active');
        
        currentSlideIndex--;
        
        slides[currentSlideIndex].classList.remove('passed');
        slides[currentSlideIndex].classList.add('active');

        // Manage UI elements based on slide
        if (currentSlideIndex > 0 && currentSlideIndex < totalSlides - 1) {
            swipeIndicator.classList.add('hidden');
            setTimeout(() => {
                swipeIndicator.classList.remove('hidden');
            }, 2000); 
        } else {
            swipeIndicator.classList.add('hidden');
        }
    }

    // Swipe logic for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swiped left (go to next)
            nextSlide(true);
        } else if (touchEndX > touchStartX + 50) {
            // Swiped right (go back)
            prevSlide();
        }
    }

    // ==========================================
    // Audio Control
    // ==========================================
    musicControl.addEventListener("click", () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            isMusicPlaying = false;
        } else {
            bgMusic.play();
            isMusicPlaying = true;
        }
        updateMusicIcon();
    });

    function updateMusicIcon() {
        if (isMusicPlaying) {
            musicControl.classList.remove("muted");
            musicControl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
        } else {
            musicControl.classList.add("muted");
            musicControl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
        }
    }

    // ==========================================
    // Falling Petals Canvas Animation 
    // ==========================================
    function startPetals() {
        const canvas = document.getElementById("petals-canvas");
        const ctx = canvas.getContext("2d");
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const petals = [];
        const petalCount = window.innerWidth > 768 ? 30 : 15; 

        for (let i = 0; i < petalCount; i++) {
            petals.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 5,
                speedY: Math.random() * 1 + 0.5,
                speedX: (Math.random() - 0.5) * 1,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 5,
                opacity: Math.random() * 0.5 + 0.3
            });
        }

        function drawPetal(p) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = p.opacity;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(p.size, p.size * 0.5, p.size, p.size);
            ctx.quadraticCurveTo(0, p.size * 1.5, -p.size, p.size);
            ctx.quadraticCurveTo(-p.size, p.size * 0.5, 0, 0);
            ctx.fillStyle = "#D66B6B";
            ctx.fill();
            
            ctx.restore();
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            petals.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;
                p.x += Math.sin(p.y * 0.01) * 0.5;

                drawPetal(p);

                if (p.y > canvas.height + p.size) {
                    p.y = -p.size;
                    p.x = Math.random() * canvas.width;
                }
            });

            requestAnimationFrame(animate);
        }

        animate();
    }
});

function openMap() {
    window.open("https://maps.google.com/?q=Tathastu+Farms+Hazaribag", "_blank");
}
