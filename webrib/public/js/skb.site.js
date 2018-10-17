/*! // 바이널 UI 라이브러리
* 1. 사이트 설정
* 2. 사이트 전반에 대한 기본처리
**/
vcui.require.config({
    paths: {
        'jquery.transit': 'libs/jquery.transit'
    },
    waitSeconds: 15,
    onNodeCreated: function (node) {
        node.charset = 'euc-kr';
    }
});
// 180305 language 수정 
var pathname = location.pathname;
if (pathname.indexOf('/html/') === 0) {

    if (pathname.indexOf('/html/corp/CJ') !== 0 && pathname.indexOf('/html/corp/CC') !== 0 && pathname.indexOf('/html/corp/CE') !== 0) {
        $.ajaxSetup({
            contentType: 'application/x-www-form-urlencoded;charset=euc-kr',
            beforeSend: function (xhr) {
                xhr.overrideMimeType('application/x-www-form-urlencoded;charset=euc-kr');
            }
        });
    }

}
// 180305 language 수정 end

$.holdReady(true); // ready 실행을 잠시 멈춘다.
var skbSite = {
    isLocal: window.location.hostname === 'localhost',
    isDev: window.location.hostname.indexOf('jsdebug=true') > -1,
    naverMapsAPIKey: 'Hj0uzRB2siuMlXbxLp0y', // TODO : 개발용 API KEY입니다. V9ZGWTni4Kgn1FNrgq0I
    isPreventedScroll: false,
    isInFrame: (function () { // iframe 내부인지 체크
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    })(),

    // 사이트 기본작업들 처리
    init: function () {
        // set 'naver map api key'
        vcui.Env.set('naverMapApiKey', this.naverMapsAPIKey);

        if (this.isInFrame) {
            $('html').addClass('frame');
        }

        this._overridejQueryVal()
        this._preloadComponents();
        this._buildYoutubeModal();
        this._buildPopup();
        this._buildClipboard();
        this._buildGoTop();
        this._buildRelatedProducts();
        this._buildSkipNav();
        this.header.init();
        this.footer.init();
        this.playGif();
    },

    /**
     * textarea에서 placeholder의 줄바꿈처리 때문에 value속성에 넣고 있는데(브라우저에서 다중라인 placeholder 지원이 미비해서...)
     * 진짜 value 값을 제대로 뽑아낼 수 있도록 .val()을 제정의해준다.
     * @private
     */
    _overridejQueryVal: function () {
        var oldVal = $.fn.val;
        $.fn.val = function () {
            if (arguments.length === 0 && this.data('ui_textControl')) {
                return this.vcTextControl('value');
            }
            return oldVal.apply(this, [].slice.call(arguments));
        };
    },

    // 주요 컴포넌트를 미리 로드
    _preloadComponents: function () {
        vcui.require([
            'ui/selectbox',
            'ui/calendar',
            'ui/scrollview',
            'ui/smoothScroll',
            'ui/accordion',
            'ui/modal',
            'ui/carousel',
            'ui/spyScroll',
            'ui/tab',
            'ui/poptip',
            'ui/checkboxAllChecker'
        ], function () {
            var $doc = $(document);

            // 모달 기초작업 //////////////////////////////////////////////////////
            // 모달 기본옵션 설정: 모달이 들때 아무런 모션도 없도록 한다.(기본은 fade)
            vcui.ui.setDefaults('Modal', {
                effect: 'fade',         // 모달이 뜰 때 사용할 효과
                draggable: false,       // 모달을 드래그 할 수 있게 허용할 것인가..no
                closeByEscape: false,   // esc키 누를 때 닫히게 할 것인가
                closeByDimmed: false,   // dim 클릭시 닫히게 할 것인가
                events: {
                    modalshown: function (e) {
                        // 모달이 뜨면 내부 컨텐츠 영역이 포커싱되도록 tabindex를 설정
                        this.$('.pop_contents').attr('tabindex', 0);
                    }
                }
            });

            // 아코디언의 기본설정을 멀티오픈으로 설정해놓는다,
            vcui.ui.setDefaults('Accordion', {
                singleOpen: false,
                events: {
                    accordionexpand: function (e, data) {
                        data.content.attr('tabindex', '0');
                    }
                }
            });

            // banner: 현재 활성화된 배너가 밝은 색이면 부모요소에 white클래스 추가
            vcui.ui.setDefaults('Carousel', {
                activeHover: true,
                speed: 500,
                events: {
                    carouselinit: function (e, carousel) {
                        var $slide = carousel.$slides.eq(0);

                        carousel.$slider.parent().toggleClass('white', $slide.hasClass('white_slider'));
                    },
                    carouselafterchange: function (e, carousel, index, nextIndex) {
                        var $slide = carousel.$slides.eq(index);

                        carousel.$slider.parent().toggleClass('white', $slide.hasClass('white_slider'));
                    },
                    carouselactive: function (e, carousel, index) {
                        // 포커스가 들어오거나 마우스가 오버됐을 때 좌우버튼이 보이도록 on클래스 추가
                        $(e.target).parent().addClass('on');
                    },
                    carouseldeactive: function (e, carousel, index) {
                        // 포커스가 나가거나 마우스가 아웃됐을 때 좌우버튼이 안 보이도록 on클래스 제거
                        $(e.target).parent().removeClass('on');
                    }
                }
            });

            // SmoothScroll의 세로스크롤 off
            vcui.ui.setDefaults('SmoothScroll', {
                scrollY: false
            });

            // 스파이스크롤 fixed 기능 off
            vcui.ui.setDefaults('SpyScroll', {
                enabledFixed: false
            });

            // 공통 UI 빌드
            $('body').buildCommonUI();

            // Carousel 빌드 //////////////////////////////////////////////////////
            $('.ui_carousel').vcCarousel();
            ///////////////////////////////////////////////////////////////////////

            // poptip 빌드 ////////////////////////////////////////////////////////
            $(document).vcPoptip();
            //////////////////////////////////////////////////////////////////////

            $.holdReady(false); // ready함수 실행을 허용(이전에 등록된건 실행해준다.)

            // 모달이 열렸을 때 페이지 스크롤을 막기 위함 ////////////////////////////
            $doc.on('modalfirstopen modallastclose', function (e) {
                skbSite.preventPageScroll(e.type === 'modalfirstopen');
                $('#wrap').aria('hidden', e.type === 'modalfirstopen' ? 'true' : 'false');
            }).on('modalshown', function (e) {
                // 모달이 뜰때 모달내부에 있는 공통 컴포넌트 빌드
                $(e.target).buildCommonUI();
            });
            //////////////////////////////////////////////////////////////////////

            // 아코디온이 펼쳐지거나 닫힐 때 레이아웃 사이즈가 변하기 때문에 resize이벤트를 강제로 발생시킨다.
            $doc.on('accordionexpand accordioncollapse', vcui.delayRun(function (e) {
                $(window).triggerHandler('resize');
            }, 200));
            ///////////////////////////////////////////////////////////////////////

        });
    },

    /**
     * data-popup="width, height" 속성이 있는 링크를 클릭시 팝업으로 띄움
     * @private
     */
    _buildPopup: function () {
        /*
        width : 팝업창 가로길이
        height : 팝업창 세로길이
        toolbar=no : 단축도구창(툴바) 표시안함
        menubar=no : 메뉴창(메뉴바) 표시안함
        location=no : 주소창 표시안함
        scrollbars=no : 스크롤바 표시안함
        status=no : 아래 상태바창 표시안함
        resizable=no : 창변형 하지않음
        fullscreen=no : 전체화면 하지않음
        channelmode=yes : F11 키 기능이랑 같음
        left=0 : 왼쪽에 창을 고정(ex. left=30 이런식으로 조절)
        top=0 : 위쪽에 창을 고정(ex. top=100 이런식으로 조절)

        ex) <a href="popup.html" data-popup="300, 400, name=agreement, scrollbars=no, left=50, top=50">popup</a>
        ex) <button type="button" data-href="popup.html" data-popup="300, 400, name=agreement, scrollbars=no, left=50, top=50">popup</button>
         */
        $(document).on('click.popup', '[data-popup]', function (e) {
            e.preventDefault();

            var popup = $(this).attr('data-popup') || '300, 400';
            var features = {}, newFeatures = '', name = '', pos;
            var href = $(this).attr('href') || $(this).attr('data-href');

            vcui.each(popup.replace(/\s+/g, '').split(','), function (value, idx) {
                if (idx === 0 && !isNaN(value)) {
                    features.width = value;
                } else if (idx === 1 && !isNaN(value)) {
                    features.height = value;
                } else {
                    var pairs = value.split('=');
                    features[pairs[0]] = pairs[1];
                }
            });

            if (!('scrollbars' in features)) {
                features.scrollbars = 'yes';
            }

            if (!('menubar' in features)) {
                features.menubar = 'no';
            }

            name = features.name || 'popup_' + vcui.getUniqId();

            delete features.align;
            delete features.name;

            vcui.each(features, function (value, key) {
                newFeatures += key + '=' + value + ','
            });

            window.open(href, name, newFeatures);
        });
    },

    /**
     * go top
     * @private
     */
    _buildGoTop: function () {
        var $main = $('#wrap.main');
        var $btnTop = $('.top_btn_wrap');
        var isShown = false;
        var isUp = false;
        var isOverlap;

        if (!$main.length) {
            $btnTop.css('bottom', 13);
            $(window).on('scroll resize', function () {
                var b = vcui.dom.getScrollTop() > 0;

                if (!b && isShown) {
                    $btnTop.hide();
                } else if (b && !isShown) {
                    $btnTop.show();
                }

                if (isShown = b) {
                    isOverlap = window.innerWidth / 2 + 575 > window.innerWidth - 180;
                    if (isOverlap && !isUp) {
                        isUp = true;
                        $btnTop.css('bottom', 90);
                    } else if (!isOverlap && isUp) {
                        isUp = false;
                        $btnTop.css('bottom', 13);
                    }
                }
            });
        }

        $btnTop.on('click', function (e) {
            e.preventDefault();
            $('html, body').stop().animate({
                scrollTop: 0
            }, 200, 'swing', function () {
                $('#wrap').attr('tabindex', '0').focus();
                setTimeout(function () {
                    $('#wrap').removeAttr('tabindex');
                });
            });
        });
    },

    /**
     * 상품상세의 관련 추천상품 배너
     * @private
     */
    _buildRelatedProducts: function () {
        vcui.require([
            'ui/carousel'
        ], function () {
            $('.uiRelatedProducts').vcCarousel({
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: false
            });
        });
    },

    /**
     * 페이지내 스킵 네비 기능 빌드
     * @private
     */
    _buildSkipNav: function () {
        $(document).on('click', 'a.ui_skip_nav', function (e) {
            e.preventDefault();

            var $target = $($(this).attr('href'));
            if ($target.length) {
                var top = $target.offset().top - $('#header').outerHeight(true);

                $('html, body').stop().animate({
                    scrollTop: top
                }, 100, function () {
                    $target.attr('tabindex', 0).focus();
                    window.scrollTo(0, top);
                    setTimeout(function () {
                        $target.removeAttr('tabindex');
                    });
                });
            }
        });
    },

    footer: {
        init: function () {
            // 패밀리 사이트
            vcui.require([
                'ui/dropmenu'
            ], function () {
                $('.ui_family_dropmenu').vcDropmenu({
                    activeClass: 'on'
                });
            });
        }
    },
    header: {
        init: function () {
            this._initHeader();
            this._initAllmenu();
        },
        // gnb 빌드
        _initHeader: function () {
            var $header = $('#header');
            if ($header.length) {

                vcui.require([
                    'ui/skbHeader'
                ], function () {
                    // gnb가 열려있을 때는 본문에 포커스가 안가도록 설정
                    $header.vcSkbHeader().on('skbheaderopen skbheaderclose', function (e) {
                        $('#containers').attr('aria-hidden', e.type === 'skbheaderopen' ? 'true' : 'false');
                    });

                    // 전체메뉴가 열리면 gnb는 닫는다.
                    vcui.PubSub.on('common:openedAllmenu', function (event) {
                        $header.vcSkbHeader('close');
                    });
                });
            }
        },
        // allmenu
        _initAllmenu: function () {
            // 전체메뉴
            vcui.require([
                'ui/skbAllmenu'
            ], function () {
                $('.global_util .menus.all').vcSkbAllmenu({
                    target: '#menu_all'
                }).on('skballmenuopen skballmenuclose', function (e) {
                    var isOpen = e.type === 'skballmenuopen';
                    if (isOpen) {
                        vcui.PubSub.trigger('common:openedAllmenu'); // 전역이벤트를 ?려준다.
                    }
                    skbSite.preventPageScroll(isOpen);

                    // 접근성심사수정 start
                    $('#wrap>*').not('#menu_all, #header').attr('aria-hidden', isOpen);   // 전체 메뉴가 열려있을 때는 본문에 포커스가 안가도록
                    // 접근성심사수정 end

                    $('#wrap').toggleClass('all_menu_open', isOpen);
                });
            });
        }
    },

    /**
     * 유부트 iframe를 재생시키고자 할 경우 사용(단순히 url파라미터를 던지는 방식이 아닌 message전송 방식으로 처리한다)
     * @param iframe
     * @param options
     */
    playYoutubeIframe: function (iframe, options) {
        if (!iframe) {
            return;
        }

        options = vcui.extend({}, options);

        iframe.contentWindow.postMessage(JSON.stringify({
            'event': 'command',
            'func': 'playVideo',
            'args': []
        }), '*');

        if (options.fullScreen && !vcui.detect.isIOS) {
            vcui.util.requestFullScreen(iframe);
        }
    },

    /**
     * 모달이 열렸을 때 페이지 스크롤은 막는다.
     * 주로 모달, 헤더메뉴, 전체메뉴가 열릴 때 스크롤을 막는다.
     * @param flag
     */
    preventPageScroll: function (flag) {
        // iframe 안에서는 아무것도 안함
        if (this.isInFrame) {
            return;
        }

        var $wrap = $('#wrap');
        var css = {'position': this.isInFrame ? 'absolute' : 'fixed', 'top': 0, 'width': '100%'};

        if (!$wrap.length) {
            $wrap = $('body');
        }

        if (flag && !$wrap.hasClass('ui_prevent_scroll')) {
            skbSite.isPreventedScroll = true;
            $(document).triggerHandler('preventscroll', true);

            css.top = -$(window).scrollTop();
            $wrap.css(css).addClass('ui_prevent_scroll');
        } else if (!flag && $wrap.hasClass('ui_prevent_scroll')) {
            var top = parseInt($wrap.css('top'), 10) || 0;
            $wrap.css({'position': '', 'top': '', 'width': ''}).removeClass('ui_prevent_scroll');
            $('html, body').scrollTop(-top);

            skbSite.isPreventedScroll = false;
            $(document).triggerHandler('preventscroll', false);
        }
    },

    /**
     * 스크롤 탑
     * @param $el
     * @param callback
     */
    scrollToTop: function ($el, callback) {
        $('html, body').animate({
            scrollTop: $el.offset().top - 64
        }, 'fast', function () {
            callback && callback();
        });
    },

    /**
     * gif이미지는 한번 캐시된 이후에는 이미지재생이 안되기 때문에 매번 새로 가져와야만 매번 재생된다.
     * img 태그에 data-img속성에 gif이미지를 설정해주기만 하면 된다.
     * 예: <img src="a.gif" data-img="a.gif">
     */
    playGif: function () {
        $('img[data-img$=".gif"]').each(function () {
            var $item = $(this);
            $item.attr('src', $item.data('img') + "?t=" + new Date());
            $item.removeAttr('data-img');
        });
    },

    /**
     * data-control="youtube-modal" 설정만으로 클릭했을 때 자동으로 유투브를 모달로 띄워준다.
     * 예: <a href="https://youtube.com/embed/d4Fsed344" data-control="youtube-modal">유투브재생</a>
     * @private
     */
    _buildYoutubeModal: function () {
        var html = '<article id="uiYoutubeModal" class="layer_pop wid_l" style="display: none"><header id="pop_header"><h1 class="pop_tit"></h1></header><div id="pop_container"><!-- contents --><div class="pop_contents"><div class="youtube_wrap guide_movie_wrap"><div class="youtube_play_wrap"><iframe src="about:blank" title=""></iframe></div></div></div><!-- //contents --></div><footer id="pop_footer"><div class="pop_close"><button type="button" class="btn close" data-role="close"><i class="ico ico20 type05">닫기</i></button></div></footer></article>';

        $(document).on('click.youtubeModal', 'a[data-control="youtube-modal"]', function (e) {
            e.preventDefault();

            var $link = $(this),
                $modal = $(html).appendTo('body'),
                url = $link.attr('href'),
                title = $link.attr('title');

            $modal.find('.pop_tit').text(title);
            $modal.find('iframe').attr('src', url).attr('title', title + ' 동영상');

            $modal.vcModal({effect: 'none', removeOnClose: true, opener: this});
        });
    },

    /**
     * 주소 복사
     * ui_clipboard_url 클래스가 있는 버튼을 클릭시 현재 url 복사
     * @private
     */
    _buildClipboard: function () {
        $(document).on('click.clipboard', '#ui_clipboard_url, .ui_clipboard_url', function (e) {
            e.preventDefault();
            if (this.getAttribute('data-clipboard-text')) {
                vcui.dom.copyToClipboard(this.getAttribute('data-clipboard-text'));
                alert('복사가 완료되었습니다.');
            } else {
                vcui.dom.copyToClipboard(location.href);
                alert('URL 복사가 완료되었습니다.');
            }
        });
    },

    /**
     * 페이지 로딩바 표시
     * @param target
     * @param isFull
     * @param top
     */
    showLayerLoading: function (target, isFull, top, css) {
        top = top || '30%';
        var loadingStyle = isFull ? 'style="position:fixed;z-index:9999;top:0;left:0;height:100%;width:100%;text-align:center;"' : ' style="position:absolute;width:100%;height:100%;padding-top:0;padding-bottom:0;"';
        var loadingDiv = '<div class="loading"' + loadingStyle + '><img src="/common/img/vin/common/spinner_60.gif" style="position:absolute;left:50%;margin-left:-30px;margin-top:-30px;top:' + top + '" alt="로딩 중"></div>';
        var $target = $(target);

        if ($target.find('.loading').length == 0) {
            $target.append($(loadingDiv).css(css || {}));
        }
    },
    /**
     * 페이지 로딩바 숨김
     * @param target
     */
    hideLayerLoading: function (target) {
        $(target).find('.loading').remove();
    }
};

