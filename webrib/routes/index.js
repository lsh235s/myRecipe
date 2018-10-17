var express = require('express');
var router = express.Router();
var link_info = require('../commons/com_con').main_ip;
var user_info = require('../commons/vo/user_vo').user_vo;
var mysql_dbc = require('../commons/db_con')();
var date_util = require('date-utils');
var pool = mysql_dbc.init();



/* GET home page. */
router.get("/", function(req, res){
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	if("startmanager"!=req.session.UR_ID){
	 res.render("index", {url:link_info,user_id:ur_id});
	}else{
		res.redirect(link_info+"manager");
	}
});


router.get("/about", function(req, res){
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	 res.render("about", {url:link_info,user_id:ur_id});
});

router.get("/services", function(req, res){
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	 res.render("services", {url:link_info,user_id:ur_id});
});


//firstroom
router.get("/information", function(req, res){
	var loginYN = "";
	console.log("information:"+user_info.user_id);
	if(undefined!=req.session.UR_ID){
		loginYN = "Y"
	}
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	 res.render("information", {url:link_info,login:loginYN,user_id:ur_id});
});

//firstroom
router.get("/signature", function(req, res){
	var loginYN = "";
	if(undefined!=req.session.UR_ID){
		loginYN = "Y"
	}
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	 res.render("signature", {url:link_info,login:loginYN,user_id:ur_id});
});


//firstroom
router.get("/curved", function(req, res){
	var loginYN = "";
	if(undefined!=req.session.UR_ID){
		loginYN = "Y"
	}
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	 res.render("curved", {url:link_info,login:loginYN,user_id:ur_id});
});


//firstroom
router.get("/standard", function(req, res){
	var loginYN = "";
	if(undefined!=req.session.UR_ID){
		loginYN = "Y"
	}
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	 res.render("standard", {url:link_info,login:loginYN,user_id:ur_id});
});


//firstroom
router.get("/focus", function(req, res){
	var loginYN = "";
	if(undefined!=req.session.UR_ID){
		loginYN = "Y"
	}
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	 res.render("focus", {url:link_info,login:loginYN,user_id:ur_id});
});


//firstroom
router.get("/foodzon", function(req, res){
	var loginYN = "";
	if(undefined!=req.session.UR_ID){
		loginYN = "Y"
	}
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	 res.render("foodzon", {url:link_info,login:loginYN,user_id:ur_id});
});

//join
router.get("/sign", function(req, res){
	 res.render("sign", {url:link_info});
});

//forget
router.get("/forget", function(req, res){
	 res.render("forget", {url:link_info});
});

router.post("/idcheck", function(req, res){
	var userId = req.body.userId;
	
	pool.getConnection(function (err, connection) {
        // Use the connection
	    var sql = "select count(1) as cnt from USER_MAIN where USER_ID = '" +userId +"'" ;
	    	
	    console.log("sql:"+sql);
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            console.log("qwewe:"+rows[0].cnt);
            connection.release();
            
            if(rows[0].cnt > 0 ){
            	 res.send("error");
            }else{
            	 res.send("success");
            }
        }); 
    });
	
});

router.post("/signprocess", function(req, res){
	var newDate = new Date();
	var time = newDate.toFormat('YYYYMMDD'); 
	var fname = req.body.fname;
	var userId = req.body.userId;
	var pass = req.body.pass;
	var birth = req.body.birth;
	var phone = req.body.phone;
	var adr = req.body.adr;
	var school = req.body.school;
	var exam = req.body.exam;

   pool.getConnection(function (err, connection) {
        // Use the connection
	    var sql = "INSERT INTO USER_MAIN (USER_ID,PASSWORD,NAME,PHONE,ADDRESS,BRITHDAY,EXAM,SCHOOL,REG_DATE) VALUES" +
	    		"('" + userId + "','" + pass + "','" + fname + "','"+phone+"','"+adr+"','"+birth+"','"+exam+"','"+school+"','"+time+"');" ;
	    
	    console.log("sql:"+sql);
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            req.session.UR_ID = userId;
            req.session.save();
            console.log("qwewe:"+user_info.user_id);
            connection.release();
            
            res.redirect(link_info);

        });
    });
});

