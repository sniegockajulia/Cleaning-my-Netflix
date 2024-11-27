
/**
 * Navigation.js
 * Este archivo gestiona la navegación entre las secciones de la aplicación.
 */

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a');
    const sections = document.querySelectorAll('section');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            sections.forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });
        });
    });
});

// Inicialización: mostrar solo la primera sección.
document.querySelectorAll('section').forEach((section, index) => {
    section.style.display = index === 0 ? 'block' : 'none';
});
