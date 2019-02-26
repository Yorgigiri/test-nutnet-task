import $ from "jquery";
import 'slick-carousel';
import 'magnific-popup';

const reviewsAvatars = getReviewsAvatars();

function getReviewsAvatars() {

    const reviewsImagesData = [];

    let slideFind = document.querySelectorAll('.reviews-slide');

    for (let i = 0; i < slideFind.length; i++) {
        let avatarData = slideFind[i].attributes['data-avatar'].nodeValue;

        reviewsImagesData.push(avatarData);
    }

    return reviewsImagesData;

}

$('#reviewsSlider').on('init', function (event, slick) {

    let dots = document.querySelector('.slick-dots').children;

    for (let i = 0; i < dots.length; i++) {
        dots[i].style.background = 'url(' + reviewsAvatars[i] + ')';
        dots[i].style.backgroundSize = 'cover';
    }

});

$('#reviewsSlider').slick({
    dots: true,
    arrows: false,
    responsive: [
        {
            breakpoint: 767,
            settings: {
                dots: true,
                adaptiveHeight: true
            }
        }
    ]
});

$(document).ready(function () {
    $('#openTrueDetective').magnificPopup({
        type: 'iframe',
        removalDelay: 160,
        preloader: false,

        fixedContentPos: true,
        callbacks: {
            beforeOpen: function () {
                this.st.mainClass = this.st.el.attr('data-effect');
            }
        },
        zoom: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out'
        }
    });
});

$('.header-menu__hamburger').on('click', function () {
    $('.header-menu').toggleClass('header-menu_toggled');
    $(this).toggleClass('header-menu__hamburger_menuIsVisible');
});