//login
router.get("/login", function(req, res){
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	
	 res.render("login", {url:link_info,user_id:ur_id});
});


//loginclear
router.post("/loginclear", function(req, res){
	 delete req.session.UR_ID;
	 req.session.save();
	 res.send("success");
});


//login
router.post("/loginprocess", function(req, res){
	var user_id = req.body.user_id;
	var user_pw = req.body.user_pw;

	 
	 pool.getConnection(function (err, connection) {
	        // Use the connection
		    var sql = "select count(1) as cnt from USER_MAIN where USER_ID = '" +user_id +"' and PASSWORD = '" +user_pw+ "';";
		    	
		    console.log("sql:"+sql);
	        connection.query(sql, function (err, rows) {
	            if (err) console.error("err : " + err);
	            console.log("rows : " + JSON.stringify(rows));

	            console.log("qwewe:"+rows[0].cnt);
	            connection.release();
	            
	            if(rows[0].cnt > 0 ){
	            	req.session.UR_ID = user_id;
			    	req.session.save();
	            	 res.send("success");
	            }else{
	            	 user_info.user_id = "";
	            	 res.send("error");
	            }
	        }); 
	    });
});


//contact
router.get("/contact", function(req, res){
	var ur_id = "";
	if(""!= req.session.UR_ID && undefined!=req.session.UR_ID){
		ur_id = req.session.UR_ID;
	}
	
	 res.render("contact", {url:link_info,user_id:ur_id});
});

//reservation
router.get("/reservation", function(req, res){
    var UR_ID = req.session.UR_ID;
	if(undefined==req.session.UR_ID ){
		res.redirect(link_info+"errorpage");
	}else{
		delete req.session.UR_ID;
		req.session.save(function(){
			req.session.UR_ID = UR_ID;
			req.session.save();
		});
	}
	
	 pool.getConnection(function (err, connection) {
	        // Use the connection
		    var sql = "SELECT USER_ID,ROOMNUM,STARTDATE,ENDDATE,DATETIME FROM USER_RESERVATION WHERE USER_ID = '" +UR_ID + "';";

		    	
		    console.log("sql:"+sql);
	        connection.query(sql, function (err, rows) {
	            if (err){ 
	            	console.error("err : " + err) ;
	            	res.send("error");
	            }
	            console.log("rows : " + JSON.stringify(rows));

	            connection.release();
	            
	            res.render("reservation", {url:link_info ,user_id:UR_ID,reserows:rows});
	            
	            	 
	        }); 
	    });
});


