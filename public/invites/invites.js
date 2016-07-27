angular.module('envite.invite', [
    'ngRoute',
    'angularFileUpload',
    'ngAnimate',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/invite/:invite_code', {
            templateUrl: 'invites/invites.html',
            controller: 'invitesController'
        })
        .when('/invited_list/:event_id', {
            templateUrl: 'invites/invited_list.html',
            controller: 'invitesController'
        })
        .when('/event/:event_id', {
            templateUrl: 'invites/event.html',
            controller: 'invitesController'   // getEvent()
        })
        .when('/invited_list2/:event_id', {
            templateUrl: 'invites/invited_list2.html',
            controller: 'invitesController'
        })
        .when('/rest_queue/:event_id', {
            templateUrl: 'invites/rest_queue.html',
            controller: 'invitesController'
        })
        .when('/event_list', {
            templateUrl: 'invites/event_list.html',
            controller: 'invitesController'
        })
        .when('/all_events', {
            templateUrl: 'invites/all_events.html',
            controller: 'invitesController'
        })
        .when('/event_add', {
            templateUrl: 'invites/event_add.html',
            controller: 'invitesController'
        })
        .when('/csv_sms', {
            templateUrl: 'invites/csv_sms.html',
            controller: 'invitesController'
        })
}])

    .directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
            console.log(file)
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);
                console.log(params.file)

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }])
.directive('timer', function() {
  return {
    restrict: 'E', 
    $scope: {
      timer : '='
    },
  //  template: '<h4 ng-if="counter <= 59">{{counter | number:0 }}s</h4><h4 ng-if="(counter >= 60) && (counter <= 3600)">{{(counter / 60) | number:0 }} <span>{{((counter / 60)| number:0) >= 2 ? "minutes" : "minute"}} ago</span> <h4 ng-if="(counter >= 3600) && (counter <= 86400)">{{(counter / 3600) | number:0 }} <span>{{((counter / 3600) | number:0) >= 2 ? "hours" : "hour"}} ago</span></h4> <h4 ng-if="(counter >= 86400)">{{(counter / 86400) | number:0 }} <span>{{((counter / 86400)) <= 1.9 ? "day" : "days"}}</span> ago</h4> ',
    template: '<span ng-if="counter <= 59">{{counter | number:0 }} seconds ago</span> <span ng-if="(counter >= 60) && (counter <= 3600)">{{(counter / 60) | number:0 }} {{((counter / 60)| number:0) >= 2 ? "minutes" : "minute"}} ago</span> <span ng-if="(counter >= 3600) && (counter <= 86400)">{{(counter / 3600) | number:0 }} {{((counter / 3600) | number:0) >= 2 ? "hours" : "hour"}} ago</span> <span ng-if="(counter >= 86400)">{{(counter / 86400) | number:0 }} {{((counter / 86400)) <= 1.9 ? "day" : "days"}} ago</span> ',
    controller: function($scope, $timeout) {
      $scope.counter = $scope.timer.strtime;
      var callback = function() {
        $scope.counter++;
        $timeout(callback, 1000);
      };
      
      $timeout(callback, 1000);
    }
  };
})

.directive('navbar', function () {
    return {
      restrict: 'E',
      templateUrl: 'navbar.html',
//      controller: 'NavbarCtrl',
    };
  })
.controller('ModalInstanceCtrl', function ($scope,$rootScope, $uibModalInstance,FileUploader, items) {


  $scope.today = function() {
    $scope.format = 'yyyy/MM/dd';
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

 
  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };


  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[3];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
  $scope.items = items;
    console.log($scope.items[1])
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
        var uploader = $scope.uploader = new FileUploader({
            url: express_endpoint + '/image_upload'
        });
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          //  console.info('onSuccessItem', fileItem, response, status, headers);
          console.log(response['file_name'])
           console.log($scope.mytime)
            $rootScope.createEvent(response['file_name'],$scope.formData.text,$scope.formData.event_location,$scope.dt , $scope.mytime );
          $scope.ok();
        };

// Timepicker controller here

$scope.mytime = new Date();

  $scope.hstep = 1;
  $scope.mstep = 15;

  $scope.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
  };

  $scope.changed = function () {
    $log.log('Time changed to: ' + $scope.mytime);
  };

  $scope.clear = function() {
    $scope.mytime = null;
  };
})

