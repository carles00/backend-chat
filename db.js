const redis = require('redis')
const assert = require('assert')

module.exports = redis.createClient({
  port: 6379,
  host: '127.0.0.1'
})

// Example 1
redis.set('key', 'value', err => {
  if (err) throw err
  
  redis.get('key', (err, value) => {
    if (err) throw err
    assert.equal(value, 'value')
    console.log('It works!')
    redis.quit()
  })
})

// Example 2
redis.put('key', 'value', err => {
  if (err) console.error(`Error putting key: ${err}`)
  else console.log('Key saved successfully!')
})

// Example 3
redis.get('key', (err, value) => {
  if (err) console.error(`Error getting key: ${err}`)
  else console.log(`The key has the value: ${value}`)
})