//예약하기
router.post("/reservating", function(req, res){
	if(undefined==req.session.UR_ID ){
		res.redirect(link_info+"errorpage");
	}else{
		var UR_ID = req.session.UR_ID;
		delete req.session.UR_ID;
		req.session.save(function(){
			req.session.UR_ID = UR_ID;
			req.session.save();
		});
	}
	
	var startDate = req.body.startDatepicker;
	var endDate = req.body.endDatepicker;
	var dateTime = req.body.dateTime;
	var roomnum = req.body.roomnum;
	var user_id = req.body.user_id;
	var newDate = new Date();
	var time = newDate.toFormat('YYYYMMDD'); 

	 
	 pool.getConnection(function (err, connection) {
      // Use the connection
		 
		var sql = "select count(1) cnt from USER_RESERVATION " +
				  "where USER_ID = '"+user_id+"' " +
				  "AND ((STARTDATE <= '"+startDate+"' AND ENDDATE >= '"+startDate+"')" +
				  "OR (STARTDATE <= '"+endDate+"' AND ENDDATE >= '"+endDate+"')) ;"
         
	    var sql2 = "insert into USER_RESERVATION (USER_ID,ROOMNUM,STARTDATE,ENDDATE,DATETIME,REG_DATE,MOD_DATE) values " +
	              "('"+user_id+"','"+roomnum+"','"+startDate+"','"+endDate+"','"+dateTime+"','"+time+"','"+time+"');";
		
		var sql3 = "SELECT NAME FROM USER_MAIN WHERE USER_ID = '"+ user_id +"';";
		
		var sql4 = "select * from USER_TOKEN";
		
	    	
	    console.log("sql:"+sql);
      connection.query(sql, function (err, rows) {
          if (err){ 
          	console.error("err : " + err) ;
          	res.send("error");
          }
          console.log("rows : " + JSON.stringify(rows));
          
          if(rows[0].cnt > 0 || ""==user_id || undefined==user_id){
          	 res.send("resererror");
          }else{
          	 console.log("sql2:"+sql2);
          	connection.query(sql2, function (err, rows) {
          	    if (err){ 
                  	console.error("err : " + err) ;
                  	res.send("error");
                  }else{
                	  connection.query(sql3, function (err, rows) {
                    		if (err){ 
                            	console.error("err : " + err) ;
                            	res.send("error");
                            }else{
								var name = rows[0].NAME;
                            	connection.query(sql4, function (err, rows) {
                            		if(err){
                            			
                            		}else{
                            			var serverKey = mysql_dbc.fcm_key();
                            			console.log("cont:"+rows.length);
                            			for(var i =0 ; i < rows.length; i++){
        	                            	var client_token = rows[i].TOKEN;
        	                            	
        	                            	var push_data = {
        	                    			 // 수신대상
        	                    			 to: client_token,
        	                    			 // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
        	                    			 notification: {
        	                    			     title: "시작독서실",
        	                    			     body: name+"("+user_id+")님이 예약하였습니다." ,
        	                    			    // sound: "default",
        	                    			    // click_action: "FCM_PLUGIN_ACTIVITY",
        	                    			     icon: "fcm_push_icon"
        	                    			 },
        	                    			 // 메시지 중요도
        	                    			 priority: "high",
        	                    			 // App 패키지 이름
        	                    			 restricted_package_name: "mypush.example.admin.fcmapp",
        	                    			 // App에게 전달할 데이터
        	                    			 data: {
        	                    			     num1: 2000,
        	                    			     num2: 3000
        	                    			 }
        	                    			};
        	                            	
        	                            	/** 아래는 푸시메시지 발송절차 */
        	                            	var fcm = new FCM(serverKey);
        	
        	                            	fcm.send(push_data, function(err, response) {
        	                            	 if (err) {
        	                            	     console.error('Push메시지 발송에 실패했습니다.');
        	                            	     console.error(err);
        	                            	     return;
        	                            	 }
        	
        	                            	 console.log('Push메시지가 발송되었습니다.');
        	                            	 console.log(response);
        	                            	});
                            			}
                                    	res.send("success");
                            		}
                            	});
                            }
                	  });
                  }
          	});
          }
          connection.release();
          	 
      }); 
  });
	 
});

//error
router.get("/errorpage", function(req, res){
	res.render("errorpage", {url:link_info});	
});


//manager
router.get("/manager", function(req, res){
	if(undefined==req.session.UR_ID ){
		res.redirect(link_info+"errorpage");
	}else{
		var UR_ID = req.session.UR_ID;
		delete req.session.UR_ID;
		req.session.save(function(){
			req.session.UR_ID = UR_ID;
			req.session.save();
		});
	}
	
	 pool.getConnection(function (err, connection) {
        // Use the connection
		var sql1 = "select COUNT(1) AS cnt from USER_MAIN;";
	    var sql2 = "select * from USER_MAIN limit 0 , 10;";
	    	
	    console.log("sql:"+sql1);
        connection.query(sql1, function (err, rows1) {
            if (err) console.error("err : " + err);
            console.log("조회값 : " + rows1[0].cnt);

            connection.query(sql2, function (err, rows2) {
                if (err) console.error("err : " + err);

                connection.release();
                
                res.render("manager", {url:link_info,nowpage:1,total:rows1[0].cnt,result:rows2,sel_user_id:"",sel_name:"",sel_phone:"",sel_reg_date:""});
                
            }); 
            
        }); 
    });
});

