/******************************************************************
 * (주)Etecus
 * =================================================================
 * 작성일 : 2014.12.04
 * 작성자 : 이난정
 * 파일명 : common.js
 * 상세설명 : 공통 JS 파일이다.  
 *   
 * =================================================================
 * 수정일         작성자             내용     
 * -----------------------------------------------------------------------
 * =================================================================
 */
var menuList = ""; //전역변수로 변경 by chopa 2018.03.13
$(function(){
	resizeIframe();
});

var Timer;
try{
	document.domain = 'skbroadband.com';
}catch(e){}
function resizeIframe(){
	try{
		var _iframe = 	document.getElementsByName("cyb_iframe")[0];
	    if (_iframe.contentWindow.document.documentElement) { //로딩속도에따른 처리
	        _iframe.style.height = _iframe.contentWindow.document.documentElement.scrollHeight + "px";
	    } else {
	        Timer = setTimeout(function() { resizeIframe(); }, 0);
	    }
	}catch(e){}
}

function doLoadingInitStart() {
	changeProtocol();
	doLoadingBarAppend("wrap"); 
	
}
function changeProtocol() {
	var path = window.location.pathname;
	var param = window.location.search;
	var url = path + param;
	if (path != "/common/captcha/AudioCaptcha.do" && path != "/common/attachfile/AttachFile_Read.do") {
		var urls = ["/product/join/Cs.do",
		            "/product/join/Cs_Page.do",
		               "/customer/inquiry/Counsel.do",
		               "/customer/inquiry/Counsel_Result.do",
		               "/common/IframeAuth_View.do",
		               "/common/Iframe_View.do",
		               "/corp/business/BizMember_Write.do",
		               "/corp/business/BizMember_Login.do",
		               "/corp/business/BizMember_Login_Proc.do",
		               "/corp/business/Cooperate_Write.do",
		               "/corp/business/BizMemberModify_Read.do",
		               "/popup/Eventwinner_Popup.do",
		               "/popup/EventWinner2_Popup.do",
		               "/popup/EventMyInfo_Popup.do",
		               "/mypage/event/Page.do?retUrl=/mypage/event/PrivacyJoinUseEvent",
		               "/customer/inquiry/Compensation_Write.do",
		               "/popup/SettopCert_Popup.do",
		               "/popup/Identify_Popup.do",
		               "/popup/Identify_Cs_Popup.do",
		               "/corp/aboutus/Counsel_Write.do",
		               "/popup/IdentifyCertNum_Popup.do",
		               "/popup/IdentifyCertNum_Cs_Popup.do",
		               "/popup/AboutusPage_Popup.do?retUrl=/popup/AboutusIdCheck_Popup",
		               "/corp/business/OpenInfo_Login.do",
		               "/corp/business/OpenInfo_Download.do",
		               "/corp/aboutus/CounselResult_Login.do",
		               "/corp/aboutus/CounselResult.do",
		               "/eng/about/ContactUs_Write.do",
		               "/content/event/Event_Views.do",
		               "/product/join/Event_Views.do",
		               "/popup/Zipcode_Popup.do",
		               "/popup/Page_Popup.do?retUrl=/popup/ServiceRegion_Popup",
		               "/popup/BusiessPage_Popup.do?retUrl=/popup/BizIdCheck_Popup",
		               "/popup/Event_kidsZone_Popup.do",
		               "/content/event/KidszoneEvent_List.do",
		               "/mypage/SubMain.do",
		               "/popup/Cs_Popup.do",
		               "/mypage/charges/Content_List.do",
		               "/mypage/goods/PasswordInit.do",
		               "/mypage/goods/SettopMy_List.do",
		               "/mypage/goods/SettopMySelect_List.do",
		               "/popup/CommentWrite_Popup.do",
		               "/popup/AdultPw_Popup.do",
		               "/popup/PwChange_Popup.do",
		               "/popup/BookMark_Popup.do",
		               "/product/join/Cs_Direct.do",
		               "/product/join/Cs_Direct_Complete.do",
		               "/content/channel/WeeklyWatch_Write.do",
		               "/content/event/kidsZoneDuplChk.do",
		               "/content/event/KidsZoneEvent_Create.do",
		               "/customer/inquiry/Compensation_List.do",
		               "/popup/kmc_auth_proc.do",
		               "/popup/SettopMyList_Popup.do",
		               "/popup/ContentList_Popup.do"
		               
		               ];
			var isSSL = false;
			for (var i = 0; i < urls.length; i++) {
				if ((path ==  urls[i]|| url.indexOf(urls[i]) > -1) && (param.indexOf("campaign_code=201270") == -1 && param.indexOf("campaign_code=201271") == -1 && param.indexOf("campaign_code=201272") == -1 && param.indexOf("campaign_code=201273") == -1)) {
					if (window.location.protocol != "https:") {
						$(location).attr("protocol", "https:");
					}
					isSSL = true;
				} 
				
			}
			if (!isSSL) {
				if (window.location.protocol != "http:") {
					$(location).attr("protocol", "http:");
				}
			}
		}
	}

function doLoadingInitPopupStart() {
	doLoadingBarAppend("pop-wrap");
	changeProtocol();
}

function fn_pageLog(type) {
	try{
		var t = document.title;
		var menu_tmp = t.split(" | ");
		var log_menu = "";
		
		for(var i = (menu_tmp.length-1); i > -1; i--){
    		log_menu += menu_tmp[i];
    		if(i > 0){
    			log_menu += ">";
    		}
    	}
		
		var url = '/common/PrintLog_Ajax.do';
		var param = 'log_menu=' + encodeURIComponent(log_menu);
		param += (type > '')? '&action_type=' + type : '';
		$.post(url, param);
	}catch(e){};
}

/* Body Loading Bar Append */
function doLoadingBarAppend(id) {

	$("div[id=" + id +"]").append(
			'<div id="loading" style="display:none;">'
					+ '<div id="loadingContent">' + '</div>'
					+ '<div id="resultHTML" style="display:none;"></div>'
					+ '</div>');

}
/* menu_id 에 연결된 menu_url 경로 찾기*/
function fn_url(menu_id, url){
	
	if(url == null||url == ""||url == "#"){
		if (menuList != null && menuList.length > 0) {
			$.each(menuList,function(idx, obj){
					if(obj.menu_id == menu_id){
						
						return fn_page(obj.menu_id, obj.menu_url);
					}
			});
		}
	} else {		
		window.location = url;
	}

}

/* 가입상담 이동 */
function fn_moveCs(campaign_code) {
	var host = $(location).attr("host");
	var url =  'https://' + host + '/product/join/Cs.do';
	campaign_code = getQuerystring('_C_', campaign_code);
	ib_no = getQuerystring('ib_no', "");

	if (campaign_code > '') {
		url += '?campaign_code=' + campaign_code;
		if (ib_no > '') {
			url += '&ib_no=' + ib_no;
		}
	}else{
		if (ib_no > '') {
			url += '?ib_no=' + ib_no;
		}
	}
	
	

	
	location.href = url;
}

/* Get QueryString Value */
function getQuerystring(key, default_) {
	if (default_ == null) default_= ""; 
	key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
	var qs = regex.exec(window.location.href);
	if(qs == null)
		return default_;
	else
		return qs[1];
}

/* 페이지 이동*/
function fn_page (menu_id, url) {
	if(url==null||url==""||url=="#"){
		return;
	} else {
		var host = $(location).attr("host");
		if (url.indexOf("http") != 0) {
		
			if (url.indexOf("ucyber.skbroadband.com") > -1 || url.indexOf("ucybdev.skbroadband.com") > -1 ||  url.indexOf("/product/join/Cs.do") > -1 || url.indexOf("ucybdev.skbroadband.com") > -1 || url.indexOf("ucybtest.skbroadband.com") > -1) {
				url = "https://" + host + url;
			} else{
				url = "http://" + host + url;
			}
		} 
		window.location = url;
	}
	

}
function fn_biz_url()  {
	var retUrl = $(location).attr("host");
	//window.location = "http://"+ retUrl +":81";
	window.location = "http://biz.skbroadband.com";
}



/*
 * 서버통신 공통모듈(Post) 서버통신을 위한 파라미터는 form 변수에서 모두 정의한다. formId: form ID url: 서버통신
 * url callback: 서버통신 종료후 구현될 callback명 
 */
