module.exports = {
  'secret' :  '',
  'db_info': {
    local: { // localhost
      connectionLimit: 3,
      host: '127.0.0.1',
      port: '3306',
      user: 'bugsbox',
      password: '1q2w3e4r',
      database: 'readroom'
    },
    real: { // real
        connectionLimit: 4,
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: 'bugbox7*',
        database: 'readroom'
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