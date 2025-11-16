/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = () => ({
  type: 'widget',
  icon: '../../assets/images/logo-dark.png',
  entitlements: {
    'com.apple.security.application-groups': ['group.com.anonymous.nano-ai']
  },
  frameworks: ['SwiftUI', 'ActivityKit']
});