router.post("/managerprocess", function(req, res){
	if(undefined==req.session.UR_ID ){
		res.redirect(link_info+"errorpage");
	}else{
		var UR_ID = req.session.UR_ID;
		delete req.session.UR_ID;
		req.session.save(function(){
			req.session.UR_ID = UR_ID;
			req.session.save();
		});
	}
	
	var user_id = req.session.UR_ID;
	
	 pool.getConnection(function (err, connection) {
       // Use the connection
	    var sql = "select * from USER_MAIN where USER_ID = '"+user_id+"';";
	    	
	    console.log("sql:"+sql);
       connection.query(sql, function (err, rows) {
           if (err) console.error("err : " + err);
           console.log("rows : " + JSON.stringify(rows));

           connection.release();
           
           var result = {result:rows}
           res.send(result);
           
       }); 
   });
});


router.post("/managerserch", function(req, res){
	if(undefined==req.session.UR_ID ){
		res.redirect(link_info+"errorpage");
	}else{
		var UR_ID = req.session.UR_ID;
		delete req.session.UR_ID;
		req.session.save(function(){
			req.session.UR_ID = UR_ID;
			req.session.save();
		});
	}
	
	var user_id = req.body.user_id;
	var name = req.body.name;
	var phone = req.body.phone;
	var reg_date = req.body.reg_date;
	var startpage = req.body.startpage;
	var selectpage = startpage;
	
	if("" == startpage){
		startpage = 0;
	}else{
		startpage = (startpage -1 ) * 10
	}
	
	
	 pool.getConnection(function (err, connection) {
       // Use the connection
		var sql1 = "select COUNT(1) AS cnt from USER_MAIN where 1=1 ";
	    var sql2 = "select * from USER_MAIN where 1=1 ";
	    
	    if("" != user_id){ 
	    	sql2 = sql2+" AND USER_ID = '"+user_id+"'"; 
	    	sql1 = sql1+" AND USER_ID = '"+user_id+"'"; 
	    }
	    if("" != name){ 
	    	sql2 = sql2+" AND NAME like '%"+name+"%'"; 
	    	sql1 = sql1+" AND NAME like '%"+name+"%'"; 
	    }
	    if("" != phone){ 
	    	sql2 = sql2+" AND PHONE like '%"+phone+"%'"; 
	    	sql1 = sql1+" AND PHONE like '%"+phone+"%'"; 
	    }
	    if("" != reg_date){ 
	    	sql2 = sql2+" AND REG_DATE >= '"+reg_date+"'";
	    	sql1 = sql1+" AND REG_DATE >= '"+reg_date+"'";
	    }
	    sql2 = sql2+" limit "+parseInt(startpage)+" , 10";
	    sql1 = sql1+";";
	    sql2 = sql2+";";
	    	
	    console.log("managerserchsql:"+sql2);
	    connection.query(sql1, function (err, rows1) {
            if (err) console.error("err : " + err);
            console.log("조회값 : " + rows1[0].cnt);

            connection.query(sql2, function (err, rows2) {
	           if (err) console.error("err : " + err);
	
	           connection.release();
	           
	           res.render("manager", {url:link_info,nowpage:selectpage,total:rows1[0].cnt,result:rows2,sel_user_id:user_id,sel_name:name,sel_phone:phone,sel_reg_date:reg_date});
            });     
       }); 
   });
});


//manager
router.get("/resermanager", function(req, res){
	if(undefined==req.session.UR_ID ){
		res.redirect(link_info+"errorpage");
	}else{
		var UR_ID = req.session.UR_ID;
		delete req.session.UR_ID;
		req.session.save(function(){
			req.session.UR_ID = UR_ID;
			req.session.save();
		});
	}
	
	 pool.getConnection(function (err, connection) {
        // Use the connection
		var sql1 = "select COUNT(1) AS cnt FROM USER_MAIN A,USER_RESERVATION B WHERE A.USER_ID = B.USER_ID;";
	    var sql2 = "SELECT A.USER_ID, A.NAME, A.PHONE, B.ROOMNUM, B.STARTDATE, B.ENDDATE , B.DATETIME, B.SEATNUM FROM USER_MAIN A,USER_RESERVATION B WHERE A.USER_ID = B.USER_ID limit 0 , 10;";
	    	
	    console.log("sql:"+sql1);
        connection.query(sql1, function (err, rows1) {
            if (err) console.error("err : " + err);
            console.log("조회값 : " + rows1[0].cnt);

            connection.query(sql2, function (err, rows2) {
                if (err) console.error("err : " + err);

                connection.release();
                
                res.render("resermanager", {url:link_info,nowpage:1,total:rows1[0].cnt,result:rows2,sel_user_id:"",sel_name:"",sel_phone:"",sel_reg_date:""});
                
            }); 
            
        }); 
    });
});



