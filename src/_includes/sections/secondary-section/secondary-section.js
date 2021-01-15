$(`.section__toggler`).click(toggleSection);

function toggleSection(e) {
    const $section = $(e.target).closest('.secondary-section');

    $section.toggleClass('secondary-section_closed');
    $section.find('.secondary__text').slideToggle();
    $section.find('.secondary__content').slideToggle();
}