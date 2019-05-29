module.exports = {
  apps : [{
    name: "quix",
    script: "./index.js",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    },
    output: '/logs/stdout.log',
    error: '/logs/stderr.log',
    instances: 2
  }]
}