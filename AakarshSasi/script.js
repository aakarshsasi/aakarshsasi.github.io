document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Typing Effect ---
    const typingElement = document.querySelector('.typing-text');
    const roles = ["Mobile", "UI/UX", "Seamless", "Swift"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeRoles() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 150;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        setTimeout(typeRoles, typeSpeed);
    }
    typeRoles();


    // --- 2. 3D Tilt Effect ---
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (max 15deg)
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
    });


    // --- 3. Scroll Reveal & Counter Animation ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');

                // Trigger Count Up if it's a number
                if (entry.target.classList.contains('count-up')) {
                    animateValue(entry.target, 0, parseFloat(entry.target.dataset.target), 2000);
                    observer.unobserve(entry.target); // Run once
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.tilt-card, .stat-number').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = progress * (end - start) + start;

            // Format floats vs ints
            if (end % 1 !== 0) {
                obj.innerHTML = value.toFixed(2);
            } else {
                obj.innerHTML = Math.floor(value);
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end; // Ensure final value
            }
        };
        window.requestAnimationFrame(step);
    }


    // --- 4. Particle Canvas Background ---
    const canvas = document.getElementById('canvas-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.color = `rgba(100, 255, 218, ${Math.random() * 0.5})`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 255, 218, ${0.1 - distance / 1500})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // --- 5. PDF Modal Logic ---
    const modal = document.getElementById("pdf-modal");
    const pdfFrame = document.getElementById("pdf-frame");
    const btns = document.querySelectorAll(".view-pdf-btn");
    const span = document.getElementsByClassName("close-modal")[0];

    if (modal && btns.length > 0) {
        btns.forEach(btn => {
            btn.addEventListener("click", function (e) {
                e.preventDefault(); // Stop scrolling to top
                const pdfSrc = this.getAttribute("data-pdf");
                pdfFrame.src = pdfSrc;
                modal.style.display = "block";

                setTimeout(() => modal.classList.add("show"), 10);
                document.body.style.overflow = "hidden";
            });
        });

        function closeModal() {
            modal.classList.remove("show");
            setTimeout(() => {
                modal.style.display = "none";
                pdfFrame.src = "";
                document.body.style.overflow = "auto";
            }, 300);
        }

        if (span) span.onclick = closeModal;

        window.onclick = function (event) {
            if (event.target == modal) {
                closeModal();
            }
        }
    }


    // --- 6. Lightbox Gallery ---
    const lightboxModal = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeLightbox = document.querySelector(".close-lightbox.close-lightbox"); // Adjusted selector to be specific if needed, but class is sufficient
    const lightboxCloseBtn = document.querySelector("#lightbox-modal .close-modal"); // Fallback

    const wwdcCard = document.getElementById("wwdc-card");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    const galleryImages = [
        "AakarshSasi/wwdc_1.jpeg",
        "AakarshSasi/wwdc_2.jpeg"
    ];
    let currentImageIndex = 0;

    function openLightbox(index) {
        currentImageIndex = index;
        lightboxImg.src = galleryImages[currentImageIndex];
        lightboxModal.style.display = "flex"; // Flex to center
        setTimeout(() => lightboxModal.classList.add("show"), 10);
        document.body.style.overflow = "hidden";
    }

    function closeGallery() {
        lightboxModal.classList.remove("show");
        setTimeout(() => {
            lightboxModal.style.display = "none";
            document.body.style.overflow = "auto";
        }, 300);
    }

    function showNext() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        lightboxImg.src = galleryImages[currentImageIndex];
    }

    function showPrev() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentImageIndex];
    }

    if (wwdcCard) {
        wwdcCard.addEventListener("click", () => {
            console.log("WWDC Card Clicked"); // Debug
            openLightbox(0);
        });
        wwdcCard.style.cursor = "pointer"; // Ensure pointer cursor
    }

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeGallery);
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showNext(); });
    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showPrev(); });

    // Close on background click
    window.addEventListener("click", (e) => {
        if (e.target === lightboxModal) {
            closeGallery();
        }
    });

    // Footer Year
    document.getElementById('year').textContent = new Date().getFullYear();
});
