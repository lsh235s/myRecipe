/*!
 * @module vcui.ui.Accordion // 바이널 UI 라이브러리
 * @license MIT License
 * @description 아코디온 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/accordion', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var ui = core.ui,
        name = 'accordion',
        eventBeforeCollapse = name + 'beforecollapse',
        eventCollapse = name + 'collapse',
        eventBeforeExpand = name + 'beforeexpand',
        eventExpand = name + 'expand';

    /**
     * @class
     * @description 아코디언 컴포넌트
     * @name vcui.ui.Accordion
     * @extends vcui.ui.View
     */
    var Accordion = ui('Accordion', /**@lends vcui.ui.Accordion# */{
        $statics: {
            ON_BEFORE_COLLAPSE: eventBeforeCollapse,
            ON_COLLAPSE: eventCollapse,
            ON_BEFORE_EXPAND: eventBeforeExpand,
            ON_EXPAND: eventExpand
        },
        bindjQuery: name,
        defaults: {
            singleOpen: false,
            useAnimate: true,
            duration: 200,
            autoScroll: false,
            scrollTopOffset: 0,
            activeClass: "active",
            selectedClass: 'on',
            itemClosest: 'li',
            itemSelector: '>ul>li',
            toggleSelector: ">.head>.ui_accord_toggle",
            contentSelector: ">.ui_accord_content"
        },

        /**
         * 생성자
         * @param el 모듈 요소
         * @param {object} [options] 옵션(기본값: defaults 속성 참조)
         * @param {boolean} [options.singleOpen = false] 단일열림 / 다중열림 여부
         * @param {number} [options.duration = 200] 펼쳐지거나 닫혀지거나 할 때 애니메이션 속도
         * @param {string} [options.activeClass = 'active'] 활성화됐을 때 추가할 css 클래스명
         * @param {string} [options.selectedClass = 'on'] 버튼이 토글될 때 추가할 css 클래스명
         * @param {string} [options.itemClosest = 'li']
         * @param {string} [options.itemSelector = '>ul>li']
         * @param {string} [options.toggleSelector = '>.head>.ui_accord_toggle'] 토글버튼
         * @param {string} [options.contentSelector = '>.ui_accord_content'] 컨텐츠
         */
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._bindEvent();

            var openIndex = self.options.openIndex;

            // TODO: 강제로 모두 펼침(임시) start
            /*
            if (location.pathname.indexOf('/html') === 0) {
                self.options.singleOpen = false;
                openIndex = 'all';
            }
            */
            // TODO: 강제로 모두 펼침(임시) end


            if (openIndex !== undefined) {
                if (openIndex === 'all') {
                    self.expandAll();
                } else {
                    self.collapseAll();
                    var indexes = [].concat(openIndex);
                    if (self.options.singleOpen) {
                        self.expand(indexes[0], false);
                    } else {
                        core.each(indexes, function (index) {
                            self.expand(index, false);
                        });
                    }
                }
            }
        },

        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvent: function _bindEvent() {
            var self = this,
                o = self.options;

            // 토글버튼 클릭됐을 때
            self.on("click dblclick", o.itemSelector + o.toggleSelector, function (e) {
                e.preventDefault();

                //self.updateSelectors();
                var $item = $(this).closest(o.itemClosest),
                    $items = self._findItems(),
                    index = $items.index($item);

                if ($item.hasClass(o.selectedClass)) {
                    self.collapse(index, self.options.useAnimate, function () {
                        $item.addClass(o.activeClass);
                    });
                } else {
                    self.expand(index, self.options.useAnimate);
                }
            });

            if (o.accordGroup && o.singleOpen) {
                // 아코디언 요소가 따로 떨어져 있는 것을 data-accord-group속성을 묶고,
                // 하나가 열리면 그룹으로 묶여진 다른 아코디언에 열려진게 있으면 닫아준다.
                self.on(eventBeforeExpand, function (e) {
                    $('.ui_accordion[data-accord-group=' + o.accordGroup + '], ' + '.ui_accordion_list[data-accord-group=' + o.accordGroup + ']').not(self.$el).vcAccordion('collapse').find(o.itemSelector).removeClass(o.selectedClass);
                });
            }
        },

        _findSelected: function _findSelected() {
            return this.$items.filter('.' + self.options.selectedClass);
        },

        // 재정의
        _findItems: function _findItems() {
            var self = this,
                o = self.options,
                $items;

            if (o.accordType === 'detailview') {
                $items = self.$el;
            } else {
                $items = o.itemSelector ? self.$(o.itemSelector) : self.$el;
            }
            return $items;
        },

        _postCollapse: function _postCollapse(data) {
            var self = this;
        },
        _postExpand: function _postExpand(data) {
            var self = this,
                o = self.options;

            self._autoScroll(data);
        },

        _autoScroll: function _autoScroll(data) {
            var self = this,
                o = self.options,
                $con,
                scrollTop,
                top,
                sto;

            if (o.autoScroll) {
                if (o.autoScroll === true) {
                    $con = $('html, body');
                    scrollTop = $(data.header).offset().top;
                } else {
                    top = $(data.header).position().top;
                    $con = $(o.autoScroll);
                    scrollTop = top + $(o.autoScroll).scrollTop();
                }
                if (typeof o.scrollTopOffset === 'function') {
                    sto = o.scrollTopOffset();
                } else {
                    sto = o.scrollTopOffset;
                }
                $con.animate({
                    scrollTop: scrollTop + sto
                }, 'fast');
            }
        },
        /**
         * @param {number} index 인댁스
         * @param {boolean} isAni 애니메이션 여부
         * @param {function} callback 콜백함수
         * @fires vcui.ui,Accordion#accordion:beforeCollapse
         * @fires vcui.ui,Accordion#accordion:collapse
         */
        collapse: function collapse(index, isAni, cb) {
            var self = this,
                opts = self.options,
                data = {},
                // 애니메이션 시간
                $items = self._findItems(),
                oldIndex = $items.filter('.' + opts.selectedClass).index();

            if (arguments.length === 0 || index === null) {
                // index가 안넘어보면 현재 활성화된 패널의 index를 갖고 온다.
                index = oldIndex;
            }

            if (index < 0) {
                return;
            }

            data.index = index;
            data.oldIndex = oldIndex;
            data.header = $items.eq(index);
            data.content = data.header.find(opts.contentSelector);

            /**
             * 닫히기 전에 발생하는 이벤트
             * @event vcui.ui.Accordion#accordionbeforecollapse
             * @type {object}
             * @property {number} index 접혀질 인덱스번호
             */
            var ev = $.Event(eventBeforeCollapse);
            self.$el.triggerHandler(ev, data);
            if (ev.isDefaultPrevented()) {
                return;
            }

            if (typeof isAni === 'undefined') {
                isAni = self.options.useAnimate;
            }

            /**
             * 닫힌 후에 발생하는 이벤트
             * @event vcui.ui.Accordion#accordioncollapse
             * @type {object}
             * @property {number} index 닫힌 인덱스 번호
             */
            if (isAni !== false) {
                // 애니메이션 모드
                //if(this.isAnimate) { return; }
                data.header.removeClass(opts.selectedClass);
                data.content.slideUp(opts.duration, function () {
                    // 닫혀진 후에 이벤트 발생
                    self.trigger(eventCollapse, data);
                    self._updateButton(index, false);
                    self._postCollapse(data);
                    cb && cb();
                });
            } else {
                // 일반 모드
                data.header.removeClass(opts.selectedClass);
                data.content.hide();
                // 닫혀진 후에 이벤트 발생
                self.trigger(eventCollapse, data);
                self._updateButton(index, false);
                self._postCollapse(data);
                cb && cb();
            }
        },

        /**
         * 확장시키기
         * @param {number} index 인댁스
         * @param {boolean} isAni 애니메이션 여부
         * @param {function} callback 콜백함수
         * @fires vcui.ui,Accordion#accordion:beforeExpand
         * @fires vcui.ui,Accordion#accordion:expand
         */
        expand: function expand(index, isAni, callback) {
            var self = this,
                opts = self.options,
                $items,
                oldItem,
                oldIndex,
                newItem,
                data;

            if (arguments.length === 0) {
                return;
            }

            $items = self._findItems();
            newItem = $items.eq(index);
            oldItem = $items.filter('.' + opts.selectedClass);
            oldIndex = oldItem.index();
            data = {
                index: index,
                header: newItem,
                oldIndex: oldIndex,
                oldHeader: oldIndex < 0 ? null : oldItem
            };

            if (data.index === data.oldIndex) {
                return;
            }

            data.content = newItem.find(opts.contentSelector);
            data.oldContent = oldIndex < 0 ? null : oldItem.find(opts.contentSelector);

            /**
             * 열리기 전에 이벤트 발생
             * @event vcui.ui.Accordion#accordionbeforeexpand
             * @type {object}
             * @property {number} index 열린 인덱스
             */
            var ev = $.Event(eventBeforeExpand);
            self.trigger(ev, data);
            if (ev.isDefaultPrevented()) {
                return;
            }

            if (typeof isAni === 'undefined') {
                isAni = self.options.useAnimate;
            }

            /**
             * @event vcui.ui.Accordion#accordionexpand
             * @type {object}
             * @property {number} index 열린 인덱스.
             */
            if (isAni !== false) {
                // 애니메이션 사용
                self.isAnimate = true;
                if (opts.singleOpen && data.oldHeader) {
                    // 하나만 열리는 모드
                    data.oldHeader.removeClass(opts.selectedClass);
                    data.oldContent.slideUp(opts.duration, function () {
                        self._updateButton(data.oldIndex, false);
                        callback && callback();
                    });
                }
                data.header.addClass(opts.selectedClass);
                data.content.slideDown(opts.duration, function () {
                    self.isAnimate = false;
                    // 열려진 후에 이벤트 발생
                    self.trigger(eventExpand, data);
                    self._updateButton(index, true);
                    self._postExpand(data);
                    callback && callback();
                });
            } else {
                // 에니메이션 미사용
                if (opts.singleOpen && data.oldHeader) {
                    // 하나만 열리는 모드
                    data.oldHeader.removeClass(opts.selectedClass);
                    data.oldContent.hide();
                }
                data.header.addClass(opts.selectedClass);
                data.content.show();

                // 열려진 후에 이벤트 발생
                self.trigger(eventExpand, data);
                self._updateButton(index, true);
                self._postExpand(data);
                callback && callback();
            }
        },

        getActivate: function getActivate() {
            var self = this,
                o = self.options,
                item = self._findItems().filter('.' + o.selectedClass);

            if (item.length === 0) {
                return {
                    index: -1,
                    header: null,
                    content: null
                };
            } else {
                return {
                    index: item.index(),
                    header: item,
                    content: item.find(o.contentSelector)
                };
            }
        },

        _updateButton: function _updateButton(index, toggle) {
            var self = this,
                options = self.options,
                activeClass = options.activeClass,
                toggleClass = options.toggleButtonClass,
                $btn = self._findItems().eq(index).find(options.toggleSelector);

            $btn.attr('aria-expanded', toggle ? 'true' : 'false');

            if ($btn.is('a')) {
                if (toggle) {
                    $btn.parent().parent().removeClass(activeClass).addClass(toggleClass);
                    $btn.find('.btn_txt').html('닫기');
                    $btn.find('.ui_accord_text').html(function () {
                        return $btn.attr('data-close-text') || '닫기';
                    }).parent().parent().replaceClass('btn_open', 'btn_close');
                } else {
                    $btn.parent().parent().removeClass(toggleClass);
                    $btn.find('.btn_txt').html('상세보기');
                    $btn.find('.ui_accord_text').html(function () {
                        return $btn.attr('data-open-text') || '상세보기';
                    }).parent().parent().replaceClass('btn_close', 'btn_open');
                }
            } else {
                if (toggle) {
                    $btn.find('.btn_txt').html('닫기');
                    $btn.replaceClass('btn_open', 'btn_close').parent().parent().removeClass(activeClass).addClass(toggleClass);
                    $btn.find('.ui_accord_text').html(function () {
                        return $btn.attr('data-close-text') || '닫기';
                    });
                } else {
                    $btn.find('.btn_txt').html('상세보기');
                    $btn.replaceClass('btn_close', 'btn_open').parent().parent().removeClass(toggleClass);
                    $btn.find('.ui_accord_text').html(function () {
                        return $btn.attr('data-open-text') || '상세보기';
                    });
                }
            }
        },

        collapseAll: function collapseAll() {
            var self = this,
                count = self._findItems().length;

            self.collapseMode = 'all';
            for (var i = 0; i < count; i++) {
                self.collapse(i, false);
            }
            self.collapseMode = null;
        },

        expandAll: function expandAll() {
            if (this.options.singleOpen) {
                return;
            }
            var self = this,
                count = self._findItems().length;

            self.expandMode = 'all';
            for (var i = 0; i < count; i++) {
                self.expand(i, false);
            }
            self.expandMode = null;
        }
    });

    return Accordion;
});
/*!
 * @module vcui.ui.Calendar
 * @license MIT License
 * @description 달력 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/calendar', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var $doc = $(document),
        ui = core.ui,
        dateUtil = core.date,
        detect = core.detect;

    //Calendar ////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @description 달력 모듈
     * @name vcui.ui.Calendar
     * @extends vcui.ui.View
     * @fires vcui.ui.Calendar#calendarshow
     * @fires vcui.ui.Calendar#calendarshown
     * @fires vcui.ui.Calendar#calendarhide
     * @fires vcui.ui.Calendar#calendarhidden
     * @fires vcui.ui.Calendar#calendarselected
     * @fires vcui.ui.Calendar#calendarinsertdate
     */
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var dateRegex = /[0-9]{4}.?[0-9]{2}.?[0-9]{2}/;

    var Calendar = ui('Calendar', /** @lends scui.ui.Calendar# */{
        bindjQuery: 'calendar',
        templates: {
            header: '<div class="ui-calendar-header-first">' +
            '<a href="#" class="ui-calendar-set-today" title="현재일 보기"></a>' +
            '<select class="ui-calendar-sel-years" title="달력년도"></select>' +
            '<a href="#" class="ui-calendar-close"><span class="hide">닫기</span></a>' +
            '</div>' +
            '<div class="ui-calendar-header-second">' +
            '<a href="#" class="ui-calendar-prev">&lt;</a>' +
            '<span class="ui-calendar-now"></span>' +
            '<a href="#" class="ui-calendar-next">&gt;</a>' +
            '</div>',
            label: '<span class="ui-calendar-day" title="{{title}}">{{day}}</span>',
            button: '<button type="button" class="ui-calendar-day{{disabled ? " disabled" : ""}}" title="{{title}}" {{disabled ? "disabled=\'disabled\' style=\'cursor:default\'" : ""}}>{{day}}</button>',
            prevArrow: '<span class="ui-calendar-prev-year-text hide">{{year}}년</span> ' +
            '<span class="ui-calendar-prev-day-text hide">{{month}}월</span>' +
            '<span class="hide">로 이동</span>',
            nextArrow: '<span class="ui-calendar-next-year-text hide">{{year}}년</span> ' +
            '<span class="ui-calendar-next-day-text hide">{{month}}월</span>' +
            '<span class="hide">로 이동</span>',
            nowLabel: '<span class="ui-calendar-now-year-text">{{year}}년</span> ' +
            '<span class="ui-calendar-now-day-text">{{month}}월</span>' +
            '<span class="hide">이 선택됨</span>'
        },
        defaults: {
            weekNames: ['일', '월', '화', '수', '목', '금', '토'],
            monthNames: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월'.split(','),
            titleFormat: 'yyyy년 MM월 dd일',
            weekendDisabled: false, // 주말을 disabled시킬 것인가
            type: 'button', // 날짜가 선택되게 할 것인가
            inputTarget: '', // 날짜를 선택했을 때, 날짜가 들어갈 인풋박스의 셀렉터
            showOtherMonths: false, // 이전, 다음달의 날짜를 표시할 것인가
            hAlignInput: false, // input을 기준으로 배치시킬 것인가.
            isBubble: false, // 달력이벤트의 버블링을 허용할 것인가
            date: new Date(), // 처음에 표시할 기본 날짜
            today: new Date(), // 오늘 날짜
            selectedDate: null,
            isClickActive: true, // 인라인모드에서 클릭했을 때 active효과를 줄 것인가.
            showByInput: false, // 인풋박스에 의해서도 달력을 열 것인가
            where: 'inline', // 달력 dom을 어디에 두고 열것인가 설정:(body(body 맨 하단, inline(버튼 바로 밑)
            minDate: '-5y', // 날짜 하한값
            maxDate: '+5y', // 날짜 상한값
            holidays: [], // 휴일 날짜 -> ['2014-04-05', '2014-05-12'],
            disabledDays: [], // 특정일을 선택 못하게 할때 사용 -> ['2014-04-05', '2014-05-12'],
            holidaysAlertMsg: '',
            caption: '캘린더입니다. 글은 일요일, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일 순으로 나옵니다.',
            monthCaption: '월 선택 캘린더입니다. 1월부터 12월까지 순서대로 나옵니다.',
            colWidth: '32px', // 셀 너비
            format: 'yyyy-MM-dd'
        },

        events: {},

        /**
         *
         * @param {jquery|element} el 엘리먼트
         * @param {object} [options] 옵션
         * @param {array<string>} [options.weekNames] 주의 한글명
         * @param {array<string>} [options.monthNames] 월의 한글명
         * @param {boolean} [options.isClickable=true] 날짜를 선택할 수 있게 할 것인가
         * @param {string} [options.titleFormat=yyyy년 MM월 dd일] 제목 포맷
         * @param {boolean} [options.weekendDisabled = false] 주말을 disabled시킬 것인가
         * @param {string} [options.inputTarget] 날짜를 선택했을 때, 날짜가 들어갈 인풋박스의 셀렉터
         * @param {boolean} [options.showOtherMonths = false] 이전, 다음달의 날짜를 표시할 것인가
         * @param {date} [options.date = Date.now()] 처음에 표시할 기본 날짜
         * @param {date} [options.today = Date.now()] 오늘 날짜
         * @param {boolean} [options.isHoverCell = true] 인라인모드에서 클릭했을 때 active효과를 줄 것인가.
         * @param {string} [minDate="-5y"] 이전 몇년까지 표시할 것인가
         * @param {string} [minDate="+5y"] 이전 몇년까지 표시할 것인가
         * @param {string} [options.caption] 달력 캡션
         * @param {string} [options.format="yyyy-MM-dd"] 표시할 날짜의 형식 ㅇ) 'yyyy-MM-dd'
         * @param {string} [options.colWidth="32px"] 컬럼너비
         * @param {string} [options.where="inline"] 달력 dom을 어디에 두고 열것인가 설정:(body(body 맨 하단, inline(버튼 바로 밑)
         * @param {boolean} [options.showByInput=false]
         * @returns {boolean}
         */
        initialize: function initialize(el, options) {
            var self = this,
                d;

            if (self.supr(el, options) === false) {
                return self.release();
            }

            self._normalizeOptions();
            self._parseMinMaxDate();

            self.isInline = !self.$el.is('button, input, a');
            self.options.header = true;
            self.$srOnly = $('<span class="hide">선택됨</span>');

            if (self.isInline) {
                self.currDate = d = dateUtil.parse(self.options.date), isNaN(d) ? new Date() : d;
                self.isShown = true;
                self._render();

                if (core.is(self.options.selectedDate, 'date')) {
                    setTimeout(function () {
                        self.selectDate(self.options.selectedDate);
                    });
                }
            } else {
                self._buildPopup();
            }
        },

        /**
         * 팝업모드(버튼을 눌렀을 때 버튼밑에 달력이 표시되는 모드)
         * @private
         */
        _buildPopup: function () {
            var self = this;
            var d;

            if (self.options.inputTarget) {
                self.$input = $(self.options.inputTarget);
            }

            if (!self.$input.length) {
                self.$input = self.$el.siblings('input');
            }

            if (!self.$input.length) {
                throw new Error('data-input-target 속성을 설정해주세요.');
            }

            self.$input.data('ui_calendar', self);
            self._readInput();

            if (detect.isMobile) {
                self.currDate = d = dateUtil.parse(self.$input.val() || self.options.date), isNaN(d) ? new Date() : d;
                self._renderMobileCalendar();

                self.off('.calendar').on('click.calendar', function (e) {
                    e.preventDefault();
                    self.$input.focus().click();
                });

                return;
            } else {
                self.options.showByInput && self.$input.on('click', function (e) {
                    if (self.isShown) {
                        return;
                    }
                    self.opener = this;
                    self.open();
                });

                self.$input.addClass('ui_formatter').attr({
                    'data-format': 'date',
                    'maxlength': 10
                }).prop('readonly', true);

                self.$input.on('keyup paste change', function (e) {

                    if (!self.isShown || this.value.length !== 10) {
                        return;
                    }
                    if (self._isValidDate(this.value)) {
                        self.setDate(this.value);
                    }
                });
            }

            self.$el.aria({
                'haspopup': 'true',
                'expanded': 'false',
                'controls': 'dropdown_' + self.cid
            });

            self.options.type = 'button';
            self.off('.calendar').on('click.calendar', function (e) {
                e.preventDefault();
                if (self.isShown) {
                    self.close();
                    return;
                }
                self.opener = this;
                self.open();
            });
        },

        /**
         * 날짜 유효 체크
         * @param val
         * @returns {boolean}
         * @private
         */
        _isValidDate: function _isValidDate(val) {

            if (!val || val.length < 8) {
                return false;
            }
            val = dateUtil.parse(val);
            if (!dateUtil.isValid(val)) {
                return false;
            }
            if (this.minDate > val) {
                return false;
            }
            if (this.maxDate < val) {
                return false;
            }
            return true;
        },

        /**
         * 옵션 중에서 날짜옵션에 문자열로 된게 있으면 파싱해서 date형으로 변환한다.
         * @private
         */
        _normalizeOptions: function _normalizeOptions() {
            var self = this,
                opts = self.options;

            if (!core.is(opts.today, 'date')) {
                opts.today = dateUtil.parse(opts.today + '');
            }

            //data-holidays속성을 이용한 경우 문자열로 넘어오기 때문에 배열로 변환해주어야 한다.
            if (core.is(opts.holidays, 'string')) {
                try {
                    //opts.holidays = eval(opts.holidays);
                    opts.holidays = new Function('return ' + opts.holidays)();
                } catch (e) {
                    opts.holidays = [];
                }
            }

            //data-disabled-days속성을 이용한 경우 문자열로 넘어오기 때문에 배열로 변환해주어야 한다.
            if (core.is(opts.disabledDays, 'string')) {
                try {
                    //opts.disabledDays = eval(opts.disabledDays);
                    opts.disabledDays = new Function('return ' + opts.disabledDays)();
                } catch (e) {
                    opts.disabledDays = [];
                }
            }

            if (opts.selectedDate) {
                opts.selectedDate = dateUtil.parse(opts.selectedDate);
            }
        },

        /**
         * 옵션에 있는 최소날짜와 최대날짜를 Date형으로 변환
         */
        _parseMinMaxDate: function _parseMinMaxDate() {
            var self = this,
                opts = self.options,
                minDate = opts.minDate,
                maxDate = opts.maxDate;

            self.setMinDate(minDate);
            self.setMaxDate(maxDate);
        },

        /**
         * 미선택 여부
         * @param {number} y 년도
         * @param {number} m 월
         * @param {number} d 일
         * @returns {boolean} 미선택여부
         * @private
         */
        _isDisabledDay: function _isDisabledDay(y, m, d) {
            var self = this,
                disabledDays = self.options.disabledDays,
                i,
                date,
                item;

            for (var i = -1; item = disabledDays[++i];) {
                date = dateUtil.parse(item);
                if (date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d) {
                    return true;
                }
            }

            return false;
        },

        /**
         * 휴일 여부
         * @param {number} y 년도
         * @param {number} m 월
         * @param {number} d 일
         * @returns {boolean} 휴일여부
         * @private
         */
        _isHoliday: function _isHoliday(y, m, d) {
            var self = this,
                holidays = self.options.holidays,
                i,
                date,
                item;

            for (var i = -1; item = holidays[++i];) {
                date = dateUtil.parse(item);
                if (date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d) {
                    return true;
                }
            }

            return false;
        },

        /**
         * 최소날짜 설정
         *
         * @param {Date|String} minDate '2014-12-12', '-2M'
         */
        setMinDate: function setMinDate(m, isRender) {
            var self = this,
                today = core.clone(self.options.today),
                minDate,
                val;

            if (!m) {
                minDate = core.clone(self.options.minDate);
            } else {
                minDate = m;
            }

            if (core.is(minDate, 'date')) {
                self.minDate = core.clone(minDate);
            } else if (dateRegex.test(minDate)) {
                self.minDate = core.date.parse(minDate);
            } else {
                if (val = core.date.calc(today, minDate)) {
                    self.minDate = val;
                }
            }

            if (!core.is(self.minDate, 'date')) {
                self.minDate = new Date(today.getFullYear() - 5, 0, 1, 0, 0, 0, 0);
            }

            self.minDate.setHours(0, 0, 0, 0);

            if (dateUtil.isValid(self.currDate) && self.currDate < self.minDate) {
                self.currDate = core.clone(self.minDate);
            }
            if (self.isShown && isRender !== false) {

                self._renderHeader();
                self._renderDate();
            }

            if (detect.isMobile) {
                self.$input.prop({'min': dateUtil.format(self.minDate, 'yyyy-MM-dd')});
            }

            if (self.$input && dateUtil.isValid(self.$input.val()) && dateUtil.compare(self.minDate, self.$input.val()) === -1) {

                if (detect.isMobile) {
                    self.$input.val(dateUtil.format(self.minDate, 'yyyy-MM-dd'));
                } else {
                    self.$input.val(dateUtil.format(self.minDate));
                }
            }
        },

        /**
         * 최대날짜 설정
         *
         * @param {Date|String} maxDate '2014-12-12', '+2M'
         */
        setMaxDate: function setMaxDate(m, isRender) {
            var self = this,
                today = core.clone(self.options.today),
                maxDate,
                val;

            if (!m) {
                maxDate = core.clone(self.options.maxDate);
            } else {
                maxDate = m;
            }

            if (core.is(maxDate, 'date')) {
                self.maxDate = core.clone(maxDate);
            } else if (dateRegex.test(maxDate)) {
                self.maxDate = core.date.parse(maxDate);
            } else {
                if (val = core.date.calc(today, maxDate)) {
                    self.maxDate = val;
                }
            }

            if (!core.is(self.maxDate, 'date')) {
                self.maxDate = new Date(today.getFullYear() + 5, 11, 31, 0, 0, 0, 0);
            }

            self.maxDate.setHours(0, 0, 0, 0);

            if (dateUtil.isValid(self.currDate) && self.currDate > self.maxDate) {
                self.currDate = core.clone(self.maxDate);
            }
            if (self.isShown && isRender !== false) {
                self._renderHeader();
                self._renderDate();
            }

            if (detect.isMobile) {
                self.$input.prop({'max': dateUtil.format(self.maxDate, 'yyyy-MM-dd')});
            }

            if (self.$input && dateUtil.isValid(self.$input.val()) && dateUtil.compare(self.maxDate, self.$input.val()) === 1) {
                if (detect.isMobile) {
                    self.$input.val(dateUtil.format(self.maxDate, 'yyyy-MM-dd'));
                } else {
                    self.$input.val(dateUtil.format(self.maxDate));
                }
            }
        },

        /**
         * 최소/최대 날짜 지정
         * @param {date|string} minDate 최소 날짜
         * @param {date|string| maxDate 최대 날짜
         */
        setRangeDate: function setRangeDate(minDate, maxDate) {
            var self = this;

            self.setMinDate(minDate, false);
            self.setMaxDate(maxDate, false);
            if (self.isShown) {
                self._renderHeader();
                self._renderDate();
            }
        },

        /**
         * 모바일 버전 렌더링
         * @private
         */
        _renderMobileCalendar: function _renderMobileCalendar() {
            var self = this;
            self.oldTxt = "";

            self.$input.val(dateUtil.format(self.$input.val(), 'yyyy-MM-dd')).attr({
                'type': 'date',
                'data-module': 'calendar'
            }).prop({
                'readonly': false,
                'min': dateUtil.format(self.minDate, 'yyyy-MM-dd'),
                'max': dateUtil.format(self.maxDate, 'yyyy-MM-dd')
            }).on('change', function (e) {

                var newDate = $(e.currentTarget).val();
                var evtData = {
                    target: e.currentTarget,
                    //year: $this.data('year'),month: $this.data('month'),day: $this.data('day'),value: format,calendar: self.$calendar[0],
                    date: newDate

                };
                self.$input.triggerHandler('calendarinsertdate', evtData);
            });
        },

        /**
         * 위치 재조절
         */
        _reposition: function _reposition() {
            if (this.options.type !== 'button' || this.options.isInline) {
                return;
            }

            var self = this,
                calWidth = self.$calendar.width(),
                calHalfWidth = Math.ceil(calWidth / 2),
                inpWidth,
                inpHalfWidth,
                css = {};

            css.top = self.$input[self.options.where === 'body' ? 'offset' : 'position']().top + self.$input.outerHeight() + 10;

            if (self.options.hAlignInput) {
                inpWidth = self.$input.outerWidth();
                inpHalfWidth = Math.ceil(inpWidth / 2);
                css.left = inpHalfWidth - calHalfWidth;
            }

            self.$calendar.css(css);
            return self;
        },

        /**
         * 모달 띄우기
         * @returns {Calendar}
         */
        open: function open() {
            var self = this;

            if (self.isInline) {
                return;
            }
            Calendar.active && Calendar.active.close();
            Calendar.active = this;

            var ev = $.Event('calendarshow');
            self.trigger(ev);

            if (ev.isDefaultPrevented()) {
                return;
            }

            self._readInput();
            self._render();
            self._reposition();
            self.show();
            self.isShown = true;
            self.$calendar.attr('tabindex', 0).focus();

            return self;
        },

        /**
         * 인풋에 있는 값을 달력에 반영
         * @private
         */
        _readInput: function _readInput() {
            if (this.isInline) {
                return;
            }

            var self = this,
                val = self.$input.val(),
                valDate = val && val.length < 8 ? null : dateUtil.parse(val);

            if (core.date.isValid(valDate)) {
                if (!valDate || isNaN(valDate.getTime())) {
                    self.currDate = core.clone(self.options.date);
                    self.activeDate = core.clone(self.options.today);
                    if (val) {
                        self.$input.val(dateUtil.format(self.activeDate));
                    }
                } else {
                    var cmp = self._compareDate(valDate);
                    if (cmp < 0) {
                        valDate = self.currDate = core.clone(self.minDate);
                    } else if (cmp > 0) {
                        valDate = self.currDate = core.clone(self.maxDate);
                    } else {
                        self.currDate = valDate;
                    }
                    self.activeDate = core.clone(valDate);

                    if (val && cmp !== 0) {
                        self.$input.val(dateUtil.format(valDate));
                    }
                }
            } else {
                self.currDate = core.clone(self.options.date);
                self.activeDate = core.clone(self.options.today);
            }
        },

        /**
         * 모달 닫기
         * @returns {Calendar}
         */
        close: function close() {
            var self = this;

            if (self.isInline) {
                return;
            }

            self.$el.aria('expanded', 'false');
            self.isShown = false;
            if (self.$calendar) {
                self.$calendar.off('.calendarclose');
            }
            self.$input.off('.calendarclose');
            self.off('.calendarclose');
            self._trigger('hidden');
            self._remove();
            $doc.off('.calendar');
            Calendar.active = null;

            return this;
        },

        /**
         * 모달 표시
         * @returns {Calendar}
         */
        show: function show() {
            var self = this;

            if (!self.isInline) {
                if (self.$el.prop('disabled') || self.$el.hasClass('disabled')) {
                    return;
                }

                $doc.on('mousedown.calendar', function (e) {
                    if (self.$input && self.$input[0] !== e.target && !$.contains(self.$el[0], e.target) && !$.contains(self.$calendar[0], e.target) && self.$el[0] != e.target) {
                        //e.preventDefault();
                        self.close();
                    }
                });

                if (!core.isTouch) {
                    self._escape();
                }

                self.$el.aria('expanded', 'true');
                self.$calendar.show(); //showLayer({opener: self.$el});
                self._trigger('shown');
            }

            return self;
        },

        /**
         * esc 키를 누르면 닫히도록 이번트 바인딩
         * @private
         */
        _escape: function _escape() {
            var self = this;

            if (self.isInline) { return; }

            self.$calendar.add(self.$el).add(self.$input).off('keyup.calendarclose').on('keyup.calendarclose', function (e) {
                if (self.isShown && e.keyCode === core.keyCode.ESCAPE) {
                    e.stopPropagation();
                    self.close();
                    $(self.opener).focus();
                }
            });

            $doc.on('focusin.calendar focusout.calendar', (function () {
                var timer;
                return function (e) {
                    clearTimeout(timer);
                    if (e.type === 'focusin') {
                        if (!$.contains(self.$el.parent()[0], e.target)) {
                            timer = setTimeout(function () {
                                self.close();
                            }, 200);
                        }
                    }
                }
            })());
        },

        /**
         * DOM 삭제
         * @returns {Calendar}
         */
        _remove: function _remove() {
            var self = this;

            if (self.$calendar) {
                //self.$selectboxYears.vcSelectbox('release');
                self.$calendar.off();
                self.$calendar.remove();
                self.$calendar = null;
            }

            return self;
        },

        /**
         * 렌더링
         */
        _render: function _render() {
            var self = this,
                opts = self.options,
                timer,
                tmpl;

            if (!dateUtil.isValid(self.currDate)) {
                self.currDate = dateUtil.parse(self.options.date);
            }
            if (self.currDate < self.minDate) {
                self.currDate = core.clone(self.minDate);
            }
            if (self.currDate > self.maxDate) {
                self.currDate = core.clone(self.maxDate);
            }

            tmpl = '<div class="ui-calendar-container"><div class="ui-select-day">' +
                (opts.header !== false ? self.tmpl('header') : '') +
                '<div class="ui-calendar-date"></div></div></div>';

            self._remove();
            self.$calendar = $(tmpl);
            self.$calendar.attr('id', 'dropdown_' + self.cid);

            if (opts.header) {
                self.$calendar.on('change', '.ui-calendar-sel-years', function (e) {
                    var date = core.clone(self.currDate);
                    date.setYear(this.value | 0);
                    self.setCurrentDate(date);
                });
            }

            if (self.isInline) {
                // 인라인
                self.$el.empty().append(self.$calendar);
                self.$el.find('.ui-calendar-close').remove();
            } else {
                // 모달
                self.$calendar.css({
                    position: 'absolute',
                    backgroundColor: '#fff',
                    zIndex: 9999
                });
                if (self.options.where === 'body') {
                    $('body').append(self.$calendar);
                } else {
                    self.$el.parent().append(self.$calendar);
                }
            }

            self.$calendar.off('.calendar').on('click.calendar', '.ui-calendar-prev, .ui-calendar-next', function (e) {
                // 이전 / 다음
                e.preventDefault();
                if (self.$el.hasClass('disabled')) {
                    return;
                }

                var $el = $(e.currentTarget),
                    isPrev = $el.hasClass('ui-calendar-prev');

                self[isPrev ? 'prev' : 'next']();
                self.$calendar.find('.ui-calendar-' + (isPrev ? 'prev' : 'next')).focus();
            }).on('click.calendar', '.ui-calendar-year-prev, .ui-calendar-year-next', function (e) {
                // 이전해 / 다음 해

                e.preventDefault();
                if (self.$el.hasClass('disabled')) {
                    return;
                }

                var $el = $(e.currentTarget);
                var isPrev = $el.hasClass('ui-calendar-year-prev');

                self[isPrev ? 'prevYear' : 'nextYear']();
                self.$calendar.find('.ui-calendar-year-' + (isPrev ? 'prev' : 'next')).focus();
            }).on('click.calendar', '.ui-calendar-day:not(.disabled)', function (e) {
                // 날짜 클릭
                e.preventDefault();
                if (self.$el.hasClass('disabled')) {
                    return;
                }
                if (self.options.holidaysAlertMsg !== '' && ($(this).parent().hasClass('ui-calendar-holiday') || $(this).parent().hasClass('ui-calendar-sunday') || $(this).parent().hasClass('ui-calendar-saturday'))) {
                    alert(self.options.holidaysAlertMsg);
                    return;
                }

                var $this = $(this).closest('td'),
                    data = $this.data(),
                    date = new Date(data.year, data.month - 1, data.day);

                self.selectDate(date);
            }).on('click.calendar', '.ui-calendar-set-today', function (e) {
                // 오늘 클릭
                e.preventDefault();
                self.activeDate = core.clone(self.options.today);
                self.currDate = core.clone(self.options.today);

                // 달력 그리기
                self._renderDate();
            }).on('click.calendar', '.ui-calendar-close', function (e) {
                // 닫기 클릭
                e.preventDefault();

                self.close();
                $(self.opener).focus();
            }).on('mouseenter.calendar mouseleave.calendar', 'td.ui-calendar-cell:not(.disabled)', function (e) {
                $(this).toggleClass('active', e.type === 'mouseenter');
            }).on('mouseenter.calendar mouseleave.calendar', '.ui-calendar-table tbody', function (e) {
                $(this).toggleClass('ui-calendar-over', e.type === 'mouseenter');
            });

            self._renderHeader();
            self._renderDate();
            self._enforceFocus();

            return self;
        },

        selectDate: function (date) {
            var self = this,
                opts = self.options,
                format = dateUtil.format(date, opts.format || ''),
                e,
                year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate(),
                evtData = {
                    target: this,
                    year: year,
                    month: month,
                    day: day,
                    value: format,
                    date: date,
                    calendar: self.$calendar[0]
                };

            e = $.Event('calendarselected');
            e.target = e.currentTarget = this;
            self[opts.isBubble ? 'trigger' : 'triggerHandler'](e, evtData);
            if (e.isDefaultPrevented()) {
                return;
            }

            self.activeDate = date;
            if (!self.isInline) {
                self.$input.val(format);
                e = $.Event('calendarinsertdate');
                e.target = e.currentTarget = this;
                self.$input[opts.isBubble ? 'trigger' : 'triggerHandler'](e, evtData);
                self.close();
                self.$input.focus();
            } else {
                if (opts.isClickActive !== false) {
                    self.$calendar.find('.ui-calendar-active').removeClass('ui-calendar-active');
                    self.$calendar.find('.ui-calendar-cell[data-year="' + year + '"][data-month="' + month + '"][data-day="' + day + '"]').addClass('ui-calendar-active').find('button').append(self.$srOnly);
                    self._readInput();
                }
            }
        },

        /**
         * 달력을 새로 그리기
         */
        update: function update() {
            if (!this.isShown) {
                return;
            }
            this._render();
            this._reposition();
        },

        /**
         * 헤더에 현재 날짜에 대한 정보 표시
         * @private
         */
        _renderHeader: function _renderHeader() {
            var self = this,
                opts = self.options,
                pad = core.number.zeroPad;

            if (!opts.header) {
                return;
            }

            self.$calendar.find('.ui-calendar-header-first').css('z-index', 1);
            self.$selectboxYears = self.$calendar.find('.ui-calendar-sel-years');

            if (self.$selectboxYears.length) {
                self.$selectboxYears.empty();
                for (var i = self.minDate.getFullYear(); i <= self.maxDate.getFullYear(); i++) {
                    self.$selectboxYears[0].options.add(new Option(i, i));
                }

                self.$selectboxYears.val(self.currDate.getFullYear()).prop("selected", true); // default selectbox;

                // 일달력(.ui-calendar-header-first)의 년도 선택 버튼에 년도 설정
                //self.$selectboxYears.vcSelectbox('option', 'preventZindex', true);
                //self.$selectboxYears.vcSelectbox('value', self.currDate.getFullYear(), false);
            }

            // 일달력(.ui-calendar-header-second)의 월선택 버튼에 월 설정
            var currDate = new Date(self.currDate.getTime()),
                $second = self.$calendar.find('.ui-calendar-header-second'),
                isFirst, isLast;

            currDate = core.date.calcDate(currDate, '-1M');
            $second.find('.ui-calendar-prev')
                .html(self.tmpl('prevArrow', {
                    year: currDate.getFullYear(),
                    month: pad(currDate.getMonth() + 1, 2)
                }));

            currDate = core.date.calcDate(currDate, '1M');
            $second.find('.ui-calendar-now')
                .html(self.tmpl('nowLabel', {
                    year: currDate.getFullYear(),
                    month: pad(currDate.getMonth() + 1, 2)
                }));

            currDate = core.date.calcDate(currDate, '1M');
            $second.find('.ui-calendar-next')
                .html(self.tmpl('nextArrow', {
                    year: currDate.getFullYear(),
                    month: pad(currDate.getMonth() + 1, 2)
                }));

            //
            currDate = new Date(self.currDate.getTime());
            isFirst = currDate.getFullYear() === self.minDate.getFullYear() &&
                currDate.getMonth() === self.minDate.getMonth();
            isLast = currDate.getFullYear() === self.maxDate.getFullYear() &&
                currDate.getMonth() === self.maxDate.getMonth();
            $second.find('.ui-calendar-prev')
            //.css({ outline: 'none' })
                .toggleClass('disabled', isFirst)
                .attr('tabindex', isFirst ? '-1' : '0')
                .attr('aria-disabled', isFirst ? 'true' : 'false');
            $second.find('.ui-calendar-next')
            //.css({ outline: 'none' })
                .toggleClass('disabled', isLast)
                .attr('tabindex', isLast ? '-1' : '0')
                .attr('aria-disabled', isLast ? 'true' : 'false');

            //
            currDate = new Date(self.currDate.getTime());
            isFirst = currDate.getFullYear() === self.minDate.getFullYear();
            isLast = currDate.getFullYear() === self.maxDate.getFullYear();
            $second.find('.ui-calendar-year-prev')
            //.css({ outline: 'none' })
                .toggleClass('disabled', isFirst)
                .attr('tabindex', isFirst ? '-1' : '0')
                .attr('aria-disabled', isFirst ? 'true' : 'false');
            $second.find('.ui-calendar-year-next')
            //.css({ outline: 'none' })
                .toggleClass('disabled', isLast)
                .attr('tabindex', isLast ? '-1' : '0')
                .attr('aria-disabled', isLast ? 'true' : 'false');

            $second.find('.ui-calendar-current-year-text').text(self.currDate.getFullYear());
            $second.find('.ui-calendar-current-month-text').text(self.currDate.getMonth() + 1);
        },

        /**
         * 해제 메소드
         */
        destroy: function destroy() {
            var self = this;

            if (self.$input) {
                self.$input.off().removeData('calendar');
            }
            self._remove();
            self.close();
            self.supr();
        },

        /**
         * 주어진 월이 유효한 범위에 있는가 체크
         * @param date
         * @returns {*}
         * @private
         */
        _compareMonth: function _compareMonth(date) {
            var self = this;
            date = core.clone(date);
            date.setDate(self.minDate.getDate());
            date.setHours(0, 0, 0, 0);

            if (date.getTime() < self.minDate.getTime()) {
                return -1;
            }
            date.setDate(self.maxDate.getDate());
            if (date.getTime() > self.maxDate.getTime()) {
                return 1;
            }
            return 0;
        },

        /**
         * 주어진 날짜가 유효한 범위에 있는가 체크
         * @param date
         * @returns {*}
         * @private
         */
        _compareDate: function _compareDate(date) {
            var self = this;
            if (!(date instanceof Date)) {
                date = dateUtil.parse(date);
            }
            if (!date || isNaN(date)) {
                return null;
            }
            date.setHours(0, 0, 0, 0);

            if (date.getTime() < self.minDate.getTime()) {
                return -1;
            }
            if (date.getTime() > self.maxDate.getTime()) {
                return 1;
            }
            return 0;
        },

        /**
         * 표시할 날짜 설정
         * @param date
         */
        setCurrentDate: function setCurrentDate(date) {
            if (!(date instanceof Date)) {
                date = dateUtil.parse(date);
            }
            if (!date || isNaN(date)) {
                return;
            }
            var self = this,
                result = self._compareMonth(date);
            if (result < 0) {
                date.setYear(self.minDate.getFullYear());
                date.setMonth(self.minDate.getMonth());
            } else if (result > 0) {
                date.setYear(self.maxDate.getFullYear());
                date.setMonth(self.maxDate.getMonth());
            }
            self.currDate = date;
            //self.$selectboxYears.val(date.getFullYear());
            if (self.isShown) {
                self._renderDate();
            }
        },

        /**
         * 달력 그리기
         * @returns {Calendar}
         * @private
         */
        _renderDate: function _renderDate() {
            var self = this,
                opts = self.options,
                beforeRenderDay = opts.beforeRenderDay,
                date = self._getDateList(self.currDate),
                html = '',
                tmpl = self.tmpl(opts.type, false) || self.tmpl('button', false),
                isHoliday = false,
                isToday = false,
                isActiveDay = false,
                isOtherMonth = false,
                isDisabled = false,
                i,
                j,
                y,
                m,
                d,
                week,
                len,
                cell,
                nowd;

            html += '<table class="ui-calendar-table" border="0"><caption>' + opts.caption + '</caption>';
            html += '<colgroup>';
            for (i = 0; i < 7; i++) {
                html += '<col width="' + opts.colWidth + '" class="';
                html += (i === 0 ? 'ui-calendar-sunday' : i === 6 ? 'ui-calendar-saturday' : '');
                html += '" />';
            }
            html += '</colgroup><thead>';
            for (i = 0; i < 7; i++) {
                html += '<th class="ui-calendar-dayname ' + (i === 0 ? ' ui-calendar-sunday' : i === 6 ? ' ui-calendar-saturday' : '') + '" scope="col">';
                html += opts.weekNames[i];
                html += '</th>';
            }
            html += '</thead><tbody>';

            for (i = 0, len = date.length; i < len; i++) {
                week = date[i];

                html += '<tr>';
                for (j = 0; j < 7; j++) {
                    y = week[j].year, m = week[j].month, d = week[j].day;
                    nowd = new Date(y, m - 1, d);

                    if (self.activeDate) {
                        isActiveDay = dateUtil.equalsYMD(nowd, self.activeDate);
                    }

                    isToday = opts.today.getFullYear() === y && opts.today.getMonth() + 1 === m && opts.today.getDate() === d;
                    isOtherMonth = self.currDate.getMonth() + 1 != m;
                    isDisabled = self._compareDate(nowd) !== 0 || opts.weekendDisabled && (j === 0 || j === 6) || self._isDisabledDay(y, m, d);
                    isHoliday = self._isHoliday(y, m, d);

                    if (beforeRenderDay) {
                        cell = beforeRenderDay.call(me, y, m, d, {
                            isSaturday: j === 6,
                            isSunday: j === 0,
                            isHoliday: isHoliday,
                            isToday: isToday,
                            isOtherMonth: isOtherMonth
                        }) || {cls: '', html: '', disabled: ''};
                    } else {
                        cell = {cls: '', html: '', disabled: ''};
                    }
                    cell.cls = '';

                    html += '<td class="ui-calendar-' + dateUtil.format(nowd, 'yyyyMMdd') + ' ui-calendar-cell' + (isDisabled ? " disabled" : "");
                    html += (j === 0 ? ' ui-calendar-sunday' : j === 6 ? ' ui-calendar-saturday' : '');
                    if (opts.showOtherMonths && isOtherMonth || !isOtherMonth) {
                        html += (isHoliday ? ' ui-calendar-holiday' : '') + (isToday ? ' ui-calendar-today' : '') + (!isDisabled && isActiveDay ? ' ui-calendar-active' : '');
                    }
                    html += (isOtherMonth ? ' ui-calendar-other' : '') + cell.cls + '" data-year="' + y + '" data-month="' + m + '" data-day="' + d + '">';

                    if (!isOtherMonth || opts.showOtherMonths) {
                        if (cell.html) {
                            html += cell.html;
                        } else {
                            html += tmpl({
                                title: dateUtil.format(nowd, opts.titleFormat) + (isToday ? ' 오늘' : '') + (isDisabled ? " 선택할 수 없음" : isActiveDay ? ' 선택일' : ''),
                                isHoliday: isHoliday,
                                isToday: isToday,
                                isOtherMonth: isOtherMonth,
                                isSunday: j === 0,
                                isSaturday: j === 6,
                                day: d,
                                date: nowd,
                                disabled: isDisabled
                            });
                        }
                    } else {
                        html += '&nbsp;';
                    }
                    html += '</td>';
                } // for
                html += '</tr>';
            } // for
            html += '</tbody></table>';

            self.$calendar.find('.ui-calendar-date').html(html);
            self.$calendar.find('.ui-calendar-text').text(dateUtil.format(self.currDate, 'yyyy-MM'));

            if (opts.header) {
                self._renderHeader();
            }

            return self;
        },

        /**
         * 화면 갱신
         */
        refresh: function refresh() {
            this._renderDate();
        },

        /**
         * 주어진 날짜에 해당하는 dom요소를 반환
         * @param day
         * @returns {*}
         */
        findDateCell: function findDateCell(day) {
            return this.$calendar.find('.data-' + day.getFullYear() + '' + (day.getMonth() + 1) + '' + day.getDate());
        },

        /**
         * 입력요소를 활성화
         */
        enable: function enable() {
            var self = this;
            if (!self.options.isInline) {
                self.$input.disabled(false);
            }
            self.$el.disabled(false);
        },

        /**
         * 입력요소를 비활성화
         */
        disable: function disable() {
            var self = this;

            self.close();
            if (self.options.inputTarget) {
                self.$input.disabled(true);
            }
            self.$el.disabled(true);
        },

        /**
         * 날짜 변경
         * @param date
         */
        setDate: function setDate(date, options) {
            if (!date) {
                return;
            }
            var self = this;

            if (options) {
                self.options = $.extend(true, self.options, self.$el.data(), options);
                self._normalizeOptions();
            }

            try {
                if (dateUtil.isValid(date)) {
                    self.activeDate = dateUtil.parse(date);
                } else {
                    return;
                    //self.activeDate = new Date();
                }
                self.currDate = core.clone(self.activeDate);
                if (self.isShown) {
                    self.setCurrentDate(core.clone(self.currDate));
                }
            } catch (e) {
                throw new Error('Calendar#setDate(): 날짜 형식이 잘못 되었습니다.');
            }
            return this;
        },

        /**
         * 오늘날짜 변경
         * @param today
         */
        setToday: function setToday(today) {
            var self = this;

            if (!core.is(today, 'date')) {
                try {
                    self.options.today = core.date.parse(today);
                } catch (e) {
                    throw new Error('calendar#setToday: 날짜 형식이 잘못 되었습니다.');
                }
            }
            self._renderDate();
        },

        /**
         * 오늘날짜 반환
         * @returns {Date} 오늘날짜
         */
        getToday: function getToday() {
            return this.options.today;
        },

        /**
         * 현재 날짜를 반환
         * @returns {*}
         */
        getCurrentDate: function getCurrentDate() {
            return this.currDate;
        },

        /**
         * 이전달
         * @returns {Calendar}
         */
        prev: function prev() {
            var self = this,
                currDate = core.date.add(self.currDate, 'M', -1);
            if (self.options.header && self._compareMonth(currDate) !== 0) {
                return this;
            }
            self.currDate = currDate;
            self._renderDate();
            self.triggerHandler('calendarprevmonth', self.currDate);

            return this;
        },

        /**
         * 이전해
         * @return {scui.ui.Calendar}
         */
        prevYear: function prev() {
            var self = this,
                currDate = core.date.add(self.currDate, 'y', -1);
            if (self.options.header && core.date.compare(currDate, self.minDate) > 0) {
                currDate = core.clone(self.minDate);
            }
            self.currDate = currDate;
            self._renderDate();

            return this;
        },

        /**
         * 다음달
         * @returns {Calendar}
         */
        next: function next() {
            var self = this,
                currDate = core.date.add(self.currDate, 'M', 1);
            if (self.options.header && self._compareMonth(currDate) !== 0) {
                return this;
            }
            self.currDate = currDate;
            self._renderDate();
            self.triggerHandler('calendarnextmonth', self.currDate);

            return this;
        },
        /**
         * 다음해
         * @return {scui.ui.Calendar}
         */
        nextYear: function () {
            var self = this,
                currDate = core.date.add(self.currDate, 'y', 1);
            if (self.options.header && core.date.compare(currDate, self.minDate) < 0) {
                currDate = core.clone(self.maxDate);
            }
            self.currDate = currDate;
            self._renderDate();

            return this;
        },

        /**
         * 날짜 데이타 계산
         * @param {Date} date 렌더링할 날짜 데이타 생성
         * @return {Array}
         */
        _getDateList: function _getDateList(date) {
            date.setDate(1);

            var self = this,
                month = date.getMonth() + 1,
                year = date.getFullYear(),
                startOnWeek = date.getDay() + 1,
                last = daysInMonth[date.getMonth()],
                // 마지막날
                prevLast = daysInMonth[date.getMonth() === 0 ? 11 : date.getMonth() - 1],
                // 이전달의 마지막날
                startPrevMonth = prevLast - startOnWeek,
                // 이전달의 시작일
                y = year,
                m = month;

            if (month > 12) {
                month -= 12, year += 1;
            } else {
                if (month == 2 && self._isLeapYear(year)) {
                    last = 29;
                }
            }

            var data = [],
                week = [];

            if (startOnWeek > 0) {
                if (month == 3 && self._isLeapYear(year)) {
                    startPrevMonth += 1;
                }
                if ((m = month - 1) < 1) {
                    m = 12, y = year - 1;
                }
                for (var i = 1; i < startOnWeek; i++) {
                    week.push({year: y, month: m, day: startPrevMonth + i + 1}); // ***** +1
                }
                if (week.length > 6) {
                    data.push(week), week = [];
                }
            }

            for (var i = 1; i <= last; i++) {
                week.push({year: year, month: month, day: i});
                if (week.length > 6) {
                    data.push(week), week = [];
                }
            }

            if (week.length > 0 && week.length < 7) {
                if ((m = month + 1) > 12) {
                    m -= 12, y = year + 1;
                }
                for (var i = week.length, d = 1; i < 7; i++, d++) {
                    week.push({year: y, month: m, day: d});
                }
            }
            week.length && data.push(week);
            return data;
        },

        /**
         * 다음달
         * @returns {Calendar}
         */
        _enforceFocus: function _enforceFocus() {
            var self = this,
                isKeyDown = false;

            if (self.isInline) {
                return;
            }

            $doc.off('keydown.calendar keyup.calendar').on('keydown.calendar keyup.calendar', function (e) {
                isKeyDown = e.type === 'keydown';
            }).off('focusin.calendar').on('focusin.calendar', self.proxy(function (e) {
                if (!isKeyDown) {
                    return;
                }
                if (self.$calendar[0] !== e.target && !$.contains(self.$calendar[0], e.target)) {
                    self.$calendar.find('div:visible').find(':focusable').first().focus();
                    e.stopPropagation();
                }
            }));
        },

        /**
         * 윤년 여부
         * @param {Date} date 렌더링할 날짜 데이타 생성
         * @return {boolean} 윤년 여부
         */
        _isLeapYear: function _isLeapYear(year) {
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        }
    });

    return Calendar;
});

