$('pre.script').each(function(index, element) {
  var jqElement = $(element);
  var source = jqElement.data('source');
  $.ajax({
    url: source,
    type: 'GET',
    success: function(response) {
      jqElement.text(response);
    },
  });
});
