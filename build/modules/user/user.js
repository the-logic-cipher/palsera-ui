angular.module('app.users', ['ui.router'])

.config(['$stateProvider', 'AccessLevel',
    function ($stateProvider, AccessLevel) {
        $stateProvider
            .state('user', {
                abstract: true,
                url: '/user',
                templateUrl: 'components/layouts/default.html'
            })
            .state('user.list', {
                url: '/all',
                templateUrl: 'modules/user/list.html',
                role: {
                    access: AccessLevel.admin
                },
            })

            .state('user.create', {
                url: '/create',
                controller: 'UserCreationController',
                templateUrl: 'modules/user/create.html',
                role: {
                    access: AccessLevel.admin
                },
            })
    }
])

.controller('userCtrl', ['$scope', '$state', 'API', 'Auth', 'toaster',
    function ($scope, $state, API, Auth, toaster) {
        $scope.sortType     = 'email'; // set the default sort type
        $scope.sortReverse  = false;  // set the default sort order
        $scope.search   = '';     // set the default search/filter term
        API.all('users').getList().then(function(response){
            $scope.users = response;
        }, function(error){
            $scope.error = error;
        });
    }
])

.controller('UserCreationController', ['$scope', '$state', 'API', '$stateParams', 'toaster',
    function ($scope, $state, API, $stateParams, toaster) {
        $scope.userslist = {};
        $scope.userData = {
            password: ''
        };

        $scope.check = function(){
            if($scope.userData.password === '' && $scope.confirmpassword === ''){
                $scope.passwordsAlert = {
                    type: 'danger',
                    message: 'Both Fields are empty'
                }

            } else if($scope.userData.password === undefined || $scope.confirmpassword === undefined){
                $scope.passwordsAlert = {
                    type: 'danger',
                    message: 'Please Fill Password Field First'
                }
            } else {
                if ($scope.confirmpassword !== $scope.userData.password){
                    $scope.passwordsAlert = {
                        type: 'danger',
                        message: 'passwords not equal'
                    }
                } else {
                    $scope.passwordsAlert = {
                        type: 'success',
                        message: 'passwords are now equal'
                    }
                }
            }
        };
        $scope.create = function() {
            API.all('user').post($scope.userData)
            .then(function (response) {
                var alert = {
                    type: 'success',
                    title: 'Success',
                    text: 'User Created Successfully'
                };
                toaster.pop(alert.type, alert.title, alert.text);
                $state.go('user.list');
            }, function(error){
                var alert = {
                    type: 'error',
                    title: 'Error Occurred, Please Try Again',
                    message: error.data.response.message
                };
                toaster.pop(alert.type, alert.title, alert.message);
            });
        }
    }
]);