router.post("/resmanagerprocess", function(req, res){
	if(undefined==req.session.UR_ID ){
		res.redirect(link_info+"errorpage");
	}else{
		var UR_ID = req.session.UR_ID;
		delete req.session.UR_ID;
		req.session.save(function(){
			req.session.UR_ID = UR_ID;
			req.session.save();
		});
	}
	
	var user_id = req.body.user_id;
	
	 pool.getConnection(function (err, connection) {
       // Use the connection
	    var sql = "SELECT A.USER_ID, A.NAME, A.PHONE, B.ROOMNUM, B.STARTDATE, B.ENDDATE , B.DATETIME,B.REG_DATE , B.SEATNUM FROM USER_MAIN A,USER_RESERVATION B WHERE A.USER_ID = B.USER_ID AND A.USER_ID = '"+user_id+"';";
	    	
	    console.log("sql:"+sql);
       connection.query(sql, function (err, rows) {
           if (err) console.error("err : " + err);

           connection.release();
           
           var result = {result:rows}
           res.send(result);
           
       }); 
   });
});


router.post("/resmanagerserch", function(req, res){
	if(undefined==req.session.UR_ID ){
		res.redirect(link_info+"errorpage");
	}else{
		var UR_ID = req.session.UR_ID;
		delete req.session.UR_ID;
		req.session.save(function(){
			req.session.UR_ID = UR_ID;
			req.session.save();
		});
	}
	
	var user_id = req.body.user_id;
	var name = req.body.name;
	var phone = req.body.phone;
	var reg_date = req.body.reg_date;
	var startpage = req.body.startpage;
	var selectpage = startpage;
	
	if("" == startpage){
		startpage = 0;
	}else{
		startpage = (startpage -1 ) * 10
	}
	
	
	 pool.getConnection(function (err, connection) {
       // Use the connection
		var sql1 = "select COUNT(1) AS cnt FROM USER_MAIN A,USER_RESERVATION B WHERE A.USER_ID = B.USER_ID ";
	    var sql2 = "select A.USER_ID, A.NAME, A.PHONE, B.ROOMNUM, B.STARTDATE, B.ENDDATE , B.DATETIME, B.SEATNUM,B.REG_DATE  FROM USER_MAIN A,USER_RESERVATION B WHERE A.USER_ID = B.USER_ID ";
	    
	    if("" != user_id){ 
	    	sql2 = sql2+" AND A.USER_ID = '"+user_id+"'"; 
	    	sql1 = sql1+" AND A.USER_ID = '"+user_id+"'"; 
	    }
	    if("" != name){ 
	    	sql2 = sql2+" AND A.NAME like '%"+name+"%'"; 
	    	sql1 = sql1+" AND A.NAME like '%"+name+"%'"; 
	    }
	    if("" != phone){ 
	    	sql2 = sql2+" AND B.ROOMNUM like '%"+phone+"%'"; 
	    	sql1 = sql1+" AND B.ROOMNUM like '%"+phone+"%'"; 
	    }
	    if("" != reg_date){ 
	    	sql2 = sql2+" AND B.STARTDATE >= '"+reg_date+"'";
	    	sql1 = sql1+" AND B.STARTDATE >= '"+reg_date+"'";
	    }
	    sql2 = sql2+" limit "+parseInt(startpage)+" , 10";
	    sql1 = sql1+";";
	    sql2 = sql2+";";
	    	
	    console.log("managerserchsql:"+sql2);
	    connection.query(sql1, function (err, rows1) {
            if (err) console.error("err : " + err);
            console.log("조회값 : " + rows1[0].cnt);

            connection.query(sql2, function (err, rows2) {
	           if (err) console.error("err : " + err);
	
	           connection.release();
	           
	           res.render("resermanager", {url:link_info,nowpage:selectpage,total:rows1[0].cnt,result:rows2,sel_user_id:user_id,sel_name:name,sel_phone:phone,sel_reg_date:reg_date});
            });     
       }); 
   });
});

