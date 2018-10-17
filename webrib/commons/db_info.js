module.exports = {
  'secret' :  '',
  'db_info': {
    local: { // localhost
      connectionLimit: 3,
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    },
    real: { // real
        connectionLimit: 4,
        host: '',
        port: '',
        user: '',
        password: '',
        database: ''
      },
    dev: { // dev
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    }
  },
  'federation' : {
    'naver' : {
      'client_id' : '11',
      'secret_id' : '11',
      'callback_url' : '/auth/login/naver/callback'
    },
    'facebook' : {
      'client_id' : '11',
      'secret_id' : '11',
      'callback_url' : '/auth/login/facebook/callback'
    },
    'kakao' : {
      'client_id' : '11',
      'callback_url' : '/auth/login/kakao/callback'
    }
  }
};