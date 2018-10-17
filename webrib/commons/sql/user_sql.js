module.exports = {
  'sql_info': {
	//유저 정보   
    user_info: "select ID,USER_ID,USE_YN " +
    		"from user_main " +
    		"where ID = ?1 and use_yn = 'Y';",
    //유저 보유 포인트     		
    user_money: "select ID, FORMAT(MONEY,0) MONEY " +
    		"from user_money " +
    		"where ID = ?1 ;",
    //기부 모금함 전체 수		
    dn_info_cnt: "SELECT COUNT(1) cnt " +
    		"from dn_main "+
    		"WHERE (TO_DAYS(START_DATE) < TO_DAYS(CURRENT_DATE())) AND (TO_DAYS(END_DATE) > TO_DAYS(CURRENT_DATE())) ",
    //기부 모금함 정보		
    dn_info: "select DN_ID,TITLE,ORIGIN,IMAGE,STATE,START_DATE,END_DATE,"+
	         "FORMAT((SUM_MONEY/TOT_MONEY)*100,0) as RATE,FORMAT(SUM_MONEY,0) as SUM_MONEY,FORMAT(TOT_MONEY,0) as TOT_MONEY,"+
	         "TO_DAYS(end_date) - TO_DAYS(CURRENT_DATE()) AS LIMITDAY "+
    		"from dn_main " +
    		"where DN_ID in (?1, ?2, ?3) ;",
    //기부 모금함 간략정보		
    dn_content_info : "SELECT TITLE,IMAGE,ORIGIN,FORMAT(TOT_MONEY,0) AS TOT_MONEY " + 
    			 "FROM dn_main " +
    			 "WHERE DN_ID = ?1 ;",
    //기부 모금함 상세내용 (기부 이전 이후 포함) 				 
    dn_content : "SELECT CON_ID,DN_ID,SUB_TITLE,CONTENT,SUB_FILE_ID "+
 		         "FROM dn_content " +
 		         "WHERE DN_ID = ?1 " +
 		         "AND SUB_DIVINE = ?2 ;",
 	//기부 모금함 리스트       
    user_dn_hist : "SELECT A.USER_ID,A.DN_ID,A.DN_POINT,A.DN_DATE,IFNULL(B.TITLE_AF,B.TITLE) AS TITLE,B.ORIGIN,IFNULL(B.IMAGE_AF,B.IMAGE) AS IMAGE, "+
    			   "FORMAT((B.SUM_MONEY/B.TOT_MONEY)*100,0) as RATE,FORMAT(B.SUM_MONEY,0) as SUM_MONEY,FORMAT(B.TOT_MONEY,0) as TOT_MONEY, "+
    			   "IF(TO_DAYS(B.END_DATE) > TO_DAYS(CURRENT_DATE()),'Y','N') as INGYN "+
				   "FROM user_donate A, dn_main B " +
				   "WHERE A.DN_ID = B.DN_ID AND A.USER_ID = ?1 ;",
	//유저가 기부한 포인트 			   
	user_dn_point : "SELECT FORMAT(DN_POINT,0) AS DN_POINT FROM user_donate WHERE DN_ID = ?1 AND USER_ID = ?2 ;",
	//기부 포인트 사용 내역
	dn_point_details : "SELECT FORMAT(DETAIL_POINT,0) AS DETAIL_POINT, DETAIL_CON FROM dn_details WHERE DN_ID = ?1 ;"
		
  }
};