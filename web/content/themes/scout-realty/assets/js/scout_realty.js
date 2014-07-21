/*! Scout Realty - v0.1.0 - 2014-07-21
 * http://scoutrealty.com
 * Copyright (c) 2014; */
/* global window, document, define, jQuery, setInterval, clearInterval */

(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
                responsiveSettings, breakpoint;

            _.defaults = {
                accessibility: true,
                arrows: true,
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return '<button type="button">' + (i + 1) + '</button>';
                },
                dots: false,
                draggable: true,
                easing: 'linear',
                fade: false,
                infinite: true,
                lazyLoad: 'ondemand',
                onBeforeChange: null,
                onAfterChange: null,
                onInit: null,
                onReInit: null,
                pauseOnHover: true,
                responsive: null,
                slide: 'div',
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 300,
                swipe: true,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                vertical: false
            };

            _.initials = {
                animating: false,
                autoPlayTimer: null,
                currentSlide: 0,
                currentLeft: null,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.paused = false;
            _.positionProp = null;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.windowWidth = 0;
            _.windowTimer = null;

            _.options = $.extend({}, _.defaults, settings);

            _.originalSettings = _.options;
            responsiveSettings = _.options.responsive || null;

            if (responsiveSettings && responsiveSettings.length > -1) {
                for (breakpoint in responsiveSettings) {
                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        _.breakpoints.push(responsiveSettings[
                            breakpoint].breakpoint);
                        _.breakpointSettings[responsiveSettings[
                            breakpoint].breakpoint] =
                            responsiveSettings[breakpoint].settings;
                    }
                }
                _.breakpoints.sort(function(a, b) {
                    return b - a;
                });
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

            _.instanceUid = instanceUid++;

            _.init();

        }

        return Slick;

    }());

    Slick.prototype.addSlide = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).remove();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateSlide = function(targetLeft,
        callback) {

        var animProps = {}, _ = this;

        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {

                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator,
                _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this;

        if (_.options.infinite === false) {

            if (_.direction === 1) {

                if ((_.currentSlide + 1) === _.slideCount -
                    1) {
                    _.direction = 0;
                }

                _.slideHandler(_.currentSlide + _.options
                    .slidesToScroll);

            } else {

                if ((_.currentSlide - 1 === 0)) {

                    _.direction = 1;

                }

                _.slideHandler(_.currentSlide - _.options
                    .slidesToScroll);

            }

        } else {

            _.slideHandler(_.currentSlide + _.options.slidesToScroll);

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow = $(
                '<button type="button" class="slick-prev">Previous</button>').appendTo(
                _.$slider);
            _.$nextArrow = $(
                '<button type="button" class="slick-next">Next</button>').appendTo(
                _.$slider);

            if (_.options.infinite !== true) {
                _.$prevArrow.addClass('slick-disabled');
            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dotString;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            dotString = '<ul class="slick-dots">';

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
            }

            dotString += '</ul>';

            _.$dots = $(dotString).appendTo(
                _.$slider);

            _.$dots.find('li').first().addClass(
                'slick-active');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides = _.$slider.children(_.options.slide +
            ':not(.slick-cloned)').addClass(
            'slick-slide');
        _.slideCount = _.$slides.length;
        _.$slidesCache = _.$slides;

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true) {
            _.options.infinite = true;
            _.options.slidesToScroll = 1;
            if (_.options.slidesToShow % 2 === 0) {
                _.options.slidesToShow = 3;
            }
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        if (_.options.accessibility === true) {
            _.$list.prop('tabIndex', 0);
        }

        _.setSlideClasses(0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.checkResponsive = function() {

        var _ = this,
            breakpoint, targetBreakpoint;

        if (_.originalSettings.responsive && _.originalSettings
            .responsive.length > -1 && _.originalSettings.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if ($(window).width() < _.breakpoints[
                        breakpoint]) {
                        targetBreakpoint = _.breakpoints[
                            breakpoint];
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        _.options = $.extend({}, _.defaults,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        _.refresh();
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    _.options = $.extend({}, _.defaults,
                        _.breakpointSettings[
                            targetBreakpoint]);
                    _.refresh();
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = $.extend({}, _.defaults,
                        _.originalSettings);
                    _.refresh();
                }
            }

        }

    };

    Slick.prototype.changeSlide = function(event) {

        var _ = this;

        switch (event.data.message) {

            case 'previous':
                _.slideHandler(_.currentSlide - _.options
                    .slidesToScroll);
                break;

            case 'next':
                _.slideHandler(_.currentSlide + _.options
                    .slidesToScroll);
                break;

            case 'index':
                _.slideHandler($(event.target).parent().index() * _.options.slidesToScroll);
                break;

            default:
                return false;
        }

    };

    Slick.prototype.destroy = function() {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        _.$slides.unwrap().unwrap();
        _.$slides.removeClass(
            'slick-slide slick-active slick-visible').removeAttr('style');
        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');

        _.$list.off('.slick');
        $(window).off('.slick-' + _.instanceUid);
    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = "";

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: 1000
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: 1000
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.filterSlides = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).remove();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.getCurrent = function() {

        var _ = this;

        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this,
            breaker = 0,
            dotCounter = 0,
            dotCount = 0,
            dotLimit;

        dotLimit = _.options.infinite === true ? _.slideCount + _.options.slidesToShow - _.options.slidesToScroll : _.slideCount;

        while (breaker < dotLimit) {
            dotCount++;
            dotCounter += _.options.slidesToScroll;
            breaker = dotCounter + _.options.slidesToShow;
        }

        return dotCount;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight();

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = ((_.slideCount % _.options.slidesToShow) * _.slideWidth) * -1;
                    verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight) * -1;
                }
            }
        } else {
            if (_.slideCount % _.options.slidesToShow !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = (_.options.slidesToShow * _.slideWidth) - ((_.slideCount % _.options.slidesToShow) * _.slideWidth);
                    verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight);
                }
            }
        }

        if (_.options.centerMode === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        return targetLeft;

    };

    Slick.prototype.init = function() {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.checkResponsive();
        }

        if (_.options.onInit !== null) {
            _.options.onInit.call(this, _);
        }

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.on('click.slick', {
                message: 'next'
            }, _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        if (_.options.pauseOnHover === true && _.options.autoplay === true) {
            _.$list.on('mouseenter.slick', _.autoPlayClear);
            _.$list.on('mouseleave.slick', _.autoPlay);
        }

        if(_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler); 
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, function() {
            _.checkResponsive();
            _.setPosition();
        });

        $(window).on('resize.slick.slick-' + _.instanceUid, function() {
            if ($(window).width !== _.windowWidth) {
                clearTimeout(_.windowDelay);
                _.windowDelay = window.setTimeout(function() {
                    _.windowWidth = $(window).width();
                    _.checkResponsive();
                    _.setPosition();
                }, 50);
            }
        });

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

        if (_.options.autoplay === true) {

            _.autoPlay();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;

        if (event.keyCode === 37) {
            _.changeSlide({
                data: {
                    message: 'previous'
                }
            });
        } else if (event.keyCode === 39) {
            _.changeSlide({
                data: {
                    message: 'next'
                }
            });
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        if (_.options.centerMode === true) {
            rangeStart = _.options.slidesToShow + _.currentSlide - 1;
            rangeEnd = rangeStart + _.options.slidesToShow + 2;
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        $('img[data-lazy]', loadRange).not('[src]').each(function() {
            $(this).css({opacity: 0}).attr('src', $(this).attr('data-lazy')).removeClass('slick-loading').load(function(){
                $(this).animate({ opacity: 1 }, 200);
            });
        });

        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            $('img[data-lazy]', cloneRange).not('[src]').each(function() {
                $(this).css({opacity: 0}).attr('src', $(this).attr('data-lazy')).removeClass('slick-loading').load(function(){
                    $(this).animate({ opacity: 1 }, 200);
                });
            });
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            $('img[data-lazy]', cloneRange).not('[src]').each(function() {
                $(this).css({opacity: 0}).attr('src', $(this).attr('data-lazy')).removeClass('slick-loading').load(function(){
                    $(this).animate({ opacity: 1 }, 200);
                });
            });
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if (_.options.onAfterChange !== null) {
            _.options.onAfterChange.call(this, _, index);
        }

        _.animating = false;

        _.setPosition();

        _.swipeLeft = null;

        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }

    };

    Slick.prototype.progressiveLazyLoad = function() {

        var _ = this,
            imgCount, targetImage;

        imgCount = $('img[data-lazy]').not('[src]').length;

        if (imgCount > 0) {
            targetImage = $($('img[data-lazy]', _.$slider).not('[src]').get(0));
            targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function() {
                _.progressiveLazyLoad();
            });
        }

    };

    Slick.prototype.refresh = function() {

        var _ = this;

        _.destroy();

        $.extend(_, _.initials);

        _.init();

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides = _.$slideTrack.children(_.options.slide).addClass(
            'slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        _.setProps();

        _.setupInfinite();

        _.buildArrows();

        _.updateArrows();

        _.initArrowEvents();

        _.buildDots();

        _.updateDots();

        _.initDotEvents();

        _.setSlideClasses(0);

        _.setPosition();

        if (_.options.onReInit !== null) {
            _.options.onReInit.call(this, _);
        }

    };

    Slick.prototype.removeSlide = function(index, removeBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        _.$slideTrack.children(this.options.slide).eq(index).remove();

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).remove();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {}, x, y;

        x = _.positionProp == 'left' ? position + 'px' : '0px';
        y = _.positionProp == 'top' ? position + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.centerMode === true) {
            _.$slideTrack.children('.slick-slide').width(_.slideWidth);
        } else {
            _.$slideTrack.children('.slick-slide').width(_.slideWidth);
        }


        if (_.options.vertical === false) {
            _.$slideTrack.width(Math.ceil((_.slideWidth * _
                .$slideTrack.children('.slick-slide').length)));
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight() * _.options.slidesToShow);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight() * _
                .$slideTrack.children('.slick-slide').length)));
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            $(element).css({
                position: 'relative',
                left: targetLeft,
                top: 0,
                zIndex: 800,
                opacity: 0
            });
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: 900,
            opacity: 1
        });

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setValues();
        _.setDimensions();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

    };

    Slick.prototype.setProps = function() {

        var _ = this;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (document.body.style.WebkitTransition !== undefined ||
            document.body.style.MozTransition !== undefined ||
            document.body.style.msTransition !== undefined) {
            if(_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (document.body.style.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = "-moz-transform";
            _.transitionType = 'MozTransition';
        }
        if (document.body.style.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = "-webkit-transform";
            _.transitionType = 'webkitTransition';
        }
        if (document.body.style.msTransform !== undefined) {
            _.animType = 'transform';
            _.transformType = "transform";
            _.transitionType = 'transition';
        }

        _.transformsEnabled = (_.animType !== null);

    };

    Slick.prototype.setValues = function() {

        var _ = this;

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();
        if(_.options.vertical === false) {
        _.slideWidth = Math.ceil(_.listWidth / _.options
            .slidesToShow);
        } else {
        _.slideWidth = Math.ceil(_.listWidth);
        }

    };

    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset;

        _.$slider.find('.slick-slide').removeClass('slick-active').removeClass('slick-center');
        allSlides = _.$slider.find('.slick-slide');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active');
            } else {
                indexOffset = _.options.slidesToShow + index;
                allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active');
            }

            if (index === 0) {
                allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
            } else if (index === _.slideCount - 1) {
                allSlides.eq(_.options.slidesToShow).addClass('slick-center');
            }

            _.$slides.eq(index).addClass('slick-center');

        } else {

            if (index > 0 && index < (_.slideCount - _.options.slidesToShow)) {
                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active');
            } else {
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active');
            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true || _.options.vertical === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                    infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone().attr('id', '').prependTo(
                        _.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone().attr('id', '').appendTo(
                        _.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.slideHandler = function(index) {

        var targetSlide, animSlide, slideLeft, unevenOffset, targetLeft = null,
            _ = this;

        if (_.animating === true) {
            return false;
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0 ? _.options.slidesToScroll : 0;

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && (index < 0 || index > (_.slideCount - _.options.slidesToShow + unevenOffset))) {
            if(_.options.fade === false) {
                targetSlide = _.currentSlide;
                _.animateSlide(slideLeft, function() {
                    _.postSlide(targetSlide);
                });
            }
            return false;
        }

        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount - _.options.slidesToScroll;
            }
        } else if (targetSlide > (_.slideCount - 1)) {
            animSlide = 0;
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        if (_.options.onBeforeChange !== null && index !== _.currentSlide) {
            _.options.onBeforeChange.call(this, _, _.currentSlide, animSlide);
        }

        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            _.fadeSlide(animSlide, function() {
                _.postSlide(animSlide);
            });
            return false;
        }

        _.animateSlide(targetLeft, function() {
            _.postSlide(animSlide);
        });

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return 'left';
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return 'left';
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return 'right';
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this;

        _.$list.removeClass('dragging');

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
            $(event.target).on('click.slick', function(event) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
                $(event.target).off('click.slick');
            });

            switch (_.swipeDirection()) {
                case 'left':
                    _.slideHandler(_.currentSlide + _.options.slidesToScroll);
                    _.touchObject = {};
                    break;

                case 'right':
                    _.slideHandler(_.currentSlide - _.options.slidesToScroll);
                    _.touchObject = {};
                    break;
            }
        } else {
            if(_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ('ontouchend' in document && _.options.swipe === false) {
            return false;
        } else if (_.options.draggable === false && !event.originalEvent.touches) {
            return true;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            curLeft, swipeDirection, positionOffset, touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        curLeft = _.getLeft(_.currentSlide);

        if (!_.$list.hasClass('dragging') || touches && touches.length !== 1) {
            return false;
        }

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = _.touchObject.curX > _.touchObject.startX ? 1 : -1;

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + _.touchObject.swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (_.touchObject
                .swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.$list.addClass('dragging');

    };

    Slick.prototype.unfilterSlides = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).remove();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        _.$slides.removeClass(
            'slick-slide slick-active slick-visible').removeAttr('style');

    };

    Slick.prototype.updateArrows = function() {

        var _ = this;

        if (_.options.arrows === true && _.options.infinite !==
            true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.removeClass('slick-disabled');
            _.$nextArrow.removeClass('slick-disabled');
            if (_.currentSlide === 0) {
                _.$prevArrow.addClass('slick-disabled');
                _.$nextArrow.removeClass('slick-disabled');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                _.$nextArrow.addClass('slick-disabled');
                _.$prevArrow.removeClass('slick-disabled');
            }
        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots.find('li').removeClass('slick-active');
            _.$dots.find('li').eq(_.currentSlide / _.options.slidesToScroll).addClass(
                'slick-active');

        }

    };

    $.fn.slick = function(options) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick = new Slick(element, options);

        });
    };

    $.fn.slickAdd = function(slide, slideIndex, addBefore) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.addSlide(slide, slideIndex, addBefore);

        });
    };

    $.fn.slickCurrentSlide = function() {
        var _ = this;
        return _.get(0).slick.getCurrent();
    };

    $.fn.slickFilter = function(filter) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.filterSlides(filter);

        });
    };

    $.fn.slickGoTo = function(slide) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.slideHandler(slide);

        });
    };

    $.fn.slickNext = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.changeSlide({
                data: {
                    message: 'next'
                }
            });

        });
    };

    $.fn.slickPause = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.autoPlayClear();
            element.slick.paused = true;

        });
    };

    $.fn.slickPlay = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.paused = false;
            element.slick.autoPlay();

        });
    };

    $.fn.slickPrev = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.changeSlide({
                data: {
                    message: 'previous'
                }
            });

        });
    };

    $.fn.slickRemove = function(slideIndex, removeBefore) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.removeSlide(slideIndex, removeBefore);

        });
    };

    $.fn.slickSetOption = function(option, value, refresh) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.options[option] = value;

            if (refresh === true) {
                element.slick.unload();
                element.slick.reinit();
            }

        });
    };

    $.fn.slickUnfilter = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.unfilterSlides();

        });
    };

    $.fn.unslick = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.destroy();

        });
    };

}));
/*jshint multistr:true browser:true */
/*!
* FitVids 1.0
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
* Date: Thu Sept 01 18:00:00 2011 -0500
*/

(function( $ ){

  "use strict";

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null
    };

    if(!document.getElementById('fit-vids-style')) {

      var div = document.createElement('div'),
          ref = document.getElementsByTagName('base')[0] || document.getElementsByTagName('script')[0],
          cssStyles = '&shy;<style>.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}</style>';

      div.className = 'fit-vids-style';
      div.id = 'fit-vids-style';
      div.style.display = 'none';
      div.innerHTML = cssStyles;

      ref.parentNode.insertBefore(div,ref);

    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src*='player.vimeo.com']",
        "iframe[src*='youtube.com']",
        "iframe[src*='youtube-nocookie.com']",
        "iframe[src*='kickstarter.com'][src*='video.html']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

      $allVideos.each(function(){
        var $this = $(this);
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );

!function(t,e,i){var n=t.L,o={};o.version="0.7.3","object"==typeof module&&"object"==typeof module.exports?module.exports=o:"function"==typeof define&&define.amd&&define(o),o.noConflict=function(){return t.L=n,this},t.L=o,o.Util={extend:function(t){var e,i,n,o,s=Array.prototype.slice.call(arguments,1);for(i=0,n=s.length;n>i;i++){o=s[i]||{};for(e in o)o.hasOwnProperty(e)&&(t[e]=o[e])}return t},bind:function(t,e){var i=arguments.length>2?Array.prototype.slice.call(arguments,2):null;return function(){return t.apply(e,i||arguments)}},stamp:function(){var t=0,e="_leaflet_id";return function(i){return i[e]=i[e]||++t,i[e]}}(),invokeEach:function(t,e,i){var n,o;if("object"==typeof t){o=Array.prototype.slice.call(arguments,3);for(n in t)e.apply(i,[n,t[n]].concat(o));return!0}return!1},limitExecByInterval:function(t,e,i){var n,o;return function s(){var a=arguments;return n?void(o=!0):(n=!0,setTimeout(function(){n=!1,o&&(s.apply(i,a),o=!1)},e),void t.apply(i,a))}},falseFn:function(){return!1},formatNum:function(t,e){var i=Math.pow(10,e||5);return Math.round(t*i)/i},trim:function(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")},splitWords:function(t){return o.Util.trim(t).split(/\s+/)},setOptions:function(t,e){return t.options=o.extend({},t.options,e),t.options},getParamString:function(t,e,i){var n=[];for(var o in t)n.push(encodeURIComponent(i?o.toUpperCase():o)+"="+encodeURIComponent(t[o]));return(e&&-1!==e.indexOf("?")?"&":"?")+n.join("&")},template:function(t,e){return t.replace(/\{ *([\w_]+) *\}/g,function(t,n){var o=e[n];if(o===i)throw new Error("No value provided for variable "+t);return"function"==typeof o&&(o=o(e)),o})},isArray:Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},emptyImageUrl:"data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="},function(){function e(e){var i,n,o=["webkit","moz","o","ms"];for(i=0;i<o.length&&!n;i++)n=t[o[i]+e];return n}function i(e){var i=+new Date,o=Math.max(0,16-(i-n));return n=i+o,t.setTimeout(e,o)}var n=0,s=t.requestAnimationFrame||e("RequestAnimationFrame")||i,a=t.cancelAnimationFrame||e("CancelAnimationFrame")||e("CancelRequestAnimationFrame")||function(e){t.clearTimeout(e)};o.Util.requestAnimFrame=function(e,n,a,r){return e=o.bind(e,n),a&&s===i?void e():s.call(t,e,r)},o.Util.cancelAnimFrame=function(e){e&&a.call(t,e)}}(),o.extend=o.Util.extend,o.bind=o.Util.bind,o.stamp=o.Util.stamp,o.setOptions=o.Util.setOptions,o.Class=function(){},o.Class.extend=function(t){var e=function(){this.initialize&&this.initialize.apply(this,arguments),this._initHooks&&this.callInitHooks()},i=function(){};i.prototype=this.prototype;var n=new i;n.constructor=e,e.prototype=n;for(var s in this)this.hasOwnProperty(s)&&"prototype"!==s&&(e[s]=this[s]);t.statics&&(o.extend(e,t.statics),delete t.statics),t.includes&&(o.Util.extend.apply(null,[n].concat(t.includes)),delete t.includes),t.options&&n.options&&(t.options=o.extend({},n.options,t.options)),o.extend(n,t),n._initHooks=[];var a=this;return e.__super__=a.prototype,n.callInitHooks=function(){if(!this._initHooksCalled){a.prototype.callInitHooks&&a.prototype.callInitHooks.call(this),this._initHooksCalled=!0;for(var t=0,e=n._initHooks.length;e>t;t++)n._initHooks[t].call(this)}},e},o.Class.include=function(t){o.extend(this.prototype,t)},o.Class.mergeOptions=function(t){o.extend(this.prototype.options,t)},o.Class.addInitHook=function(t){var e=Array.prototype.slice.call(arguments,1),i="function"==typeof t?t:function(){this[t].apply(this,e)};this.prototype._initHooks=this.prototype._initHooks||[],this.prototype._initHooks.push(i)};var s="_leaflet_events";o.Mixin={},o.Mixin.Events={addEventListener:function(t,e,i){if(o.Util.invokeEach(t,this.addEventListener,this,e,i))return this;var n,a,r,h,l,u,c,d=this[s]=this[s]||{},p=i&&i!==this&&o.stamp(i);for(t=o.Util.splitWords(t),n=0,a=t.length;a>n;n++)r={action:e,context:i||this},h=t[n],p?(l=h+"_idx",u=l+"_len",c=d[l]=d[l]||{},c[p]||(c[p]=[],d[u]=(d[u]||0)+1),c[p].push(r)):(d[h]=d[h]||[],d[h].push(r));return this},hasEventListeners:function(t){var e=this[s];return!!e&&(t in e&&e[t].length>0||t+"_idx"in e&&e[t+"_idx_len"]>0)},removeEventListener:function(t,e,i){if(!this[s])return this;if(!t)return this.clearAllEventListeners();if(o.Util.invokeEach(t,this.removeEventListener,this,e,i))return this;var n,a,r,h,l,u,c,d,p,_=this[s],m=i&&i!==this&&o.stamp(i);for(t=o.Util.splitWords(t),n=0,a=t.length;a>n;n++)if(r=t[n],u=r+"_idx",c=u+"_len",d=_[u],e){if(h=m&&d?d[m]:_[r]){for(l=h.length-1;l>=0;l--)h[l].action!==e||i&&h[l].context!==i||(p=h.splice(l,1),p[0].action=o.Util.falseFn);i&&d&&0===h.length&&(delete d[m],_[c]--)}}else delete _[r],delete _[u],delete _[c];return this},clearAllEventListeners:function(){return delete this[s],this},fireEvent:function(t,e){if(!this.hasEventListeners(t))return this;var i,n,a,r,h,l=o.Util.extend({},e,{type:t,target:this}),u=this[s];if(u[t])for(i=u[t].slice(),n=0,a=i.length;a>n;n++)i[n].action.call(i[n].context,l);r=u[t+"_idx"];for(h in r)if(i=r[h].slice())for(n=0,a=i.length;a>n;n++)i[n].action.call(i[n].context,l);return this},addOneTimeEventListener:function(t,e,i){if(o.Util.invokeEach(t,this.addOneTimeEventListener,this,e,i))return this;var n=o.bind(function(){this.removeEventListener(t,e,i).removeEventListener(t,n,i)},this);return this.addEventListener(t,e,i).addEventListener(t,n,i)}},o.Mixin.Events.on=o.Mixin.Events.addEventListener,o.Mixin.Events.off=o.Mixin.Events.removeEventListener,o.Mixin.Events.once=o.Mixin.Events.addOneTimeEventListener,o.Mixin.Events.fire=o.Mixin.Events.fireEvent,function(){var n="ActiveXObject"in t,s=n&&!e.addEventListener,a=navigator.userAgent.toLowerCase(),r=-1!==a.indexOf("webkit"),h=-1!==a.indexOf("chrome"),l=-1!==a.indexOf("phantom"),u=-1!==a.indexOf("android"),c=-1!==a.search("android [23]"),d=-1!==a.indexOf("gecko"),p=typeof orientation!=i+"",_=t.navigator&&t.navigator.msPointerEnabled&&t.navigator.msMaxTouchPoints&&!t.PointerEvent,m=t.PointerEvent&&t.navigator.pointerEnabled&&t.navigator.maxTouchPoints||_,f="devicePixelRatio"in t&&t.devicePixelRatio>1||"matchMedia"in t&&t.matchMedia("(min-resolution:144dpi)")&&t.matchMedia("(min-resolution:144dpi)").matches,g=e.documentElement,v=n&&"transition"in g.style,y="WebKitCSSMatrix"in t&&"m11"in new t.WebKitCSSMatrix&&!c,P="MozPerspective"in g.style,L="OTransition"in g.style,x=!t.L_DISABLE_3D&&(v||y||P||L)&&!l,w=!t.L_NO_TOUCH&&!l&&function(){var t="ontouchstart";if(m||t in g)return!0;var i=e.createElement("div"),n=!1;return i.setAttribute?(i.setAttribute(t,"return;"),"function"==typeof i[t]&&(n=!0),i.removeAttribute(t),i=null,n):!1}();o.Browser={ie:n,ielt9:s,webkit:r,gecko:d&&!r&&!t.opera&&!n,android:u,android23:c,chrome:h,ie3d:v,webkit3d:y,gecko3d:P,opera3d:L,any3d:x,mobile:p,mobileWebkit:p&&r,mobileWebkit3d:p&&y,mobileOpera:p&&t.opera,touch:w,msPointer:_,pointer:m,retina:f}}(),o.Point=function(t,e,i){this.x=i?Math.round(t):t,this.y=i?Math.round(e):e},o.Point.prototype={clone:function(){return new o.Point(this.x,this.y)},add:function(t){return this.clone()._add(o.point(t))},_add:function(t){return this.x+=t.x,this.y+=t.y,this},subtract:function(t){return this.clone()._subtract(o.point(t))},_subtract:function(t){return this.x-=t.x,this.y-=t.y,this},divideBy:function(t){return this.clone()._divideBy(t)},_divideBy:function(t){return this.x/=t,this.y/=t,this},multiplyBy:function(t){return this.clone()._multiplyBy(t)},_multiplyBy:function(t){return this.x*=t,this.y*=t,this},round:function(){return this.clone()._round()},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},floor:function(){return this.clone()._floor()},_floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this},distanceTo:function(t){t=o.point(t);var e=t.x-this.x,i=t.y-this.y;return Math.sqrt(e*e+i*i)},equals:function(t){return t=o.point(t),t.x===this.x&&t.y===this.y},contains:function(t){return t=o.point(t),Math.abs(t.x)<=Math.abs(this.x)&&Math.abs(t.y)<=Math.abs(this.y)},toString:function(){return"Point("+o.Util.formatNum(this.x)+", "+o.Util.formatNum(this.y)+")"}},o.point=function(t,e,n){return t instanceof o.Point?t:o.Util.isArray(t)?new o.Point(t[0],t[1]):t===i||null===t?t:new o.Point(t,e,n)},o.Bounds=function(t,e){if(t)for(var i=e?[t,e]:t,n=0,o=i.length;o>n;n++)this.extend(i[n])},o.Bounds.prototype={extend:function(t){return t=o.point(t),this.min||this.max?(this.min.x=Math.min(t.x,this.min.x),this.max.x=Math.max(t.x,this.max.x),this.min.y=Math.min(t.y,this.min.y),this.max.y=Math.max(t.y,this.max.y)):(this.min=t.clone(),this.max=t.clone()),this},getCenter:function(t){return new o.Point((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,t)},getBottomLeft:function(){return new o.Point(this.min.x,this.max.y)},getTopRight:function(){return new o.Point(this.max.x,this.min.y)},getSize:function(){return this.max.subtract(this.min)},contains:function(t){var e,i;return t="number"==typeof t[0]||t instanceof o.Point?o.point(t):o.bounds(t),t instanceof o.Bounds?(e=t.min,i=t.max):e=i=t,e.x>=this.min.x&&i.x<=this.max.x&&e.y>=this.min.y&&i.y<=this.max.y},intersects:function(t){t=o.bounds(t);var e=this.min,i=this.max,n=t.min,s=t.max,a=s.x>=e.x&&n.x<=i.x,r=s.y>=e.y&&n.y<=i.y;return a&&r},isValid:function(){return!(!this.min||!this.max)}},o.bounds=function(t,e){return!t||t instanceof o.Bounds?t:new o.Bounds(t,e)},o.Transformation=function(t,e,i,n){this._a=t,this._b=e,this._c=i,this._d=n},o.Transformation.prototype={transform:function(t,e){return this._transform(t.clone(),e)},_transform:function(t,e){return e=e||1,t.x=e*(this._a*t.x+this._b),t.y=e*(this._c*t.y+this._d),t},untransform:function(t,e){return e=e||1,new o.Point((t.x/e-this._b)/this._a,(t.y/e-this._d)/this._c)}},o.DomUtil={get:function(t){return"string"==typeof t?e.getElementById(t):t},getStyle:function(t,i){var n=t.style[i];if(!n&&t.currentStyle&&(n=t.currentStyle[i]),(!n||"auto"===n)&&e.defaultView){var o=e.defaultView.getComputedStyle(t,null);n=o?o[i]:null}return"auto"===n?null:n},getViewportOffset:function(t){var i,n=0,s=0,a=t,r=e.body,h=e.documentElement;do{if(n+=a.offsetTop||0,s+=a.offsetLeft||0,n+=parseInt(o.DomUtil.getStyle(a,"borderTopWidth"),10)||0,s+=parseInt(o.DomUtil.getStyle(a,"borderLeftWidth"),10)||0,i=o.DomUtil.getStyle(a,"position"),a.offsetParent===r&&"absolute"===i)break;if("fixed"===i){n+=r.scrollTop||h.scrollTop||0,s+=r.scrollLeft||h.scrollLeft||0;break}if("relative"===i&&!a.offsetLeft){var l=o.DomUtil.getStyle(a,"width"),u=o.DomUtil.getStyle(a,"max-width"),c=a.getBoundingClientRect();("none"!==l||"none"!==u)&&(s+=c.left+a.clientLeft),n+=c.top+(r.scrollTop||h.scrollTop||0);break}a=a.offsetParent}while(a);a=t;do{if(a===r)break;n-=a.scrollTop||0,s-=a.scrollLeft||0,a=a.parentNode}while(a);return new o.Point(s,n)},documentIsLtr:function(){return o.DomUtil._docIsLtrCached||(o.DomUtil._docIsLtrCached=!0,o.DomUtil._docIsLtr="ltr"===o.DomUtil.getStyle(e.body,"direction")),o.DomUtil._docIsLtr},create:function(t,i,n){var o=e.createElement(t);return o.className=i,n&&n.appendChild(o),o},hasClass:function(t,e){if(t.classList!==i)return t.classList.contains(e);var n=o.DomUtil._getClass(t);return n.length>0&&new RegExp("(^|\\s)"+e+"(\\s|$)").test(n)},addClass:function(t,e){if(t.classList!==i)for(var n=o.Util.splitWords(e),s=0,a=n.length;a>s;s++)t.classList.add(n[s]);else if(!o.DomUtil.hasClass(t,e)){var r=o.DomUtil._getClass(t);o.DomUtil._setClass(t,(r?r+" ":"")+e)}},removeClass:function(t,e){t.classList!==i?t.classList.remove(e):o.DomUtil._setClass(t,o.Util.trim((" "+o.DomUtil._getClass(t)+" ").replace(" "+e+" "," ")))},_setClass:function(t,e){t.className.baseVal===i?t.className=e:t.className.baseVal=e},_getClass:function(t){return t.className.baseVal===i?t.className:t.className.baseVal},setOpacity:function(t,e){if("opacity"in t.style)t.style.opacity=e;else if("filter"in t.style){var i=!1,n="DXImageTransform.Microsoft.Alpha";try{i=t.filters.item(n)}catch(o){if(1===e)return}e=Math.round(100*e),i?(i.Enabled=100!==e,i.Opacity=e):t.style.filter+=" progid:"+n+"(opacity="+e+")"}},testProp:function(t){for(var i=e.documentElement.style,n=0;n<t.length;n++)if(t[n]in i)return t[n];return!1},getTranslateString:function(t){var e=o.Browser.webkit3d,i="translate"+(e?"3d":"")+"(",n=(e?",0":"")+")";return i+t.x+"px,"+t.y+"px"+n},getScaleString:function(t,e){var i=o.DomUtil.getTranslateString(e.add(e.multiplyBy(-1*t))),n=" scale("+t+") ";return i+n},setPosition:function(t,e,i){t._leaflet_pos=e,!i&&o.Browser.any3d?t.style[o.DomUtil.TRANSFORM]=o.DomUtil.getTranslateString(e):(t.style.left=e.x+"px",t.style.top=e.y+"px")},getPosition:function(t){return t._leaflet_pos}},o.DomUtil.TRANSFORM=o.DomUtil.testProp(["transform","WebkitTransform","OTransform","MozTransform","msTransform"]),o.DomUtil.TRANSITION=o.DomUtil.testProp(["webkitTransition","transition","OTransition","MozTransition","msTransition"]),o.DomUtil.TRANSITION_END="webkitTransition"===o.DomUtil.TRANSITION||"OTransition"===o.DomUtil.TRANSITION?o.DomUtil.TRANSITION+"End":"transitionend",function(){if("onselectstart"in e)o.extend(o.DomUtil,{disableTextSelection:function(){o.DomEvent.on(t,"selectstart",o.DomEvent.preventDefault)},enableTextSelection:function(){o.DomEvent.off(t,"selectstart",o.DomEvent.preventDefault)}});else{var i=o.DomUtil.testProp(["userSelect","WebkitUserSelect","OUserSelect","MozUserSelect","msUserSelect"]);o.extend(o.DomUtil,{disableTextSelection:function(){if(i){var t=e.documentElement.style;this._userSelect=t[i],t[i]="none"}},enableTextSelection:function(){i&&(e.documentElement.style[i]=this._userSelect,delete this._userSelect)}})}o.extend(o.DomUtil,{disableImageDrag:function(){o.DomEvent.on(t,"dragstart",o.DomEvent.preventDefault)},enableImageDrag:function(){o.DomEvent.off(t,"dragstart",o.DomEvent.preventDefault)}})}(),o.LatLng=function(t,e,n){if(t=parseFloat(t),e=parseFloat(e),isNaN(t)||isNaN(e))throw new Error("Invalid LatLng object: ("+t+", "+e+")");this.lat=t,this.lng=e,n!==i&&(this.alt=parseFloat(n))},o.extend(o.LatLng,{DEG_TO_RAD:Math.PI/180,RAD_TO_DEG:180/Math.PI,MAX_MARGIN:1e-9}),o.LatLng.prototype={equals:function(t){if(!t)return!1;t=o.latLng(t);var e=Math.max(Math.abs(this.lat-t.lat),Math.abs(this.lng-t.lng));return e<=o.LatLng.MAX_MARGIN},toString:function(t){return"LatLng("+o.Util.formatNum(this.lat,t)+", "+o.Util.formatNum(this.lng,t)+")"},distanceTo:function(t){t=o.latLng(t);var e=6378137,i=o.LatLng.DEG_TO_RAD,n=(t.lat-this.lat)*i,s=(t.lng-this.lng)*i,a=this.lat*i,r=t.lat*i,h=Math.sin(n/2),l=Math.sin(s/2),u=h*h+l*l*Math.cos(a)*Math.cos(r);return 2*e*Math.atan2(Math.sqrt(u),Math.sqrt(1-u))},wrap:function(t,e){var i=this.lng;return t=t||-180,e=e||180,i=(i+e)%(e-t)+(t>i||i===e?e:t),new o.LatLng(this.lat,i)}},o.latLng=function(t,e){return t instanceof o.LatLng?t:o.Util.isArray(t)?"number"==typeof t[0]||"string"==typeof t[0]?new o.LatLng(t[0],t[1],t[2]):null:t===i||null===t?t:"object"==typeof t&&"lat"in t?new o.LatLng(t.lat,"lng"in t?t.lng:t.lon):e===i?null:new o.LatLng(t,e)},o.LatLngBounds=function(t,e){if(t)for(var i=e?[t,e]:t,n=0,o=i.length;o>n;n++)this.extend(i[n])},o.LatLngBounds.prototype={extend:function(t){if(!t)return this;var e=o.latLng(t);return t=null!==e?e:o.latLngBounds(t),t instanceof o.LatLng?this._southWest||this._northEast?(this._southWest.lat=Math.min(t.lat,this._southWest.lat),this._southWest.lng=Math.min(t.lng,this._southWest.lng),this._northEast.lat=Math.max(t.lat,this._northEast.lat),this._northEast.lng=Math.max(t.lng,this._northEast.lng)):(this._southWest=new o.LatLng(t.lat,t.lng),this._northEast=new o.LatLng(t.lat,t.lng)):t instanceof o.LatLngBounds&&(this.extend(t._southWest),this.extend(t._northEast)),this},pad:function(t){var e=this._southWest,i=this._northEast,n=Math.abs(e.lat-i.lat)*t,s=Math.abs(e.lng-i.lng)*t;return new o.LatLngBounds(new o.LatLng(e.lat-n,e.lng-s),new o.LatLng(i.lat+n,i.lng+s))},getCenter:function(){return new o.LatLng((this._southWest.lat+this._northEast.lat)/2,(this._southWest.lng+this._northEast.lng)/2)},getSouthWest:function(){return this._southWest},getNorthEast:function(){return this._northEast},getNorthWest:function(){return new o.LatLng(this.getNorth(),this.getWest())},getSouthEast:function(){return new o.LatLng(this.getSouth(),this.getEast())},getWest:function(){return this._southWest.lng},getSouth:function(){return this._southWest.lat},getEast:function(){return this._northEast.lng},getNorth:function(){return this._northEast.lat},contains:function(t){t="number"==typeof t[0]||t instanceof o.LatLng?o.latLng(t):o.latLngBounds(t);var e,i,n=this._southWest,s=this._northEast;return t instanceof o.LatLngBounds?(e=t.getSouthWest(),i=t.getNorthEast()):e=i=t,e.lat>=n.lat&&i.lat<=s.lat&&e.lng>=n.lng&&i.lng<=s.lng},intersects:function(t){t=o.latLngBounds(t);var e=this._southWest,i=this._northEast,n=t.getSouthWest(),s=t.getNorthEast(),a=s.lat>=e.lat&&n.lat<=i.lat,r=s.lng>=e.lng&&n.lng<=i.lng;return a&&r},toBBoxString:function(){return[this.getWest(),this.getSouth(),this.getEast(),this.getNorth()].join(",")},equals:function(t){return t?(t=o.latLngBounds(t),this._southWest.equals(t.getSouthWest())&&this._northEast.equals(t.getNorthEast())):!1},isValid:function(){return!(!this._southWest||!this._northEast)}},o.latLngBounds=function(t,e){return!t||t instanceof o.LatLngBounds?t:new o.LatLngBounds(t,e)},o.Projection={},o.Projection.SphericalMercator={MAX_LATITUDE:85.0511287798,project:function(t){var e=o.LatLng.DEG_TO_RAD,i=this.MAX_LATITUDE,n=Math.max(Math.min(i,t.lat),-i),s=t.lng*e,a=n*e;return a=Math.log(Math.tan(Math.PI/4+a/2)),new o.Point(s,a)},unproject:function(t){var e=o.LatLng.RAD_TO_DEG,i=t.x*e,n=(2*Math.atan(Math.exp(t.y))-Math.PI/2)*e;return new o.LatLng(n,i)}},o.Projection.LonLat={project:function(t){return new o.Point(t.lng,t.lat)},unproject:function(t){return new o.LatLng(t.y,t.x)}},o.CRS={latLngToPoint:function(t,e){var i=this.projection.project(t),n=this.scale(e);return this.transformation._transform(i,n)},pointToLatLng:function(t,e){var i=this.scale(e),n=this.transformation.untransform(t,i);return this.projection.unproject(n)},project:function(t){return this.projection.project(t)},scale:function(t){return 256*Math.pow(2,t)},getSize:function(t){var e=this.scale(t);return o.point(e,e)}},o.CRS.Simple=o.extend({},o.CRS,{projection:o.Projection.LonLat,transformation:new o.Transformation(1,0,-1,0),scale:function(t){return Math.pow(2,t)}}),o.CRS.EPSG3857=o.extend({},o.CRS,{code:"EPSG:3857",projection:o.Projection.SphericalMercator,transformation:new o.Transformation(.5/Math.PI,.5,-.5/Math.PI,.5),project:function(t){var e=this.projection.project(t),i=6378137;return e.multiplyBy(i)}}),o.CRS.EPSG900913=o.extend({},o.CRS.EPSG3857,{code:"EPSG:900913"}),o.CRS.EPSG4326=o.extend({},o.CRS,{code:"EPSG:4326",projection:o.Projection.LonLat,transformation:new o.Transformation(1/360,.5,-1/360,.5)}),o.Map=o.Class.extend({includes:o.Mixin.Events,options:{crs:o.CRS.EPSG3857,fadeAnimation:o.DomUtil.TRANSITION&&!o.Browser.android23,trackResize:!0,markerZoomAnimation:o.DomUtil.TRANSITION&&o.Browser.any3d},initialize:function(t,e){e=o.setOptions(this,e),this._initContainer(t),this._initLayout(),this._onResize=o.bind(this._onResize,this),this._initEvents(),e.maxBounds&&this.setMaxBounds(e.maxBounds),e.center&&e.zoom!==i&&this.setView(o.latLng(e.center),e.zoom,{reset:!0}),this._handlers=[],this._layers={},this._zoomBoundLayers={},this._tileLayersNum=0,this.callInitHooks(),this._addLayers(e.layers)},setView:function(t,e){return e=e===i?this.getZoom():e,this._resetView(o.latLng(t),this._limitZoom(e)),this},setZoom:function(t,e){return this._loaded?this.setView(this.getCenter(),t,{zoom:e}):(this._zoom=this._limitZoom(t),this)},zoomIn:function(t,e){return this.setZoom(this._zoom+(t||1),e)},zoomOut:function(t,e){return this.setZoom(this._zoom-(t||1),e)},setZoomAround:function(t,e,i){var n=this.getZoomScale(e),s=this.getSize().divideBy(2),a=t instanceof o.Point?t:this.latLngToContainerPoint(t),r=a.subtract(s).multiplyBy(1-1/n),h=this.containerPointToLatLng(s.add(r));return this.setView(h,e,{zoom:i})},fitBounds:function(t,e){e=e||{},t=t.getBounds?t.getBounds():o.latLngBounds(t);var i=o.point(e.paddingTopLeft||e.padding||[0,0]),n=o.point(e.paddingBottomRight||e.padding||[0,0]),s=this.getBoundsZoom(t,!1,i.add(n)),a=n.subtract(i).divideBy(2),r=this.project(t.getSouthWest(),s),h=this.project(t.getNorthEast(),s),l=this.unproject(r.add(h).divideBy(2).add(a),s);return s=e&&e.maxZoom?Math.min(e.maxZoom,s):s,this.setView(l,s,e)},fitWorld:function(t){return this.fitBounds([[-90,-180],[90,180]],t)},panTo:function(t,e){return this.setView(t,this._zoom,{pan:e})},panBy:function(t){return this.fire("movestart"),this._rawPanBy(o.point(t)),this.fire("move"),this.fire("moveend")},setMaxBounds:function(t){return t=o.latLngBounds(t),this.options.maxBounds=t,t?(this._loaded&&this._panInsideMaxBounds(),this.on("moveend",this._panInsideMaxBounds,this)):this.off("moveend",this._panInsideMaxBounds,this)},panInsideBounds:function(t,e){var i=this.getCenter(),n=this._limitCenter(i,this._zoom,t);return i.equals(n)?this:this.panTo(n,e)},addLayer:function(t){var e=o.stamp(t);return this._layers[e]?this:(this._layers[e]=t,!t.options||isNaN(t.options.maxZoom)&&isNaN(t.options.minZoom)||(this._zoomBoundLayers[e]=t,this._updateZoomLevels()),this.options.zoomAnimation&&o.TileLayer&&t instanceof o.TileLayer&&(this._tileLayersNum++,this._tileLayersToLoad++,t.on("load",this._onTileLayerLoad,this)),this._loaded&&this._layerAdd(t),this)},removeLayer:function(t){var e=o.stamp(t);return this._layers[e]?(this._loaded&&t.onRemove(this),delete this._layers[e],this._loaded&&this.fire("layerremove",{layer:t}),this._zoomBoundLayers[e]&&(delete this._zoomBoundLayers[e],this._updateZoomLevels()),this.options.zoomAnimation&&o.TileLayer&&t instanceof o.TileLayer&&(this._tileLayersNum--,this._tileLayersToLoad--,t.off("load",this._onTileLayerLoad,this)),this):this},hasLayer:function(t){return t?o.stamp(t)in this._layers:!1},eachLayer:function(t,e){for(var i in this._layers)t.call(e,this._layers[i]);return this},invalidateSize:function(t){if(!this._loaded)return this;t=o.extend({animate:!1,pan:!0},t===!0?{animate:!0}:t);var e=this.getSize();this._sizeChanged=!0,this._initialCenter=null;var i=this.getSize(),n=e.divideBy(2).round(),s=i.divideBy(2).round(),a=n.subtract(s);return a.x||a.y?(t.animate&&t.pan?this.panBy(a):(t.pan&&this._rawPanBy(a),this.fire("move"),t.debounceMoveend?(clearTimeout(this._sizeTimer),this._sizeTimer=setTimeout(o.bind(this.fire,this,"moveend"),200)):this.fire("moveend")),this.fire("resize",{oldSize:e,newSize:i})):this},addHandler:function(t,e){if(!e)return this;var i=this[t]=new e(this);return this._handlers.push(i),this.options[t]&&i.enable(),this},remove:function(){this._loaded&&this.fire("unload"),this._initEvents("off");try{delete this._container._leaflet}catch(t){this._container._leaflet=i}return this._clearPanes(),this._clearControlPos&&this._clearControlPos(),this._clearHandlers(),this},getCenter:function(){return this._checkIfLoaded(),this._initialCenter&&!this._moved()?this._initialCenter:this.layerPointToLatLng(this._getCenterLayerPoint())},getZoom:function(){return this._zoom},getBounds:function(){var t=this.getPixelBounds(),e=this.unproject(t.getBottomLeft()),i=this.unproject(t.getTopRight());return new o.LatLngBounds(e,i)},getMinZoom:function(){return this.options.minZoom===i?this._layersMinZoom===i?0:this._layersMinZoom:this.options.minZoom},getMaxZoom:function(){return this.options.maxZoom===i?this._layersMaxZoom===i?1/0:this._layersMaxZoom:this.options.maxZoom},getBoundsZoom:function(t,e,i){t=o.latLngBounds(t);var n,s=this.getMinZoom()-(e?1:0),a=this.getMaxZoom(),r=this.getSize(),h=t.getNorthWest(),l=t.getSouthEast(),u=!0;i=o.point(i||[0,0]);do s++,n=this.project(l,s).subtract(this.project(h,s)).add(i),u=e?n.x<r.x||n.y<r.y:r.contains(n);while(u&&a>=s);return u&&e?null:e?s:s-1},getSize:function(){return(!this._size||this._sizeChanged)&&(this._size=new o.Point(this._container.clientWidth,this._container.clientHeight),this._sizeChanged=!1),this._size.clone()},getPixelBounds:function(){var t=this._getTopLeftPoint();return new o.Bounds(t,t.add(this.getSize()))},getPixelOrigin:function(){return this._checkIfLoaded(),this._initialTopLeftPoint},getPanes:function(){return this._panes},getContainer:function(){return this._container},getZoomScale:function(t){var e=this.options.crs;return e.scale(t)/e.scale(this._zoom)},getScaleZoom:function(t){return this._zoom+Math.log(t)/Math.LN2},project:function(t,e){return e=e===i?this._zoom:e,this.options.crs.latLngToPoint(o.latLng(t),e)},unproject:function(t,e){return e=e===i?this._zoom:e,this.options.crs.pointToLatLng(o.point(t),e)},layerPointToLatLng:function(t){var e=o.point(t).add(this.getPixelOrigin());return this.unproject(e)},latLngToLayerPoint:function(t){var e=this.project(o.latLng(t))._round();return e._subtract(this.getPixelOrigin())},containerPointToLayerPoint:function(t){return o.point(t).subtract(this._getMapPanePos())},layerPointToContainerPoint:function(t){return o.point(t).add(this._getMapPanePos())},containerPointToLatLng:function(t){var e=this.containerPointToLayerPoint(o.point(t));return this.layerPointToLatLng(e)},latLngToContainerPoint:function(t){return this.layerPointToContainerPoint(this.latLngToLayerPoint(o.latLng(t)))},mouseEventToContainerPoint:function(t){return o.DomEvent.getMousePosition(t,this._container)},mouseEventToLayerPoint:function(t){return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t))},mouseEventToLatLng:function(t){return this.layerPointToLatLng(this.mouseEventToLayerPoint(t))},_initContainer:function(t){var e=this._container=o.DomUtil.get(t);if(!e)throw new Error("Map container not found.");if(e._leaflet)throw new Error("Map container is already initialized.");e._leaflet=!0},_initLayout:function(){var t=this._container;o.DomUtil.addClass(t,"leaflet-container"+(o.Browser.touch?" leaflet-touch":"")+(o.Browser.retina?" leaflet-retina":"")+(o.Browser.ielt9?" leaflet-oldie":"")+(this.options.fadeAnimation?" leaflet-fade-anim":""));var e=o.DomUtil.getStyle(t,"position");"absolute"!==e&&"relative"!==e&&"fixed"!==e&&(t.style.position="relative"),this._initPanes(),this._initControlPos&&this._initControlPos()},_initPanes:function(){var t=this._panes={};this._mapPane=t.mapPane=this._createPane("leaflet-map-pane",this._container),this._tilePane=t.tilePane=this._createPane("leaflet-tile-pane",this._mapPane),t.objectsPane=this._createPane("leaflet-objects-pane",this._mapPane),t.shadowPane=this._createPane("leaflet-shadow-pane"),t.overlayPane=this._createPane("leaflet-overlay-pane"),t.markerPane=this._createPane("leaflet-marker-pane"),t.popupPane=this._createPane("leaflet-popup-pane");var e=" leaflet-zoom-hide";this.options.markerZoomAnimation||(o.DomUtil.addClass(t.markerPane,e),o.DomUtil.addClass(t.shadowPane,e),o.DomUtil.addClass(t.popupPane,e))},_createPane:function(t,e){return o.DomUtil.create("div",t,e||this._panes.objectsPane)},_clearPanes:function(){this._container.removeChild(this._mapPane)},_addLayers:function(t){t=t?o.Util.isArray(t)?t:[t]:[];for(var e=0,i=t.length;i>e;e++)this.addLayer(t[e])},_resetView:function(t,e,i,n){var s=this._zoom!==e;n||(this.fire("movestart"),s&&this.fire("zoomstart")),this._zoom=e,this._initialCenter=t,this._initialTopLeftPoint=this._getNewTopLeftPoint(t),i?this._initialTopLeftPoint._add(this._getMapPanePos()):o.DomUtil.setPosition(this._mapPane,new o.Point(0,0)),this._tileLayersToLoad=this._tileLayersNum;var a=!this._loaded;this._loaded=!0,this.fire("viewreset",{hard:!i}),a&&(this.fire("load"),this.eachLayer(this._layerAdd,this)),this.fire("move"),(s||n)&&this.fire("zoomend"),this.fire("moveend",{hard:!i})},_rawPanBy:function(t){o.DomUtil.setPosition(this._mapPane,this._getMapPanePos().subtract(t))},_getZoomSpan:function(){return this.getMaxZoom()-this.getMinZoom()},_updateZoomLevels:function(){var t,e=1/0,n=-1/0,o=this._getZoomSpan();for(t in this._zoomBoundLayers){var s=this._zoomBoundLayers[t];isNaN(s.options.minZoom)||(e=Math.min(e,s.options.minZoom)),isNaN(s.options.maxZoom)||(n=Math.max(n,s.options.maxZoom))}t===i?this._layersMaxZoom=this._layersMinZoom=i:(this._layersMaxZoom=n,this._layersMinZoom=e),o!==this._getZoomSpan()&&this.fire("zoomlevelschange")},_panInsideMaxBounds:function(){this.panInsideBounds(this.options.maxBounds)},_checkIfLoaded:function(){if(!this._loaded)throw new Error("Set map center and zoom first.")},_initEvents:function(e){if(o.DomEvent){e=e||"on",o.DomEvent[e](this._container,"click",this._onMouseClick,this);var i,n,s=["dblclick","mousedown","mouseup","mouseenter","mouseleave","mousemove","contextmenu"];for(i=0,n=s.length;n>i;i++)o.DomEvent[e](this._container,s[i],this._fireMouseEvent,this);this.options.trackResize&&o.DomEvent[e](t,"resize",this._onResize,this)}},_onResize:function(){o.Util.cancelAnimFrame(this._resizeRequest),this._resizeRequest=o.Util.requestAnimFrame(function(){this.invalidateSize({debounceMoveend:!0})},this,!1,this._container)},_onMouseClick:function(t){!this._loaded||!t._simulated&&(this.dragging&&this.dragging.moved()||this.boxZoom&&this.boxZoom.moved())||o.DomEvent._skipped(t)||(this.fire("preclick"),this._fireMouseEvent(t))},_fireMouseEvent:function(t){if(this._loaded&&!o.DomEvent._skipped(t)){var e=t.type;if(e="mouseenter"===e?"mouseover":"mouseleave"===e?"mouseout":e,this.hasEventListeners(e)){"contextmenu"===e&&o.DomEvent.preventDefault(t);var i=this.mouseEventToContainerPoint(t),n=this.containerPointToLayerPoint(i),s=this.layerPointToLatLng(n);this.fire(e,{latlng:s,layerPoint:n,containerPoint:i,originalEvent:t})}}},_onTileLayerLoad:function(){this._tileLayersToLoad--,this._tileLayersNum&&!this._tileLayersToLoad&&this.fire("tilelayersload")},_clearHandlers:function(){for(var t=0,e=this._handlers.length;e>t;t++)this._handlers[t].disable()},whenReady:function(t,e){return this._loaded?t.call(e||this,this):this.on("load",t,e),this},_layerAdd:function(t){t.onAdd(this),this.fire("layeradd",{layer:t})},_getMapPanePos:function(){return o.DomUtil.getPosition(this._mapPane)},_moved:function(){var t=this._getMapPanePos();return t&&!t.equals([0,0])},_getTopLeftPoint:function(){return this.getPixelOrigin().subtract(this._getMapPanePos())},_getNewTopLeftPoint:function(t,e){var i=this.getSize()._divideBy(2);return this.project(t,e)._subtract(i)._round()},_latLngToNewLayerPoint:function(t,e,i){var n=this._getNewTopLeftPoint(i,e).add(this._getMapPanePos());return this.project(t,e)._subtract(n)},_getCenterLayerPoint:function(){return this.containerPointToLayerPoint(this.getSize()._divideBy(2))},_getCenterOffset:function(t){return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint())},_limitCenter:function(t,e,i){if(!i)return t;var n=this.project(t,e),s=this.getSize().divideBy(2),a=new o.Bounds(n.subtract(s),n.add(s)),r=this._getBoundsOffset(a,i,e);return this.unproject(n.add(r),e)},_limitOffset:function(t,e){if(!e)return t;var i=this.getPixelBounds(),n=new o.Bounds(i.min.add(t),i.max.add(t));return t.add(this._getBoundsOffset(n,e))},_getBoundsOffset:function(t,e,i){var n=this.project(e.getNorthWest(),i).subtract(t.min),s=this.project(e.getSouthEast(),i).subtract(t.max),a=this._rebound(n.x,-s.x),r=this._rebound(n.y,-s.y);return new o.Point(a,r)},_rebound:function(t,e){return t+e>0?Math.round(t-e)/2:Math.max(0,Math.ceil(t))-Math.max(0,Math.floor(e))},_limitZoom:function(t){var e=this.getMinZoom(),i=this.getMaxZoom();return Math.max(e,Math.min(i,t))}}),o.map=function(t,e){return new o.Map(t,e)},o.Projection.Mercator={MAX_LATITUDE:85.0840591556,R_MINOR:6356752.314245179,R_MAJOR:6378137,project:function(t){var e=o.LatLng.DEG_TO_RAD,i=this.MAX_LATITUDE,n=Math.max(Math.min(i,t.lat),-i),s=this.R_MAJOR,a=this.R_MINOR,r=t.lng*e*s,h=n*e,l=a/s,u=Math.sqrt(1-l*l),c=u*Math.sin(h);c=Math.pow((1-c)/(1+c),.5*u);var d=Math.tan(.5*(.5*Math.PI-h))/c;return h=-s*Math.log(d),new o.Point(r,h)},unproject:function(t){for(var e,i=o.LatLng.RAD_TO_DEG,n=this.R_MAJOR,s=this.R_MINOR,a=t.x*i/n,r=s/n,h=Math.sqrt(1-r*r),l=Math.exp(-t.y/n),u=Math.PI/2-2*Math.atan(l),c=15,d=1e-7,p=c,_=.1;Math.abs(_)>d&&--p>0;)e=h*Math.sin(u),_=Math.PI/2-2*Math.atan(l*Math.pow((1-e)/(1+e),.5*h))-u,u+=_;
return new o.LatLng(u*i,a)}},o.CRS.EPSG3395=o.extend({},o.CRS,{code:"EPSG:3395",projection:o.Projection.Mercator,transformation:function(){var t=o.Projection.Mercator,e=t.R_MAJOR,i=.5/(Math.PI*e);return new o.Transformation(i,.5,-i,.5)}()}),o.TileLayer=o.Class.extend({includes:o.Mixin.Events,options:{minZoom:0,maxZoom:18,tileSize:256,subdomains:"abc",errorTileUrl:"",attribution:"",zoomOffset:0,opacity:1,unloadInvisibleTiles:o.Browser.mobile,updateWhenIdle:o.Browser.mobile},initialize:function(t,e){e=o.setOptions(this,e),e.detectRetina&&o.Browser.retina&&e.maxZoom>0&&(e.tileSize=Math.floor(e.tileSize/2),e.zoomOffset++,e.minZoom>0&&e.minZoom--,this.options.maxZoom--),e.bounds&&(e.bounds=o.latLngBounds(e.bounds)),this._url=t;var i=this.options.subdomains;"string"==typeof i&&(this.options.subdomains=i.split(""))},onAdd:function(t){this._map=t,this._animated=t._zoomAnimated,this._initContainer(),t.on({viewreset:this._reset,moveend:this._update},this),this._animated&&t.on({zoomanim:this._animateZoom,zoomend:this._endZoomAnim},this),this.options.updateWhenIdle||(this._limitedUpdate=o.Util.limitExecByInterval(this._update,150,this),t.on("move",this._limitedUpdate,this)),this._reset(),this._update()},addTo:function(t){return t.addLayer(this),this},onRemove:function(t){this._container.parentNode.removeChild(this._container),t.off({viewreset:this._reset,moveend:this._update},this),this._animated&&t.off({zoomanim:this._animateZoom,zoomend:this._endZoomAnim},this),this.options.updateWhenIdle||t.off("move",this._limitedUpdate,this),this._container=null,this._map=null},bringToFront:function(){var t=this._map._panes.tilePane;return this._container&&(t.appendChild(this._container),this._setAutoZIndex(t,Math.max)),this},bringToBack:function(){var t=this._map._panes.tilePane;return this._container&&(t.insertBefore(this._container,t.firstChild),this._setAutoZIndex(t,Math.min)),this},getAttribution:function(){return this.options.attribution},getContainer:function(){return this._container},setOpacity:function(t){return this.options.opacity=t,this._map&&this._updateOpacity(),this},setZIndex:function(t){return this.options.zIndex=t,this._updateZIndex(),this},setUrl:function(t,e){return this._url=t,e||this.redraw(),this},redraw:function(){return this._map&&(this._reset({hard:!0}),this._update()),this},_updateZIndex:function(){this._container&&this.options.zIndex!==i&&(this._container.style.zIndex=this.options.zIndex)},_setAutoZIndex:function(t,e){var i,n,o,s=t.children,a=-e(1/0,-1/0);for(n=0,o=s.length;o>n;n++)s[n]!==this._container&&(i=parseInt(s[n].style.zIndex,10),isNaN(i)||(a=e(a,i)));this.options.zIndex=this._container.style.zIndex=(isFinite(a)?a:0)+e(1,-1)},_updateOpacity:function(){var t,e=this._tiles;if(o.Browser.ielt9)for(t in e)o.DomUtil.setOpacity(e[t],this.options.opacity);else o.DomUtil.setOpacity(this._container,this.options.opacity)},_initContainer:function(){var t=this._map._panes.tilePane;if(!this._container){if(this._container=o.DomUtil.create("div","leaflet-layer"),this._updateZIndex(),this._animated){var e="leaflet-tile-container";this._bgBuffer=o.DomUtil.create("div",e,this._container),this._tileContainer=o.DomUtil.create("div",e,this._container)}else this._tileContainer=this._container;t.appendChild(this._container),this.options.opacity<1&&this._updateOpacity()}},_reset:function(t){for(var e in this._tiles)this.fire("tileunload",{tile:this._tiles[e]});this._tiles={},this._tilesToLoad=0,this.options.reuseTiles&&(this._unusedTiles=[]),this._tileContainer.innerHTML="",this._animated&&t&&t.hard&&this._clearBgBuffer(),this._initContainer()},_getTileSize:function(){var t=this._map,e=t.getZoom()+this.options.zoomOffset,i=this.options.maxNativeZoom,n=this.options.tileSize;return i&&e>i&&(n=Math.round(t.getZoomScale(e)/t.getZoomScale(i)*n)),n},_update:function(){if(this._map){var t=this._map,e=t.getPixelBounds(),i=t.getZoom(),n=this._getTileSize();if(!(i>this.options.maxZoom||i<this.options.minZoom)){var s=o.bounds(e.min.divideBy(n)._floor(),e.max.divideBy(n)._floor());this._addTilesFromCenterOut(s),(this.options.unloadInvisibleTiles||this.options.reuseTiles)&&this._removeOtherTiles(s)}}},_addTilesFromCenterOut:function(t){var i,n,s,a=[],r=t.getCenter();for(i=t.min.y;i<=t.max.y;i++)for(n=t.min.x;n<=t.max.x;n++)s=new o.Point(n,i),this._tileShouldBeLoaded(s)&&a.push(s);var h=a.length;if(0!==h){a.sort(function(t,e){return t.distanceTo(r)-e.distanceTo(r)});var l=e.createDocumentFragment();for(this._tilesToLoad||this.fire("loading"),this._tilesToLoad+=h,n=0;h>n;n++)this._addTile(a[n],l);this._tileContainer.appendChild(l)}},_tileShouldBeLoaded:function(t){if(t.x+":"+t.y in this._tiles)return!1;var e=this.options;if(!e.continuousWorld){var i=this._getWrapTileNum();if(e.noWrap&&(t.x<0||t.x>=i.x)||t.y<0||t.y>=i.y)return!1}if(e.bounds){var n=e.tileSize,o=t.multiplyBy(n),s=o.add([n,n]),a=this._map.unproject(o),r=this._map.unproject(s);if(e.continuousWorld||e.noWrap||(a=a.wrap(),r=r.wrap()),!e.bounds.intersects([a,r]))return!1}return!0},_removeOtherTiles:function(t){var e,i,n,o;for(o in this._tiles)e=o.split(":"),i=parseInt(e[0],10),n=parseInt(e[1],10),(i<t.min.x||i>t.max.x||n<t.min.y||n>t.max.y)&&this._removeTile(o)},_removeTile:function(t){var e=this._tiles[t];this.fire("tileunload",{tile:e,url:e.src}),this.options.reuseTiles?(o.DomUtil.removeClass(e,"leaflet-tile-loaded"),this._unusedTiles.push(e)):e.parentNode===this._tileContainer&&this._tileContainer.removeChild(e),o.Browser.android||(e.onload=null,e.src=o.Util.emptyImageUrl),delete this._tiles[t]},_addTile:function(t,e){var i=this._getTilePos(t),n=this._getTile();o.DomUtil.setPosition(n,i,o.Browser.chrome),this._tiles[t.x+":"+t.y]=n,this._loadTile(n,t),n.parentNode!==this._tileContainer&&e.appendChild(n)},_getZoomForUrl:function(){var t=this.options,e=this._map.getZoom();return t.zoomReverse&&(e=t.maxZoom-e),e+=t.zoomOffset,t.maxNativeZoom?Math.min(e,t.maxNativeZoom):e},_getTilePos:function(t){var e=this._map.getPixelOrigin(),i=this._getTileSize();return t.multiplyBy(i).subtract(e)},getTileUrl:function(t){return o.Util.template(this._url,o.extend({s:this._getSubdomain(t),z:t.z,x:t.x,y:t.y},this.options))},_getWrapTileNum:function(){var t=this._map.options.crs,e=t.getSize(this._map.getZoom());return e.divideBy(this._getTileSize())._floor()},_adjustTilePoint:function(t){var e=this._getWrapTileNum();this.options.continuousWorld||this.options.noWrap||(t.x=(t.x%e.x+e.x)%e.x),this.options.tms&&(t.y=e.y-t.y-1),t.z=this._getZoomForUrl()},_getSubdomain:function(t){var e=Math.abs(t.x+t.y)%this.options.subdomains.length;return this.options.subdomains[e]},_getTile:function(){if(this.options.reuseTiles&&this._unusedTiles.length>0){var t=this._unusedTiles.pop();return this._resetTile(t),t}return this._createTile()},_resetTile:function(){},_createTile:function(){var t=o.DomUtil.create("img","leaflet-tile");return t.style.width=t.style.height=this._getTileSize()+"px",t.galleryimg="no",t.onselectstart=t.onmousemove=o.Util.falseFn,o.Browser.ielt9&&this.options.opacity!==i&&o.DomUtil.setOpacity(t,this.options.opacity),o.Browser.mobileWebkit3d&&(t.style.WebkitBackfaceVisibility="hidden"),t},_loadTile:function(t,e){t._layer=this,t.onload=this._tileOnLoad,t.onerror=this._tileOnError,this._adjustTilePoint(e),t.src=this.getTileUrl(e),this.fire("tileloadstart",{tile:t,url:t.src})},_tileLoaded:function(){this._tilesToLoad--,this._animated&&o.DomUtil.addClass(this._tileContainer,"leaflet-zoom-animated"),this._tilesToLoad||(this.fire("load"),this._animated&&(clearTimeout(this._clearBgBufferTimer),this._clearBgBufferTimer=setTimeout(o.bind(this._clearBgBuffer,this),500)))},_tileOnLoad:function(){var t=this._layer;this.src!==o.Util.emptyImageUrl&&(o.DomUtil.addClass(this,"leaflet-tile-loaded"),t.fire("tileload",{tile:this,url:this.src})),t._tileLoaded()},_tileOnError:function(){var t=this._layer;t.fire("tileerror",{tile:this,url:this.src});var e=t.options.errorTileUrl;e&&(this.src=e),t._tileLoaded()}}),o.tileLayer=function(t,e){return new o.TileLayer(t,e)},o.TileLayer.WMS=o.TileLayer.extend({defaultWmsParams:{service:"WMS",request:"GetMap",version:"1.1.1",layers:"",styles:"",format:"image/jpeg",transparent:!1},initialize:function(t,e){this._url=t;var i=o.extend({},this.defaultWmsParams),n=e.tileSize||this.options.tileSize;i.width=i.height=e.detectRetina&&o.Browser.retina?2*n:n;for(var s in e)this.options.hasOwnProperty(s)||"crs"===s||(i[s]=e[s]);this.wmsParams=i,o.setOptions(this,e)},onAdd:function(t){this._crs=this.options.crs||t.options.crs,this._wmsVersion=parseFloat(this.wmsParams.version);var e=this._wmsVersion>=1.3?"crs":"srs";this.wmsParams[e]=this._crs.code,o.TileLayer.prototype.onAdd.call(this,t)},getTileUrl:function(t){var e=this._map,i=this.options.tileSize,n=t.multiplyBy(i),s=n.add([i,i]),a=this._crs.project(e.unproject(n,t.z)),r=this._crs.project(e.unproject(s,t.z)),h=this._wmsVersion>=1.3&&this._crs===o.CRS.EPSG4326?[r.y,a.x,a.y,r.x].join(","):[a.x,r.y,r.x,a.y].join(","),l=o.Util.template(this._url,{s:this._getSubdomain(t)});return l+o.Util.getParamString(this.wmsParams,l,!0)+"&BBOX="+h},setParams:function(t,e){return o.extend(this.wmsParams,t),e||this.redraw(),this}}),o.tileLayer.wms=function(t,e){return new o.TileLayer.WMS(t,e)},o.TileLayer.Canvas=o.TileLayer.extend({options:{async:!1},initialize:function(t){o.setOptions(this,t)},redraw:function(){this._map&&(this._reset({hard:!0}),this._update());for(var t in this._tiles)this._redrawTile(this._tiles[t]);return this},_redrawTile:function(t){this.drawTile(t,t._tilePoint,this._map._zoom)},_createTile:function(){var t=o.DomUtil.create("canvas","leaflet-tile");return t.width=t.height=this.options.tileSize,t.onselectstart=t.onmousemove=o.Util.falseFn,t},_loadTile:function(t,e){t._layer=this,t._tilePoint=e,this._redrawTile(t),this.options.async||this.tileDrawn(t)},drawTile:function(){},tileDrawn:function(t){this._tileOnLoad.call(t)}}),o.tileLayer.canvas=function(t){return new o.TileLayer.Canvas(t)},o.ImageOverlay=o.Class.extend({includes:o.Mixin.Events,options:{opacity:1},initialize:function(t,e,i){this._url=t,this._bounds=o.latLngBounds(e),o.setOptions(this,i)},onAdd:function(t){this._map=t,this._image||this._initImage(),t._panes.overlayPane.appendChild(this._image),t.on("viewreset",this._reset,this),t.options.zoomAnimation&&o.Browser.any3d&&t.on("zoomanim",this._animateZoom,this),this._reset()},onRemove:function(t){t.getPanes().overlayPane.removeChild(this._image),t.off("viewreset",this._reset,this),t.options.zoomAnimation&&t.off("zoomanim",this._animateZoom,this)},addTo:function(t){return t.addLayer(this),this},setOpacity:function(t){return this.options.opacity=t,this._updateOpacity(),this},bringToFront:function(){return this._image&&this._map._panes.overlayPane.appendChild(this._image),this},bringToBack:function(){var t=this._map._panes.overlayPane;return this._image&&t.insertBefore(this._image,t.firstChild),this},setUrl:function(t){this._url=t,this._image.src=this._url},getAttribution:function(){return this.options.attribution},_initImage:function(){this._image=o.DomUtil.create("img","leaflet-image-layer"),this._map.options.zoomAnimation&&o.Browser.any3d?o.DomUtil.addClass(this._image,"leaflet-zoom-animated"):o.DomUtil.addClass(this._image,"leaflet-zoom-hide"),this._updateOpacity(),o.extend(this._image,{galleryimg:"no",onselectstart:o.Util.falseFn,onmousemove:o.Util.falseFn,onload:o.bind(this._onImageLoad,this),src:this._url})},_animateZoom:function(t){var e=this._map,i=this._image,n=e.getZoomScale(t.zoom),s=this._bounds.getNorthWest(),a=this._bounds.getSouthEast(),r=e._latLngToNewLayerPoint(s,t.zoom,t.center),h=e._latLngToNewLayerPoint(a,t.zoom,t.center)._subtract(r),l=r._add(h._multiplyBy(.5*(1-1/n)));i.style[o.DomUtil.TRANSFORM]=o.DomUtil.getTranslateString(l)+" scale("+n+") "},_reset:function(){var t=this._image,e=this._map.latLngToLayerPoint(this._bounds.getNorthWest()),i=this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(e);o.DomUtil.setPosition(t,e),t.style.width=i.x+"px",t.style.height=i.y+"px"},_onImageLoad:function(){this.fire("load")},_updateOpacity:function(){o.DomUtil.setOpacity(this._image,this.options.opacity)}}),o.imageOverlay=function(t,e,i){return new o.ImageOverlay(t,e,i)},o.Icon=o.Class.extend({options:{className:""},initialize:function(t){o.setOptions(this,t)},createIcon:function(t){return this._createIcon("icon",t)},createShadow:function(t){return this._createIcon("shadow",t)},_createIcon:function(t,e){var i=this._getIconUrl(t);if(!i){if("icon"===t)throw new Error("iconUrl not set in Icon options (see the docs).");return null}var n;return n=e&&"IMG"===e.tagName?this._createImg(i,e):this._createImg(i),this._setIconStyles(n,t),n},_setIconStyles:function(t,e){var i,n=this.options,s=o.point(n[e+"Size"]);i=o.point("shadow"===e?n.shadowAnchor||n.iconAnchor:n.iconAnchor),!i&&s&&(i=s.divideBy(2,!0)),t.className="leaflet-marker-"+e+" "+n.className,i&&(t.style.marginLeft=-i.x+"px",t.style.marginTop=-i.y+"px"),s&&(t.style.width=s.x+"px",t.style.height=s.y+"px")},_createImg:function(t,i){return i=i||e.createElement("img"),i.src=t,i},_getIconUrl:function(t){return o.Browser.retina&&this.options[t+"RetinaUrl"]?this.options[t+"RetinaUrl"]:this.options[t+"Url"]}}),o.icon=function(t){return new o.Icon(t)},o.Icon.Default=o.Icon.extend({options:{iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]},_getIconUrl:function(t){var e=t+"Url";if(this.options[e])return this.options[e];o.Browser.retina&&"icon"===t&&(t+="-2x");var i=o.Icon.Default.imagePath;if(!i)throw new Error("Couldn't autodetect L.Icon.Default.imagePath, set it manually.");return i+"/marker-"+t+".png"}}),o.Icon.Default.imagePath=function(){var t,i,n,o,s,a=e.getElementsByTagName("script"),r=/[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;for(t=0,i=a.length;i>t;t++)if(n=a[t].src,o=n.match(r))return s=n.split(r)[0],(s?s+"/":"")+"images"}(),o.Marker=o.Class.extend({includes:o.Mixin.Events,options:{icon:new o.Icon.Default,title:"",alt:"",clickable:!0,draggable:!1,keyboard:!0,zIndexOffset:0,opacity:1,riseOnHover:!1,riseOffset:250},initialize:function(t,e){o.setOptions(this,e),this._latlng=o.latLng(t)},onAdd:function(t){this._map=t,t.on("viewreset",this.update,this),this._initIcon(),this.update(),this.fire("add"),t.options.zoomAnimation&&t.options.markerZoomAnimation&&t.on("zoomanim",this._animateZoom,this)},addTo:function(t){return t.addLayer(this),this},onRemove:function(t){this.dragging&&this.dragging.disable(),this._removeIcon(),this._removeShadow(),this.fire("remove"),t.off({viewreset:this.update,zoomanim:this._animateZoom},this),this._map=null},getLatLng:function(){return this._latlng},setLatLng:function(t){return this._latlng=o.latLng(t),this.update(),this.fire("move",{latlng:this._latlng})},setZIndexOffset:function(t){return this.options.zIndexOffset=t,this.update(),this},setIcon:function(t){return this.options.icon=t,this._map&&(this._initIcon(),this.update()),this._popup&&this.bindPopup(this._popup),this},update:function(){if(this._icon){var t=this._map.latLngToLayerPoint(this._latlng).round();this._setPos(t)}return this},_initIcon:function(){var t=this.options,e=this._map,i=e.options.zoomAnimation&&e.options.markerZoomAnimation,n=i?"leaflet-zoom-animated":"leaflet-zoom-hide",s=t.icon.createIcon(this._icon),a=!1;s!==this._icon&&(this._icon&&this._removeIcon(),a=!0,t.title&&(s.title=t.title),t.alt&&(s.alt=t.alt)),o.DomUtil.addClass(s,n),t.keyboard&&(s.tabIndex="0"),this._icon=s,this._initInteraction(),t.riseOnHover&&o.DomEvent.on(s,"mouseover",this._bringToFront,this).on(s,"mouseout",this._resetZIndex,this);var r=t.icon.createShadow(this._shadow),h=!1;r!==this._shadow&&(this._removeShadow(),h=!0),r&&o.DomUtil.addClass(r,n),this._shadow=r,t.opacity<1&&this._updateOpacity();var l=this._map._panes;a&&l.markerPane.appendChild(this._icon),r&&h&&l.shadowPane.appendChild(this._shadow)},_removeIcon:function(){this.options.riseOnHover&&o.DomEvent.off(this._icon,"mouseover",this._bringToFront).off(this._icon,"mouseout",this._resetZIndex),this._map._panes.markerPane.removeChild(this._icon),this._icon=null},_removeShadow:function(){this._shadow&&this._map._panes.shadowPane.removeChild(this._shadow),this._shadow=null},_setPos:function(t){o.DomUtil.setPosition(this._icon,t),this._shadow&&o.DomUtil.setPosition(this._shadow,t),this._zIndex=t.y+this.options.zIndexOffset,this._resetZIndex()},_updateZIndex:function(t){this._icon.style.zIndex=this._zIndex+t},_animateZoom:function(t){var e=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center).round();this._setPos(e)},_initInteraction:function(){if(this.options.clickable){var t=this._icon,e=["dblclick","mousedown","mouseover","mouseout","contextmenu"];o.DomUtil.addClass(t,"leaflet-clickable"),o.DomEvent.on(t,"click",this._onMouseClick,this),o.DomEvent.on(t,"keypress",this._onKeyPress,this);for(var i=0;i<e.length;i++)o.DomEvent.on(t,e[i],this._fireMouseEvent,this);o.Handler.MarkerDrag&&(this.dragging=new o.Handler.MarkerDrag(this),this.options.draggable&&this.dragging.enable())}},_onMouseClick:function(t){var e=this.dragging&&this.dragging.moved();(this.hasEventListeners(t.type)||e)&&o.DomEvent.stopPropagation(t),e||(this.dragging&&this.dragging._enabled||!this._map.dragging||!this._map.dragging.moved())&&this.fire(t.type,{originalEvent:t,latlng:this._latlng})},_onKeyPress:function(t){13===t.keyCode&&this.fire("click",{originalEvent:t,latlng:this._latlng})},_fireMouseEvent:function(t){this.fire(t.type,{originalEvent:t,latlng:this._latlng}),"contextmenu"===t.type&&this.hasEventListeners(t.type)&&o.DomEvent.preventDefault(t),"mousedown"!==t.type?o.DomEvent.stopPropagation(t):o.DomEvent.preventDefault(t)},setOpacity:function(t){return this.options.opacity=t,this._map&&this._updateOpacity(),this},_updateOpacity:function(){o.DomUtil.setOpacity(this._icon,this.options.opacity),this._shadow&&o.DomUtil.setOpacity(this._shadow,this.options.opacity)},_bringToFront:function(){this._updateZIndex(this.options.riseOffset)},_resetZIndex:function(){this._updateZIndex(0)}}),o.marker=function(t,e){return new o.Marker(t,e)},o.DivIcon=o.Icon.extend({options:{iconSize:[12,12],className:"leaflet-div-icon",html:!1},createIcon:function(t){var i=t&&"DIV"===t.tagName?t:e.createElement("div"),n=this.options;return i.innerHTML=n.html!==!1?n.html:"",n.bgPos&&(i.style.backgroundPosition=-n.bgPos.x+"px "+-n.bgPos.y+"px"),this._setIconStyles(i,"icon"),i},createShadow:function(){return null}}),o.divIcon=function(t){return new o.DivIcon(t)},o.Map.mergeOptions({closePopupOnClick:!0}),o.Popup=o.Class.extend({includes:o.Mixin.Events,options:{minWidth:50,maxWidth:300,autoPan:!0,closeButton:!0,offset:[0,7],autoPanPadding:[5,5],keepInView:!1,className:"",zoomAnimation:!0},initialize:function(t,e){o.setOptions(this,t),this._source=e,this._animated=o.Browser.any3d&&this.options.zoomAnimation,this._isOpen=!1},onAdd:function(t){this._map=t,this._container||this._initLayout();var e=t.options.fadeAnimation;e&&o.DomUtil.setOpacity(this._container,0),t._panes.popupPane.appendChild(this._container),t.on(this._getEvents(),this),this.update(),e&&o.DomUtil.setOpacity(this._container,1),this.fire("open"),t.fire("popupopen",{popup:this}),this._source&&this._source.fire("popupopen",{popup:this})},addTo:function(t){return t.addLayer(this),this},openOn:function(t){return t.openPopup(this),this},onRemove:function(t){t._panes.popupPane.removeChild(this._container),o.Util.falseFn(this._container.offsetWidth),t.off(this._getEvents(),this),t.options.fadeAnimation&&o.DomUtil.setOpacity(this._container,0),this._map=null,this.fire("close"),t.fire("popupclose",{popup:this}),this._source&&this._source.fire("popupclose",{popup:this})},getLatLng:function(){return this._latlng},setLatLng:function(t){return this._latlng=o.latLng(t),this._map&&(this._updatePosition(),this._adjustPan()),this},getContent:function(){return this._content},setContent:function(t){return this._content=t,this.update(),this},update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updateLayout(),this._updatePosition(),this._container.style.visibility="",this._adjustPan())},_getEvents:function(){var t={viewreset:this._updatePosition};return this._animated&&(t.zoomanim=this._zoomAnimation),("closeOnClick"in this.options?this.options.closeOnClick:this._map.options.closePopupOnClick)&&(t.preclick=this._close),this.options.keepInView&&(t.moveend=this._adjustPan),t},_close:function(){this._map&&this._map.closePopup(this)},_initLayout:function(){var t,e="leaflet-popup",i=e+" "+this.options.className+" leaflet-zoom-"+(this._animated?"animated":"hide"),n=this._container=o.DomUtil.create("div",i);this.options.closeButton&&(t=this._closeButton=o.DomUtil.create("a",e+"-close-button",n),t.href="#close",t.innerHTML="&#215;",o.DomEvent.disableClickPropagation(t),o.DomEvent.on(t,"click",this._onCloseButtonClick,this));var s=this._wrapper=o.DomUtil.create("div",e+"-content-wrapper",n);o.DomEvent.disableClickPropagation(s),this._contentNode=o.DomUtil.create("div",e+"-content",s),o.DomEvent.disableScrollPropagation(this._contentNode),o.DomEvent.on(s,"contextmenu",o.DomEvent.stopPropagation),this._tipContainer=o.DomUtil.create("div",e+"-tip-container",n),this._tip=o.DomUtil.create("div",e+"-tip",this._tipContainer)},_updateContent:function(){if(this._content){if("string"==typeof this._content)this._contentNode.innerHTML=this._content;else{for(;this._contentNode.hasChildNodes();)this._contentNode.removeChild(this._contentNode.firstChild);this._contentNode.appendChild(this._content)}this.fire("contentupdate")}},_updateLayout:function(){var t=this._contentNode,e=t.style;e.width="",e.whiteSpace="nowrap";var i=t.offsetWidth;i=Math.min(i,this.options.maxWidth),i=Math.max(i,this.options.minWidth),e.width=i+1+"px",e.whiteSpace="",e.height="";var n=t.offsetHeight,s=this.options.maxHeight,a="leaflet-popup-scrolled";s&&n>s?(e.height=s+"px",o.DomUtil.addClass(t,a)):o.DomUtil.removeClass(t,a),this._containerWidth=this._container.offsetWidth},_updatePosition:function(){if(this._map){var t=this._map.latLngToLayerPoint(this._latlng),e=this._animated,i=o.point(this.options.offset);e&&o.DomUtil.setPosition(this._container,t),this._containerBottom=-i.y-(e?0:t.y),this._containerLeft=-Math.round(this._containerWidth/2)+i.x+(e?0:t.x),this._container.style.bottom=this._containerBottom+"px",this._container.style.left=this._containerLeft+"px"}},_zoomAnimation:function(t){var e=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center);o.DomUtil.setPosition(this._container,e)},_adjustPan:function(){if(this.options.autoPan){var t=this._map,e=this._container.offsetHeight,i=this._containerWidth,n=new o.Point(this._containerLeft,-e-this._containerBottom);this._animated&&n._add(o.DomUtil.getPosition(this._container));var s=t.layerPointToContainerPoint(n),a=o.point(this.options.autoPanPadding),r=o.point(this.options.autoPanPaddingTopLeft||a),h=o.point(this.options.autoPanPaddingBottomRight||a),l=t.getSize(),u=0,c=0;s.x+i+h.x>l.x&&(u=s.x+i-l.x+h.x),s.x-u-r.x<0&&(u=s.x-r.x),s.y+e+h.y>l.y&&(c=s.y+e-l.y+h.y),s.y-c-r.y<0&&(c=s.y-r.y),(u||c)&&t.fire("autopanstart").panBy([u,c])}},_onCloseButtonClick:function(t){this._close(),o.DomEvent.stop(t)}}),o.popup=function(t,e){return new o.Popup(t,e)},o.Map.include({openPopup:function(t,e,i){if(this.closePopup(),!(t instanceof o.Popup)){var n=t;t=new o.Popup(i).setLatLng(e).setContent(n)}return t._isOpen=!0,this._popup=t,this.addLayer(t)},closePopup:function(t){return t&&t!==this._popup||(t=this._popup,this._popup=null),t&&(this.removeLayer(t),t._isOpen=!1),this}}),o.Marker.include({openPopup:function(){return this._popup&&this._map&&!this._map.hasLayer(this._popup)&&(this._popup.setLatLng(this._latlng),this._map.openPopup(this._popup)),this},closePopup:function(){return this._popup&&this._popup._close(),this},togglePopup:function(){return this._popup&&(this._popup._isOpen?this.closePopup():this.openPopup()),this},bindPopup:function(t,e){var i=o.point(this.options.icon.options.popupAnchor||[0,0]);return i=i.add(o.Popup.prototype.options.offset),e&&e.offset&&(i=i.add(e.offset)),e=o.extend({offset:i},e),this._popupHandlersAdded||(this.on("click",this.togglePopup,this).on("remove",this.closePopup,this).on("move",this._movePopup,this),this._popupHandlersAdded=!0),t instanceof o.Popup?(o.setOptions(t,e),this._popup=t):this._popup=new o.Popup(e,this).setContent(t),this},setPopupContent:function(t){return this._popup&&this._popup.setContent(t),this},unbindPopup:function(){return this._popup&&(this._popup=null,this.off("click",this.togglePopup,this).off("remove",this.closePopup,this).off("move",this._movePopup,this),this._popupHandlersAdded=!1),this},getPopup:function(){return this._popup},_movePopup:function(t){this._popup.setLatLng(t.latlng)}}),o.LayerGroup=o.Class.extend({initialize:function(t){this._layers={};var e,i;if(t)for(e=0,i=t.length;i>e;e++)this.addLayer(t[e])},addLayer:function(t){var e=this.getLayerId(t);return this._layers[e]=t,this._map&&this._map.addLayer(t),this},removeLayer:function(t){var e=t in this._layers?t:this.getLayerId(t);return this._map&&this._layers[e]&&this._map.removeLayer(this._layers[e]),delete this._layers[e],this},hasLayer:function(t){return t?t in this._layers||this.getLayerId(t)in this._layers:!1},clearLayers:function(){return this.eachLayer(this.removeLayer,this),this},invoke:function(t){var e,i,n=Array.prototype.slice.call(arguments,1);for(e in this._layers)i=this._layers[e],i[t]&&i[t].apply(i,n);return this},onAdd:function(t){this._map=t,this.eachLayer(t.addLayer,t)},onRemove:function(t){this.eachLayer(t.removeLayer,t),this._map=null},addTo:function(t){return t.addLayer(this),this},eachLayer:function(t,e){for(var i in this._layers)t.call(e,this._layers[i]);return this},getLayer:function(t){return this._layers[t]},getLayers:function(){var t=[];for(var e in this._layers)t.push(this._layers[e]);return t},setZIndex:function(t){return this.invoke("setZIndex",t)},getLayerId:function(t){return o.stamp(t)}}),o.layerGroup=function(t){return new o.LayerGroup(t)},o.FeatureGroup=o.LayerGroup.extend({includes:o.Mixin.Events,statics:{EVENTS:"click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose"},addLayer:function(t){return this.hasLayer(t)?this:("on"in t&&t.on(o.FeatureGroup.EVENTS,this._propagateEvent,this),o.LayerGroup.prototype.addLayer.call(this,t),this._popupContent&&t.bindPopup&&t.bindPopup(this._popupContent,this._popupOptions),this.fire("layeradd",{layer:t}))},removeLayer:function(t){return this.hasLayer(t)?(t in this._layers&&(t=this._layers[t]),t.off(o.FeatureGroup.EVENTS,this._propagateEvent,this),o.LayerGroup.prototype.removeLayer.call(this,t),this._popupContent&&this.invoke("unbindPopup"),this.fire("layerremove",{layer:t})):this},bindPopup:function(t,e){return this._popupContent=t,this._popupOptions=e,this.invoke("bindPopup",t,e)},openPopup:function(t){for(var e in this._layers){this._layers[e].openPopup(t);break}return this},setStyle:function(t){return this.invoke("setStyle",t)},bringToFront:function(){return this.invoke("bringToFront")},bringToBack:function(){return this.invoke("bringToBack")},getBounds:function(){var t=new o.LatLngBounds;return this.eachLayer(function(e){t.extend(e instanceof o.Marker?e.getLatLng():e.getBounds())}),t},_propagateEvent:function(t){t=o.extend({layer:t.target,target:this},t),this.fire(t.type,t)}}),o.featureGroup=function(t){return new o.FeatureGroup(t)},o.Path=o.Class.extend({includes:[o.Mixin.Events],statics:{CLIP_PADDING:function(){var e=o.Browser.mobile?1280:2e3,i=(e/Math.max(t.outerWidth,t.outerHeight)-1)/2;return Math.max(0,Math.min(.5,i))}()},options:{stroke:!0,color:"#0033ff",dashArray:null,lineCap:null,lineJoin:null,weight:5,opacity:.5,fill:!1,fillColor:null,fillOpacity:.2,clickable:!0},initialize:function(t){o.setOptions(this,t)},onAdd:function(t){this._map=t,this._container||(this._initElements(),this._initEvents()),this.projectLatlngs(),this._updatePath(),this._container&&this._map._pathRoot.appendChild(this._container),this.fire("add"),t.on({viewreset:this.projectLatlngs,moveend:this._updatePath},this)},addTo:function(t){return t.addLayer(this),this},onRemove:function(t){t._pathRoot.removeChild(this._container),this.fire("remove"),this._map=null,o.Browser.vml&&(this._container=null,this._stroke=null,this._fill=null),t.off({viewreset:this.projectLatlngs,moveend:this._updatePath},this)},projectLatlngs:function(){},setStyle:function(t){return o.setOptions(this,t),this._container&&this._updateStyle(),this},redraw:function(){return this._map&&(this.projectLatlngs(),this._updatePath()),this}}),o.Map.include({_updatePathViewport:function(){var t=o.Path.CLIP_PADDING,e=this.getSize(),i=o.DomUtil.getPosition(this._mapPane),n=i.multiplyBy(-1)._subtract(e.multiplyBy(t)._round()),s=n.add(e.multiplyBy(1+2*t)._round());this._pathViewport=new o.Bounds(n,s)}}),o.Path.SVG_NS="http://www.w3.org/2000/svg",o.Browser.svg=!(!e.createElementNS||!e.createElementNS(o.Path.SVG_NS,"svg").createSVGRect),o.Path=o.Path.extend({statics:{SVG:o.Browser.svg},bringToFront:function(){var t=this._map._pathRoot,e=this._container;return e&&t.lastChild!==e&&t.appendChild(e),this},bringToBack:function(){var t=this._map._pathRoot,e=this._container,i=t.firstChild;return e&&i!==e&&t.insertBefore(e,i),this},getPathString:function(){},_createElement:function(t){return e.createElementNS(o.Path.SVG_NS,t)},_initElements:function(){this._map._initPathRoot(),this._initPath(),this._initStyle()},_initPath:function(){this._container=this._createElement("g"),this._path=this._createElement("path"),this.options.className&&o.DomUtil.addClass(this._path,this.options.className),this._container.appendChild(this._path)},_initStyle:function(){this.options.stroke&&(this._path.setAttribute("stroke-linejoin","round"),this._path.setAttribute("stroke-linecap","round")),this.options.fill&&this._path.setAttribute("fill-rule","evenodd"),this.options.pointerEvents&&this._path.setAttribute("pointer-events",this.options.pointerEvents),this.options.clickable||this.options.pointerEvents||this._path.setAttribute("pointer-events","none"),this._updateStyle()},_updateStyle:function(){this.options.stroke?(this._path.setAttribute("stroke",this.options.color),this._path.setAttribute("stroke-opacity",this.options.opacity),this._path.setAttribute("stroke-width",this.options.weight),this.options.dashArray?this._path.setAttribute("stroke-dasharray",this.options.dashArray):this._path.removeAttribute("stroke-dasharray"),this.options.lineCap&&this._path.setAttribute("stroke-linecap",this.options.lineCap),this.options.lineJoin&&this._path.setAttribute("stroke-linejoin",this.options.lineJoin)):this._path.setAttribute("stroke","none"),this.options.fill?(this._path.setAttribute("fill",this.options.fillColor||this.options.color),this._path.setAttribute("fill-opacity",this.options.fillOpacity)):this._path.setAttribute("fill","none")},_updatePath:function(){var t=this.getPathString();t||(t="M0 0"),this._path.setAttribute("d",t)},_initEvents:function(){if(this.options.clickable){(o.Browser.svg||!o.Browser.vml)&&o.DomUtil.addClass(this._path,"leaflet-clickable"),o.DomEvent.on(this._container,"click",this._onMouseClick,this);for(var t=["dblclick","mousedown","mouseover","mouseout","mousemove","contextmenu"],e=0;e<t.length;e++)o.DomEvent.on(this._container,t[e],this._fireMouseEvent,this)}},_onMouseClick:function(t){this._map.dragging&&this._map.dragging.moved()||this._fireMouseEvent(t)},_fireMouseEvent:function(t){if(this.hasEventListeners(t.type)){var e=this._map,i=e.mouseEventToContainerPoint(t),n=e.containerPointToLayerPoint(i),s=e.layerPointToLatLng(n);this.fire(t.type,{latlng:s,layerPoint:n,containerPoint:i,originalEvent:t}),"contextmenu"===t.type&&o.DomEvent.preventDefault(t),"mousemove"!==t.type&&o.DomEvent.stopPropagation(t)}}}),o.Map.include({_initPathRoot:function(){this._pathRoot||(this._pathRoot=o.Path.prototype._createElement("svg"),this._panes.overlayPane.appendChild(this._pathRoot),this.options.zoomAnimation&&o.Browser.any3d?(o.DomUtil.addClass(this._pathRoot,"leaflet-zoom-animated"),this.on({zoomanim:this._animatePathZoom,zoomend:this._endPathZoom})):o.DomUtil.addClass(this._pathRoot,"leaflet-zoom-hide"),this.on("moveend",this._updateSvgViewport),this._updateSvgViewport())
},_animatePathZoom:function(t){var e=this.getZoomScale(t.zoom),i=this._getCenterOffset(t.center)._multiplyBy(-e)._add(this._pathViewport.min);this._pathRoot.style[o.DomUtil.TRANSFORM]=o.DomUtil.getTranslateString(i)+" scale("+e+") ",this._pathZooming=!0},_endPathZoom:function(){this._pathZooming=!1},_updateSvgViewport:function(){if(!this._pathZooming){this._updatePathViewport();var t=this._pathViewport,e=t.min,i=t.max,n=i.x-e.x,s=i.y-e.y,a=this._pathRoot,r=this._panes.overlayPane;o.Browser.mobileWebkit&&r.removeChild(a),o.DomUtil.setPosition(a,e),a.setAttribute("width",n),a.setAttribute("height",s),a.setAttribute("viewBox",[e.x,e.y,n,s].join(" ")),o.Browser.mobileWebkit&&r.appendChild(a)}}}),o.Path.include({bindPopup:function(t,e){return t instanceof o.Popup?this._popup=t:((!this._popup||e)&&(this._popup=new o.Popup(e,this)),this._popup.setContent(t)),this._popupHandlersAdded||(this.on("click",this._openPopup,this).on("remove",this.closePopup,this),this._popupHandlersAdded=!0),this},unbindPopup:function(){return this._popup&&(this._popup=null,this.off("click",this._openPopup).off("remove",this.closePopup),this._popupHandlersAdded=!1),this},openPopup:function(t){return this._popup&&(t=t||this._latlng||this._latlngs[Math.floor(this._latlngs.length/2)],this._openPopup({latlng:t})),this},closePopup:function(){return this._popup&&this._popup._close(),this},_openPopup:function(t){this._popup.setLatLng(t.latlng),this._map.openPopup(this._popup)}}),o.Browser.vml=!o.Browser.svg&&function(){try{var t=e.createElement("div");t.innerHTML='<v:shape adj="1"/>';var i=t.firstChild;return i.style.behavior="url(#default#VML)",i&&"object"==typeof i.adj}catch(n){return!1}}(),o.Path=o.Browser.svg||!o.Browser.vml?o.Path:o.Path.extend({statics:{VML:!0,CLIP_PADDING:.02},_createElement:function(){try{return e.namespaces.add("lvml","urn:schemas-microsoft-com:vml"),function(t){return e.createElement("<lvml:"+t+' class="lvml">')}}catch(t){return function(t){return e.createElement("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="lvml">')}}}(),_initPath:function(){var t=this._container=this._createElement("shape");o.DomUtil.addClass(t,"leaflet-vml-shape"+(this.options.className?" "+this.options.className:"")),this.options.clickable&&o.DomUtil.addClass(t,"leaflet-clickable"),t.coordsize="1 1",this._path=this._createElement("path"),t.appendChild(this._path),this._map._pathRoot.appendChild(t)},_initStyle:function(){this._updateStyle()},_updateStyle:function(){var t=this._stroke,e=this._fill,i=this.options,n=this._container;n.stroked=i.stroke,n.filled=i.fill,i.stroke?(t||(t=this._stroke=this._createElement("stroke"),t.endcap="round",n.appendChild(t)),t.weight=i.weight+"px",t.color=i.color,t.opacity=i.opacity,t.dashStyle=i.dashArray?o.Util.isArray(i.dashArray)?i.dashArray.join(" "):i.dashArray.replace(/( *, *)/g," "):"",i.lineCap&&(t.endcap=i.lineCap.replace("butt","flat")),i.lineJoin&&(t.joinstyle=i.lineJoin)):t&&(n.removeChild(t),this._stroke=null),i.fill?(e||(e=this._fill=this._createElement("fill"),n.appendChild(e)),e.color=i.fillColor||i.color,e.opacity=i.fillOpacity):e&&(n.removeChild(e),this._fill=null)},_updatePath:function(){var t=this._container.style;t.display="none",this._path.v=this.getPathString()+" ",t.display=""}}),o.Map.include(o.Browser.svg||!o.Browser.vml?{}:{_initPathRoot:function(){if(!this._pathRoot){var t=this._pathRoot=e.createElement("div");t.className="leaflet-vml-container",this._panes.overlayPane.appendChild(t),this.on("moveend",this._updatePathViewport),this._updatePathViewport()}}}),o.Browser.canvas=function(){return!!e.createElement("canvas").getContext}(),o.Path=o.Path.SVG&&!t.L_PREFER_CANVAS||!o.Browser.canvas?o.Path:o.Path.extend({statics:{CANVAS:!0,SVG:!1},redraw:function(){return this._map&&(this.projectLatlngs(),this._requestUpdate()),this},setStyle:function(t){return o.setOptions(this,t),this._map&&(this._updateStyle(),this._requestUpdate()),this},onRemove:function(t){t.off("viewreset",this.projectLatlngs,this).off("moveend",this._updatePath,this),this.options.clickable&&(this._map.off("click",this._onClick,this),this._map.off("mousemove",this._onMouseMove,this)),this._requestUpdate(),this.fire("remove"),this._map=null},_requestUpdate:function(){this._map&&!o.Path._updateRequest&&(o.Path._updateRequest=o.Util.requestAnimFrame(this._fireMapMoveEnd,this._map))},_fireMapMoveEnd:function(){o.Path._updateRequest=null,this.fire("moveend")},_initElements:function(){this._map._initPathRoot(),this._ctx=this._map._canvasCtx},_updateStyle:function(){var t=this.options;t.stroke&&(this._ctx.lineWidth=t.weight,this._ctx.strokeStyle=t.color),t.fill&&(this._ctx.fillStyle=t.fillColor||t.color)},_drawPath:function(){var t,e,i,n,s,a;for(this._ctx.beginPath(),t=0,i=this._parts.length;i>t;t++){for(e=0,n=this._parts[t].length;n>e;e++)s=this._parts[t][e],a=(0===e?"move":"line")+"To",this._ctx[a](s.x,s.y);this instanceof o.Polygon&&this._ctx.closePath()}},_checkIfEmpty:function(){return!this._parts.length},_updatePath:function(){if(!this._checkIfEmpty()){var t=this._ctx,e=this.options;this._drawPath(),t.save(),this._updateStyle(),e.fill&&(t.globalAlpha=e.fillOpacity,t.fill()),e.stroke&&(t.globalAlpha=e.opacity,t.stroke()),t.restore()}},_initEvents:function(){this.options.clickable&&(this._map.on("mousemove",this._onMouseMove,this),this._map.on("click",this._onClick,this))},_onClick:function(t){this._containsPoint(t.layerPoint)&&this.fire("click",t)},_onMouseMove:function(t){this._map&&!this._map._animatingZoom&&(this._containsPoint(t.layerPoint)?(this._ctx.canvas.style.cursor="pointer",this._mouseInside=!0,this.fire("mouseover",t)):this._mouseInside&&(this._ctx.canvas.style.cursor="",this._mouseInside=!1,this.fire("mouseout",t)))}}),o.Map.include(o.Path.SVG&&!t.L_PREFER_CANVAS||!o.Browser.canvas?{}:{_initPathRoot:function(){var t,i=this._pathRoot;i||(i=this._pathRoot=e.createElement("canvas"),i.style.position="absolute",t=this._canvasCtx=i.getContext("2d"),t.lineCap="round",t.lineJoin="round",this._panes.overlayPane.appendChild(i),this.options.zoomAnimation&&(this._pathRoot.className="leaflet-zoom-animated",this.on("zoomanim",this._animatePathZoom),this.on("zoomend",this._endPathZoom)),this.on("moveend",this._updateCanvasViewport),this._updateCanvasViewport())},_updateCanvasViewport:function(){if(!this._pathZooming){this._updatePathViewport();var t=this._pathViewport,e=t.min,i=t.max.subtract(e),n=this._pathRoot;o.DomUtil.setPosition(n,e),n.width=i.x,n.height=i.y,n.getContext("2d").translate(-e.x,-e.y)}}}),o.LineUtil={simplify:function(t,e){if(!e||!t.length)return t.slice();var i=e*e;return t=this._reducePoints(t,i),t=this._simplifyDP(t,i)},pointToSegmentDistance:function(t,e,i){return Math.sqrt(this._sqClosestPointOnSegment(t,e,i,!0))},closestPointOnSegment:function(t,e,i){return this._sqClosestPointOnSegment(t,e,i)},_simplifyDP:function(t,e){var n=t.length,o=typeof Uint8Array!=i+""?Uint8Array:Array,s=new o(n);s[0]=s[n-1]=1,this._simplifyDPStep(t,s,e,0,n-1);var a,r=[];for(a=0;n>a;a++)s[a]&&r.push(t[a]);return r},_simplifyDPStep:function(t,e,i,n,o){var s,a,r,h=0;for(a=n+1;o-1>=a;a++)r=this._sqClosestPointOnSegment(t[a],t[n],t[o],!0),r>h&&(s=a,h=r);h>i&&(e[s]=1,this._simplifyDPStep(t,e,i,n,s),this._simplifyDPStep(t,e,i,s,o))},_reducePoints:function(t,e){for(var i=[t[0]],n=1,o=0,s=t.length;s>n;n++)this._sqDist(t[n],t[o])>e&&(i.push(t[n]),o=n);return s-1>o&&i.push(t[s-1]),i},clipSegment:function(t,e,i,n){var o,s,a,r=n?this._lastCode:this._getBitCode(t,i),h=this._getBitCode(e,i);for(this._lastCode=h;;){if(!(r|h))return[t,e];if(r&h)return!1;o=r||h,s=this._getEdgeIntersection(t,e,o,i),a=this._getBitCode(s,i),o===r?(t=s,r=a):(e=s,h=a)}},_getEdgeIntersection:function(t,e,i,n){var s=e.x-t.x,a=e.y-t.y,r=n.min,h=n.max;return 8&i?new o.Point(t.x+s*(h.y-t.y)/a,h.y):4&i?new o.Point(t.x+s*(r.y-t.y)/a,r.y):2&i?new o.Point(h.x,t.y+a*(h.x-t.x)/s):1&i?new o.Point(r.x,t.y+a*(r.x-t.x)/s):void 0},_getBitCode:function(t,e){var i=0;return t.x<e.min.x?i|=1:t.x>e.max.x&&(i|=2),t.y<e.min.y?i|=4:t.y>e.max.y&&(i|=8),i},_sqDist:function(t,e){var i=e.x-t.x,n=e.y-t.y;return i*i+n*n},_sqClosestPointOnSegment:function(t,e,i,n){var s,a=e.x,r=e.y,h=i.x-a,l=i.y-r,u=h*h+l*l;return u>0&&(s=((t.x-a)*h+(t.y-r)*l)/u,s>1?(a=i.x,r=i.y):s>0&&(a+=h*s,r+=l*s)),h=t.x-a,l=t.y-r,n?h*h+l*l:new o.Point(a,r)}},o.Polyline=o.Path.extend({initialize:function(t,e){o.Path.prototype.initialize.call(this,e),this._latlngs=this._convertLatLngs(t)},options:{smoothFactor:1,noClip:!1},projectLatlngs:function(){this._originalPoints=[];for(var t=0,e=this._latlngs.length;e>t;t++)this._originalPoints[t]=this._map.latLngToLayerPoint(this._latlngs[t])},getPathString:function(){for(var t=0,e=this._parts.length,i="";e>t;t++)i+=this._getPathPartStr(this._parts[t]);return i},getLatLngs:function(){return this._latlngs},setLatLngs:function(t){return this._latlngs=this._convertLatLngs(t),this.redraw()},addLatLng:function(t){return this._latlngs.push(o.latLng(t)),this.redraw()},spliceLatLngs:function(){var t=[].splice.apply(this._latlngs,arguments);return this._convertLatLngs(this._latlngs,!0),this.redraw(),t},closestLayerPoint:function(t){for(var e,i,n=1/0,s=this._parts,a=null,r=0,h=s.length;h>r;r++)for(var l=s[r],u=1,c=l.length;c>u;u++){e=l[u-1],i=l[u];var d=o.LineUtil._sqClosestPointOnSegment(t,e,i,!0);n>d&&(n=d,a=o.LineUtil._sqClosestPointOnSegment(t,e,i))}return a&&(a.distance=Math.sqrt(n)),a},getBounds:function(){return new o.LatLngBounds(this.getLatLngs())},_convertLatLngs:function(t,e){var i,n,s=e?t:[];for(i=0,n=t.length;n>i;i++){if(o.Util.isArray(t[i])&&"number"!=typeof t[i][0])return;s[i]=o.latLng(t[i])}return s},_initEvents:function(){o.Path.prototype._initEvents.call(this)},_getPathPartStr:function(t){for(var e,i=o.Path.VML,n=0,s=t.length,a="";s>n;n++)e=t[n],i&&e._round(),a+=(n?"L":"M")+e.x+" "+e.y;return a},_clipPoints:function(){var t,e,i,n=this._originalPoints,s=n.length;if(this.options.noClip)return void(this._parts=[n]);this._parts=[];var a=this._parts,r=this._map._pathViewport,h=o.LineUtil;for(t=0,e=0;s-1>t;t++)i=h.clipSegment(n[t],n[t+1],r,t),i&&(a[e]=a[e]||[],a[e].push(i[0]),(i[1]!==n[t+1]||t===s-2)&&(a[e].push(i[1]),e++))},_simplifyPoints:function(){for(var t=this._parts,e=o.LineUtil,i=0,n=t.length;n>i;i++)t[i]=e.simplify(t[i],this.options.smoothFactor)},_updatePath:function(){this._map&&(this._clipPoints(),this._simplifyPoints(),o.Path.prototype._updatePath.call(this))}}),o.polyline=function(t,e){return new o.Polyline(t,e)},o.PolyUtil={},o.PolyUtil.clipPolygon=function(t,e){var i,n,s,a,r,h,l,u,c,d=[1,4,2,8],p=o.LineUtil;for(n=0,l=t.length;l>n;n++)t[n]._code=p._getBitCode(t[n],e);for(a=0;4>a;a++){for(u=d[a],i=[],n=0,l=t.length,s=l-1;l>n;s=n++)r=t[n],h=t[s],r._code&u?h._code&u||(c=p._getEdgeIntersection(h,r,u,e),c._code=p._getBitCode(c,e),i.push(c)):(h._code&u&&(c=p._getEdgeIntersection(h,r,u,e),c._code=p._getBitCode(c,e),i.push(c)),i.push(r));t=i}return t},o.Polygon=o.Polyline.extend({options:{fill:!0},initialize:function(t,e){o.Polyline.prototype.initialize.call(this,t,e),this._initWithHoles(t)},_initWithHoles:function(t){var e,i,n;if(t&&o.Util.isArray(t[0])&&"number"!=typeof t[0][0])for(this._latlngs=this._convertLatLngs(t[0]),this._holes=t.slice(1),e=0,i=this._holes.length;i>e;e++)n=this._holes[e]=this._convertLatLngs(this._holes[e]),n[0].equals(n[n.length-1])&&n.pop();t=this._latlngs,t.length>=2&&t[0].equals(t[t.length-1])&&t.pop()},projectLatlngs:function(){if(o.Polyline.prototype.projectLatlngs.call(this),this._holePoints=[],this._holes){var t,e,i,n;for(t=0,i=this._holes.length;i>t;t++)for(this._holePoints[t]=[],e=0,n=this._holes[t].length;n>e;e++)this._holePoints[t][e]=this._map.latLngToLayerPoint(this._holes[t][e])}},setLatLngs:function(t){return t&&o.Util.isArray(t[0])&&"number"!=typeof t[0][0]?(this._initWithHoles(t),this.redraw()):o.Polyline.prototype.setLatLngs.call(this,t)},_clipPoints:function(){var t=this._originalPoints,e=[];if(this._parts=[t].concat(this._holePoints),!this.options.noClip){for(var i=0,n=this._parts.length;n>i;i++){var s=o.PolyUtil.clipPolygon(this._parts[i],this._map._pathViewport);s.length&&e.push(s)}this._parts=e}},_getPathPartStr:function(t){var e=o.Polyline.prototype._getPathPartStr.call(this,t);return e+(o.Browser.svg?"z":"x")}}),o.polygon=function(t,e){return new o.Polygon(t,e)},function(){function t(t){return o.FeatureGroup.extend({initialize:function(t,e){this._layers={},this._options=e,this.setLatLngs(t)},setLatLngs:function(e){var i=0,n=e.length;for(this.eachLayer(function(t){n>i?t.setLatLngs(e[i++]):this.removeLayer(t)},this);n>i;)this.addLayer(new t(e[i++],this._options));return this},getLatLngs:function(){var t=[];return this.eachLayer(function(e){t.push(e.getLatLngs())}),t}})}o.MultiPolyline=t(o.Polyline),o.MultiPolygon=t(o.Polygon),o.multiPolyline=function(t,e){return new o.MultiPolyline(t,e)},o.multiPolygon=function(t,e){return new o.MultiPolygon(t,e)}}(),o.Rectangle=o.Polygon.extend({initialize:function(t,e){o.Polygon.prototype.initialize.call(this,this._boundsToLatLngs(t),e)},setBounds:function(t){this.setLatLngs(this._boundsToLatLngs(t))},_boundsToLatLngs:function(t){return t=o.latLngBounds(t),[t.getSouthWest(),t.getNorthWest(),t.getNorthEast(),t.getSouthEast()]}}),o.rectangle=function(t,e){return new o.Rectangle(t,e)},o.Circle=o.Path.extend({initialize:function(t,e,i){o.Path.prototype.initialize.call(this,i),this._latlng=o.latLng(t),this._mRadius=e},options:{fill:!0},setLatLng:function(t){return this._latlng=o.latLng(t),this.redraw()},setRadius:function(t){return this._mRadius=t,this.redraw()},projectLatlngs:function(){var t=this._getLngRadius(),e=this._latlng,i=this._map.latLngToLayerPoint([e.lat,e.lng-t]);this._point=this._map.latLngToLayerPoint(e),this._radius=Math.max(this._point.x-i.x,1)},getBounds:function(){var t=this._getLngRadius(),e=this._mRadius/40075017*360,i=this._latlng;return new o.LatLngBounds([i.lat-e,i.lng-t],[i.lat+e,i.lng+t])},getLatLng:function(){return this._latlng},getPathString:function(){var t=this._point,e=this._radius;return this._checkIfEmpty()?"":o.Browser.svg?"M"+t.x+","+(t.y-e)+"A"+e+","+e+",0,1,1,"+(t.x-.1)+","+(t.y-e)+" z":(t._round(),e=Math.round(e),"AL "+t.x+","+t.y+" "+e+","+e+" 0,23592600")},getRadius:function(){return this._mRadius},_getLatRadius:function(){return this._mRadius/40075017*360},_getLngRadius:function(){return this._getLatRadius()/Math.cos(o.LatLng.DEG_TO_RAD*this._latlng.lat)},_checkIfEmpty:function(){if(!this._map)return!1;var t=this._map._pathViewport,e=this._radius,i=this._point;return i.x-e>t.max.x||i.y-e>t.max.y||i.x+e<t.min.x||i.y+e<t.min.y}}),o.circle=function(t,e,i){return new o.Circle(t,e,i)},o.CircleMarker=o.Circle.extend({options:{radius:10,weight:2},initialize:function(t,e){o.Circle.prototype.initialize.call(this,t,null,e),this._radius=this.options.radius},projectLatlngs:function(){this._point=this._map.latLngToLayerPoint(this._latlng)},_updateStyle:function(){o.Circle.prototype._updateStyle.call(this),this.setRadius(this.options.radius)},setLatLng:function(t){return o.Circle.prototype.setLatLng.call(this,t),this._popup&&this._popup._isOpen&&this._popup.setLatLng(t),this},setRadius:function(t){return this.options.radius=this._radius=t,this.redraw()},getRadius:function(){return this._radius}}),o.circleMarker=function(t,e){return new o.CircleMarker(t,e)},o.Polyline.include(o.Path.CANVAS?{_containsPoint:function(t,e){var i,n,s,a,r,h,l,u=this.options.weight/2;for(o.Browser.touch&&(u+=10),i=0,a=this._parts.length;a>i;i++)for(l=this._parts[i],n=0,r=l.length,s=r-1;r>n;s=n++)if((e||0!==n)&&(h=o.LineUtil.pointToSegmentDistance(t,l[s],l[n]),u>=h))return!0;return!1}}:{}),o.Polygon.include(o.Path.CANVAS?{_containsPoint:function(t){var e,i,n,s,a,r,h,l,u=!1;if(o.Polyline.prototype._containsPoint.call(this,t,!0))return!0;for(s=0,h=this._parts.length;h>s;s++)for(e=this._parts[s],a=0,l=e.length,r=l-1;l>a;r=a++)i=e[a],n=e[r],i.y>t.y!=n.y>t.y&&t.x<(n.x-i.x)*(t.y-i.y)/(n.y-i.y)+i.x&&(u=!u);return u}}:{}),o.Circle.include(o.Path.CANVAS?{_drawPath:function(){var t=this._point;this._ctx.beginPath(),this._ctx.arc(t.x,t.y,this._radius,0,2*Math.PI,!1)},_containsPoint:function(t){var e=this._point,i=this.options.stroke?this.options.weight/2:0;return t.distanceTo(e)<=this._radius+i}}:{}),o.CircleMarker.include(o.Path.CANVAS?{_updateStyle:function(){o.Path.prototype._updateStyle.call(this)}}:{}),o.GeoJSON=o.FeatureGroup.extend({initialize:function(t,e){o.setOptions(this,e),this._layers={},t&&this.addData(t)},addData:function(t){var e,i,n,s=o.Util.isArray(t)?t:t.features;if(s){for(e=0,i=s.length;i>e;e++)n=s[e],(n.geometries||n.geometry||n.features||n.coordinates)&&this.addData(s[e]);return this}var a=this.options;if(!a.filter||a.filter(t)){var r=o.GeoJSON.geometryToLayer(t,a.pointToLayer,a.coordsToLatLng,a);return r.feature=o.GeoJSON.asFeature(t),r.defaultOptions=r.options,this.resetStyle(r),a.onEachFeature&&a.onEachFeature(t,r),this.addLayer(r)}},resetStyle:function(t){var e=this.options.style;e&&(o.Util.extend(t.options,t.defaultOptions),this._setLayerStyle(t,e))},setStyle:function(t){this.eachLayer(function(e){this._setLayerStyle(e,t)},this)},_setLayerStyle:function(t,e){"function"==typeof e&&(e=e(t.feature)),t.setStyle&&t.setStyle(e)}}),o.extend(o.GeoJSON,{geometryToLayer:function(t,e,i,n){var s,a,r,h,l="Feature"===t.type?t.geometry:t,u=l.coordinates,c=[];switch(i=i||this.coordsToLatLng,l.type){case"Point":return s=i(u),e?e(t,s):new o.Marker(s);case"MultiPoint":for(r=0,h=u.length;h>r;r++)s=i(u[r]),c.push(e?e(t,s):new o.Marker(s));return new o.FeatureGroup(c);case"LineString":return a=this.coordsToLatLngs(u,0,i),new o.Polyline(a,n);case"Polygon":if(2===u.length&&!u[1].length)throw new Error("Invalid GeoJSON object.");return a=this.coordsToLatLngs(u,1,i),new o.Polygon(a,n);case"MultiLineString":return a=this.coordsToLatLngs(u,1,i),new o.MultiPolyline(a,n);case"MultiPolygon":return a=this.coordsToLatLngs(u,2,i),new o.MultiPolygon(a,n);case"GeometryCollection":for(r=0,h=l.geometries.length;h>r;r++)c.push(this.geometryToLayer({geometry:l.geometries[r],type:"Feature",properties:t.properties},e,i,n));return new o.FeatureGroup(c);default:throw new Error("Invalid GeoJSON object.")}},coordsToLatLng:function(t){return new o.LatLng(t[1],t[0],t[2])},coordsToLatLngs:function(t,e,i){var n,o,s,a=[];for(o=0,s=t.length;s>o;o++)n=e?this.coordsToLatLngs(t[o],e-1,i):(i||this.coordsToLatLng)(t[o]),a.push(n);return a},latLngToCoords:function(t){var e=[t.lng,t.lat];return t.alt!==i&&e.push(t.alt),e},latLngsToCoords:function(t){for(var e=[],i=0,n=t.length;n>i;i++)e.push(o.GeoJSON.latLngToCoords(t[i]));return e},getFeature:function(t,e){return t.feature?o.extend({},t.feature,{geometry:e}):o.GeoJSON.asFeature(e)},asFeature:function(t){return"Feature"===t.type?t:{type:"Feature",properties:{},geometry:t}}});var a={toGeoJSON:function(){return o.GeoJSON.getFeature(this,{type:"Point",coordinates:o.GeoJSON.latLngToCoords(this.getLatLng())})}};o.Marker.include(a),o.Circle.include(a),o.CircleMarker.include(a),o.Polyline.include({toGeoJSON:function(){return o.GeoJSON.getFeature(this,{type:"LineString",coordinates:o.GeoJSON.latLngsToCoords(this.getLatLngs())})}}),o.Polygon.include({toGeoJSON:function(){var t,e,i,n=[o.GeoJSON.latLngsToCoords(this.getLatLngs())];if(n[0].push(n[0][0]),this._holes)for(t=0,e=this._holes.length;e>t;t++)i=o.GeoJSON.latLngsToCoords(this._holes[t]),i.push(i[0]),n.push(i);return o.GeoJSON.getFeature(this,{type:"Polygon",coordinates:n})}}),function(){function t(t){return function(){var e=[];return this.eachLayer(function(t){e.push(t.toGeoJSON().geometry.coordinates)}),o.GeoJSON.getFeature(this,{type:t,coordinates:e})}}o.MultiPolyline.include({toGeoJSON:t("MultiLineString")}),o.MultiPolygon.include({toGeoJSON:t("MultiPolygon")}),o.LayerGroup.include({toGeoJSON:function(){var e,i=this.feature&&this.feature.geometry,n=[];if(i&&"MultiPoint"===i.type)return t("MultiPoint").call(this);var s=i&&"GeometryCollection"===i.type;return this.eachLayer(function(t){t.toGeoJSON&&(e=t.toGeoJSON(),n.push(s?e.geometry:o.GeoJSON.asFeature(e)))}),s?o.GeoJSON.getFeature(this,{geometries:n,type:"GeometryCollection"}):{type:"FeatureCollection",features:n}}})}(),o.geoJson=function(t,e){return new o.GeoJSON(t,e)},o.DomEvent={addListener:function(t,e,i,n){var s,a,r,h=o.stamp(i),l="_leaflet_"+e+h;return t[l]?this:(s=function(e){return i.call(n||t,e||o.DomEvent._getEvent())},o.Browser.pointer&&0===e.indexOf("touch")?this.addPointerListener(t,e,s,h):(o.Browser.touch&&"dblclick"===e&&this.addDoubleTapListener&&this.addDoubleTapListener(t,s,h),"addEventListener"in t?"mousewheel"===e?(t.addEventListener("DOMMouseScroll",s,!1),t.addEventListener(e,s,!1)):"mouseenter"===e||"mouseleave"===e?(a=s,r="mouseenter"===e?"mouseover":"mouseout",s=function(e){return o.DomEvent._checkMouse(t,e)?a(e):void 0},t.addEventListener(r,s,!1)):"click"===e&&o.Browser.android?(a=s,s=function(t){return o.DomEvent._filterClick(t,a)},t.addEventListener(e,s,!1)):t.addEventListener(e,s,!1):"attachEvent"in t&&t.attachEvent("on"+e,s),t[l]=s,this))},removeListener:function(t,e,i){var n=o.stamp(i),s="_leaflet_"+e+n,a=t[s];return a?(o.Browser.pointer&&0===e.indexOf("touch")?this.removePointerListener(t,e,n):o.Browser.touch&&"dblclick"===e&&this.removeDoubleTapListener?this.removeDoubleTapListener(t,n):"removeEventListener"in t?"mousewheel"===e?(t.removeEventListener("DOMMouseScroll",a,!1),t.removeEventListener(e,a,!1)):"mouseenter"===e||"mouseleave"===e?t.removeEventListener("mouseenter"===e?"mouseover":"mouseout",a,!1):t.removeEventListener(e,a,!1):"detachEvent"in t&&t.detachEvent("on"+e,a),t[s]=null,this):this},stopPropagation:function(t){return t.stopPropagation?t.stopPropagation():t.cancelBubble=!0,o.DomEvent._skipped(t),this},disableScrollPropagation:function(t){var e=o.DomEvent.stopPropagation;return o.DomEvent.on(t,"mousewheel",e).on(t,"MozMousePixelScroll",e)},disableClickPropagation:function(t){for(var e=o.DomEvent.stopPropagation,i=o.Draggable.START.length-1;i>=0;i--)o.DomEvent.on(t,o.Draggable.START[i],e);return o.DomEvent.on(t,"click",o.DomEvent._fakeStop).on(t,"dblclick",e)},preventDefault:function(t){return t.preventDefault?t.preventDefault():t.returnValue=!1,this},stop:function(t){return o.DomEvent.preventDefault(t).stopPropagation(t)},getMousePosition:function(t,e){if(!e)return new o.Point(t.clientX,t.clientY);var i=e.getBoundingClientRect();return new o.Point(t.clientX-i.left-e.clientLeft,t.clientY-i.top-e.clientTop)},getWheelDelta:function(t){var e=0;return t.wheelDelta&&(e=t.wheelDelta/120),t.detail&&(e=-t.detail/3),e},_skipEvents:{},_fakeStop:function(t){o.DomEvent._skipEvents[t.type]=!0},_skipped:function(t){var e=this._skipEvents[t.type];return this._skipEvents[t.type]=!1,e},_checkMouse:function(t,e){var i=e.relatedTarget;if(!i)return!0;try{for(;i&&i!==t;)i=i.parentNode}catch(n){return!1}return i!==t},_getEvent:function(){var e=t.event;if(!e)for(var i=arguments.callee.caller;i&&(e=i.arguments[0],!e||t.Event!==e.constructor);)i=i.caller;return e},_filterClick:function(t,e){var i=t.timeStamp||t.originalEvent.timeStamp,n=o.DomEvent._lastClick&&i-o.DomEvent._lastClick;return n&&n>100&&500>n||t.target._simulatedClick&&!t._simulated?void o.DomEvent.stop(t):(o.DomEvent._lastClick=i,e(t))}},o.DomEvent.on=o.DomEvent.addListener,o.DomEvent.off=o.DomEvent.removeListener,o.Draggable=o.Class.extend({includes:o.Mixin.Events,statics:{START:o.Browser.touch?["touchstart","mousedown"]:["mousedown"],END:{mousedown:"mouseup",touchstart:"touchend",pointerdown:"touchend",MSPointerDown:"touchend"},MOVE:{mousedown:"mousemove",touchstart:"touchmove",pointerdown:"touchmove",MSPointerDown:"touchmove"}},initialize:function(t,e){this._element=t,this._dragStartTarget=e||t},enable:function(){if(!this._enabled){for(var t=o.Draggable.START.length-1;t>=0;t--)o.DomEvent.on(this._dragStartTarget,o.Draggable.START[t],this._onDown,this);this._enabled=!0}},disable:function(){if(this._enabled){for(var t=o.Draggable.START.length-1;t>=0;t--)o.DomEvent.off(this._dragStartTarget,o.Draggable.START[t],this._onDown,this);this._enabled=!1,this._moved=!1}},_onDown:function(t){if(this._moved=!1,!(t.shiftKey||1!==t.which&&1!==t.button&&!t.touches||(o.DomEvent.stopPropagation(t),o.Draggable._disabled||(o.DomUtil.disableImageDrag(),o.DomUtil.disableTextSelection(),this._moving)))){var i=t.touches?t.touches[0]:t;this._startPoint=new o.Point(i.clientX,i.clientY),this._startPos=this._newPos=o.DomUtil.getPosition(this._element),o.DomEvent.on(e,o.Draggable.MOVE[t.type],this._onMove,this).on(e,o.Draggable.END[t.type],this._onUp,this)}},_onMove:function(t){if(t.touches&&t.touches.length>1)return void(this._moved=!0);var i=t.touches&&1===t.touches.length?t.touches[0]:t,n=new o.Point(i.clientX,i.clientY),s=n.subtract(this._startPoint);(s.x||s.y)&&(o.Browser.touch&&Math.abs(s.x)+Math.abs(s.y)<3||(o.DomEvent.preventDefault(t),this._moved||(this.fire("dragstart"),this._moved=!0,this._startPos=o.DomUtil.getPosition(this._element).subtract(s),o.DomUtil.addClass(e.body,"leaflet-dragging"),this._lastTarget=t.target||t.srcElement,o.DomUtil.addClass(this._lastTarget,"leaflet-drag-target")),this._newPos=this._startPos.add(s),this._moving=!0,o.Util.cancelAnimFrame(this._animRequest),this._animRequest=o.Util.requestAnimFrame(this._updatePosition,this,!0,this._dragStartTarget)))},_updatePosition:function(){this.fire("predrag"),o.DomUtil.setPosition(this._element,this._newPos),this.fire("drag")},_onUp:function(){o.DomUtil.removeClass(e.body,"leaflet-dragging"),this._lastTarget&&(o.DomUtil.removeClass(this._lastTarget,"leaflet-drag-target"),this._lastTarget=null);for(var t in o.Draggable.MOVE)o.DomEvent.off(e,o.Draggable.MOVE[t],this._onMove).off(e,o.Draggable.END[t],this._onUp);o.DomUtil.enableImageDrag(),o.DomUtil.enableTextSelection(),this._moved&&this._moving&&(o.Util.cancelAnimFrame(this._animRequest),this.fire("dragend",{distance:this._newPos.distanceTo(this._startPos)})),this._moving=!1}}),o.Handler=o.Class.extend({initialize:function(t){this._map=t},enable:function(){this._enabled||(this._enabled=!0,this.addHooks())},disable:function(){this._enabled&&(this._enabled=!1,this.removeHooks())},enabled:function(){return!!this._enabled}}),o.Map.mergeOptions({dragging:!0,inertia:!o.Browser.android23,inertiaDeceleration:3400,inertiaMaxSpeed:1/0,inertiaThreshold:o.Browser.touch?32:18,easeLinearity:.25,worldCopyJump:!1}),o.Map.Drag=o.Handler.extend({addHooks:function(){if(!this._draggable){var t=this._map;this._draggable=new o.Draggable(t._mapPane,t._container),this._draggable.on({dragstart:this._onDragStart,drag:this._onDrag,dragend:this._onDragEnd},this),t.options.worldCopyJump&&(this._draggable.on("predrag",this._onPreDrag,this),t.on("viewreset",this._onViewReset,this),t.whenReady(this._onViewReset,this))}this._draggable.enable()},removeHooks:function(){this._draggable.disable()},moved:function(){return this._draggable&&this._draggable._moved},_onDragStart:function(){var t=this._map;t._panAnim&&t._panAnim.stop(),t.fire("movestart").fire("dragstart"),t.options.inertia&&(this._positions=[],this._times=[])},_onDrag:function(){if(this._map.options.inertia){var t=this._lastTime=+new Date,e=this._lastPos=this._draggable._newPos;this._positions.push(e),this._times.push(t),t-this._times[0]>200&&(this._positions.shift(),this._times.shift())}this._map.fire("move").fire("drag")},_onViewReset:function(){var t=this._map.getSize()._divideBy(2),e=this._map.latLngToLayerPoint([0,0]);this._initialWorldOffset=e.subtract(t).x,this._worldWidth=this._map.project([0,180]).x},_onPreDrag:function(){var t=this._worldWidth,e=Math.round(t/2),i=this._initialWorldOffset,n=this._draggable._newPos.x,o=(n-e+i)%t+e-i,s=(n+e+i)%t-e-i,a=Math.abs(o+i)<Math.abs(s+i)?o:s;this._draggable._newPos.x=a},_onDragEnd:function(t){var e=this._map,i=e.options,n=+new Date-this._lastTime,s=!i.inertia||n>i.inertiaThreshold||!this._positions[0];if(e.fire("dragend",t),s)e.fire("moveend");else{var a=this._lastPos.subtract(this._positions[0]),r=(this._lastTime+n-this._times[0])/1e3,h=i.easeLinearity,l=a.multiplyBy(h/r),u=l.distanceTo([0,0]),c=Math.min(i.inertiaMaxSpeed,u),d=l.multiplyBy(c/u),p=c/(i.inertiaDeceleration*h),_=d.multiplyBy(-p/2).round();_.x&&_.y?(_=e._limitOffset(_,e.options.maxBounds),o.Util.requestAnimFrame(function(){e.panBy(_,{duration:p,easeLinearity:h,noMoveStart:!0})})):e.fire("moveend")}}}),o.Map.addInitHook("addHandler","dragging",o.Map.Drag),o.Map.mergeOptions({doubleClickZoom:!0}),o.Map.DoubleClickZoom=o.Handler.extend({addHooks:function(){this._map.on("dblclick",this._onDoubleClick,this)},removeHooks:function(){this._map.off("dblclick",this._onDoubleClick,this)},_onDoubleClick:function(t){var e=this._map,i=e.getZoom()+(t.originalEvent.shiftKey?-1:1);"center"===e.options.doubleClickZoom?e.setZoom(i):e.setZoomAround(t.containerPoint,i)}}),o.Map.addInitHook("addHandler","doubleClickZoom",o.Map.DoubleClickZoom),o.Map.mergeOptions({scrollWheelZoom:!0}),o.Map.ScrollWheelZoom=o.Handler.extend({addHooks:function(){o.DomEvent.on(this._map._container,"mousewheel",this._onWheelScroll,this),o.DomEvent.on(this._map._container,"MozMousePixelScroll",o.DomEvent.preventDefault),this._delta=0},removeHooks:function(){o.DomEvent.off(this._map._container,"mousewheel",this._onWheelScroll),o.DomEvent.off(this._map._container,"MozMousePixelScroll",o.DomEvent.preventDefault)},_onWheelScroll:function(t){var e=o.DomEvent.getWheelDelta(t);this._delta+=e,this._lastMousePos=this._map.mouseEventToContainerPoint(t),this._startTime||(this._startTime=+new Date);var i=Math.max(40-(+new Date-this._startTime),0);clearTimeout(this._timer),this._timer=setTimeout(o.bind(this._performZoom,this),i),o.DomEvent.preventDefault(t),o.DomEvent.stopPropagation(t)},_performZoom:function(){var t=this._map,e=this._delta,i=t.getZoom();e=e>0?Math.ceil(e):Math.floor(e),e=Math.max(Math.min(e,4),-4),e=t._limitZoom(i+e)-i,this._delta=0,this._startTime=null,e&&("center"===t.options.scrollWheelZoom?t.setZoom(i+e):t.setZoomAround(this._lastMousePos,i+e))}}),o.Map.addInitHook("addHandler","scrollWheelZoom",o.Map.ScrollWheelZoom),o.extend(o.DomEvent,{_touchstart:o.Browser.msPointer?"MSPointerDown":o.Browser.pointer?"pointerdown":"touchstart",_touchend:o.Browser.msPointer?"MSPointerUp":o.Browser.pointer?"pointerup":"touchend",addDoubleTapListener:function(t,i,n){function s(t){var e;if(o.Browser.pointer?(_.push(t.pointerId),e=_.length):e=t.touches.length,!(e>1)){var i=Date.now(),n=i-(r||i);h=t.touches?t.touches[0]:t,l=n>0&&u>=n,r=i}}function a(t){if(o.Browser.pointer){var e=_.indexOf(t.pointerId);if(-1===e)return;_.splice(e,1)}if(l){if(o.Browser.pointer){var n,s={};for(var a in h)n=h[a],s[a]="function"==typeof n?n.bind(h):n;h=s}h.type="dblclick",i(h),r=null}}var r,h,l=!1,u=250,c="_leaflet_",d=this._touchstart,p=this._touchend,_=[];t[c+d+n]=s,t[c+p+n]=a;var m=o.Browser.pointer?e.documentElement:t;return t.addEventListener(d,s,!1),m.addEventListener(p,a,!1),o.Browser.pointer&&m.addEventListener(o.DomEvent.POINTER_CANCEL,a,!1),this},removeDoubleTapListener:function(t,i){var n="_leaflet_";return t.removeEventListener(this._touchstart,t[n+this._touchstart+i],!1),(o.Browser.pointer?e.documentElement:t).removeEventListener(this._touchend,t[n+this._touchend+i],!1),o.Browser.pointer&&e.documentElement.removeEventListener(o.DomEvent.POINTER_CANCEL,t[n+this._touchend+i],!1),this}}),o.extend(o.DomEvent,{POINTER_DOWN:o.Browser.msPointer?"MSPointerDown":"pointerdown",POINTER_MOVE:o.Browser.msPointer?"MSPointerMove":"pointermove",POINTER_UP:o.Browser.msPointer?"MSPointerUp":"pointerup",POINTER_CANCEL:o.Browser.msPointer?"MSPointerCancel":"pointercancel",_pointers:[],_pointerDocumentListener:!1,addPointerListener:function(t,e,i,n){switch(e){case"touchstart":return this.addPointerListenerStart(t,e,i,n);case"touchend":return this.addPointerListenerEnd(t,e,i,n);case"touchmove":return this.addPointerListenerMove(t,e,i,n);default:throw"Unknown touch event type"}},addPointerListenerStart:function(t,i,n,s){var a="_leaflet_",r=this._pointers,h=function(t){o.DomEvent.preventDefault(t);for(var e=!1,i=0;i<r.length;i++)if(r[i].pointerId===t.pointerId){e=!0;
break}e||r.push(t),t.touches=r.slice(),t.changedTouches=[t],n(t)};if(t[a+"touchstart"+s]=h,t.addEventListener(this.POINTER_DOWN,h,!1),!this._pointerDocumentListener){var l=function(t){for(var e=0;e<r.length;e++)if(r[e].pointerId===t.pointerId){r.splice(e,1);break}};e.documentElement.addEventListener(this.POINTER_UP,l,!1),e.documentElement.addEventListener(this.POINTER_CANCEL,l,!1),this._pointerDocumentListener=!0}return this},addPointerListenerMove:function(t,e,i,n){function o(t){if(t.pointerType!==t.MSPOINTER_TYPE_MOUSE&&"mouse"!==t.pointerType||0!==t.buttons){for(var e=0;e<a.length;e++)if(a[e].pointerId===t.pointerId){a[e]=t;break}t.touches=a.slice(),t.changedTouches=[t],i(t)}}var s="_leaflet_",a=this._pointers;return t[s+"touchmove"+n]=o,t.addEventListener(this.POINTER_MOVE,o,!1),this},addPointerListenerEnd:function(t,e,i,n){var o="_leaflet_",s=this._pointers,a=function(t){for(var e=0;e<s.length;e++)if(s[e].pointerId===t.pointerId){s.splice(e,1);break}t.touches=s.slice(),t.changedTouches=[t],i(t)};return t[o+"touchend"+n]=a,t.addEventListener(this.POINTER_UP,a,!1),t.addEventListener(this.POINTER_CANCEL,a,!1),this},removePointerListener:function(t,e,i){var n="_leaflet_",o=t[n+e+i];switch(e){case"touchstart":t.removeEventListener(this.POINTER_DOWN,o,!1);break;case"touchmove":t.removeEventListener(this.POINTER_MOVE,o,!1);break;case"touchend":t.removeEventListener(this.POINTER_UP,o,!1),t.removeEventListener(this.POINTER_CANCEL,o,!1)}return this}}),o.Map.mergeOptions({touchZoom:o.Browser.touch&&!o.Browser.android23,bounceAtZoomLimits:!0}),o.Map.TouchZoom=o.Handler.extend({addHooks:function(){o.DomEvent.on(this._map._container,"touchstart",this._onTouchStart,this)},removeHooks:function(){o.DomEvent.off(this._map._container,"touchstart",this._onTouchStart,this)},_onTouchStart:function(t){var i=this._map;if(t.touches&&2===t.touches.length&&!i._animatingZoom&&!this._zooming){var n=i.mouseEventToLayerPoint(t.touches[0]),s=i.mouseEventToLayerPoint(t.touches[1]),a=i._getCenterLayerPoint();this._startCenter=n.add(s)._divideBy(2),this._startDist=n.distanceTo(s),this._moved=!1,this._zooming=!0,this._centerOffset=a.subtract(this._startCenter),i._panAnim&&i._panAnim.stop(),o.DomEvent.on(e,"touchmove",this._onTouchMove,this).on(e,"touchend",this._onTouchEnd,this),o.DomEvent.preventDefault(t)}},_onTouchMove:function(t){var e=this._map;if(t.touches&&2===t.touches.length&&this._zooming){var i=e.mouseEventToLayerPoint(t.touches[0]),n=e.mouseEventToLayerPoint(t.touches[1]);this._scale=i.distanceTo(n)/this._startDist,this._delta=i._add(n)._divideBy(2)._subtract(this._startCenter),1!==this._scale&&(e.options.bounceAtZoomLimits||!(e.getZoom()===e.getMinZoom()&&this._scale<1||e.getZoom()===e.getMaxZoom()&&this._scale>1))&&(this._moved||(o.DomUtil.addClass(e._mapPane,"leaflet-touching"),e.fire("movestart").fire("zoomstart"),this._moved=!0),o.Util.cancelAnimFrame(this._animRequest),this._animRequest=o.Util.requestAnimFrame(this._updateOnMove,this,!0,this._map._container),o.DomEvent.preventDefault(t))}},_updateOnMove:function(){var t=this._map,e=this._getScaleOrigin(),i=t.layerPointToLatLng(e),n=t.getScaleZoom(this._scale);t._animateZoom(i,n,this._startCenter,this._scale,this._delta,!1,!0)},_onTouchEnd:function(){if(!this._moved||!this._zooming)return void(this._zooming=!1);var t=this._map;this._zooming=!1,o.DomUtil.removeClass(t._mapPane,"leaflet-touching"),o.Util.cancelAnimFrame(this._animRequest),o.DomEvent.off(e,"touchmove",this._onTouchMove).off(e,"touchend",this._onTouchEnd);var i=this._getScaleOrigin(),n=t.layerPointToLatLng(i),s=t.getZoom(),a=t.getScaleZoom(this._scale)-s,r=a>0?Math.ceil(a):Math.floor(a),h=t._limitZoom(s+r),l=t.getZoomScale(h)/this._scale;t._animateZoom(n,h,i,l)},_getScaleOrigin:function(){var t=this._centerOffset.subtract(this._delta).divideBy(this._scale);return this._startCenter.add(t)}}),o.Map.addInitHook("addHandler","touchZoom",o.Map.TouchZoom),o.Map.mergeOptions({tap:!0,tapTolerance:15}),o.Map.Tap=o.Handler.extend({addHooks:function(){o.DomEvent.on(this._map._container,"touchstart",this._onDown,this)},removeHooks:function(){o.DomEvent.off(this._map._container,"touchstart",this._onDown,this)},_onDown:function(t){if(t.touches){if(o.DomEvent.preventDefault(t),this._fireClick=!0,t.touches.length>1)return this._fireClick=!1,void clearTimeout(this._holdTimeout);var i=t.touches[0],n=i.target;this._startPos=this._newPos=new o.Point(i.clientX,i.clientY),n.tagName&&"a"===n.tagName.toLowerCase()&&o.DomUtil.addClass(n,"leaflet-active"),this._holdTimeout=setTimeout(o.bind(function(){this._isTapValid()&&(this._fireClick=!1,this._onUp(),this._simulateEvent("contextmenu",i))},this),1e3),o.DomEvent.on(e,"touchmove",this._onMove,this).on(e,"touchend",this._onUp,this)}},_onUp:function(t){if(clearTimeout(this._holdTimeout),o.DomEvent.off(e,"touchmove",this._onMove,this).off(e,"touchend",this._onUp,this),this._fireClick&&t&&t.changedTouches){var i=t.changedTouches[0],n=i.target;n&&n.tagName&&"a"===n.tagName.toLowerCase()&&o.DomUtil.removeClass(n,"leaflet-active"),this._isTapValid()&&this._simulateEvent("click",i)}},_isTapValid:function(){return this._newPos.distanceTo(this._startPos)<=this._map.options.tapTolerance},_onMove:function(t){var e=t.touches[0];this._newPos=new o.Point(e.clientX,e.clientY)},_simulateEvent:function(i,n){var o=e.createEvent("MouseEvents");o._simulated=!0,n.target._simulatedClick=!0,o.initMouseEvent(i,!0,!0,t,1,n.screenX,n.screenY,n.clientX,n.clientY,!1,!1,!1,!1,0,null),n.target.dispatchEvent(o)}}),o.Browser.touch&&!o.Browser.pointer&&o.Map.addInitHook("addHandler","tap",o.Map.Tap),o.Map.mergeOptions({boxZoom:!0}),o.Map.BoxZoom=o.Handler.extend({initialize:function(t){this._map=t,this._container=t._container,this._pane=t._panes.overlayPane,this._moved=!1},addHooks:function(){o.DomEvent.on(this._container,"mousedown",this._onMouseDown,this)},removeHooks:function(){o.DomEvent.off(this._container,"mousedown",this._onMouseDown),this._moved=!1},moved:function(){return this._moved},_onMouseDown:function(t){return this._moved=!1,!t.shiftKey||1!==t.which&&1!==t.button?!1:(o.DomUtil.disableTextSelection(),o.DomUtil.disableImageDrag(),this._startLayerPoint=this._map.mouseEventToLayerPoint(t),void o.DomEvent.on(e,"mousemove",this._onMouseMove,this).on(e,"mouseup",this._onMouseUp,this).on(e,"keydown",this._onKeyDown,this))},_onMouseMove:function(t){this._moved||(this._box=o.DomUtil.create("div","leaflet-zoom-box",this._pane),o.DomUtil.setPosition(this._box,this._startLayerPoint),this._container.style.cursor="crosshair",this._map.fire("boxzoomstart"));var e=this._startLayerPoint,i=this._box,n=this._map.mouseEventToLayerPoint(t),s=n.subtract(e),a=new o.Point(Math.min(n.x,e.x),Math.min(n.y,e.y));o.DomUtil.setPosition(i,a),this._moved=!0,i.style.width=Math.max(0,Math.abs(s.x)-4)+"px",i.style.height=Math.max(0,Math.abs(s.y)-4)+"px"},_finish:function(){this._moved&&(this._pane.removeChild(this._box),this._container.style.cursor=""),o.DomUtil.enableTextSelection(),o.DomUtil.enableImageDrag(),o.DomEvent.off(e,"mousemove",this._onMouseMove).off(e,"mouseup",this._onMouseUp).off(e,"keydown",this._onKeyDown)},_onMouseUp:function(t){this._finish();var e=this._map,i=e.mouseEventToLayerPoint(t);if(!this._startLayerPoint.equals(i)){var n=new o.LatLngBounds(e.layerPointToLatLng(this._startLayerPoint),e.layerPointToLatLng(i));e.fitBounds(n),e.fire("boxzoomend",{boxZoomBounds:n})}},_onKeyDown:function(t){27===t.keyCode&&this._finish()}}),o.Map.addInitHook("addHandler","boxZoom",o.Map.BoxZoom),o.Map.mergeOptions({keyboard:!0,keyboardPanOffset:80,keyboardZoomOffset:1}),o.Map.Keyboard=o.Handler.extend({keyCodes:{left:[37],right:[39],down:[40],up:[38],zoomIn:[187,107,61,171],zoomOut:[189,109,173]},initialize:function(t){this._map=t,this._setPanOffset(t.options.keyboardPanOffset),this._setZoomOffset(t.options.keyboardZoomOffset)},addHooks:function(){var t=this._map._container;-1===t.tabIndex&&(t.tabIndex="0"),o.DomEvent.on(t,"focus",this._onFocus,this).on(t,"blur",this._onBlur,this).on(t,"mousedown",this._onMouseDown,this),this._map.on("focus",this._addHooks,this).on("blur",this._removeHooks,this)},removeHooks:function(){this._removeHooks();var t=this._map._container;o.DomEvent.off(t,"focus",this._onFocus,this).off(t,"blur",this._onBlur,this).off(t,"mousedown",this._onMouseDown,this),this._map.off("focus",this._addHooks,this).off("blur",this._removeHooks,this)},_onMouseDown:function(){if(!this._focused){var i=e.body,n=e.documentElement,o=i.scrollTop||n.scrollTop,s=i.scrollLeft||n.scrollLeft;this._map._container.focus(),t.scrollTo(s,o)}},_onFocus:function(){this._focused=!0,this._map.fire("focus")},_onBlur:function(){this._focused=!1,this._map.fire("blur")},_setPanOffset:function(t){var e,i,n=this._panKeys={},o=this.keyCodes;for(e=0,i=o.left.length;i>e;e++)n[o.left[e]]=[-1*t,0];for(e=0,i=o.right.length;i>e;e++)n[o.right[e]]=[t,0];for(e=0,i=o.down.length;i>e;e++)n[o.down[e]]=[0,t];for(e=0,i=o.up.length;i>e;e++)n[o.up[e]]=[0,-1*t]},_setZoomOffset:function(t){var e,i,n=this._zoomKeys={},o=this.keyCodes;for(e=0,i=o.zoomIn.length;i>e;e++)n[o.zoomIn[e]]=t;for(e=0,i=o.zoomOut.length;i>e;e++)n[o.zoomOut[e]]=-t},_addHooks:function(){o.DomEvent.on(e,"keydown",this._onKeyDown,this)},_removeHooks:function(){o.DomEvent.off(e,"keydown",this._onKeyDown,this)},_onKeyDown:function(t){var e=t.keyCode,i=this._map;if(e in this._panKeys){if(i._panAnim&&i._panAnim._inProgress)return;i.panBy(this._panKeys[e]),i.options.maxBounds&&i.panInsideBounds(i.options.maxBounds)}else{if(!(e in this._zoomKeys))return;i.setZoom(i.getZoom()+this._zoomKeys[e])}o.DomEvent.stop(t)}}),o.Map.addInitHook("addHandler","keyboard",o.Map.Keyboard),o.Handler.MarkerDrag=o.Handler.extend({initialize:function(t){this._marker=t},addHooks:function(){var t=this._marker._icon;this._draggable||(this._draggable=new o.Draggable(t,t)),this._draggable.on("dragstart",this._onDragStart,this).on("drag",this._onDrag,this).on("dragend",this._onDragEnd,this),this._draggable.enable(),o.DomUtil.addClass(this._marker._icon,"leaflet-marker-draggable")},removeHooks:function(){this._draggable.off("dragstart",this._onDragStart,this).off("drag",this._onDrag,this).off("dragend",this._onDragEnd,this),this._draggable.disable(),o.DomUtil.removeClass(this._marker._icon,"leaflet-marker-draggable")},moved:function(){return this._draggable&&this._draggable._moved},_onDragStart:function(){this._marker.closePopup().fire("movestart").fire("dragstart")},_onDrag:function(){var t=this._marker,e=t._shadow,i=o.DomUtil.getPosition(t._icon),n=t._map.layerPointToLatLng(i);e&&o.DomUtil.setPosition(e,i),t._latlng=n,t.fire("move",{latlng:n}).fire("drag")},_onDragEnd:function(t){this._marker.fire("moveend").fire("dragend",t)}}),o.Control=o.Class.extend({options:{position:"topright"},initialize:function(t){o.setOptions(this,t)},getPosition:function(){return this.options.position},setPosition:function(t){var e=this._map;return e&&e.removeControl(this),this.options.position=t,e&&e.addControl(this),this},getContainer:function(){return this._container},addTo:function(t){this._map=t;var e=this._container=this.onAdd(t),i=this.getPosition(),n=t._controlCorners[i];return o.DomUtil.addClass(e,"leaflet-control"),-1!==i.indexOf("bottom")?n.insertBefore(e,n.firstChild):n.appendChild(e),this},removeFrom:function(t){var e=this.getPosition(),i=t._controlCorners[e];return i.removeChild(this._container),this._map=null,this.onRemove&&this.onRemove(t),this},_refocusOnMap:function(){this._map&&this._map.getContainer().focus()}}),o.control=function(t){return new o.Control(t)},o.Map.include({addControl:function(t){return t.addTo(this),this},removeControl:function(t){return t.removeFrom(this),this},_initControlPos:function(){function t(t,s){var a=i+t+" "+i+s;e[t+s]=o.DomUtil.create("div",a,n)}var e=this._controlCorners={},i="leaflet-",n=this._controlContainer=o.DomUtil.create("div",i+"control-container",this._container);t("top","left"),t("top","right"),t("bottom","left"),t("bottom","right")},_clearControlPos:function(){this._container.removeChild(this._controlContainer)}}),o.Control.Zoom=o.Control.extend({options:{position:"topleft",zoomInText:"+",zoomInTitle:"Zoom in",zoomOutText:"-",zoomOutTitle:"Zoom out"},onAdd:function(t){var e="leaflet-control-zoom",i=o.DomUtil.create("div",e+" leaflet-bar");return this._map=t,this._zoomInButton=this._createButton(this.options.zoomInText,this.options.zoomInTitle,e+"-in",i,this._zoomIn,this),this._zoomOutButton=this._createButton(this.options.zoomOutText,this.options.zoomOutTitle,e+"-out",i,this._zoomOut,this),this._updateDisabled(),t.on("zoomend zoomlevelschange",this._updateDisabled,this),i},onRemove:function(t){t.off("zoomend zoomlevelschange",this._updateDisabled,this)},_zoomIn:function(t){this._map.zoomIn(t.shiftKey?3:1)},_zoomOut:function(t){this._map.zoomOut(t.shiftKey?3:1)},_createButton:function(t,e,i,n,s,a){var r=o.DomUtil.create("a",i,n);r.innerHTML=t,r.href="#",r.title=e;var h=o.DomEvent.stopPropagation;return o.DomEvent.on(r,"click",h).on(r,"mousedown",h).on(r,"dblclick",h).on(r,"click",o.DomEvent.preventDefault).on(r,"click",s,a).on(r,"click",this._refocusOnMap,a),r},_updateDisabled:function(){var t=this._map,e="leaflet-disabled";o.DomUtil.removeClass(this._zoomInButton,e),o.DomUtil.removeClass(this._zoomOutButton,e),t._zoom===t.getMinZoom()&&o.DomUtil.addClass(this._zoomOutButton,e),t._zoom===t.getMaxZoom()&&o.DomUtil.addClass(this._zoomInButton,e)}}),o.Map.mergeOptions({zoomControl:!0}),o.Map.addInitHook(function(){this.options.zoomControl&&(this.zoomControl=new o.Control.Zoom,this.addControl(this.zoomControl))}),o.control.zoom=function(t){return new o.Control.Zoom(t)},o.Control.Attribution=o.Control.extend({options:{position:"bottomright",prefix:'<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'},initialize:function(t){o.setOptions(this,t),this._attributions={}},onAdd:function(t){this._container=o.DomUtil.create("div","leaflet-control-attribution"),o.DomEvent.disableClickPropagation(this._container);for(var e in t._layers)t._layers[e].getAttribution&&this.addAttribution(t._layers[e].getAttribution());return t.on("layeradd",this._onLayerAdd,this).on("layerremove",this._onLayerRemove,this),this._update(),this._container},onRemove:function(t){t.off("layeradd",this._onLayerAdd).off("layerremove",this._onLayerRemove)},setPrefix:function(t){return this.options.prefix=t,this._update(),this},addAttribution:function(t){return t?(this._attributions[t]||(this._attributions[t]=0),this._attributions[t]++,this._update(),this):void 0},removeAttribution:function(t){return t?(this._attributions[t]&&(this._attributions[t]--,this._update()),this):void 0},_update:function(){if(this._map){var t=[];for(var e in this._attributions)this._attributions[e]&&t.push(e);var i=[];this.options.prefix&&i.push(this.options.prefix),t.length&&i.push(t.join(", ")),this._container.innerHTML=i.join(" | ")}},_onLayerAdd:function(t){t.layer.getAttribution&&this.addAttribution(t.layer.getAttribution())},_onLayerRemove:function(t){t.layer.getAttribution&&this.removeAttribution(t.layer.getAttribution())}}),o.Map.mergeOptions({attributionControl:!0}),o.Map.addInitHook(function(){this.options.attributionControl&&(this.attributionControl=(new o.Control.Attribution).addTo(this))}),o.control.attribution=function(t){return new o.Control.Attribution(t)},o.Control.Scale=o.Control.extend({options:{position:"bottomleft",maxWidth:100,metric:!0,imperial:!0,updateWhenIdle:!1},onAdd:function(t){this._map=t;var e="leaflet-control-scale",i=o.DomUtil.create("div",e),n=this.options;return this._addScales(n,e,i),t.on(n.updateWhenIdle?"moveend":"move",this._update,this),t.whenReady(this._update,this),i},onRemove:function(t){t.off(this.options.updateWhenIdle?"moveend":"move",this._update,this)},_addScales:function(t,e,i){t.metric&&(this._mScale=o.DomUtil.create("div",e+"-line",i)),t.imperial&&(this._iScale=o.DomUtil.create("div",e+"-line",i))},_update:function(){var t=this._map.getBounds(),e=t.getCenter().lat,i=6378137*Math.PI*Math.cos(e*Math.PI/180),n=i*(t.getNorthEast().lng-t.getSouthWest().lng)/180,o=this._map.getSize(),s=this.options,a=0;o.x>0&&(a=n*(s.maxWidth/o.x)),this._updateScales(s,a)},_updateScales:function(t,e){t.metric&&e&&this._updateMetric(e),t.imperial&&e&&this._updateImperial(e)},_updateMetric:function(t){var e=this._getRoundNum(t);this._mScale.style.width=this._getScaleWidth(e/t)+"px",this._mScale.innerHTML=1e3>e?e+" m":e/1e3+" km"},_updateImperial:function(t){var e,i,n,o=3.2808399*t,s=this._iScale;o>5280?(e=o/5280,i=this._getRoundNum(e),s.style.width=this._getScaleWidth(i/e)+"px",s.innerHTML=i+" mi"):(n=this._getRoundNum(o),s.style.width=this._getScaleWidth(n/o)+"px",s.innerHTML=n+" ft")},_getScaleWidth:function(t){return Math.round(this.options.maxWidth*t)-10},_getRoundNum:function(t){var e=Math.pow(10,(Math.floor(t)+"").length-1),i=t/e;return i=i>=10?10:i>=5?5:i>=3?3:i>=2?2:1,e*i}}),o.control.scale=function(t){return new o.Control.Scale(t)},o.Control.Layers=o.Control.extend({options:{collapsed:!0,position:"topright",autoZIndex:!0},initialize:function(t,e,i){o.setOptions(this,i),this._layers={},this._lastZIndex=0,this._handlingClick=!1;for(var n in t)this._addLayer(t[n],n);for(n in e)this._addLayer(e[n],n,!0)},onAdd:function(t){return this._initLayout(),this._update(),t.on("layeradd",this._onLayerChange,this).on("layerremove",this._onLayerChange,this),this._container},onRemove:function(t){t.off("layeradd",this._onLayerChange,this).off("layerremove",this._onLayerChange,this)},addBaseLayer:function(t,e){return this._addLayer(t,e),this._update(),this},addOverlay:function(t,e){return this._addLayer(t,e,!0),this._update(),this},removeLayer:function(t){var e=o.stamp(t);return delete this._layers[e],this._update(),this},_initLayout:function(){var t="leaflet-control-layers",e=this._container=o.DomUtil.create("div",t);e.setAttribute("aria-haspopup",!0),o.Browser.touch?o.DomEvent.on(e,"click",o.DomEvent.stopPropagation):o.DomEvent.disableClickPropagation(e).disableScrollPropagation(e);var i=this._form=o.DomUtil.create("form",t+"-list");if(this.options.collapsed){o.Browser.android||o.DomEvent.on(e,"mouseover",this._expand,this).on(e,"mouseout",this._collapse,this);var n=this._layersLink=o.DomUtil.create("a",t+"-toggle",e);n.href="#",n.title="Layers",o.Browser.touch?o.DomEvent.on(n,"click",o.DomEvent.stop).on(n,"click",this._expand,this):o.DomEvent.on(n,"focus",this._expand,this),o.DomEvent.on(i,"click",function(){setTimeout(o.bind(this._onInputClick,this),0)},this),this._map.on("click",this._collapse,this)}else this._expand();this._baseLayersList=o.DomUtil.create("div",t+"-base",i),this._separator=o.DomUtil.create("div",t+"-separator",i),this._overlaysList=o.DomUtil.create("div",t+"-overlays",i),e.appendChild(i)},_addLayer:function(t,e,i){var n=o.stamp(t);this._layers[n]={layer:t,name:e,overlay:i},this.options.autoZIndex&&t.setZIndex&&(this._lastZIndex++,t.setZIndex(this._lastZIndex))},_update:function(){if(this._container){this._baseLayersList.innerHTML="",this._overlaysList.innerHTML="";var t,e,i=!1,n=!1;for(t in this._layers)e=this._layers[t],this._addItem(e),n=n||e.overlay,i=i||!e.overlay;this._separator.style.display=n&&i?"":"none"}},_onLayerChange:function(t){var e=this._layers[o.stamp(t.layer)];if(e){this._handlingClick||this._update();var i=e.overlay?"layeradd"===t.type?"overlayadd":"overlayremove":"layeradd"===t.type?"baselayerchange":null;i&&this._map.fire(i,e)}},_createRadioElement:function(t,i){var n='<input type="radio" class="leaflet-control-layers-selector" name="'+t+'"';i&&(n+=' checked="checked"'),n+="/>";var o=e.createElement("div");return o.innerHTML=n,o.firstChild},_addItem:function(t){var i,n=e.createElement("label"),s=this._map.hasLayer(t.layer);t.overlay?(i=e.createElement("input"),i.type="checkbox",i.className="leaflet-control-layers-selector",i.defaultChecked=s):i=this._createRadioElement("leaflet-base-layers",s),i.layerId=o.stamp(t.layer),o.DomEvent.on(i,"click",this._onInputClick,this);var a=e.createElement("span");a.innerHTML=" "+t.name,n.appendChild(i),n.appendChild(a);var r=t.overlay?this._overlaysList:this._baseLayersList;return r.appendChild(n),n},_onInputClick:function(){var t,e,i,n=this._form.getElementsByTagName("input"),o=n.length;for(this._handlingClick=!0,t=0;o>t;t++)e=n[t],i=this._layers[e.layerId],e.checked&&!this._map.hasLayer(i.layer)?this._map.addLayer(i.layer):!e.checked&&this._map.hasLayer(i.layer)&&this._map.removeLayer(i.layer);this._handlingClick=!1,this._refocusOnMap()},_expand:function(){o.DomUtil.addClass(this._container,"leaflet-control-layers-expanded")},_collapse:function(){this._container.className=this._container.className.replace(" leaflet-control-layers-expanded","")}}),o.control.layers=function(t,e,i){return new o.Control.Layers(t,e,i)},o.PosAnimation=o.Class.extend({includes:o.Mixin.Events,run:function(t,e,i,n){this.stop(),this._el=t,this._inProgress=!0,this._newPos=e,this.fire("start"),t.style[o.DomUtil.TRANSITION]="all "+(i||.25)+"s cubic-bezier(0,0,"+(n||.5)+",1)",o.DomEvent.on(t,o.DomUtil.TRANSITION_END,this._onTransitionEnd,this),o.DomUtil.setPosition(t,e),o.Util.falseFn(t.offsetWidth),this._stepTimer=setInterval(o.bind(this._onStep,this),50)},stop:function(){this._inProgress&&(o.DomUtil.setPosition(this._el,this._getPos()),this._onTransitionEnd(),o.Util.falseFn(this._el.offsetWidth))},_onStep:function(){var t=this._getPos();return t?(this._el._leaflet_pos=t,void this.fire("step")):void this._onTransitionEnd()},_transformRe:/([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/,_getPos:function(){var e,i,n,s=this._el,a=t.getComputedStyle(s);if(o.Browser.any3d){if(n=a[o.DomUtil.TRANSFORM].match(this._transformRe),!n)return;e=parseFloat(n[1]),i=parseFloat(n[2])}else e=parseFloat(a.left),i=parseFloat(a.top);return new o.Point(e,i,!0)},_onTransitionEnd:function(){o.DomEvent.off(this._el,o.DomUtil.TRANSITION_END,this._onTransitionEnd,this),this._inProgress&&(this._inProgress=!1,this._el.style[o.DomUtil.TRANSITION]="",this._el._leaflet_pos=this._newPos,clearInterval(this._stepTimer),this.fire("step").fire("end"))}}),o.Map.include({setView:function(t,e,n){if(e=e===i?this._zoom:this._limitZoom(e),t=this._limitCenter(o.latLng(t),e,this.options.maxBounds),n=n||{},this._panAnim&&this._panAnim.stop(),this._loaded&&!n.reset&&n!==!0){n.animate!==i&&(n.zoom=o.extend({animate:n.animate},n.zoom),n.pan=o.extend({animate:n.animate},n.pan));var s=this._zoom!==e?this._tryAnimatedZoom&&this._tryAnimatedZoom(t,e,n.zoom):this._tryAnimatedPan(t,n.pan);if(s)return clearTimeout(this._sizeTimer),this}return this._resetView(t,e),this},panBy:function(t,e){if(t=o.point(t).round(),e=e||{},!t.x&&!t.y)return this;if(this._panAnim||(this._panAnim=new o.PosAnimation,this._panAnim.on({step:this._onPanTransitionStep,end:this._onPanTransitionEnd},this)),e.noMoveStart||this.fire("movestart"),e.animate!==!1){o.DomUtil.addClass(this._mapPane,"leaflet-pan-anim");var i=this._getMapPanePos().subtract(t);this._panAnim.run(this._mapPane,i,e.duration||.25,e.easeLinearity)}else this._rawPanBy(t),this.fire("move").fire("moveend");return this},_onPanTransitionStep:function(){this.fire("move")},_onPanTransitionEnd:function(){o.DomUtil.removeClass(this._mapPane,"leaflet-pan-anim"),this.fire("moveend")},_tryAnimatedPan:function(t,e){var i=this._getCenterOffset(t)._floor();return(e&&e.animate)===!0||this.getSize().contains(i)?(this.panBy(i,e),!0):!1}}),o.PosAnimation=o.DomUtil.TRANSITION?o.PosAnimation:o.PosAnimation.extend({run:function(t,e,i,n){this.stop(),this._el=t,this._inProgress=!0,this._duration=i||.25,this._easeOutPower=1/Math.max(n||.5,.2),this._startPos=o.DomUtil.getPosition(t),this._offset=e.subtract(this._startPos),this._startTime=+new Date,this.fire("start"),this._animate()},stop:function(){this._inProgress&&(this._step(),this._complete())},_animate:function(){this._animId=o.Util.requestAnimFrame(this._animate,this),this._step()},_step:function(){var t=+new Date-this._startTime,e=1e3*this._duration;e>t?this._runFrame(this._easeOut(t/e)):(this._runFrame(1),this._complete())},_runFrame:function(t){var e=this._startPos.add(this._offset.multiplyBy(t));o.DomUtil.setPosition(this._el,e),this.fire("step")},_complete:function(){o.Util.cancelAnimFrame(this._animId),this._inProgress=!1,this.fire("end")},_easeOut:function(t){return 1-Math.pow(1-t,this._easeOutPower)}}),o.Map.mergeOptions({zoomAnimation:!0,zoomAnimationThreshold:4}),o.DomUtil.TRANSITION&&o.Map.addInitHook(function(){this._zoomAnimated=this.options.zoomAnimation&&o.DomUtil.TRANSITION&&o.Browser.any3d&&!o.Browser.android23&&!o.Browser.mobileOpera,this._zoomAnimated&&o.DomEvent.on(this._mapPane,o.DomUtil.TRANSITION_END,this._catchTransitionEnd,this)}),o.Map.include(o.DomUtil.TRANSITION?{_catchTransitionEnd:function(t){this._animatingZoom&&t.propertyName.indexOf("transform")>=0&&this._onZoomTransitionEnd()},_nothingToAnimate:function(){return!this._container.getElementsByClassName("leaflet-zoom-animated").length},_tryAnimatedZoom:function(t,e,i){if(this._animatingZoom)return!0;if(i=i||{},!this._zoomAnimated||i.animate===!1||this._nothingToAnimate()||Math.abs(e-this._zoom)>this.options.zoomAnimationThreshold)return!1;var n=this.getZoomScale(e),o=this._getCenterOffset(t)._divideBy(1-1/n),s=this._getCenterLayerPoint()._add(o);return i.animate===!0||this.getSize().contains(o)?(this.fire("movestart").fire("zoomstart"),this._animateZoom(t,e,s,n,null,!0),!0):!1},_animateZoom:function(t,e,i,n,s,a,r){r||(this._animatingZoom=!0),o.DomUtil.addClass(this._mapPane,"leaflet-zoom-anim"),this._animateToCenter=t,this._animateToZoom=e,o.Draggable&&(o.Draggable._disabled=!0),o.Util.requestAnimFrame(function(){this.fire("zoomanim",{center:t,zoom:e,origin:i,scale:n,delta:s,backwards:a})},this)},_onZoomTransitionEnd:function(){this._animatingZoom=!1,o.DomUtil.removeClass(this._mapPane,"leaflet-zoom-anim"),this._resetView(this._animateToCenter,this._animateToZoom,!0,!0),o.Draggable&&(o.Draggable._disabled=!1)}}:{}),o.TileLayer.include({_animateZoom:function(t){this._animating||(this._animating=!0,this._prepareBgBuffer());var e=this._bgBuffer,i=o.DomUtil.TRANSFORM,n=t.delta?o.DomUtil.getTranslateString(t.delta):e.style[i],s=o.DomUtil.getScaleString(t.scale,t.origin);e.style[i]=t.backwards?s+" "+n:n+" "+s},_endZoomAnim:function(){var t=this._tileContainer,e=this._bgBuffer;t.style.visibility="",t.parentNode.appendChild(t),o.Util.falseFn(e.offsetWidth),this._animating=!1},_clearBgBuffer:function(){var t=this._map;!t||t._animatingZoom||t.touchZoom._zooming||(this._bgBuffer.innerHTML="",this._bgBuffer.style[o.DomUtil.TRANSFORM]="")},_prepareBgBuffer:function(){var t=this._tileContainer,e=this._bgBuffer,i=this._getLoadedTilesPercentage(e),n=this._getLoadedTilesPercentage(t);return e&&i>.5&&.5>n?(t.style.visibility="hidden",void this._stopLoadingImages(t)):(e.style.visibility="hidden",e.style[o.DomUtil.TRANSFORM]="",this._tileContainer=e,e=this._bgBuffer=t,this._stopLoadingImages(e),void clearTimeout(this._clearBgBufferTimer))},_getLoadedTilesPercentage:function(t){var e,i,n=t.getElementsByTagName("img"),o=0;for(e=0,i=n.length;i>e;e++)n[e].complete&&o++;return o/i},_stopLoadingImages:function(t){var e,i,n,s=Array.prototype.slice.call(t.getElementsByTagName("img"));for(e=0,i=s.length;i>e;e++)n=s[e],n.complete||(n.onload=o.Util.falseFn,n.onerror=o.Util.falseFn,n.src=o.Util.emptyImageUrl,n.parentNode.removeChild(n))}}),o.Map.include({_defaultLocateOptions:{watch:!1,setView:!1,maxZoom:1/0,timeout:1e4,maximumAge:0,enableHighAccuracy:!1},locate:function(t){if(t=this._locateOptions=o.extend(this._defaultLocateOptions,t),!navigator.geolocation)return this._handleGeolocationError({code:0,message:"Geolocation not supported."}),this;var e=o.bind(this._handleGeolocationResponse,this),i=o.bind(this._handleGeolocationError,this);return t.watch?this._locationWatchId=navigator.geolocation.watchPosition(e,i,t):navigator.geolocation.getCurrentPosition(e,i,t),this},stopLocate:function(){return navigator.geolocation&&navigator.geolocation.clearWatch(this._locationWatchId),this._locateOptions&&(this._locateOptions.setView=!1),this},_handleGeolocationError:function(t){var e=t.code,i=t.message||(1===e?"permission denied":2===e?"position unavailable":"timeout");this._locateOptions.setView&&!this._loaded&&this.fitWorld(),this.fire("locationerror",{code:e,message:"Geolocation error: "+i+"."})},_handleGeolocationResponse:function(t){var e=t.coords.latitude,i=t.coords.longitude,n=new o.LatLng(e,i),s=180*t.coords.accuracy/40075017,a=s/Math.cos(o.LatLng.DEG_TO_RAD*e),r=o.latLngBounds([e-s,i-a],[e+s,i+a]),h=this._locateOptions;if(h.setView){var l=Math.min(this.getBoundsZoom(r),h.maxZoom);this.setView(n,l)}var u={latlng:n,bounds:r,timestamp:t.timestamp};for(var c in t.coords)"number"==typeof t.coords[c]&&(u[c]=t.coords[c]);this.fire("locationfound",u)}})}(window,document);
(function(exports) {

/*
 * tile.stamen.js v1.3.0
 */

var SUBDOMAINS = "a. b. c. d.".split(" "),
    MAKE_PROVIDER = function(layer, type, minZoom, maxZoom) {
        return {
            "url":          ["http://{S}tile.stamen.com/", layer, "/{Z}/{X}/{Y}.", type].join(""),
            "type":         type,
            "subdomains":   SUBDOMAINS.slice(),
            "minZoom":      minZoom,
            "maxZoom":      maxZoom,
            "attribution":  [
                'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ',
                'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ',
                'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, ',
                'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
            ].join("")
        };
    },
    PROVIDERS =  {
        "toner":        MAKE_PROVIDER("toner", "png", 0, 20),
        "terrain":      MAKE_PROVIDER("terrain", "jpg", 4, 18),
        "watercolor":   MAKE_PROVIDER("watercolor", "jpg", 1, 18),
        "trees-cabs-crime": {
            "url": "http://{S}.tiles.mapbox.com/v3/stamen.trees-cabs-crime/{Z}/{X}/{Y}.png",
            "type": "png",
            "subdomains": "a b c d".split(" "),
            "minZoom": 11,
            "maxZoom": 18,
            "extent": [
                {"lat": 37.853, "lon": -122.577},
                {"lat": 37.684, "lon": -122.313}
            ],
            "attribution": [
                'Design by Shawn Allen at <a href="http://stamen.com">Stamen</a>.',
                'Data courtesy of <a href="http://fuf.net">FuF</a>,',
                '<a href="http://www.yellowcabsf.com">Yellow Cab</a>',
                '&amp; <a href="http://sf-police.org">SFPD</a>.'
            ].join(" ")
        }
    };

// set up toner and terrain flavors
setupFlavors("toner", ["hybrid", "labels", "lines", "background", "lite"]);
// toner 2010
setupFlavors("toner", ["2010"]);
// toner 2011 flavors
setupFlavors("toner", ["2011", "2011-lines", "2011-labels", "2011-lite"]);
setupFlavors("terrain", ["background"]);
setupFlavors("terrain", ["labels", "lines"], "png");

/*
 * Export stamen.tile to the provided namespace.
 */
exports.stamen = exports.stamen || {};
exports.stamen.tile = exports.stamen.tile || {};
exports.stamen.tile.providers = PROVIDERS;
exports.stamen.tile.getProvider = getProvider;

/*
 * A shortcut for specifying "flavors" of a style, which are assumed to have the
 * same type and zoom range.
 */
function setupFlavors(base, flavors, type) {
    var provider = getProvider(base);
    for (var i = 0; i < flavors.length; i++) {
        var flavor = [base, flavors[i]].join("-");
        PROVIDERS[flavor] = MAKE_PROVIDER(flavor, type || provider.type, provider.minZoom, provider.maxZoom);
    }
}

/*
 * Get the named provider, or throw an exception if it doesn't exist.
 */
function getProvider(name) {
    if (name in PROVIDERS) {
        return PROVIDERS[name];
    } else {
        throw 'No such provider (' + name + ')';
    }
}

/*
 * StamenTileLayer for modestmaps-js
 * <https://github.com/modestmaps/modestmaps-js/>
 *
 * Works with both 1.x and 2.x by checking for the existence of MM.Template.
 */
if (typeof MM === "object") {
    var ModestTemplate = (typeof MM.Template === "function")
        ? MM.Template
        : MM.TemplatedMapProvider;
    MM.StamenTileLayer = function(name) {
        var provider = getProvider(name);
        this._provider = provider;
        MM.Layer.call(this, new ModestTemplate(provider.url, provider.subdomains));
        this.provider.setZoomRange(provider.minZoom, provider.maxZoom);
        this.attribution = provider.attribution;
    };

    MM.StamenTileLayer.prototype = {
        setCoordLimits: function(map) {
            var provider = this._provider;
            if (provider.extent) {
                map.coordLimits = [
                    map.locationCoordinate(provider.extent[0]).zoomTo(provider.minZoom),
                    map.locationCoordinate(provider.extent[1]).zoomTo(provider.maxZoom)
                ];
                return true;
            } else {
                return false;
            }
        }
    };

    MM.extend(MM.StamenTileLayer, MM.Layer);
}

/*
 * StamenTileLayer for Leaflet
 * <http://leaflet.cloudmade.com/>
 *
 * Tested with version 0.3 and 0.4, but should work on all 0.x releases.
 */
if (typeof L === "object") {
    L.StamenTileLayer = L.TileLayer.extend({
        initialize: function(name, options) {
            var provider = getProvider(name),
                url = provider.url.replace(/({[A-Z]})/g, function(s) {
                    return s.toLowerCase();
                }),
                opts = L.extend({}, options, {
                    "minZoom":      provider.minZoom,
                    "maxZoom":      provider.maxZoom,
                    "subdomains":   provider.subdomains,
                    "scheme":       "xyz",
                    "attribution":  provider.attribution
                });
            L.TileLayer.prototype.initialize.call(this, url, opts);
        }
    });

    /*
     * Factory function for consistency with Leaflet conventions 
     */
    L.stamenTileLayer = function (options, source) {
        return new L.StamenTileLayer(options, source);
    };
}

/*
 * StamenTileLayer for OpenLayers
 * <http://openlayers.org/>
 *
 * Tested with v2.1x.
 */
if (typeof OpenLayers === "object") {
    // make a tile URL template OpenLayers-compatible
    function openlayerize(url) {
        return url.replace(/({.})/g, function(v) {
            return "$" + v.toLowerCase();
        });
    }

    // based on http://www.bostongis.com/PrinterFriendly.aspx?content_name=using_custom_osm_tiles
    OpenLayers.Layer.Stamen = OpenLayers.Class(OpenLayers.Layer.OSM, {
        initialize: function(name, options) {
            var provider = getProvider(name),
                url = provider.url,
                subdomains = provider.subdomains,
                hosts = [];
            if (url.indexOf("{S}") > -1) {
                for (var i = 0; i < subdomains.length; i++) {
                    hosts.push(openlayerize(url.replace("{S}", subdomains[i])));
                }
            } else {
                hosts.push(openlayerize(url));
            }
            options = OpenLayers.Util.extend({
                "numZoomLevels":        provider.maxZoom,
                "buffer":               0,
                "transitionEffect":     "resize",
                // see: <http://dev.openlayers.org/apidocs/files/OpenLayers/Layer/OSM-js.html#OpenLayers.Layer.OSM.tileOptions>
                // and: <http://dev.openlayers.org/apidocs/files/OpenLayers/Tile/Image-js.html#OpenLayers.Tile.Image.crossOriginKeyword>
                "tileOptions": {
                    "crossOriginKeyword": null
                },
                "attribution": ATTRIBUTION
            }, options);
            return OpenLayers.Layer.OSM.prototype.initialize.call(this, name, hosts, options);
        }
    });
}

/*
 * StamenMapType for Google Maps API V3
 * <https://developers.google.com/maps/documentation/javascript/>
 */
if (typeof google === "object" && typeof google.maps === "object") {
    google.maps.StamenMapType = function(name) {
        var provider = getProvider(name),
            subdomains = provider.subdomains;
        return google.maps.ImageMapType.call(this, {
            "getTileUrl": function(coord, zoom) {
                var numTiles = 1 << zoom,
                    wx = coord.x % numTiles,
                    x = (wx < 0) ? wx + numTiles : wx,
                    y = coord.y,
                    index = (zoom + x + y) % subdomains.length;
                return provider.url
                    .replace("{S}", subdomains[index])
                    .replace("{Z}", zoom)
                    .replace("{X}", x)
                    .replace("{Y}", y);
            },
            "tileSize": new google.maps.Size(256, 256),
            "name":     name,
            "minZoom":  provider.minZoom,
            "maxZoom":  provider.maxZoom
        });
    };
    // FIXME: is there a better way to extend classes in Google land?
    google.maps.StamenMapType.prototype = new google.maps.ImageMapType("_");
}

})(typeof exports === "undefined" ? this : exports);

!function(t,e){"function"==typeof define&&define.amd?define(e):"undefined"!=typeof module?module.exports=e():t.shp=e()}(this,function(){var requirejs,require,define;return function(t){function e(t,e){return M.call(t,e)}function i(t,e){var i,s,r,a,n,h,o,u,l,f,c=e&&e.split("/"),p=m.map,d=p&&p["*"]||{};if(t&&"."===t.charAt(0))if(e){for(c=c.slice(0,c.length-1),t=c.concat(t.split("/")),u=0;u<t.length;u+=1)if(f=t[u],"."===f)t.splice(u,1),u-=1;else if(".."===f){if(1===u&&(".."===t[2]||".."===t[0]))break;u>0&&(t.splice(u-1,2),u-=2)}t=t.join("/")}else 0===t.indexOf("./")&&(t=t.substring(2));if((c||d)&&p){for(i=t.split("/"),u=i.length;u>0;u-=1){if(s=i.slice(0,u).join("/"),c)for(l=c.length;l>0;l-=1)if(r=p[c.slice(0,l).join("/")],r&&(r=r[s])){a=r,n=u;break}if(a)break;!h&&d&&d[s]&&(h=d[s],o=u)}!a&&h&&(a=h,n=o),a&&(i.splice(0,n,a),t=i.join("/"))}return t}function s(e,i){return function(){return l.apply(t,g.call(arguments,0).concat([e,i]))}}function r(t){return function(e){return i(e,t)}}function a(t){return function(e){p[t]=e}}function n(i){if(e(d,i)){var s=d[i];delete d[i],y[i]=!0,u.apply(t,s)}if(!e(p,i)&&!e(y,i))throw new Error("No "+i);return p[i]}function h(t){var e,i=t?t.indexOf("!"):-1;return i>-1&&(e=t.substring(0,i),t=t.substring(i+1,t.length)),[e,t]}function o(t){return function(){return m&&m.config&&m.config[t]||{}}}var u,l,f,c,p={},d={},m={},y={},M=Object.prototype.hasOwnProperty,g=[].slice;f=function(t,e){var s,a=h(t),o=a[0];return t=a[1],o&&(o=i(o,e),s=n(o)),o?t=s&&s.normalize?s.normalize(t,r(e)):i(t,e):(t=i(t,e),a=h(t),o=a[0],t=a[1],o&&(s=n(o))),{f:o?o+"!"+t:t,n:t,pr:o,p:s}},c={require:function(t){return s(t)},exports:function(t){var e=p[t];return"undefined"!=typeof e?e:p[t]={}},module:function(t){return{id:t,uri:"",exports:p[t],config:o(t)}}},u=function(i,r,h,o){var u,l,m,M,g,_,b=[];if(o=o||i,"function"==typeof h){for(r=!r.length&&h.length?["require","exports","module"]:r,g=0;g<r.length;g+=1)if(M=f(r[g],o),l=M.f,"require"===l)b[g]=c.require(i);else if("exports"===l)b[g]=c.exports(i),_=!0;else if("module"===l)u=b[g]=c.module(i);else if(e(p,l)||e(d,l)||e(y,l))b[g]=n(l);else{if(!M.p)throw new Error(i+" missing "+l);M.p.load(M.n,s(o,!0),a(l),{}),b[g]=p[l]}m=h.apply(p[i],b),i&&(u&&u.exports!==t&&u.exports!==p[i]?p[i]=u.exports:m===t&&_||(p[i]=m))}else i&&(p[i]=h)},requirejs=require=l=function(e,i,s,r,a){return"string"==typeof e?c[e]?c[e](i):n(f(e,i).f):(e.splice||(m=e,i.splice?(e=i,i=s,s=null):e=t),i=i||function(){},"function"==typeof s&&(s=r,r=a),r?u(t,e,i,s):setTimeout(function(){u(t,e,i,s)},4),l)},l.config=function(t){return m=t,m.deps&&l(m.deps,m.callback),l},requirejs._defined=p,define=function(t,i,s){i.splice||(s=i,i=[]),e(p,t)||e(d,t)||(d[t]=[t,i,s])},define.amd={jQuery:!0}}(),define("node_modules/almond/almond",function(){}),define("proj4/mgrs",["require","exports","module"],function(t,e){function i(t){return t*(Math.PI/180)}function s(t){return 180*(t/Math.PI)}function r(t){var e,s,r,a,h,o,u,l,f,c=t.lat,p=t.lon,d=6378137,m=.00669438,y=.9996,M=i(c),g=i(p);f=Math.floor((p+180)/6)+1,180===p&&(f=60),c>=56&&64>c&&p>=3&&12>p&&(f=32),c>=72&&84>c&&(p>=0&&9>p?f=31:p>=9&&21>p?f=33:p>=21&&33>p?f=35:p>=33&&42>p&&(f=37)),e=6*(f-1)-180+3,l=i(e),s=m/(1-m),r=d/Math.sqrt(1-m*Math.sin(M)*Math.sin(M)),a=Math.tan(M)*Math.tan(M),h=s*Math.cos(M)*Math.cos(M),o=Math.cos(M)*(g-l),u=d*((1-m/4-3*m*m/64-5*m*m*m/256)*M-(3*m/8+3*m*m/32+45*m*m*m/1024)*Math.sin(2*M)+(15*m*m/256+45*m*m*m/1024)*Math.sin(4*M)-35*m*m*m/3072*Math.sin(6*M));var _=y*r*(o+(1-a+h)*o*o*o/6+(5-18*a+a*a+72*h-58*s)*o*o*o*o*o/120)+5e5,b=y*(u+r*Math.tan(M)*(o*o/2+(5-a+9*h+4*h*h)*o*o*o*o/24+(61-58*a+a*a+600*h-330*s)*o*o*o*o*o*o/720));return 0>c&&(b+=1e7),{northing:Math.round(b),easting:Math.round(_),zoneNumber:f,zoneLetter:n(c)}}function a(t){var e=t.northing,i=t.easting,r=t.zoneLetter,n=t.zoneNumber;if(0>n||n>60)return null;var h,o,u,l,f,c,p,d,m,y,M=.9996,g=6378137,_=.00669438,b=(1-Math.sqrt(1-_))/(1+Math.sqrt(1-_)),v=i-5e5,j=e;"N">r&&(j-=1e7),d=6*(n-1)-180+3,h=_/(1-_),p=j/M,m=p/(g*(1-_/4-3*_*_/64-5*_*_*_/256)),y=m+(3*b/2-27*b*b*b/32)*Math.sin(2*m)+(21*b*b/16-55*b*b*b*b/32)*Math.sin(4*m)+151*b*b*b/96*Math.sin(6*m),o=g/Math.sqrt(1-_*Math.sin(y)*Math.sin(y)),u=Math.tan(y)*Math.tan(y),l=h*Math.cos(y)*Math.cos(y),f=g*(1-_)/Math.pow(1-_*Math.sin(y)*Math.sin(y),1.5),c=v/(o*M);var x=y-o*Math.tan(y)/f*(c*c/2-(5+3*u+10*l-4*l*l-9*h)*c*c*c*c/24+(61+90*u+298*l+45*u*u-252*h-3*l*l)*c*c*c*c*c*c/720);x=s(x);var A=(c-(1+2*u+l)*c*c*c/6+(5-2*l+28*u-3*l*l+8*h+24*u*u)*c*c*c*c*c/120)/Math.cos(y);A=d+s(A);var C;if(t.accuracy){var w=a({northing:t.northing+t.accuracy,easting:t.easting+t.accuracy,zoneLetter:t.zoneLetter,zoneNumber:t.zoneNumber});C={top:w.lat,right:w.lon,bottom:x,left:A}}else C={lat:x,lon:A};return C}function n(t){var e="Z";return 84>=t&&t>=72?e="X":72>t&&t>=64?e="W":64>t&&t>=56?e="V":56>t&&t>=48?e="U":48>t&&t>=40?e="T":40>t&&t>=32?e="S":32>t&&t>=24?e="R":24>t&&t>=16?e="Q":16>t&&t>=8?e="P":8>t&&t>=0?e="N":0>t&&t>=-8?e="M":-8>t&&t>=-16?e="L":-16>t&&t>=-24?e="K":-24>t&&t>=-32?e="J":-32>t&&t>=-40?e="H":-40>t&&t>=-48?e="G":-48>t&&t>=-56?e="F":-56>t&&t>=-64?e="E":-64>t&&t>=-72?e="D":-72>t&&t>=-80&&(e="C"),e}function h(t,e){var i=""+t.easting,s=""+t.northing;return t.zoneNumber+t.zoneLetter+o(t.easting,t.northing,t.zoneNumber)+i.substr(i.length-5,e)+s.substr(s.length-5,e)}function o(t,e,i){var s=u(i),r=Math.floor(t/1e5),a=Math.floor(e/1e5)%20;return l(r,a,s)}function u(t){var e=t%m;return 0===e&&(e=m),e}function l(t,e,i){var s=i-1,r=y.charCodeAt(s),a=M.charCodeAt(s),n=r+t-1,h=a+e,o=!1;n>j&&(n=n-j+g-1,o=!0),(n===_||_>r&&n>_||(n>_||_>r)&&o)&&n++,(n===b||b>r&&n>b||(n>b||b>r)&&o)&&(n++,n===_&&n++),n>j&&(n=n-j+g-1),h>v?(h=h-v+g-1,o=!0):o=!1,(h===_||_>a&&h>_||(h>_||_>a)&&o)&&h++,(h===b||b>a&&h>b||(h>b||b>a)&&o)&&(h++,h===_&&h++),h>v&&(h=h-v+g-1);var u=String.fromCharCode(n)+String.fromCharCode(h);return u}function f(t){if(t&&0===t.length)throw"MGRSPoint coverting from nothing";for(var e,i=t.length,s=null,r="",a=0;!/[A-Z]/.test(e=t.charAt(a));){if(a>=2)throw"MGRSPoint bad conversion from: "+t;r+=e,a++}var n=parseInt(r,10);if(0===a||a+3>i)throw"MGRSPoint bad conversion from: "+t;var h=t.charAt(a++);if("A">=h||"B"===h||"Y"===h||h>="Z"||"I"===h||"O"===h)throw"MGRSPoint zone letter "+h+" not handled: "+t;s=t.substring(a,a+=2);for(var o=u(n),l=c(s.charAt(0),o),f=p(s.charAt(1),o);f<d(h);)f+=2e6;var m=i-a;if(0!==m%2)throw"MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters"+t;var y,M,g,_,b,v=m/2,j=0,x=0;return v>0&&(y=1e5/Math.pow(10,v),M=t.substring(a,a+v),j=parseFloat(M)*y,g=t.substring(a+v),x=parseFloat(g)*y),_=j+l,b=x+f,{easting:_,northing:b,zoneLetter:h,zoneNumber:n,accuracy:y}}function c(t,e){for(var i=y.charCodeAt(e-1),s=1e5,r=!1;i!==t.charCodeAt(0);){if(i++,i===_&&i++,i===b&&i++,i>j){if(r)throw"Bad character: "+t;i=g,r=!0}s+=1e5}return s}function p(t,e){if(t>"V")throw"MGRSPoint given invalid Northing "+t;for(var i=M.charCodeAt(e-1),s=0,r=!1;i!==t.charCodeAt(0);){if(i++,i===_&&i++,i===b&&i++,i>v){if(r)throw"Bad character: "+t;i=g,r=!0}s+=1e5}return s}function d(t){var e;switch(t){case"C":e=11e5;break;case"D":e=2e6;break;case"E":e=28e5;break;case"F":e=37e5;break;case"G":e=46e5;break;case"H":e=55e5;break;case"J":e=64e5;break;case"K":e=73e5;break;case"L":e=82e5;break;case"M":e=91e5;break;case"N":e=0;break;case"P":e=8e5;break;case"Q":e=17e5;break;case"R":e=26e5;break;case"S":e=35e5;break;case"T":e=44e5;break;case"U":e=53e5;break;case"V":e=62e5;break;case"W":e=7e6;break;case"X":e=79e5;break;default:e=-1}if(e>=0)return e;throw"Invalid zone letter: "+t}var m=6,y="AJSAJS",M="AFAFAF",g=65,_=73,b=79,v=86,j=90;e.forward=function(t,e){return e=e||5,h(r({lat:t.lat,lon:t.lon}),e)},e.inverse=function(t){var e=a(f(t.toUpperCase()));return[e.left,e.bottom,e.right,e.top]}}),define("proj4/Point",["require","proj4/mgrs"],function(t){function e(t,i,s){if(!(this instanceof e))return new e(t,i,s);if("object"==typeof t)this.x=t[0],this.y=t[1],this.z=t[2]||0;else if("string"==typeof t&&"undefined"==typeof i){var r=t.split(",");this.x=parseFloat(r[0]),this.y=parseFloat(r[1]),this.z=parseFloat(r[2])||0}else this.x=t,this.y=i,this.z=s||0;this.clone=function(){return new e(this.x,this.y,this.z)},this.toString=function(){return"x="+this.x+",y="+this.y},this.toShortString=function(){return this.x+", "+this.y}}var i=t("proj4/mgrs");return e.fromMGRS=function(t){var s=i.inverse(t);return new e((s[2]+s[0])/2,(s[3]+s[1])/2)},e.prototype.toMGRS=function(t){return i.forward({lon:this.x,lat:this.y},t)},e}),define("proj4/extend",[],function(){return function(t,e){t=t||{};var i,s;if(!e)return t;for(s in e)i=e[s],void 0!==i&&(t[s]=i);return t}}),define("proj4/common",[],function(){var t={PI:3.141592653589793,HALF_PI:1.5707963267948966,TWO_PI:6.283185307179586,FORTPI:.7853981633974483,R2D:57.29577951308232,D2R:.017453292519943295,SEC_TO_RAD:484813681109536e-20,EPSLN:1e-10,MAX_ITER:20,COS_67P5:.3826834323650898,AD_C:1.0026,PJD_UNKNOWN:0,PJD_3PARAM:1,PJD_7PARAM:2,PJD_GRIDSHIFT:3,PJD_WGS84:4,PJD_NODATUM:5,SRS_WGS84_SEMIMAJOR:6378137,SRS_WGS84_ESQUARED:.006694379990141316,SIXTH:.16666666666666666,RA4:.04722222222222222,RA6:.022156084656084655,RV4:.06944444444444445,RV6:.04243827160493827,msfnz:function(t,e,i){var s=t*e;return i/Math.sqrt(1-s*s)},tsfnz:function(t,e,i){var s=t*i,r=.5*t;return s=Math.pow((1-s)/(1+s),r),Math.tan(.5*(this.HALF_PI-e))/s},phi2z:function(t,e){for(var i,s,r=.5*t,a=this.HALF_PI-2*Math.atan(e),n=0;15>=n;n++)if(i=t*Math.sin(a),s=this.HALF_PI-2*Math.atan(e*Math.pow((1-i)/(1+i),r))-a,a+=s,Math.abs(s)<=1e-10)return a;return-9999},qsfnz:function(t,e){var i;return t>1e-7?(i=t*e,(1-t*t)*(e/(1-i*i)-.5/t*Math.log((1-i)/(1+i)))):2*e},iqsfnz:function(e,i){var s=1-(1-e*e)/(2*e)*Math.log((1-e)/(1+e));if(Math.abs(Math.abs(i)-s)<1e-6)return 0>i?-1*t.HALF_PI:t.HALF_PI;for(var r,a,n,h,o=Math.asin(.5*i),u=0;30>u;u++)if(a=Math.sin(o),n=Math.cos(o),h=e*a,r=Math.pow(1-h*h,2)/(2*n)*(i/(1-e*e)-a/(1-h*h)+.5/e*Math.log((1-h)/(1+h))),o+=r,Math.abs(r)<=1e-10)return o;return 0/0},asinz:function(t){return Math.abs(t)>1&&(t=t>1?1:-1),Math.asin(t)},e0fn:function(t){return 1-.25*t*(1+t/16*(3+1.25*t))},e1fn:function(t){return.375*t*(1+.25*t*(1+.46875*t))},e2fn:function(t){return.05859375*t*t*(1+.75*t)},e3fn:function(t){return t*t*t*(35/3072)},mlfn:function(t,e,i,s,r){return t*r-e*Math.sin(2*r)+i*Math.sin(4*r)-s*Math.sin(6*r)},imlfn:function(t,e,i,s,r){var a,n;a=t/e;for(var h=0;15>h;h++)if(n=(t-(e*a-i*Math.sin(2*a)+s*Math.sin(4*a)-r*Math.sin(6*a)))/(e-2*i*Math.cos(2*a)+4*s*Math.cos(4*a)-6*r*Math.cos(6*a)),a+=n,Math.abs(n)<=1e-10)return a;return 0/0},srat:function(t,e){return Math.pow((1-t)/(1+t),e)},sign:function(t){return 0>t?-1:1},adjust_lon:function(t){return t=Math.abs(t)<this.PI?t:t-this.sign(t)*this.TWO_PI},adjust_lat:function(t){return t=Math.abs(t)<this.HALF_PI?t:t-this.sign(t)*this.PI},latiso:function(t,e,i){if(Math.abs(e)>this.HALF_PI)return Number.NaN;if(e===this.HALF_PI)return Number.POSITIVE_INFINITY;if(e===-1*this.HALF_PI)return Number.NEGATIVE_INFINITY;var s=t*i;return Math.log(Math.tan((this.HALF_PI+e)/2))+t*Math.log((1-s)/(1+s))/2},fL:function(t,e){return 2*Math.atan(t*Math.exp(e))-this.HALF_PI},invlatiso:function(t,e){var i=this.fL(1,e),s=0,r=0;do s=i,r=t*Math.sin(s),i=this.fL(Math.exp(t*Math.log((1+r)/(1-r))/2),e);while(Math.abs(i-s)>1e-12);return i},sinh:function(t){var e=Math.exp(t);return e=(e-1/e)/2},cosh:function(t){var e=Math.exp(t);return e=(e+1/e)/2},tanh:function(t){var e=Math.exp(t);return e=(e-1/e)/(e+1/e)},asinh:function(t){var e=t>=0?1:-1;return e*Math.log(Math.abs(t)+Math.sqrt(t*t+1))},acosh:function(t){return 2*Math.log(Math.sqrt((t+1)/2)+Math.sqrt((t-1)/2))},atanh:function(t){return Math.log((t-1)/(t+1))/2},gN:function(t,e,i){var s=e*i;return t/Math.sqrt(1-s*s)},pj_enfn:function(t){var e=[];e[0]=this.C00-t*(this.C02+t*(this.C04+t*(this.C06+t*this.C08))),e[1]=t*(this.C22-t*(this.C04+t*(this.C06+t*this.C08)));var i=t*t;return e[2]=i*(this.C44-t*(this.C46+t*this.C48)),i*=t,e[3]=i*(this.C66-t*this.C68),e[4]=i*t*this.C88,e},pj_mlfn:function(t,e,i,s){return i*=e,e*=e,s[0]*t-i*(s[1]+e*(s[2]+e*(s[3]+e*s[4])))},pj_inv_mlfn:function(e,i,s){for(var r=1/(1-i),a=e,n=t.MAX_ITER;n;--n){var h=Math.sin(a),o=1-i*h*h;if(o=(this.pj_mlfn(a,h,Math.cos(a),s)-e)*o*Math.sqrt(o)*r,a-=o,Math.abs(o)<t.EPSLN)return a}return a},nad_intr:function(t,e){var i,s={x:(t.x-1e-7)/e.del[0],y:(t.y-1e-7)/e.del[1]},r={x:Math.floor(s.x),y:Math.floor(s.y)},a={x:s.x-1*r.x,y:s.y-1*r.y},n={x:Number.NaN,y:Number.NaN};if(r.x<0){if(!(-1===r.x&&a.x>.99999999999))return n;r.x++,a.x=0}else if(i=r.x+1,i>=e.lim[0]){if(!(i===e.lim[0]&&a.x<1e-11))return n;r.x--,a.x=1}if(r.y<0){if(!(-1===r.y&&a.y>.99999999999))return n;r.y++,a.y=0}else if(i=r.y+1,i>=e.lim[1]){if(!(i===e.lim[1]&&a.y<1e-11))return n;r.y++,a.y=1}i=r.y*e.lim[0]+r.x;var h={x:e.cvs[i][0],y:e.cvs[i][1]};i++;var o={x:e.cvs[i][0],y:e.cvs[i][1]};i+=e.lim[0];var u={x:e.cvs[i][0],y:e.cvs[i][1]};i--;var l={x:e.cvs[i][0],y:e.cvs[i][1]},f=a.x*a.y,c=a.x*(1-a.y),p=(1-a.x)*(1-a.y),d=(1-a.x)*a.y;return n.x=p*h.x+c*o.x+d*l.x+f*u.x,n.y=p*h.y+c*o.y+d*l.y+f*u.y,n},nad_cvt:function(e,i,s){var r={x:Number.NaN,y:Number.NaN};if(isNaN(e.x))return r;var a={x:e.x,y:e.y};a.x-=s.ll[0],a.y-=s.ll[1],a.x=t.adjust_lon(a.x-t.PI)+t.PI;var n=t.nad_intr(a,s);if(i){if(isNaN(n.x))return r;n.x=a.x+n.x,n.y=a.y-n.y;var h,o,u=9,l=1e-12;do{if(o=t.nad_intr(n,s),isNaN(o.x)){this.reportError("Inverse grid shift iteration failed, presumably at grid edge.  Using first approximation.");break}h={x:n.x-o.x-a.x,y:n.y+o.y-a.y},n.x-=h.x,n.y-=h.y}while(u--&&Math.abs(h.x)>l&&Math.abs(h.y)>l);if(0>u)return this.reportError("Inverse grid shift iterator failed to converge."),r;r.x=t.adjust_lon(n.x+s.ll[0]),r.y=n.y+s.ll[1]}else isNaN(n.x)||(r.x=e.x-n.x,r.y=e.y+n.y);return r},C00:1,C02:.25,C04:.046875,C06:.01953125,C08:.01068115234375,C22:.75,C44:.46875,C46:.013020833333333334,C48:.007120768229166667,C66:.3645833333333333,C68:.005696614583333333,C88:.3076171875};return t}),define("proj4/global",[],function(){return function(t){t("WGS84","+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"),t("EPSG:4326","+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"),t("EPSG:4269","+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"),t("EPSG:3857","+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"),t["EPSG:3785"]=t["EPSG:3857"],t.GOOGLE=t["EPSG:3857"],t["EPSG:900913"]=t["EPSG:3857"],t["EPSG:102113"]=t["EPSG:3857"]}}),define("proj4/constants",[],function(){var t={};return t.PrimeMeridian={greenwich:0,lisbon:-9.131906111111,paris:2.337229166667,bogota:-74.080916666667,madrid:-3.687938888889,rome:12.452333333333,bern:7.439583333333,jakarta:106.807719444444,ferro:-17.666666666667,brussels:4.367975,stockholm:18.058277777778,athens:23.7163375,oslo:10.722916666667},t.Ellipsoid={MERIT:{a:6378137,rf:298.257,ellipseName:"MERIT 1983"},SGS85:{a:6378136,rf:298.257,ellipseName:"Soviet Geodetic System 85"},GRS80:{a:6378137,rf:298.257222101,ellipseName:"GRS 1980(IUGG, 1980)"},IAU76:{a:6378140,rf:298.257,ellipseName:"IAU 1976"},airy:{a:6377563.396,b:6356256.91,ellipseName:"Airy 1830"},"APL4.":{a:6378137,rf:298.25,ellipseName:"Appl. Physics. 1965"},NWL9D:{a:6378145,rf:298.25,ellipseName:"Naval Weapons Lab., 1965"},mod_airy:{a:6377340.189,b:6356034.446,ellipseName:"Modified Airy"},andrae:{a:6377104.43,rf:300,ellipseName:"Andrae 1876 (Den., Iclnd.)"},aust_SA:{a:6378160,rf:298.25,ellipseName:"Australian Natl & S. Amer. 1969"},GRS67:{a:6378160,rf:298.247167427,ellipseName:"GRS 67(IUGG 1967)"},bessel:{a:6377397.155,rf:299.1528128,ellipseName:"Bessel 1841"},bess_nam:{a:6377483.865,rf:299.1528128,ellipseName:"Bessel 1841 (Namibia)"},clrk66:{a:6378206.4,b:6356583.8,ellipseName:"Clarke 1866"},clrk80:{a:6378249.145,rf:293.4663,ellipseName:"Clarke 1880 mod."},clrk58:{a:6378293.645208759,rf:294.2606763692654,ellipseName:"Clarke 1858"},CPM:{a:6375738.7,rf:334.29,ellipseName:"Comm. des Poids et Mesures 1799"},delmbr:{a:6376428,rf:311.5,ellipseName:"Delambre 1810 (Belgium)"},engelis:{a:6378136.05,rf:298.2566,ellipseName:"Engelis 1985"},evrst30:{a:6377276.345,rf:300.8017,ellipseName:"Everest 1830"},evrst48:{a:6377304.063,rf:300.8017,ellipseName:"Everest 1948"},evrst56:{a:6377301.243,rf:300.8017,ellipseName:"Everest 1956"},evrst69:{a:6377295.664,rf:300.8017,ellipseName:"Everest 1969"},evrstSS:{a:6377298.556,rf:300.8017,ellipseName:"Everest (Sabah & Sarawak)"},fschr60:{a:6378166,rf:298.3,ellipseName:"Fischer (Mercury Datum) 1960"},fschr60m:{a:6378155,rf:298.3,ellipseName:"Fischer 1960"},fschr68:{a:6378150,rf:298.3,ellipseName:"Fischer 1968"},helmert:{a:6378200,rf:298.3,ellipseName:"Helmert 1906"},hough:{a:6378270,rf:297,ellipseName:"Hough"},intl:{a:6378388,rf:297,ellipseName:"International 1909 (Hayford)"},kaula:{a:6378163,rf:298.24,ellipseName:"Kaula 1961"},lerch:{a:6378139,rf:298.257,ellipseName:"Lerch 1979"},mprts:{a:6397300,rf:191,ellipseName:"Maupertius 1738"},new_intl:{a:6378157.5,b:6356772.2,ellipseName:"New International 1967"},plessis:{a:6376523,rf:6355863,ellipseName:"Plessis 1817 (France)"},krass:{a:6378245,rf:298.3,ellipseName:"Krassovsky, 1942"},SEasia:{a:6378155,b:6356773.3205,ellipseName:"Southeast Asia"},walbeck:{a:6376896,b:6355834.8467,ellipseName:"Walbeck"},WGS60:{a:6378165,rf:298.3,ellipseName:"WGS 60"},WGS66:{a:6378145,rf:298.25,ellipseName:"WGS 66"},WGS72:{a:6378135,rf:298.26,ellipseName:"WGS 72"},WGS84:{a:6378137,rf:298.257223563,ellipseName:"WGS 84"},sphere:{a:6370997,b:6370997,ellipseName:"Normal Sphere (r=6370997)"}},t.Datum={wgs84:{towgs84:"0,0,0",ellipse:"WGS84",datumName:"WGS84"},ch1903:{towgs84:"674.374,15.056,405.346",ellipse:"bessel",datumName:"swiss"},ggrs87:{towgs84:"-199.87,74.79,246.62",ellipse:"GRS80",datumName:"Greek_Geodetic_Reference_System_1987"},nad83:{towgs84:"0,0,0",ellipse:"GRS80",datumName:"North_American_Datum_1983"},nad27:{nadgrids:"@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",ellipse:"clrk66",datumName:"North_American_Datum_1927"},potsdam:{towgs84:"606.0,23.0,413.0",ellipse:"bessel",datumName:"Potsdam Rauenberg 1950 DHDN"},carthage:{towgs84:"-263.0,6.0,431.0",ellipse:"clark80",datumName:"Carthage 1934 Tunisia"},hermannskogel:{towgs84:"653.0,-212.0,449.0",ellipse:"bessel",datumName:"Hermannskogel"},ire65:{towgs84:"482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",ellipse:"mod_airy",datumName:"Ireland 1965"},rassadiran:{towgs84:"-133.63,-157.5,-158.62",ellipse:"intl",datumName:"Rassadiran"},nzgd49:{towgs84:"59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",ellipse:"intl",datumName:"New Zealand Geodetic Datum 1949"},osgb36:{towgs84:"446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",ellipse:"airy",datumName:"Airy 1830"},s_jtsk:{towgs84:"589,76,480",ellipse:"bessel",datumName:"S-JTSK (Ferro)"},beduaram:{towgs84:"-106,-87,188",ellipse:"clrk80",datumName:"Beduaram"},gunung_segara:{towgs84:"-403,684,41",ellipse:"bessel",datumName:"Gunung Segara Jakarta"}},t.Datum.OSB36=t.Datum.OSGB36,t.wktProjections={"Lambert Tangential Conformal Conic Projection":"lcc",Lambert_Conformal_Conic:"lcc",Lambert_Conformal_Conic_2SP:"lcc",Mercator:"merc","Popular Visualisation Pseudo Mercator":"merc",Mercator_1SP:"merc",Transverse_Mercator:"tmerc","Transverse Mercator":"tmerc","Lambert Azimuthal Equal Area":"laea","Universal Transverse Mercator System":"utm",Hotine_Oblique_Mercator:"omerc","Hotine Oblique Mercator":"omerc",Hotine_Oblique_Mercator_Azimuth_Natural_Origin:"omerc",Hotine_Oblique_Mercator_Azimuth_Center:"omerc",Van_der_Grinten_I:"vandg",VanDerGrinten:"vandg",Stereographic_North_Pole:"sterea",Oblique_Stereographic:"sterea",Polar_Stereographic:"sterea",Polyconic:"poly",New_Zealand_Map_Grid:"nzmg",Miller_Cylindrical:"mill",Krovak:"krovak",Equirectangular:"eqc",Equidistant_Cylindrical:"eqc",Cassini:"cass",Cassini_Soldner:"cass",Azimuthal_Equidistant:"aeqd",Albers_Conic_Equal_Area:"aea",Albers:"aea",Mollweide:"moll",Lambert_Azimuthal_Equal_Area:"laea",Sinusoidal:"sinu",Equidistant_Conic:"eqdc",Mercator_Auxiliary_Sphere:"merc"},t.grids={"null":{ll:[-3.14159265,-1.57079633],del:[3.14159265,1.57079633],lim:[3,3],count:9,cvs:[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]}},t}),define("proj4/projString",["require","proj4/common","proj4/constants"],function(t){var e=t("proj4/common"),i=t("proj4/constants");return function(t){var s={},r={};t.split("+").map(function(t){return t.trim()}).filter(function(t){return t}).forEach(function(t){var e=t.split("=");"@null"!==e[1]&&(e.push(!0),r[e[0].toLowerCase()]=e[1])});var a,n,h,o={proj:"projName",datum:"datumCode",rf:function(t){s.rf=parseFloat(t,10)},lat_0:function(t){s.lat0=t*e.D2R},lat_1:function(t){s.lat1=t*e.D2R},lat_2:function(t){s.lat2=t*e.D2R},lat_ts:function(t){s.lat_ts=t*e.D2R},lon_0:function(t){s.long0=t*e.D2R},lon_1:function(t){s.long1=t*e.D2R},lon_2:function(t){s.long2=t*e.D2R},alpha:function(t){s.alpha=parseFloat(t)*e.D2R},lonc:function(t){s.longc=t*e.D2R},x_0:function(t){s.x0=parseFloat(t,10)},y_0:function(t){s.y0=parseFloat(t,10)},k_0:function(t){s.k0=parseFloat(t,10)},k:function(t){s.k0=parseFloat(t,10)},r_a:function(){s.R_A=!0},zone:function(t){s.zone=parseInt(t,10)},south:function(){s.utmSouth=!0},towgs84:function(t){s.datum_params=t.split(",").map(function(t){return parseFloat(t,10)})},to_meter:function(t){s.to_meter=parseFloat(t,10)},from_greenwich:function(t){s.from_greenwich=t*e.D2R},pm:function(t){s.from_greenwich=(i.PrimeMeridian[t]?i.PrimeMeridian[t]:parseFloat(t,10))*e.D2R},axis:function(t){var e="ewnsud";3===t.length&&-1!==e.indexOf(t.substr(0,1))&&-1!==e.indexOf(t.substr(1,1))&&-1!==e.indexOf(t.substr(2,1))&&(s.axis=t)}};for(a in r)n=r[a],a in o?(h=o[a],"function"==typeof h?h(n):s[h]=n):s[a]=n;return s}}),define("proj4/wkt",["require","proj4/common","proj4/constants","proj4/extend"],function(t){function e(t,e,s){t[e]=s.map(function(t){var e={};return i(t,e),e}).reduce(function(t,e){return o(t,e)},{})}function i(t,s){var r;return Array.isArray(t)?(r=t.shift(),"PARAMETER"===r&&(r=t.shift()),1===t.length?Array.isArray(t[0])?(s[r]={},i(t[0],s[r])):s[r]=t[0]:t.length?"TOWGS84"===r?s[r]=t:(s[r]={},["UNIT","PRIMEM","VERT_DATUM"].indexOf(r)>-1?(s[r]={name:t[0].toLowerCase(),convert:t[1]},3===t.length&&(s[r].auth=t[2])):"SPHEROID"===r?(s[r]={name:t[0],a:t[1],rf:t[2]},4===t.length&&(s[r].auth=t[3])):["GEOGCS","GEOCCS","DATUM","VERT_CS","COMPD_CS","LOCAL_CS","FITTED_CS","LOCAL_DATUM"].indexOf(r)>-1?(t[0]=["name",t[0]],e(s,r,t)):t.every(function(t){return Array.isArray(t)})?e(s,r,t):i(t,s[r])):s[r]=!0,void 0):(s[t]=!0,void 0)}function s(t,e){var i=e[0],s=e[1];!(i in t)&&s in t&&(t[i]=t[s],3===e.length&&(t[i]=e[2](t[i])))}function r(t){return t*n.D2R}function a(t){function e(e){var i=t.to_meter||1;return parseFloat(e,10)*i}"GEOGCS"===t.type?t.projName="longlat":"LOCAL_CS"===t.type?(t.projName="identity",t.local=!0):t.projName="object"==typeof t.PROJECTION?h.wktProjections[Object.keys(t.PROJECTION)[0]]:h.wktProjections[t.PROJECTION],t.UNIT&&(t.units=t.UNIT.name.toLowerCase(),"metre"===t.units&&(t.units="meter"),t.UNIT.convert&&(t.to_meter=parseFloat(t.UNIT.convert,10))),t.GEOGCS&&(t.datumCode=t.GEOGCS.DATUM?t.GEOGCS.DATUM.name.toLowerCase():t.GEOGCS.name.toLowerCase(),"d_"===t.datumCode.slice(0,2)&&(t.datumCode=t.datumCode.slice(2)),("new_zealand_geodetic_datum_1949"===t.datumCode||"new_zealand_1949"===t.datumCode)&&(t.datumCode="nzgd49"),"wgs_1984"===t.datumCode&&("Mercator_Auxiliary_Sphere"===t.PROJECTION&&(t.sphere=!0),t.datumCode="wgs84"),"_ferro"===t.datumCode.slice(-6)&&(t.datumCode=t.datumCode.slice(0,-6)),"_jakarta"===t.datumCode.slice(-8)&&(t.datumCode=t.datumCode.slice(0,-8)),t.GEOGCS.DATUM&&t.GEOGCS.DATUM.SPHEROID&&(t.ellps=t.GEOGCS.DATUM.SPHEROID.name.replace("_19","").replace(/[Cc]larke\_18/,"clrk"),"international"===t.ellps.toLowerCase().slice(0,13)&&(t.ellps="intl"),t.a=t.GEOGCS.DATUM.SPHEROID.a,t.rf=parseFloat(t.GEOGCS.DATUM.SPHEROID.rf,10))),t.b&&!isFinite(t.b)&&(t.b=t.a);var i=function(e){return s(t,e)},a=[["standard_parallel_1","Standard_Parallel_1"],["standard_parallel_2","Standard_Parallel_2"],["false_easting","False_Easting"],["false_northing","False_Northing"],["central_meridian","Central_Meridian"],["latitude_of_origin","Latitude_Of_Origin"],["scale_factor","Scale_Factor"],["k0","scale_factor"],["latitude_of_center","Latitude_of_center"],["lat0","latitude_of_center",r],["longitude_of_center","Longitude_Of_Center"],["longc","longitude_of_center",r],["x0","false_easting",e],["y0","false_northing",e],["long0","central_meridian",r],["lat0","latitude_of_origin",r],["lat0","standard_parallel_1",r],["lat1","standard_parallel_1",r],["lat2","standard_parallel_2",r],["alpha","azimuth",r],["srsCode","name"]];a.forEach(i),t.long0||!t.longc||"Albers_Conic_Equal_Area"!==t.PROJECTION&&"Lambert_Azimuthal_Equal_Area"!==t.PROJECTION||(t.long0=t.longc)}var n=t("proj4/common"),h=t("proj4/constants"),o=t("proj4/extend");return function(t,e){var s=JSON.parse((","+t).replace(/\s*\,\s*([A-Z_0-9]+?)(\[)/g,',["$1",').slice(1).replace(/\s*\,\s*([A-Z_0-9]+?)\]/g,',"$1"]')),r=s.shift(),n=s.shift();s.unshift(["name",n]),s.unshift(["type",r]),s.unshift("output");var h={};return i(s,h),a(h.output),o(e,h.output)}}),define("proj4/defs",["require","proj4/global","proj4/projString","proj4/wkt"],function(t){function e(t){var i=this;if(2===arguments.length)e[t]="+"===arguments[1][0]?s(arguments[1]):r(arguments[1]);else if(1===arguments.length)return Array.isArray(t)?t.map(function(t){Array.isArray(t)?e.apply(i,t):e(t)}):("string"==typeof t||("EPSG"in t?e["EPSG:"+t.EPSG]=t:"ESRI"in t?e["ESRI:"+t.ESRI]=t:"IAU2000"in t?e["IAU2000:"+t.IAU2000]=t:console.log(t)),void 0)}var i=t("proj4/global"),s=t("proj4/projString"),r=t("proj4/wkt");return i(e),e}),define("proj4/datum",["require","proj4/common"],function(t){var e=t("proj4/common"),i=function(t){if(!(this instanceof i))return new i(t);if(this.datum_type=e.PJD_WGS84,t){if(t.datumCode&&"none"===t.datumCode&&(this.datum_type=e.PJD_NODATUM),t.datum_params){for(var s=0;s<t.datum_params.length;s++)t.datum_params[s]=parseFloat(t.datum_params[s]);(0!==t.datum_params[0]||0!==t.datum_params[1]||0!==t.datum_params[2])&&(this.datum_type=e.PJD_3PARAM),t.datum_params.length>3&&(0!==t.datum_params[3]||0!==t.datum_params[4]||0!==t.datum_params[5]||0!==t.datum_params[6])&&(this.datum_type=e.PJD_7PARAM,t.datum_params[3]*=e.SEC_TO_RAD,t.datum_params[4]*=e.SEC_TO_RAD,t.datum_params[5]*=e.SEC_TO_RAD,t.datum_params[6]=t.datum_params[6]/1e6+1)}this.datum_type=t.grids?e.PJD_GRIDSHIFT:this.datum_type,this.a=t.a,this.b=t.b,this.es=t.es,this.ep2=t.ep2,this.datum_params=t.datum_params,this.datum_type===e.PJD_GRIDSHIFT&&(this.grids=t.grids)}};return i.prototype={compare_datums:function(t){return this.datum_type!==t.datum_type?!1:this.a!==t.a||Math.abs(this.es-t.es)>5e-11?!1:this.datum_type===e.PJD_3PARAM?this.datum_params[0]===t.datum_params[0]&&this.datum_params[1]===t.datum_params[1]&&this.datum_params[2]===t.datum_params[2]:this.datum_type===e.PJD_7PARAM?this.datum_params[0]===t.datum_params[0]&&this.datum_params[1]===t.datum_params[1]&&this.datum_params[2]===t.datum_params[2]&&this.datum_params[3]===t.datum_params[3]&&this.datum_params[4]===t.datum_params[4]&&this.datum_params[5]===t.datum_params[5]&&this.datum_params[6]===t.datum_params[6]:this.datum_type===e.PJD_GRIDSHIFT||t.datum_type===e.PJD_GRIDSHIFT?this.nadgrids===t.nadgrids:!0},geodetic_to_geocentric:function(t){var i,s,r,a,n,h,o,u=t.x,l=t.y,f=t.z?t.z:0,c=0;if(l<-e.HALF_PI&&l>-1.001*e.HALF_PI)l=-e.HALF_PI;else if(l>e.HALF_PI&&l<1.001*e.HALF_PI)l=e.HALF_PI;else if(l<-e.HALF_PI||l>e.HALF_PI)return null;return u>e.PI&&(u-=2*e.PI),n=Math.sin(l),o=Math.cos(l),h=n*n,a=this.a/Math.sqrt(1-this.es*h),i=(a+f)*o*Math.cos(u),s=(a+f)*o*Math.sin(u),r=(a*(1-this.es)+f)*n,t.x=i,t.y=s,t.z=r,c},geocentric_to_geodetic:function(t){var i,s,r,a,n,h,o,u,l,f,c,p,d,m,y,M,g,_=1e-12,b=_*_,v=30,j=t.x,x=t.y,A=t.z?t.z:0;if(d=!1,i=Math.sqrt(j*j+x*x),s=Math.sqrt(j*j+x*x+A*A),i/this.a<_){if(d=!0,y=0,s/this.a<_)return M=e.HALF_PI,g=-this.b,void 0}else y=Math.atan2(x,j);r=A/s,a=i/s,n=1/Math.sqrt(1-this.es*(2-this.es)*a*a),u=a*(1-this.es)*n,l=r*n,m=0;do m++,o=this.a/Math.sqrt(1-this.es*l*l),g=i*u+A*l-o*(1-this.es*l*l),h=this.es*o/(o+g),n=1/Math.sqrt(1-h*(2-h)*a*a),f=a*(1-h)*n,c=r*n,p=c*u-f*l,u=f,l=c;while(p*p>b&&v>m);return M=Math.atan(c/Math.abs(f)),t.x=y,t.y=M,t.z=g,t},geocentric_to_geodetic_noniter:function(t){var i,s,r,a,n,h,o,u,l,f,c,p,d,m,y,M,g,_=t.x,b=t.y,v=t.z?t.z:0;if(_=parseFloat(_),b=parseFloat(b),v=parseFloat(v),g=!1,0!==_)i=Math.atan2(b,_);else if(b>0)i=e.HALF_PI;else if(0>b)i=-e.HALF_PI;else if(g=!0,i=0,v>0)s=e.HALF_PI;else{if(!(0>v))return s=e.HALF_PI,r=-this.b,void 0;s=-e.HALF_PI}return n=_*_+b*b,a=Math.sqrt(n),h=v*e.AD_C,u=Math.sqrt(h*h+n),f=h/u,p=a/u,c=f*f*f,o=v+this.b*this.ep2*c,M=a-this.a*this.es*p*p*p,l=Math.sqrt(o*o+M*M),d=o/l,m=M/l,y=this.a/Math.sqrt(1-this.es*d*d),r=m>=e.COS_67P5?a/m-y:m<=-e.COS_67P5?a/-m-y:v/d+y*(this.es-1),g===!1&&(s=Math.atan(d/m)),t.x=i,t.y=s,t.z=r,t},geocentric_to_wgs84:function(t){if(this.datum_type===e.PJD_3PARAM)t.x+=this.datum_params[0],t.y+=this.datum_params[1],t.z+=this.datum_params[2];else if(this.datum_type===e.PJD_7PARAM){var i=this.datum_params[0],s=this.datum_params[1],r=this.datum_params[2],a=this.datum_params[3],n=this.datum_params[4],h=this.datum_params[5],o=this.datum_params[6],u=o*(t.x-h*t.y+n*t.z)+i,l=o*(h*t.x+t.y-a*t.z)+s,f=o*(-n*t.x+a*t.y+t.z)+r;t.x=u,t.y=l,t.z=f}},geocentric_from_wgs84:function(t){if(this.datum_type===e.PJD_3PARAM)t.x-=this.datum_params[0],t.y-=this.datum_params[1],t.z-=this.datum_params[2];else if(this.datum_type===e.PJD_7PARAM){var i=this.datum_params[0],s=this.datum_params[1],r=this.datum_params[2],a=this.datum_params[3],n=this.datum_params[4],h=this.datum_params[5],o=this.datum_params[6],u=(t.x-i)/o,l=(t.y-s)/o,f=(t.z-r)/o;t.x=u+h*l-n*f,t.y=-h*u+l+a*f,t.z=n*u-a*l+f}}},i}),define("proj4/projCode/longlat",["require","exports","module"],function(t,e){function i(t){return t}e.init=function(){},e.forward=i,e.inverse=i}),define("proj4/projCode/tmerc",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.e0=e.e0fn(this.es),this.e1=e.e1fn(this.es),this.e2=e.e2fn(this.es),this.e3=e.e3fn(this.es),this.ml0=this.a*e.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0)},forward:function(t){var i,s,r,a=t.x,n=t.y,h=e.adjust_lon(a-this.long0),o=Math.sin(n),u=Math.cos(n);if(this.sphere){var l=u*Math.sin(h);if(Math.abs(Math.abs(l)-1)<1e-10)return 93;s=.5*this.a*this.k0*Math.log((1+l)/(1-l)),i=Math.acos(u*Math.cos(h)/Math.sqrt(1-l*l)),0>n&&(i=-i),r=this.a*this.k0*(i-this.lat0)}else{var f=u*h,c=Math.pow(f,2),p=this.ep2*Math.pow(u,2),d=Math.tan(n),m=Math.pow(d,2);i=1-this.es*Math.pow(o,2);var y=this.a/Math.sqrt(i),M=this.a*e.mlfn(this.e0,this.e1,this.e2,this.e3,n);s=this.k0*y*f*(1+c/6*(1-m+p+c/20*(5-18*m+Math.pow(m,2)+72*p-58*this.ep2)))+this.x0,r=this.k0*(M-this.ml0+y*d*c*(.5+c/24*(5-m+9*p+4*Math.pow(p,2)+c/30*(61-58*m+Math.pow(m,2)+600*p-330*this.ep2))))+this.y0}return t.x=s,t.y=r,t},inverse:function(t){var i,s,r,a,n,h,o=6;if(this.sphere){var u=Math.exp(t.x/(this.a*this.k0)),l=.5*(u-1/u),f=this.lat0+t.y/(this.a*this.k0),c=Math.cos(f);i=Math.sqrt((1-c*c)/(1+l*l)),n=e.asinz(i),0>f&&(n=-n),h=0===l&&0===c?this.long0:e.adjust_lon(Math.atan2(l,c)+this.long0)}else{var p=t.x-this.x0,d=t.y-this.y0;for(i=(this.ml0+d/this.k0)/this.a,s=i,a=0;!0&&(r=(i+this.e1*Math.sin(2*s)-this.e2*Math.sin(4*s)+this.e3*Math.sin(6*s))/this.e0-s,s+=r,!(Math.abs(r)<=e.EPSLN));a++)if(a>=o)return 95;if(Math.abs(s)<e.HALF_PI){var m=Math.sin(s),y=Math.cos(s),M=Math.tan(s),g=this.ep2*Math.pow(y,2),_=Math.pow(g,2),b=Math.pow(M,2),v=Math.pow(b,2);i=1-this.es*Math.pow(m,2);var j=this.a/Math.sqrt(i),x=j*(1-this.es)/i,A=p/(j*this.k0),C=Math.pow(A,2);n=s-j*M*C/x*(.5-C/24*(5+3*b+10*g-4*_-9*this.ep2-C/30*(61+90*b+298*g+45*v-252*this.ep2-3*_))),h=e.adjust_lon(this.long0+A*(1-C/6*(1+2*b+g-C/20*(5-2*g+28*b-3*_+8*this.ep2+24*v)))/y)
}else n=e.HALF_PI*e.sign(d),h=this.long0}return t.x=h,t.y=n,t}}}),define("proj4/projCode/utm",["require","proj4/common","proj4/projCode/tmerc"],function(t){var e=t("proj4/common"),i=t("proj4/projCode/tmerc");return{dependsOn:"tmerc",init:function(){this.zone&&(this.lat0=0,this.long0=(6*Math.abs(this.zone)-183)*e.D2R,this.x0=5e5,this.y0=this.utmSouth?1e7:0,this.k0=.9996,i.init.apply(this),this.forward=i.forward,this.inverse=i.inverse)}}}),define("proj4/projCode/gauss",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){var t=Math.sin(this.lat0),i=Math.cos(this.lat0);i*=i,this.rc=Math.sqrt(1-this.es)/(1-this.es*t*t),this.C=Math.sqrt(1+this.es*i*i/(1-this.es)),this.phic0=Math.asin(t/this.C),this.ratexp=.5*this.C*this.e,this.K=Math.tan(.5*this.phic0+e.FORTPI)/(Math.pow(Math.tan(.5*this.lat0+e.FORTPI),this.C)*e.srat(this.e*t,this.ratexp))},forward:function(t){var i=t.x,s=t.y;return t.y=2*Math.atan(this.K*Math.pow(Math.tan(.5*s+e.FORTPI),this.C)*e.srat(this.e*Math.sin(s),this.ratexp))-e.HALF_PI,t.x=this.C*i,t},inverse:function(t){for(var i=1e-14,s=t.x/this.C,r=t.y,a=Math.pow(Math.tan(.5*r+e.FORTPI)/this.K,1/this.C),n=e.MAX_ITER;n>0&&(r=2*Math.atan(a*e.srat(this.e*Math.sin(t.y),-.5*this.e))-e.HALF_PI,!(Math.abs(r-t.y)<i));--n)t.y=r;return n?(t.x=s,t.y=r,t):null}}}),define("proj4/projCode/sterea",["require","proj4/common","proj4/projCode/gauss"],function(t){var e=t("proj4/common"),i=t("proj4/projCode/gauss");return{init:function(){i.init.apply(this),this.rc&&(this.sinc0=Math.sin(this.phic0),this.cosc0=Math.cos(this.phic0),this.R2=2*this.rc,this.title||(this.title="Oblique Stereographic Alternative"))},forward:function(t){var s,r,a,n;return t.x=e.adjust_lon(t.x-this.long0),i.forward.apply(this,[t]),s=Math.sin(t.y),r=Math.cos(t.y),a=Math.cos(t.x),n=this.k0*this.R2/(1+this.sinc0*s+this.cosc0*r*a),t.x=n*r*Math.sin(t.x),t.y=n*(this.cosc0*s-this.sinc0*r*a),t.x=this.a*t.x+this.x0,t.y=this.a*t.y+this.y0,t},inverse:function(t){var s,r,a,n,h;if(t.x=(t.x-this.x0)/this.a,t.y=(t.y-this.y0)/this.a,t.x/=this.k0,t.y/=this.k0,h=Math.sqrt(t.x*t.x+t.y*t.y)){var o=2*Math.atan2(h,this.R2);s=Math.sin(o),r=Math.cos(o),n=Math.asin(r*this.sinc0+t.y*s*this.cosc0/h),a=Math.atan2(t.x*s,h*this.cosc0*r-t.y*this.sinc0*s)}else n=this.phic0,a=0;return t.x=a,t.y=n,i.inverse.apply(this,[t]),t.x=e.adjust_lon(t.x+this.long0),t}}}),define("proj4/projCode/somerc",[],function(){return{init:function(){var t=this.lat0;this.lambda0=this.long0;var e=Math.sin(t),i=this.a,s=this.rf,r=1/s,a=2*r-Math.pow(r,2),n=this.e=Math.sqrt(a);this.R=this.k0*i*Math.sqrt(1-a)/(1-a*Math.pow(e,2)),this.alpha=Math.sqrt(1+a/(1-a)*Math.pow(Math.cos(t),4)),this.b0=Math.asin(e/this.alpha);var h=Math.log(Math.tan(Math.PI/4+this.b0/2)),o=Math.log(Math.tan(Math.PI/4+t/2)),u=Math.log((1+n*e)/(1-n*e));this.K=h-this.alpha*o+this.alpha*n/2*u},forward:function(t){var e=Math.log(Math.tan(Math.PI/4-t.y/2)),i=this.e/2*Math.log((1+this.e*Math.sin(t.y))/(1-this.e*Math.sin(t.y))),s=-this.alpha*(e+i)+this.K,r=2*(Math.atan(Math.exp(s))-Math.PI/4),a=this.alpha*(t.x-this.lambda0),n=Math.atan(Math.sin(a)/(Math.sin(this.b0)*Math.tan(r)+Math.cos(this.b0)*Math.cos(a))),h=Math.asin(Math.cos(this.b0)*Math.sin(r)-Math.sin(this.b0)*Math.cos(r)*Math.cos(a));return t.y=this.R/2*Math.log((1+Math.sin(h))/(1-Math.sin(h)))+this.y0,t.x=this.R*n+this.x0,t},inverse:function(t){for(var e=t.x-this.x0,i=t.y-this.y0,s=e/this.R,r=2*(Math.atan(Math.exp(i/this.R))-Math.PI/4),a=Math.asin(Math.cos(this.b0)*Math.sin(r)+Math.sin(this.b0)*Math.cos(r)*Math.cos(s)),n=Math.atan(Math.sin(s)/(Math.cos(this.b0)*Math.cos(s)-Math.sin(this.b0)*Math.tan(r))),h=this.lambda0+n/this.alpha,o=0,u=a,l=-1e3,f=0;Math.abs(u-l)>1e-7;){if(++f>20)return;o=1/this.alpha*(Math.log(Math.tan(Math.PI/4+a/2))-this.K)+this.e*Math.log(Math.tan(Math.PI/4+Math.asin(this.e*Math.sin(u))/2)),l=u,u=2*Math.atan(Math.exp(o))-Math.PI/2}return t.x=h,t.y=u,t}}}),define("proj4/projCode/omerc",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.no_off=this.no_off||!1,this.no_rot=this.no_rot||!1,isNaN(this.k0)&&(this.k0=1);var t=Math.sin(this.lat0),i=Math.cos(this.lat0),s=this.e*t;this.bl=Math.sqrt(1+this.es/(1-this.es)*Math.pow(i,4)),this.al=this.a*this.bl*this.k0*Math.sqrt(1-this.es)/(1-s*s);var r=e.tsfnz(this.e,this.lat0,t),a=this.bl/i*Math.sqrt((1-this.es)/(1-s*s));1>a*a&&(a=1);var n,h;if(isNaN(this.longc)){var o=e.tsfnz(this.e,this.lat1,Math.sin(this.lat1)),u=e.tsfnz(this.e,this.lat2,Math.sin(this.lat2));this.el=this.lat0>=0?(a+Math.sqrt(a*a-1))*Math.pow(r,this.bl):(a-Math.sqrt(a*a-1))*Math.pow(r,this.bl);var l=Math.pow(o,this.bl),f=Math.pow(u,this.bl);n=this.el/l,h=.5*(n-1/n);var c=(this.el*this.el-f*l)/(this.el*this.el+f*l),p=(f-l)/(f+l),d=e.adjust_lon(this.long1-this.long2);this.long0=.5*(this.long1+this.long2)-Math.atan(c*Math.tan(.5*this.bl*d)/p)/this.bl,this.long0=e.adjust_lon(this.long0);var m=e.adjust_lon(this.long1-this.long0);this.gamma0=Math.atan(Math.sin(this.bl*m)/h),this.alpha=Math.asin(a*Math.sin(this.gamma0))}else n=this.lat0>=0?a+Math.sqrt(a*a-1):a-Math.sqrt(a*a-1),this.el=n*Math.pow(r,this.bl),h=.5*(n-1/n),this.gamma0=Math.asin(Math.sin(this.alpha)/a),this.long0=this.longc-Math.asin(h*Math.tan(this.gamma0))/this.bl;this.uc=this.no_off?0:this.lat0>=0?this.al/this.bl*Math.atan2(Math.sqrt(a*a-1),Math.cos(this.alpha)):-1*this.al/this.bl*Math.atan2(Math.sqrt(a*a-1),Math.cos(this.alpha))},forward:function(t){var i,s,r,a=t.x,n=t.y,h=e.adjust_lon(a-this.long0);if(Math.abs(Math.abs(n)-e.HALF_PI)<=e.EPSLN)r=n>0?-1:1,s=this.al/this.bl*Math.log(Math.tan(e.FORTPI+.5*r*this.gamma0)),i=-1*r*e.HALF_PI*this.al/this.bl;else{var o=e.tsfnz(this.e,n,Math.sin(n)),u=this.el/Math.pow(o,this.bl),l=.5*(u-1/u),f=.5*(u+1/u),c=Math.sin(this.bl*h),p=(l*Math.sin(this.gamma0)-c*Math.cos(this.gamma0))/f;s=Math.abs(Math.abs(p)-1)<=e.EPSLN?Number.POSITIVE_INFINITY:.5*this.al*Math.log((1-p)/(1+p))/this.bl,i=Math.abs(Math.cos(this.bl*h))<=e.EPSLN?this.al*this.bl*h:this.al*Math.atan2(l*Math.cos(this.gamma0)+c*Math.sin(this.gamma0),Math.cos(this.bl*h))/this.bl}return this.no_rot?(t.x=this.x0+i,t.y=this.y0+s):(i-=this.uc,t.x=this.x0+s*Math.cos(this.alpha)+i*Math.sin(this.alpha),t.y=this.y0+i*Math.cos(this.alpha)-s*Math.sin(this.alpha)),t},inverse:function(t){var i,s;this.no_rot?(s=t.y-this.y0,i=t.x-this.x0):(s=(t.x-this.x0)*Math.cos(this.alpha)-(t.y-this.y0)*Math.sin(this.alpha),i=(t.y-this.y0)*Math.cos(this.alpha)+(t.x-this.x0)*Math.sin(this.alpha),i+=this.uc);var r=Math.exp(-1*this.bl*s/this.al),a=.5*(r-1/r),n=.5*(r+1/r),h=Math.sin(this.bl*i/this.al),o=(h*Math.cos(this.gamma0)+a*Math.sin(this.gamma0))/n,u=Math.pow(this.el/Math.sqrt((1+o)/(1-o)),1/this.bl);return Math.abs(o-1)<e.EPSLN?(t.x=this.long0,t.y=e.HALF_PI):Math.abs(o+1)<e.EPSLN?(t.x=this.long0,t.y=-1*e.HALF_PI):(t.y=e.phi2z(this.e,u),t.x=e.adjust_lon(this.long0-Math.atan2(a*Math.cos(this.gamma0)-h*Math.sin(this.gamma0),Math.cos(this.bl*i/this.al))/this.bl)),t}}}),define("proj4/projCode/lcc",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){if(this.lat2||(this.lat2=this.lat1),this.k0||(this.k0=1),!(Math.abs(this.lat1+this.lat2)<e.EPSLN)){var t=this.b/this.a;this.e=Math.sqrt(1-t*t);var i=Math.sin(this.lat1),s=Math.cos(this.lat1),r=e.msfnz(this.e,i,s),a=e.tsfnz(this.e,this.lat1,i),n=Math.sin(this.lat2),h=Math.cos(this.lat2),o=e.msfnz(this.e,n,h),u=e.tsfnz(this.e,this.lat2,n),l=e.tsfnz(this.e,this.lat0,Math.sin(this.lat0));this.ns=Math.abs(this.lat1-this.lat2)>e.EPSLN?Math.log(r/o)/Math.log(a/u):i,isNaN(this.ns)&&(this.ns=i),this.f0=r/(this.ns*Math.pow(a,this.ns)),this.rh=this.a*this.f0*Math.pow(l,this.ns),this.title||(this.title="Lambert Conformal Conic")}},forward:function(t){var i=t.x,s=t.y;Math.abs(2*Math.abs(s)-e.PI)<=e.EPSLN&&(s=e.sign(s)*(e.HALF_PI-2*e.EPSLN));var r,a,n=Math.abs(Math.abs(s)-e.HALF_PI);if(n>e.EPSLN)r=e.tsfnz(this.e,s,Math.sin(s)),a=this.a*this.f0*Math.pow(r,this.ns);else{if(n=s*this.ns,0>=n)return null;a=0}var h=this.ns*e.adjust_lon(i-this.long0);return t.x=this.k0*a*Math.sin(h)+this.x0,t.y=this.k0*(this.rh-a*Math.cos(h))+this.y0,t},inverse:function(t){var i,s,r,a,n,h=(t.x-this.x0)/this.k0,o=this.rh-(t.y-this.y0)/this.k0;this.ns>0?(i=Math.sqrt(h*h+o*o),s=1):(i=-Math.sqrt(h*h+o*o),s=-1);var u=0;if(0!==i&&(u=Math.atan2(s*h,s*o)),0!==i||this.ns>0){if(s=1/this.ns,r=Math.pow(i/(this.a*this.f0),s),a=e.phi2z(this.e,r),-9999===a)return null}else a=-e.HALF_PI;return n=e.adjust_lon(u/this.ns+this.long0),t.x=n,t.y=a,t}}}),define("proj4/projCode/krovak",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.a=6377397.155,this.es=.006674372230614,this.e=Math.sqrt(this.es),this.lat0||(this.lat0=.863937979737193),this.long0||(this.long0=.4334234309119251),this.k0||(this.k0=.9999),this.s45=.785398163397448,this.s90=2*this.s45,this.fi0=this.lat0,this.e2=this.es,this.e=Math.sqrt(this.e2),this.alfa=Math.sqrt(1+this.e2*Math.pow(Math.cos(this.fi0),4)/(1-this.e2)),this.uq=1.04216856380474,this.u0=Math.asin(Math.sin(this.fi0)/this.alfa),this.g=Math.pow((1+this.e*Math.sin(this.fi0))/(1-this.e*Math.sin(this.fi0)),this.alfa*this.e/2),this.k=Math.tan(this.u0/2+this.s45)/Math.pow(Math.tan(this.fi0/2+this.s45),this.alfa)*this.g,this.k1=this.k0,this.n0=this.a*Math.sqrt(1-this.e2)/(1-this.e2*Math.pow(Math.sin(this.fi0),2)),this.s0=1.37008346281555,this.n=Math.sin(this.s0),this.ro0=this.k1*this.n0/Math.tan(this.s0),this.ad=this.s90-this.uq},forward:function(t){var i,s,r,a,n,h,o,u=t.x,l=t.y,f=e.adjust_lon(u-this.long0);return i=Math.pow((1+this.e*Math.sin(l))/(1-this.e*Math.sin(l)),this.alfa*this.e/2),s=2*(Math.atan(this.k*Math.pow(Math.tan(l/2+this.s45),this.alfa)/i)-this.s45),r=-f*this.alfa,a=Math.asin(Math.cos(this.ad)*Math.sin(s)+Math.sin(this.ad)*Math.cos(s)*Math.cos(r)),n=Math.asin(Math.cos(s)*Math.sin(r)/Math.cos(a)),h=this.n*n,o=this.ro0*Math.pow(Math.tan(this.s0/2+this.s45),this.n)/Math.pow(Math.tan(a/2+this.s45),this.n),t.y=o*Math.cos(h)/1,t.x=o*Math.sin(h)/1,this.czech||(t.y*=-1,t.x*=-1),t},inverse:function(t){var e,i,s,r,a,n,h,o,u=t.x;t.x=t.y,t.y=u,this.czech||(t.y*=-1,t.x*=-1),n=Math.sqrt(t.x*t.x+t.y*t.y),a=Math.atan2(t.y,t.x),r=a/Math.sin(this.s0),s=2*(Math.atan(Math.pow(this.ro0/n,1/this.n)*Math.tan(this.s0/2+this.s45))-this.s45),e=Math.asin(Math.cos(this.ad)*Math.sin(s)-Math.sin(this.ad)*Math.cos(s)*Math.cos(r)),i=Math.asin(Math.cos(s)*Math.sin(r)/Math.cos(e)),t.x=this.long0-i/this.alfa,h=e,o=0;var l=0;do t.y=2*(Math.atan(Math.pow(this.k,-1/this.alfa)*Math.pow(Math.tan(e/2+this.s45),1/this.alfa)*Math.pow((1+this.e*Math.sin(h))/(1-this.e*Math.sin(h)),this.e/2))-this.s45),Math.abs(h-t.y)<1e-10&&(o=1),h=t.y,l+=1;while(0===o&&15>l);return l>=15?null:t}}}),define("proj4/projCode/cass",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.sphere||(this.e0=e.e0fn(this.es),this.e1=e.e1fn(this.es),this.e2=e.e2fn(this.es),this.e3=e.e3fn(this.es),this.ml0=this.a*e.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0))},forward:function(t){var i,s,r=t.x,a=t.y;if(r=e.adjust_lon(r-this.long0),this.sphere)i=this.a*Math.asin(Math.cos(a)*Math.sin(r)),s=this.a*(Math.atan2(Math.tan(a),Math.cos(r))-this.lat0);else{var n=Math.sin(a),h=Math.cos(a),o=e.gN(this.a,this.e,n),u=Math.tan(a)*Math.tan(a),l=r*Math.cos(a),f=l*l,c=this.es*h*h/(1-this.es),p=this.a*e.mlfn(this.e0,this.e1,this.e2,this.e3,a);i=o*l*(1-f*u*(1/6-(8-u+8*c)*f/120)),s=p-this.ml0+o*n/h*f*(.5+(5-u+6*c)*f/24)}return t.x=i+this.x0,t.y=s+this.y0,t},inverse:function(t){t.x-=this.x0,t.y-=this.y0;var i,s,r=t.x/this.a,a=t.y/this.a;if(this.sphere){var n=a+this.lat0;i=Math.asin(Math.sin(n)*Math.cos(r)),s=Math.atan2(Math.tan(r),Math.cos(n))}else{var h=this.ml0/this.a+a,o=e.imlfn(h,this.e0,this.e1,this.e2,this.e3);if(Math.abs(Math.abs(o)-e.HALF_PI)<=e.EPSLN)return t.x=this.long0,t.y=e.HALF_PI,0>a&&(t.y*=-1),t;var u=e.gN(this.a,this.e,Math.sin(o)),l=u*u*u/this.a/this.a*(1-this.es),f=Math.pow(Math.tan(o),2),c=r*this.a/u,p=c*c;i=o-u*Math.tan(o)/l*c*c*(.5-(1+3*f)*c*c/24),s=c*(1-p*(f/3+(1+3*f)*f*p/15))/Math.cos(o)}return t.x=e.adjust_lon(s+this.long0),t.y=e.adjust_lat(i),t}}}),define("proj4/projCode/laea",["require","proj4/common"],function(t){var e=t("proj4/common");return{S_POLE:1,N_POLE:2,EQUIT:3,OBLIQ:4,init:function(){var t=Math.abs(this.lat0);if(this.mode=Math.abs(t-e.HALF_PI)<e.EPSLN?this.lat0<0?this.S_POLE:this.N_POLE:Math.abs(t)<e.EPSLN?this.EQUIT:this.OBLIQ,this.es>0){var i;switch(this.qp=e.qsfnz(this.e,1),this.mmf=.5/(1-this.es),this.apa=this.authset(this.es),this.mode){case this.N_POLE:this.dd=1;break;case this.S_POLE:this.dd=1;break;case this.EQUIT:this.rq=Math.sqrt(.5*this.qp),this.dd=1/this.rq,this.xmf=1,this.ymf=.5*this.qp;break;case this.OBLIQ:this.rq=Math.sqrt(.5*this.qp),i=Math.sin(this.lat0),this.sinb1=e.qsfnz(this.e,i)/this.qp,this.cosb1=Math.sqrt(1-this.sinb1*this.sinb1),this.dd=Math.cos(this.lat0)/(Math.sqrt(1-this.es*i*i)*this.rq*this.cosb1),this.ymf=(this.xmf=this.rq)/this.dd,this.xmf*=this.dd}}else this.mode===this.OBLIQ&&(this.sinph0=Math.sin(this.lat0),this.cosph0=Math.cos(this.lat0))},forward:function(t){var i,s,r,a,n,h,o,u,l,f,c=t.x,p=t.y;if(c=e.adjust_lon(c-this.long0),this.sphere){if(n=Math.sin(p),f=Math.cos(p),r=Math.cos(c),this.mode===this.OBLIQ||this.mode===this.EQUIT){if(s=this.mode===this.EQUIT?1+f*r:1+this.sinph0*n+this.cosph0*f*r,s<=e.EPSLN)return null;s=Math.sqrt(2/s),i=s*f*Math.sin(c),s*=this.mode===this.EQUIT?n:this.cosph0*n-this.sinph0*f*r}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(r=-r),Math.abs(p+this.phi0)<e.EPSLN)return null;s=e.FORTPI-.5*p,s=2*(this.mode===this.S_POLE?Math.cos(s):Math.sin(s)),i=s*Math.sin(c),s*=r}}else{switch(o=0,u=0,l=0,r=Math.cos(c),a=Math.sin(c),n=Math.sin(p),h=e.qsfnz(this.e,n),(this.mode===this.OBLIQ||this.mode===this.EQUIT)&&(o=h/this.qp,u=Math.sqrt(1-o*o)),this.mode){case this.OBLIQ:l=1+this.sinb1*o+this.cosb1*u*r;break;case this.EQUIT:l=1+u*r;break;case this.N_POLE:l=e.HALF_PI+p,h=this.qp-h;break;case this.S_POLE:l=p-e.HALF_PI,h=this.qp+h}if(Math.abs(l)<e.EPSLN)return null;switch(this.mode){case this.OBLIQ:case this.EQUIT:l=Math.sqrt(2/l),s=this.mode===this.OBLIQ?this.ymf*l*(this.cosb1*o-this.sinb1*u*r):(l=Math.sqrt(2/(1+u*r)))*o*this.ymf,i=this.xmf*l*u*a;break;case this.N_POLE:case this.S_POLE:h>=0?(i=(l=Math.sqrt(h))*a,s=r*(this.mode===this.S_POLE?l:-l)):i=s=0}}return t.x=this.a*i+this.x0,t.y=this.a*s+this.y0,t},inverse:function(t){t.x-=this.x0,t.y-=this.y0;var i,s,r,a,n,h,o,u=t.x/this.a,l=t.y/this.a;if(this.sphere){var f,c=0,p=0;if(f=Math.sqrt(u*u+l*l),s=.5*f,s>1)return null;switch(s=2*Math.asin(s),(this.mode===this.OBLIQ||this.mode===this.EQUIT)&&(p=Math.sin(s),c=Math.cos(s)),this.mode){case this.EQUIT:s=Math.abs(f)<=e.EPSLN?0:Math.asin(l*p/f),u*=p,l=c*f;break;case this.OBLIQ:s=Math.abs(f)<=e.EPSLN?this.phi0:Math.asin(c*this.sinph0+l*p*this.cosph0/f),u*=p*this.cosph0,l=(c-Math.sin(s)*this.sinph0)*f;break;case this.N_POLE:l=-l,s=e.HALF_PI-s;break;case this.S_POLE:s-=e.HALF_PI}i=0!==l||this.mode!==this.EQUIT&&this.mode!==this.OBLIQ?Math.atan2(u,l):0}else{if(o=0,this.mode===this.OBLIQ||this.mode===this.EQUIT){if(u/=this.dd,l*=this.dd,h=Math.sqrt(u*u+l*l),h<e.EPSLN)return t.x=0,t.y=this.phi0,t;a=2*Math.asin(.5*h/this.rq),r=Math.cos(a),u*=a=Math.sin(a),this.mode===this.OBLIQ?(o=r*this.sinb1+l*a*this.cosb1/h,n=this.qp*o,l=h*this.cosb1*r-l*this.sinb1*a):(o=l*a/h,n=this.qp*o,l=h*r)}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(l=-l),n=u*u+l*l,!n)return t.x=0,t.y=this.phi0,t;o=1-n/this.qp,this.mode===this.S_POLE&&(o=-o)}i=Math.atan2(u,l),s=this.authlat(Math.asin(o),this.apa)}return t.x=e.adjust_lon(this.long0+i),t.y=s,t},P00:.3333333333333333,P01:.17222222222222222,P02:.10257936507936508,P10:.06388888888888888,P11:.0664021164021164,P20:.016415012942191543,authset:function(t){var e,i=[];return i[0]=t*this.P00,e=t*t,i[0]+=e*this.P01,i[1]=e*this.P10,e*=t,i[0]+=e*this.P02,i[1]+=e*this.P11,i[2]=e*this.P20,i},authlat:function(t,e){var i=t+t;return t+e[0]*Math.sin(i)+e[1]*Math.sin(i+i)+e[2]*Math.sin(i+i+i)}}}),define("proj4/projCode/merc",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){var t=this.b/this.a;this.es=1-t*t,this.e=Math.sqrt(this.es),this.lat_ts?this.k0=this.sphere?Math.cos(this.lat_ts):e.msfnz(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)):this.k0||(this.k0=this.k?this.k:1)},forward:function(t){var i=t.x,s=t.y;if(s*e.R2D>90&&s*e.R2D<-90&&i*e.R2D>180&&i*e.R2D<-180)return null;var r,a;if(Math.abs(Math.abs(s)-e.HALF_PI)<=e.EPSLN)return null;if(this.sphere)r=this.x0+this.a*this.k0*e.adjust_lon(i-this.long0),a=this.y0+this.a*this.k0*Math.log(Math.tan(e.FORTPI+.5*s));else{var n=Math.sin(s),h=e.tsfnz(this.e,s,n);r=this.x0+this.a*this.k0*e.adjust_lon(i-this.long0),a=this.y0-this.a*this.k0*Math.log(h)}return t.x=r,t.y=a,t},inverse:function(t){var i,s,r=t.x-this.x0,a=t.y-this.y0;if(this.sphere)s=e.HALF_PI-2*Math.atan(Math.exp(-a/(this.a*this.k0)));else{var n=Math.exp(-a/(this.a*this.k0));if(s=e.phi2z(this.e,n),-9999===s)return null}return i=e.adjust_lon(this.long0+r/(this.a*this.k0)),t.x=i,t.y=s,t}}}),define("proj4/projCode/aea",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){Math.abs(this.lat1+this.lat2)<e.EPSLN||(this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e3=Math.sqrt(this.es),this.sin_po=Math.sin(this.lat1),this.cos_po=Math.cos(this.lat1),this.t1=this.sin_po,this.con=this.sin_po,this.ms1=e.msfnz(this.e3,this.sin_po,this.cos_po),this.qs1=e.qsfnz(this.e3,this.sin_po,this.cos_po),this.sin_po=Math.sin(this.lat2),this.cos_po=Math.cos(this.lat2),this.t2=this.sin_po,this.ms2=e.msfnz(this.e3,this.sin_po,this.cos_po),this.qs2=e.qsfnz(this.e3,this.sin_po,this.cos_po),this.sin_po=Math.sin(this.lat0),this.cos_po=Math.cos(this.lat0),this.t3=this.sin_po,this.qs0=e.qsfnz(this.e3,this.sin_po,this.cos_po),this.ns0=Math.abs(this.lat1-this.lat2)>e.EPSLN?(this.ms1*this.ms1-this.ms2*this.ms2)/(this.qs2-this.qs1):this.con,this.c=this.ms1*this.ms1+this.ns0*this.qs1,this.rh=this.a*Math.sqrt(this.c-this.ns0*this.qs0)/this.ns0)},forward:function(t){var i=t.x,s=t.y;this.sin_phi=Math.sin(s),this.cos_phi=Math.cos(s);var r=e.qsfnz(this.e3,this.sin_phi,this.cos_phi),a=this.a*Math.sqrt(this.c-this.ns0*r)/this.ns0,n=this.ns0*e.adjust_lon(i-this.long0),h=a*Math.sin(n)+this.x0,o=this.rh-a*Math.cos(n)+this.y0;return t.x=h,t.y=o,t},inverse:function(t){var i,s,r,a,n,h;return t.x-=this.x0,t.y=this.rh-t.y+this.y0,this.ns0>=0?(i=Math.sqrt(t.x*t.x+t.y*t.y),r=1):(i=-Math.sqrt(t.x*t.x+t.y*t.y),r=-1),a=0,0!==i&&(a=Math.atan2(r*t.x,r*t.y)),r=i*this.ns0/this.a,this.sphere?h=Math.asin((this.c-r*r)/(2*this.ns0)):(s=(this.c-r*r)/this.ns0,h=this.phi1z(this.e3,s)),n=e.adjust_lon(a/this.ns0+this.long0),t.x=n,t.y=h,t},phi1z:function(t,i){var s,r,a,n,h,o=e.asinz(.5*i);if(t<e.EPSLN)return o;for(var u=t*t,l=1;25>=l;l++)if(s=Math.sin(o),r=Math.cos(o),a=t*s,n=1-a*a,h=.5*n*n/r*(i/(1-u)-s/n+.5/t*Math.log((1-a)/(1+a))),o+=h,Math.abs(h)<=1e-7)return o;return null}}}),define("proj4/projCode/gnom",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.sin_p14=Math.sin(this.lat0),this.cos_p14=Math.cos(this.lat0),this.infinity_dist=1e3*this.a,this.rc=1},forward:function(t){var i,s,r,a,n,h,o,u,l=t.x,f=t.y;return r=e.adjust_lon(l-this.long0),i=Math.sin(f),s=Math.cos(f),a=Math.cos(r),h=this.sin_p14*i+this.cos_p14*s*a,n=1,h>0||Math.abs(h)<=e.EPSLN?(o=this.x0+this.a*n*s*Math.sin(r)/h,u=this.y0+this.a*n*(this.cos_p14*i-this.sin_p14*s*a)/h):(o=this.x0+this.infinity_dist*s*Math.sin(r),u=this.y0+this.infinity_dist*(this.cos_p14*i-this.sin_p14*s*a)),t.x=o,t.y=u,t},inverse:function(t){var i,s,r,a,n,h;return t.x=(t.x-this.x0)/this.a,t.y=(t.y-this.y0)/this.a,t.x/=this.k0,t.y/=this.k0,(i=Math.sqrt(t.x*t.x+t.y*t.y))?(a=Math.atan2(i,this.rc),s=Math.sin(a),r=Math.cos(a),h=e.asinz(r*this.sin_p14+t.y*s*this.cos_p14/i),n=Math.atan2(t.x*s,i*this.cos_p14*r-t.y*this.sin_p14*s),n=e.adjust_lon(this.long0+n)):(h=this.phic0,n=0),t.x=n,t.y=h,t}}}),define("proj4/projCode/cea",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.sphere||(this.k0=e.msfnz(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)))},forward:function(t){var i,s,r=t.x,a=t.y,n=e.adjust_lon(r-this.long0);if(this.sphere)i=this.x0+this.a*n*Math.cos(this.lat_ts),s=this.y0+this.a*Math.sin(a)/Math.cos(this.lat_ts);else{var h=e.qsfnz(this.e,Math.sin(a));i=this.x0+this.a*this.k0*n,s=this.y0+.5*this.a*h/this.k0}return t.x=i,t.y=s,t},inverse:function(t){t.x-=this.x0,t.y-=this.y0;var i,s;return this.sphere?(i=e.adjust_lon(this.long0+t.x/this.a/Math.cos(this.lat_ts)),s=Math.asin(t.y/this.a*Math.cos(this.lat_ts))):(s=e.iqsfnz(this.e,2*t.y*this.k0/this.a),i=e.adjust_lon(this.long0+t.x/(this.a*this.k0))),t.x=i,t.y=s,t}}}),define("proj4/projCode/eqc",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.x0=this.x0||0,this.y0=this.y0||0,this.lat0=this.lat0||0,this.long0=this.long0||0,this.lat_ts=this.lat_t||0,this.title=this.title||"Equidistant Cylindrical (Plate Carre)",this.rc=Math.cos(this.lat_ts)},forward:function(t){var i=t.x,s=t.y,r=e.adjust_lon(i-this.long0),a=e.adjust_lat(s-this.lat0);return t.x=this.x0+this.a*r*this.rc,t.y=this.y0+this.a*a,t},inverse:function(t){var i=t.x,s=t.y;return t.x=e.adjust_lon(this.long0+(i-this.x0)/(this.a*this.rc)),t.y=e.adjust_lat(this.lat0+(s-this.y0)/this.a),t}}}),define("proj4/projCode/poly",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=e.e0fn(this.es),this.e1=e.e1fn(this.es),this.e2=e.e2fn(this.es),this.e3=e.e3fn(this.es),this.ml0=this.a*e.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0)},forward:function(t){var i,s,r,a=t.x,n=t.y,h=e.adjust_lon(a-this.long0);if(r=h*Math.sin(n),this.sphere)Math.abs(n)<=e.EPSLN?(i=this.a*h,s=-1*this.a*this.lat0):(i=this.a*Math.sin(r)/Math.tan(n),s=this.a*(e.adjust_lat(n-this.lat0)+(1-Math.cos(r))/Math.tan(n)));else if(Math.abs(n)<=e.EPSLN)i=this.a*h,s=-1*this.ml0;else{var o=e.gN(this.a,this.e,Math.sin(n))/Math.tan(n);i=o*Math.sin(r),s=this.a*e.mlfn(this.e0,this.e1,this.e2,this.e3,n)-this.ml0+o*(1-Math.cos(r))}return t.x=i+this.x0,t.y=s+this.y0,t},inverse:function(t){var i,s,r,a,n,h,o,u,l;if(r=t.x-this.x0,a=t.y-this.y0,this.sphere)if(Math.abs(a+this.a*this.lat0)<=e.EPSLN)i=e.adjust_lon(r/this.a+this.long0),s=0;else{h=this.lat0+a/this.a,o=r*r/this.a/this.a+h*h,u=h;var f;for(n=e.MAX_ITER;n;--n)if(f=Math.tan(u),l=-1*(h*(u*f+1)-u-.5*(u*u+o)*f)/((u-h)/f-1),u+=l,Math.abs(l)<=e.EPSLN){s=u;break}i=e.adjust_lon(this.long0+Math.asin(r*Math.tan(u)/this.a)/Math.sin(s))}else if(Math.abs(a+this.ml0)<=e.EPSLN)s=0,i=e.adjust_lon(this.long0+r/this.a);else{h=(this.ml0+a)/this.a,o=r*r/this.a/this.a+h*h,u=h;var c,p,d,m,y;for(n=e.MAX_ITER;n;--n)if(y=this.e*Math.sin(u),c=Math.sqrt(1-y*y)*Math.tan(u),p=this.a*e.mlfn(this.e0,this.e1,this.e2,this.e3,u),d=this.e0-2*this.e1*Math.cos(2*u)+4*this.e2*Math.cos(4*u)-6*this.e3*Math.cos(6*u),m=p/this.a,l=(h*(c*m+1)-m-.5*c*(m*m+o))/(this.es*Math.sin(2*u)*(m*m+o-2*h*m)/(4*c)+(h-m)*(c*d-2/Math.sin(2*u))-d),u-=l,Math.abs(l)<=e.EPSLN){s=u;break}c=Math.sqrt(1-this.es*Math.pow(Math.sin(s),2))*Math.tan(s),i=e.adjust_lon(this.long0+Math.asin(r*c/this.a)/Math.sin(s))}return t.x=i,t.y=s,t}}}),define("proj4/projCode/nzmg",["require","proj4/common"],function(t){var e=t("proj4/common");return{iterations:1,init:function(){this.A=[],this.A[1]=.6399175073,this.A[2]=-.1358797613,this.A[3]=.063294409,this.A[4]=-.02526853,this.A[5]=.0117879,this.A[6]=-.0055161,this.A[7]=.0026906,this.A[8]=-.001333,this.A[9]=67e-5,this.A[10]=-34e-5,this.B_re=[],this.B_im=[],this.B_re[1]=.7557853228,this.B_im[1]=0,this.B_re[2]=.249204646,this.B_im[2]=.003371507,this.B_re[3]=-.001541739,this.B_im[3]=.04105856,this.B_re[4]=-.10162907,this.B_im[4]=.01727609,this.B_re[5]=-.26623489,this.B_im[5]=-.36249218,this.B_re[6]=-.6870983,this.B_im[6]=-1.1651967,this.C_re=[],this.C_im=[],this.C_re[1]=1.3231270439,this.C_im[1]=0,this.C_re[2]=-.577245789,this.C_im[2]=-.007809598,this.C_re[3]=.508307513,this.C_im[3]=-.112208952,this.C_re[4]=-.15094762,this.C_im[4]=.18200602,this.C_re[5]=1.01418179,this.C_im[5]=1.64497696,this.C_re[6]=1.9660549,this.C_im[6]=2.5127645,this.D=[],this.D[1]=1.5627014243,this.D[2]=.5185406398,this.D[3]=-.03333098,this.D[4]=-.1052906,this.D[5]=-.0368594,this.D[6]=.007317,this.D[7]=.0122,this.D[8]=.00394,this.D[9]=-.0013},forward:function(t){var i,s=t.x,r=t.y,a=r-this.lat0,n=s-this.long0,h=1e-5*(a/e.SEC_TO_RAD),o=n,u=1,l=0;for(i=1;10>=i;i++)u*=h,l+=this.A[i]*u;var f,c,p=l,d=o,m=1,y=0,M=0,g=0;for(i=1;6>=i;i++)f=m*p-y*d,c=y*p+m*d,m=f,y=c,M=M+this.B_re[i]*m-this.B_im[i]*y,g=g+this.B_im[i]*m+this.B_re[i]*y;return t.x=g*this.a+this.x0,t.y=M*this.a+this.y0,t},inverse:function(t){var i,s,r,a=t.x,n=t.y,h=a-this.x0,o=n-this.y0,u=o/this.a,l=h/this.a,f=1,c=0,p=0,d=0;for(i=1;6>=i;i++)s=f*u-c*l,r=c*u+f*l,f=s,c=r,p=p+this.C_re[i]*f-this.C_im[i]*c,d=d+this.C_im[i]*f+this.C_re[i]*c;for(var m=0;m<this.iterations;m++){var y,M,g=p,_=d,b=u,v=l;for(i=2;6>=i;i++)y=g*p-_*d,M=_*p+g*d,g=y,_=M,b+=(i-1)*(this.B_re[i]*g-this.B_im[i]*_),v+=(i-1)*(this.B_im[i]*g+this.B_re[i]*_);g=1,_=0;var j=this.B_re[1],x=this.B_im[1];for(i=2;6>=i;i++)y=g*p-_*d,M=_*p+g*d,g=y,_=M,j+=i*(this.B_re[i]*g-this.B_im[i]*_),x+=i*(this.B_im[i]*g+this.B_re[i]*_);var A=j*j+x*x;p=(b*j+v*x)/A,d=(v*j-b*x)/A}var C=p,w=d,S=1,I=0;for(i=1;9>=i;i++)S*=C,I+=this.D[i]*S;var P=this.lat0+1e5*I*e.SEC_TO_RAD,E=this.long0+w;return t.x=E,t.y=P,t}}}),define("proj4/projCode/mill",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){},forward:function(t){var i=t.x,s=t.y,r=e.adjust_lon(i-this.long0),a=this.x0+this.a*r,n=this.y0+1.25*this.a*Math.log(Math.tan(e.PI/4+s/2.5));return t.x=a,t.y=n,t},inverse:function(t){t.x-=this.x0,t.y-=this.y0;var i=e.adjust_lon(this.long0+t.x/this.a),s=2.5*(Math.atan(Math.exp(.8*t.y/this.a))-e.PI/4);return t.x=i,t.y=s,t}}}),define("proj4/projCode/sinu",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.sphere?(this.n=1,this.m=0,this.es=0,this.C_y=Math.sqrt((this.m+1)/this.n),this.C_x=this.C_y/(this.m+1)):this.en=e.pj_enfn(this.es)},forward:function(t){var i,s,r=t.x,a=t.y;if(r=e.adjust_lon(r-this.long0),this.sphere){if(this.m)for(var n=this.n*Math.sin(a),h=e.MAX_ITER;h;--h){var o=(this.m*a+Math.sin(a)-n)/(this.m+Math.cos(a));if(a-=o,Math.abs(o)<e.EPSLN)break}else a=1!==this.n?Math.asin(this.n*Math.sin(a)):a;i=this.a*this.C_x*r*(this.m+Math.cos(a)),s=this.a*this.C_y*a}else{var u=Math.sin(a),l=Math.cos(a);s=this.a*e.pj_mlfn(a,u,l,this.en),i=this.a*r*l/Math.sqrt(1-this.es*u*u)}return t.x=i,t.y=s,t},inverse:function(t){var i,s,r;if(t.x-=this.x0,t.y-=this.y0,i=t.y/this.a,this.sphere)t.y/=this.C_y,i=this.m?Math.asin((this.m*t.y+Math.sin(t.y))/this.n):1!==this.n?Math.asin(Math.sin(t.y)/this.n):t.y,r=t.x/(this.C_x*(this.m+Math.cos(t.y)));else{i=e.pj_inv_mlfn(t.y/this.a,this.es,this.en);var a=Math.abs(i);a<e.HALF_PI?(a=Math.sin(i),s=this.long0+t.x*Math.sqrt(1-this.es*a*a)/(this.a*Math.cos(i)),r=e.adjust_lon(s)):a-e.EPSLN<e.HALF_PI&&(r=this.long0)}return t.x=r,t.y=i,t}}}),define("proj4/projCode/moll",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){},forward:function(t){for(var i=t.x,s=t.y,r=e.adjust_lon(i-this.long0),a=s,n=e.PI*Math.sin(s),h=0;!0;h++){var o=-(a+Math.sin(a)-n)/(1+Math.cos(a));if(a+=o,Math.abs(o)<e.EPSLN)break}a/=2,e.PI/2-Math.abs(s)<e.EPSLN&&(r=0);var u=.900316316158*this.a*r*Math.cos(a)+this.x0,l=1.4142135623731*this.a*Math.sin(a)+this.y0;return t.x=u,t.y=l,t},inverse:function(t){var i,s;t.x-=this.x0,t.y-=this.y0,s=t.y/(1.4142135623731*this.a),Math.abs(s)>.999999999999&&(s=.999999999999),i=Math.asin(s);var r=e.adjust_lon(this.long0+t.x/(.900316316158*this.a*Math.cos(i)));r<-e.PI&&(r=-e.PI),r>e.PI&&(r=e.PI),s=(2*i+Math.sin(2*i))/e.PI,Math.abs(s)>1&&(s=1);var a=Math.asin(s);return t.x=r,t.y=a,t}}}),define("proj4/projCode/eqdc",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){return Math.abs(this.lat1+this.lat2)<e.EPSLN?(e.reportError("eqdc:init: Equal Latitudes"),void 0):(this.lat2=this.lat2||this.lat1,this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=e.e0fn(this.es),this.e1=e.e1fn(this.es),this.e2=e.e2fn(this.es),this.e3=e.e3fn(this.es),this.sinphi=Math.sin(this.lat1),this.cosphi=Math.cos(this.lat1),this.ms1=e.msfnz(this.e,this.sinphi,this.cosphi),this.ml1=e.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat1),Math.abs(this.lat1-this.lat2)<e.EPSLN?this.ns=this.sinphi:(this.sinphi=Math.sin(this.lat2),this.cosphi=Math.cos(this.lat2),this.ms2=e.msfnz(this.e,this.sinphi,this.cosphi),this.ml2=e.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat2),this.ns=(this.ms1-this.ms2)/(this.ml2-this.ml1)),this.g=this.ml1+this.ms1/this.ns,this.ml0=e.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0),this.rh=this.a*(this.g-this.ml0),void 0)},forward:function(t){var i,s=t.x,r=t.y;if(this.sphere)i=this.a*(this.g-r);else{var a=e.mlfn(this.e0,this.e1,this.e2,this.e3,r);i=this.a*(this.g-a)}var n=this.ns*e.adjust_lon(s-this.long0),h=this.x0+i*Math.sin(n),o=this.y0+this.rh-i*Math.cos(n);return t.x=h,t.y=o,t},inverse:function(t){t.x-=this.x0,t.y=this.rh-t.y+this.y0;var i,s,r,a;this.ns>=0?(s=Math.sqrt(t.x*t.x+t.y*t.y),i=1):(s=-Math.sqrt(t.x*t.x+t.y*t.y),i=-1);var n=0;if(0!==s&&(n=Math.atan2(i*t.x,i*t.y)),this.sphere)return a=e.adjust_lon(this.long0+n/this.ns),r=e.adjust_lat(this.g-s/this.a),t.x=a,t.y=r,t;var h=this.g-s/this.a;return r=e.imlfn(h,this.e0,this.e1,this.e2,this.e3),a=e.adjust_lon(this.long0+n/this.ns),t.x=a,t.y=r,t}}}),define("proj4/projCode/vandg",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.R=this.a},forward:function(t){var i,s,r=t.x,a=t.y,n=e.adjust_lon(r-this.long0);Math.abs(a)<=e.EPSLN&&(i=this.x0+this.R*n,s=this.y0);var h=e.asinz(2*Math.abs(a/e.PI));(Math.abs(n)<=e.EPSLN||Math.abs(Math.abs(a)-e.HALF_PI)<=e.EPSLN)&&(i=this.x0,s=a>=0?this.y0+e.PI*this.R*Math.tan(.5*h):this.y0+e.PI*this.R*-Math.tan(.5*h));var o=.5*Math.abs(e.PI/n-n/e.PI),u=o*o,l=Math.sin(h),f=Math.cos(h),c=f/(l+f-1),p=c*c,d=c*(2/l-1),m=d*d,y=e.PI*this.R*(o*(c-m)+Math.sqrt(u*(c-m)*(c-m)-(m+u)*(p-m)))/(m+u);0>n&&(y=-y),i=this.x0+y;var M=u+c;return y=e.PI*this.R*(d*M-o*Math.sqrt((m+u)*(u+1)-M*M))/(m+u),s=a>=0?this.y0+y:this.y0-y,t.x=i,t.y=s,t},inverse:function(t){var i,s,r,a,n,h,o,u,l,f,c,p,d;return t.x-=this.x0,t.y-=this.y0,c=e.PI*this.R,r=t.x/c,a=t.y/c,n=r*r+a*a,h=-Math.abs(a)*(1+n),o=h-2*a*a+r*r,u=-2*h+1+2*a*a+n*n,d=a*a/u+(2*o*o*o/u/u/u-9*h*o/u/u)/27,l=(h-o*o/3/u)/u,f=2*Math.sqrt(-l/3),c=3*d/l/f,Math.abs(c)>1&&(c=c>=0?1:-1),p=Math.acos(c)/3,s=t.y>=0?(-f*Math.cos(p+e.PI/3)-o/3/u)*e.PI:-(-f*Math.cos(p+e.PI/3)-o/3/u)*e.PI,i=Math.abs(r)<e.EPSLN?this.long0:e.adjust_lon(this.long0+e.PI*(n-1+Math.sqrt(1+2*(r*r-a*a)+n*n))/2/r),t.x=i,t.y=s,t}}}),define("proj4/projCode/aeqd",["require","proj4/common"],function(t){var e=t("proj4/common");return{init:function(){this.sin_p12=Math.sin(this.lat0),this.cos_p12=Math.cos(this.lat0)},forward:function(t){var i,s,r,a,n,h,o,u,l,f,c,p,d,m,y,M,g,_,b,v,j,x,A,C=t.x,w=t.y,S=Math.sin(t.y),I=Math.cos(t.y),P=e.adjust_lon(C-this.long0);return this.sphere?Math.abs(this.sin_p12-1)<=e.EPSLN?(t.x=this.x0+this.a*(e.HALF_PI-w)*Math.sin(P),t.y=this.y0-this.a*(e.HALF_PI-w)*Math.cos(P),t):Math.abs(this.sin_p12+1)<=e.EPSLN?(t.x=this.x0+this.a*(e.HALF_PI+w)*Math.sin(P),t.y=this.y0+this.a*(e.HALF_PI+w)*Math.cos(P),t):(_=this.sin_p12*S+this.cos_p12*I*Math.cos(P),M=Math.acos(_),g=M/Math.sin(M),t.x=this.x0+this.a*g*I*Math.sin(P),t.y=this.y0+this.a*g*(this.cos_p12*S-this.sin_p12*I*Math.cos(P)),t):(i=e.e0fn(this.es),s=e.e1fn(this.es),r=e.e2fn(this.es),a=e.e3fn(this.es),Math.abs(this.sin_p12-1)<=e.EPSLN?(n=this.a*e.mlfn(i,s,r,a,e.HALF_PI),h=this.a*e.mlfn(i,s,r,a,w),t.x=this.x0+(n-h)*Math.sin(P),t.y=this.y0-(n-h)*Math.cos(P),t):Math.abs(this.sin_p12+1)<=e.EPSLN?(n=this.a*e.mlfn(i,s,r,a,e.HALF_PI),h=this.a*e.mlfn(i,s,r,a,w),t.x=this.x0+(n+h)*Math.sin(P),t.y=this.y0+(n+h)*Math.cos(P),t):(o=S/I,u=e.gN(this.a,this.e,this.sin_p12),l=e.gN(this.a,this.e,S),f=Math.atan((1-this.es)*o+this.es*u*this.sin_p12/(l*I)),c=Math.atan2(Math.sin(P),this.cos_p12*Math.tan(f)-this.sin_p12*Math.cos(P)),b=0===c?Math.asin(this.cos_p12*Math.sin(f)-this.sin_p12*Math.cos(f)):Math.abs(Math.abs(c)-e.PI)<=e.EPSLN?-Math.asin(this.cos_p12*Math.sin(f)-this.sin_p12*Math.cos(f)):Math.asin(Math.sin(P)*Math.cos(f)/Math.sin(c)),p=this.e*this.sin_p12/Math.sqrt(1-this.es),d=this.e*this.cos_p12*Math.cos(c)/Math.sqrt(1-this.es),m=p*d,y=d*d,v=b*b,j=v*b,x=j*b,A=x*b,M=u*b*(1-v*y*(1-y)/6+j/8*m*(1-2*y)+x/120*(y*(4-7*y)-3*p*p*(1-7*y))-A/48*m),t.x=this.x0+M*Math.sin(c),t.y=this.y0+M*Math.cos(c),t))
},inverse:function(t){t.x-=this.x0,t.y-=this.y0;var i,s,r,a,n,h,o,u,l,f,c,p,d,m,y,M,g,_,b,v,j,x,A;if(this.sphere){if(i=Math.sqrt(t.x*t.x+t.y*t.y),i>2*e.HALF_PI*this.a)return;return s=i/this.a,r=Math.sin(s),a=Math.cos(s),n=this.long0,Math.abs(i)<=e.EPSLN?h=this.lat0:(h=e.asinz(a*this.sin_p12+t.y*r*this.cos_p12/i),o=Math.abs(this.lat0)-e.HALF_PI,n=Math.abs(o)<=e.EPSLN?this.lat0>=0?e.adjust_lon(this.long0+Math.atan2(t.x,-t.y)):e.adjust_lon(this.long0-Math.atan2(-t.x,t.y)):e.adjust_lon(this.long0+Math.atan2(t.x*r,i*this.cos_p12*a-t.y*this.sin_p12*r))),t.x=n,t.y=h,t}return u=e.e0fn(this.es),l=e.e1fn(this.es),f=e.e2fn(this.es),c=e.e3fn(this.es),Math.abs(this.sin_p12-1)<=e.EPSLN?(p=this.a*e.mlfn(u,l,f,c,e.HALF_PI),i=Math.sqrt(t.x*t.x+t.y*t.y),d=p-i,h=e.imlfn(d/this.a,u,l,f,c),n=e.adjust_lon(this.long0+Math.atan2(t.x,-1*t.y)),t.x=n,t.y=h,t):Math.abs(this.sin_p12+1)<=e.EPSLN?(p=this.a*e.mlfn(u,l,f,c,e.HALF_PI),i=Math.sqrt(t.x*t.x+t.y*t.y),d=i-p,h=e.imlfn(d/this.a,u,l,f,c),n=e.adjust_lon(this.long0+Math.atan2(t.x,t.y)),t.x=n,t.y=h,t):(i=Math.sqrt(t.x*t.x+t.y*t.y),M=Math.atan2(t.x,t.y),m=e.gN(this.a,this.e,this.sin_p12),g=Math.cos(M),_=this.e*this.cos_p12*g,b=-_*_/(1-this.es),v=3*this.es*(1-b)*this.sin_p12*this.cos_p12*g/(1-this.es),j=i/m,x=j-b*(1+b)*Math.pow(j,3)/6-v*(1+3*b)*Math.pow(j,4)/24,A=1-b*x*x/2-j*x*x*x/6,y=Math.asin(this.sin_p12*Math.cos(x)+this.cos_p12*Math.sin(x)*g),n=e.adjust_lon(this.long0+Math.asin(Math.sin(M)*Math.sin(x)/Math.cos(y))),h=Math.atan((1-this.es*A*this.sin_p12/Math.sin(y))*Math.tan(y)/(1-this.es)),t.x=n,t.y=h,t)}}}),define("proj4/projections",["require","exports","module","proj4/projCode/longlat","proj4/projCode/tmerc","proj4/projCode/utm","proj4/projCode/sterea","proj4/projCode/somerc","proj4/projCode/omerc","proj4/projCode/lcc","proj4/projCode/krovak","proj4/projCode/cass","proj4/projCode/laea","proj4/projCode/merc","proj4/projCode/aea","proj4/projCode/gnom","proj4/projCode/cea","proj4/projCode/eqc","proj4/projCode/poly","proj4/projCode/nzmg","proj4/projCode/mill","proj4/projCode/sinu","proj4/projCode/moll","proj4/projCode/eqdc","proj4/projCode/vandg","proj4/projCode/aeqd","proj4/projCode/longlat"],function(t,e){e.longlat=t("proj4/projCode/longlat"),e.identity=e.longlat,e.tmerc=t("proj4/projCode/tmerc"),e.utm=t("proj4/projCode/utm"),e.sterea=t("proj4/projCode/sterea"),e.somerc=t("proj4/projCode/somerc"),e.omerc=t("proj4/projCode/omerc"),e.lcc=t("proj4/projCode/lcc"),e.krovak=t("proj4/projCode/krovak"),e.cass=t("proj4/projCode/cass"),e.laea=t("proj4/projCode/laea"),e.merc=t("proj4/projCode/merc"),e.aea=t("proj4/projCode/aea"),e.gnom=t("proj4/projCode/gnom"),e.cea=t("proj4/projCode/cea"),e.eqc=t("proj4/projCode/eqc"),e.poly=t("proj4/projCode/poly"),e.nzmg=t("proj4/projCode/nzmg"),e.mill=t("proj4/projCode/mill"),e.sinu=t("proj4/projCode/sinu"),e.moll=t("proj4/projCode/moll"),e.eqdc=t("proj4/projCode/eqdc"),e.vandg=t("proj4/projCode/vandg"),e.aeqd=t("proj4/projCode/aeqd"),e.longlat=t("proj4/projCode/longlat"),e.identity=e.longlat}),define("proj4/Proj",["require","proj4/extend","proj4/common","proj4/defs","proj4/constants","proj4/datum","proj4/projections","proj4/wkt","proj4/projString"],function(t){var e=t("proj4/extend"),i=t("proj4/common"),s=t("proj4/defs"),r=t("proj4/constants"),a=t("proj4/datum"),n=t("proj4/projections"),h=t("proj4/wkt"),o=t("proj4/projString"),u=function l(t){if(!(this instanceof l))return new l(t);this.srsCodeInput=t;var i;"string"==typeof t?t in s?(this.deriveConstants(s[t]),e(this,s[t])):t.indexOf("GEOGCS")>=0||t.indexOf("GEOCCS")>=0||t.indexOf("PROJCS")>=0||t.indexOf("LOCAL_CS")>=0?(i=h(t),this.deriveConstants(i),e(this,i)):"+"===t[0]&&(i=o(t),this.deriveConstants(i),e(this,i)):(this.deriveConstants(t),e(this,t)),this.initTransforms(this.projName)};return u.prototype={initTransforms:function(t){if(!(t in u.projections))throw"unknown projection "+t;e(this,u.projections[t]),this.init()},deriveConstants:function(t){if(t.nadgrids&&0===t.nadgrids.length&&(t.nadgrids=null),t.nadgrids){t.grids=t.nadgrids.split(",");var s=null,n=t.grids.length;if(n>0)for(var h=0;n>h;h++){s=t.grids[h];var o=s.split("@");""!==o[o.length-1]&&(t.grids[h]={mandatory:1===o.length,name:o[o.length-1],grid:r.grids[o[o.length-1]]},t.grids[h].mandatory&&!t.grids[h].grid)}}if(t.datumCode&&"none"!==t.datumCode){var u=r.Datum[t.datumCode];u&&(t.datum_params=u.towgs84?u.towgs84.split(","):null,t.ellps=u.ellipse,t.datumName=u.datumName?u.datumName:t.datumCode)}if(!t.a){var l=r.Ellipsoid[t.ellps]?r.Ellipsoid[t.ellps]:r.Ellipsoid.WGS84;e(t,l)}t.rf&&!t.b&&(t.b=(1-1/t.rf)*t.a),(0===t.rf||Math.abs(t.a-t.b)<i.EPSLN)&&(t.sphere=!0,t.b=t.a),t.a2=t.a*t.a,t.b2=t.b*t.b,t.es=(t.a2-t.b2)/t.a2,t.e=Math.sqrt(t.es),t.R_A&&(t.a*=1-t.es*(i.SIXTH+t.es*(i.RA4+t.es*i.RA6)),t.a2=t.a*t.a,t.b2=t.b*t.b,t.es=0),t.ep2=(t.a2-t.b2)/t.b2,t.k0||(t.k0=1),t.axis||(t.axis="enu"),t.datum=a(t)}},u.projections=n,u}),define("proj4/datum_transform",["require","proj4/common"],function(t){var e=t("proj4/common");return function(t,i,s){function r(t){return t===e.PJD_3PARAM||t===e.PJD_7PARAM}var a,n,h;if(t.compare_datums(i))return s;if(t.datum_type===e.PJD_NODATUM||i.datum_type===e.PJD_NODATUM)return s;var o=t.a,u=t.es,l=i.a,f=i.es,c=t.datum_type;if(c===e.PJD_GRIDSHIFT)if(0===this.apply_gridshift(t,0,s))t.a=e.SRS_WGS84_SEMIMAJOR,t.es=e.SRS_WGS84_ESQUARED;else{if(!t.datum_params)return t.a=o,t.es=t.es,s;for(a=1,n=0,h=t.datum_params.length;h>n;n++)a*=t.datum_params[n];if(0===a)return t.a=o,t.es=t.es,s;c=t.datum_params.length>3?e.PJD_7PARAM:e.PJD_3PARAM}return i.datum_type===e.PJD_GRIDSHIFT&&(i.a=e.SRS_WGS84_SEMIMAJOR,i.es=e.SRS_WGS84_ESQUARED),(t.es!==i.es||t.a!==i.a||r(c)||r(i.datum_type))&&(t.geodetic_to_geocentric(s),r(t.datum_type)&&t.geocentric_to_wgs84(s),r(i.datum_type)&&i.geocentric_from_wgs84(s),i.geocentric_to_geodetic(s)),i.datum_type===e.PJD_GRIDSHIFT&&this.apply_gridshift(i,1,s),t.a=o,t.es=u,i.a=l,i.es=f,s}}),define("proj4/adjust_axis",[],function(){return function(t,e,i){var s,r,a,n=i.x,h=i.y,o=i.z||0;for(a=0;3>a;a++)if(!e||2!==a||void 0!==i.z)switch(0===a?(s=n,r="x"):1===a?(s=h,r="y"):(s=o,r="z"),t.axis[a]){case"e":i[r]=s;break;case"w":i[r]=-s;break;case"n":i[r]=s;break;case"s":i[r]=-s;break;case"u":void 0!==i[r]&&(i.z=s);break;case"d":void 0!==i[r]&&(i.z=-s);break;default:return null}return i}}),define("proj4/transform",["require","proj4/common","proj4/datum_transform","proj4/adjust_axis","proj4/Proj"],function(t){var e=t("proj4/common"),i=t("proj4/datum_transform"),s=t("proj4/adjust_axis"),r=t("proj4/Proj");return function(t,a,n){function h(t,i){return(t.datum.datum_type===e.PJD_3PARAM||t.datum.datum_type===e.PJD_7PARAM)&&"WGS84"!==i.datumCode}var o;return t.datum&&a.datum&&(h(t,a)||h(a,t))&&(o=new r("WGS84"),this.transform(t,o,n),t=o),"enu"!==t.axis&&s(t,!1,n),"longlat"===t.projName?(n.x*=e.D2R,n.y*=e.D2R):(t.to_meter&&(n.x*=t.to_meter,n.y*=t.to_meter),t.inverse(n)),t.from_greenwich&&(n.x+=t.from_greenwich),n=i(t.datum,a.datum,n),a.from_greenwich&&(n.x-=a.from_greenwich),"longlat"===a.projName?(n.x*=e.R2D,n.y*=e.R2D):(a.forward(n),a.to_meter&&(n.x/=a.to_meter,n.y/=a.to_meter)),"enu"!==a.axis&&s(a,!0,n),n}}),define("proj4/core",["require","proj4/Point","proj4/Proj","proj4/transform"],function(t){var e=t("proj4/Point"),i=t("proj4/Proj"),s=t("proj4/transform"),r=i("WGS84");return function(t,a,n){var h=function(i,r,n){var h;return Array.isArray(n)?(h=s(i,r,e(n)),3===n.length?[h.x,h.y,h.z]:[h.x,h.y]):s(t,a,n)};return t=t instanceof i?t:i(t),"undefined"==typeof a?(a=t,t=r):"string"==typeof a?a=i(a):"x"in a||Array.isArray(a)?(n=a,a=t,t=r):a=a instanceof i?a:i(a),n?h(t,a,n):{forward:function(e){return h(t,a,e)},inverse:function(e){return h(a,t,e)}}}}),define("proj4",["require","proj4/core","proj4/Proj","proj4/Point","proj4/defs","proj4/transform","proj4/mgrs"],function(t){var e=t("proj4/core");return e.defaultDatum="WGS84",e.Proj=t("proj4/Proj"),e.WGS84=new e.Proj("WGS84"),e.Point=t("proj4/Point"),e.defs=t("proj4/defs"),e.transform=t("proj4/transform"),e.mgrs=t("proj4/mgrs"),e}),define("jszip/support",["require","exports","module"],function(t,e){if(e.base64=!0,e.array=!0,e.string=!0,e.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,e.nodebuffer="undefined"!=typeof Buffer,e.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)e.blob=!1;else{var i=new ArrayBuffer(0);try{e.blob=0===new Blob([i],{type:"application/zip"}).size}catch(s){try{var r=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,a=new r;a.append(i),e.blob=0===a.getBlob("application/zip").size}catch(s){e.blob=!1}}}}),define("jszip/flate/inflate",[],function(){var t={};return function(){!function(){function t(t,e){var i=t.split("."),s=h;!(i[0]in s)&&s.execScript&&s.execScript("var "+i[0]);for(var r;i.length&&(r=i.shift());)i.length||e===n?s=s[r]?s[r]:s[r]={}:s[r]=e}function e(t){var e,i,s,r,a,n,h,u,l,f=t.length,c=0,p=Number.POSITIVE_INFINITY;for(u=0;f>u;++u)t[u]>c&&(c=t[u]),t[u]<p&&(p=t[u]);for(e=1<<c,i=new(o?Uint32Array:Array)(e),s=1,r=0,a=2;c>=s;){for(u=0;f>u;++u)if(t[u]===s){for(n=0,h=r,l=0;s>l;++l)n=n<<1|1&h,h>>=1;for(l=n;e>l;l+=a)i[l]=s<<16|u;++r}++s,r<<=1,a<<=1}return[i,c,p]}function i(t,e){switch(this.g=[],this.h=32768,this.c=this.f=this.d=this.k=0,this.input=o?new Uint8Array(t):t,this.l=!1,this.i=l,this.p=!1,(e||!(e={}))&&(e.index&&(this.d=e.index),e.bufferSize&&(this.h=e.bufferSize),e.bufferType&&(this.i=e.bufferType),e.resize&&(this.p=e.resize)),this.i){case u:this.a=32768,this.b=new(o?Uint8Array:Array)(32768+this.h+258);break;case l:this.a=0,this.b=new(o?Uint8Array:Array)(this.h),this.e=this.u,this.m=this.r,this.j=this.s;break;default:throw Error("invalid inflate mode")}}function s(t,e){for(var i,s=t.f,r=t.c,a=t.input,h=t.d;e>r;){if(i=a[h++],i===n)throw Error("input buffer is broken");s|=i<<r,r+=8}return i=s&(1<<e)-1,t.f=s>>>e,t.c=r-e,t.d=h,i}function r(t,e){for(var i,s,r,a=t.f,h=t.c,o=t.input,u=t.d,l=e[0],f=e[1];f>h&&(i=o[u++],i!==n);)a|=i<<h,h+=8;return s=l[a&(1<<f)-1],r=s>>>16,t.f=a>>r,t.c=h-r,t.d=u,65535&s}function a(t){function i(t,e,i){var a,n,h,o;for(o=0;t>o;)switch(a=r(this,e)){case 16:for(h=3+s(this,2);h--;)i[o++]=n;break;case 17:for(h=3+s(this,3);h--;)i[o++]=0;n=0;break;case 18:for(h=11+s(this,7);h--;)i[o++]=0;n=0;break;default:n=i[o++]=a}return i}var a,n,h,u,l=s(t,5)+257,f=s(t,5)+1,c=s(t,4)+4,p=new(o?Uint8Array:Array)(d.length);for(u=0;c>u;++u)p[d[u]]=s(t,3);a=e(p),n=new(o?Uint8Array:Array)(l),h=new(o?Uint8Array:Array)(f),t.j(e(i.call(t,l,a,n)),e(i.call(t,f,a,h)))}var n=void 0,h=this,o="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,u=0,l=1;i.prototype.t=function(){for(;!this.l;){var t=s(this,3);switch(1&t&&(this.l=!0),t>>>=1){case 0:var e=this.input,i=this.d,r=this.b,h=this.a,f=n,c=n,p=n,d=r.length,m=n;if(this.c=this.f=0,f=e[i++],f===n)throw Error("invalid uncompressed block header: LEN (first byte)");if(c=f,f=e[i++],f===n)throw Error("invalid uncompressed block header: LEN (second byte)");if(c|=f<<8,f=e[i++],f===n)throw Error("invalid uncompressed block header: NLEN (first byte)");if(p=f,f=e[i++],f===n)throw Error("invalid uncompressed block header: NLEN (second byte)");if(p|=f<<8,c===~p)throw Error("invalid uncompressed block header: length verify");if(i+c>e.length)throw Error("input buffer is broken");switch(this.i){case u:for(;h+c>r.length;){if(m=d-h,c-=m,o)r.set(e.subarray(i,i+m),h),h+=m,i+=m;else for(;m--;)r[h++]=e[i++];this.a=h,r=this.e(),h=this.a}break;case l:for(;h+c>r.length;)r=this.e({o:2});break;default:throw Error("invalid inflate mode")}if(o)r.set(e.subarray(i,i+c),h),h+=c,i+=c;else for(;c--;)r[h++]=e[i++];this.d=i,this.a=h,this.b=r;break;case 1:this.j(w,I);break;case 2:a(this);break;default:throw Error("unknown BTYPE: "+t)}}return this.m()};var f,c,p=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],d=o?new Uint16Array(p):p,m=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],y=o?new Uint16Array(m):m,M=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],g=o?new Uint8Array(M):M,_=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],b=o?new Uint16Array(_):_,v=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],j=o?new Uint8Array(v):v,x=new(o?Uint8Array:Array)(288);for(f=0,c=x.length;c>f;++f)x[f]=143>=f?8:255>=f?9:279>=f?7:8;var A,C,w=e(x),S=new(o?Uint8Array:Array)(30);for(A=0,C=S.length;C>A;++A)S[A]=5;var I=e(S);i.prototype.j=function(t,e){var i=this.b,a=this.a;this.n=t;for(var n,h,o,u,l=i.length-258;256!==(n=r(this,t));)if(256>n)a>=l&&(this.a=a,i=this.e(),a=this.a),i[a++]=n;else for(h=n-257,u=y[h],0<g[h]&&(u+=s(this,g[h])),n=r(this,e),o=b[n],0<j[n]&&(o+=s(this,j[n])),a>=l&&(this.a=a,i=this.e(),a=this.a);u--;)i[a]=i[a++-o];for(;8<=this.c;)this.c-=8,this.d--;this.a=a},i.prototype.s=function(t,e){var i=this.b,a=this.a;this.n=t;for(var n,h,o,u,l=i.length;256!==(n=r(this,t));)if(256>n)a>=l&&(i=this.e(),l=i.length),i[a++]=n;else for(h=n-257,u=y[h],0<g[h]&&(u+=s(this,g[h])),n=r(this,e),o=b[n],0<j[n]&&(o+=s(this,j[n])),a+u>l&&(i=this.e(),l=i.length);u--;)i[a]=i[a++-o];for(;8<=this.c;)this.c-=8,this.d--;this.a=a},i.prototype.e=function(){var t,e,i=new(o?Uint8Array:Array)(this.a-32768),s=this.a-32768,r=this.b;if(o)i.set(r.subarray(32768,i.length));else for(t=0,e=i.length;e>t;++t)i[t]=r[t+32768];if(this.g.push(i),this.k+=i.length,o)r.set(r.subarray(s,s+32768));else for(t=0;32768>t;++t)r[t]=r[s+t];return this.a=32768,r},i.prototype.u=function(t){var e,i,s,r,a=0|this.input.length/this.d+1,n=this.input,h=this.b;return t&&("number"==typeof t.o&&(a=t.o),"number"==typeof t.q&&(a+=t.q)),2>a?(i=(n.length-this.d)/this.n[2],r=0|258*(i/2),s=r<h.length?h.length+r:h.length<<1):s=h.length*a,o?(e=new Uint8Array(s),e.set(h)):e=h,this.b=e},i.prototype.m=function(){var t,e,i,s,r,a=0,n=this.b,h=this.g,u=new(o?Uint8Array:Array)(this.k+(this.a-32768));if(0===h.length)return o?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);for(e=0,i=h.length;i>e;++e)for(t=h[e],s=0,r=t.length;r>s;++s)u[a++]=t[s];for(e=32768,i=this.a;i>e;++e)u[a++]=n[e];return this.g=[],this.buffer=u},i.prototype.r=function(){var t,e=this.a;return o?this.p?(t=new Uint8Array(e),t.set(this.b.subarray(0,e))):t=this.b.subarray(0,e):(this.b.length>e&&(this.b.length=e),t=this.b),this.buffer=t},t("Zlib.RawInflate",i),t("Zlib.RawInflate.prototype.decompress",i.prototype.t);var P,E,k,N,z={ADAPTIVE:l,BLOCK:u};if(Object.keys)P=Object.keys(z);else for(E in P=[],k=0,z)P[k++]=E;for(k=0,N=P.length;N>k;++k)E=P[k],t("Zlib.RawInflate.BufferType."+E,z[E])}.call(this)}.call(t),function(e){var i=new t.Zlib.RawInflate(new Uint8Array(e));return i.decompress()}}),define("jszip/flate/deflate",[],function(){var t={};return function(){!function(){function t(t,e){var i=t.split("."),s=p;!(i[0]in s)&&s.execScript&&s.execScript("var "+i[0]);for(var r;i.length&&(r=i.shift());)i.length||e===f?s=s[r]?s[r]:s[r]={}:s[r]=e}function e(t,e){if(this.index="number"==typeof e?e:0,this.d=0,this.buffer=t instanceof(d?Uint8Array:Array)?t:new(d?Uint8Array:Array)(32768),2*this.buffer.length<=this.index)throw Error("invalid index");this.buffer.length<=this.index&&i(this)}function i(t){var e,i=t.buffer,s=i.length,r=new(d?Uint8Array:Array)(s<<1);if(d)r.set(i);else for(e=0;s>e;++e)r[e]=i[e];return t.buffer=r}function s(t){this.buffer=new(d?Uint16Array:Array)(2*t),this.length=0}function r(t,e){this.e=j,this.f=0,this.input=d&&t instanceof Array?new Uint8Array(t):t,this.c=0,e&&(e.lazy&&(this.f=e.lazy),"number"==typeof e.compressionType&&(this.e=e.compressionType),e.outputBuffer&&(this.b=d&&e.outputBuffer instanceof Array?new Uint8Array(e.outputBuffer):e.outputBuffer),"number"==typeof e.outputIndex&&(this.c=e.outputIndex)),this.b||(this.b=new(d?Uint8Array:Array)(32768))}function a(t,e){this.length=t,this.g=e}function n(t,e){function i(t,e){var i,s=t.g,r=[],a=0;i=C[t.length],r[a++]=65535&i,r[a++]=255&i>>16,r[a++]=i>>24;var n;switch(c){case 1===s:n=[0,s-1,0];break;case 2===s:n=[1,s-2,0];break;case 3===s:n=[2,s-3,0];break;case 4===s:n=[3,s-4,0];break;case 6>=s:n=[4,s-5,1];break;case 8>=s:n=[5,s-7,1];break;case 12>=s:n=[6,s-9,2];break;case 16>=s:n=[7,s-13,2];break;case 24>=s:n=[8,s-17,3];break;case 32>=s:n=[9,s-25,3];break;case 48>=s:n=[10,s-33,4];break;case 64>=s:n=[11,s-49,4];break;case 96>=s:n=[12,s-65,5];break;case 128>=s:n=[13,s-97,5];break;case 192>=s:n=[14,s-129,6];break;case 256>=s:n=[15,s-193,6];break;case 384>=s:n=[16,s-257,7];break;case 512>=s:n=[17,s-385,7];break;case 768>=s:n=[18,s-513,8];break;case 1024>=s:n=[19,s-769,8];break;case 1536>=s:n=[20,s-1025,9];break;case 2048>=s:n=[21,s-1537,9];break;case 3072>=s:n=[22,s-2049,10];break;case 4096>=s:n=[23,s-3073,10];break;case 6144>=s:n=[24,s-4097,11];break;case 8192>=s:n=[25,s-6145,11];break;case 12288>=s:n=[26,s-8193,12];break;case 16384>=s:n=[27,s-12289,12];break;case 24576>=s:n=[28,s-16385,13];break;case 32768>=s:n=[29,s-24577,13];break;default:throw"invalid distance"}i=n,r[a++]=i[0],r[a++]=i[1],r[a++]=i[2];var h,o;for(h=0,o=r.length;o>h;++h)M[g++]=r[h];b[r[0]]++,v[r[3]]++,_=t.length+e-1,p=null}var s,r,a,n,o,u,l,p,m,y={},M=d?new Uint16Array(2*e.length):[],g=0,_=0,b=new(d?Uint32Array:Array)(286),v=new(d?Uint32Array:Array)(30),j=t.f;if(!d){for(a=0;285>=a;)b[a++]=0;for(a=0;29>=a;)v[a++]=0}for(b[256]=1,s=0,r=e.length;r>s;++s){for(a=o=0,n=3;n>a&&s+a!==r;++a)o=o<<8|e[s+a];if(y[o]===f&&(y[o]=[]),u=y[o],!(0<_--)){for(;0<u.length&&32768<s-u[0];)u.shift();if(s+3>=r){for(p&&i(p,-1),a=0,n=r-s;n>a;++a)m=e[s+a],M[g++]=m,++b[m];break}0<u.length?(l=h(e,s,u),p?p.length<l.length?(m=e[s-1],M[g++]=m,++b[m],i(l,0)):i(p,-1):l.length<j?p=l:i(l,0)):p?i(p,-1):(m=e[s],M[g++]=m,++b[m])}u.push(s)}return M[g++]=256,b[256]++,t.j=b,t.i=v,d?M.subarray(0,g):M}function h(t,e,i){var s,r,n,h,o,u,l=0,f=t.length;h=0,u=i.length;t:for(;u>h;h++){if(s=i[u-h-1],n=3,l>3){for(o=l;o>3;o--)if(t[s+o-1]!==t[e+o-1])continue t;n=l}for(;258>n&&f>e+n&&t[s+n]===t[e+n];)++n;if(n>l&&(r=s,l=n),258===n)break}return new a(l,e-r)}function o(t,e){var i,r,a,n,h,o=t.length,l=new s(572),f=new(d?Uint8Array:Array)(o);if(!d)for(n=0;o>n;n++)f[n]=0;for(n=0;o>n;++n)0<t[n]&&l.push(n,t[n]);if(i=Array(l.length/2),r=new(d?Uint32Array:Array)(l.length/2),1===i.length)return f[l.pop().index]=1,f;for(n=0,h=l.length/2;h>n;++n)i[n]=l.pop(),r[n]=i[n].value;for(a=u(r,r.length,e),n=0,h=i.length;h>n;++n)f[i[n].index]=a[n];return f}function u(t,e,i){function s(t){var i=p[t][m[t]];i===e?(s(t+1),s(t+1)):--f[i],++m[t]}var r,a,n,h,o,u=new(d?Uint16Array:Array)(i),l=new(d?Uint8Array:Array)(i),f=new(d?Uint8Array:Array)(e),c=Array(i),p=Array(i),m=Array(i),y=(1<<i)-e,M=1<<i-1;for(u[i-1]=e,a=0;i>a;++a)M>y?l[a]=0:(l[a]=1,y-=M),y<<=1,u[i-2-a]=(0|u[i-1-a]/2)+e;for(u[0]=l[0],c[0]=Array(u[0]),p[0]=Array(u[0]),a=1;i>a;++a)u[a]>2*u[a-1]+l[a]&&(u[a]=2*u[a-1]+l[a]),c[a]=Array(u[a]),p[a]=Array(u[a]);for(r=0;e>r;++r)f[r]=i;for(n=0;n<u[i-1];++n)c[i-1][n]=t[n],p[i-1][n]=n;for(r=0;i>r;++r)m[r]=0;for(1===l[i-1]&&(--f[0],++m[i-1]),a=i-2;a>=0;--a){for(h=r=0,o=m[a+1],n=0;n<u[a];n++)h=c[a+1][o]+c[a+1][o+1],h>t[r]?(c[a][n]=h,p[a][n]=e,o+=2):(c[a][n]=t[r],p[a][n]=r,++r);m[a]=0,1===l[a]&&s(a)}return f}function l(t){var e,i,s,r,a=new(d?Uint16Array:Array)(t.length),n=[],h=[],o=0;for(e=0,i=t.length;i>e;e++)n[t[e]]=(0|n[t[e]])+1;for(e=1,i=16;i>=e;e++)h[e]=o,o+=0|n[e],o<<=1;for(e=0,i=t.length;i>e;e++)for(o=h[t[e]],h[t[e]]+=1,s=a[e]=0,r=t[e];r>s;s++)a[e]=a[e]<<1|1&o,o>>>=1;return a}var f=void 0,c=!0,p=this,d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array;e.prototype.a=function(t,e,s){var r,a=this.buffer,n=this.index,h=this.d,o=a[n];if(s&&e>1&&(t=e>8?(b[255&t]<<24|b[255&t>>>8]<<16|b[255&t>>>16]<<8|b[255&t>>>24])>>32-e:b[t]>>8-e),8>e+h)o=o<<e|t,h+=e;else for(r=0;e>r;++r)o=o<<1|1&t>>e-r-1,8===++h&&(h=0,a[n++]=b[o],o=0,n===a.length&&(a=i(this)));a[n]=o,this.buffer=a,this.d=h,this.index=n},e.prototype.finish=function(){var t,e=this.buffer,i=this.index;return 0<this.d&&(e[i]<<=8-this.d,e[i]=b[e[i]],i++),d?t=e.subarray(0,i):(e.length=i,t=e),t};var m,y=new(d?Uint8Array:Array)(256);for(m=0;256>m;++m){for(var M=m,g=M,_=7,M=M>>>1;M;M>>>=1)g<<=1,g|=1&M,--_;y[m]=(255&g<<_)>>>0}var b=y;s.prototype.getParent=function(t){return 2*(0|(t-2)/4)},s.prototype.push=function(t,e){var i,s,r,a=this.buffer;for(i=this.length,a[this.length++]=e,a[this.length++]=t;i>0&&(s=this.getParent(i),a[i]>a[s]);)r=a[i],a[i]=a[s],a[s]=r,r=a[i+1],a[i+1]=a[s+1],a[s+1]=r,i=s;return this.length},s.prototype.pop=function(){var t,e,i,s,r,a=this.buffer;for(e=a[0],t=a[1],this.length-=2,a[0]=a[this.length],a[1]=a[this.length+1],r=0;(s=2*r+2,!(s>=this.length))&&(s+2<this.length&&a[s+2]>a[s]&&(s+=2),a[s]>a[r]);)i=a[r],a[r]=a[s],a[s]=i,i=a[r+1],a[r+1]=a[s+1],a[s+1]=i,r=s;return{index:t,value:e,length:this.length}};var v,j=2,x=[];for(v=0;288>v;v++)switch(c){case 143>=v:x.push([v+48,8]);break;case 255>=v:x.push([v-144+400,9]);break;case 279>=v:x.push([v-256+0,7]);break;case 287>=v:x.push([v-280+192,8]);break;default:throw"invalid literal: "+v}r.prototype.h=function(){var t,i,s,r,a=this.input;switch(this.e){case 0:for(s=0,r=a.length;r>s;){i=d?a.subarray(s,s+65535):a.slice(s,s+65535),s+=i.length;var h=i,u=s===r,p=f,m=f,y=f,M=f,g=f,_=this.b,b=this.c;if(d){for(_=new Uint8Array(this.b.buffer);_.length<=b+h.length+5;)_=new Uint8Array(_.length<<1);_.set(this.b)}if(p=u?1:0,_[b++]=0|p,m=h.length,y=65535&~m+65536,_[b++]=255&m,_[b++]=255&m>>>8,_[b++]=255&y,_[b++]=255&y>>>8,d)_.set(h,b),b+=h.length,_=_.subarray(0,b);else{for(M=0,g=h.length;g>M;++M)_[b++]=h[M];_.length=b}this.c=b,this.b=_}break;case 1:var v=new e(d?new Uint8Array(this.b.buffer):this.b,this.c);v.a(1,1,c),v.a(1,2,c);var A,C,w,S=n(this,a);for(A=0,C=S.length;C>A;A++)if(w=S[A],e.prototype.a.apply(v,x[w]),w>256)v.a(S[++A],S[++A],c),v.a(S[++A],5),v.a(S[++A],S[++A],c);else if(256===w)break;this.b=v.finish(),this.c=this.b.length;break;case j:var I,P,E,k,N,z,L,R,O,T,q,D,F,U,B,G=new e(d?new Uint8Array(this.b.buffer):this.b,this.c),H=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],J=Array(19);for(I=j,G.a(1,1,c),G.a(I,2,c),P=n(this,a),z=o(this.j,15),L=l(z),R=o(this.i,7),O=l(R),E=286;E>257&&0===z[E-1];E--);for(k=30;k>1&&0===R[k-1];k--);var W,Q,V,Z,X,K,Y=E,$=k,te=new(d?Uint32Array:Array)(Y+$),ee=new(d?Uint32Array:Array)(316),ie=new(d?Uint8Array:Array)(19);for(W=Q=0;Y>W;W++)te[Q++]=z[W];for(W=0;$>W;W++)te[Q++]=R[W];if(!d)for(W=0,Z=ie.length;Z>W;++W)ie[W]=0;for(W=X=0,Z=te.length;Z>W;W+=Q){for(Q=1;Z>W+Q&&te[W+Q]===te[W];++Q);if(V=Q,0===te[W])if(3>V)for(;0<V--;)ee[X++]=0,ie[0]++;else for(;V>0;)K=138>V?V:138,K>V-3&&V>K&&(K=V-3),10>=K?(ee[X++]=17,ee[X++]=K-3,ie[17]++):(ee[X++]=18,ee[X++]=K-11,ie[18]++),V-=K;else if(ee[X++]=te[W],ie[te[W]]++,V--,3>V)for(;0<V--;)ee[X++]=te[W],ie[te[W]]++;else for(;V>0;)K=6>V?V:6,K>V-3&&V>K&&(K=V-3),ee[X++]=16,ee[X++]=K-3,ie[16]++,V-=K}for(t=d?ee.subarray(0,X):ee.slice(0,X),T=o(ie,7),U=0;19>U;U++)J[U]=T[H[U]];for(N=19;N>4&&0===J[N-1];N--);for(q=l(T),G.a(E-257,5,c),G.a(k-1,5,c),G.a(N-4,4,c),U=0;N>U;U++)G.a(J[U],3,c);for(U=0,B=t.length;B>U;U++)if(D=t[U],G.a(q[D],T[D],c),D>=16){switch(U++,D){case 16:F=2;break;case 17:F=3;break;case 18:F=7;break;default:throw"invalid code: "+D}G.a(t[U],F,c)}var se,re,ae,ne,he,oe,ue,le,fe=[L,z],ce=[O,R];for(he=fe[0],oe=fe[1],ue=ce[0],le=ce[1],se=0,re=P.length;re>se;++se)if(ae=P[se],G.a(he[ae],oe[ae],c),ae>256)G.a(P[++se],P[++se],c),ne=P[++se],G.a(ue[ne],le[ne],c),G.a(P[++se],P[++se],c);else if(256===ae)break;this.b=G.finish(),this.c=this.b.length;break;default:throw"invalid compression type"}return this.b};var A=function(){function t(t){switch(c){case 3===t:return[257,t-3,0];case 4===t:return[258,t-4,0];case 5===t:return[259,t-5,0];case 6===t:return[260,t-6,0];case 7===t:return[261,t-7,0];case 8===t:return[262,t-8,0];case 9===t:return[263,t-9,0];case 10===t:return[264,t-10,0];case 12>=t:return[265,t-11,1];case 14>=t:return[266,t-13,1];case 16>=t:return[267,t-15,1];case 18>=t:return[268,t-17,1];case 22>=t:return[269,t-19,2];case 26>=t:return[270,t-23,2];case 30>=t:return[271,t-27,2];case 34>=t:return[272,t-31,2];case 42>=t:return[273,t-35,3];case 50>=t:return[274,t-43,3];case 58>=t:return[275,t-51,3];case 66>=t:return[276,t-59,3];case 82>=t:return[277,t-67,4];case 98>=t:return[278,t-83,4];case 114>=t:return[279,t-99,4];case 130>=t:return[280,t-115,4];case 162>=t:return[281,t-131,5];case 194>=t:return[282,t-163,5];case 226>=t:return[283,t-195,5];case 257>=t:return[284,t-227,5];case 258===t:return[285,t-258,0];default:throw"invalid length: "+t}}var e,i,s=[];for(e=3;258>=e;e++)i=t(e),s[e]=i[2]<<24|i[1]<<16|i[0];return s}(),C=d?new Uint32Array(A):A;t("Zlib.RawDeflate",r),t("Zlib.RawDeflate.prototype.compress",r.prototype.h);var w,S,I,P,E={NONE:0,FIXED:1,DYNAMIC:j};if(Object.keys)w=Object.keys(E);else for(S in w=[],I=0,E)w[I++]=S;for(I=0,P=w.length;P>I;++I)S=w[I],t("Zlib.RawDeflate.CompressionType."+S,E[S])}.call(this)}.call(t),function(e){var i=new t.Zlib.RawDeflate(e);return i.compress()}}),define("jszip/flate/main",["require","exports","module","jszip/flate/inflate","jszip/flate/deflate"],function(t,e){var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array;e.magic="\b\0",e.uncompress=t("jszip/flate/inflate"),e.uncompressInputType=i?"uint8array":"array",e.compress=t("jszip/flate/deflate"),e.compressInputType=i?"uint8array":"array"}),define("jszip/compressions",["require","jszip/flate/main"],function(t){return{STORE:{magic:"\0\0",compress:function(t){return t},uncompress:function(t){return t},compressInputType:null,uncompressInputType:null},DEFLATE:t("jszip/flate/main")}}),define("jszip/utils",["require","exports","module","jszip/support","jszip/compressions"],function(t,e){function i(t){return t}function s(t,e){for(var i=0;i<t.length;++i)e[i]=255&t.charCodeAt(i);return e}function r(t){for(var i=65536,s=[],r=t.length,a=e.getTypeOf(t),n=0;r>n&&i>1;)try{"array"===a||"nodebuffer"===a?s.push(String.fromCharCode.apply(null,t.slice(n,Math.max(n+i,r)))):s.push(String.fromCharCode.apply(null,t.subarray(n,n+i))),n+=i}catch(h){i=Math.floor(i/2)}return s.join("")}function a(t,e){for(var i=0;i<t.length;i++)e[i]=t[i];return e}var n=t("jszip/support"),h=t("jszip/compressions");e.string2binary=function(t){for(var e="",i=0;i<t.length;i++)e+=String.fromCharCode(255&t.charCodeAt(i));return e},e.string2Uint8Array=function(t){return e.transformTo("uint8array",t)},e.uint8Array2String=function(t){return e.transformTo("string",t)},e.string2Blob=function(t){var i=e.transformTo("arraybuffer",t);return e.arrayBuffer2Blob(i)},e.arrayBuffer2Blob=function(t){e.checkSupport("blob");try{return new Blob([t],{type:"application/zip"})}catch(i){try{var s=new(window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder);return s.append(t),s.getBlob("application/zip")}catch(i){throw new Error("Bug : can't construct the Blob.")}}};var o={};o.string={string:i,array:function(t){return s(t,new Array(t.length))},arraybuffer:function(t){return o.string.uint8array(t).buffer},uint8array:function(t){return s(t,new Uint8Array(t.length))},nodebuffer:function(t){return s(t,new Buffer(t.length))}},o.array={string:r,array:i,arraybuffer:function(t){return new Uint8Array(t).buffer},uint8array:function(t){return new Uint8Array(t)},nodebuffer:function(t){return new Buffer(t)}},o.arraybuffer={string:function(t){return r(new Uint8Array(t))},array:function(t){return a(new Uint8Array(t),new Array(t.byteLength))},arraybuffer:i,uint8array:function(t){return new Uint8Array(t)},nodebuffer:function(t){return new Buffer(new Uint8Array(t))}},o.uint8array={string:r,array:function(t){return a(t,new Array(t.length))},arraybuffer:function(t){return t.buffer},uint8array:i,nodebuffer:function(t){return new Buffer(t)}},o.nodebuffer={string:r,array:function(t){return a(t,new Array(t.length))},arraybuffer:function(t){return o.nodebuffer.uint8array(t).buffer},uint8array:function(t){return a(t,new Uint8Array(t.length))},nodebuffer:i},e.transformTo=function(t,i){if(i||(i=""),!t)return i;e.checkSupport(t);var s=e.getTypeOf(i),r=o[s][t](i);return r},e.getTypeOf=function(t){return"string"==typeof t?"string":t instanceof Array?"array":n.nodebuffer&&Buffer.isBuffer(t)?"nodebuffer":n.uint8array&&t instanceof Uint8Array?"uint8array":n.arraybuffer&&t instanceof ArrayBuffer?"arraybuffer":void 0},e.checkSupport=function(t){var e=n[t.toLowerCase()];if(!e)throw new Error(t+" is not supported by this browser")},e.MAX_VALUE_16BITS=65535,e.MAX_VALUE_32BITS=-1,e.pretty=function(t){var e,i,s="";for(i=0;i<(t||"").length;i++)e=t.charCodeAt(i),s+="\\x"+(16>e?"0":"")+e.toString(16).toUpperCase();return s},e.findCompression=function(t){for(var e in h)if(h.hasOwnProperty(e)&&h[e].magic===t)return h[e];return null}}),define("jszip/signature",[],function(){return{LOCAL_FILE_HEADER:"PK",CENTRAL_FILE_HEADER:"PK",CENTRAL_DIRECTORY_END:"PK",ZIP64_CENTRAL_DIRECTORY_LOCATOR:"PK",ZIP64_CENTRAL_DIRECTORY_END:"PK",DATA_DESCRIPTOR:"PK\b"}}),define("jszip/defaults",[],function(){return{base64:!1,binary:!1,dir:!1,date:null,compression:null}}),define("jszip/base64",[],function(){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";return{encode:function(e){for(var i,s,r,a,n,h,o,u="",l=0;l<e.length;)i=e.charCodeAt(l++),s=e.charCodeAt(l++),r=e.charCodeAt(l++),a=i>>2,n=(3&i)<<4|s>>4,h=(15&s)<<2|r>>6,o=63&r,isNaN(s)?h=o=64:isNaN(r)&&(o=64),u=u+t.charAt(a)+t.charAt(n)+t.charAt(h)+t.charAt(o);return u},decode:function(e){var i,s,r,a,n,h,o,u="",l=0;for(e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");l<e.length;)a=t.indexOf(e.charAt(l++)),n=t.indexOf(e.charAt(l++)),h=t.indexOf(e.charAt(l++)),o=t.indexOf(e.charAt(l++)),i=a<<2|n>>4,s=(15&n)<<4|h>>2,r=(3&h)<<6|o,u+=String.fromCharCode(i),64!=h&&(u+=String.fromCharCode(s)),64!=o&&(u+=String.fromCharCode(r));return u}}}),define("jszip/compressedObject",[],function(){return CompressedObject=function(){this.compressedSize=0,this.uncompressedSize=0,this.crc32=0,this.compressionMethod=null,this.compressedContent=null},CompressedObject.prototype={getContent:function(){return null},getCompressedContent:function(){return null}},CompressedObject}),define("jszip/object",["require","jszip/support","jszip/utils","jszip/signature","jszip/defaults","jszip/base64","jszip/compressions","jszip/compressedObject"],function(t){var e=t("jszip/support"),i=t("jszip/utils"),s=t("jszip/signature"),r=t("jszip/defaults"),a=t("jszip/base64"),n=t("jszip/compressions"),h=t("jszip/compressedObject"),o=function(t){if(t._data instanceof h&&(t._data=t._data.getContent(),t.options.binary=!0,t.options.base64=!1,"uint8array"===i.getTypeOf(t._data))){var e=t._data;t._data=new Uint8Array(e.length),0!==e.length&&t._data.set(e,0)}return t._data},u=function(t){var s=o(t),r=i.getTypeOf(s);if("string"===r){if(!t.options.binary){if(e.uint8array&&"function"==typeof TextEncoder)return TextEncoder("utf-8").encode(s);if(e.nodebuffer)return new Buffer(s,"utf-8")}return t.asBinary()}return s},l=function(t){var e=o(this);return null===e||"undefined"==typeof e?"":(this.options.base64&&(e=a.decode(e)),e=t&&this.options.binary?j.utf8decode(e):i.transformTo("string",e),t||this.options.binary||(e=j.utf8encode(e)),e)},f=function(t,e,i){this.name=t,this._data=e,this.options=i};f.prototype={asText:function(){return l.call(this,!0)},asBinary:function(){return l.call(this,!1)},asNodeBuffer:function(){var t=u(this);return i.transformTo("nodebuffer",t)},asUint8Array:function(){var t=u(this);return i.transformTo("uint8array",t)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var c=function(t,e){var i,s="";for(i=0;e>i;i++)s+=String.fromCharCode(255&t),t>>>=8;return s},p=function(){var t,e,i={};for(t=0;t<arguments.length;t++)for(e in arguments[t])arguments[t].hasOwnProperty(e)&&"undefined"==typeof i[e]&&(i[e]=arguments[t][e]);return i},d=function(t){return t=t||{},t.base64===!0&&null==t.binary&&(t.binary=!0),t=p(t,r),t.date=t.date||new Date,null!==t.compression&&(t.compression=t.compression.toUpperCase()),t},m=function(t,e,s){var r=y(t),a=i.getTypeOf(e);if(r&&M.call(this,r),s=d(s),s.dir||null===e||"undefined"==typeof e)s.base64=!1,s.binary=!1,e=null;
else if("string"===a)s.binary&&!s.base64&&s.optimizedBinaryString!==!0&&(e=i.string2binary(e));else{if(s.base64=!1,s.binary=!0,!(a||e instanceof h))throw new Error("The data of '"+t+"' is in an unsupported format !");"arraybuffer"===a&&(e=i.transformTo("uint8array",e))}return this.files[t]=new f(t,e,s)},y=function(t){"/"==t.slice(-1)&&(t=t.substring(0,t.length-1));var e=t.lastIndexOf("/");return e>0?t.substring(0,e):""},M=function(t){return"/"!=t.slice(-1)&&(t+="/"),this.files[t]||m.call(this,t,null,{dir:!0}),this.files[t]},g=function(t,e){var s,r=new h;return t._data instanceof h?(r.uncompressedSize=t._data.uncompressedSize,r.crc32=t._data.crc32,0===r.uncompressedSize||t.options.dir?(e=n.STORE,r.compressedContent="",r.crc32=0):t._data.compressionMethod===e.magic?r.compressedContent=t._data.getCompressedContent():(s=t._data.getContent(),r.compressedContent=e.compress(i.transformTo(e.compressInputType,s)))):(s=u(t),(!s||0===s.length||t.options.dir)&&(e=n.STORE,s=""),r.uncompressedSize=s.length,r.crc32=this.crc32(s),r.compressedContent=e.compress(i.transformTo(e.compressInputType,s))),r.compressedSize=r.compressedContent.length,r.compressionMethod=e.magic,r},_=function(t,e,i,r){var a,n,h=(i.compressedContent,this.utf8encode(e.name)),o=h!==e.name,u=e.options;a=u.date.getHours(),a<<=6,a|=u.date.getMinutes(),a<<=5,a|=u.date.getSeconds()/2,n=u.date.getFullYear()-1980,n<<=4,n|=u.date.getMonth()+1,n<<=5,n|=u.date.getDate();var l="";l+="\n\0",l+=o?"\0\b":"\0\0",l+=i.compressionMethod,l+=c(a,2),l+=c(n,2),l+=c(i.crc32,4),l+=c(i.compressedSize,4),l+=c(i.uncompressedSize,4),l+=c(h.length,2),l+="\0\0";var f=s.LOCAL_FILE_HEADER+l+h,p=s.CENTRAL_FILE_HEADER+"\0"+l+"\0\0"+"\0\0"+"\0\0"+(e.options.dir===!0?"\0\0\0":"\0\0\0\0")+c(r,4)+h;return{fileRecord:f,dirRecord:p,compressedObject:i}},b=function(){this.data=[]};b.prototype={append:function(t){t=i.transformTo("string",t),this.data.push(t)},finalize:function(){return this.data.join("")}};var v=function(t){this.data=new Uint8Array(t),this.index=0};v.prototype={append:function(t){0!==t.length&&(t=i.transformTo("uint8array",t),this.data.set(t,this.index),this.index+=t.length)},finalize:function(){return this.data}};var j={load:function(){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(t){var e,i,s,r,a=[];for(e in this.files)this.files.hasOwnProperty(e)&&(s=this.files[e],r=new f(s.name,s._data,p(s.options)),i=e.slice(this.root.length,e.length),e.slice(0,this.root.length)===this.root&&t(i,r)&&a.push(r));return a},file:function(t,e,i){if(1===arguments.length){if(t instanceof RegExp){var s=t;return this.filter(function(t,e){return!e.options.dir&&s.test(t)})}return this.filter(function(e,i){return!i.options.dir&&e===t})[0]||null}return t=this.root+t,m.call(this,t,e,i),this},folder:function(t){if(!t)return this;if(t instanceof RegExp)return this.filter(function(e,i){return i.options.dir&&t.test(e)});var e=this.root+t,i=M.call(this,e),s=this.clone();return s.root=i.name,s},remove:function(t){t=this.root+t;var e=this.files[t];if(e||("/"!=t.slice(-1)&&(t+="/"),e=this.files[t]),e)if(e.options.dir)for(var i=this.filter(function(e,i){return i.name.slice(0,t.length)===t}),s=0;s<i.length;s++)delete this.files[i[s].name];else delete this.files[t];return this},generate:function(t){t=p(t||{},{base64:!0,compression:"STORE",type:"base64"}),i.checkSupport(t.type);var e,r,h=[],o=0,u=0;for(var l in this.files)if(this.files.hasOwnProperty(l)){var f=this.files[l],d=f.options.compression||t.compression.toUpperCase(),m=n[d];if(!m)throw new Error(d+" is not a valid compression method !");var y=g.call(this,f,m),M=_.call(this,l,f,y,o);o+=M.fileRecord.length+y.compressedSize,u+=M.dirRecord.length,h.push(M)}var j="";switch(j=s.CENTRAL_DIRECTORY_END+"\0\0"+"\0\0"+c(h.length,2)+c(h.length,2)+c(u,4)+c(o,4)+"\0\0",t.type.toLowerCase()){case"uint8array":case"arraybuffer":case"blob":case"nodebuffer":e=new v(o+u+j.length);break;case"base64":default:e=new b(o+u+j.length)}for(r=0;r<h.length;r++)e.append(h[r].fileRecord),e.append(h[r].compressedObject.compressedContent);for(r=0;r<h.length;r++)e.append(h[r].dirRecord);e.append(j);var x=e.finalize();switch(t.type.toLowerCase()){case"uint8array":case"arraybuffer":case"nodebuffer":return i.transformTo(t.type.toLowerCase(),x);case"blob":return i.arrayBuffer2Blob(i.transformTo("arraybuffer",x));case"base64":return t.base64?a.encode(x):x;default:return x}},crc32:function(t,e){if("undefined"==typeof t||!t.length)return 0;var s="string"!==i.getTypeOf(t),r=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];"undefined"==typeof e&&(e=0);var a=0,n=0,h=0;e=-1^e;for(var o=0,u=t.length;u>o;o++)h=s?t[o]:t.charCodeAt(o),n=255&(e^h),a=r[n],e=e>>>8^a;return-1^e},utf8encode:function(t){if(e.uint8array&&"function"==typeof TextEncoder){var s=TextEncoder("utf-8").encode(t);return i.transformTo("string",s)}if(e.nodebuffer)return i.transformTo("string",new Buffer(t,"utf-8"));for(var r=[],a=0,n=0;n<t.length;n++){var h=t.charCodeAt(n);128>h?r[a++]=String.fromCharCode(h):h>127&&2048>h?(r[a++]=String.fromCharCode(192|h>>6),r[a++]=String.fromCharCode(128|63&h)):(r[a++]=String.fromCharCode(224|h>>12),r[a++]=String.fromCharCode(128|63&h>>6),r[a++]=String.fromCharCode(128|63&h))}return r.join("")},utf8decode:function(t){var s=[],r=0,a=i.getTypeOf(t),n="string"!==a,h=0,o=0,u=0,l=0;if(e.uint8array&&"function"==typeof TextDecoder)return TextDecoder("utf-8").decode(i.transformTo("uint8array",t));if(e.nodebuffer)return i.transformTo("nodebuffer",t).toString("utf-8");for(;h<t.length;)o=n?t[h]:t.charCodeAt(h),128>o?(s[r++]=String.fromCharCode(o),h++):o>191&&224>o?(u=n?t[h+1]:t.charCodeAt(h+1),s[r++]=String.fromCharCode((31&o)<<6|63&u),h+=2):(u=n?t[h+1]:t.charCodeAt(h+1),l=n?t[h+2]:t.charCodeAt(h+2),s[r++]=String.fromCharCode((15&o)<<12|(63&u)<<6|63&l),h+=3);return s.join("")}};return j}),define("jszip/dataReader",["require","jszip/utils"],function(t){function e(){this.data=null,this.length=0,this.index=0}var i=t("jszip/utils");return e.prototype={checkOffset:function(t){this.checkIndex(this.index+t)},checkIndex:function(t){if(this.length<t||0>t)throw new Error("End of data reached (data length = "+this.length+", asked index = "+t+"). Corrupted zip ?")},setIndex:function(t){this.checkIndex(t),this.index=t},skip:function(t){this.setIndex(this.index+t)},byteAt:function(){},readInt:function(t){var e,i=0;for(this.checkOffset(t),e=this.index+t-1;e>=this.index;e--)i=(i<<8)+this.byteAt(e);return this.index+=t,i},readString:function(t){return i.transformTo("string",this.readData(t))},readData:function(){},lastIndexOfSignature:function(){},readDate:function(){var t=this.readInt(4);return new Date((127&t>>25)+1980,(15&t>>21)-1,31&t>>16,31&t>>11,63&t>>5,(31&t)<<1)}},e}),define("jszip/stringReader",["require","jszip/dataReader","jszip/utils"],function(t){function e(t,e){this.data=t,e||(this.data=s.string2binary(this.data)),this.length=this.data.length,this.index=0}var i=t("jszip/dataReader"),s=t("jszip/utils");return e.prototype=new i,e.prototype.byteAt=function(t){return this.data.charCodeAt(t)},e.prototype.lastIndexOfSignature=function(t){return this.data.lastIndexOf(t)},e.prototype.readData=function(t){this.checkOffset(t);var e=this.data.slice(this.index,this.index+t);return this.index+=t,e},e}),define("jszip/uint8ArrayReader",["require","jszip/dataReader"],function(t){function e(t){t&&(this.data=t,this.length=this.data.length,this.index=0)}var i=t("jszip/dataReader");return e.prototype=new i,e.prototype.byteAt=function(t){return this.data[t]},e.prototype.lastIndexOfSignature=function(t){for(var e=t.charCodeAt(0),i=t.charCodeAt(1),s=t.charCodeAt(2),r=t.charCodeAt(3),a=this.length-4;a>=0;--a)if(this.data[a]===e&&this.data[a+1]===i&&this.data[a+2]===s&&this.data[a+3]===r)return a;return-1},e.prototype.readData=function(t){this.checkOffset(t);var e=this.data.subarray(this.index,this.index+t);return this.index+=t,e},e}),define("jszip/nodeBufferReader",["require","jszip/uint8ArrayReader"],function(t){function e(t){this.data=t,this.length=this.data.length,this.index=0}var i=t("jszip/uint8ArrayReader");return e.prototype=new i,e.prototype.readData=function(t){this.checkOffset(t);var e=this.data.slice(this.index,this.index+t);return this.index+=t,e},e}),define("jszip/zipEntry",["require","jszip/stringReader","jszip/utils","jszip/compressedObject","jszip/object"],function(t){function e(t,e){this.options=t,this.loadOptions=e}var i=t("jszip/stringReader"),s=t("jszip/utils"),r=t("jszip/compressedObject"),a=t("jszip/object");return e.prototype={isEncrypted:function(){return 1===(1&this.bitFlag)},useUTF8:function(){return 2048===(2048&this.bitFlag)},prepareCompressedContent:function(t,e,i){return function(){var s=t.index;t.setIndex(e);var r=t.readData(i);return t.setIndex(s),r}},prepareContent:function(t,e,i,r,a){return function(){var t=s.transformTo(r.uncompressInputType,this.getCompressedContent()),e=r.uncompress(t);if(e.length!==a)throw new Error("Bug : uncompressed data size mismatch");return e}},readLocalPart:function(t){var e,i;if(t.skip(22),this.fileNameLength=t.readInt(2),i=t.readInt(2),this.fileName=t.readString(this.fileNameLength),t.skip(i),-1==this.compressedSize||-1==this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)");if(e=s.findCompression(this.compressionMethod),null===e)throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")");if(this.decompressed=new r,this.decompressed.compressedSize=this.compressedSize,this.decompressed.uncompressedSize=this.uncompressedSize,this.decompressed.crc32=this.crc32,this.decompressed.compressionMethod=this.compressionMethod,this.decompressed.getCompressedContent=this.prepareCompressedContent(t,t.index,this.compressedSize,e),this.decompressed.getContent=this.prepareContent(t,t.index,this.compressedSize,e,this.uncompressedSize),this.loadOptions.checkCRC32&&(this.decompressed=s.transformTo("string",this.decompressed.getContent()),a.crc32(this.decompressed)!==this.crc32))throw new Error("Corrupted zip : CRC32 mismatch")},readCentralPart:function(t){if(this.versionMadeBy=t.readString(2),this.versionNeeded=t.readInt(2),this.bitFlag=t.readInt(2),this.compressionMethod=t.readString(2),this.date=t.readDate(),this.crc32=t.readInt(4),this.compressedSize=t.readInt(4),this.uncompressedSize=t.readInt(4),this.fileNameLength=t.readInt(2),this.extraFieldsLength=t.readInt(2),this.fileCommentLength=t.readInt(2),this.diskNumberStart=t.readInt(2),this.internalFileAttributes=t.readInt(2),this.externalFileAttributes=t.readInt(4),this.localHeaderOffset=t.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");this.fileName=t.readString(this.fileNameLength),this.readExtraFields(t),this.parseZIP64ExtraField(t),this.fileComment=t.readString(this.fileCommentLength),this.dir=16&this.externalFileAttributes?!0:!1},parseZIP64ExtraField:function(){if(this.extraFields[1]){var t=new i(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=t.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=t.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=t.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=t.readInt(4))}},readExtraFields:function(t){var e,i,s,r=t.index;for(this.extraFields=this.extraFields||{};t.index<r+this.extraFieldsLength;)e=t.readInt(2),i=t.readInt(2),s=t.readString(i),this.extraFields[e]={id:e,length:i,value:s}},handleUTF8:function(){this.useUTF8()&&(this.fileName=a.utf8decode(this.fileName),this.fileComment=a.utf8decode(this.fileComment))}},e}),define("jszip/zipEntries",["require","jszip/stringReader","jszip/nodeBufferReader","jszip/uint8ArrayReader","jszip/utils","jszip/signature","jszip/zipEntry","jszip/support"],function(t){function e(t,e){this.files=[],this.loadOptions=e,t&&this.load(t)}var i=t("jszip/stringReader"),s=t("jszip/nodeBufferReader"),r=t("jszip/uint8ArrayReader"),a=t("jszip/utils"),n=t("jszip/signature"),h=t("jszip/zipEntry"),o=t("jszip/support");return e.prototype={checkSignature:function(t){var e=this.reader.readString(4);if(e!==t)throw new Error("Corrupted zip or bug : unexpected signature ("+a.pretty(e)+", expected "+a.pretty(t)+")")},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2),this.zipComment=this.reader.readString(this.zipCommentLength)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.versionMadeBy=this.reader.readString(2),this.versionNeeded=this.reader.readInt(2),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var t,e,i,s=this.zip64EndOfCentralSize-44,r=0;s>r;)t=this.reader.readInt(2),e=this.reader.readInt(4),i=this.reader.readString(e),this.zip64ExtensibleData[t]={id:t,length:e,value:i}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),this.disksCount>1)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var t,e;for(t=0;t<this.files.length;t++)e=this.files[t],this.reader.setIndex(e.localHeaderOffset),this.checkSignature(n.LOCAL_FILE_HEADER),e.readLocalPart(this.reader),e.handleUTF8()},readCentralDir:function(){var t;for(this.reader.setIndex(this.centralDirOffset);this.reader.readString(4)===n.CENTRAL_FILE_HEADER;)t=new h({zip64:this.zip64},this.loadOptions),t.readCentralPart(this.reader),this.files.push(t)},readEndOfCentral:function(){var t=this.reader.lastIndexOfSignature(n.CENTRAL_DIRECTORY_END);if(-1===t)throw new Error("Corrupted zip : can't find end of central directory");if(this.reader.setIndex(t),this.checkSignature(n.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===a.MAX_VALUE_16BITS||this.diskWithCentralDirStart===a.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===a.MAX_VALUE_16BITS||this.centralDirRecords===a.MAX_VALUE_16BITS||this.centralDirSize===a.MAX_VALUE_32BITS||this.centralDirOffset===a.MAX_VALUE_32BITS){if(this.zip64=!0,t=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR),-1===t)throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");this.reader.setIndex(t),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}},prepareReader:function(t){var e=a.getTypeOf(t);this.reader="string"!==e||o.uint8array?"nodebuffer"===e?new s(t):new r(a.transformTo("uint8array",t)):new i(t,this.loadOptions.optimizedBinaryString)},load:function(t){this.prepareReader(t),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},e}),define("jszip/load",["require","jszip/base64","jszip/zipEntries"],function(t){var e=t("jszip/base64"),i=t("jszip/zipEntries");return function(t,s){var r,a,n,h;for(s=s||{},s.base64&&(t=e.decode(t)),a=new i(t,s),r=a.files,n=0;n<r.length;n++)h=r[n],this.file(h.fileName,h.decompressed,{binary:!0,optimizedBinaryString:!0,date:h.date,dir:h.dir});return this}}),define("jszip",["require","jszip/object","jszip/load","jszip/support","jszip/utils","jszip/base64","jszip/compressions"],function(t){var e=function(t,e){this.files={},this.root="",t&&this.load(t,e)};return e.prototype=t("jszip/object"),e.prototype.clone=function(){var t=new e;for(var i in this)"function"!=typeof this[i]&&(t[i]=this[i]);return t},e.prototype.load=t("jszip/load"),e.support=t("jszip/support"),e.utils=t("jszip/utils"),e.base64=t("jszip/base64"),e.compressions=t("jszip/compressions"),e}),define("shp/unzip",["jszip"],function(t){return function(e){var i=new t(e),s=i.file(/.+/),r={};return s.forEach(function(t){r[t.name]="geojson"===t.name.slice(-7).toLowerCase()?t.asText():t.asArrayBuffer()}),r}}),function(global,undefined){function canUseNextTick(){return"object"==typeof process&&"[object process]"===Object.prototype.toString.call(process)}function canUseMessageChannel(){return!!global.MessageChannel}function canUsePostMessage(){if(!global.postMessage||global.importScripts)return!1;var t=!0,e=global.onmessage;return global.onmessage=function(){t=!1},global.postMessage("","*"),global.onmessage=e,t}function canUseReadyStateChange(){return"document"in global&&"onreadystatechange"in global.document.createElement("script")}function installNextTickImplementation(t){t.setImmediate=function(){var t=tasks.addFromSetImmediateArguments(arguments);return process.nextTick(function(){tasks.runIfPresent(t)}),t}}function installMessageChannelImplementation(t){var e=new global.MessageChannel;e.port1.onmessage=function(t){var e=t.data;tasks.runIfPresent(e)},t.setImmediate=function(){var t=tasks.addFromSetImmediateArguments(arguments);return e.port2.postMessage(t),t}}function installPostMessageImplementation(t){function e(t,e){return"string"==typeof t&&t.substring(0,e.length)===e}function i(t){if(t.source===global&&e(t.data,s)){var i=t.data.substring(s.length);tasks.runIfPresent(i)}}var s="com.bn.NobleJS.setImmediate"+Math.random();global.addEventListener?global.addEventListener("message",i,!1):global.attachEvent("onmessage",i),t.setImmediate=function(){var t=tasks.addFromSetImmediateArguments(arguments);return global.postMessage(s+t,"*"),t}}function installReadyStateChangeImplementation(t){t.setImmediate=function(){var t=tasks.addFromSetImmediateArguments(arguments),e=global.document.createElement("script");return e.onreadystatechange=function(){tasks.runIfPresent(t),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},global.document.documentElement.appendChild(e),t}}function installSetTimeoutImplementation(t){t.setImmediate=function(){var t=tasks.addFromSetImmediateArguments(arguments);return global.setTimeout(function(){tasks.runIfPresent(t)},0),t}}var tasks=function(){function Task(t,e){this.handler=t,this.args=e}Task.prototype.run=function(){if("function"==typeof this.handler)this.handler.apply(undefined,this.args);else{var scriptSource=""+this.handler;eval(scriptSource)}};var nextHandle=1,tasksByHandle={},currentlyRunningATask=!1;return{addFromSetImmediateArguments:function(t){var e=t[0],i=Array.prototype.slice.call(t,1),s=new Task(e,i),r=nextHandle++;return tasksByHandle[r]=s,r},runIfPresent:function(t){if(currentlyRunningATask)global.setTimeout(function(){tasks.runIfPresent(t)},0);else{var e=tasksByHandle[t];if(e){currentlyRunningATask=!0;try{e.run()}finally{delete tasksByHandle[t],currentlyRunningATask=!1}}}},remove:function(t){delete tasksByHandle[t]}}}();if(!global.setImmediate){var attachTo="function"==typeof Object.getPrototypeOf&&"setTimeout"in Object.getPrototypeOf(global)?Object.getPrototypeOf(global):global;canUseNextTick()?installNextTickImplementation(attachTo):canUsePostMessage()?installPostMessageImplementation(attachTo):canUseMessageChannel()?installMessageChannelImplementation(attachTo):canUseReadyStateChange()?installReadyStateChangeImplementation(attachTo):installSetTimeoutImplementation(attachTo),attachTo.clearImmediate=tasks.remove}}("object"==typeof global&&global?global:this),define("shp/lie",[],function(){function t(){function t(){this.then=function(t,e){return a(t,e)}}var a=function(t,h,o){var u;if(t!==a)return u=e(),a.queue.push({deferred:u,resolve:t,reject:h}),u.promise;for(var l,f,c,p=h?"resolve":"reject",d=0,m=a.queue.length;m>d;d++)l=a.queue[d],f=l.deferred,c=l[p],typeof c!==r?f[p](o):s(c,o,f);a=i(n,o,h)},n=new t;this.promise=n,a.queue=[],this.resolve=function(t){a.queue&&a(a,!0,t)},this.fulfill=this.resolve,this.reject=function(t){a.queue&&a(a,!1,t)}}function e(){return new t}function i(t,i,a){return function(n,h){var o,u=a?n:h;return typeof u!==r?t:(s(u,i,o=e()),o.promise)}}function s(t,e,i){setImmediate(function(){var s;try{s=t(e),s&&typeof s.then===r?s.then(i.resolve,i.reject):i.resolve(s)}catch(a){i.reject(a)}})}var r="function";return e.resolve=function(t){var e={};return e.then=i(e,t,!0),e},e.reject=function(t){var e={};return e.then=i(e,t,!1),e},e.all=function(t){var i=e(),s=t.length,r=0,a=[],n=function(t){return function(e){a[t]=e,r++,r===s&&i.resolve(a)}};return t.forEach(function(t,e){t.then(n(e),function(t){i.reject(t)})}),i.promise},e}),define("shp/binaryajax",["./lie"],function(t){return function(e){var i=t(),s=e.slice(-3),r=new XMLHttpRequest;return r.open("GET",e,!0),"prj"!==s&&(r.responseType="arraybuffer"),r.addEventListener("load",function(){return r.status>399?"prj"===s?i.resolve(!1):i.reject(r.status):(i.resolve(r.response),void 0)},!1),r.send(),i.promise}}),define("shp/parseShp",[],function(){function t(t){for(var e,i,s=0,r=1,a=t.length;a>r;)e=i||t[0],i=t[r],s+=(i[0]-e[0])*(i[1]+e[1]),r++;return s>0}function e(e,i){return t(i)||!e.length?e.push([i]):e[e.length-1].push(i),e}function i(t,e){return{type:"Point",coordinates:e(t,0)}}function s(t,e){var s=i(t,e);return s.coordinates.push(e(t,16)),s}function r(t,e,i,s){for(var r=[],a=0;i>a;)r.push(s(t,e)),e+=16,a++;return r}function a(t,e,i,s){for(var r=0;i>r;)s[r].push(t.getFloat64(e,!0)),r++,e+=8;return s}function n(t,e,i,s,a,n){for(var h,o,u=[],l=0,f=0;s>l;)l++,i+=4,h=f,f=l===s?a:t.getInt32(i,!0),o=f-h,o&&(u.push(r(t,e,o,n)),e+=o<<4);return u}function h(t,e,i,s){for(var r=0;i>r;)s[r]=a(t,e,s[r].length,s[r]),e+=s[r].length<<3,r++;return s}function o(t,e){var i={};i.bbox=[t.getFloat64(0,!0),t.getFloat64(8,!0),t.getFloat64(16,!0),t.getFloat64(24,!0)];var s=t.getInt32(32,!0),a=36;return 1===s?(i.type="Point",i.coordinates=e(t,a)):(i.type="MultiPoint",i.coordinates=r(t,a,s,e)),i}function u(t,e){var i,s=o(t,e);if("Point"===s.type)return s.coordinates.push(t.getFloat64(72,!0)),s;i=s.coordinates.length;var r=56+(i<<4);return s.coordinates=a(t,r,i,s.coordinates),s}function l(t,e){var i={};i.bbox=[t.getFloat64(0,!0),t.getFloat64(8,!0),t.getFloat64(16,!0),t.getFloat64(24,!0)];var s,a,h=t.getInt32(32,!0),o=t.getInt32(36,!0);return 1===h?(i.type="LineString",s=44,i.coordinates=r(t,s,o,e)):(i.type="MultiLineString",s=40+(h<<2),a=40,i.coordinates=n(t,s,a,h,o,e)),i}function f(t,e){var i=l(t,e),s=i.coordinates.length,r=60+(s<<4);return"LineString"===i.type?(i.coordinates=a(t,r,s,i.coordinates),i):(i.coordinates=h(t,r,s,i.coordinates),i)}function c(t){return"LineString"===t.type?(t.type="Polygon",t.coordinates=[t.coordinates],t):(t.coordinates=t.coordinates.reduce(e,[]),1===t.coordinates.length?(t.type="Polygon",t.coordinates=t.coordinates[0],t):(t.type="MultiPolygon",t))}function p(t,e){return c(l(t,e))}function d(t,e){return c(f(t,e))}function m(t,e){if(t>20&&(t-=20),!(t in g))return console.log("I don't know that shp type"),function(){return function(){}};var i=g[t],s=y(e);return function(t){return i(t,s)}}function y(t){return t?function(e,i){return t.inverse([e.getFloat64(i,!0),e.getFloat64(i+8,!0)])}:function(t,e){return[t.getFloat64(e,!0),t.getFloat64(e+8,!0)]}}var M=function(t){var e=new DataView(t,0,100);return{length:e.getInt32(24,!1),version:e.getInt32(28,!0),shpCode:e.getInt32(32,!0),bbox:[e.getFloat64(36,!0),e.getFloat64(44,!0),e.getFloat64(52,!0),e.getFloat64(52,!0)]}},g={1:i,3:l,5:p,8:o,11:s,13:f,15:d,18:u},_=function(t,e){var i=new DataView(t,e,12),s=i.getInt32(4,!1)<<1,r=new DataView(t,e+12,s-4);return{id:i.getInt32(0,!1),len:s,data:r,type:i.getInt32(8,!0)}},b=function(t,e){for(var i,s=100,r=t.byteLength,a=[];r>s;)i=_(t,s),s+=8,s+=i.len,i.type&&a.push(e(i.data));return a};return function(t,e){var i=M(t);return b(t,m(i.shpCode,e))}}),define("shp/parseDbf",[],function(){function t(t){var e=new DataView(t),i={};return i.lastUpdated=new Date(e.getUint8(1,!0)+1900,e.getUint8(2,!0),e.getUint8(3,!0)),i.records=e.getUint32(4,!0),i.headerLen=e.getUint16(8,!0),i.recLen=e.getUint16(10,!0),i}function e(t){for(var e=new DataView(t),i=[],s=32;;){if(i.push({name:String.fromCharCode.apply(this,new Uint8Array(t,s,10)).replace(/\0|\s+$/g,""),dataType:String.fromCharCode(e.getUint8(s+11)),len:e.getUint8(s+16),decimal:e.getUint8(s+17)}),13===e.getUint8(s+32))break;s+=32}return i}function i(t,e,i){for(var r,a,n={},h=0,o=i.length;o>h;)a=i[h],r=s(t,e,a.len,a.dataType),e+=a.len,"undefined"!=typeof r&&(n[a.name]=r),h++;return n}var s=function(t,e,i,s){var r=new Uint8Array(t,e,i),a=String.fromCharCode.apply(this,r).replace(/\0|\s+$/g,"");return"N"===s?parseFloat(a,10):"D"===s?new Date(a.slice(0,4),parseInt(a.slice(4,6),10)-1,a.slice(6,8)):a};return function(s){var r=e(s),a=t(s),n=(r.length+1<<5)+2,h=a.recLen,o=a.records;new DataView(s);for(var u=[];o;)u.push(i(s,n,r)),n+=h,o--;return u}}),define("shp",["require","proj4","shp/unzip","shp/binaryajax","shp/parseShp","shp/parseDbf","shp/lie"],function(t){function e(t){return a(t)}function i(t){var e={};e.type="FeatureCollection",e.features=[];for(var i=0,s=t[0].length;s>i;)e.features.push({type:"Feature",geometry:t[0][i],properties:t[1][i]}),i++;return e}function s(t){var e,s=h(t),r=[];for(e in s)"shp"===e.slice(-3).toLowerCase()?r.push(e.slice(0,-4)):"dbf"===e.slice(-3).toLowerCase()?s[e]=l(s[e]):"prj"===e.slice(-3).toLowerCase()?s[e]=n(String.fromCharCode.apply(null,new Uint8Array(s[e]))):"geojson"===e.slice(-7).toLowerCase()&&r.push(e);var a=r.map(function(t){var e;return"geojson"===t.slice(-7).toLowerCase()?(e=JSON.parse(s[t]),e.fileName=t.slice(0,-8)):(e=i([u(s[t+".shp"],s[t+".prj"]),s[t+".dbf"]]),e.fileName=t),e});return 1===a.length?a[0]:a}function r(t){return o(t).then(s)}function a(t){return"string"==typeof t?".zip"===t.slice(-4)?r(t):f.all([f.all([o(t+".shp"),o(t+".prj")]).then(function(t){return u(t[0],t[1]?n(t[1]):!1)}),o(t+".dbf").then(l)]).then(i):f.resolve(s(t))}var n=t("proj4"),h=t("shp/unzip"),o=t("shp/binaryajax"),u=t("shp/parseShp"),l=t("shp/parseDbf"),f=t("shp/lie");return e.unzip=h,e.parseShp=u,e.binaryAjax=o,e}),require("shp")});
( function( window, undefined ) {
	'use strict';
    var $ = jQuery;
  
    // Maps
    $( '.neighborhood-map' ).each( function() {
    
    /*
var m = L.map( $(this).attr('ID') ).setView([ $(this).data( 'leaflet-lat' ), $(this).data( 'leaflet-lng' ) ], $(this).data( 'leaflet-zoom_level' ) );
        var watercolor = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',{attribution:'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(m);    
      
*/
      var map = L.map( $(this).attr('ID') ).setView([ $(this).data( 'leaflet-lat' ), $(this).data( 'leaflet-lng' )], $(this).data( 'leaflet-zoom_level' ) );
      
      
      
        var tiles = new L.StamenTileLayer( 'terrain' );
        
        map.addLayer( tiles );
/*
    	  var shpfile = new L.Shapefile('congress.zip');
         shpfile.addTo(m);
         shpfile.once("load", function(){
          console.log("finished loaded shapefile");
         });
      */
      
      
      
      
  
    });
    
    // Lazy Loading
    
    $( '.delayed' ).each( function( ) {
      
      //console.log( $(this).data( 'delayed-background-image' ) );
      
      $(this).css( 'background-image', 'url(' + $(this).data( 'delayed-background-image' ) + ')' );
    });
    
    
    // Gallery
    $( '.gallery' ).slick({
      'autoplay' : false,
      'autoplaySpeed' : 3000,
      'arrows' : true,
      'dots' : false,
      'draggable' : false,
      'infinite' : true,
      'slide' : 'figure'
    });
    
    // FitVids
    $('.article-content').fitVids();
  

 } )( this );