/*!
 * @module vcui.ui.Modal
 * @license MIT License
 * @description 모달 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/modal', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var $doc = $(document),
        $win = $(window),
        detect = core.detect,
        ui = core.ui,
        isTouch = detect.isTouch,
        isInFrame = (function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        })(),
        _zIndex = 9000;

    var ModalManager = {
        templates: {
            wrap: '<div class="ui_modal_wrap" style="position:' + (isInFrame ? 'absolute' : 'fixed') + ';top:0;left:0;right:0;bottom:0;overflow:auto;"></div>',
            dim: '<div class="ui_modal_dim" style="position:' + (isInFrame ? 'absolute' : 'fixed') + ';top:0;left:0;bottom:0;right:0;background:' + (isInFrame ? '#000' : '#000') + ';"></div>',
            modal: '<div class="ui_modal ui_modal_ajax" style="display:none"></div>'
        },
        options: {
            opacity: 0.2
        },
        init: function init(options) {
            var self = this;

            self.options = core.extend(self.options, options);
            self.stack = [];
            self.active = null;

            self._bind();
        },

        _bind: function _bind() {
            var self = this;

            $win.on('resizeend.modalmanager', function () {
                for (var i = -1, modal; modal = self.stack[++i];) {
                    modal.isShown && modal.center();
                }
            });

            $doc.on('modalshow.modalmanager', '.ui_modal_container', self._handleModalShow.bind(self))
                .on('modalhidden.modalmanager', '.ui_modal_container', self._handleModalHidden.bind(self))
                .on('modalhide.modalmanager', '.ui_modal_container', self._handleModalHide.bind(self))
                .on('focusin.modalmanager', self._handleFocusin.bind(self))
                .on('click.modalmanager', '[data-control=modal]', self._handleClick.bind(self))
                .on('click.modalmanager', '.ui_modal_dim', self._handleDimClick.bind(self));
        },
        _handleModalHide: function _handleModalHide(e) {
            var self = this,
                $modal = $(e.currentTarget),
                modal = $modal.vcModal('instance');

            // 모달이 전부 닫힐 때 document에 알린다.
            if (self.stack.length === 1) {
                $(document).triggerHandler('modallastbeforeclose');
            }
        },
        _handleModalShow: function _handleModalShow(e) {
            var self = this,
                $modal = $(e.currentTarget),
                modal = $modal.vcModal('instance'),
                zIndex = self.nextZIndex();

            if (!modal.$el.parent().hasClass('ui_modal_wrap')) {
                modal.$el.wrap(self.templates.wrap);
                modal.$el.before($(self.templates.dim).css('opacity', self.options.opacity));
            }
            modal.$el && modal.$el.parent().css('zIndex', zIndex++);

            self.active = modal;
            self.add(modal);
            if (self.stack.length === 1) {
                $(document).triggerHandler('modalfirstopen');
            }
        },
        _handleModalHidden: function _handleModalHidden(e) {
            var self = this,
                $modal = $(e.currentTarget),
                modal = $modal.vcModal('instance');

            modal.$el.siblings('.ui_modal_dim').remove();
            modal.$el.unwrap();
            self.revertZIndex();
            self.remove(modal);

            if (self.stack.length) {
                self.active = self.stack[self.stack.length - 1];
            } else {
                self.active = null;
                $(document).triggerHandler('modallastclose');
            }
        },
        _handleFocusin: function _handleFocusin(e) {
            var self = this;

            if (!self.active) {
                return;
            }
            if (self.active.$el[0] !== e.target && !$.contains(self.active.$el[0], e.target)) {
                self.active.$el.find(':focusable').first().focus();
                e.stopPropagation();
            }
        },
        _handleClick: function _handleClick(e) {
            e.preventDefault();

            var self = this,
                $el = $(e.currentTarget),
                target = $el.attr('href') || $el.attr('data-href'),
                $modal;

            if (target) {
                // ajax형 모달인 경우
                if (!/^#/.test(target)) {
                    if ($el.data('fetching')) {
                        return;
                    }

                    $el.data('fetching', true);
                    if (self.ajaxModalXHR) {
                        self.ajaxModalXHR.abort();
                        self.ajaxModalXHR = null;
                    }

                    self.ajaxModalXHR = $.ajax({
                        url: target
                    }).done(function (html) {
                        $modal = ModalManager.getRealModal(html);

                        $modal.addClass('ui_modal_ajax').hide().appendTo('body').vcModal(core.extend({
                            removeOnClose: true,
                            opener: $el[0]
                        }, $el.data())).on('modalhidden.modalmanager', function (e) {
                            $el[0].focus();
                            $modal.off('modalhidden.modalmanager');
                        });
                    }).always(function () {
                        self.ajaxModalXHR = null;
                        $el.removeData('fetching');
                    });
                } else {
                    // 인페이지 모달인 경우
                    $(target).vcModal(core.extend({}, $el.data())).vcModal('open').on('modalhidden.modalmanager', function (e) {
                        $el[0].focus();
                        $(this).off('modalhidden.modalmanager');
                    });
                }
            }
        },
        _handleDimClick: function _handleDimClick(e) {
            var $dim = $(e.currentTarget),
                $modal = $dim.siblings('.ui_modal_container');

            if ($modal.vcModal('getOption', 'closeByDimmed') === false) {
                return;
            }

            if ($dim.hasClass('ui_modal_dim')) {
                $dim.siblings('.ui_modal_container').vcModal('close');
            }
        },
        add: function add(modal) {
            this.stack.push(modal);
        },
        remove: function remove(modal) {
            this.stack = core.array.remove(this.stack, modal);
        },
        nextZIndex: function nextZIndex() {
            var zi = _zIndex;
            _zIndex += 2;
            return zi;
        },
        revertZIndex: function revertZIndex() {
            _zIndex -= 2;
        },
        getRealModal: function (html) {
            var $tmp = $(html),
                $modal;
            if ($tmp.length > 1) {
                for (var i = 0, len = $tmp.length; i < len; i++) {
                    if ($tmp[i].nodeType === Node.ELEMENT_NODE) {
                        return $tmp.eq(i).hide();
                    }
                }
            }
            return $tmp.hide();
        }
    };
    ModalManager.init();

    // Modal ////////////////////////////////////////////////////////////////////////////
    /**
     * 모달 클래스
     * @class
     * @name vcui.ui.Modal
     * @extends vcui.ui.View
     */
    var Modal = ui('Modal', /** @lends vcui.ui.Modal# */{
        bindjQuery: 'modal',
        defaults: {
            overlay: true,
            clone: true,
            closeByEscape: true,
            removeOnClose: false,
            closeByDimmed: true,
            draggable: true,
            dragHandle: 'header h1',
            show: true,
            fullMode: false,
            effect: 'fade', // slide | fade
            cssTitle: '.ui_modal_title',
            useTransformAlign: true,
            variableWidth: true,
            variableHeight: true
        },

        events: {
            'click button[data-role], a[data-role]': function clickButtonDataRole(e) {
                var self = this,
                    $btn = $(e.currentTarget),
                    role = $btn.attr('data-role') || '',
                    ev;

                e.preventDefault();

                if (role) {
                    self.trigger(ev = $.Event('modal' + role), [self]);
                    if (ev.isDefaultPrevented()) {
                        return;
                    }
                }

                this.close();
            },
            'click .ui_modal_close': function clickUi_modal_closeui_modal_close(e) {
                e.preventDefault();
                e.stopPropagation();

                this.close();
            }
        },
        /**
         * 생성자
         * @param {String|Element|jQuery} el
         * @param {Object} options
         * @param {Boolean}  options.overlay:true 오버레이를 깔것인가
         * @param {Boolean}  options.clone: true    복제해서 띄울 것인가
         * @param {Boolean}  options.closeByEscape: true    // esc키를 눌렀을 때 닫히게 할 것인가
         * @param {Boolean}  options.removeOnClose: false   // 닫을 때 dom를 삭제할것인가
         * @param {Boolean}  options.draggable: true                // 드래그를 적용할 것인가
         * @param {Boolean}  options.dragHandle: 'h1.title'     // 드래그대상 요소
         * @param {Boolean}  options.show: true                 // 호출할 때 바로 표시할 것인가...
         */
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }

            self.$el.addClass('ui_modal_container').attr('role', 'document');

            self.isShown = false;
            self.originalStyle = self.el.style;
            self._originalDisplay = self.$el.css('display');

            if (/[0-9]+px/.test(self.$el[0].style.left)) {
                self.options.variableWidth = false;
            }

            if (/[0-9]+px/.test(self.$el[0].style.top)) {
                self.options.variableHeight = false;
            }

            if (self.options.show) {
                setTimeout(function () {
                    core.util.waitImageLoad(self.$('img'), true).done(function () {
                        self.show();
                    });
                });
            }

            self._bindAria(); // aria 셋팅
        },

        _bindAria: function _bindAria() {
            var self = this;
            // TODO
            self.$el.attr({
                'role': 'dialog',
                'aria-hidden': 'false',
                'aria-describedby': self.$('section').attr('id') || self.$('section').attr('id', self.cid + '_content').attr('id'),
                'aria-labelledby': self.$('h1').attr('id') || self.$('h1').attr('id', self.cid + '_title').attr('id')
            });
        },
        /**
         * zindex때문에 모달을 body바로 위로 옮긴 후에 띄우는데, 닫을 때 원래 위치로 복구시켜야 하므로,
         * 원래 위치에 임시 홀더를 만들어 놓는다.
         * @private
         */
        _createHolder: function _createHolder() {
            var self = this;

            if (self.$el.parent().is('body')) {
                return;
            }

            self.$holder = $('<span class="ui_modal_holder" style="display:none;"></span>').insertAfter(self.$el);
            self.$el.appendTo('body');
        },
        /**
         * 원래 위치로 복구시키고 홀더는 제거
         * @private
         */
        _replaceHolder: function _replaceHolder() {
            var self = this;

            if (self.$holder) {
                self.$el.insertBefore(self.$holder);
                self.$holder.remove();
            }
        },

        getOpener: function getOpener() {
            return $(this.options.opener);
        },

        /**
         * 토글
         */
        toggle: function toggle() {
            var self = this;

            self[self.isShown ? 'hide' : 'show']();
        },

        /**
         * 표시
         */
        show: function show() {
            if (this.isShown) {
                this.layout();
                return;
            }

            var self = this,
                opts = self.options,
                showEvent = $.Event('modalshow');


            // 열릴때 body로 옮겼다가, 닫힐 때 다시 원복하기 위해 임시요소를 넣어놓는다.
            self._createHolder();
            self.trigger(showEvent);
            if (showEvent.isDefaultPrevented()) {
                self._replaceHolder();
                return;
            }

            self.isShown = true;
            self.layout();

            if (opts.title) {
                self.$(opts.cssTitle).html(opts.title || '알림');
            }

            var defer = $.Deferred();
            if (opts.effect === 'fade') {
                setTimeout(function () {
                    self.$el.stop().fadeIn('slow', function () {
                        defer.resolve();
                    });
                });
            } else if (opts.effect === 'slide') {
                self.$el.stop().css('top', -self.$el.height()).animate({top: '50%'}, function () {
                    defer.resolve();
                });
            } else {
                self.$el.show();
                defer.resolve();
            }

            defer.done(function () {
                self.layout();

                self.trigger('modalshown', {
                    module: self
                });

                //////$('body').attr('aria-hidden', 'true');    // body를 비활성화(aria)
                self._draggabled(); // 드래그 기능 빌드
                self._escape(); // esc키이벤트 바인딩
                ///////////me._enforceFocus();   // 탭키로 포커스를 이동시킬 때 포커스가 레이어팝업 안에서만 돌도록 빌드

                self.on('mousewheel DOMMouseScroll wheel', function (e) {
                    e.stopPropagation();
                });

                var $focusEl = self.$el.find('[data-autofocus=true]');

                // 레이어내에 data-autofocus를 가진 엘리먼트에 포커스를 준다.
                if ($focusEl.length > 0) {
                    $focusEl.eq(0).focus();
                } else {
                    // 레이어에 포커싱
                    self.$el.attr('tabindex', 0).focus();
                }

                var $focusEl = self.$('[data-autofocus=true]');
                if ($focusEl.length > 0) {
                    $focusEl.eq(0).focus();
                } else {
                    self.$el.attr('tabindex', 0).focus();
                }

                // 버튼
                /**************if (me.options.opener) {
                    var modalid;
                    if (!(modalid = me.$el.attr('id'))) {
                        modalid = 'modal_' + core.getUniqId(16);
                        me.$el.attr('id', modalid);
                    }
                    $(me.options.opener).attr('aria-controls', modalid);
                }**********/
            });
        },

        /**
         * 숨김
         */
        hide: function hide(e) {
            if (e) {
                e.preventDefault();
            }

            var self = this;
            var isAjaxModal = self.$el.hasClass('ui_ajax_modal');

            e = $.Event('modalhide');
            self.trigger(e);
            if (!self.isShown || e.isDefaultPrevented()) {
                return;
            }

            var defer = $.Deferred();
            self.isShown = false;
            if (self.options.effect === 'fade') {
                self.$el.fadeOut('fast', function () {
                    defer.resolve();
                });
            } else if (self.options.effect === 'slide') {
                self.$el.animate({
                    top: -self.$el.outerHeight()
                }, function () {
                    defer.resolve();
                });
            } else {
                self.$el.hide();
                defer.resolve();
            }

            defer.done(function () {
                self.trigger('modalhidden');

                self._escape(); // esc 키이벤트 제거
                self._replaceHolder(); // body밑으로 뺀 el를 다시 원래 위치로 되돌린다.

                if (self.options.removeOnClose) {
                    self.$el.remove(); // 닫힐 때 dom에서 삭제하도록 옵션이 지정돼있으면, dom에서 삭제한다.
                }
                if (self.options.opener) {
                    $(self.options.opener).removeAttr('aria-controls').focus();    // 레이어팝업을 띄운 버튼에 포커스를 준다.
                }
                //:if (self.$overlay) {
                //:    self.$overlay.remove(), self.$overlay = null;    // 오버레이를 제거
                //:}
                ////// $('body').removeAttr('aria-hidden');    // 비활성화를 푼다.
                if (isAjaxModal) {
                    self.destroy();
                }
            });
        },

        _scrollHeight: function () {
            var self = this;
            var scrollHeight = Math.round(self.$el.css('min-height', '').prop('scrollHeight'));
            if (scrollHeight % 2 !== 0) {
                scrollHeight += 1;
            }
            return scrollHeight;
        },

        /**
         * 도큐먼트의 가운데에 위치하도록 지정
         */
        layout: function layout() {
            if (!this.isShown) {
                return;
            }

            var self = this,
                width,
                height,
                css,
                isOverHeight,
                isOverWidth,
                winHeight = core.dom.getWinHeight(),
                winWidth = core.dom.getWinWidth(),
                scrollHeight = self._scrollHeight();

            width = self.$el.outerWidth();
            height = self.$el.outerHeight();
            isOverHeight = height > winHeight;
            isOverWidth = width > winWidth;
            css = {
                //display: 'block',
                position: 'absolute',
                //backgroundColor: '#ffffff',
                outline: 'none',
                minHeight: scrollHeight,
                backgroundClip: 'padding-box'//,
                //top: top = isOverHeight ? '0%' : '50%'//,
                //left: left = isOverWidth ? '0%' : '50%'
            };

            css.transform = '';
            if (self.options.variableWidth !== false) {
                css.left = isOverWidth ? '0%' : '50%';
                if (self.options.useTransformAlign) {
                    css.transform += 'translateX(-' + css.left + ') ';
                } else {
                    css.marginLeft = isOverWidth ? '' : Math.ceil(width / 2) * -1;
                }
            }

            if (self.options.variableHeight !== false) {
                if (self.options.alignTop) {
                    css.top = '0%';
                } else {
                    css.top = isOverHeight ? '0%' : '50%';
                    if (self.options.useTransformAlign) {
                        css.transform += 'translateY(-' + css.top + ') ';
                    } else {
                        css.marginTop = isOverHeight ? '' : Math.ceil(height / 2) * -1;
                    }
                }
            }

            self.$el.stop().css(css);
        },

        /**
         * 타이틀 영역을 드래그기능 빌드
         * @private
         */
        _draggabled: function _draggabled() {
            var self = this,
                options = self.options;

            if (!options.draggable || self.bindedDraggable) {
                return;
            }
            self.bindedDraggable = true;

            if (options.dragHandle) {
                self.$el.css('position', 'absolute');
                core.css3.prefix('user-select') && self.$(options.dragHandle).css(core.css3.prefix('user-select'), 'none');
                self.on('mousedown touchstart', options.dragHandle, function (e) {
                    e.preventDefault();

                    var isMouseDown = true,
                        pos = self.$el.position(),
                        oriPos = {
                            left: e.pageX - pos.left,
                            top: e.pageY - pos.top
                        },
                        _handler;

                    $doc.on(self.makeEventNS('mousemove mouseup touchmove touchend touchcancel'), _handler = function handler(e) {
                        switch (e.type) {
                            case 'mousemove':
                            case 'touchmove':
                                if (!isMouseDown) {
                                    return;
                                }
                                self.$el.css({
                                    left: e.pageX - oriPos.left,
                                    top: e.pageY - oriPos.top
                                });
                                break;
                            case 'mouseup':
                            case 'touchend':
                            case 'touccancel':
                                isMouseDown = false;
                                $doc.off(self.getEventNS(), _handler);
                                break;
                        }
                    });
                });

                self.$(options.dragHandle).css('cursor', 'move');
            }
        },

        /**
         * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
         * @private
         */
        _enforceFocus: function _enforceFocus() {
            if (!isTouch) {
                return;
            }
            var self = this;
            var $focusEl = self.$el.find('[data-autofocus=true]');

            // 레이어내에 data-autofocus를 가진 엘리먼트에 포커스를 준다.
            if ($focusEl.length > 0) {
                $focusEl.eq(0).focus();
            } else {
                // 레이어에 포커싱
                self.$el.attr('tabindex', 0).focus();
            }

            $doc.off('focusin' + self.getEventNS()).on('focusin' + self.getEventNS(), self.proxy(function (e) {
                if (self.$el[0] !== e.target && !$.contains(self.$el[0], e.target)) {
                    self.$el.find(':focusable').first().focus();
                    e.stopPropagation();
                }
            }));
        },

        /**
         * esc키를 누를 때 닫히도록
         * @private
         */
        _escape: function _escape() {
            if (isTouch) {
                return;
            }
            var self = this;

            if (self.isShown && self.options.closeByEscape) {
                self.docOff('keyup');
                self.docOn('keyup', function (e) {
                    if (e.which === 27) {
                        e.stopPropagation();
                        self.hide();
                    }
                });
            } else {
                self.docOff('keyup');
            }
        },

        /**
         * 모달의 사이즈가 변경되었을 때 가운데위치를 재조절
         * @example
         * $('...').modal(); // 모달을 띄운다.
         * $('...').find('.content').html( '...');  // 모달내부의 컨텐츠를 변경
         * $('...').modal('center');    // 컨텐츠의 변경으로 인해 사이즈가 변경되었으로, 사이즈에 따라 화면가운데로 강제 이동
         */
        center: function center() {
            this.layout();
        },

        /**
         * 열기
         */
        open: function open() {
            this.show();
        },

        /**
         * 닫기
         */
        close: function close() {
            this.hide();
        },

        /**
         *
         */
        destroy: function destroy() {
            var self = this;

            self.supr();
        }
    });

    /**
     * 열려 있는 레이어팝업을 가운데에 위치시키는 글로벌이벤트
     * @example
     * vcui.PubSub.trigger('resize:modal')
     */
    /*core.PubSub.on('resize:modal', function() {
     if(Modal.active){
     Modal.active.center();
     }
     });*/

    //윈도우가 리사이징 될때 가운데에 자동으로 위치시킴
    /*$(window).on('resize.modal', function() {
     if(Modal.active){
     Modal.active.center();
     }
     });*/

    core.modal = function (el, options) {
        $(el).vcModal(options);
    };

    /**
     * @class
     * @name vcui.ui.AjaxModal
     * @description ajax로 불러들인 컨텐츠를 모달로 띄워주는 모듈
     * @extends vcui.ui.View
     */
    var fetchingUrls = {};
    core.ui.ajaxModal = function (ajaxOptions, options) {
        if (typeof ajaxOptions === 'string') {
            ajaxOptions = {
                url: ajaxOptions
            };
        }

        if (!options) {
            options = {};
        }

        if (!options.opener) {
            if ($(document.activeElement).is('a, button')) {
                options.opener = document.activeElement;
            } else {
                options.opener = document.body;
            }
        }

        if (fetchingUrls[ajaxOptions.url]) {
            return fetchingUrls[ajaxOptions.url];
        }

        fetchingUrls[ajaxOptions.url] = $.ajax(ajaxOptions).then(function (html) {
            var $modal = ModalManager.getRealModal(html).appendTo('body').data('removeOnClose', true);
            return $modal.vcModal(core.extend({}, options, {
                removeOnClose: true,
                events: {
                    modalshown: function () {
                        delete fetchingUrls[ajaxOptions.url];
                    },
                    modalhidden: function () {
                        $(options.opener).focus();
                    }
                }
            }));
        });

        return fetchingUrls[ajaxOptions.url];
    };

    core.ui.alert = function () {
        /**
         * 얼럿레이어
         * @memberOf vcui.ui
         * @name alert
         * @function
         * @param {string} msg 얼럿 메세지
         * @param {Object} options 모달 옵션
         * @example
         * vcui.ui.alert('안녕하세요');
         */
        return function (msg, options) {
            if (typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            }
            var el = $(core.ui.alert.tmpl).appendTo('body').find('div.ui_modal_content').html(msg).end();
            var modal = $(el).vcModal(core.extend({removeOnClose: true}, options)).vcModal('instance');
            modal.getElement().buildUIControls();
            modal.on('modalhidden', function () {
                el = null;
                modal = null;
            });
            return modal;
        };
    }();
    core.ui.alert.tmpl = ['<div class="layer_popup small ui_alert" role="alert" style="display:none">', '<h1 class="title ui_modal_title">알림창</h1>', '<div class="cntt">', '<div class="ui_modal_content">&nbsp;</div>', '<div class="wrap_btn_c">', '<button type="button" class="btn_emphs_small" data-role="ok"><span><span>확인</span></span></button>', '</div>', '</div>', '<button type="button" class="ui_modal_close"><span>닫기</span></button>', '<span class="shadow"></span>', '</div>'].join('');
    ///////////////////////////////////////////////////////////////////////////////////////

    return Modal;
});
/*!
 * @module vcui.ui.Scrollview
 * @license MIT License
 * @description 커스텀스크롤 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/scrollview', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    $.easing.smooth = function (x, t, b, c, d) {
        var ts = (t /= d) * t,
            tc = ts * t;
        return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
    };

    var cssTransform = core.css3.prefix('transform');
    var isTouch = core.detect.isTouch;


    var Scrollview = core.ui('Scrollview', {
        bindjQuery: 'scrollview',
        selectors: {
            wrapper: '>.scroll_inner',
            vscrollbar: '>.scroll_track>.scroll_bar'
        },
        defaults: {
            duration: 600,
            speedLimit: 1.2,
            moveThreshold: 100,
            offsetThreshold: 30,
            startThreshold: 5,
            acceleration: 0.1,
            accelerationT: 250,
            watch: true,
            watchInterval: 400,
            preventScroll: true
        },
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self.maxScrollY = 0;
            self.scrollHeight = 0;
            self.wrapperHeight = 0;
            self.visibleScroll = false;

            if (self.$vscrollbar.length === 0) {
                // 스크롤바가 없으면 자동 생성해 준다.
                self.$vscrolltrack = $('<div class="scroll_track"><div class="scroll_bar"></div></div>');
                self.$vscrollbar = self.$vscrolltrack.children();
                self.$el.append(self.$vscrollbar.parent());
            }

            self.scrollbarStyle = self.$vscrollbar[0].style;
            self.scrollbarStyle.display = 'none';
            self.$vscrollbar.css('transition', 'transform 0.1s');

            //me.$el.addClass('strack');
            //self.$el.attr('tabindex', 0);
            self._bindEvents();
        },

        _bindEvents: function _bindEvents() {
            var self = this;

            if (self.$vscrollbar.length) {
                self.$wrapper.on('scroll', function () {
                    var rate = (self.wrapperHeight - self.scrollbarHeight) / (self.scrollHeight - self.wrapperHeight);
                    self._moveScrollbar(self.$wrapper[0].scrollTop * rate);
                });

                if (self.options.watch === true) {
                    // 사이즈 변화 감시
                    var totalTime = 0,
                        dur = self.options.watchInterval;
                    self.updateTimer = setInterval(function () {
                        if (!self.$el) {
                            clearInterval(self.updateTimer);
                            return;
                        }

                        if (!self.$el.is(':visible')) {
                            return;
                        }

                        // 40초에 한번씩 dom에서 제거 됐건지 체크해서 타이머를 멈춘다.
                        if (totalTime > 40000) {
                            totalTime = 0;
                            if (!$.contains(document, self.$el[0])) {
                                clearInterval(self.updateTimer);
                                self.updateTimer = null;
                                return;
                            }
                        } else {
                            totalTime += dur;
                        }
                        self.update();
                    }, dur);
                }
            }
        },

        _watchStart: function _watchStart() {
            var self = this;
        },
        /**
         * 터치기반 디바이스에서 터치로 컨텐츠를 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindContentScroll: function _bindContentScroll() {
            var self = this,
                times = {},
                multiplier = 1,
                dom = core.dom,
                distance,
                startY,
                startX,
                acc,
                scrollableY,
                wrapHeight,
                maxScrollY,
                startScrollTop,
                pos,
                isScrolling;

            self.on('touchstart touchmove touchend touchcancel', function (e) {
                var isMove, touchTime, maxOffset, offset, scrollTop, duration, pointY;
                times[e.type] = e.timeStamp;

                pos = dom.getEventPoint(e);
                pointY = pos.y;
                switch (e.type) {
                    case 'touchstart':
                        wrapHeight = self.wrapperHeight;
                        maxScrollY = self.$wrapper[0].scrollHeight - wrapHeight;
                        scrollableY = maxScrollY > 0;

                        if (!scrollableY) {
                            return;
                        }

                        startScrollTop = self.$wrapper[0].scrollTop;
                        startX = pos.x;
                        startY = pos.y;
                        multiplier = 1;
                        isScrolling = false;

                        if (self.$wrapper.is(":animated") && times['touchstart'] - times['touchend'] < self.options.accelerationT) {
                            multiplier += self.options.acceleration;
                        } else {
                            multiplier = 1;
                        }

                        self.$wrapper.stop(true, false).data('scrollTop', self.$wrapper.scrollTop());

                        break;
                    case 'touchmove':
                        if (!isScrolling && Math.abs(startX - pos.x) > Math.abs(startY - pos.y)) {
                            scrollableY = false;
                        }
                        if (!scrollableY) {
                            return;
                        }

                        if (self.options.preventScroll) {
                            e.preventDefault();
                        } else {
                            if (startY < pointY && startScrollTop === 0) {
                                return;
                            }
                            if (startY > pointY && startScrollTop === maxScrollY) {
                                return;
                            }
                            e.preventDefault();
                        }

                        distance = startY - pointY;
                        acc = Math.abs(distance / (times['touchmove'] - times['touchstart']));
                        scrollTop = self.$wrapper.data('scrollTop') + distance;
                        duration = 0;
                        multiplier = 1;
                        isScrolling = true;

                        if (scrollTop < 0) {
                            scrollTop = 0;
                        } else if (scrollTop > maxScrollY) {
                            scrollTop = maxScrollY;
                        }
                        self.$wrapper.stop(true, false).scrollTop(scrollTop);

                        e.stopPropagation();
                        break;
                    case 'touchend':
                    case 'touchcancel':
                        if (!scrollableY || !isScrolling) {
                            return;
                        }
                        isMove = Math.abs(startY - pointY) > self.options.startThreshold;
                        if (isMove) {
                            touchTime = times['touchend'] - times['touchmove'];
                            maxOffset = wrapHeight * self.options.speedLimit;
                            offset = Math.pow(acc, 2) * wrapHeight;
                            offset = offset > maxOffset ? maxOffset : multiplier * offset;
                            offset = multiplier * offset * (distance < 0 ? -1 : 1);

                            if (touchTime < self.options.moveThreshold && offset != 0 && Math.abs(offset) > self.options.offsetThreshold) {
                                scrollTop = self.$wrapper.data('scrollTop') + distance + offset;
                                duration = self.options.duration;

                                if (scrollTop < 0) {
                                    scrollTop = 0;
                                } else if (scrollTop > maxScrollY) {
                                    scrollTop = maxScrollY;
                                }

                                self.$wrapper.stop(true, false).animate({
                                    scrollTop: scrollTop
                                }, {
                                    duration: duration,
                                    easing: 'smooth',
                                    complete: function complete() {
                                        multiplier = 1;
                                    }
                                });
                            }
                        }
                        break;
                }
            });
        },

        /**
         * pc에서 상하키로 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindKeys: function _bindKeys() {
            var self = this;

            self.on('keydown', function (e) {
                var keyCode = e.keyCode || e.which,
                    wrapperHeight = self.$wrapper.innerHeight(),
                    scrollTop = self.$wrapper.prop('scrollTop'),
                    maxScrollY = self.$wrapper.prop('scrollHeight') - wrapperHeight,
                    newY;

                switch (keyCode) {
                    case 38:
                        // up
                        e.preventDefault();
                        if (scrollTop <= 0) {
                            return;
                        }
                        newY = scrollTop - wrapperHeight;
                        break;
                    case 40:
                        // down
                        e.preventDefault();
                        if (scrollTop >= maxScrollY) {
                            return;
                        }
                        newY = scrollTop + wrapperHeight;
                        break;
                    default:
                        return;
                }
                if (newY) {
                    self.$wrapper.stop(true, false).animate({
                        scrollTop: newY
                    }, {
                        duration: self.options.duration,
                        easing: 'smooth'
                    });
                }
            });
        },

        /**
         * pc에서 스크롤바로 컨텐츠를 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindScrollbar: function _bindScrollbar() {
            var self = this,
                $doc = $(document),
                currY,
                downY,
                moveY;

            function getY(e) {
                if (isTouch && e.originalEvent.touches) {
                    e = e.originalEvent.touches[0];
                }
                return e.pageY;
            }

            self.$vscrollbar.on('mousedown touchstart', function (e) {
                e.preventDefault();
                if (isTouch) {
                    e.stopPropagation();
                }

                self.isMouseDown = true;
                currY = core.css3.position(self.$vscrollbar).y;
                downY = getY(e);

                self.docOn('mouseup mousecancel touchend mousemove.' + self.cuid + ' touchmove touchcancel', function (e) {
                    if (!self.isMouseDown) {
                        self.docOff();
                        return;
                    }

                    switch (e.type) {
                        case 'mouseup':
                        case 'touchend':
                        case 'mousecancel':
                        case 'touchcancel':
                            self.isMouseDown = false;
                            if (!self.isScrollbarActive) {
                                self.$vscrollbar.removeClass('active');
                            }
                            moveY = 0;
                            self.docOff();
                            break;
                        case 'mousemove':
                        case 'touchmove':
                            moveY = getY(e);

                            var top = currY - (downY - moveY),
                                scrollHeight = self.wrapperHeight - self.scrollbarHeight,
                                y;

                            self.scrollbarStyle.top = top = Math.max(0, Math.min(top, scrollHeight));
                            y = (self.scrollHeight - self.wrapperHeight) * (top / scrollHeight);
                            self.$wrapper.scrollTop(y);
                            e.preventDefault();
                            break;
                    }
                });
                return false;
            }).on('mouseenter mouseleave', function (e) {
                self.isScrollbarActive = e.type === 'mouseenter';
                self.$vscrollbar.toggleClass('active', self.isScrollbarActive || self.isMouseDown);
            });
        },

        /**
         * pc에서 마우스로 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindWheel: function _bindWheel() {
            var self = this;
            self.$wrapper.on('mousewheel DOMMouseScroll wheel', function (ev) {
                var e = ev.originalEvent;
                var delta = core.dom.getDeltaY(e) * 100,
                    scrollTop = self.$wrapper[0].scrollTop;

                self.$wrapper.scrollTop(scrollTop - delta); // -: down +: up
                if (self.options.preventScroll) {
                    ev.preventDefault();
                    ev.stopPropagation();
                } else {
                    if (self.$wrapper[0].scrollTop != scrollTop) {
                        ev.preventDefault();
                        ev.stopPropagation();
                    }
                }
            });
        },

        /**
         * 스크롤바를 움직여주는 함수
         * @param top
         * @param height
         * @private
         */
        _moveScrollbar: function _moveScrollbar(top, height) {
            var self = this;

            if (!self.visibleScroll) {
                return;
            }
            if (isNaN(top)) {
                top = 0;
            }
            if (height !== undefined && self.scrollbarHeight != height) {
                height = Math.max(height, 18);
                self.scrollbarStyle.height = height + 'px';
                self.scrollbarHeight = height;
            } else {
                height = self.scrollbarHeight;
            }
            if (self.wrapperHeight < height + top) {
                top = self.wrapperHeight - height;
            }
            if (core.css3.support) {
                self.scrollbarStyle[cssTransform] = 'translate(0px, ' + top + 'px)';
            } else {
                self.scrollbarStyle.top = top + 'px';
            }
        },

        /**
         * 사이즈 변화에 따른 UI 갱신
         */
        update: function update() {
            var self = this,
                wrapperHeight,
                scrollHeight,
                visibleScroll,
                scrollbarHeight,
                rate;

            if (!self.el || !self.$el.is(':visible') || !self.$wrapper || !self.$wrapper[0]) {
                return;
            }

            wrapperHeight = self.$wrapper[0].offsetHeight;
            if (wrapperHeight === 0) {
                self.wrapperHeight = 0;
                return;
            }

            scrollHeight = self.$wrapper[0].scrollHeight;
            visibleScroll = wrapperHeight < scrollHeight - 1;
            if (visibleScroll && !self._bindedEventOver) {
                self._bindedEventOver = true;
                // 실질적으로 컨텐츠가 래퍼를 오버했을 때만 스크롤을 붙인다.
                if (isTouch) {
                    self._bindContentScroll();
                } else {
                    self._bindScrollbar();
                    self._bindKeys();
                    self._bindWheel();
                }
            }
            // 160217 - 영역보다 내용이 작을 경우 스크롤바 감추기
            self.scrollbarStyle.display = visibleScroll ? '' : 'none';
            if (visibleScroll !== self.visibleScroll) {
                self.visibleScroll = visibleScroll;
                self.$el.toggleClass('track_visible', visibleScroll);
            }
            if (visibleScroll && (scrollHeight !== self.scrollHeight || wrapperHeight !== self.wrapperHeight)) {
                self.wrapperHeight = wrapperHeight;
                self.scrollHeight = scrollHeight;
                self.scrollRate = wrapperHeight / scrollHeight;
                rate = (self.wrapperHeight - self.scrollbarHeight) / (self.scrollHeight - self.wrapperHeight);
                self._moveScrollbar(self.$wrapper[0].scrollTop * rate, wrapperHeight * self.scrollRate);
            }
        },

        /**
         * scrollTop 설정
         * @param top
         * @returns {*}
         */
        scrollTop: function scrollTop(top) {
            var self = this;
            if (arguments.length > 0) {
                self.$wrapper.scrollTop(top);
                self.update();
            } else {
                return self.$wrapper.scrollTop();
            }
        },

        destroy: function destroy() {
            var self = this;

            self.updateTimer && (clearInterval(self.updateTimer), self.updateTimer = null);
            self.$wrapper.off();
            self.$vscrollbar.off();
            self.supr();
        }
    });

    return Scrollview;
});
/*!
 * @module vcui.ui.Selectbox
 * @license MIT License
 * @description 모달 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/selectbox', ['jquery', 'vcui', 'helper/gesture'], function ($, core, Gesture) {
    "use strict";

    var $doc = $(document),
        $win = $(window),
        isTouch = core.detect.isTouch;

    var BaseSelectbox = core.ui.View.extend({
        name: 'Selectbox',
        templates: {
            notextOption: '<span class="ui-select-text"></span><span class="hide"></span><span class="ico"></span>',
            labelOption: '<span class="ui-select-text" _style="text-overflow: ellipsis;' + 'width: 100%;display: inline-block;overflow: hidden;">{{text}}</span><span class="hide">선택됨</span><span class="ico"></span>'
        },
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }

            if (self.$el.attr('data-class') && self.$el.attr('data-class').indexOf('read') > -1) {
                self.$el.prop('readonly', true);
            }

            self.originalDisplay = self.$el.css('display');
        },
        _options: function _options(cb) {
            core.each(core.toArray(this.el.options), cb);
        },

        _isDeactive: function _isDeactive() {
            var self = this;
            return self.$el.prop('disabled') || self.$el.prop('readonly') === true;
        },

        /**
         * @param option
         * @param type
         * @returns {*}
         * @private
         */

        _itemHTML: function _itemHTML(option, type) {
            var self = this;

            if (!option) {
                return self.tmpl('notextOption');
            }
            if (type === 'label') {
                return self.tmpl('labelOption', option);
            } else {
                return option.text;
            }
        },

        selectedIndex: function selectedIndex(index, trigger) {
            if (arguments.length === 0) {
                return this.el.selectedIndex;
            } else {
                if (this.el.options.length === 0) {
                    return;
                }

                var e = $.Event('beforechange');
                this.$el.trigger(e);
                if (e.isDefaultPrevented()) {
                    return;
                }

                this.el.selectedIndex = index;
                if (trigger !== false) {
                    this.$el.trigger('change', {selectedIndex: this.el.selectedIndex});
                } else {
                    this._updateLabel();
                }
            }
        },
        value: function value(val, trigger) {
            var self = this;
            if (arguments.length === 0) {
                return self.el.value;
            } else {
                if (/*self._isDeactive() ||*/self.el.options.length === 0) {
                    return;
                }
                this._options(function (option, i) {
                    if (option.value === val + "") {
                        self.selectedIndex(i, trigger);
                        return false;
                    }
                });
            }
        },
        text: function text(txt, trigger) {
            var self = this;
            if (arguments.length === 0) {
                return this.el.value;
            } else {
                if (/*self._isDeactive() || */self.el.options.length === 0) {
                    return;
                }
                this._options(function (option, i) {
                    if (option.text === txt + "") {
                        self.selectedIndex(i, trigger);
                        return false;
                    }
                });
            }
        },
        selectedOption: function selectedOption() {
            return this.el.options[this.el.selectedIndex];
        },

        /**
         * 레이블 갱신
         * @param index
         * @private
         */
        _updateLabel: function _updateLabel(index) {
            var self = this,
                isActive = !self._isDeactive(),
                $label = self.$label.children(),
                isReadonly = self.$el.hasClass('read') || self.$el.prop('readonly') === true,
                isDisabled = self.$el.prop('disabled');

            index = typeof index === 'undefined' ? self.el.selectedIndex : index;
            if (index < 0 && self.el.options.length > 0) {
                self.el.selectedIndex = index = 0;
            }
            self.attrTitle = self.$el.attr('title') || self.$el.attr('data-title');

            self.$selectbox.toggleClass('read', isReadonly && !isDisabled).toggleClass('disabled', isDisabled).toggleClass('warn', self.$el.is('[data-class*=warn]'));

            $label.attr('title', self.attrTitle + ' 열기').find('.hide').text(isActive ? '선택됨' : '선택불가');

            $label.html(self._itemHTML(index < 0 ? null : self.el.options[index], 'label'));
            if (isActive) {
                $label.removeAttr('tabindex');
            } else {
                if (self.$el.prop('disabled')) {
                    $label.attr('tabindex', -1);
                }
            }
        },

        update: function update(list, selectedValue) {
            var self = this;

            if (/*self._isDeactive() ||*/!list) {
                return;
            }
            if (core.is(list, 'array')) {
                // list 값이 있으면 select를 갱신시킨다.
                self.el.options.length = 0;
                core.each(list, function (item, i) {
                    if ('text' in item) {
                        var option = new Option(item.text || item.value, item.value);
                        if (item.data) {
                            $(option).attr('data-info', item.data);
                        }
                        self.el.options.add(option);
                    } else {
                        core.each(item, function (txt, val) {
                            var option = new Option(txt, val);
                            self.el.options.add(option);
                            return false;
                        });
                    }
                });
            } else if (core.is(list, 'json')) {
                self.el.options.length = 0;
                core.each(list, function (key, value) {
                    self.el.options.add(new Option(key, value));
                });
            }

            if (selectedValue) {
                self.el.value = selectedValue;
            }
        },

        /**
         * 셀렉트박스 UI 표시
         */
        show: function show() {
            this.display = true;
            this.$selectbox.toggle(this.display);
        },

        /**
         * 셀렉트박스 UI 숨김
         */
        hide: function hide() {
            this.display = false;
            this.$selectbox.toggle(this.display);
        },

        /**
         * 셀렉트박스 UI 토글링
         * @param {Boolean} flag 표시 여부
         */
        toggle: function toggle(flag) {
            if (arguments.length === 0) {
                flag = !this.display;
            }
            this.display = flag;
            this.$selectbox.toggle(this.display);
        },

        readonly: function readonly(flag) {
            this.$el.toggleClass('read', flag).prop('readonly', flag);
            this.update();
        },
        disabled: function disabled(flag) {
            this.$el.toggleClass('disabled', flag).prop('disabled', flag);
            this.update();
        }
    });

    //Selectbox////////////////////////////////////////////////////////////////////////////
    /**
     * 커스텀 셀렉트박스<br />
     *
     * @class
     * @name vcui.ui.Selectbox
     * @extends vcui.ui.View
     */
    var CustomSelectbox = core.ui('CusomtSelectbox', BaseSelectbox, {
        //bindjQuery: 'selectbox',
        $statics: {
            ON_CHANGED: 'selectboxchanged'
        },
        defaults: {
            classSort: ['sup', 'cnum', 'cname'],
            allowScrollbar: true,
            containerMargin: 2,
            where: 'inline',
            wrapClasses: '',
            disabledClass: 'disabled'
        },

        templates: {
            label: '<div class="ui-selectbox-view"><a href="#0" class="ui-select-button" title="" role="button">{{#raw html}}</a></div>',
            list: '<div class="ui-selectbox-list" id="{{cid}}_menu" role="listbox"><div class="ui-select-scrollarea"></div></div>',
            scrollbar: '<div class="ui-select-scrolltrack" style="position:absolute;top:0;bottom:0;right:0;"><div class="ui-select-scrollbar" style="position:absolute;"></div></div>',
            option: '<li role="option"><a href="#{{num}}" data-value="{{value}}" data-text="{{text}}" title="{{attrTitle||text}}">{{#raw html}}</a></li>'
        },
        /**
         * 생성자
         * @param {string|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} [options] 옵션값
         * @param {string} [options.wrapClasses = ''] wrap 클래스명
         * @param {string} [options.disabledClass = 'disabled'] disabled 클래스명
         */
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }

            self.display = self.$el.css('display') !== 'none';
            self.$el.hide();

            self._create();
            self.update();
        },

        /**
         * select 컨트롤을 기반으로 UI DOM 생성
         * @private
         */
        _create: function _create() {
            var self = this,
                cls = self.$el.attr('data-class') || 'ui-selectbox-wrap',
                elId = !self.options.id ? '' : ' id="' + self.options.id + '"';

            self.originalWidth = parseInt(self.$el.css('width'), 10) + 22;
            self.attrTitle = self.options.title || self.$el.attr('title') || '셀렉트박스';
            if (self.options.wrapClasses) {
                cls = cls + ' ' + self.options.wrapClasses;
            }

            // 셀렉트박스
            self.$selectbox = $('<div class="' + cls + '" ' + elId + '></div>');
            if (!self.options.widthClass) {
                self.$selectbox.css('width', self.originalWidth);
            } else {
                self.$selectbox.addClass(self.options.widthClass);
            }
            self.$selectbox.insertAfter(self.$el);
            self.$selectbox.attr('role', 'selectbox').aria({
                'haspopup': 'true',
                'expanded': 'false',
                'controls': self.cid + '_menu',
                'labelledby': self.cid + '_button'
            });

            if (self.originalDisplay === 'none') {
                self.$selectbox.hide();
            }

            self._createLabel();
            self._createList();
            self._bindEvents();
        },

        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function _bindEvents() {
            var self = this;
            var timer;
            //
            self.on('selectboxopen selectboxclose', function (e) {
                if (self._isDeactive()) {
                    return;
                }

                var isOpen = e.type === 'selectboxopen';

                self.$selectbox.toggleClass('on', isOpen);
                self.$el.closest('div.select_wrap').toggleClass('on', isOpen);

                if (isOpen) {
                    self._reposition();
                    self.$list.show();

                    self._refreshScroll();
                    self._scrollToItem();

                    $doc.on('touchstart.selectbox' + self.cid + ' mousedown.selectbox' + self.cid, function (e) {
                        if (!$.contains(self.$selectbox[0], e.target)) {
                            clearTimeout(timer), timer = null;
                            self.close();
                        }
                    });

                    Selectbox.active = self;
                } else {
                    self.$list.hide();
                    Selectbox.active = null;
                    clearTimeout(timer), timer = null;
                    $doc.off('.selectbox' + self.cid);
                }
                self.isShown = isOpen;
                self.$label.find('.ui-select-button').attr('title', self.attrTitle + (isOpen ? ' 닫기' : ' 열기'));
            });

            self.$el.on('change', function () {
                self._updateLabel(this.selectedIndex);
            });

            // 비터치 기반일 때에 대한 이벤트 처리
            if (!isTouch) {
                // 셀렉트박스에서 포커스가 벗어날 경우 자동으로 닫히게
                self.$selectbox.on('mouseenter.selectbox mouseleave.selectbox ' + 'focusin.selectbox focusout.selectbox', function (e) {
                    clearTimeout(timer), timer = null;
                    if (self.$el.prop('disabled')) {
                        return;
                    }
                    if (e.type === 'mouseenter' || e.type === 'focusin') {
                        self.$selectbox.addClass('active');
                    } else if (e.type === 'mouseleave' || e.type === 'focusout') {
                        self.$selectbox.removeClass('active');
                        if (e.type === 'focusout' && self.$selectbox.hasClass('on')) {
                            timer = setTimeout(function () {
                                self.close();
                            }, 200);
                        }
                    }
                }).on('keydown', 'a', function (e) {
                    switch (e.keyCode) {
                        case core.keyCode.ESCAPE:
                            e.preventDefault();
                            e.stopPropagation();
                            self.close();
                            self.$label.find('a').focus();
                            break;
                        case core.keyCode.LEFT:
                        case core.keyCode.RIGHT:
                            e.preventDefault();
                            break;
                        case core.keyCode.PAGE_DOWN:
                            e.preventDefault();
                            activeItem(5);
                            break;
                        case core.keyCode.PAGE_UP:
                            e.preventDefault();
                            activeItem(-5);
                            break;
                        case core.keyCode.DOWN:
                            e.preventDefault();
                            activeItem(1);
                            break;
                        case core.keyCode.UP:
                            e.preventDefault();
                            activeItem(-1);
                            break;
                        case core.keyCode.HOME:
                        case core.keyCode.END:
                            e.preventDefault();
                            if (e.keyCode === core.keyCode.END) {
                                activeItem(false);
                            } else {
                                activeItem(true);
                            }
                            break;
                    }
                });

            }

            function activeItem(i) {
                if (!self.isShown) {
                    self.open();
                }

                var last = self.el.options.length - 1;

                if (i === true) {
                    i = 0;
                } else if (i === false) {
                    i = last;
                } else {
                    var curr = self.$list.find('li a:focus').parent().index();
                    if (curr < 0) {
                        i = 0;
                    } else {
                        i = curr + i;
                        if (i < 0) {
                            i = last;
                        } else if (i > last) {
                            i = 0;
                        }
                    }
                }
                self.$list.find('li a').eq(i).focus();
            }

            $(self.el.form).on('reset', function () {
                setTimeout(function () {
                    self.update();
                });
            });
        },

        /**
         * 레이블 생성
         * @private
         */
        _createLabel: function _createLabel() {
            var self = this;

            self.$label = $(self.tmpl('label', {
                html: self._itemHTML(self.el.selectedIndex >= 0 ? self.el.options[self.el.selectedIndex] : null, 'label')
            }));

            self.$label.attr({
                'id': self.cid + '_button'
            }).on('click', '.ui-select-button', function (e) {
                e.preventDefault();
                if (self === Selectbox.active) {
                    self.close();
                    return;
                }

                // 현재 셀렉트박스가 열려있으면 닫고, 닫혀있으면 열어준다.
                if (self.$selectbox.hasClass('on')) {
                    self.close();
                } else {
                    if (self._isDeactive()) {
                        return;
                    }
                    self.open();
                    self.$list.find('li.on a').focus();
                }
            });

            self.$selectbox.append(self.$label);
        },

        focus: function () {
            this.$selectbox.find('.ui-select-button').focus();
        },

        /**
         * 리스트 생성
         * @private
         */
        _createList: function _createList() {
            var self = this;

            self.$list = $(self.tmpl('list', {cid: self.cid}));
            self.$selectbox.append(self.$list);
            self.$listWrapper = self.$list.children();

            self.$selectbox.on('click', '.ui-selectbox-list', function (e) {
                self.$list.focus();
            }).on('click', '.ui-selectbox-list li>a', function (e) {
                // 아이템을 클릭했을 때
                e.preventDefault();
                e.stopPropagation();

                self.selectedIndex($(this).parent().index());
                self.close();
                self.$label.find('a').focus();
            });

            !isTouch && self.$selectbox.on('mousedown', '.ui-selectbox-list li>a', function () {
                this.focus();
            });
            self.maxHeight = parseInt(self.$listWrapper.css('max-height'), 10);

            self.$scrollbar = $(self.tmpl('scrollbar'));
            self.$list.append(self.$scrollbar);
            if (!isTouch) {
                self.$list.on('mouseenter mouseleave', function (e) {
                    self.isScrollbarActive = e.type === 'mouseenter';
                    self.$scrollbar.toggleClass('active', self.isScrollbarDown || self.isScrollbarActive);
                });
            }

            /* TODO
             if (!core.detect.isTouch) {
             self.$list.on('mouseenter mouseleave', function (e){
             self.isScrollbarActive = e.type === 'mouseenter';
             self.$scrollbar.toggleClass('active', self.isMouseDown || self.isScrollbarActive);
             });
             }
             */
        },

        /**
         * 스크롤박스를 버튼 위에 놓을지 아래에 놓을지 결정
         * @private
         */
        _reposition: function _reposition() {
            var self = this,
                $scrollarea,
                scrollTop,
                offset,
                listHeight,
                selectHeight,
                scrollHeight;

            $scrollarea = self.$selectbox.parentsUntil('body').filter(function () {
                var overflow = $(this).css('overflowY');
                return overflow === 'hidden' || overflow === 'auto';
            });

            if ($scrollarea.length === 0) {
                return;
            }

            scrollTop = $scrollarea.scrollTop();
            scrollHeight = $scrollarea.prop('scrollHeight');
            selectHeight = self.$selectbox.innerHeight();
            offset = self.$selectbox.offset().top - $scrollarea.offset().top + scrollTop;
            self.$list.css({'visibility': 'hidden', 'top': -1000}).show();
            listHeight = self.$listWrapper.innerHeight();
            self.$list.css({'visibility': '', 'top': ''}).hide();

            if (offset + listHeight + selectHeight > scrollHeight && offset - scrollTop > listHeight) {
                self.$selectbox.addClass('up');
                self.$list.css('marginTop', (listHeight + selectHeight + 3) * -1);
            } else {
                self.$selectbox.removeClass('up');
                self.$list.css('marginTop', '');
            }
        },

        /**
         * 리스트 표시
         * @fires vcui.ui.Selectbox#selectboxopen
         */
        open: function open() {
            var self = this;
            Selectbox.active && Selectbox.active.close();

            if (self.options.where === 'body') {
                self.$list.css({
                    position: 'absolute',
                    zIndex: 9000,
                    top: self.$label.offset().top + self.$label.height(),
                    left: self.$label.offset().left
                }).appendTo('body');
            }

            self.$selectbox.aria('expanded', 'true');
            /**
             * 셀렉트박스가 열릴 때 발생
             * @event vcui.ui.Selectbox#selectboxopen
             */ //self.$selectbox.triggerHandler('selectboxopen');
            self.triggerHandler('selectboxopen');
        },

        /**
         * 리스트 닫기
         * @fires vcui.ui.Selectbox#selectboxclose
         */
        close: function close() {
            var self = this;

            self.$selectbox.aria('expanded', 'false');
            /**
             * 셀렉트박스가 닫힐 때 발생
             * @event vcui.ui.Selectbox#selectboxclose
             */
            self.triggerHandler('selectboxclose');

            if (self.options.where === 'body') {
                self.$label.after(self.$list.css({
                    position: '',
                    zIndex: '',
                    top: '',
                    left: ''
                }));
            }
        },

        /**
         * index에 해당하는 option항목을 선택
         *
         * @param {number} index 선택하고자 하는 option의 인덱스
         * @param {boolean} trigger change이벤트를 발생시킬 것인지 여부
         */
        selectedIndex: function selectedIndex(index, trigger) {
            var self = this;

            if (arguments.length === 0) {
                return self.el.selectedIndex;
            }
            //if (self._isDeactive()) { return; }
            self.supr.apply(self, core.toArray(arguments));
            self.$list.find('li').removeClass('on').eq(self.el.selectedIndex).addClass('on');
        },

        selectByIndex: function () {
            return this.selectedIndex.apply(this, arguments);
        },

        selectByText: function (text, isTrigger) {
            var self = this;

            if (!arguments.length) {
                return this.el.options[self.el.selectedIndex].text;
            }

            core.each(core.toArray(self.el.options), function (item, i) {
                if (item.text === text) {
                    self.selectByIndex(i, isTrigger);
                    return false;
                }
            })
        },

        /**
         * value 에 해당하는 option항목을 선택, 인자가 없을땐 현재 선택되어진 value를 반환
         *
         * @param {string} index 선택하고자 하는 option의 인덱스
         * @param {boolean} trigger change이벤트를 발생시킬 것인지 여부
         * @return {string}
         * @example
         * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
         *
         * $('#sel').vcSelectbox('value', 2);
         * value = $('#sel').vcSelectbox('value'); // = $('#sel')[0].value 와 동일
         */
        value: function value(_value, trigger) {
            var self = this;

            if (arguments.length === 0) {
                return self.el.options[self.el.selectedIndex].value;
            } else {
                //if (self._isDeactive()) { return; }
                self.supr.apply(self, core.toArray(arguments));
            }
        },

        /**
         * 동적으로 select의 항목들이 변경되었을 때, UI에 반영
         *
         * @param {json} (optional) list 만약 option들을 새로 갱신하고자 할 경우
         * @example
         * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
         *
         * $('#sel')[0].options[2] = new Option(3, 3);
         * $('#sel')[0].options[3] = new Option(4, 4);
         * $('#sel').vcSelectbox('update');
         */
        update: function update(list, selectedValue) {
            var self = this,
                html = '',
                text = '',
                num = 1;

            var isDisabled = self.$el.prop('disabled');
            var isReadonly = self.$el.prop('readonly') === true;

            self.close();
            if (list) {
                self.supr(list, selectedValue);
            }

            self._updateLabel();
            if (isReadonly || isDisabled) {
                return;
            }

            // select에 있는 options를 바탕으로 UI를 새로 생성한다.
            self._options(function (item, i) {
                html += self.tmpl('option', {
                    num: num++,
                    value: item.value,
                    text: item.text,
                    attrTitle: self.attrTitle,
                    html: self._itemHTML(item)
                });
            });

            self.$listWrapper.empty().html('<ul>' + html + '</ul>').find('li:eq(' + self.el.selectedIndex + ')').addClass('on');

            self.$selectbox.toggle(self.display);
        },

        setTitle: function setTitle(title) {
            this.$listWrapper.find('a').attr('title', this.attrTitle = title);
        },

        /**
         * readonly 모드로 변경
         * @param flag
         */
        readonly: function readonly(flag) {
            var self = this;

            self.supr(flag);
            self.close();
            self.update();
        },

        /**
         * disabled 모드로 변경
         * @param flag
         */
        disabled: function disabled(flag) {
            var self = this;

            self.supr(flag);
            self.close();
            self.update();
        },

        /**
         * 스크롤바 이벤트 바인딩
         * @private
         */
        _bindScrollEvent: function _bindScrollEvent() {
            var self = this;
            var $listChild = self.$listWrapper;

            $listChild.on('scroll', function () {
                if (!self.isScrollbarDown) {
                    self._scrollUpdate();
                }
            });

            if (!isTouch) {
                if (self.options.allowScrollbar) {
                    // 스크롤바 드래그 바인딩

                    self.$scrollbar.vcGesture({
                        direction: 'vertical',
                        gesture: function () {
                            var currY, top, rate, scrollbarHeight, wrapperHeight, scrollHeight;
                            return function (type, data) {
                                if (!self.isVisibleScrollbar) {
                                    return false;
                                }
                                switch (type) {
                                    case 'start':
                                        self.isScrollbarDown = true;
                                        currY = parseInt(self.$scrollbar.children().css('top'), 10);
                                        scrollbarHeight = self.$scrollbar.children().height();
                                        wrapperHeight = self.$listWrapper.height();
                                        scrollHeight = self.$listWrapper.prop('scrollHeight');
                                        break;
                                    case 'move':
                                        if (!self.isScrollbarDown) {
                                            return;
                                        }
                                        top = self._scrollbarMove(currY + data.diff.y);
                                        rate = top / (wrapperHeight - scrollbarHeight);
                                        self.$listWrapper.scrollTop(rate * (scrollHeight - wrapperHeight));
                                        break;
                                    default:
                                        self.isScrollbarDown = false;
                                        !self.isScrollbarActive && self.$scrollbar.removeClass('active');
                                        break;
                                }
                            };
                        }()
                    });
                }

                // 휠스크롤 바인딩
                self.$selectbox.on('mousewheel DOMMouseScroll wheel', function (event) {
                    if (!self.isVisibleScrollbar) {
                        return;
                    }
                    //event.preventDefault();
                    var e = event.originalEvent,
                        delta = core.dom.getDeltaY(e) * 40,
                        scrollTop = $listChild.scrollTop();

                    $listChild.scrollTop(scrollTop - delta);
                    //if ($listChild.scrollTop() == scrollTop) {
                    event.preventDefault();
                    event.stopPropagation();
                    //}
                });
            } else {
                // 리스트 드래그 바인딩

                self.$list.vcGesture({
                    direction: 'vertical',
                    gesture: function () {
                        var currY = 0;
                        return function (type, data) {
                            if (!self.isVisibleScrollbar) {
                                return false;
                            }
                            switch (type) {
                                case 'start':
                                    currY = $listChild.scrollTop();
                                    break;
                                case 'move':
                                    $listChild.scrollTop(currY - data.diff.y);
                                    break;
                            }
                        };
                    }()
                });
            }
            // ScrollBar Event Bind End
        },

        /**
         * 스크롤바 삭제
         * @private
         */
        _hideScroll: function _hideScroll() {
            var self = this;

            self.isVisibleScrollbar = false;
            self.$scrollbar.hide().children().css('height', 0);
        },

        /**
         * 스크롤바 갱신
         * @private
         */
        _scrollUpdate: function _scrollUpdate() {
            var self = this;
            if (!self.isVisibleScrollbar) {
                return;
            }
            var rate = (self.wrapperHeight - self.scrollBarHeight) / (self.scrollerHeight - self.wrapperHeight);
            self._scrollbarMove(self.$listWrapper.scrollTop() * rate);
        },

        /**
         * 스크롤바 이동
         * @param top
         * @returns {number|*}
         * @private
         */
        _scrollbarMove: function _scrollbarMove(top) {
            var self = this;

            if (!self.isVisibleScrollbar) {
                return;
            }
            top = Math.min(self.scrollHeight, Math.max(0, top));
            self.$scrollbar.children().css({
                'height': Math.ceil(self.scrollBarHeight),
                'top': top
            });
            return top;
        },

        // 스크롤링
        _scrollTop: function _scrollTop(top) {
            var self = this;

            self.$listWrapper.scrollTop(top * self.scrollRate);
            self._scrollUpdate();
        },

        /**
         * 활성화된 아이템을 가시영역에 보이도록 강제 스크롤
         * @private
         */
        _scrollToItem: function _scrollToItem() {
            var self = this,
                selIndex = self.el.selectedIndex;

            if (selIndex > 0) {
                var $option = self.$list.find('li').eq(selIndex),
                    scrollTop = self.$listWrapper.scrollTop(),
                    optionTop = $option.position().top + scrollTop,
                    wrapperHeight = self.$list.height(),
                    optionHeight,
                    listHeight;

                if (optionTop < scrollTop || optionTop >= wrapperHeight + scrollTop) {
                    optionHeight = $option.height();
                    listHeight = self.$listWrapper.height();
                    self.$listWrapper.scrollTop(optionTop - listHeight / 2 + optionHeight / 2);
                }
            } else {
                self.$listWrapper.scrollTop(0);
            }
        },

        /**
         * 스크롤바 재배치(꼭 해야되는 상황일 때만 갱신함)
         * @private
         */
        _refreshScroll: function _refreshScroll() {
            var self = this;

            self.scrollerHeight = self.$list.find('ul').height();
            if (self.maxHeight > self.scrollerHeight) {
                self._hideScroll();
                return;
            }

            self.wrapperHeight = self.$listWrapper.height(); // - (self.options.containerMargin * 2);
            if (self.scrollerHeight <= self.wrapperHeight) {
                self._hideScroll();
                return;
            } else if (self.$selectbox.hasClass('on')) {
                self.$scrollbar.show();
                self.isVisibleScrollbar = true;
            }
            if (!self._bindedOverEvents) {
                self._bindedOverEvents = true;
                self._bindScrollEvent();
            }
            self.scrollRate = self.wrapperHeight / self.scrollerHeight;
            self.scrollBarHeight = Math.max(30, self.wrapperHeight * self.scrollRate);
            self.scrollHeight = self.wrapperHeight - self.scrollBarHeight;
            self.isScrollbarDown = false;
            self.moveY = 0;

            self._scrollUpdate();
        },

        /**
         * 소멸자
         */
        destroy: function release() {
            var self = this;

            $doc.off('.selectbox' + self.cid);
            $win.off('.' + self.cid);
            self.$scrollbar.off();
            self.$label.off().remove();
            self.$list.off().remove();
            self.$selectbox.off().remove();
            self.$el.off('change.selectbox').show().unwrap('<div></div>');
            self.supr();
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    var PickerSelectbox = core.ui('PickerSelectbox', BaseSelectbox, {
        templates: {
            label: '<div class="ui-selectbox-view"><a href="#0" class="ui-select-button" title="">{{#raw html}}</a></div>'
        },
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._create();
            self._bindEvents();
        },

        _create: function _create() {
            var self = this,
                cls = self.$el.attr('data-class') || 'ui-selectbox-wrap',
                elId = !self.options.id ? '' : ' id="' + self.options.id + '"';

            self.originalWidth = parseInt(self.$el.css('width'), 10) + 22;
            self.attrTitle = self.options.title || self.$el.attr('title') || '셀렉트박스';
            if (self.options.wrapClasses) {
                cls = cls + ' ' + self.options.wrapClasses;
            }

            // 셀렉트박스
            self.$selectbox = $('<div class="' + cls + '" ' + elId + '></div>');
            if (!self.options.widthClass) {
                self.$selectbox.css('width', self.originalWidth);
            } else {
                self.$selectbox.addClass(self.options.widthClass);
            }

            self.$el.css({
                '-webkit-appearance': 'none',
                '-moz-appearance': 'none',
                'border-radius': 0,
                'opacity': 0,
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'bottom': 0,
                'width': '100%'
            });
            self.$selectbox.insertBefore(self.$el);
            self.$label = $(self.templates.label,{
                html: self._itemHTML(self.el.options[self.el.selectedIndex], 'label')
            }).appendTo(self.$selectbox);

            self.$selectbox.prepend(self.$el);
            self.display = self.$el.css('display') !== 'none';
            self.$selectbox.toggle(self.display);
            self._updateLabel();
        },

        _bindEvents: function _bindEvents() {
            var self = this;

            self.$el.on('change', function () {
                self._updateLabel(self.el.selectedIndex);
            }).on('focusin focusout', function (e) {
                self.$selectbox.toggleClass('active', e.type === 'focusin');
            });
        },

        _updateLabel: function _updateLabel() {
            this.supr();
            if (this.$el.prop('readonly') === true) {
                this.$el.hide();
            }
        },

        update: function update(list, selectedValue) {
            list && this.supr(list, selectedValue);
            this._updateLabel();
        }
    });

    var Selectbox = core.ui('Selectbox', /** @lends vcui.ui.Selectbox# */{
        bindjQuery: 'Selectbox',
        defaults: {
            allowPicker: true
        },
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }
            delete self.options.on;
            delete self.options.events;

            // 모바일에서 픽커가 아닌 커스텀셀렉트박스를 띄워야하는지 체크
            if (self.$el.attr('data-width-class') === 'f_wd_one') {
                self.options.allowPicker = false;
            }
            if (core.detect.isTouch && core.detect.isMobile && self.options.allowPicker !== false) {
                // picker
                self.sel = new PickerSelectbox(el, self.options);
            } else {
                // custom (dom ui)
                self.sel = new CustomSelectbox(el, self.options);
            }

            // puiblic 메소드를 외부에서 호출할 수 있도록 현재인스턴스에 추가
            self.$selectbox = self.sel.$selectbox;
            core.each(['selectedIndex', 'value', 'text', 'selectedOption', 'update', 'hide', 'show', 'toggle', 'readonly', 'disabled', 'focus'], function (name) {
                self[name] = function () {
                    return this.sel[name].apply(this.sel, [].slice.call(arguments, 0));
                };
            });
        }
    });

    /*core.ui.setDefaults('Selectbox', {
        events: {
            'selectboxopen': function selectboxopen(e) {
                if (this.options.preventZindex) {
                    return;
                }
                this.$el.parentsUntil('#wrap').filter(function (i) {
                    return $(this).css('position') === 'relative';
                }).addClass('zindex');
            },
            'selectboxclose': function selectboxclose(e) {
                if (this.options.preventZindex) {
                    return;
                }
                this.$el.parents('.zindex').removeClass('zindex');
            }
        }
    });*/

    return Selectbox;
});

