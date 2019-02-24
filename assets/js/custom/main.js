import $ from "jquery";
import 'slick-carousel';

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

    for(let i = 0; i < dots.length; i++) {
        dots[i].style.background = 'url(' + reviewsAvatars[i] + ')';
        dots[i].style.backgroundSize = 'cover';
    }

});

$('#reviewsSlider').slick({
    dots: true,
    arrows: false
});