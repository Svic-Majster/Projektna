export function initNavbar(onHomeActive) {
    const navLinks = document.querySelectorAll('.nav-link');
    const homeView = document.getElementById('home-view');
    const placeholderView = document.getElementById('placeholder-view');
    const placeholderTitle = document.getElementById('placeholder-title');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetPageId = link.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            if (targetPageId === 'home-view') {
                if (placeholderView) placeholderView.hidden = true;
                if (homeView) homeView.hidden = false;
                
                if (typeof onHomeActive === 'function') {
                    onHomeActive();
                }
            } else {
                if (homeView) homeView.hidden = true;
                if (placeholderView) {
                    placeholderView.hidden = false;
                    if (placeholderTitle) placeholderTitle.textContent = link.textContent;
                }
            }
        });
    });
}

export function resetNavbar() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));
    
    const homeBtn = document.querySelector('[data-target="home-view"]');
    if (homeBtn) homeBtn.classList.add('active');

    const homeView = document.getElementById('home-view');
    const placeholderView = document.getElementById('placeholder-view');
    
    if (homeView) homeView.hidden = false;
    if (placeholderView) placeholderView.hidden = true;
}