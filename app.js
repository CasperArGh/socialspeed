
$(function() {
    
    /**************************************************
    *
    * Vars
    *
    **************************************************/

    var $inputRange = $('input[type="range"]');

    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();

    // I put duration, distance and specialtrip as general variables because I don't know how to extract them or pass them from a function to another
    var distance = 0;
    var duration = 0;
    var specialtrip = 1;

    /**************************************************
    *
    * Init
    *
    **************************************************/

    // Init google map
    google.maps.event.addDomListener(window, 'load', initGoogleMap);

    // Init slider
    $inputRange.rangeslider({
      polyfill: false 
    });

    // Init slider range value
    $inputRange.each(function(){
      valueOutput($(this));
    });

    /**************************************************
    *
    * Functions
    *
    **************************************************/

    /*
     *
     * GoogleMap function
     *
     */

    function initGoogleMap(){

      var markers = [];

      directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(map);

      // Options
      var mapOptions = {
        zoom: 7,
        center: new google.maps.LatLng(41.850033, -87.6500523)
      };

      // map initialization  
      var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      directionsDisplay.setMap(map);
      
      // center map on user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          map.setCenter(initialLocation);
        });
      }

      // Create a search box with autocomplete and link it to the UI element.
      var searchBox = new google.maps.places.SearchBox((document.getElementById('origin')));
      var searchBox2 = new google.maps.places.SearchBox((document.getElementById('destination')));

      // Bias the SearchBox results towards places that are within the bounds of the
      // current map's viewport.
      google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
      });

    }

    /*
     *
     * GoogleMap route function
     *
     */

    function googleMapRoute() {
      
      var start = $('#origin').val(),
          end = $('#destination').val(),
          selectedMode = $('#mode').val();

      if (start != "" && end != "" && selectedMode != null) {

        if (selectedMode.substr(0, 7) == "DRIVING") {
          selectedMode = "DRIVING";
        }

        var request = {
            origin: start ,
            destination: end,
            travelMode: google.maps.TravelMode[selectedMode]
        };

        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
        });
        
        // Calculate distance and duration for the trip
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
         {
           origins: [start],
           destinations: [end],
           travelMode: google.maps.TravelMode[selectedMode],
           unitSystem: google.maps.UnitSystem.METRIC,
           avoidHighways: false,
           avoidTolls: false
         }, googleMapCallback);
      }
    }

    /*
     *
     * GoogleMap route function
     *
     */

    function googleMapCallback(response, status) {

      if (status != google.maps.DistanceMatrixStatus.OK) {
        
        console.log('Error was: ' + status);

      } else {
        
        var origins = response.originAddresses,
            destinations = response.destinationAddresses,
            $outputDiv = $('#outputDiv'),
            html = '';
        
        $outputDiv.html('');

        for (var i = 0; i < origins.length; i++) {
          var results = response.rows[i].elements;

          for (var j = 0; j < results.length; j++) {
            // display the trip characteristics to check
            html += origins[i] + ' to ' + destinations[j]
                + ': ' + results[j].distance.text + ' in '
                + results[j].duration.text;
            // values for distance and directions in meters and seconds         
            distance = results[j].distance.value;
            duration = results[j].duration.value;
            html += '(' + duration + ')';
          }

          // update div
          $outputDiv.html(html);

        }
      }

      updateResult();
    }

    /*
     *
     * Update result function
     *
     */

    function updateResult() {

      var $socialtime = $("#socialtime"),
          $socialspeed = $("#socialspeed"),
          $cost = $("#cost"),
          $wage = $("#wage"),
          $costout = $("#costout"),
          $wageout = $("#wageout"),
          selectedMode = $('#mode').val();
      
      var num1 = parseFloat($cost.val());
      var num2 = 1;

      // Formula depending on the transport mode
      if (selectedMode != null) {

        if (selectedMode.substr(0, 7) == "DRIVING") {

          waitingTime = 0;
          num2 = parseFloat($wage.val());

          if (selectedMode  == "DRIVING_HITCH") {
            specialtrip = 99999;
            waitingTime = parseFloat($("#waiting").val())*60;
          } else if (selectedMode  == "DRIVING_SHARE2") {
            specialtrip = 2;
          } else if (selectedMode  == "DRIVING_SHARE3") {
            specialtrip = 3;
          } else if (selectedMode  == "DRIVING_SHARE4") {
            specialtrip = 4;
          } else if (selectedMode  == "DRIVING_SHARE5") {
            specialtrip = 5;
          }

          //----------------------------------  
          // formula for the generalized time in minutes. need to convert it to days and hours and minutes..
          var num3 = ((duration+waitingTime+((distance*num1)/specialtrip)/num2)/60).toFixed(0);

          //----------------------------------  
          // formula for the generalized speed
          var num4 = (distance/(duration+waitingTime+(distance*num1)/specialtrip/num2)*3.6).toFixed(0);

        } else if (selectedMode  == "WALKING") {

          /*
            TODO
          */

          //----------------------------------  
          // formula for the generalized time in minutes. need to convert it to days and hours and minutes..
          var num3 = ((duration+((distance*num1)/specialtrip)/num2)/60).toFixed(0);

          //----------------------------------  
          // formula for the generalized speed
          var num4 = (distance/(duration+(distance*num1)/specialtrip/num2)*3.6).toFixed(0);

        } else if (selectedMode  == "BICYCLING") {

          /*
            TODO
          */

          //----------------------------------  
          // formula for the generalized time in minutes. need to convert it to days and hours and minutes..
          var num3 = ((duration+((distance*num1)/specialtrip)/num2)/60).toFixed(0);

          //----------------------------------  
          // formula for the generalized speed
          var num4 = (distance/(duration+(distance*num1)/specialtrip/num2)*3.6).toFixed(0);

        } else if (selectedMode  == "TRANSIT") {

          /*
            TODO
          */

          num1 = $("#transitprice").val();

          //----------------------------------  
          // formula for the generalized time in minutes. need to convert it to days and hours and minutes..
          var num3 = ((duration+((distance*num1)/specialtrip)/num2)/60).toFixed(0);

          //----------------------------------  
          // formula for the generalized speed
          var num4 = (distance/(duration+(distance*num1)/specialtrip/num2)*3.6).toFixed(0);

        }  

        $socialtime.html(num3);
        $socialspeed.html(num4);
      }
    }

    /*
     *
     * Update range value
     *
     */

    function valueOutput(element) {
        var $this = $(element),
            $output = $this.parent().find('.output');

        // output html update
        $output.html($this.val());
    }

    /**************************************************
    *
    * Events
    *
    **************************************************/

    $(document).on("change", "#origin, #destination", function(e){
      googleMapRoute();
    });

    $(document).on("change", "#mode", function(e){
      googleMapRoute();
      $(".transport.option").hide();
      $(".transport.option." + $(this).val().toLowerCase()).show();
    });

    $(document).on("change", 'input[type="range"], .transport.option input', function(e) {
      valueOutput(e.target);
      updateResult();
    });

});