/*!
 * @module vcui.ui.Tab
 * @license MIT License
 * @description 탭 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/tab', ['jquery', 'vcui', 'ui/smoothScroll'], function ($, core) {
    "use strict";

    var name = 'tab',
        eventBeforeChange = name + 'beforechange',
        eventChanged = name + 'change',
        selectedClass = 'on';

    var prefixClass = '.ui_tab_';
    /**
     * @class
     * @name vcui.ui.Tab
     * @description 페이징모듈
     * @extends vcui.ui.View
     */
    var Tab = core.ui('Tab', /** @lends vcui.ui.Tab# */{
        bindjQuery: 'tab',
        $statics: /** @lends vcui.ui.Tab */{
            ON_CHANGE: eventBeforeChange,
            ON_CHANGED: eventChanged
        },
        defaults: {
            selectedIndex: 0,
            selectedClass: selectedClass,
            selectedText: '선택됨',
            tabsSelector: '>ul>li',
            tabForceHeight: false
        },

        selectors: {},
        /**
         * 생성자
         * @param {string|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} [options] 옵션값
         * @param {number} [options.selectedIndex = 0]  초기선택값
         * @param {string} [options.selectedClass = 'on'] 활성 css클래스명
         * @param {string} [options.tabType = 'inner'] 탭형식(inner | outer)
         */
        initialize: function initialize(el, options) {
            var self = this;
            if (self.supr(el, options) === false) {
                return;
            }

            var $hide = self.$('.hide:first');
            self.$srText = $hide.length ? $hide : $('<em class="hide">' + self.options.selectedText + '</em>');

            var $child = self.$el.children().eq(0);
            if (!$child.is('ul')) {
                self.options.tabsSelector = '>' + $child[0].tagName.toLowerCase() + self.options.tabsSelector;
                if ($child.css('overflow') === 'hidden') {
                    $child.vcSmoothScroll();
                }
            }

            self.update();
            self._bindEvents();

            var index = self.$tabs.filter('.' + selectedClass).index();
            if (index >= 0) {
                self.options.selectedIndex = index;
            }
            self.select(self.options.selectedIndex);
        },

        update: function update() {
            var self = this;

            self._findControls();
            self._buildARIA();
        },

        _findControls: function _findControls() {
            var self = this;
            var selectors = [];

            self.$tabs = self.$(self.options.tabsSelector);
            self.$contents = $();

            // 탭버튼의 href에 있는 #아이디 를 가져와서 컨텐츠를 조회
            self.$tabs.each(function () {
                var $tab = $(this),
                    $panel,
                    href = $tab.find('a').attr('href');

                if (href && /^(#|\.)\w+/.test(href)) {
                    if (($panel = $tab.find('>div')).length) {
                        self.$contents = self.$contents.add($panel);
                    } else {
                        self.$contents = self.$contents.add($(href));
                    }
                }
            });

            if (!self.$contents.length) {
                self.$contents = self.$('>' + prefixClass + 'panel');
            }
        },

        /**
         * @private
         */
        _bindEvents: function _bindEvents() {
            var self = this;

            self.on('click keydown', self.options.tabsSelector + '>a, ' + self.options.tabsSelector + '>button', function (e) {

                switch (e.type) {
                    case 'click':
                        e.preventDefault();

                        self.select($(e.currentTarget).parent().index());
                        break;
                    case 'keydown':
                        var index = $(e.currentTarget).parent().index(),
                            newIndex;

                        switch (e.which) {
                            case core.keyCode.RIGHT:
                                e.preventDefault();
                                newIndex = Math.min(self.$tabs.length - 1, index + 1);
                                break;
                            case core.keyCode.LEFT:
                                e.preventDefault();
                                newIndex = Math.max(0, index - 1);
                                break;
                            default:
                                return;
                        }
                        self.select(newIndex);
                        self.$tabs.eq(self.selectedIndex).find('>a, >button').focus();
                        break;
                }
            });
        },

        /**
         * aria 속성 빌드
         * @private
         */
        _buildARIA: function _buildARIA() {
            var self = this,
                tablistid = self.cid,
                tabid;

            self.$el.attr('role', 'tablist');
            self.$tabs.each(function (i) {
                tabid = $(this).children().attr('href').substr(1) || (tablistid + '_' + i);

                $(this)
                    .attr({
                        'role': 'presentation'
                    })
                    .children()
                    .attr({
                        //'id': tabid,
                        'role': 'tab',
                        'aria-selected': 'false',
                        'aria-controls': tabid
                    });

                if (!self.$contents.eq(i).attr('id')) {
                    self.$contents.eq(i).attr('id', tabid);
                }

                self.$contents.eq(i).attr({
                    'aria-labelledby': tabid,
                    'role': 'tabpanel',
                    'aria-hidden': self.selectedIndex === i ? 'false' : 'true'
                });
            });
        },

        _updateTabHeight: function () {
            var self = this;
            var maxHeight = 0;

            if (self.options.tabForceHeight) {
                self.$tabs.find('a').css('height', '').each(function (i) {
                    var h = $(this).height();
                    if (h > maxHeight) {
                        maxHeight = h;
                    }
                });

                self.$tabs.find('a').css('height', maxHeight);
            }
        },

        /**
         * index에 해당하는 탭을 활성화
         * @param {number} index 탭버튼 인덱스
         * @fires vcui.ui.Tab#tabbeforechange
         * @fires vcui.ui.Tab#tabchange
         * @example
         * $('#tab').tab('select', 1);
         * // or
         * $('#tab').tab('instance').select(1);
         */
        select: function select(index) {
            var self = this,
                e;
            if (index < 0 || self.$tabs.length && index >= self.$tabs.length) {
                throw new Error('index 가 범위를 벗어났습니다.');
            }

            /**
             * 탭이 바뀌기 직전에 발생. e.preventDefault()를 호출함으로써 탭변환을 취소할 수 있다.
             * @event vcui.ui.Tab#tabbeforechange
             * @type {object}
             * @property {number} selectedIndex 선택된 탭버튼의 인덱스
             */
            self.triggerHandler(e = $.Event(eventBeforeChange), {
                selectedIndex: index,
                relatedTarget: self.$tabs.get(index),
                button: self.$tabs.eq(index).find('>a'),
                content: self.$contents.eq(index)

            });
            if (e.isDefaultPrevented()) {
                return;
            }

            self.selectedIndex = index;

            var $a, $hide;
            $a = self.$tabs.removeClass(selectedClass).children('a, button').attr('aria-selected', false).end()
                .eq(index).addClass(selectedClass).children('a, button').attr('aria-selected', true);

            if (($hide = $a.find('.hide')).length) {
                self.$tabs.not(self.$tabs.eq(index)).find('>a .hide').text("");
                $hide.text(self.options.selectedText);
            } else {
                $a.append(self.$srText);
            }

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            self.$contents.hide().attr('aria-hidden', 'true')
                .eq(index).attr('aria-hidden', 'false').show();

            self._updateTabHeight();

            /**
             * 탭이 바뀌기 직전에 발생. e.preventDefault()를 호출함으로써 탭변환을 취소할 수 있다.
             * @event vcui.ui.Tab#tabchange
             * @type {object}
             * @property {number} selectedIndex 선택된 탭버튼의 인덱스
             */
            self.triggerHandler(eventChanged, {
                selectedIndex: index,
                button: self.$tabs.eq(index).find('>a'),
                content: self.$contents.eq(index)
            });
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    return Tab;
});

/*!
 * @module vcui.ui.Tooltip
 * @license MIT License
 * @description 툴팁 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/tooltip', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    /**
     * 툴팁 레이어
     * @class
     * @name vcui.ui.Tooltip
     * @extends vcui.ui.View
     */

    var Tooltip = core.ui('Tooltip', /** @lends vcui.ui.Tooltip# */{
        $singleton: true,
        bindjQuery: 'tooltip',
        defaults: {
            interval: 200,
            attrName: "title"
        },
        templates: {
            tooltip: '<span class="ui-tooltip" role="tooltip" id="uiTooltip" style="z-index:100000;display:none;max-width:200px;height:auto;position:absolute;border:1px solid red;background:blue;" aria-hidden="true"></span>'
        },
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._bindEvents();
        },


        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function _bindEvents() {
            var self = this;
            var $tooltip = self.$tooltip = $(self.tmpl('tooltip')).appendTo('body');
            var attr = self.options.attrName;

            self.docOn('mouseenter mouseleave focusin focusout click', '[data-title]:not([disabled]), [' + attr + ']:not([disabled])', function (e) {

                switch (e.type) {
                    case 'mouseenter':
                    case 'focusin':
                        var el = self.activeEl = this,
                            title = '';

                        title = core.string.escapeHTML(el.getAttribute(attr) || el.getAttribute('data-title'));
                        if (!title) {
                            self._close(false);
                            return;
                        }

                        if (attr === 'title' && el.getAttribute(attr)) {
                            el.setAttribute('data-title', el.getAttribute(attr));
                            el.setAttribute('aria-describedby', 'uiTooltip');
                            el.removeAttribute(attr);
                        }
                        self.showTimer = setTimeout(function () {
                            if (!el || !title) {
                                return;
                            }

                            var measure = core.dom.getDimensions(el);
                            if (measure.left === 0 && measure.top === 0) {
                                self._close();
                                return;
                            }

                            $tooltip.get(0).innerText = title;
                            var isUpOut = measure.top - measure.height < 0,
                                tooltipWidth = $tooltip.outerWidth(),
                                tooltipHeight = $tooltip.outerHeight(),
                                diff = measure.width - tooltipWidth,
                                pos = {};

                            if (isUpOut) {
                                $tooltip.removeClass('top bottom').addClass('top');
                                pos.top = measure.top + measure.height + 4;
                            } else {
                                $tooltip.removeClass('top bottom').addClass('bottom');
                                pos.top = measure.top - tooltipHeight - 6;
                            }
                            pos.left = measure.left + diff / 2 + core.dom.getScrollLeft();
                            pos.top += core.dom.getScrollTop();

                            $tooltip.css(pos).fadeIn('fast');
                            $tooltip.attr('aria-hidden', 'false');
                            self.isShow = true;
                        }, 500);
                        break;
                    case 'mouseleave':
                    case 'focusout':
                        self._close();
                        break;
                }
            }).on('mousedown', function () {
                self._close();
            });
        },
        _close: function _close(effect) {
            var self = this;
            clearTimeout(self.showTimer);
            clearTimeout(self.hideTimer);
            self.hideTimer = self.showTimer = null;

            if (self.activeEl) {
                self.activeEl = null;
            }

            if (!self.isShow) {
                return;
            }
            self.isShow = false;

            if (effect) {
                self.$tooltip.fadeOut('fast');
            } else {
                self.$tooltip.hide();
            }
            self.$tooltip.attr('aria-hidden', 'true');
        }
    });

    return Tooltip;
});

