ScrollReveal().reveal('.wrapper', {
    distance: '0rem',
    duration: 2000,
});

ScrollReveal().reveal('.primary__content, .secondary__content', {
    origin: 'bottom',
    distance: '10rem',
    duration: 1000,
});

$(`.section__toggler`).click(() => {
    ScrollReveal().destroy();
});