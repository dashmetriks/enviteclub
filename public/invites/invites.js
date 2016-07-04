angular.module('envite.invite', [
    'ngRoute',
    'angularFileUpload',
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

.controller('invitesController', ['$scope', '$http', '$window', '$location', '$routeParams', '$rootScope', 'FileUploader',
    function($scope, $http, $window, $location, $routeParams, $rootScope , FileUploader) {
        var uploader = $scope.uploader = new FileUploader({
          //  url: 'upload.php'
            url: 'http://localhost:8080/image_upload'
        });

        $scope.form = {};
        $scope.timers = [];
        $scope.counter2 = 0
        var that = this;

        var in10Days = new Date();
        in10Days.setDate(in10Days.getDate() + 10);

        this.dates = {
            date1: new Date('2015-03-01T00:00:00Z'),
            date2: new Date('2015-03-01T12:30:00Z'),
            date3: new Date(),
            date4: new Date(),
            date5: in10Days,
            date6: new Date(),
            date7: new Date(),
            date8: new Date(),
            date9: null,
            date10: new Date('2015-03-01T09:00:00Z'),
            date11: new Date('2015-03-01T10:00:00Z')
        };

        this.open = {
            date1: false,
            date2: false,
            date3: false,
            date4: false,
            date5: false,
            date6: false,
            date7: false,
            date8: false,
            date9: false,
            date10: false,
            date11: false
        };

        // Disable today selection
        this.disabled = function(date, mode) {
            return (mode === 'day' && (new Date().toDateString() == date.toDateString()));
        };

        this.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };

        this.timeOptions = {
            readonlyInput: false,
            showMeridian: false
        };

        this.dateModeOptions = {
            minMode: 'year',
            maxMode: 'year'
        };

        this.openCalendar = function(e, date) {
            that.open[date] = true;
        };

        // watch date4 and date5 to calculate difference
        var unwatch = $scope.$watch(function() {
            return that.dates;
        }, function() {
            if (that.dates.date4 && that.dates.date5) {
                var diff = that.dates.date4.getTime() - that.dates.date5.getTime();
                that.dayRange = Math.round(Math.abs(diff / (1000 * 60 * 60 * 24)))
            } else {
                that.dayRange = 'n/a';
            }
        }, true);

        $scope.$on('$destroy', function() {
            unwatch();
        });

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
            $location.url('/login');
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
                    $scope.events = data['my_events'];
                    $scope.events_invite = data['event_invites'][0];
                    $rootScope.isUserLoggedIn = true;

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
            $http({
                    method: 'GET',
                    url: express_endpoint + '/api/geteventdata/' + $routeParams.event_id,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
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


        $scope.createEvent = function() {
            $scope.submitted = true;
            if ($scope.formData.text.length < 1) {
                $scope.noEventTitle = true;
            } else {
                $http({
                        method: 'POST',
                        url: express_endpoint + '/api/new_event',
                        data: 'text=' + $scope.formData.text + '&event_start=' + $scope.ctrl.dates.date3 + '&event_location=' + $scope.formData.event_location,
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

        $scope.addComment = function() {
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
    }
]);
