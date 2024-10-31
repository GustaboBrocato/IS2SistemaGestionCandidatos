document.addEventListener("DOMContentLoaded", function() {
    const benefitCards = document.querySelectorAll(".benefit-card");

    benefitCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = "translateY(0)";
            card.style.opacity = "1";
        }, index * 100); // Delay en cascada
    });
});

function openVacancyDetail(card) {
    const modal = document.getElementById('vacancyModal');
    const title = card.querySelector('h3').innerText;
    const thumbnail = card.querySelector('.vacancy-thumbnail').src;
    const description = card.querySelector('p').innerText;
    const requirements = Array.from(card.querySelectorAll('.vacancy-requirements li')).map(item => item.innerText);

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-thumbnail').src = thumbnail;
    document.getElementById('modal-description').innerText = description;
    
    const requirementsList = document.getElementById('modal-requirements');
    requirementsList.innerHTML = '';
    requirements.forEach(req => {
        const li = document.createElement('li');
        li.innerText = req;
        requirementsList.appendChild(li);
    });

    modal.style.display = 'flex';
}

function closeVacancyDetail() {
    document.getElementById('vacancyModal').style.display = 'none';
}

function redirectToApply() {
    alert('Redirecting to apply/signup page.');
}

