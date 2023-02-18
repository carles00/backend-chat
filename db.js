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