/*!
 * @module vcui.ui.CollapseToggler
 * @license MIT License
 * @description CollapseToggler 컴포넌트
 * @copyright VinylC UID Group.
 */
define('ui/collapseToggler', [
    'jquery',
    'vcui'
], function ($, core) {
    "use strict";

    return core.ui('CollapseToggler', {
        bindjQuery: true,
        defaults: {
            useAnimate: true,
            singleOpen: false
        },
        selectors: {},
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._bindEvents();
        },

        _bindEvents: function () {
            var self = this;

            self.on('click', '.ui_collapse_toggle', function (e) {
                e.preventDefault();

                var $btn = $(this),
                    $wrap = $btn.closest('.ui_collapse_item, .ui_collapse').eq(0),
                    $target = $wrap.find('.ui_collapse_target'),
                    flag = $btn.toggleClass('on').hasClass('on');

                if (self.options.useAnimate) {
                    $target[flag ? 'slideDown' : 'slideUp']('fast', function () {
                        self._toggleComplete($btn, flag);
                    });
                } else {
                    $target.toggle(flag);
                    self._toggleComplete($btn, flag);
                }
            });
        },
        _toggleComplete: function ($btn, flag) {
            var self = this;

            $btn.find('i').text(flag ? '접기' : '펼치기');
            self.triggerHandler('collapsechange', {collapse: !flag, expand: flag});
        }
    });

});

