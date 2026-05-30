import { pripraviZemljevid } from './map.js';

export function initNavbar(onHomeActive) {
    const navLinks = document.querySelectorAll('.nav-link');
    const homeView = document.getElementById('home-view');
    const mapView = document.getElementById('map-view');
    const placeholderView = document.getElementById('placeholder-view');
    const placeholderTitle = document.getElementById('placeholder-title');
    const profileView = document.getElementById('profile-view');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetPageId = link.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            if (homeView) homeView.hidden = true;
            if (mapView) mapView.hidden = true;
            if (placeholderView) placeholderView.hidden = true;
            if (profileView) profileView.hidden = true;

            if (targetPageId === 'home-view') {
                if (homeView) homeView.hidden = false;
                if (typeof onHomeActive === 'function') onHomeActive();
            }
            else if (targetPageId === 'map-view') {
                if (mapView) {
                    mapView.hidden = false;
                    pripraviZemljevid();
                }
            }
            else if (targetPageId === 'profile-view') {
                if (profileView) {
                    profileView.hidden = false;
                }
            }
            else {
                if (placeholderView) {
                    placeholderView.hidden = false;
                    if (placeholderTitle) {
                        placeholderTitle.textContent = link.textContent;
                    }
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
    const mapView = document.getElementById('map-view');
    const placeholderView = document.getElementById('placeholder-view');

    if (homeView) homeView.hidden = false;
    if (mapView) mapView.hidden = true;
    if (placeholderView) placeholderView.hidden = true;
    if (profileView) profileView.hidden = true;
}