// 컨펌 모달창
vcui.ui.confirm = function (msg, options) {
    return $(vcui.template(vcui.ui.confirm.tmpl, {
        msg: msg
    })).appendTo('body').vcModal(vcui.extend({
        removeOnClose: true
    }, options));
};
vcui.ui.confirm.tmpl = '<article class="layer_pop" style="display: none;">\n' +
    '    <div id="pop_container">\n' +
    '        <!-- contents -->\n' +
    '        <div class="pop_contents">\n' +
    '            <p class="basic_txt">{{=msg}}</p>\n' +
    '        </div>\n' +
    '        <!-- //contents -->\n' +
    '    </div>\n' +
    '    <footer id="pop_footer">\n' +
    '        <div class="btn_wrap">\n' +
    '            <button type="button" class="btn cancel" data-role="close"><span>취소</span></button>\n' +
    '            <button type="button" class="btn submit" data-role="confirm"><span>확인</span></button>\n' +
    '        </div>\n' +
    '    </footer>\n' +
    '</article>';

// 얼럿 모달창
vcui.ui.alert = function (msg, options) {
    return $(vcui.template(vcui.ui.alert.tmpl, {
        msg: msg
    })).appendTo('body').vcModal(vcui.extend({
        removeOnClose: true
    }, options));
};
vcui.ui.alert.tmpl = '<article class="layer_pop" style="display: none;">\n' +
    '    <div id="pop_container">\n' +
    '        <!-- contents -->\n' +
    '        <div class="pop_contents">\n' +
    '            <p class="basic_txt">{{msg}}</p>\n' +
    '        </div>\n' +
    '        <!-- //contents -->\n' +
    '    </div>\n' +
    '    <footer id="pop_footer">\n' +
    '        <div class="btn_wrap">\n' +
    '            <button type="button" class="btn submit" data-role="confirm"><span>확인</span></button>\n' +
    '        </div>\n' +
    '    </footer>\n' +
    '</article>';


// 초기작업 실행
document.addEventListener('DOMContentLoaded', function () {
    skbSite.init();
});
