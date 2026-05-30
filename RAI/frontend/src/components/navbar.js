import { pripraviZemljevid } from './map.js';

export function initNavbar(onNavigate) {
    const navLinks = document.querySelectorAll('.nav-link');
    const allViews = document.querySelectorAll('.app-page');
    const placeholderView = document.getElementById('placeholder-view');
    const placeholderTitle = document.getElementById('placeholder-title');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetPageId = link.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            allViews.forEach(view => view.hidden = true);

            const targetView = document.getElementById(targetPageId);

            if (targetPageId === 'home-view') {
                if (targetView) targetView.hidden = false;
                if (typeof onNavigate === 'function') onNavigate('home-view');
            } 
            else if (targetPageId === 'map-view') {
                if (targetView) {
                    targetView.hidden = false;
                    pripraviZemljevid();
                }
            } 
            else if (targetPageId === 'group-view') {
                if (targetView) {
                    targetView.hidden = false;
                    if (typeof onNavigate === 'function') onNavigate('group-view');
                }
            }
            else if (targetPageId === 'settings-view') {
                if (targetView) {
                    targetView.hidden = false;
                }
            }
            else {
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
    const allViews = document.querySelectorAll('.app-page');
    
    navLinks.forEach(l => l.classList.remove('active'));
    
    const homeBtn = document.querySelector('[data-target="home-view"]');
    if (homeBtn) homeBtn.classList.add('active');

    allViews.forEach(view => view.hidden = true);
    const homeView = document.getElementById('home-view');
    if (homeView) homeView.hidden = false;
}