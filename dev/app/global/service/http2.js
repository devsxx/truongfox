define(function(){
    return function($rootScope, $http, $site, $q, $ionicLoading, $httpCache, gettextCatalog){
        
        this.token = localStorage.getItem('token');
        
        this.setToken = function(token){
            this.token = token;    
        };
        
        this.getToken = function(){
            return this.token;    
        };
        
        this.get =  function(api, data, settings){
            settings =  $.extend({
                cache: true,
                cacheName: 'default',
                token: this.getToken(),
            }, settings);
            
            if(settings.cache && settings.cacheName){
                settings.cache =  $httpCache.getCache(settings.cacheName);
            };
            
            var sendData = typeof data == 'function'? data(): data;
            var sendUrl = $site.getApiUrl(typeof api == 'function'?api():api, sendData || {}); 
            
            return $http.get(sendUrl, settings);
                
        };
        
        this.post  =  function(api, data, settings){
            settings =  $.extend({
                cache: false,
                token: this.getToken(),
            }, settings);
            
            var sendData = typeof data == 'function'? data(): data;
            var sendUrl = $site.getApiUrl(typeof api == 'function'?api():api); 
            
            // do not need to set token
            // sendData.token =  this.getToken();
            
            return $http.post(sendUrl, sendData, settings);
        };
        
        this.defaultErrorHandler  = function(){
            $modal.alert(gettextCatalog.getString('can not get data from server'));
        };
        
        this.upload = function(api, path, params, type, fileKey) {

            var uploadUrl =  $site.getApiUrl(typeof api == 'function'?api():api);
            var deffered = $q.defer();
            var ft = new FileTransfer();
            var options = new FileUploadOptions();
            var file_name = this.getFileName(path, type);
            var percent = 0;

            $.extend(params, {
                token: window.localStorage.getItem('token'),
                sTitle: params.sTitle || file_name
            });

            $.extend(options, {
                fileKey: fileKey || ('video' == type ? 'video' : 'image'),
                fileName: file_name,
                mimeType: this.getMimetype(type),
                chunkedMode: false,
                params: params
            });

            var success = function(result) {
                $ionicLoading.hide();
                var data = $.parseJSON(result.response);
                deffered.resolve(data);
            };

            var error = function(error) {
                $ionicLoading.hide();
                deffered.reject(error);
            };

            $rootScope.cancelUpload = function() {
                ft.abort();
            };

            ft.onprogress = function(progressEvent) {
                if (progressEvent.lengthComputable) {
                    percent = (progressEvent.loaded * 100) / progressEvent.total;
                    $ionicLoading.show({
                        template: '<div class="loading-percent padding-bottom">' + sprintf(gettextCatalog.getString('Uploading %s%%, please wait ...'), parseInt(percent, 10)) + '</div><div class="loading-cancel button button-small button-outline padding-left padding-right" ng-click="cancelUpload()">' + gettextCatalog.getString('Cancel') + '</div>'
                    });
                }
            };

            $ionicLoading.show({
                template: '<div class="loading-percent padding-bottom">' + sprintf(gettextCatalog.getString('Uploading %s%%, please wait ...'), 0) + '</div><div class="loading-cancel button button-small button-outline padding-left padding-right" ng-click="cancelUpload()">' + gettextCatalog.getString('Cancel') + '</div>'
            });
            console.log('options', options);
            
            ft.upload(path, encodeURI(uploadUrl), success, error, options);

            return deffered.promise;
        };

        this.getFileName = function(path, type) {

            var name = '';

            if ('video' == type) {
                if (ionic.Platform.isAndroid()) {
                    name = path.match(/\/([^\/]+)$/)[1] + '.mp4';
                } else {
                    name = path.split('/').pop();
                }
            } else {
                if (path.match(/[^\/]+.jpg$/g)) {
                    name = path.match(/[^\/]+.jpg$/ig)[0];
                } else if (path.match(/id=(\w|\-)+/)) {
                    name = path.match(/id=(\w|\-)+/)[0].replace('id=', '') + '.jpg';
                } else if (ionic.Platform.isAndroid()) {
                    name = path.match(/\/([^\/]+)$/)[1] + '.jpg';
                }
            }

            return name;
        };

        this.getMimetype = function(type) {

            if ('video' == type) {
                return (ionic.Platform.isAndroid()) ? 'video/mp4' : 'video/quicktime';
            } else {
                return 'image/jpeg';
            }
        };
        
    };
});
