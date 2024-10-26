let currentIndex = 0;
const items = document.querySelectorAll('.carousel-item');
items[currentIndex].style.display = 'block';

function showDescription(index) {
    const description = items[index].querySelector('.description');
    description.style.display = description.style.display === 'none' || description.style.display === '' ? 'block' : 'none';
}

function nextSlide() {
    items[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + 1) % items.length;
    items[currentIndex].style.display = 'block';
}

function prevSlide() {
    items[currentIndex].style.display = 'none';
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    items[currentIndex].style.display = 'block';
}