/*!
 * @module vcui.ui.Toggler
 * @license MIT License
 * @description Toggler 컴포넌트
 * @copyright VinylC UID Group.
 */
define('ui/toggler', [
    'jquery',
    'vcui'
], function ($, core) {
    "use strict";

    return core.ui('Toggler', {
        bindjQuery: true,
        defaults: {
            toggleClass: 'on',
            limit: 6
        },
        selectors: {},
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            if (self.$('.ui_toggler_target>*').length <= self.options.limit) {
                return;
            }

            self.$('.ui_toggler_button').parent().show();
            self._bindEvents();
        },

        _bindEvents: function () {
            var self = this;

            self.on('click', '.ui_toggler_button', function (e) {
                e.preventDefault();

                var $btn = $(this);
                var cls = self.options.toggleClass;

                var toggle = self.$el.toggleClass(cls).hasClass(cls);
                self._toggleComplete($btn, toggle);
            });
        },
        _toggleComplete: function ($btn, flag) {
            var self = this;

            $btn.find('i, em').text(flag ? '접기' : '펼쳐보기');
            self.triggerHandler('togglerchange', {toggle: flag});
        }
    });

});

define('ui/dropmenu', [
    'jquery',
    'vcui'
], function ($, core) {

    var Dropmenu = core.ui('Dropmenu', {
        bindjQuery: true,
        defaults: {
            hover: false,
            activeClass: 'on',
            autoHide: true
        },
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._buildARIA();
            self._bindEvents();
        },

        _buildARIA: function () {
            var self = this;

            self.$('.ui_dropmenu_toggle, .ui_dropmenu_close').attr('role', 'button')
                .filter('.ui_dropmenu_toggle').attr({'aria-expanded': 'false', 'aria-haspopup': 'true'});
        },

        _bindEvents: function () {
            var self = this;

            self.on('click', '.ui_dropmenu_toggle', function (e) {
                e.preventDefault();

                self.toggle();
            });

            self.on('click', '.ui_dropmenu_close', function (e) {
                e.preventDefault();

                self.close();
            });

            if (self.options.hover) {
                self.on('mouseenter mouseleave', function (e) {
                    self[e.type === 'mouseenter' ? 'open' : 'close']()
                });
            }
        },

        toggle: function () {
            this[this.$el.hasClass('on') || this.$el.hasClass('open') ? 'close' : 'open']();
        },

        open: function () {
            var self = this;

            self.$el.addClass(self.options.activeClass);//.find('.ui_dropmenu_list a:first').focus();
            self.$('.ui_dropmenu_toggle').attr('aria-expanded', 'true');
            self.$el.find('.ui_dropmenu_toggle').find('.sr-only, .sr_only').text('닫기');
            self.options.autoHide && setTimeout(function () {
                // 다른 곳을 클릭하면 닫히게 해준다.
                self.docOn('click keydown', function (e) {
                    if (e.type === 'click') {
                        if (core.dom.contains(self.$el[0], e.target)) {
                            setTimeout(function () {
                                self.close();
                            }, 100);
                            return;
                        }
                        self.close();
                    } else {
                        if (e.which === core.keyCode.ESCAPE) {
                            self.close();
                        }
                    }
                });

                if (core.detect.isTouch) {
                    return;
                }
                // 포커스가 빠져나가면 자동으로 닫히도록 해준다..
                var thread;
                self.on('focusin focusout', function (e) {
                    switch (e.type) {
                        case 'focusin':
                            clearTimeout(thread);
                            break;
                        case 'focusout':
                            clearTimeout(thread);
                            thread = setTimeout(function () {
                                self.close();
                            }, 100);
                            break;
                    }
                });
            });
        },

        close: function () {
            var self = this;

            self.$el.removeClass(self.options.activeClass);
            self.$('.ui_dropmenu_toggle').attr('aria-expanded', 'false');
            self.$el.find('.ui_dropmenu_toggle').find('.sr-only, .sr_only').text('열기');
            self.docOff('click keydown');
            self.off('focusin focusout');
        }
    });

    /*$(document).on('click', '.ui_dropmenu_toggle', function (e) {
        e.preventDefault();

        var $btn = $(this),
            $menuWrap = $btn.parent();

        if ($menuWrap.data('ui_dropdown_initialized')) {
            return;
        }

        $menuWrap.data('ui_dropdown_initialized', true);
        new Dropmenu($menuWrap, $menuWrap.data()).open();
    }).on('mouseenter', '.ui_dropmenu[data-hover=true]', function () {
        var $menuWrap = $(this);

        if ($menuWrap.data('ui_dropdown_initialized')) {
            return;
        }

        $menuWrap.data('ui_dropdown_initialized', true);
        new Dropmenu($menuWrap, $menuWrap.data()).open();
    });*/

    return Dropmenu;
});

