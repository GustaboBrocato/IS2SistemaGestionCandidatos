document.addEventListener("DOMContentLoaded", function() {
    const benefitCards = document.querySelectorAll(".benefit-card");

    benefitCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = "translateY(0)";
            card.style.opacity = "1";
        }, index * 100); // Delay en cascada
    });
});
