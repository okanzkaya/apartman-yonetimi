document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');

    // Sayfa kaydırıldığında header'a gölge ve arkaplan ekleyen logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});