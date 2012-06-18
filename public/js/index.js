$(document).ready(function(){

  var $win    = $(window)
    , $nav    = $('#navigation')
    , $navTop = $('#navigation').length && $('#navigation').offset().top - 0
    , $form   = $('#registryForm')
    , $error  = $('.modal-footer .error')
    , $total  = $('#total-ammount')
    , $day    = $('#payment-day-field')
    , $month  = $('#payment-month-field')
    , $year   = $('#payment-year-field')
    , $unitec = $('input[name=unitec]')
    , $fapi   = $('.fapi')
    , date    = new Date()
  // Default variables
    , isFixed         = 0
    , tickets_stud    = 0
    , tickets_else    = 0
    , total           = 0
    , ticket_stud_val = 200
    , ticket_else_val = 400
    , validate = {
        email          : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/
      , cedula         : /^[0-9]{6,8}$/
      , payment_number : /^\S{8,30}$/
      , just_numbers   : /^[0-9]*$/
      }


  // fix navigation on scroll
  processScroll()

  $nav.on('click', function () {
    if (!isFixed) setTimeout(function () {  $win.scrollTop($win.scrollTop() - 200) }, 10)
  })

  $win.on('scroll', processScroll)

  function processScroll() {
    var i, scrollTop = $win.scrollTop()
    if (scrollTop >= $navTop && !isFixed) {
      isFixed = 1
      $nav.addClass('navigation-fixed')
    } else if (scrollTop <= $navTop && isFixed) {
      isFixed = 0
      $nav.removeClass('navigation-fixed')
    }
  }


  // Setting form default values
  $day.val(date.getDate())

  // Validating forms
  function showHelpIf(condition, that) {
    $help = $(that).parent().find('.help')
    if (condition) {
      $help.addClass('hidden')
      $help.removeClass('help-inline')
    } else {
      $help.addClass('help-inline')
      $help.removeClass('hidden')
    }
  }

  $('#registry-name,#registry-last_name').blur(function() {
    showHelpIf(this.value, this)
  })

  $('#registry-email').blur(function() {
    var validated = validate.email.test(this.value)
    showHelpIf(validated, this)
  })

  $('#registry-cedula').blur(function() {
    var validated = validate.cedula.test(this.value)
    showHelpIf(validated, this)
  })

  $('#registry-payment_number').blur(function() {
    var validated = this.value && validate.payment_number.test(this.value.replace(/[^0-9]+/g,''))
    showHelpIf(validated, this)
  })

  $('#payment-day-field').blur(function() {
    var validated = validate.just_numbers.test(this.value) && this.value > 0 && this.value < 30
    showHelpIf(validated, this)
  })

  // Adding or substracting tickets
  $('.controls button').click(function(e) {
    e.preventDefault()
    var $this    = $(this)
      , $dad     = $this.parent()
      , $field   = $dad.find('input')
      , for_stud = $dad.attr('data-type') === 'stud'
      , is_sum   = $this.html() === '+'
      , one      = is_sum ? 1 : -1
      , val

    if (for_stud) {
      val = tickets_stud || one > 0 ? (tickets_stud += one) : 0
      val += ' x '+ticket_stud_val
    } else {
      val = tickets_else || one > 0 ? (tickets_else += one) : 0
      val += ' x '+ticket_else_val
    }

    $field.val(val)
    setTotalAmmount()
  })

  function setTotalAmmount() {
    total = tickets_stud * ticket_stud_val
          + tickets_else * ticket_else_val
    $total.html(total + ' Bs')
  }


  // Processing form
  $('#sendData').click(function(e){
    e.preventDefault()

    var form_data = $form.serialize()
      , date = new Date($year.val(), $month.val()-1, $day.val())

    form_data += '&payment_date='+date
               + '&payment_ammount='+total
               + '&tickets_stud='+tickets_stud
               + '&tickets_else='+tickets_else

    $.post('/register', form_data, showAnswer)
  })

  // Showing the result
  function showAnswer(data) {
    if (data.error) {
      $error.show()
      $error.html(data.error)
      $error.removeClass('ok')
    } else
    if (data.status === 'ok') {
      $error.html('¡Registro enviado!')
      $error.addClass('ok')
    } else {
      $error.html('')
    }
  }

  // If estudiante unitec, show fapi
  $unitec.on('click', function() {
    $fapi.toggle()
  })



})
