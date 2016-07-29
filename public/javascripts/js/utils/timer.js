// FIXME: Timer needs to be more self contained (too dependent on external variables assigned outside the constructor)
// Timer should generate the correct timer html and assign all variables to the scope when it is constructed.
// In case multiple timers are desired...this may at some point benefit from redesign as an angular service that can be passed around

var Timer = function($scope, $interval, startup_callback,update_callback){
    var _self = this;
    var _keyframe_hash,
     _keyframe_callback,
    _timer_step = null;
   
 $scope.timeWrite=0;

    $scope.time =0;
    $scope.startTime = 0;
    $scope.endTime = 240000;
    
    $scope.step = 1000;
        
    $scope.state_table = [];    
        
    this.start = function( keyframes){
        _self = this;
        _keyframe_hash = _self.hashify_keyframes( keyframes );
        //_keyframe_callback = keyframe_callback;
        
        var _timer_step = $scope.step;
   //     $scope.get_endTime() ;
    //    $scope.resetTimer();
      // $scope.startTimer() ;
      
      _self.populate_state_table(keyframes);
      
    }
    
    this.populate_state_table = function (keyframes){

  for (kk=0;kk<keyframes.length;kk++){
 
 var tracing_name=keyframes[kk].queries[0].tracing_name;
 
 $scope.state_table[tracing_name] = [];
 
            for (var i=0;i<$scope.endTime;i=i+$scope.step){
                
                if (keyframes[kk].start > i ) {
                     $scope.state_table[tracing_name].push(0);
                }else if (i < keyframes[kk].start+ keyframes[kk].duration){
                     $scope.state_table[tracing_name].push(1);
                }else{
                    $scope.state_table[tracing_name].push(0);
                }
                
            }
        
    }
    
    }
    
    this.hashify_keyframes = function (keyframes){        // Generate keyframe_hash that the Timer can call as needed to trigger events
        var keyframe_hash = {};
        keyframes.forEach(function(keyframe){
            keyframe_hash[keyframe.start] = keyframe;
        });
        return keyframe_hash
    }
    
    // Resets _timer_step to beginning
    $scope.resetTimer = function(){
        $scope.time=$scope.minTime;
        
         var date = new Date( $scope.time*1000);

var year = date.getFullYear();
var month = date.getMonth() + 1;
var day = date.getDate();
var hours = date.getHours();
var minutes = date.getMinutes();
var seconds = date.getSeconds();
        $scope.timeWrite = hours+":"+minutes+":"+seconds+ " on "+day+"-"+month+"-"+year;
    
        
       $interval.cancel(_timer_step);
    }
    
     // Begins/Resumes advancing _timer_step
    $scope.startTimer = function(){
        
        console.log('start');
        
    startup_callback.call();
    _timer_step = $interval(function(){
        // If there is a keyframe set to occur at this $scope.time, fire it off
    /*    if ( $scope.time in _keyframe_hash ){
           // _keyframe_callback(_keyframe_hash[$scope.time]);
        }*/

        var next_time = parseInt($scope.time)+$scope.step;

        // If there is time remaining, update
        if (next_time < $scope.endTime+$scope.step){
            $scope.time =  parseInt($scope.time)+$scope.step;
            
            
 var date = new Date( $scope.time*1000);

var year = date.getFullYear();
var month = date.getMonth() + 1;
var day = date.getDate();
var hours = date.getHours();
var minutes = date.getMinutes();
var seconds = date.getSeconds();
        $scope.timeWrite = hours+":"+minutes+":"+seconds+ " on "+day+"-"+month+"-"+year;
    
            
            $scope.updateSlider();
        }
        else{
       // startup_callback.call();
      //  $scope.stopTimer();
      console.log('complete');
                $scope.time=$scope.startTime;
                  $scope.updateSlider();
        }
        }, 300);
        
    }
    
    // Pauses _timer_step
    $scope.stopTimer = function(){
        $interval.cancel(_timer_step);
    }
	
    // Updates millisecond readout on timer
    $scope.updateSlider = function() {
        var timePercentage =  (($scope.time - $scope.startTime)/($scope.endTime - $scope.startTime)*100)+"%"
        $scope.sliderStyle = { 'margin-left' :timePercentage};
        
        // look up the state table

        var current_state = {}

        for(var name in $scope.state_table){
            current_state[name] = $scope.state_table[name][$scope.time/$scope.step];
        }
        
     update_callback();
        
    };
	
    $scope.get_endTime = function ( ){
        $scope.endTime = 0;
        for ( var key in  _keyframe_hash){
            $scope.time = _keyframe_hash[key].start+_keyframe_hash[key].duration;
            if( $scope.time > $scope.endTime ){ $scope.endTime = $scope.time;}
        }
    }
    
    return this
}