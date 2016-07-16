angular.module('app', ['angularFileUpload'])

    .controller('AppController', ['$scope', '$http', 'FileUploader', function($scope, $http, FileUploader) {
   
        $scope.sendSMS = function(phone_number,text) {
            $http({
                    method: 'POST',
                    url: "http://localhost:8080" + '/sendsms',
                    data: 'phone_number=' + phone_number + '&text=' + text ,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                }).success(function(data) {
                   console.log(data);
                   console.log("woot");
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        var uploader = $scope.uploader = new FileUploader({
       //     url: 'upload.php'
              url: 'http://localhost:8080/csv_upload'
        });

        // FILTERS

        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            $scope.numbers = response;
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);
    }]);