router.get("/verify", function(req, res){
	var loginYN = "";
	if(undefined!=req.session.UR_ID){
		loginYN = "Y"
	}
	 res.render("verify", {url:link_info});
});

/** fcm-node 모듈 설치 필요 */
//--> npm install fcm-mode --save
var FCM = require('fcm-node');



router.get("/pushsend", function(req, res){

	/** Firebase(구글 개발자 사이트)에서 발급받은 서버키 */
	//가급적 이 값은 별도의 설정파일로 분리하는 것이 좋다.
	var serverKey = 'AAAA2a4dMuY:APA91bFIJsrlmq6zHFeEKwNBKSDni4WIr1VBBcdNo1OvwOC4ik_7tFUcI-V1HjI3k_TLlLYfFgjZY-9G0N90-aetiTGGnOvlrf0DyBBukyPAFdeWD57stT_EXdfdtG4h-oOd2BR9-QMr';

	/** 안드로이드 단말에서 추출한 token값 */
	//안드로이드 App이 적절한 구현절차를 통해서 생성해야 하는 값이다.
	//안드로이드 단말에서 Node server로 POST방식 전송 후,
	//Node서버는 이 값을 DB에 보관하고 있으면 된다.
	var client_token ='e9wP2J57dQs:APA91bEpSw87KwbdpA2AnspGCCxWCGipYGwCHRDA8XB6UZrjUYrNFg_m9KaP11icaBR5n5qPpC0vTLWX71rs5wgo5pDYZTUDrqJKmix4aqHI2mjYFPHbiai-ia1uaCwWcTADA_5hoTHq'; 

	/** 발송할 Push 메시지 내용 */
	var push_data = {
	 // 수신대상
	 to: client_token,
	 // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
	 notification: {
	     title: "Hello Node",
	     body: "Node로 발송하는 Push 메시지 입니다.",
	   //  sound: "default",
	  //   click_action: "FCM_PLUGIN_ACTIVITY",
	     icon: "fcm_push_icon"
	 },
	 // 메시지 중요도
	 priority: "high",
	 // App 패키지 이름
	 restricted_package_name: "mypush.example.admin.fcmapp",
	 // App에게 전달할 데이터
	 data: {
	     num1: 2000,
	     num2: 3000
	 }
	};

	/** 아래는 푸시메시지 발송절차 */
	var fcm = new FCM(serverKey);

	fcm.send(push_data, function(err, response) {
	 if (err) {
	     console.error('Push메시지 발송에 실패했습니다.');
	     console.error(err);
	     return;
	 }

	 console.log('Push메시지가 발송되었습니다.');
	 console.log(response);
	});
});


router.post("/pushinput", function(req, res){
	var token = req.body.Token;
	
	console.log(token);
	
	 pool.getConnection(function (err, connection) {
	       // Use the connection
	    var sql = "INSERT INTO USER_TOKEN (token) values ('"+token+"')";
	    	
	    console.log("sql:"+sql);
       connection.query(sql, function (err, rows) {
           if (err) console.error("err : " + err);

           connection.release();
           
           var result = {result:rows}
           res.send(result);
           
       }); 
   });
	 
});

