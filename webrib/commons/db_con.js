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
    	var key = '';
    		
    	return key; 	
    } , 
    client_key : function (){
    	var key = '';
    		
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