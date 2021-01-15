const backendlessData = 'https://eu-api.backendless.com/5F6A009C-1855-EFDF-FFE2-96F28DEDFE00/26F027FA-9F8F-43DA-829C-5CC66E01CDD8/data/';
const slideTitleIcon = '<svg class="slide__title-icon"><use xlink:href="images/sprite/sprite.svg#arrows--arrow-short"></use></svg>';

// загрузить и сгенерировать табы-слайдеры
$(document).ready(() => {
    $.get(backendlessData + 'guidelines_slides?loadRelations=category')
        .then(res => {
            if (Array.isArray(res) && res.length) {
                createTabs(res);
            }
        })
        .then(activateFirstTab);
});

// изменения слайдера при свернутой секции
$(`.section__toggler`).click(reslickActiveSlider);


// ФУНКЦИИ
function createTabs(slides) {
    let categoriesIds = [];

    slides.forEach(slide => {
        if (!categoriesIds.length) {
            $('<ul>', {
                class: 'tabs__categories-list',
            }).appendTo('.tabs');
        }
        if (!categoriesIds.includes(slide.category.objectId)) {
            categoriesIds.push(slide.category.objectId);
            createTab(slide.category);
        }
        createSlide(slide);
    });
}

function createTab(category) {
    $('<li>', {
        class: 'tabs__category',
        'data-category-id': category.objectId,
        title: category.name,
        click: activateChoosenTab,
    }).text(category.name).appendTo('.tabs__categories-list');
    $('<div>', {
        class: 'tabs__slides-list',
        'data-category-id': category.objectId,
    }).appendTo('.tabs');
}

function createSlide(slide) {
    const $slideLink = $('<a>', {
        class: 'slide__link',
        href: slide.link,
    }).appendTo(`.tabs__slides-list[data-category-id=${slide.category.objectId}]`);
    $('<img>', {
        class: 'slide__img',
        src: 'images/tabs/' + slide.img,
        alt: slide.alt || 'Slide Image',
    }).appendTo($slideLink);
    $('<span>', {
        class: 'slide__title',
    }).html(slide.title + slideTitleIcon).appendTo($slideLink);
}

function activateFirstTab() {
    const firstCategoryId = $('.tabs__category').first().data('category-id');
    activateTabsList(firstCategoryId);
}

function activateChoosenTab(e) {
    const choosenCategoryId = $(e.target).data('category-id');
    activateTabsList(choosenCategoryId);
}

function activateTabsList(categoryId) {
    $('.tabs__category').removeClass('tabs__category_active');
    $(`.tabs__category[data-category-id=${categoryId}]`).addClass('tabs__category_active');

    $('.tabs__slides-list').removeClass('tabs__slides-list_active');
    $('.slick-slider').slick('unslick');
    $(`.tabs__slides-list[data-category-id=${categoryId}]`)
        .addClass('tabs__slides-list_active')
        .not('.slick-slider')
        .slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: true,
            prevArrow: '<svg class="slick-prev"><use xlink:href="images/sprite/sprite.svg#arrows--arrow-short"></use></svg>',
            nextArrow: '<svg class="slick-next"><use xlink:href="images/sprite/sprite.svg#arrows--arrow-short"></use></svg>',
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {slidesToShow: 2},
                },
                {
                    breakpoint: 640,
                    settings: {slidesToShow: 1},
                },
            ],
        });
}

function reslickActiveSlider(e) {
    const $section = $(e.target).closest('.secondary-section');
    if (
        $section.find('.slick-slider').length > 0 &&
        $section.hasClass('secondary-section_closed')
    ) {
        const $activeSlider = $section.find('.tabs__slides-list_active');
        $activeSlider.slick('unslick');
        activateTabsList($activeSlider.data('category-id'));
    }
}