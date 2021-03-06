define([
    'global/base/BaseController',
    'user/model/user'
], function(BaseController, UserModel) {

    return function($scope, $injector, $state, $http2, $modal, gettextCatalog) {

        $injector.invoke(BaseController, this, {
            $scope: $scope
        });

        $scope.items = [];
        $scope.formData = {};

        $scope.fetchData = function() {

            $scope.isLoading = true;

            $http2.post('setting/fetch_blocked_users').success($scope.fetchDataSuccess).error($scope.fetchDataError).
            finally(function() {

                $scope.isLoading = false;
            });
        };

        $scope.fetchDataSuccess = function(data) {

            if (data.error_code) {
                console.warn('fetchDataSuccess', arguments);
                $modal.alert(data.error_message || gettextCatalog.getString('Can not load data from server'));
                return $scope.goBack();
            }

            $scope.items = $scope.mapItems(data);
            $scope.dataReady = true;
        };

        $scope.fetchDataError = function() {

            console.warn('fetchDataError', arguments);
            $modal.alert(gettextCatalog.getString('Can not load data from server'));
            $scope.goBack();
        };

        $scope.mapItems = function(data) {

            return (data || []).map(function(item) {
                return $.extend({}, UserModel, item);
            });
        };

        $scope.getUnblockUserIds = function() {

            var ids = [];

            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].selected) {
                    ids.push($scope.items[i].getId());
                }
            }

            return ids;
        };

        $scope.onSave = function() {

            if ($scope.isProcessing || !$scope.isValidData(true)) {
                return;
            }

            $scope.isProcessing = true;

            $scope.formData.sUnblockUserIds = $scope.getUnblockUserIds().join();

            $http2.post('setting/update_blocked_users', $scope.formData).success($scope.saveSuccess).error($scope.saveError).
            finally(function() {

                $scope.isProcessing = false;
            });
        };

        $scope.saveSuccess = function(data) {

            if (data.error_code) {
                console.warn('saveSuccess', arguments);
                return $modal.alert(data.error_message || gettextCatalog.getString('Can not load data from server'));
            }

            $modal.toast(data.message || gettextCatalog.getString('Privacy settings successfully updated.'));

            $scope.goBack();
        };

        $scope.saveError = function() {

            console.warn('saveError', arguments);
            $modal.alert(gettextCatalog.getString('Can not load data from server'));
        };

        $scope.isValidData = function(bAlert) {

            return true;
        };

        $scope.fetchData();
    };
});