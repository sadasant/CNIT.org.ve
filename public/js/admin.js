$(document).ready(function(){

  var $form = $('form')
    , $add  = $('#add')
    , $find = $('#find')
    , $results = $('#results')

  $add.click(function() {
    $add.before($form.clone())
  })

  $find.click(function() {

    var keys = $('select').map(mapValue)
      , vals = $('input').map(mapValue)
      , data = {}
      , i = 0
      , l = keys.length

    for (; i < l; i++) {
      data[keys[i]] = vals[i]
    }

    $.post('/find', data, found)
  })

  function mapValue() {
    return this.value
  }

  function found(data) {
    $results.html(data)
  }

  $results.on('click','.enviar', function() {
    var $this = $(this)
      , $dad  = $this.parent()
      , state = $dad.find('select').val()
      , id    = $this.attr('data-id')
    $.post('/update', { id : id, state : state}, function(data) {
      if (data.error) return $dad.html(data.error)
      var state = data.state
      state = '<div class="state-'+state+'">'+state+'</div>'
      $dad.html(state)
    })
  })
})