/*!
 * @module vcui.ui.Poptip
 * @license MIT License
 * @description Poptip 컴포넌트
 * @copyright VinylC UID Group.
 */
define('ui/poptip', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    return core.ui('Poptip', {
        $singleton: true,
        bindjQuery: true,
        defaults: {},
        initialize: function initialize(el, options) {
            var self = this;

            if (el !== document) {
                throw new Error('본 컴포넌트를 document에만 적용이 되며, 딱 한번만 실행해주세요.');
            }

            if (self.supr(el, options) === false) {
                return;
            }

            self.$activeButton = null;

            self._bindEvents();
        },
        _bindEvents: function _bindEvents() {
            var self = this;

            self.docOn('click.poptip', '[data-control=poptip]', function (e) {
                e.preventDefault();

                var $btn = $(this);

                if (self.$activeButton && self.$activeButton[0] !== $btn[0]) {
                    self.close(self.$activeButton);
                }

                if (!$btn.parent().hasClass('on')) {
                    self.open($btn);
                } else {
                    self.close($btn);
                }
            });
        },
        _getTarget: function _getTarget($btn) {
            var target, $target;

            if (target = $btn.data('target')) {
                $target = $(target);
            } else {
                $target = $btn.next('.ui_poptip');
            }
            return $target;
        },
        open: function open($btn) {
            var self = this,
                $target = self._getTarget($btn);

            $target.show().parent().addClass('on');
            self.$activeButton = $btn;
            setTimeout(function () {
                self.docOn('click.poptipopen touchstart.poptipopen', function (e) {
                    if (!$(e.target).closest('.ui_poptip').length) {
                        self.close();
                    }
                });
                $target.one('click.poptipclose', '.ui_poptip_close', function (e) {
                    e.preventDefault();
                    self.close();
                });
            }, 200);
        },
        close: function close($btn) {
            var self = this;

            self.docOff('.poptipopen');
            if (!$btn) {
                $btn = self.$activeButton;
            }
            if (!$btn) {
                return;
            }

            self._getTarget($btn).hide().off('click.poptipclose');
            self.$activeButton.parent().removeClass('on');
            self.$activeButton = null;
        }
    });
});

