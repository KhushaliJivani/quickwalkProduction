module.exports = {
  development: {
    port: 4000, // assign your own port no
    mongoUri: 'mongodb://192.168.1.195:27017/quickWalk',
    adminUri: 'http://localhost:4200/',
    masterAdminUri: 'https://quickwalk-admin.viitorcloud.in/',
    userUri: 'http://localhost:4200/',
    logs: 'dev',
    uploadFilePath: './src/public/upload/',
    base64FilePath: 'src/public/upload/',
    mailUrl:'src/views/',
    logoUrl: 'https://api.quick-walk.com:'
  },
  production: {
    port: 3000, // assign your own port no
    mongoUri: 'mongodb://admin:55leastBUILDexcept67@127.0.0.1:27017/quickWalk_import?authSource=admin',
    adminUri: 'https://business.quick-walk.com/',
    masterAdminUri: 'https://admin.quick-walk.com/',
    userUri: 'https://app.quick-walk.com/',
    logs: 'combined',
    uploadFilePath: './public/upload/',
    base64FilePath: 'public/upload/',
    mailUrl:'views/',
    logoUrl: 'https://api.quick-walk.com:'
  },
  test: {
    port: 3000, /* assign your own port no */
    mongoUri: 'mongodb://localhost:27017/quickWalk',
    adminUri: 'http://localhost:4200/',
    masterAdminUri: 'https://quickwalk-admin.viitorcloud.in/',
    userUri: 'http://localhost:4200/',
    logs: 'dev',
    uploadFilePath: './src/public/upload/',
    base64FilePath: 'src/public/upload/',
    mailUrl:'src/views/',
    logoUrl: 'https://api.quick-walk.com:'

  }
};

