$(document).ready(function(){

  // fix navigation on scroll
  var win = $(window)
    , nav = $('#navigation')
    , navTop = $('#navigation').length && $('#navigation').offset().top - 0
    , isFixed = 0

  processScroll()
  
  nav.on('click', function () {
    if (!isFixed) setTimeout(function () {  win.scrollTop(win.scrollTop() - 200) }, 10)
  })

  win.on('scroll', processScroll)

  function processScroll() {
    var i, scrollTop = win.scrollTop()
    if (scrollTop >= navTop && !isFixed) {
      isFixed = 1
      nav.addClass('navigation-fixed')
    } else if (scrollTop <= navTop && isFixed) {
      isFixed = 0
      nav.removeClass('navigation-fixed')
    }
  }
})

$(function() {
  $('#sendData').click(function(e){
  e.preventDefault()

  var form_data = $('#registryForm').serialize()

  $.post('mi_url', form_data, function(data){
    console.log(data)
  })

})
})