/*!
 * @module vcui.ui.CheckboxAllChecker
 * @license MIT License
 * @description CheckboxAllChecker 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/checkboxAllChecker', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    return core.ui('CheckboxAllChecker', {
        bindjQuery: 'checkboxAllChecker',
        defaults: {
            mode: ''
        },
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self.allCheck = true;
            self.$wrapper = $(self.$el.attr('data-check-all'));
            self.checkOnce = self.$el.data('checkOnce');
            self.limit = self.$el.data('checkLimit');

            if (self.$wrapper.size() === 0) {
                return;
            }

            self._bindEvents();
        },
        _bindEvents: function _bindEvents() {
            var self = this,
                selector = ':checkbox:enabled:not(.ui_checkall_ignore)';

            // 전체선택 체크박스 선택시
            self.on('change', function (e, data) {
                if (data) {
                    return;
                }

                if (self.limit > 0) {
                    self.allCheck = false;
                    self.$wrapper.find('[type=checkbox]:enabled:not(.ui_checkall_ignore):lt(' + self.limit + ')').not(this).prop('checked', this.checked);
                } else {
                    self.$wrapper.find('[type=checkbox]:enabled:not(.ui_checkall_ignore)').not(this).prop('checked', this.checked);
                }
            });

            var oldCount;

            // 소속 체크박스를 선택시
            self.$wrapper.on('change', ':checkbox', function (e) {
                if (this === self.$el[0]) {
                    return;
                }
                var count = self.$wrapper.find(selector + ':not(:checked)').not(self.$el[0]).length,
                    checkedCount = self.$wrapper.find(selector + ':checked').not(self.$el[0]).length,
                    allCount = self.$wrapper.find(selector).not(self.$el[0]).length;

                if (self.checkOnce) {
                    self._checked(checkedCount > 0);
                } else if (oldCount !== count && self.allCheck) {
                    oldCount = count;
                    self._checked(count === 0); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
                } else if (checkedCount > self.limit) {
                    $(this).prop('checked', false);
                    oldCount = count;
                    self._checked(checkedCount === self.limit); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
                } else {
                    self._checked(checkedCount === self.limit || checkedCount === allCount); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
                }
            });
        },
        _checked: function _checked(flag) {
            var self = this;

            if (self.$el.prop('checked') === flag) {
                return;
            }
            self.$el.prop('checked', flag).trigger('change', {isTrigger: true});
        },
        update: function update() {
            var self = this,
                selector = ':checkbox:enabled:not(.ui_checkall_ignore)',
                oldCount;

            var count = self.$wrapper.find(selector + ':not(:checked)').not(self.$el[0]).length,
                checkedCount = self.$wrapper.find(selector + ':checked').not(self.$el[0]).length,
                allCount = self.$wrapper.find(selector).not(self.$el[0]).length;

            if (self.checkOnce) {
                self.$el.prop('checked', checkedCount > 0);
            } else if (oldCount !== count && self.allCheck) {
                oldCount = count;
                self.$el.prop('checked', count === 0); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
            } else if (checkedCount > self.limit) {
                $(this).prop('checked', false);
                oldCount = count;
                self.$el.prop('checked', checkedCount === self.limit); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
            } else {
                self.$el.prop('checked', checkedCount === self.limit || checkedCount === allCount); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
            }
        }
    });
});

/*!
 * @module vcui.helper.InviewScroll
 * @license MIT License
 * @description InviewScroll 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/inviewScroll', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var getRect = core.dom.getRect;

    /**
     * inview 여부 감시자
     * @type {void | *}
     */
    var Watcher = core.BaseClass.extend({
        initialize: function initialize(elements, options) {
            var self = this;
            var opt;

            self.elements = elements;
            self.options = opt = $.extend(true, {
                allowInScroll: false,
                delay: 200,
                offset: {top: 0, left: 0, right: 0, bottom: 0},
                threshold: 0 // 0, 0.5, 1
            }, options);

            self.handlers = {enter: [], move: [], leave: []};
            self.singles = {enter: [], move: [], leave: []};

            if (opt.throttle !== false) {
                if (opt.delay && !opt.throttle) {
                    self.check = core.delayRun(self.check, opt.delay, self);
                } else if (!opt.delay && opt.throttle) {
                    self.check = core.throttle(self.check, opt.throttle, self);
                }
            }

            self._bindEvents();
        },
        _bindEvents: function _bindEvents() {
            var self = this;
            var opt = self.options;

            if (opt.on) {
                core.each(opt.on, function (handler, name) {
                    self.on(name, handler);
                });
            }

            if (opt.once) {
                core.each(opt.once, function (handler, name) {
                    self.once(name, handler);
                });
            }
        },
        /**
         * 인뷰 핸들러 클리어
         */
        clear: function clear() {
            this.handlers.enter = this.handlers.move = this.handlers.leave = [];
            this.singles.enter = this.handlers.move = this.singles.leave = [];
        },
        /**
         * 인뷰 핸들러 등록
         * @param name
         * @param handler
         * @returns {Watcher}
         */
        on: function on(name, handler) {
            var self = this;

            self.handlers[name].push(handler);

            return self;
        },
        /**
         * 인뷰클리어 일회성 핸들러 등록
         * @param name
         * @param handler
         * @returns {Watcher}
         */
        once: function once(name, handler) {
            var self = this;

            self.singles[name].push(handler);

            return self;
        },
        /**
         * 등록된 핸들러 실행
         * @param name
         * @param el
         * @param top
         * @returns {Watcher}
         */
        emit: function emit(name, el, top) {
            var self = this,
                args = [].slice.call(arguments, 1);

            self.handlers[name].forEach(function (handler) {
                handler.apply(self, args);
            });

            while (self.singles[name].length) {
                self.singles[name].pop().apply(self, args);
            }

            return self;
        },
        /**
         * 인뷰 여부 체크해서 이벤트 실행
         */
        check: function check() {
            var self = this;

            self.elements.forEach(function (el) {
                var status = el.getAttribute('data-inview-state');
                if (self.inview(el)) {
                    self.emit('move', el, getRect(el));
                    if (status !== 'in') {
                        el.setAttribute('data-inview-state', 'in');
                        self.emit('enter', el);
                    }
                } else {
                    if (status === 'in') {
                        el.setAttribute('data-inview-state', 'out');
                        self.emit('leave', el);
                    }
                }
            });
        },
        /**
         * 주어진 el이 인뷰인가
         * @param el
         * @returns {*}
         */
        is: function is(el) {
            return this.inview(el);
        },
        /**
         * el의 인뷰 체크
         * @param el
         * @returns {boolean}
         */
        inview: function inview(el) {
            var self = this;
            var options = self.options;

            var _core$dom$getDimensio = core.dom.getDimensions(el),
                top = _core$dom$getDimensio.top,
                right = _core$dom$getDimensio.right,
                bottom = _core$dom$getDimensio.bottom,
                left = _core$dom$getDimensio.left,
                width = _core$dom$getDimensio.width,
                height = _core$dom$getDimensio.height;

            var scrollTop = core.dom.getScrollTop();

            var intersection = {
                top: bottom,
                right: window.innerWidth - left,
                bottom: window.innerHeight - top,
                left: right
            };

            var threshold = {
                x: options.threshold * width,
                y: options.threshold * height
            };

            return (scrollTop > top && options.allowInScroll || intersection.top > options.offset.top + threshold.y) && intersection.right > options.offset.right + threshold.x && intersection.bottom > options.offset.bottom + threshold.y && intersection.left > options.offset.left + threshold.x;
        }
    });

    var watchers = [];
    var watcherHandler;
    $(window).on('resize.inview scroll.inview load.inview', watcherHandler = function (e) {
        watchers.forEach(function (watcher) {
            watcher.check();
        });
    });

    /**
     * 인뷰 컴포넌트
     */
    var InviewScroll = core.ui('InviewScroll', {
        bindjQuery: 'inviewScroll',
        defaults: {},
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self.start();
        },
        start: function start() {
            var self = this;
            var opt = self.options;
            var elements = [self.el];

            watchers.push(self.watcher = new Watcher(elements, self.options));
            watcherHandler();
        },
        clear: function clear() {
            this.watcher.clear();
        },
        destroy: function destroy() {
            core.array.remove(watchers, this.watcher);
            this.watcher.clear();
        }
    });

    return InviewScroll;
});