router.post("/exceldown", function(req, res){
	var user_id = req.body.user_id;
	var name = req.body.name;
	var phone = req.body.phone;
	var reg_date = req.body.reg_date;
	var startpage = req.body.startpage;
	var excelkind = req.body.excelkind;
	
	var excel = require('exceljs');
	var workbook = new excel.Workbook();
	
	var tempfile = require('tempfile');
	var worksheet = workbook.addWorksheet('MySheet');
	
	if("excelmanager" == excelkind){
		worksheet.columns = [
	        { header: '아이디', key: 'USER_ID', width: 10 },
	        { header: '이름', key: 'NAME', width: 10 },
	        { header: '연락처', key: 'PHONE', width: 10 },
	        { header: '주소', key: 'ADDRESS', width: 35 },
	        { header: '생년월일', key: 'BRITHDAY', width: 10 },
	        { header: '준비중시험', key: 'EXAM', width: 20 },
	        { header: '학교', key: 'SCHOOL', width: 10 },
	        { header: '가입일', key: 'REG_DATE', width: 10 }
	    ];
    }else{
    	worksheet.columns = [
            { header: '아이디', key: 'USER_ID', width: 10 },
            { header: '이름', key: 'NAME', width: 10 },
            { header: '연락처', key: 'PHONE', width: 10 },
            { header: '예약룸', key: 'ROOMNUM', width: 32 },
            { header: '예약시작일', key: 'STARTDATE', width: 20 },
            { header: '예약종료일', key: 'ENDDATE', width: 20 },
            { header: '예약기간', key: 'DATETIME', width: 10 },
            { header: '요청일', key: 'REG_DATE', width: 10 }
        ];
    }
	
    
	
	 pool.getConnection(function (err, connection) {
	       // Use the connection
		 	var sql1 = "select * from USER_MAIN where 1=1 ";
		    var sql2 = "select A.USER_ID, A.NAME, A.PHONE, B.ROOMNUM, B.STARTDATE, B.ENDDATE , B.DATETIME, B.SEATNUM,B.REG_DATE  FROM USER_MAIN A,USER_RESERVATION B WHERE A.USER_ID = B.USER_ID ";
		    
		    if("" != user_id){ 
		    	sql1 = sql1+" AND USER_ID = '"+user_id+"'"; 
		    	sql2 = sql2+" AND A.USER_ID = '"+user_id+"'"; 
		    }
		    if("" != name){
		    	sql1 = sql1+" AND NAME like '%"+name+"%'"; 
		    	sql2 = sql2+" AND A.NAME like '%"+name+"%'"; 
		    }
		    if("" != phone){
		    	sql1 = sql1+" AND ROOMNUM like '%"+phone+"%'";
		    	sql2 = sql2+" AND B.ROOMNUM like '%"+phone+"%'"; 
		    }
		    console.log("reg_date"+reg_date);
		    if("" != reg_date){
		    	sql1 = sql1+" AND STARTDATE >= '"+reg_date+"'";
		    	sql2 = sql2+" AND B.STARTDATE >= '"+reg_date+"'";
		    }
		    sql1 = sql1+";";	
		    sql2 = sql2+";";	    

		    console.log(sql1);
		    console.log(sql2);
		    
		    if("excelmanager" == excelkind){
		    	sqlmain = sql1;
		    }else{
		    	sqlmain = sql2;
		    }

            connection.query(sqlmain, function (err, rows2) {
	           if (err) console.error("err : " + err);
	
	           connection.release();
	           for(var i=0 ; i<rows2.length; i++){
	        	   if("excelmanager" == excelkind){
	        		   worksheet.addRow({USER_ID: rows2[i].USER_ID, NAME: rows2[i].NAME, PHONE: rows2[i].PHONE, ADDRESS: rows2[i].ADDRESS,BRITHDAY:rows2[i].BRITHDAY,EXAM:rows2[i].EXAM,SCHOOL:rows2[i].SCHOOL,REG_DATE:rows2[i].REG_DATE});
	        	   }else{
	        		   worksheet.addRow({USER_ID: rows2[i].USER_ID, NAME: rows2[i].NAME, PHONE: rows2[i].PHONE,ROOMNUM:rows2[i].ROOMNUM,STARTDATE:rows2[i].STARTDATE,ENDDATE:rows2[i].ENDDATE,DATETIME:rows2[i].DATETIME,REG_DATE:rows2[i].REG_DATE});
	        	   }
	           }
	           
	           var tempFilePath = tempfile('temp.xlsx');
	           
	           workbook.xlsx.writeFile(tempFilePath).then(function() {
	        	   res.sendFile(tempFilePath, function(err){
	        	        console.log('---------- error downloading file: ', err);
	        	    });
	        	   console.log('file is written');
	           });
            });     
       });
	
	
});


module.exports = router;
