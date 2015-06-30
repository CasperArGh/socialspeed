!(function($) {

  /*******************************************************
  *
  *
  * Init
  *
  *
  *******************************************************/

  var $origin = $('#origin'),
      $destination = $('#destination'),
      $alert = $('.alert');

  /*******************************************************
  *
  *
  * Events
  *
  *
  *******************************************************/

  /*
   *
   * Valid google form
   *
   */ 

  $(document).on('click', '.valid', function(e){
    
    if ($origin.val() != null && $destination.val() != null){
      getTravalData(google.maps.TravelMode.BICYCLING);
      getTravalData(google.maps.TravelMode.DRIVING);
      getTravalData(google.maps.TravelMode.TRANSIT);
      getTravalData(google.maps.TravelMode.WALKING);
    }

    e.preventDefault();
  });

  /*
   *
   * Launch calcul
   *
   */ 

  $(document).on('click', '.calcul', function(e){
  
    socialSpeed('bicycling');
    socialSpeed('driving');
    socialSpeed('transit');
    socialSpeed('walking');

    e.preventDefault();
  });

  /*******************************************************
  *
  *
  * Functions
  *
  *
  *******************************************************/

  /*
   *
   * Google API call
   *
   */ 

  function getTravalData(mode){

    var origin = "Greenwich, England";
    var destination = "Stockholm, Sweden";
    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [$origin.val()],
        destinations: [$destination.val()],
        travelMode: mode,
        durationInTraffic: true,
      }, callback);

    function callback(response, status) {
      if (status != 'OK') {
        displayErrorCall(status);
      } else {
        showResultsCall(mode, response);
      }
    }
  }

  /*
   *
   * Google API call errors
   *
   */ 

  function displayErrorCall(status){
    
    var message = '';

    if (status == 'INVALID_REQUEST'){
      message = 'A field is missing';
    } else if (status == 'MAX_ELEMENTS_EXCEEDED'){
      message = 'A field is missing';
    } else if (status == 'MAX_DIMENSIONS_EXCEEDED'){
      message = 'Too much origins and destinations';
    } else if (status == 'OVER_QUERY_LIMIT'){
      message = 'Too many requests in allowed time period. Wait a little before retrying';
    } else if (status == 'REQUEST_DENIED'){
      message = 'Service denied by google';
    } else if (status == 'UNKNOWN_ERROR'){
      message = 'Server error. Please try again';
    } else if (status == 'NO_SALARY'){
      message = 'Please provide your hourly salary';
    }

    $alert
      .children('.message')
      .html(message)
      .end()
    .show();

  }

  /*
   *
   * Google API response Error
   *
   */ 

  function displayErrorResponse(status, mode){
    
    var message = '';

    if (status == 'NOT_FOUND'){
      message = 'The origin and/or destination of this pairing could not be geocoded.';
    } else if (status == 'ZERO_RESULTS'){
      message = 'No route could be found between the origin and destination.';
    }

    $('input.distance.' + mode)
            .val(message)
            .parent()
              .addClass('has-error has-feedback')
              .append('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
  }

  /*
   *
   * Show Google API response
   *
   */ 

  function showResultsCall(mode, response){

    var item = response.rows[0].elements[0],
        mode = mode.toLowerCase();
  
    if (item.status != 'OK'){
      displayErrorResponse(item.status, mode);
    } else {
      $('input.distance.' + mode)
        .val(item.distance.text)
        .attr('data-raw', item.distance.value)
        .parent()
          .addClass('has-success has-feedback')
          .append('<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>');

      $('input.duration.' + mode)
        .val(item.duration.text)
        .attr('data-raw', item.duration.value)
        .parent()
          .addClass('has-success has-feedback')
          .append('<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>');   
    }
  }

  /*
   *
   * Calcul social speed
   *
   */

  function socialSpeed(mode){
      
      var tripTime = parseFloat($('.duration.' + mode).attr('data-raw')),
          tripDistance = parseFloat($('.distance.' + mode).attr('data-raw')),
          tripCost = getCost(mode),
          hourlySalary = parseFloat($('#hourlysalary').val());

      if (hourlySalary == null) {

        displayErrorCall('NO_SALARY')

      } else {

        // Conveting time to hours :
        // trip time is in second => division by 60 to get minutes
        // hourly salary is in hour => mutliply by 60 to have minutes
        generalizedTime = (tripTime / 60) + (tripCost / hourlySalary * 60);
        // Finally we have hours
        generalizedTime = generalizedTime / 60;
        // Converting distance into Km
        generalizedSpeed = tripDistance / 1000 / generalizedTime;

        $('.generalizedtime.' + mode).val(toHHMM(generalizedTime * 3600));
        $('.generalizedspeed.' + mode).val(generalizedSpeed.toFixed(1) + ' km/h');
      }
  } 

  /*
   *
   * Calcul total cost for transport mode
   *
   */

  function getCost(mode){
      
      var total = 0;

      $('.cost.' + mode).each(function(){
        
        var $this = $(this),
            subtotal = 0;

        if ($this.val() !== undefined && $this.val() !== '') {
          subtotal = parseFloat($this.val());
        }

        // Is there something that minor the cost ?
        // for example, if you take your car twice a day, we can consider you take it twice all days of years, so your journey costs will be divided by 365 * 2
        if ($this.attr('data-minor') !== undefined && $this.attr('data-minor') !== '') {
          subtotal = subtotal / parseFloat($this.attr('data-minor'));
        }

        total = parseFloat(total) + parseFloat(subtotal);
      });

      return parseFloat(total);
  } 

  /*
   *
   * Time convertion
   *
   */

  function toHHMM(time) {
    
    var sec_num = parseInt(time, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    
    var time    = hours + ' h '+ minutes+' min';
    return time;
  }


})(window.jQuery);