/**
 * 개인 메인 모듈
 */
define('ui/personalMainPage', ['jquery', 'vcui', 'ui/carousel', 'ui/certainCarousel'], function ($, core, Carousel) {

    /**
     * 스냅스크롤러
     */
    var SnapScroller = core.ui('SnapScroller', {
        defaults: {
            topOffset: 0,
            applyHeaderBg: false
        },
        selectors: {
            header: $('#header'),
            mainSections: $('.main_sec'),
            footer: $('#footer')
        },
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._init();
            self._active();
            self._bindEvents();
        },

        // 초기화
        _init: function () {
            var self = this;

            self.$mainSections.each(function (i) {
                $(this).data('sectionIndex', i);
            }).eq(0).addClass('active');

            self._lazyActive = core.throttle(self._active.bind(self), 100);
            self.sectionRects = [];
            self.headerHeight = self.$header.outerHeight(true);
            self.activeIndex = -1;


            self._calSizeInfos();
            self._lazyActive();
            core.util.waitImageLoad('body img', true).done(function () {
                self._calSizeInfos();
                self._lazyActive();
            });
        },

        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function () {
            var self = this;
            var hasBg = false, handle;

            self.winOn('resizeed scrollend', function () {
                self._calSizeInfos();
            });

            var toggleBg = function (value) {
                if (hasBg !== value) {
                    self.$header.toggleClass('have_bg', value);
                    self._toggleHeaderClass(self.activeIndex);
                    hasBg = value;
                }
            };

            self.winOn('scroll resize', handle = function (e) {
                self.scrollTop = Math.round(core.dom.getScrollTop());

                self._active();

                if (self.scrollTop + self.headerHeight > self.lastSection.end) {
                    toggleBg(true)
                } else {
                    if (self.options.applyHeaderBg) {
                        toggleBg(self.scrollTop !== 0);
                    } else {
                        toggleBg(false);
                    }
                }

                if (e && e.type === 'scroll') {
                    self.scrolling = true;
                }
            }).winOn('scrollend', function () {
                self.scrolling = false;

                var info, offsetTop2;
                if (self.dir === 'up' && (info = self._getInfo())) {
                    offsetTop2 = Math.round(core.dom.getScrollTop()) + self.headerHeight;
                    if (self.sectionRects.length - 2 === self.activeIndex && offsetTop2 > info.start && offsetTop2 < info.end) {
                        self._scrollTo(info.start);
                        return;
                    }

                    if (self.sectionRects.length - 1 === self.activeIndex && self.scrollTop - 100 < info.start && offsetTop2 > info.start) {
                        self._scrollTo(info.start, null, 200);
                        return;
                    }
                }
            });
            handle();

            self._bindWheelEvent();
        },

        _bindWheelEvent: function () {
            var self = this;

            var $wrap = $('#wrap'), wheelTimer;
            $('body').on('mousewheel DOMMouseScroll wheel', function (e) {
                var delta = core.dom.getWheelDelta(e).y;
                var offsetTop = self.scrollTop + self.headerHeight;
                var isPrevent = false;

                self.dir = delta < 0 ? 'down' : 'up';

                if (self.animating/* || self.scrolling*/) {
                    // 스크롤 중일 땐 휠 무효화
                    e.preventDefault();
                    return;
                }

                if ($wrap[0].className.indexOf('ui_prevent_scroll') > -1) {
                    // 모달이 띄워져 있거나 전체메뉴가 띄워져 있을 때 무시
                    return;
                }

                if (self.dir === 'down' && self.lastSection.start > offsetTop) {
                    isPrevent = true;
                } else if (self.dir === 'up' && self.lastSection.start >= offsetTop || offsetTop >= self.docHeight) {
                    isPrevent = true;
                }

                if (isPrevent) {
                    e.preventDefault(); // 휠 이벤트에 의한 스크롤 무효화
                }

                clearTimeout(wheelTimer);
                wheelTimer = setTimeout(function () {
                    var prevInfo, nextInfo;

                    if (self.animating || self.scrolling) {
                        return;
                    }

                    if (self.dir === 'down') {
                        // 내릴 때
                        nextInfo = self._getInfo('next');

                        if (nextInfo) {
                            self._scrollTo(nextInfo.start);
                        }
                    } else {
                        // 올릴 때
                        var scrollTop = Math.round(core.dom.getScrollTop());
                        var top = scrollTop - self.headerHeight;
                        var target = self._getInfo();

                        if (top - 10 > target.start) {
                            self._scrollTo(target.start);
                            return;
                        }

                        prevInfo = self._getInfo('prev');
                        if (prevInfo) {
                            self._scrollTo(prevInfo.start);
                        } else {
                            self._scrollTo(0, function () {
                                self._toggleHeaderClass(0, self._getInfo(0).isWhite);
                            });
                        }
                    }
                }, 60);
            });
        },

        _playCarousel: function ($target) {
            var self = this;

            self.$mainSections.find('.ui_carousel_initialized').vcCarousel('pause');
            $target.find('.ui_carousel_initialized').vcCarousel('play');
        },

        /**
         * 섹션 위치 계산
         * @private
         */
        _calSizeInfos: function () {
            var self = this;

            self.sectionRects = [];
            self.$mainSections.each(function (i) {
                var $el = $(this);
                var top = Math.round($el.offset().top);
                self.sectionRects.push({
                    index: i,
                    $el: $el,
                    start: self.sectionRects[i - 1] ? self.sectionRects[i - 1].end + 1 : top,
                    end: top + Math.round($el.height()),
                    hasCarousel: !!$el.find('.ui_carousel_initialized').length,
                    isWhite: $el.hasClass('white_cont')
                });
            });
            self.lastSection = self.sectionRects[self.sectionRects.length - 1];
            self.docHeight = core.dom.getDocHeight();
        },

        /**
         * 현재 위치에 해당하는 섹션에 active 클래스 추가
         * @private
         */
        _active: function (cb) {
            var self = this;
            var top = self.scrollTop + self.options.topOffset + 1;
            var done = false;

            if (top > self.lastSection.end) {
                self.lastSection.$el.activeItem('active');
                self.activeIndex = self.lastSection.index;
                cb && cb();
                return;
            }

            core.each(self.sectionRects, function (item, i) {
                if (top >= item.start && top < item.end && self.activeIndex !== i) {
                    var oldIndex = self.activeIndex;
                    var $target = self.$mainSections.eq(i);

                    $target.activeItem('active');

                    self.triggerHandler('sectiondeactive', {
                        section: self.$mainSections.eq(self.activeIndex),
                        dir: i > oldIndex ? 'down' : 'up'
                    });

                    self._toggleHeaderClass(i, item.isWhite);
                    self._playCarousel($target);
                    self.activeIndex = i;
                    cb && cb();

                    self.triggerHandler('sectionactive', {
                        section: $target,
                        dir: i > oldIndex ? 'down' : 'up'
                    });

                    done = true;
                    return false;
                }
            });

            if (!done) {
                cb && cb();
            }
        },

        _getInfo: function (index) {
            if (index === undefined) {
                index = this.activeIndex;
            } else if (index === 'last') {
                index = this.sectionRects.length - 1;
            } else if (index === 'prev') {
                index = this.activeIndex - 1;
            } else if (index === 'next') {
                index = this.activeIndex + 1;
            }

            return this.sectionRects[index];
        },

        _toggleHeaderClass: function (index, isWhite) {
            var self = this;
            var info = self._getInfo(index);

            if (info && info.hasCarousel) {
                if (self.$mainSections.eq(index).find('.slide_wrap.white .ui_carousel_initialized').length) {
                    isWhite = true;
                }
            }

            if (!self.$header.hasClass('have_bg')) {
                self.$header.toggleClass('white_header', isWhite === true);
            } else {
                self.$header.removeClass('white_header');
            }
        },

        /**
         * 스크롤
         * @param top
         * @private
         */
        _scrollTo: function (top, cb, duration) {
            var self = this;

            var done = false;

            if (self.animating || self.scrolling) {
                return;
            }

            self.animating = true;
            $('html, body').stop(true).animate({
                scrollTop: top - self.options.topOffset// - 120
            }, duration || 300, 'swing', function () {
                if (!done) {
                    done = true;
                    self._active();
                    cb && cb();
                    self.animating = false;
                }
            });
        }
    });

    /**
     * 퀵메뉴 컴포넌트
     */
    var QuickMenu = core.ui('QuickMenu', {
        defaults: {},
        selectors: {
            btnTop: $('.top_btn_wrap')
        },
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self.isFixed = false;
            self.$mainWrap = $('#wrap');
            self.$('.menu_btn, .quick_close').attr('role', 'button').filter('.menu_btn').attr('aria-haspopup', 'true');

            self._bindEvents();
        },

        _bindEvents: function () {
            var self = this;
            var handle;
            var animating = false;
            var duration = 200;
            var bottomOffset = 40;
            var rect;// = core.dom.getDimensions(self.$mainWrap);
            var winWidth;// = core.dom.getWinWidth();
            var right;// = -Math.abs(winWidth - rect.right) + self.scrollLeft + rightOffset;

            self.winOn('scroll resize', handle = function (e) {
                if (e.type === 'resize') {
                    rect = core.dom.getDimensions(self.$mainWrap);
                    winWidth = core.dom.getWinWidth();
                }

                self.scrollTop = core.dom.getScrollTop();
                self.scrollLeft = core.dom.getScrollLeft();
                right = winWidth - rect.width + self.scrollLeft + 98;

                if (self.prevScrollTop !== self.scrollTop) {
                    if (self.scrollTop > 0) {
                        if (!self.isFixed && !animating) {
                            // 하단에 고정
                            animating = true;
                            self.isFixed = true;
                            self.$el.stop().animate({
                                opacity: 0
                            }, {
                                duration: duration,
                                complete: function () {
                                    animating = false;
                                    self.$btnTop.show();
                                    // fix & up
                                    self.$el.addClass('fixed').removeClass('on')
                                        .css({
                                            'bottom': -150,
                                            'opacity': 1,
                                            'right': right
                                        }).stop()
                                        .animate({
                                            bottom: bottomOffset
                                        }, {
                                            duration: 100,
                                            step: function (v) {
                                                self.$btnTop.css({'right': right + 13, 'bottom': v + 100});
                                            }
                                        }).show();
                                }
                            });
                        }
                    } else {
                        if (self.isFixed && self.isLoaded && !animating) {
                            // 상단에 고전
                            animating = true;
                            self.$el.stop().animate({
                                bottom: -150
                            }, {
                                duration: duration,
                                step: function (v) {
                                    self.$btnTop.css('bottom', v + 100);
                                },
                                complete: function () {
                                    animating = false;
                                    self.$btnTop.hide();
                                    self.$el
                                        .css({
                                            'bottom': '',
                                            'opacity': 0,
                                            'right': ''
                                        }).removeClass('fixed on')
                                        .stop()
                                        .animate({
                                            opacity: 1
                                        }, {
                                            duration: 100
                                        });
                                }
                            });
                        }
                        self.isFixed = false;
                    }
                }

                // 하단에 고정될 때는 fixed로 고정되기 때문에 right를 정확하게 계산해주어야 한다.
                if (self.isFixed && !animating) {
                    self.$el.css('right', right);
                    self.$btnTop.css('right', right + 13);
                }

                // 스크롤 할 때 열려 있다면 닫아준다.
                if (self.isOpened) {
                    self.close();
                }
                self.prevScrollLeft = self.scrollLeft;
                self.prevScrollTop = self.scrollTop;
                self.isLoaded = true;
            });
            handle({type: 'resize'});

            // 퀵 메뉴 열기/ 닫기
            self.on('click', '.menu_btn, .quick_close', function (e) {
                e.preventDefault();

                var isOpenButton = $(this).hasClass('menu_btn');
                if (isOpenButton) {
                    self.open();
                    self.$('.menu_list a:first').focus();
                } else {
                    self.close();
                    self.$('.menu_btn').focus();
                }
            }).on('keydown', function (e) {
                if (e.which === core.keyCode.ESCAPE) {
                    self.close();
                    self.$('.menu_btn').focus();
                }
            });
        },
        open: function () {
            this.$el.addClass('on');
            this.isOpened = true;
        },
        close: function () {
            this.$el.removeClass('on');
            this.isOpened = false;
        }
    });

    return core.ui('PersonalMainPage', {
        bindjQuery: true,
        defaults: {},
        selectors: {
            header: $('#header')
        },
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._bindEvents();
            self._buildSnapScroller();
            self._buildMovieBanner();
            self._buildQuickMenu();
        },
        _bindEvents: function () {
            var self = this;

            self.$('.ui_carousel').on('carouselafterchange carouselinit', function (e, carousel, index, newIndex) {
                if (!self.$header.hasClass('have_bg') && carousel.$slider.closest('.main_sec.active').length) {
                    self.$header.toggleClass('white_header', carousel.$slides.eq(index).hasClass('white_slider'));
                }
            });
        },
        _buildSnapScroller: function () {
            var self = this;
            self.snapScroller = new SnapScroller(self.el, {
                topOffset: $('#header').outerHeight(true),
                applyHeaderBg: true
            });
        },

        _buildMovieBanner: function () {
            var self = this;

            self.$('.ui_carousel_movie').vcCertainCarousel({
                speed: 300,
                autoplay: true,
                autoplaySpeed: 5000
            });

        },
        /*
        _buildMovieBanner: function () {
            var self = this;

            self.$('.movie_list_wrap').css('height', 500);
            var $items = self.$('.movie_list_wrap .m_item');
            if ($items.length < 10) {
                $('.movie_list_wrap ul').append($items.clone());
            }
            self.$('.ui_carousel_movie').vcCarousel({
                speed: 300,
                infinite: true,
                autoplay: true,
                autoplaySpeed: 3000,
                centerPadding: '60px',
                centerMode: true,
                slidesToShow: 7,
                //variableWidth: true,
                additionWidth: 300
            });
        },
        */
        _buildQuickMenu: function () {
            var self = this;

            self.quickMenu = new QuickMenu($('.quick_menu'));
        }
    })
});

define('ui/productTab', [
    'jquery',
    'vcui',
    'ui/smoothScroll'
], function ($, core) {
    return core.ui('ProductTab', {
        bindjQuery: true,
        defaults: {
            paging: 3
        },
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self.$panel = self.$('.ui_tab_panel');
            self.$list = self.$('.ui_producttab_list');

            self._build();
            self._bindEvents();
        },

        _build: function () {
            var self = this;

            // 탭에 스크롤 붙이기 ////////////////////////////////////////////
            self.$('.ui_slider_wrap').vcSmoothScroll({
                autoCenterScroll: true,
                prevButton: self.$('.ui_slider_prev'),
                nextButton: self.$('.ui_slider_next')
            });
            //////////////////////////////////////////////////////////////////

            self.$('.ui_tab_nav a').each(function () {
                $(this).html('<span class="ui_prod_name">' + this.innerText + '</span>');
            });
        },

        _bindEvents: function () {
            var self = this;
            var $srOnly = $('<span class="hide">선택됨</span>'); // screen reader 용 히든텍스트

            // 탭클릭(일반탭이랑 구조가 달라서 탭모듈을 사용하지 않음)
            self.on('click', '.ui_tab_nav a', function (e) {
                var $btn = $(this);

                e.preventDefault();
                $btn.append($srOnly).aria('selected', 'true')
                    .parent().activeItem('on')
                    .siblings().find('a').aria('selected', 'false');
                self.filterProduct();
            });
            self.$('.ui_tab_nav:first a').trigger('click');

            // 보드타입 클릭시 (box <-> board)
            self.on('click', '.list_type_btn button', function (e) {
                var mode = this.className.indexOf('board') > -1 ? 'board' : 'box';

                self.$('.list_wrap').replaceClass('box_type board_type', mode + '_type');
                self.$('.list_type_btn > button.' + mode).activeItem('on').aria('selected', 'true')
                    .find('.hide').text('선택됨').end()
                    .siblings().aria('selected', 'false').find('.hide').text('');
            });

            if (self.options.paging) {
                // 더보기 클릭
                self.on('click', '.ui_producttab_button', function (e) {
                    var $last = self.$list.children('.visible').last();

                    self.filterProduct(true);
                    setTimeout(function () {
                        $last.nextAll('.visible:first').find(':focusable:first').focus(); // 이넘의 접근성!!
                    }, 100);
                });
            }
        },

        // 필터링
        filterProduct: function (isMore) {
            var self = this;
            var $btn = self.$('.ui_tab_nav.on').find('a');
            var title = $btn.find('.ui_prod_name').text();
            var type = $btn.data('type');
            var limit = $btn.data('limit') || self.options.paging;
            var $filtered;
            var $items;

            $filtered = self.$list.children().hide().removeClass('visible')
                .filter(type === 'all' ? '[data-type]' : '[data-type="' + type + '"]');

            self.$('.titSpa_m').html(title + ' <em class="em">' + $filtered.length + '</em>');

            if (self.options.paging) {
                if (isMore) {
                    $btn.data('limit', limit += self.options.paging);
                }
                $items = $filtered.slice(0, limit).show().addClass('visible');
                self.$list.next('.more_ajax').toggle($filtered.length > 3 && $filtered.length > $items.length);
            } else {
                $filtered.show().addClass('visible');
            }
        }
    })
});

// aria 속성 추가 함수
$.fn.aria = function (name, value) {
    if (arguments.length === 1 && vcui.isString(name)) {
        return this.attr('aria-' + name);
    }

    return this.each(function () {
        if (vcui.isString(name)) {
            this.setAttribute('aria-' + name, value);
        } else {
            vcui.each(name, function (v, n) {
                this.setAttribute('aria-' + n, v);
            }.bind(this));
        }
    });
};

$.fn.buildCommonUI = function () {
    vcui.require(['ui/accordion', 'ui/calendar', 'ui/scrollview', 'ui/tab', 'ui/collapseToggler', 'ui/selectbox', 'ui/checkboxAllChecker', 'ui/dropmenu', 'ui/toggler'], function () {
        this.find('.ui_accordion').vcAccordion();
        this.find('.ui_calendar').vcCalendar();
        this.find('.ui_scrollview').vcScrollview();
        this.find('.ui_tab').vcTab();
        this.find('.ui_collapse').vcCollapseToggler();
        this.find('.ui_selectbox').vcSelectbox();
        this.find('[data-check-all]').vcCheckboxAllChecker();
        this.find('.ui_dropmenu').vcDropmenu();
        this.find('.ui_toggler').vcToggler();
    }.bind(this));
    return this;
};