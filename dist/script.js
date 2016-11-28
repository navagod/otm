$(document).ready(function(){

});

function cal_list(){
	$('#inner-list').css('width',($('.card-item').length * 300) + 44 + 'px');
}
function timeConverter(UNIX_timestamp){
  var a = new Date(parseInt(UNIX_timestamp));
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + '/' + month + '/' + year;
  return time;
}

function timeConverterWithTime(UNIX_timestamp){
  var a = new Date(parseInt(UNIX_timestamp));
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + '/' + month + '/' + year + ' ' +hour+ ':' +min+ ':' +sec ;
  return time;
}

function groupBy( array , f )
{
  var groups = {};
  array.forEach( function( o )
  {
    var group = JSON.stringify( f(o) );
    groups[group] = groups[group] || [];
    groups[group].push( o );  
  });
  return Object.keys(groups).map( function( group )
  {
    return groups[group]; 
  })
}
function cleanArray(actual) {
  if(actual){
    return actual;
  }

}
function calTeatarea(){
  $('.hiddenInput').each(function () {
    this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
  }).on('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
}


function convertImgToDataURLviaCanvas(url, callback, outputFormat) {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var dataURL;
    canvas.height = this.height;
    canvas.width = this.width;
    ctx.drawImage(this, 0, 0);
    dataURL = canvas.toDataURL(outputFormat);
    callback(dataURL);
    canvas = null;
  };
  img.src = url;
}

function convertFileToDataURLviaFileReader(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.send();
}

// $('#img2b64').submit(function(event) {
//   var imageUrl = $(this).find('[name=url]').val();
//   var convertType = $(this).find('[name=convertType]').val();
//   var convertFunction = convertType === 'FileReader' ?
//     convertFileToDataURLviaFileReader :
//     convertImgToDataURLviaCanvas;

//   convertFunction(imageUrl, function(base64Img) {
//     $('.output')
//       .find('.textbox')
//       .val(base64Img)
//       .end()
//       .find('.link')
//       .attr('href', base64Img)
//       .text(base64Img)
//       .end()
//       .find('.img')
//       .attr('src', base64Img)
//       .end()
//       .find('.size')
//       .text(base64Img.length)
//       .end()
//       .find('.convertType')
//       .text(convertType)
//       .end()
//       .show()
//   });

//   event.preventDefault();
// });

