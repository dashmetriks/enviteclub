angular.module('envite.user', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'user/login.html',
            controller: 'userController'
        })
        .when('/register', {
            templateUrl: 'user/register.html',
            controller: 'userController'
        })
        .when('/password_reset', {
            templateUrl: 'user/password_reset.html',
            controller: 'userController'
        })
        .when('/reset_password/:reset_code', {
            templateUrl: 'user/reset_password.html',
            controller: 'userController'
        })
        .when('/user', {
            templateUrl: 'user/user_account.html',
            controller: 'userController'
        })
}])
.controller('userController', ['$scope', '$http', '$window', '$location', '$routeParams', '$rootScope',
    function($scope, $http, $window, $location, $routeParams, $rootScope) {
        $scope.form = {};
        var that = this;


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
   
        $scope.check_user = function() {
            if ($window.localStorage.getItem('token') == null) {
                $rootScope.showLoginlink = true;
            } else if ($window.localStorage.getItem('token').length < 10) {
                $rootScope.showLoginlink = true;
            } else {
                $rootScope.isUserLoggedIn = true;
                $scope.checkLogin();
            }
        } 

        $scope.loginForm = function() {
            $rootScope.showLoginlink = false;
        }

        $scope.password_change = function() {
            $scope.changePassword = $scope.changePassword === true ? false : true;
        }

        $scope.phone_confirm = function() {
            $scope.confirmPhone = $scope.confirmPhone === true ? false : true;
        }

        $scope.reset_password = function() {
            $scope.submitted = true;
            if ($scope.fields.password.length < 1) {
                $scope.noPassword = true;
            } else {
                $http({
                    method: 'POST',
                    url: express_endpoint + '/resetpassword/' + $routeParams.reset_code,
                    data: '&password=' + $scope.fields.password,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                }).success(function(data) {
                    $scope.changePassword = $scope.changePassword === true ? false : true;
                    $rootScope.reg_message_success = "Password has been changed."
                    if (data.success == true) {
                        $rootScope.login_message = "Password has been reset.  Please login"
                         $location.url('/login');
                        //  $rootScope.reg_message_success = "Thanks for registering. Please confirm your Display Name"
                        //   $scope.login();
                    }
                });
            }
        }
        $scope.user = {confirmphone: '', last: 'visitor'};

        $scope.save_phone_confirmation = function() {
            console.log($scope.user.confirmphone)
            $scope.submitted = true;
            if ($scope.user.confirmphone.length < 1) {
                $scope.noPassword = true;
            } else {
                $http({
                    method: 'POST',
                    url: express_endpoint + '/api/confirmphone',
                    data: '&confirmphone=' + $scope.user.confirmphone,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    $scope.confirmPhone = $scope.confirmPhone === true ? false : true;
                    $rootScope.reg_message_success = data.message 
                   // $rootScope.reg_message_success = "Phone Number has been confirmed."
                    $scope.checkLogin();
                    if (data.success == true) {
                        //  $rootScope.reg_message_success = "Thanks for registering. Please confirm your Display Name"
                        //   $scope.login();
                    }
                });
            }
        }
        $scope.save_password = function() {
            $scope.submitted = true;
            if ($scope.fields.password.length < 1) {
                $scope.noPassword = true;
            } else {
                $http({
                    method: 'POST',
                    url: express_endpoint + '/api/passwordsave',
                    data: '&password=' + $scope.fields.password,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    $scope.changePassword = $scope.changePassword === true ? false : true;
                    $rootScope.reg_message_success = "Password has been changed."
                    if (data.success == true) {
                        //  $rootScope.reg_message_success = "Thanks for registering. Please confirm your Display Name"
                        //   $scope.login();
                    }
                });
            }
        }
        $scope.register = function() {
            $scope.submitted = true;
            if ($scope.fields.password.length < 1) {
                $scope.noPassword = true;
            } else {
                $http({
                    method: 'POST',
                    url: express_endpoint + '/register',
                    data: 'name=' + $scope.user.username + '&password=' + $scope.fields.password + '&phone=' + $scope.user.phone,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data) {
                    //if (data.message == "User already exists.") {
                    if (data.success == false) {
                        $scope.reg_message = data.message 
                    }
                    if (data.success == true) {
                     //   $rootScope = $rootScope.$new(true);
                        $rootScope.reg_message_success = data.message 
                        $scope.login();
                    }
                });
            }
        }

        $scope.checkReset = function() {
            $http({
                    method: 'GET',
                    url: express_endpoint + '/resetcheck/' +  $routeParams.reset_code,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).success(function(data) {
                   if (data.success == false){
                        $rootScope.pwr_message = data.message 
                        $location.url('/password_reset');
                   }else{
                        $scope.reset_message = data.message 
                   }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }

        $scope.checkLogin = function() {
            $http({
                    method: 'GET',
                    url: express_endpoint + '/api/userget/',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                  if (data.message == "Failed to authenticate token." ){
                    $scope.logOut();
                  }else{
                    if (data['user'][0]['username']) {
                        $scope.username = data['user'][0].username
                        $scope.phone = data['user'][0].phone
                        $scope.phone_confirmed = data['user'][0].phone_confirmed
                        if (data['user'][0].displayname) {
                            $scope.displayname = data['user'][0].displayname;
                        } else {
                            $scope.displayname = data['user'][0].username.split('@')[0];
                        }
                        $scope.showLoginToInvite = false;
                    } else {
                        $scope.showLoginToInvite = true;
                    }
                    }
                })
                .error(function(data) {
                    $scope.showLoginToInvite = true;
                    console.log('Error: ' + data);
                });
        }

        $scope.password_reset = function() {
            $http({
                    method: 'POST',
                    url: express_endpoint + '/password_reset/',
                    data: 'username=' + $scope.user.username, 
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data) {
                        $scope.pwr_message = data.message 
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $scope.userSave = function() {
           if ($scope.phone_confirmed == "true"){
            $http({
                    method: 'POST',
                    url: express_endpoint + '/api/usersave/',
                    data: 'username=' + $scope.username + '&displayname=' + $scope.displayname + '&phone=' + $scope.phone ,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-access-token': $window.localStorage.getItem('token')
                    }
                }).success(function(data) {
                    if ($rootScope.reg_message_success) {
                        $rootScope.reg_message_success = null;
                    }
                    $location.url('/my_group_sms');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
           }else{
              $rootScope.reg_message_success = "Please confirm phone"
           }
        };

        $scope.login = function() {
            $scope.submitted = true;
            if ($scope.fields.password.length < 1) {
            console.log("sadfasfdasfdsaf")
                $scope.noPassword = true;
            } else {
                $http({
                    method: 'POST',
                    url: express_endpoint + '/authenticate',
                    //data: 'name=' + $scope.user.username + '&password=' + $scope.user.password,
                    data: 'name=' + $scope.user.username + '&password=' + $scope.fields.password,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data) {
                        console.log("dasfadsfadsfasfads");
                    if ($rootScope.reg_message_success) {
                        $rootScope.reg_message_success = null;
                    }
                    if (data.success == true) {
                        $window.localStorage.setItem('token', data.token);

               //         $rootScope = $rootScope.$new(true);
                        $rootScope.isUserLoggedIn = true;

                        if (data.phone_confirmed == 'true') {
                            $location.url('/my_group_sms');
                        } else {
                            $location.url('/user');
                        }
                    } else {
                        $scope.login_message = data.message
                    }

                });
            }
        }

    }
]);