.filter('date1', function($filter)
{
 return function(input,frmt)
 {
  if(input == null){ return ""; } 
 
  console.log(frmt)
  if (frmt == 'sdate'){ 
   var _date = $filter('date')(new Date(input), 'MMM dd yyyy');
  }
  if (frmt == 'stime'){ 
   var _date = $filter('date')(new Date(input), 'h:mm a');
  }
 
  return _date;

 };
})

//.controller('invitesController', ['$scope','$http', '$window', '$location', '$routeParams', '$rootScope', 'FileUploader', 
.controller('invitesController', 
    function($scope,   $http, $window, $location, $routeParams, $rootScope , FileUploader, $uibModal) {
       
 $scope.items = ['item1', 'item2', 'item3'];
  $scope.animationsEnabled = true;

  $scope.openLoginModal = function (size) {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'loginModal.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
     console.log('Modal dismissed at: ' + new Date());
    });
  };
  $scope.open = function (size) {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
     console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };
    


        $scope.sendCSVSMS = function(phone_number,text) {
            $http({
                    method: 'POST',
                    url: express_endpoint + '/api/sendcsvsms',
                    data: 'phone_number=' + phone_number + '&text=' + text ,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                   console.log(data);
                   console.log("woot");
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };



        $scope.form = {};
        $scope.timers = [];
        $scope.counter2 = 0

        $scope.formData = {};
        $scope.formData1 = {};
        $scope.fields = {
            password: '',
            passwordConfirm: ''
        };

        $scope.submitForm = function(isValid) {
            $scope.submitted = true;

            // check to make sure the form is completely valid
            if (isValid) {
                alert('our form is amazing');
            }

        };


        var socket = io.connect(express_endpoint);
        socket.on('connect', function(data) {
            socket.emit('join', 'Hello World from client 999');
        });
        socket.on('messages', function(data) {
          //   console.log("we have liftoff")
        });

        socket.on("getinvite", function(message) {
            console.log("asdfkasdfkaskdfkdsf")
            $scope.getEventInvite(message);
        });

        socket.on("mms", function(message) {
            $scope.getInvites(message);
        });

        $scope.logOut = function() {
            $window.localStorage['token'] = null;
            $rootScope.isUserLoggedIn = false;
            $location.url('/all_events');
        }

        $scope.display_reg_form = function() {
            $scope.showRegToInvite = true;
            $scope.showLoginToInvite = false;
        }

        $scope.display_login_form = function() {
            $scope.showRegToInvite = false;
            $scope.showLoginToInvite = true;
        }



        $scope.editEvent = function() {
            $scope.eventEdit = 'YES';
            $scope.event_data = {
                event_title: $scope.event_title,
                event_date: $scope.event_date,
                event_location: $scope.event_location
            }
            $scope.set = function(event_title) {
                this.event_data.event_title = event_title;
            }
            $scope.set = function(event_location) {
                this.event_data.event_location = event_location;
            }
            $scope.set = function(event_date) {
                this.event_data.event_date = event_date;
            }
        }

        $scope.cancelEditEvent = function() {
            $scope.eventEdit = 'NO';
        }
        $scope.loginForm = function() {
            $rootScope.showLoginlink = false;
        }

        $scope.password_change = function() {
            $scope.changePassword = $scope.changePassword === true ? false : true;
        }

        $scope.invite_change = function() {
            $scope.newInvite = false;

            if ($rootScope.isUserLoggedIn == true) {
                $scope.changeSettings = $scope.changeSettings === true ? false : true;
                $scope.showAcceptInvite = false;
            } else if ($rootScope.isMember == true) {
                $scope.changeSettingsAnon = $scope.changeSettingsAnon === true ? false : true;
                $scope.changeSettings = false;
                $scope.showAcceptInvite = false;
            } else {
                $scope.changeSettings = false;
                $scope.showAcceptInvite = true;
            }
        }

        $scope.invite_open = function(ustatus) {
            $scope.showAcceptInvite = true;
            $scope.ustatus = ustatus
            $http({
                    method: 'GET',
                    url: express_endpoint + '/invites/' + $routeParams.invite_code
                }).success(function(data) {
                    $scope.events = data;
                    if (data.invite_status == 'Opened' || data.invite_status == 'Sent') {
                        $scope.invited = {
                            username: data.invited_email,
                            displayname: data.invited
                        }
                        $scope.set = function(invited_username) {
                            this.invited.username = invited_username;
                        }
                        $scope.set = function(invited_email) {
                            this.invited.displayname = invited_displayname;
                        }
                        $scope.checkboxModel = {
                            rsvp: 'NO',
                            comment_alert: 'NO',
                        };
                        $scope.set = function(invited_rsvp) {
                            this.checkboxModel.rsvp = invited_rsvp;
                        }
                        $scope.set = function(invited_comment_alert) {
                            this.checkboxModel.comment_alert = invited_comment_alert;
                        }

                    } else {
                        $scope.showAlreadyAccepted = true;
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }

        $scope.deleteEventConfirm = function(id) {
            if ($scope.showDeleteEvent == true) {
                $scope.showDeleteEvent = false;
            } else {
                $scope.showDeleteEvent = true;
            }
            $scope.showDeleteEventid = id;

        };


        $scope.deleteEvent = function(id) {
            $http({
                    method: 'DELETE',
                    url: express_endpoint + '/api/events/' + id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    $scope.getEventList();
                    $scope.showDeleteEvent = false;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };


        $scope.checkLogin = function() {
            $http({
                    method: 'GET',
                    url: express_endpoint + '/api/userget/',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    if (data['user'][0]['username']) {
                        $scope.username = data['user'][0].username
                        if (data['user'][0].displayname) {
                            $scope.displayname = data['user'][0].displayname;
                            $rootScope.display_name = data['user'][0].displayname;
                            
                        } else {
                            $scope.displayname = data['user'][0].username.split('@')[0];
                        }
                        $scope.showLoginToInvite = false;
                    } else {
                        $scope.showLoginToInvite = true;
                    }
                })
                .error(function(data) {
                    $scope.showLoginToInvite = true;
                    console.log('Error: ' + data);
                });
        }




        $scope.getEventList = function() {
            $http({
                    method: 'GET',
                    url: express_endpoint + '/api/my_event_list2/',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    console.log(data['comments_count'])
                    $scope.events = data['my_events'];
                    $scope.events_invite = data['event_invites'][0];
                    $scope.events_yes_count = data['event_yes'];
                    $scope.events_comments_count = data['comments_count'];
                    $rootScope.isUserLoggedIn = true;

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.allEvents = function() {
            $http({
                    method: 'GET',
                    url: express_endpoint + '/get_all_events/',
                    headers: {
                        'Content-Type': 'application/json',
                //        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    console.log(data['comments_count'])
                    $scope.events = data['my_events'];
                    $scope.events_invite = data['event_invites'][0];
                    $scope.events_yes_count = data['event_yes'];
                    $scope.events_comments_count = data['comments_count'];
            if ($window.localStorage.getItem('token') == null) {
                $rootScope.showLoginlink = true;
            } else if ($window.localStorage.getItem('token').length < 10) {
                $rootScope.showLoginlink = true;
            } else {
                $rootScope.isUserLoggedIn = true;
                $scope.checkLogin();
            }

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.getInvites = function(id) {
            $http({
                    method: 'GET',
                    url: express_endpoint + '/api/invited/' + $routeParams.event_id,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {

                    $scope.timers = []; 
                    $scope.invite_code = data['invite_creator']['invite_code']
                    $scope.event_id = $routeParams.event_id;
                    $scope.invites = data['invites'];
            
                    $scope.date_now = data['date_now'];
                    console.log(data)
                    var jsond = new Date();
                    //var jsond = JSON.stringify(new Date());
                   // $scope.dateA = JSON.parse(jsond); 
                    var myDate = +new Date(data['invites'][0]['created_at'])
                
                    console.log(myDate)
                    console.log((data['date_now'] - myDate)/ 1000)
  
                    if (data['event'][0].event_creator == data['logged_in_userid']) {
                        $rootScope.isEventCreator = true;
                    }
                    $rootScope.isUserLoggedIn = true;

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.getEventInvite = function(id) {
            if ($window.localStorage.getItem('token') == null) {
                $rootScope.showLoginlink = true;
                var endpoint = express_endpoint + '/geteventinviteanon/' + $routeParams.invite_code
                var head = {
                    'Content-Type': 'application/json'
                }
            } else if ($window.localStorage.getItem('token').length < 10) {
                $rootScope.showLoginlink = true;
                var endpoint = express_endpoint + '/geteventinviteanon/' + $routeParams.invite_code
                var head = {
                    'Content-Type': 'application/json'
                }
            } else {
                var endpoint = express_endpoint + '/api/geteventinvite/' + $routeParams.invite_code
                var head = {
                    'Content-Type': 'application/json',
                    'x-access-token': $window.localStorage.getItem('token')
                }
                $rootScope.isUserLoggedIn = true;
            }
            $http({
                    method: 'GET',
                    url: endpoint,
                    headers: head
                }).success(function(data) {
                    $scope.timers = [];
                    $scope.event_data = data['event'][0];
                    $scope.event_title = data['event'][0].event_title;
                    $scope.event_date = data['event'][0].event_start;
                    $scope.event_creator_displayname = data['event'][0].event_creator_displayname;
                    $scope.event_creator_id = data['event'][0].event_creator;
                    $scope.event_location = data['event'][0].event_location;
                    $scope.event_id = data['event'][0]._id;
                    $scope.yeses = data['players_yes'];
                    $scope.nos = data['players_no'];
                    $scope.date_now = data['date_now'];
                    $scope.players_list = data['players_list'];
                    $scope.comments = data['comments'];
                    $scope.loggedInUsername = data['logged_in_username'];
                    if (data['is_member'].length > 0) {
                        $scope.invited = {
                            username: data['is_member'][0].username,
                            displayname: data['is_member'][0].displayname
                        };
                        $scope.set = function(invited_username) {
                            this.invited.username = invited_username;
                        }
                        $scope.set = function(invited_displayname) {
                            this.invited.displayname = invited_displayname;
                        }
                        $scope.checkboxModel = {
                            rsvp: data['is_member'][0].notice_rsvp,
                            comment_alert: data['is_member'][0].notice_comments
                        };

                        $scope.invited_reply = data['is_member'][0].in_or_out;
                        $scope.invite_code = data['is_member'][0].invite_code;
                        $scope.ustatus = data['is_member'][0].in_or_out;
                        $rootScope.isMember = true;
                        $rootScope.newInvite = false;
                    } else {
                        $rootScope.isMember = false;
                        $rootScope.newInvite = true;
                    }
                    if (data['event'][0].event_creator == data['logged_in_userid']) {
                        $rootScope.isEventCreator = true;
                        $rootScope.isMember = true;
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };


        $scope.getEvent = function(id) {
            if ($window.localStorage.getItem('token') == null) {
                $rootScope.showLoginlink = true;
                var endpoint = express_endpoint + '/geteventanon/' + $routeParams.event_id
                var head = {
                    'Content-Type': 'application/json'
                }
            } else if ($window.localStorage.getItem('token').length < 10) {
                $rootScope.showLoginlink = true;
                var endpoint = express_endpoint + '/geteventanon/' + $routeParams.event_id
                var head = {
                    'Content-Type': 'application/json'
                }
            } else {
                var endpoint = express_endpoint + '/api/getevent/' + $routeParams.event_id
                var head = {
                    'Content-Type': 'application/json',
                    'x-access-token': $window.localStorage.getItem('token')
                }
                $rootScope.isUserLoggedIn = true;
            }
            $http({
                    method: 'GET',
                    url: endpoint,
                    headers: head
                }).success(function(data) {
                    console.log(data)
                    $scope.timers = [];
                    $scope.event_data = data['event'][0];
                    $scope.event_creator_id = data['event'][0].event_creator;
                    $scope.event_id = data['event'][0]._id;
                    $scope.yeses = data['players_yes'];
                    $scope.nos = data['players_no'];
                    $scope.date_now = data['date_now'];
                    $scope.players_list = data['players_list'];
                    $scope.comments = data['comments'];
                    $scope.loggedInUsername = data['logged_in_username'];
                    $scope.logged_in_userid = data['logged_in_userid'];
                    if (data['is_member'].length > 0) {
                        $scope.invited = {
                            username: data['is_member'][0].username,
                            displayname: data['is_member'][0].displayname
                        };
                        $scope.set = function(invited_username) {
                            this.invited.username = invited_username;
                        }
                        $scope.set = function(invited_displayname) {
                            this.invited.displayname = invited_displayname;
                        }
                        $scope.checkboxModel = {
                            rsvp: data['is_member'][0].notice_rsvp,
                            comment_alert: data['is_member'][0].notice_comments
                        };

                        $scope.invited_reply = data['is_member'][0].in_or_out;
                        $scope.invite_code = data['is_member'][0].invite_code;
                        $scope.ustatus = data['is_member'][0].in_or_out;
                        $rootScope.isMember = true;
                        $rootScope.newInvite = false;
                    } else {
                        $rootScope.isMember = false;
                        $rootScope.newInvite = true;
                    }
                    if (data['event'][0].event_creator == data['logged_in_userid']) {
                        $rootScope.isEventCreator = true;
                        $rootScope.isMember = true;
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };


        $scope.getEvent99 = function(id) {
            if ($window.localStorage.getItem('token') == null) {
                $rootScope.showLoginlink = true;
            } else if ($window.localStorage.getItem('token').length < 10) {
                $rootScope.showLoginlink = true;
            } else {
                $rootScope.isUserLoggedIn = true;
            }
            $http({
                    method: 'GET',
                    url: express_endpoint + '/geteventdata/' + $routeParams.event_id,
                    headers: {
                        'Content-Type': 'application/json',
          //              'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    console.log(data)
                    $scope.timers = []; 
                    $scope.event_title = data['event'][0].event_title;
                    $scope.event_date = data['event'][0].event_start;
                    $scope.event_creator_displayname = data['event'][0].event_creator_displayname;
                    $scope.event_creator_id = data['event'][0].event_creator;
                    $scope.event_id = data['event'][0]._id;
                    $scope.yeses = data['players_yes'];
                    $scope.nos = data['players_no'];
                    $scope.date_now = data['date_now'];
                    $scope.comments = data['comments'];
                    $scope.loggedInUsername = data['logged_in_username'];
                    if (data['is_member'].length > 0) {
                        $scope.invited = {
                            username: data['is_member'][0].username,
                            email: data['is_member'][0].email,
                            invite_code: data['is_member'][0].invite_code
                        };
                        $scope.set = function(invited_username) {
                            this.invited.username = invited_username;
                        }
                        $scope.set = function(invited_email) {
                            this.invited.email = invited_email;
                        }
                        $scope.set = function(invite_code) {
                            this.invited.code = invite_code;
                        }
                        $scope.checkboxModel = {
                            rsvp: data['is_member'][0].notice_rsvp,
                            comment_alert: data['is_member'][0].notice_comments
                        };

                        $scope.invited_reply = data['is_member'][0].in_or_out;
                        $scope.ustatus = data['is_member'][0].in_or_out;
                        $rootScope.isMember = true;
                        $rootScope.newInvite = false;
                    } else {
                        $rootScope.isMember = false;
                        $rootScope.newInvite = true;
                    }
                    if (data['event'][0].event_creator == data['logged_in_userid']) {
                        $rootScope.isEventCreator = true;
                        $rootScope.isMember = true;
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.addComment = function(id, ustatus, commentsForm) {
            if (ustatus == 'none') {
                Comments = $scope.formData.comments
            } else {
                Comments = $scope.formData.text
            }
            $http({
                    method: 'POST',
                    url: express_endpoint + '/api/addcomment/' + $routeParams.event_id,
                    data: 'comment=' + Comments, 

                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    if (Comments) {
                        $scope.form.myForm2.$setPristine();
                        delete $scope.formData.comments
                        delete $scope.formData.text
                    }
                    $scope.showAcceptInvite = false;
                    $scope.changeSettingsAnon = false;
                    $scope.changeSettings = false;
                    $scope.newInvite = false;
                    $scope.getEvent();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.addEvent = function(id, ustatus, commentsForm) {
            if (ustatus == 'none') {
                Comments = $scope.formData.comments
            } else {
                Comments = $scope.formData.text
            }
            $http({
                    method: 'POST',
                    url: express_endpoint + '/adduserevent2/' + id + '/' + ustatus + '/' + $routeParams.invite_code,
                    data: 'username=' + $scope.invited.username + '&comment=' + Comments + '&rsvp=' + $scope.checkboxModel.rsvp + '&comment_alert=' + $scope.checkboxModel.comment_alert + '&displayname=' + $scope.invited.displayname + '&create_account=' + $scope.checkboxModel.create_account,

                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                }).success(function(data) {
                    if (Comments) {
                        $scope.form.myForm2.$setPristine();
                        delete $scope.formData.comments
                        delete $scope.formData.text
                    }
                    $scope.showAcceptInvite = false;
                    $scope.changeSettingsAnon = false;
                    $scope.changeSettings = false;
                    $scope.newInvite = false;
                    $scope.getEventInvite();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };


        $rootScope.createEvent = function(ffile,title,event_location,event_date,event_time) {
        console.log(ffile)
        // $scope.uploader.queue.upload() 
         console.log("saddddd")
         
            $scope.submitted = true;
            //if ($scope.formData.text.length < 1) {
            if (title < 1) {
                $scope.noEventTitle = true;
            } else {
                $http({
                        method: 'POST',
                        url: express_endpoint + '/api/new_event',
                        data: 'text=' + title + '&event_start=' + event_date + '&event_time=' + event_time + '&event_location=' + event_location + '&image=' + ffile,

                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'x-access-token': $window.localStorage.getItem('token')
                        }
                    }).success(function(data) {
                        $scope.getEventList();

                        $scope.submitted = false;
                        delete $scope.formData.text
                        delete $scope.formData.event_location
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }
        };

        $scope.editEventSave = function() {
            $http({
                    method: 'POST',
                    url: express_endpoint + '/api/eventsave/' + $scope.event_id,
                    data: 'event_title=' + $scope.event_data.event_title + '&event_start=' + $scope.event_data.event_date + '&event_location=' + $scope.event_data.event_location,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    $scope.eventEdit = 'NO';
                    $scope.getEventInvite();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.addCommentooold = function() {
                    console.log('asdfdsfsa');
            $http({
                    method: 'POST',
                    url: express_endpoint + '/api/addcomment/' + $routeParams.event_id,
                    data: 'text=' + $scope.formData.text,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                  //  $scope.date_now = data['date_now'];
                 //   $scope.getEvent();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

$scope.timers = [];
  $scope.counter2 = 1500;
  $scope.setthetime = function(ob_id, created_at) {
    var myDate = +new Date(created_at)
//    console.log(myDate)
 //   console.log(($scope.date_now - myDate)/ 1000)
    var start_cnt = Math.round(($scope.date_now - myDate)/ 1000)
    $scope.timers.push({invite_code: ob_id, strtime: start_cnt}) ;
  };

        $scope.sendSMS = function() {
            $http({
                    method: 'POST',
                    url: express_endpoint + '/api/sendsms/' + $routeParams.event_id,
                    data: 'text=' + $scope.formData.text + '&phone=' + $scope.formData.email + '&message=' + $scope.formData.message,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    $scope.invite_code1 = data["invites"][0]["invite_code"]
                  //  $scope.timers = []; 
                 //   $scope.timers.push({strtime: 1000, name : data["invites"][0]["invite_code"], date1: data["invites"][0]["created_at"]});
                    $scope.counter2++;
                  //  $scope.strtime = 1500;
                    //$scope.invited_phone = data["invites"][0]["invited_phone"]
                    delete $scope.formData.text
                    delete $scope.formData.email
                    $scope.getInvites();
                    console.log($scope.timers[0]);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.addInvite = function() {
            $http({
                    method: 'POST',
                    url: express_endpoint + '/api/addinvite/' + $routeParams.event_id,
                    data: 'text=' + $scope.formData.text + '&email=' + $scope.formData.email,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    delete $scope.formData.text
                    delete $scope.formData.email
                    $scope.getInvites();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.joinEvent = function(ustatus) {
            $http({
                    method: 'get',
                    url: express_endpoint + '/api/join_event/' + $routeParams.event_id + '/' + ustatus ,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
            console.log(data);
            console.log('asdfads');
                   $scope.getEvent();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.getSMS = function() {
            $http({
                    method: 'GET',
                    url: express_endpoint + '/smsdata?ToCountry',
                    //  data: 'text=' + $scope.formData.text + '&email=' + $scope.formData.email,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data) {
                    console.log("wowowowowo")
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.loginEvent = function() {
           console.log( $scope.fields.username) 
         console.log($scope.fields.password)
            $scope.submitted = true;
            if ($scope.fields.password.length < 1) {
            console.log("sadfasfdasfdsaf")
                $scope.noPassword = true;
            } else {
                $http({
                    method: 'POST',
                    url: express_endpoint + '/authenticate',
                    //data: 'name=' + $scope.user.username + '&password=' + $scope.user.password,
                    data: 'name=' + $scope.fields.username + '&password=' + $scope.fields.password,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data) {
                    if ($rootScope.reg_message_success) {
                        $rootScope.reg_message_success = null;
                    }
                    if (data.success == true) {
                        $window.localStorage.setItem('token', data.token);

               //         $rootScope = $rootScope.$new(true);
                        $rootScope.isUserLoggedIn = true;
                       console.log("woeododododo")
                    $scope.getEvent();
                       
/*
                        if (data.user_displayname) {
                            $location.url('/event_list');
                        } else {
                            $location.url('/user');
                        }
*/
                    } else {
                        $scope.login_message = data.message
                    }

                });
            }
        }
    });