function doSubmit(formId, url, callback, message) {
	$.post(url, $("form[id=" + formId + "]").serializeArray(), function(data) {
	
		
	$("#resultHTML").html(data);

		var resultType = $("input[id=resultType]").val();

		if (resultType == 'invalid.session') {
			// alert('invalid.session');
		} else {

			if (resultType == 'error.sys') {
				alert('시스템 오류가 발생 하였습니다.\n장애가 장시간 지속되는 경우,  국번없이 106 으로 문의해 주시기 바랍니다.');
			} else if (resultType == 'error.biz') {
				// 비즈니스 로직에서 발생한 메세지
				alert(document.getElementById("error_message").innerHTML);
			} else {
				if (message != undefined && message != "") {
					alert(message);
				}

				// User collback
				eval(callback + '(data)');
			}
		}
	});
}


function fn_go_login(rtnUrl) {
	var skb_rtnUrl = "http://www.skbroadband.com" + rtnUrl;
	var url = "/UcyberLogin.do?retUrl="+skb_rtnUrl;
	fn_url('', url);
	
}
/*
 * 서버통신 공통모듈(첨부파일 - submit) 서버통신을 위한 파라미터는 form 변수에서 모두 정의한다. formId: form ID
 * url: 서버통신 url callback: 서버통신 종료후 구현될 callback명
 */
function doSubmit4File(formId, url, callback, message) {


	 	var arrLength = arguments.length;
		$("form[id=" + formId + "]").ajaxSubmit({
						url : url,
						type : "post",
						success : function(data) {

							$("#resultHTML").html(data);

							var resultType = $("input[id=resultType]").val();
							if (resultType == 'invalid.session') {
								// alert('invalid.session');
							} else {
								if (resultType == 'error.sys') {
									var error_message = document
											.getElementById("error_message").innerHTML;
									if (error_message
											.indexOf("Maximum upload size of") == 0) {
										alert('최대 파일 업로드 크기를 초과 하였습니다.\n최대 업로드 크기: 4 GB');
									} else {
										alert('시스템 오류가 발생 하였습니다.\n장애가 장시간 지속되는 경우,  국번없이 106 으로 문의해 주시기 바랍니다.');
									}
								} else if (resultType == 'error.biz') {
									// 비즈니스 로직에서 발생한 메세지
									alert(document
											.getElementById("error_message").innerHTML);
								} else {
									if (arrLength == 3) {
										var operationName = "";
										if (new RegExp("Create.do", "i")
												.test(url)) {
											operationName = "저장";
										} else if (new RegExp("Update.do", "i")
												.test(url)) {
											operationName = "저장";
										} else if (new RegExp("Delete.do", "i")
												.test(url)) {
											operationName = "삭제";
										}

										if (operationName != "") {
											message = operationName + " 되었습니다.";
										}
									}

									// CUD 성공 Or Error
									if (message != undefined && message != "") {
										alert(message);
									}

									// User collback
									eval(callback + '(data)');
								}
							}
						}
					});
					

}


