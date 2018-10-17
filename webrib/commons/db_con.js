var mysql = require('mysql');
var config = require('../commons/db_info').db_info.local;

module.exports = function () {
  return {
    init: function () {
      return mysql.createPool({
    	connectionLimit: config.connectionLimit,
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database
      })
    },
    
    fcm_key : function (){
    	var key = 'AAAA2a4dMuY:APA91bFIJsrlmq6zHFeEKwNBKSDni4WIr1VBBcdNo1OvwOC4ik_7tFUcI-V1HjI3k_TLlLYfFgjZY-9G0N90-aetiTGGnOvlrf0DyBBukyPAFdeWD57stT_EXdfdtG4h-oOd2BR9-QMr';
    		
    	return key; 	
    } , 
    client_key : function (){
    	var key = 'cqxb1JX5Hc0:APA91bEMWlt_PGL974SU3GdBpVJMu9Tn-j3tua9Ejzp7CC2pYnwPy5UYQzT28tv9UGC1zBnsopJLefRlcDlSuVFZNE8rnY2z131XcBwZ5stb1UVo9M7v20MvQHhXHg1v63vBWlEyRlQN/cqxb1JX5Hc0:APA91bEMWlt_PGL974SU3GdBpVJMu9Tn-j3tua9Ejzp7CC2pYnwPy5UYQzT28tv9UGC1zBnsopJLefRlcDlSuVFZNE8rnY2z131XcBwZ5stb1UVo9M7v20MvQHhXHg1v63vBWlEyRlQN';
    		
    	return key; 	
    } , 
    
    values_process: function (sql,num,values) {
       sql = sql.replace('?'+num,values);
       return sql;
	 },
	 
    mainsession: function () { // game DB pool
        return options = {
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          database: config.database,
          checkExpirationInterval:900000, //15min  How frequently expired sessions will be cleared; milliseconds.
          expiration: 1800000// 30min The maximum age of a valid session; milliseconds.
        }
      },

    test_open: function (con) {
      con.connect(function (err) {
        if (err) {
          console.error('mysql connection error :' + err);
        } else {
          console.info('mysql is connected successfully.');
        }
      })
    }
  }
};