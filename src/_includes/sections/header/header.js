$('.nav__menu-toggler').click(toggleMenu);

function toggleMenu() {
    $('.nav__menu').animate({width: 'toggle'});
    $('.nav__menu-list, .nav__menu-toggler').fadeToggle();
}