function doAjax(url, param, callback) {
	 $.ajax({
            url : url,
            type: "post",
            data : param,
            success : function(responseData){
                var data = responseData;
            	// User collback
				eval(callback + '(data)');
            },
            error : function(request, status, error){
              // alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
		 });
}
// Div 객체 제어
function doDivSH(op, divName, time) {
	if (op == "show") {
		$("#" + divName).show(time);
	} else if (op == "hide") {
		$("#" + divName).hide(time);
	} else if (op == "toggle") {
		$("#" + divName).toggle();
	} else if (op == "empty") {
		$("#" + divName).empty();
	} else if (op == "slideUp") {
		$("#" + divName).slideUp(time);
	} else if (op == "slideDown") {
		$("#" + divName).slideDown(time);
	} else if (op == "slideToggle") {
		$("#" + divName).slideToggle(time);
	}
}
/* Null 체크 및 공백제거 */
function isNullAndTrim(checkValue, strMessage) {
	$(checkValue).val(ltrim($(checkValue).val()));
	$(checkValue).val(rtrim($(checkValue).val()));
	return isNull($(checkValue), strMessage);
}

/* 문자열 좌측의 공백 제거 처리 함수 */
function ltrim(para) {
	while (para.substring(0, 1) == ' ')
		para = para.substring(1, para.length);
	return para;
}
/* 문자열 우측의 공백 제거 처리 함수 */
function rtrim(para) {
	while (para.substring(para.length - 1, para.length) == ' ')
		para = para.substring(0, para.length - 1);
	return para;
}
/* Null 체크 */
function isNull(checkValue, strMessage) {
	if ($(checkValue).val() == "") {
		alert(strMessage);
		var id = checkValue.id;
		if ($(checkValue).is(':visible')) {
			$(checkValue).focus();
		}

		return false;
	}
	return true;
}
/* 라디오 버튼 값 체크 */
function isRadioValueChk(checkName, strMessage) {
	var val = $('input:radio[name=' + checkName + ']:checked').val();
	if (val == "" || val == null) {
		alert(strMessage);
		return false;
	}
	return true;
}
/* IP 체크 */
function isValidIPAddress(ipaddr, strMessage) {
	var ip = $(ipaddr).val();
	var re = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
	if (re.test(ip)) {
		var parts = ip.split(".");
		if (parseInt(parseFloat(parts[0])) == 0) {
			alert(strMessage);
			ipaddr.focus();
			return false;
		}
		for ( var i = 0; i < parts.length; i++) {
			if (parseInt(parseFloat(parts[i])) > 255) {
				alert(strMessage);
				ipaddr.focus();
				return false;
			}
		}
		return true;
	} else {
		alert(strMessage);
		ipaddr.focus();
		return false;
	}
}
/* 전화 번호 체크 */
function isValidPhone(phone) {
	if (!isNullAndTrim(phone, "연락처를 입력해주세요.")) {
		$(phone).focus();
		return false;
	} else {
		var phoneStr = $(phone).val();
		var len = phoneStr.split("-").length;
		var phoneRe = "";
		if (len == 2) {
			phoneRe = /^\d{3,4}-\d{4}$/;
		} else if (len == 3) {
			phoneRe = /^\d{2,3}-\d{3,4}-\d{4}$/;
		} else {
			phoneRe = /^\d{4}$/;
		}

		if (!phoneRe.test()) {
			if ($(phone).val().length == 4) {
				alert("연락처는 [숫자]만 입력 가능 합니다.\n다시 입력해주세요.");
			} else {
				alert("연락처는 [숫자,-]만 입력 가능 합니다.\n다시 입력해주세요.");
			}

			$(phone).focus();
			return false;
		}
	}
	return true;
}
/* 메일체크 */
function isValidEmail(email) {
	if (!isNullAndTrim($(email), "메일주소를 입력해주세요.")) {
		$(email).focus();
		return false;
	}
	var mailRe = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	if ($(email).val().length < 6 || !mailRe.test($(email).val())) {
		alert("메일형식이 맞지 않습니다.\n다시 입력해주세요.");
		$(email).focus();
		return false;
	}
	return true;
}
/* 숫자 체크 */
function isValidNumber(checkValue, strMessage) {
	var s = $(checkValue).val();
	s += ''; // 문자열로 변환
	s = s.replace(/^\s*|\s*$/g, ''); // 좌우 공백 제거

	if (s == '' || isNaN(s) || s.indexOf(".") > -1 || s.indexOf("-") > -1) {
		alert(strMessage);
		$(checkValue).focus();
		return false;
	}
	return true;
}

/* 상세보기 이미기 resize */
function fn_ImgResize(maxwidth) {

	jQuery('table').filter('.table_style1').find('.comment').find('img').each(
			function() { // each는
				// 각각에
				// 대해
				// 적용한다는
				// 의미입니다.
				var imgwidth = $(this).width(); // 해당 img의 속성 중 폭(width)의 값
				if (imgwidth > maxwidth) { // 폭이 650을 초과할 때에만 줄임

					var imgheight = $(this).attr("HEIGHT"); // 해당 img의 속성 중
					// 높이(height)의 값
					var ratio = imgwidth / imgheight; // 비율
					var newHeight = Math.round(maxwidth / ratio); // 새 높이는
																	// 가로650으로
																	// 원래
					// 비율에 맞춤

					$(this).css({
						height : newHeight,
						width : maxwidth,
						cursor : 'pointer'
					});
					$(this).click(function() {
						window.open($(this).attr('src'));
					});

				}
			});
}

/* 자리수 만큼 빈 자리에 0 넣기 */
function leadingZeros(n, digits) {
	var zero = '';
	n = n.toString();

	if (n.length < digits) {
		for ( var i = 0; i < digits - n.length; i++) {
			zero += '0';
		}
	}
	return zero + n;
}

/*
 * 오늘 날짜 를 날짜 필드에 넣는다. formId : 날짜 필드 id
 */
function setToday(formId) {

	var $form = $("#" + formId);
	var date = new Date();

	// 현재날짜
	var yyyy = leadingZeros(date.getFullYear(), 4);
	var mm = leadingZeros(date.getMonth() + 1, 2);
	var dd = leadingZeros(date.getDate(), 2);

	var hypDate = yyyy + "-" + mm + "-" + dd;
	$form.val(hypDate);
}
/*
 * 오늘 날짜 기준으로 한달 뒤의 날짜 필드에 넣는다. formId : 날짜 필드 id
 */
function setOneMonth(formId) {

	var $form = $("#" + formId);
	var date = new Date();
	var bfOndMM = new Date(new Date(date).setMonth(date.getMonth() + 2));

	// 현재날짜에서 한달 뒤 날짜
	var yyyy = leadingZeros(bfOndMM.getFullYear(), 2);
	var mm = leadingZeros(bfOndMM.getMonth(), 2);
	var dd = leadingZeros(bfOndMM.getDate(), 2);

	var hypDate = yyyy + "-" + mm + "-" + dd;

	$form.val(hypDate);

}
/* 오늘 날짜를 구한다. */
function getToday(split) {
	var date = new Date();
	
	if (split == '') {
		split = '-';
	}

	// 현재날짜
	var yyyy = leadingZeros(date.getFullYear(), 4);
	var mm = leadingZeros(date.getMonth() + 1, 2);
	var dd = leadingZeros(date.getDate(), 2);

	var hypDate = yyyy + split + mm + split + dd;
	return hypDate;
}

/*
 * 날짜 형식 validation 체크 obj : date(YYYY-MM-DD), label : NULL Check, 자릿수 Check, 형식
 * Check false : true 반환
 */
function validationDate(obj, label) {

	var str = $(obj).val();
	var input = str.replace(/-/g, "");
	if (input == null || input == '') {
		alert(label + '이(가) 없습니다.');
		obj.focus();
		return false;
	}

	if (input.length != 8 || obj.length == 8) {
		alert(label + '의 날짜 형식이 맞지 않습니다.');

		obj.focus();
		return false;
	}

	var inputYear = input.substr(0, 4);
	var inputMonth = input.substr(4, 2) - 1;
	var inputDate = input.substr(6, 2);

	var resultDate = new Date(inputYear, inputMonth, inputDate);
	if (Number(inputYear) < 1753) {
		alert(label + '의 1753년 부터 입력 가능 합니다.');
		$(obj).focus();
		return false;
	}
	if (resultDate.getFullYear() != inputYear
			|| resultDate.getMonth() != inputMonth
			|| resultDate.getDate() != inputDate) {
		alert(label + '의 날짜 형식이 맞지 않습니다.');
		$(obj).focus();
		return false;
	}

	return true;
}
/*
 * 8자리 이상이 되면 "yyyy-mm-dd'로 변환 해준다.
 */
function setDateFormat(obj, label) {
	var str = $(obj).val();
	var input = str.replace(/-/g, "");
	var df = "";
	if (input.length == 8) {
		var inputYear = input.substr(0, 4);
		var inputMonth = leadingZeros(input.substr(4, 2), 2);
		var inputDate = input.substr(6, 2);
		df = inputYear + "-" + inputMonth + "-" + inputDate;
		$(obj).val(df);

		if (!validationDate(obj, label)) {
			$(obj).val("");
		}
	} else if (input.length > 8) {
		alert(label + '의 날짜 자리수가  맞지 않습니다.');
		$(obj).focus();
	}
}

/*
 * 시작일 종료일 Validation Check
 */
function compareDate(startObj, endObj) {

	var start = $(startObj).val();
	var end = $(endObj).val();

	// 년도, 월, 일로 분리
	var start_dt = start.split("-");
	var end_dt = end.split("-");

	// 월 - 1(자바스크립트는 월이 0부터 시작하기 때문에...)
	// Number()를 이용하여 08, 09월을 10진수로 인식하게 함.
	start_dt[1] = (Number(start_dt[1]) - 1) + "";
	end_dt[1] = (Number(end_dt[1]) - 1) + "";

	var from_dt = new Date(start_dt[0], start_dt[1], start_dt[2]);
	var to_dt = new Date(end_dt[0], end_dt[1], end_dt[2]);
	var compDate = (to_dt.getTime() - from_dt.getTime()) / 1000 / 60 / 60 / 24;
	if (compDate < 0) {
		alert("종료일을 시작일 이후로 지정해주세요.");

		return false;
	}
	return true;

}

/* 한글 & 영문 바이트 구하기 */
function chr_byte(chr) {
	if (escape(chr).length > 4) {
		return 2;
	} else {
		var unicode = chr.charCodeAt(0);
		if (unicode >= 65 && unicode <= 90) { // 대문자
			return 1.33;
		} else if (unicode >= 97 && unicode <= 122) {
			return 1.19;
		} else {
			return 1;
		}

	}

}
/* 팝업 띄우기 */
/**
 * 공통팝업 url, windowName, width, height, 스크롤여부
 */
function fn_popup(url, windowName, w, h, scroll, resize) {
	var LeftPosition = (screen.width) ? (screen.width - w) / 2 : 0;
	var TopPosition = (screen.height) ? (screen.height - h) / 2 : 0;
	if (resize == null || resize == '') {
		resize = 'yes';
	}
	var settings = 'height=' + h + ',width=' + w + ',top=' + TopPosition
			+ ',left=' + LeftPosition + ',scrollbars=' + scroll + ',resizable='
			+ resize;
	window.open(url, 'pop', settings);

}
function fn_popup2(url, windowName, w, h, scroll, resize) {
	var LeftPosition = (screen.width) ? (screen.width - w) / 2 : 0;
	var TopPosition = (screen.height) ? (screen.height - h) / 2 : 0;
	if (resize == null || resize == '') {
		resize = 'yes';
	}
	var settings = 'height=' + h + ',width=' + w + ',top=' + TopPosition
			+ ',left=' + LeftPosition + ',scrollbars=' + scroll + ',resizable='
			+ resize;
	window.open(url, windowName , settings);

}


/* 새창으로 이동*/
function fn_window(url) {
	 window.open(url, '_blank');
}

/* 한글 & 영문 바이트 구하기 */
function getByte(chr) {
	if (escape(chr).length > 4) {
		return 2;
	} else {
		return 1;
	}
}

/* 문자열 길이 체크 */
function isLengthChk(obj, maxLen, strMessage) {
	var objStr = $(obj).val();
	var len = objStr.length;
	var byte_count = 0;
	for ( var i = 0; i < len; i++) {
		byte_count += getByte(objStr.charAt(i));
	}
	if (byte_count > maxLen) {
		alert(strMessage);
		 $(obj).focus();
		return false;
	}
	return true;
}

/* 문자열에 COMMA 체크 */
function isCommaChk(obj, strMessage) {
	var objStr = $(obj).val();
	if (objStr.indexOf(",") > -1) {
		alert(strMessage);
		 $(obj).focus();
		return false;
	}
	return true;
}

/**
 * 동일한 이름의 체크 박스 checkd
 * 
 * @param name :
 *            check box 명
 * @param joinValue :
 *            "1,2,3"
 * @param spliStr
 */
function fn_checkBoxCheckd(name, joinValue, splitStr) {
	var val = joinValue.split(splitStr);
	for ( var i = 0; i < val.length; i++) {
		$("#contents input[name='" + name + "'][value='" + val[i] + "']").attr(
				"checked", true);
	}
}



function fn_number_validator(e) {

	if (isNaN($(e).val())) {
		alert("정수만 입력 가능합니다.");
		$(e).val("");
		$(e).focus();
	}
}
/*******************************************************************************
 * 함수명 : fn_GetEvent 설 명 : 키코드 정보 획득 사용법 : fn_GetEvent(event)
 ******************************************************************************/
function fn_GetEvent(e) {
	if (navigator.appName == 'Netscape') {
		keyVal = e.which;
	} else {
		keyVal = event.keyCode;
	}
	return keyVal;
}
/*******************************************************************************
 * 함수명 : fn_numbersonly 설 명 : 숫자만 입력되게 한다. 사용법 :
 * onkeydown="fn_numbersonly(event);" style="ime-mode:disabled"
 ******************************************************************************/
function fn_numbersonly(evt) {
	var myEvent = window.event ? window.event : evt;
	var isWindowEvent = window.event ? true : false;
	var keyVal = fn_GetEvent(evt);
	var result = false;
	if (myEvent.shiftKey) {
		result = false;
	} else {
		// '.'
		if ((keyVal >= 48 && keyVal <= 57) || (keyVal >= 96 && keyVal <= 105)
				|| (keyVal == 8) || (keyVal == 9) || (keyVal == 46)
				|| (keyVal == 37) || (keyVal == 39) || (keyVal == 17)
				|| (keyVal == 190)) {
			result = true;
		} else {
			alert("정수만 입력 가능합니다.");
			result = false;
		}
	}
	if (!result) {
		if (!isWindowEvent) {
			myEvent.preventDefault();
		} else {
			myEvent.returnValue = false;
		}
	}
}

String.prototype.comma = function() {
	tmp = this.split('.');
	var str = new Array();
	var v = tmp[0].replace(/,/gi, '');
	for ( var i = 0; i <= v.length; i++) {
		str[str.length] = v.charAt(v.length - i);
		if (i % 3 == 0 && i != 0 && i != v.length) {
			str[str.length] = '.';
		}
	}
	str = str.reverse().join('').replace(/\./gi, ',');
	return (tmp.length == 2) ? str + '.' + tmp[1] : str;
}

// 300자 이내
// 메세지 바이트 체크
function chkMsgLength(intMax, objMsg) {
	var length = lengthMsg($(objMsg).val());

	if (length > intMax) {
		alert("최대" + intMax + "Byte(한글 " + intMax / 2	+ "자)까지 입력 가능합니다.\r\n초과된 부분은 자동으로 삭제됩니다.");
		$(objMsg).val($(objMsg).val().replace(/\r\n$/, ""));
		$(objMsg).val(assertMsg(intMax, $(objMsg).val()));
	}
}

// 현재 메시지 바이트 수 계산
function lengthMsg(objMsg) {
	var nbytes = 0;
	for (var i = 0; i < objMsg.length; i++) {
		var ch = objMsg.charAt(i);
		if (escape(ch).length > 4) {
			nbytes += 2;
		} else if (ch == '\n') {
			if (objMsg.charAt(i - 1) != '\r') {
				nbytes += 1;
			}
		} else if (ch == '<' || ch == '>') {
			nbytes += 4;
		} else {
			nbytes += 1;
		}
	}
	return nbytes;
}

// xx 바이트 넘는 문자열 자르기
function assertMsg(intMax, objMsg) {
	var inc = 0;
	var nbytes = 0;
	var msg = "";

	var msglen = objMsg.length;

	for (var i = 0; i < msglen; i++) {
		var ch = objMsg.charAt(i);

		if (escape(ch).length > 4) {
			inc = 2;
		} else if (ch == '\n') {
			if (objMsg.charAt(i - 1) != '\r') {
				inc = 1;
			}
		} else if (ch == '<' || ch == '>') {
			inc = 4;
		} else {
			inc = 1;
		}

		if ((nbytes + inc) > intMax) {
			break;
		}

		nbytes += inc;
		msg += ch;
	}

	return msg;
}
/* 프린트*/
function fn_print() {
	self.print();
}
function fn_htmlLeftMenu(data) {
	var empty = "";
	var host = $(location).attr("host");
	
	menuList = data;  
	// 메뉴 ID가 있는 경우만 LEFT 메뉴 작업을 한다.
	if ($("#menu_id").length > 0) {
		$("#lnb .lnb-wrap").html('');  
		var curr_menu_id = $("#menu_id").val();
		var sub_cate_menu_id = curr_menu_id.substr(0, 3);
		
		$(".gnb-wrap>li").each(function() {
			$(this).removeClass();
		});
		if ("A" == curr_menu_id.substr(0, 1)) {
			$("#cate1").addClass("active-category");
		} else if ("B" == curr_menu_id.substr(0, 1)) {
			$("#cate2").addClass("active-category");
		} else if ("C" == curr_menu_id.substr(0, 1)) {
			$("#cate3").addClass("active-category");
		} else if ("D" == curr_menu_id.substr(0, 1)) {
			$("#cate4").addClass("active-category");
		} else if ("E" == curr_menu_id.substr(0, 1)) {
			if ("E01" == sub_cate_menu_id) {
				$("#cate1").addClass("active-category");
			} else if ("E02" == sub_cate_menu_id) {
				$("#cate2").addClass("active-category");
			} else if ("E03" == sub_cate_menu_id) {
				$("#cate3").addClass("active-category");
			}  else if ("E04" == sub_cate_menu_id) {
				$("#cate4").addClass("active-category");
			}
		}  else if ("G" == curr_menu_id.substr(0, 1)) {
			if ("G01" == sub_cate_menu_id) {
				$("#cate1").addClass("active-category");
			} else if ("G02" == sub_cate_menu_id) {
				$("#cate2").addClass("active-category");
			} else if ("G03" == sub_cate_menu_id) {
				$("#cate3").addClass("active-category");
			}  else if ("G04" == sub_cate_menu_id) {
				$("#cate4").addClass("active-category");
			}
		}
		
		var menu_id_depth_2 = curr_menu_id.substr(0, 3) + "000000";
		var menu_id_depth_3 = curr_menu_id.substr(0, 5) + "0000";
		var menu_id_depth_4 = curr_menu_id.substr(0, 7) + "00";
		
		$.each(data, function (key) {
			var menu_id = data[key].menu_id;
			var menu_depth = data[key].menu_depth;
			var menu_name = data[key].menu_name;
			var parent_menu_id = data[key].parent_menu_id;
			var menu_url = data[key].menu_url;
			var target_popup = data[key].target_popup;
			
			if (menu_url.indexOf("ucyber.skbroadband.com") > -1 || menu_url.indexOf("ucybdev.skbroadband.com") > -1 || menu_id== "E04070000"  || menu_id== "E04060000" || menu_id == "D03000000" || menu_id == "D03010000" || menu_id== "E04020000" || menu_id== "A04050100" || menu_id== "A04050200" || menu_id== "A04050300" || menu_id== "A01020000" || menu_url.indexOf("/product/join/Cs.do") > -1) {
				menu_url = "https://" + host + menu_url;
			} else if (menu_id == "C03020100") {
				menu_url = menu_url;
			} else if (target_popup == "Y" && (menu_url.length > 7 && (menu_url.substr(0,7) == "http://" || menu_url.substr(0,8) == "https://"))) {
				menu_url = menu_url;
			} else{
				menu_url = "http://" + host + menu_url;
			} 
			
			
			
			var title_img = "";
			if ("A" == menu_id.substr(0, 1)) {
				title_img = "/img/comm/tit_lnb_mypage.gif";	// 마이페이지
			} else if ("D" == menu_id.substr(0, 1)) {
				title_img = "/img/comm/tit_lnb_customer.gif"; // 고객센터
			} else if ("B01" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_custom01.gif"; // 맞춤상품찾기 
			} else if ("B02" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_product_combine.gif"; // 결합상품
			} else if ("B03" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_product_binternet.gif"; // B인터넷
			} else if ("B04" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_product_btv.gif"; // BTV
			} else if ("B05" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_product_bcall.gif"; // B전화
			} else if ("B06" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_product_bhome.gif"; // BHome
			} else if ("B07" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_product_join.gif"; // 가입센터
			} else if ("B08" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_product_sbiz.gif"; // 소상공인 전용상품
			} else if ("B09" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_product_nugu.gif"; // NUGU
			} else if ("C01" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_replay_vod.gif"; // VOD 다시보기 
			} else if ("C02" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_content_live.gif"; // 실시간 방송
			} else if ("C03" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_content_app.gif"; // 앱스/게임
			} else if ("C04" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_btv_channel.gif"; // B Tv 채널진 
			} else if ("C05" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_script_coursebook.gif"; // 대본 및 교육 교재 
			} else if ("C06" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_content_event.gif"; // 이벤트
			} else if ("E01" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_abouts.gif"; // 회사소개
			} else if ("E02" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_public.gif"; // 홍보센터
			} else if ("E03" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_invert.gif"; // 투자정보
			} else if ("E04" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_businesscoom.gif"; // 사업협력/제안
			} else if ("G01" == menu_id.substr(0, 3)) {
				title_img = "/img/corp/en/tit_lnb_about_sk.gif"; // ABOUT SK Broadband
			} else if ("G02" == menu_id.substr(0, 3)) {
				title_img = "/img/corp/en/tit_lnb_investor_relations.gif"; // INVESTOR RELATION
			} else if ("G03" == menu_id.substr(0, 3)) {
				title_img = "/img/corp/en/tit_lnb_resudential_service.gif"; // RESIDENTIAL SERVICE
			}else if ("G04" == menu_id.substr(0, 3)) {
				title_img = "/img/corp/en/tit_lnb_business_service.gif"; // BUSINESS SERVICE
			} else if ("H10" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/lnb_btamin.gif"; //비타민 
			} else if ("F05" == menu_id.substr(0, 3)) {
				title_img = "/img/comm/tit_lnb_privacy.gif"; //비타민 
			} 
			 
				if (menu_id.substr(0, 1) == "A" || menu_id.substr(0, 1) == "D") {
					if (curr_menu_id.substr(0, 1) == menu_id.substr(0, 1)) {
						if (menu_depth == "1") {
							$("#lnb .lnb-wrap").append('<strong><img src="' + title_img + '" alt="' +menu_name+ '"></strong>');
							$("#lnb .lnb-wrap").append('<ul class="lnb"></ul>');
						} else if (menu_depth == "2") {
							var html  = '';
							html +=  '<li id="li-' + menu_id  + '"';
							
							if (menu_id_depth_2 == menu_id) {
								html += ' class="active"';
							}
							
							html +=  '>';
							html +=  '<span><a href="'+menu_url +'"' + (target_popup == 'Y' ? ' onclick="javascript:fn_window(\'' + menu_url + '\');return false;"' : '  onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;"') + '>' + menu_name + '</a></span>';
							html +=  '</li>';
							$("#lnb .lnb-wrap .lnb").append(html);
							
						} else if (menu_depth == "3") {
							if ($("#lnb .lnb-wrap #li-" + parent_menu_id + ' .dep2').length == 0) {
								$("#lnb .lnb-wrap #li-" + parent_menu_id).append('<button type="button" class="toggle">하위메뉴 열기</button>');
								var dpeth3Ul = '';
								dpeth3Ul += '<ul class="dep2">';
								dpeth3Ul += '</ul>';
								$("#lnb .lnb-wrap #li-" + parent_menu_id).append(dpeth3Ul);
							}
							var depth3 = '';
							depth3 += '<li id="li-' + menu_id + '"';
							if (menu_id_depth_3 == menu_id) {
								depth3 += ' class="active"';
							}
							
							depth3 +=  '>';
							depth3 += '<span><a href="'+menu_url +'"' + (target_popup == 'Y' ? ' onclick="javascript:fn_window(\'' + menu_url + '\');return false;"' : ' onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;"') + '>' + menu_name + "</a></span>";
							depth3 += '</li>';
							
							$("#lnb .lnb-wrap #li-" + parent_menu_id + ' .dep2').append(depth3);
							
						} else if (menu_depth == "4") {
							if ($("#lnb .lnb-wrap #li-" + parent_menu_id + ' .dep3').length == 0) {
								$("#lnb .lnb-wrap #li-" + parent_menu_id + "").append('<button type="button" class="toggle">하위메뉴 열기</button>');
								var dpeth4Ul = '';
								dpeth4Ul += '<ul class="dep3">';
								dpeth4Ul += '</ul>';
								$("#lnb .lnb-wrap #li-" + parent_menu_id).append(dpeth4Ul);
								
							}
							var depth4 = '';
							depth4 += '<li id="li-' + menu_id + '"';
							if (menu_id_depth_4 == menu_id) {
								depth4 += ' class="active-d"';
							}
							depth4 +=  '>';
							depth4 += '<span><a href="'+menu_url +'"' + (target_popup == 'Y' ? ' onclick="javascript:fn_window(\'' + menu_url + '\');return false;"' : '  onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;"') + '>' + menu_name + "</a></span>";
							depth4 += '</li>';
							
							$("#lnb .lnb-wrap #li-" + parent_menu_id + ' .dep3').append(depth4);
						}
					}
					
				} else {
					if (menu_id.indexOf(sub_cate_menu_id) == 0) {

						if (menu_depth == "2") {
							if (menu_id.substr(0, 1) != "H") {
								$("#lnb .lnb-wrap").append('<strong><img src="' + title_img + '" alt="' +menu_name+ '"></strong>');
							} else {
								if ("H10" == menu_id.substr(0, 3)) {
									$("#lnb .lnb-wrap").append('<strong><img src="' + title_img + '" alt="' +menu_name+ '"></strong>');
								} else {
									$("#lnb .lnb-wrap").append('<strong>'+ menu_name +'</strong>');
								}
								
							}
							$("#lnb .lnb-wrap").append('<ul class="lnb"></ul>');
						} else if (menu_depth == "3") {
							var html  = '';
							html +=  '<li id="li-' + menu_id + '"';
							if (menu_id_depth_3 == menu_id) {
								html += ' class="active"';
							}
							
							html +=  '>';
							html +=  '<span><a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;">' + menu_name + '</a></span>';
							html +=  '</li>';
							$("#lnb .lnb-wrap .lnb").append(html);
						} else if (menu_depth == "4") {
							if ($("#lnb .lnb-wrap #li-" + parent_menu_id + ' .dep2').length == 0) {
								$("#lnb .lnb-wrap #li-" + parent_menu_id).append('<button type="button" class="toggle">하위메뉴 열기</button>');
								
								var dpeth2Ul = '';
								dpeth2Ul += '<ul class="dep2">';
								dpeth2Ul += '</ul>';
								$("#lnb .lnb-wrap #li-" + parent_menu_id).append(dpeth2Ul);
							}
							var depth2 = '';
							depth2 += '<li id="li-' + menu_id + '"';
							if (menu_id_depth_4 == menu_id) {
								depth2 += ' class="active"';
							}
							depth2 +=  '>';
							
							if (menu_id == 'C03020100') {
								depth2 += '<span><a href="'+menu_url +'" onclick="javascript:fn_window(\'' + menu_url + '\');return false;">' + menu_name + "</a></span>";
							} else {
								depth2 += '<span><a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;">' + menu_name + "</a></span>";
							}
							
							depth2 += '</li>';
							
							$("#lnb .lnb-wrap #li-" + parent_menu_id + ' .dep2').append(depth2);
						} else if (menu_depth == "5") {
							if ($("#lnb .lnb-wrap #li-" + parent_menu_id + ' .dep3').length == 0) {
								$("#lnb .lnb-wrap #li-" + parent_menu_id).append('<button type="button" class="toggle">하위메뉴 열기</button>');
								var dpeth3Ul = '';
								dpeth3Ul += '<ul class="dep3">';
								dpeth3Ul += '</ul>';
								$("#lnb .lnb-wrap #li-" + parent_menu_id).append(dpeth3Ul);
							}
							var depth3 = '';
							depth3 += '<li id="li-' + menu_id + '"';
							if (curr_menu_id == menu_id) {
								depth3 += ' class="active-d"';
							}
							depth3 +=  '>';
							depth3 += '<span><a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;">' + menu_name + "</a></span>";
							depth3 += '</li>';
							
							$("#lnb .lnb-wrap #li-" + parent_menu_id + ' .dep3').append(depth3);
						}
						
					}
				}
		});
		var temp = $("#lnb").html();
	
		
		var obj = {};
		obj.menu_id = $("#menu_id").val();
	
		doAjax("/common/LnbBanner_Ajax.do", obj, "fn_htmlLnbBanner");
	}
	lnb();
}
var cnt = 0;
function fn_htmlTopMenu(data) { 
	var empty = "";
	var host = $(location).attr("host");
	$.each(data, function (key) {
		var menu_id = data[key].menu_id;
		var menu_depth = data[key].menu_depth;
		var menu_url = data[key].menu_url;
		var menu_name = data[key].menu_name;
		var parent_menu_id = data[key].parent_menu_id;
		var target_popup = data[key].target_popup;

		if (menu_url.indexOf("ucyber.skbroadband.com") > -1 || menu_id== "A04050100" || menu_id== "A04050200" || menu_id== "A04050300" || menu_id== "A01020000" || menu_url.indexOf("ucybdev.skbroadband.com") > -1 || menu_id == "D03000000" || menu_id == "D03010000" || menu_url.indexOf("/product/join/Cs.do") > -1 || menu_url.indexOf("/mypage/SubMain.do") > -1) {
			menu_url = "https://" + host + menu_url;
		} else if (menu_id == "C03020100") {
			menu_url = menu_url;
		} else if (target_popup == "Y" && (menu_url.length > 7 && (menu_url.substr(0,7) == "http://" || menu_url.substr(0,8) == "https://"))) {
			menu_url = menu_url;
		} else{
			menu_url = "http://" + host + menu_url;
		} 
			
		if (menu_id.substr(0, 1) == "A" || menu_id.substr(0, 1) == "B" || menu_id.substr(0, 1) == "C"|| menu_id.substr(0, 1) == "D") {
			if (menu_depth == "1") {
				cnt ++;
				var depth1 = '';
				if (cnt == 4) {
					depth1 += '<li id="cate' + cnt + '" class="cs-center">';
				} else {
					depth1 += '<li id="cate' + cnt + '">';
				}
				
				depth1 += '<a href="'+menu_url +'"' + (target_popup == 'Y' ? ' onclick="javascript:fn_window(\'' + menu_url + '\');return false;"' : ' onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;"' ) + '>' + menu_name + "</a></li>"; 		
				$("#header #gnb .inner .gnb-wrap").append(depth1);
				
				
				} else if (menu_depth == "2") {
				if ($("#header #gnb .inner .gnb-wrap #cate" +  cnt + " .dep2").length == 0) {
					var depth2Div = '';
					depth2Div += '<div class="dep2 ';
					if (cnt == 1 || cnt == 4) {
						depth2Div += 'col5">';	
					} else if (cnt == 2) {
						depth2Div += 'col6">';	
					} else {
						depth2Div += 'col6">';	
					}
					depth2Div += '<ul id="ul-' + parent_menu_id + '">';
					depth2Div += '</ul>';
					depth2Div += '<div class="gnb-shadow"></div>';
					depth2Div += '</div>';
					
					$("#header #gnb .inner .gnb-wrap #cate" +  cnt).append(depth2Div);
					
				}
			
			var depth2 = '';
			depth2 += '<li id="cate-' + menu_id + '">';
			depth2 += '<a href="'+menu_url +'"' + (target_popup == 'Y' ? ' onclick="javascript:fn_window(\'' + menu_url + '\');return false;"' : ' onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;"') + '>' + menu_name + "</a>";
			depth2 += '</li>';
			
			$("#header #gnb .inner .gnb-wrap #cate" +  cnt  + " .dep2 #ul-" +  parent_menu_id).append(depth2);
			} else if (menu_depth == "3") {
				if ($("#header #gnb .inner .gnb-wrap  #cate-" + parent_menu_id + " .dep3").length == 0) {
					var dpeth3Ul = '';
					dpeth3Ul += '<ul class="dep3">';
					dpeth3Ul += '</ul>';
					$("#header #gnb .inner .gnb-wrap #cate-" + parent_menu_id).append(dpeth3Ul);
				}
				var depth3 = '';
				depth3 += '<li>'
				depth3 += '<a href="'+menu_url +'"' + (target_popup == 'Y' ? ' onclick="javascript:fn_window(\'' + menu_url + '\');return false;"' : ' onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;"') + '>' + menu_name + "</a>";
				depth3 += '</li>';
				$("#header #gnb .inner .gnb-wrap #cate-" + parent_menu_id + " .dep3").append(depth3);
			}
		
		}
		
	});
	
	gnb();
	
}

function fn_htmlCorpTopMenu(data) { 
	var empty = "";
	var host = $(location).attr("host");
	$.each(data, function (key) {
		var menu_id = data[key].menu_id;
		var menu_depth = data[key].menu_depth;
		var menu_url = data[key].menu_url;
		var menu_name = data[key].menu_name;
		var parent_menu_id = data[key].parent_menu_id;
		
		if (menu_url.indexOf("ucyber.skbroadband.com") > -1 || menu_url.indexOf("ucybdev.skbroadband.com") > -1  || menu_id == "E04070000" || menu_id== "E04060000" || menu_id== "E04020000") {
			menu_url = "https://" + host + menu_url;
		} else{
			menu_url = "http://" + host + menu_url;
		}  
		
		if (menu_depth == "2") {
			cnt ++;
			var depth1 = '';
			depth1 += '<li id="cate' + cnt + '">';
			depth1 += '<a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\'); return false;">' + menu_name + "</a></li>"; 		
			$("#header #gnb .inner .gnb-wrap").append(depth1);
			
			
		} else if (menu_depth == "3") {
			if ($("#header #gnb .inner .gnb-wrap #cate" +  cnt + " .dep2").length == 0) {
				var depth2Div = '';
				depth2Div += '<div class="dep2 ';
				if (cnt == 1) {
					depth2Div += 'col5">';	
				} else if (cnt == 2) {
					depth2Div += 'col3">';	
				} else if (cnt == 3) {
					depth2Div += 'col5">';	
				} else if (cnt == 4) {
					depth2Div += 'col5">';	
				}
				depth2Div += '<ul id="ul-' + parent_menu_id + '">';
				depth2Div += '</ul>';
				depth2Div += '<div class="gnb-shadow"></div>';
				depth2Div += '</div>';
				
				$("#header #gnb .inner .gnb-wrap #cate" +  cnt).append(depth2Div);
			}
			
			var depth2 = '';
			depth2 += '<li id="cate-' + menu_id + '">';
			depth2 += '<a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;">' + menu_name + "</a>";
			depth2 += '</li>';
			
			$("#header #gnb .inner .gnb-wrap #cate" +  cnt  + " .dep2 #ul-" +  parent_menu_id).append(depth2);
		} else if (menu_depth == "4") {
			if ($("#header #gnb .inner .gnb-wrap  #cate-" + parent_menu_id + " .dep3").length == 0) {
				var dpeth3Ul = '';
				dpeth3Ul += '<ul class="dep3">';
				dpeth3Ul += '</ul>';
				$("#header #gnb .inner .gnb-wrap #cate-" + parent_menu_id).append(dpeth3Ul);
			}
			var depth3 = '';
			depth3 += '<li>'
			depth3 += '<a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;">' + menu_name + "</a>";
			depth3 += '</li>';
			$("#header #gnb .inner .gnb-wrap #cate-" + parent_menu_id + " .dep3").append(depth3);
		}
		
		
		
	});
	
	gnb();
	
}


function fn_htmlEngTopMenu(data) { 
	var empty = "";
	$.each(data, function (key) {
		var menu_id = data[key].menu_id;
		var menu_depth = data[key].menu_depth;
		var menu_url = data[key].menu_url;
		var menu_name = data[key].menu_name;
		var parent_menu_id = data[key].parent_menu_id;
		
		if (menu_depth == "2") {
			cnt ++;
			var depth1 = '';
			depth1 += '<li id="cate' + cnt + '">';
			depth1 += '<a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\'); return false;"><span class="ir">' + menu_name + "</span></a></li>"; 		
			$("#header #gnb .inner .gnb-wrap").append(depth1);
			
			
		} else if (menu_depth == "3") {
			if ($("#header #gnb .inner .gnb-wrap #cate" +  cnt + " .dep2").length == 0) {
				var depth2Div = '';
				depth2Div += '<div class="dep2 ';
				if (cnt == 1) {
					depth2Div += 'col5">';	
				} else if (cnt == 2) {
					depth2Div += 'col5">';	
				} else if (cnt == 3) {
					depth2Div += 'col5">';	
				} else if (cnt == 4) {
					depth2Div += 'col6">';	
				}
				depth2Div += '<ul id="ul-' + parent_menu_id + '">';
				depth2Div += '</ul>';
				depth2Div += '<div class="gnb-shadow"></div>';
				depth2Div += '</div>';
				
				$("#header #gnb .inner .gnb-wrap #cate" +  cnt).append(depth2Div);
			}
			
			var depth2 = '';
			depth2 += '<li id="cate-' + menu_id + '">';
			depth2 += '<a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;">' + menu_name + "</a>";
			depth2 += '</li>';
			
			$("#header #gnb .inner .gnb-wrap #cate" +  cnt  + " .dep2 #ul-" +  parent_menu_id).append(depth2);
		} else if (menu_depth == "4") {
			if ($("#header #gnb .inner .gnb-wrap  #cate-" + parent_menu_id + " .dep3").length == 0) {
				var dpeth3Ul = '';
				dpeth3Ul += '<ul class="dep3">';
				dpeth3Ul += '</ul>';
				$("#header #gnb .inner .gnb-wrap #cate-" + parent_menu_id).append(dpeth3Ul);
				
			}
			var depth3 = '';
			depth3 += '<li>'
			depth3 += '<a href="'+menu_url +'" onclick="javascript:fn_url(\'' + empty + '\', \'' + menu_url + '\');return false;">' + menu_name + "</a>";
			depth3 += '</li>';
			$("#header #gnb .inner .gnb-wrap #cate-" + parent_menu_id + " .dep3").append(depth3);
		}
		
		
		
	});
	
	gnb();
	
}


function fn_htmlLnbBanner(data) {
	
	if (data.mainimagename!= null && data.mainimagename != '') {
		var html = '<div class="lnb-banner">';
		var empty = "";
		html += '<a href="' + data.linkurl  +'"  target="' + data.target + '"><img src="' + data.nas_path + data.mainimagepath + data.mainimagename+'" alt="' + data.mainimagenamealt + '" /></a>';
		html += '</div>';

		$(".lnb-banner").html('');
		$(".lnb-wrap").append(html);
	}
}

function fn_TextAreaInputLimit(name, count_nm, maxSize) {
	
	 var tempText = $("textarea[name='"+name+"']");

	 var tempChar = "";                                        // TextArea의 문자를 한글자씩 담는다
	 var tempChar2 = "";                                       // 절삭된 문자들을 담기 위한 변수
	 var countChar = 0;                                        // 한글자씩 담긴 문자를 카운트 한다
	 var tempHangul = 0;                                       // 한글을 카운트 한다
	 var tempLen = 0;
	 

	 // 글자수 바이트 체크를 위한 반복
	 for(var i = 0 ; i < tempText.val().length; i++) {
	     tempChar = tempText.val().charAt(i);
	     // 한글일 경우 2 추가, 영문일 경우 1 추가
	     if(escape(tempChar).length > 4) {
	         countChar += 2;
	         tempHangul++;

	     } else {
	         countChar++;
	     }
	     if(countChar <= maxSize){
	    	 tempLen = i+1;
	     }
	 }

	 // 카운트된 문자수가 MAX 값을 초과하게 되면 절삭 수치까지만 출력을 한다.(한글 입력 체크)
	 // 내용에 한글이 입력되어 있는 경우 한글에 해당하는 카운트 만큼을 전체 카운트에서 뺀 숫자가 maxSize보다 크면 수행

	 if(countChar > maxSize) {
	     alert("최대 글자수를 초과하였습니다.");
	     var count = countChar - maxSize;
	     tempChar2 = tempText.val().substr(0, tempLen);
	     tempText.val(tempChar2);
	     $("#"+count_nm).html(maxSize);
	 }
	 else {
	     $("#"+count_nm).html(countChar);
	 }
	} 

	function checkNum(textId){  
	    if ($("#" + textId).val().match(/[^0-9]/g) != null) {
	      alert("숫자만 입력 가능 합니다.");
	      $("#" + textId).val( $("#" + textId).val().replace(/[^0-9]/g, '') );
	    }
	}

	function checkMail(textId){  
	    if ($("#" + textId).val().match(/[^a-z0-9]/gi) != null) {
	      alert("영문과 숫자만 입력 가능 합니다.");
	      $("#" + textId).val( $("#" + textId).val().replace(/[^a-z0-9]/gi, '') );
	    }
	}
	
	function checkAlphaNum(textId){  
	    if ($("#" + textId).val().match(/[^a-z0-9]/gi) != null) {
	      alert("영문과 숫자만 입력 가능 합니다.");
	      $("#" + textId).val( $("#" + textId).val().replace(/[^a-z0-9]/gi, '') );
	    }
	}	
	// 이메일 유효성 검사
	function mailcheck(str1, str2)
	{
		var Email1 = $("#"+str1).val();
		var Email2 = $("#"+str2).val();
		
		var Email = Email1 + "@" + Email2;			

		var emailExp = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

		if(!emailExp.test(Email))
		{
			  alert("올바른 이메일주소를 입력해주세요.");
			  $("#"+str1).focus();
			  return false;    
		}
		return true;
	}		
	// 법인등록번호 유효성 검사
	function BizRegisterNo_Check(R_No) {
		  var re = /-/g;
		  R_No = R_No.replace('-','');

		  if (R_No.length != 13){
		   return false;
		  }
		  var arr_regno  = R_No.split("");
		  var arr_wt   = new Array(1,2,1,2,1,2,1,2,1,2,1,2);
		  var iSum_regno  = 0;
		  var iCheck_digit = 0;

		  for (i = 0; i < 12; i++){
		    iSum_regno +=  eval(arr_regno[i]) * eval(arr_wt[i]);
		  }
		  
		  iCheck_digit = 10 - (iSum_regno % 10);

		  iCheck_digit = iCheck_digit % 10;
		  if (iCheck_digit != arr_regno[12]){
		    return false;
		  }
		  return true;
	}
	
	// 사업자등록번호 유효성 검사
	function BizCorpNo_Check(C_No) {	   
		var w_c, w_e, w_f, w_tot;

		w_c = C_No.charAt(8) * 5;
		w_e = parseInt((w_c / 10), 10);
		w_f = w_c % 10;

		w_tot = C_No.charAt(0) * 1 + C_No.charAt(1) * 3 + C_No.charAt(2) * 7;
		w_tot += C_No.charAt(3) * 1 + C_No.charAt(4) * 3 + C_No.charAt(5) * 7;
		w_tot += C_No.charAt(6) * 1 + C_No.charAt(7) * 3 + C_No.charAt(9) * 1;
	    w_tot += (w_e + w_f);

		if (!(w_tot % 10)) {
			return true;
		}
		else {
			return false;
		}
	}	
	
	function id_check(input) {
		var err_cnt=0
		for (var i = 0; i < input.length; i++) {
			var val = input.charAt(i);
			if (!((val >= "0" && val <= "9") || (val >= "a" && val <= "z") || (val >= "A" && val <= "Z")))
				err_cnt ++
		}
		if (err_cnt == 0 ) return true;
		else 	return false;
	}

	function password_check(input) {
		var err_cnt=0
		for (var i = 0; i < input.length; i++) {
			var val = input.charAt(i);

			if (   ((val == ",")  || (val == "'"))  )
				err_cnt ++
		}
		if (err_cnt == 0 ) return true;
		else 	return false;
	}	
	
	function fn_length_chk(name, lng, title) {
		
		if (name.val().length < lng) {
			alert(title+" 길이가 짧습니다");
			name.focus();
			return false;
		}
		return true;
	}

	function fn_onload_error() {
		//비즈니스 로직에서 발생한 메세지: link 인 경우에만 발생
		fn_pageLog('1');
		alert($("#error_message").html());
		history.go(-1);
	}

	function fn_onload_auth_error() {
		//비즈니스 로직에서 발생한 메세지: link 인 경우에만 발생
		fn_pageLog('1');
		alert($("#error_message").html());
		fn_skb();
	}
	
	// 이전화면
	function fn_back() {
		history.go(-1);
	}

	function fn_skb() {
		window.location = "http://www.skbroadband.com";
	}
	
	function fn_removeclass() {
		
		$(".inCont").removeClass("inCont");
		$("#lnb").remove();
		//$("#main-container").html("");
		if ($('div[id=main-container]').length > 1) {
			$('div[id=main-container]').eq(0).remove();
		} 
	}	
	
	function commify(n) {
	  var reg = /(^[+-]?\d+)(\d{3})/;   // 정규식
	  n += '';                          // 숫자를 문자열로 변환
	
	  while (reg.test(n))
	    n = n.replace(reg, '$1' + ',' + '$2');
	
	  return n;
	}
	
	function fn_logout_proc(){
		window.location = "/Logout1.do?retUrl=/Main.do";
	}
	
	function fn_logout() {
		var count = 1;
			var repeat = setInterval(function(){
				count--;
				if(count == 0 ){
					fn_logout_proc();
				}
			}, 1); 
		
	}	
	
	function fn_ucyber_login() {
			var retUrl = $(location).attr("pathname");
			var str = "";
			var form_id = "";
			var param_form = "";
			$("form").each(function() {
				form_id = $(this).attr("id");
				if (form_id != "frmHeaderSearch") {
					param_form = form_id;
				}
			});
			if (retUrl != "/Main.do") {
				str = $("#" + param_form).serialize()+"&lgn_type=ucyber";
			}
			fn_go_login(retUrl + "?"+encodeURIComponent(str));
		}
		 
		
	// 이벤트 관련 function 
	
	function eventLoignCheckV(eventSeq){
	   var id = $('#sessionUserId', parent.document).val();
		if (id == null || id == '')
		{
			if (confirm("로그인 후 이용가능합니다. \n\n로그인 하시겠습니까?"))
			{
				parent.location.href = "/UcyberLogin.do?retUrl=http://www.skbroadband.com/content/event/Event_View.do?event_seq="+eventSeq;//이벤트 번호
				return false;
			}else{
				return false;
			}
			return false;
		} else {
			return true;
		}
	}
	
		
	// 이벤트 페이지 textarea , text 에 ", "문자 치환 (체크박스에서 사용)
	function eventCheckBoxCheck(thisForm){
	 
			var frmCnt;
			var cFrm; 
			var frNm; 
			var tmpFrm; 
			var strValue; 
			frmCnt = thisForm.elements.length;  
			for (i = 0 ; i <= frmCnt-1 ; i++ )
			{
				var cFrm = thisForm[i]; 
				if (cFrm.type.toLowerCase() == "textarea" || cFrm.type.toLowerCase() == "text"  )
				{  
					frNm = cFrm.name; 
					tmpFrm = eval("thisForm."+frNm) ;   
					strValue = tmpFrm.value;
					for (j=0; j<strValue.length ; j++ )
					{ 
						strValue = strValue.replace(/, /g, ",") ;
					}
					tmpFrm.value = strValue; 
				}
			} 
	}
	 

	
		// 문자열 체크
	function LengthCheck( strValue, strName, lowLength, highLength )
	{
		var nsize = 0;

		nsize = GetLength(strValue);

		if ( lowLength > 0 && nsize == 0 ) {
			msg = "[" + strName + "] : 입력해주십시오!";
			alert(msg);
			return false;
		}

		if ( nsize < lowLength || nsize > highLength ) {
			if ( lowLength == highLength ) {
				msg = "[" + strName + "] : " + lowLength + "자를 입력해주십시오!\r\n\r\n (주의: 한글 1자는 2자로 계산함.)";
				alert(msg);
				return false;
			} else {
				msg = "[" + strName + "] : " + lowLength + " - " + highLength + " 자를  입력해주십시오!\r\n\r\n (주의: 한글 1자는 2자로 계산함.)";
				alert(msg);
				return false;
			}	
		}
		else
			return true;
	}

	// 문자열 길이를 읽음
	function GetLength( strValue )
	{
		var nsize = 0;
		var chrOrig;
		var charEscaped;

		for( var intinx = 0; intinx <= strValue.length -1 ; intinx++ ){
			chrOrig = strValue.substring(intinx,intinx+1);
			chrEscaped = escape(chrOrig);
			if ( chrEscaped.substring(0,2) == "%u" )
				nsize = nsize + 2;
			else
				nsize++;
		}
		return nsize;
	}

	/*######################################################################
	# trim
	######################################################################*/
	function trim(str)
	{
		var arrStr = new Array();
		var lenStr;
		var rtnStr = "";
		
		if(str == null)
			return "";

		lenStr = str.length;
		for (var i = 0; i <lenStr; i++){
			arrStr[i] = str.charAt(i);
		
			if (arrStr[i] == " "){
				if (i > 0){
					if (!arrStr[i - 1]) arrStr[i] = "";
				} else {
					arrStr[i] = "";
				}
			}
		}
		
		for (i = lenStr - 1; i >= 0; i--){
			if (arrStr[i] == " ")
			{
				if (i < lenStr - 1){
					if (!arrStr[i + 1])
						arrStr[i] = "";
				} else {
					arrStr[i] = "";
				}
			}
		}
		
		for (i = 0; i < lenStr; i++)
			if (arrStr[i])
				rtnStr += arrStr[i];
		
		return rtnStr;
	}


$(document).ready(function($) {

	//占쏙옙占쏙옙 占쏙옙천占쏙옙품 占쏙옙회
	var rec_product = $("#recommend_product_wrap");
	if(rec_product.length>0){ // by chopa 2017.11.27
		$.ajax({
			 url: "/common/Recommend_Product_Ajax.do",
		     data: {
		         menu_id : $("#menu_id").val()
		     },
		     dataType: "html"
			}).done(function (html) {
				if($.trim(html) == ''){
					// 관련 추천상품이 존재하지 않을 경우 영역을 숨긴다.
					$("#recommend_product_wrap").parents('.anchor_cont').hide();
				}else{
					$('#recommend_product_wrap').empty();
					$('#recommend_product_wrap').html($.trim(html));
				}
			}); 
	}
	

	// by chopa 2017.11.27
	$(document).on('change', '#sub_all_product_sel', function() {		
		var category_code =  $(this).find('option:selected').data('cate-type');
		var product_code = $(this).find('option:selected').data('prod-type');
		
		$.ajax({
			 url: "/common/Sub_All_Product_Ajax.do",
		     data: {
		    	 category_code : category_code,
		    	 product_code : product_code
		     },
		     dataType: "html"
			}).done(function (html) {
				$('#sub_all_product_list').empty();
				$('#sub_all_product_list').html($.trim(html));
			}); 
	});

});

//20180312 jhPark 파일 js 추가
function downloadFile(nas_path, file_path, file_name){
	$("#resultHTML").html("<iframe name='filedownload' style='width:0px;height0px;display:none'></iframe>");
	var formData = "<form name='fileForm' method='post' target='_self' action='/common/attachfile/AttachFile_Read.do?file_name=" + encodeURIComponent(file_name )+ "&file_org_name=" + encodeURIComponent(file_name) + "&file_path=" + nas_path + file_path + "'></form>";
	$(formData).appendTo('body').submit().remove();
	fn_pageLog('2');
}


/**
 * 기본 이미지에서 사이즈 변경 처리
 * changeSizeName
 * _206x296
 *	_224x329
 *	_95x136
 */

function fnImgSizeName(image, changeSizeName){
	var len = image.length;
	var last = image.lastIndexOf("."); //확장자 추출
	if( last == -1 ){ //. 를 발견하지 못한다면.
		return image;
	}else{
		var sFileName = image.substring(0, image.lastIndexOf('.'));
		var sFileExtension = image.substring(image.lastIndexOf('.'),image.length);

	 	return sFileName + changeSizeName + sFileExtension;
	 	
	}
}

/**
 *  순차적으로 이미지 사이즈 처리
 * _206x296
 *	_224x329
 *	_95x136
 */
function fnImgErrorChange(objSrc, oriSrc){
	if(objSrc.lastIndexOf("_206x296.") > -1){
		return fnImgSizeName(oriSrc, "_224x329");
	}else if(objSrc.lastIndexOf("_224x329.") > -1){
		return fnImgSizeName(oriSrc, "_95x136");
	}else if(objSrc.lastIndexOf("_95x136.") > -1){
		return fnImgSizeName(oriSrc, "");
	}else{
//		return fnImgSizeName("/common/img/tv/common/no_img.jpg", "");			//빈 이미지 처리시
		return fnImgSizeName("/img/comm/img_vod_def_thumbnail.jpg", "");		//btv 이미지 존재 하지 않을 경우
	}
}


/**
 *  순차적으로 이미지 사이즈 처리 (상세화면)
 *	_224x329
 * _206x296
 *	_95x136
 */
function fnImgErrorViewChange(objSrc, oriSrc){
	if(objSrc.lastIndexOf("_224x329.") > -1){
		return fnImgSizeName(oriSrc, "_206x296");
	}else if(objSrc.lastIndexOf("_206x296.") > -1){
		return fnImgSizeName(oriSrc, "_95x136");
	}else if(objSrc.lastIndexOf("_95x136.") > -1){
		return fnImgSizeName(oriSrc, "");
	}else{
//		return fnImgSizeName("/common/img/tv/common/no_img.jpg", "");			//빈 이미지 처리시
		return fnImgSizeName("/img/comm/img_vod_def_thumbnail.jpg", "");		//btv 이미지 존재 하지 않을 경우
	}
}
		